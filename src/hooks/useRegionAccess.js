import { useEffect, useRef, useState, useCallback } from "react";

// Normalize state names
const normalizeStateName = (value) => {
  if (!value) return null;
  const direct = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman & Nicobar",
    "Chandigarh",
    "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi",
    "Jammu & Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
  if (direct.includes(value)) return value;

  const map = {
    Bharat: "Bharat",
    AndamanAndNicobarIslands: "Andaman & Nicobar",
    DadraAndNagarHaveliAndDamanAndDiu: "Dadra & Nagar Haveli and Daman & Diu",
    JammuAndKashmir: "Jammu & Kashmir",
    Tamilnadu: "Tamil Nadu",
    WestBengal: "West Bengal",
  };
  if (map[value]) return map[value];

  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
};

// Merge all India polygons
const mergeAllIndiaPolygons = (features) => {
  const paths = [];
  features.forEach((f) => {
    if (!f.geometry) return;
    const geom = f.geometry;
    if (geom.type === "Polygon") {
      geom.coordinates.forEach((ring) =>
        paths.push(ring.map((c) => ({ lat: c[1], lng: c[0] })))
      );
    }
    if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly) =>
        poly.forEach((ring) =>
          paths.push(ring.map((c) => ({ lat: c[1], lng: c[0] })))
        )
      );
    }
  });
  return paths;
};

export default function useRegionAccess(map, userId) {
  const [allowedStateNames, setAllowedStateNames] = useState([]);
  const [ready, setReady] = useState(false);
  const polygonsRef = useRef([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAllIndiaUser, setIsAllIndiaUser] = useState(false);

  const fitMapToAllowedRegions = useCallback(() => {
    if (!map || !window.google?.maps) return;
    const bounds = new window.google.maps.LatLngBounds();

    if (!polygonsRef.current.length) {
      bounds.extend({ lat: 6.75, lng: 68.11 });
      bounds.extend({ lat: 35.67, lng: 97.4 });
    } else {
      polygonsRef.current.forEach((poly) =>
        poly
          .getPath()
          .getArray()
          .forEach((latLng) => bounds.extend(latLng))
      );
    }

    map.fitBounds(bounds);
    const listener = window.google.maps.event.addListenerOnce(
      map,
      "bounds_changed",
      () => {
        if (map.getZoom() > 7) map.setZoom(7);
      }
    );
    setTimeout(() => window.google.maps.event.removeListener(listener), 1000);
  }, [map]);

  // Load user data
  useEffect(() => {
    try {
      const current = JSON.parse(localStorage.getItem("currentUser"));
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");

      let userRecord = current;
      if (userId && current?.username !== userId) {
        userRecord = allUsers.find((u) => u.username === userId);
      }

      if (!userRecord) {
        setAllowedStateNames([]);
        setReady(true);
        return;
      }

      const adminCheck =
        userRecord.role?.toLowerCase() === "admin" || userRecord.isAdmin;
      setIsAdmin(adminCheck);

      const regions = Array.isArray(userRecord.regions)
        ? userRecord.regions
        : [];
      const allIndiaCheck = regions.includes("Bharat") && !adminCheck;
      setIsAllIndiaUser(allIndiaCheck);

      if (adminCheck || allIndiaCheck) {
        setAllowedStateNames([]); // empty = show full India
      } else {
        setAllowedStateNames(regions.map(normalizeStateName).filter(Boolean));
      }
    } catch (err) {
      console.error(err);
      setAllowedStateNames([]);
    } finally {
      setReady(true);
    }
  }, [userId]);

  // Draw polygons
  useEffect(() => {
    if (!map) return;

    async function draw() {
      try {
        const res = await fetch("/india.json");
        const data = await res.json();

        // Clear old polygons
        polygonsRef.current.forEach((p) => p.setMap(null));
        polygonsRef.current = [];

        if (isAdmin) {
          // Admin: draw all separately
          data.features.forEach((f) => drawFeature(f, 0.3));
        } else if (isAllIndiaUser) {
          // All India user: merge polygons
          const mergedPaths = mergeAllIndiaPolygons(data.features);
          mergedPaths.forEach((paths) => drawPolygon(paths, 0.1));
        } else {
          // Normal user: draw only allowed states
          const filtered = data.features.filter((f) =>
            allowedStateNames.includes(f.properties?.st_nm)
          );
          filtered.forEach((f) => drawFeature(f, 0.3));
        }

        fitMapToAllowedRegions();

        function drawFeature(feature, fillOpacity) {
          const geom = feature.geometry;
          if (!geom) return;
          const pathsArray =
            geom.type === "Polygon"
              ? geom.coordinates.map((ring) =>
                  ring.map((c) => ({ lat: c[1], lng: c[0] }))
                )
              : geom.type === "MultiPolygon"
              ? geom.coordinates.flatMap((poly) =>
                  poly.map((ring) =>
                    ring.map((c) => ({ lat: c[1], lng: c[0] }))
                  )
                )
              : [];
          pathsArray.forEach((paths) => drawPolygon(paths, fillOpacity));
        }

        function drawPolygon(paths, fillOpacity) {
          const poly = new window.google.maps.Polygon({
            paths,
            strokeColor: "blue",
            strokeOpacity: 0.9,
            strokeWeight: 3,
            fillColor: "lightblue",
            fillOpacity,
            map,
            zIndex: 2,
          });
          polygonsRef.current.push(poly);
        }
      } catch (err) {
        console.error(err);
      }
    }

    draw();

    return () => {
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, allowedStateNames, isAdmin, isAllIndiaUser, fitMapToAllowedRegions]);

  return { ready, allowedStateNames, fitMapToAllowedRegions };
}
