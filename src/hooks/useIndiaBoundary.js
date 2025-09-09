// import { useEffect, useState } from "react";

// /**
//  * Custom hook to load India boundary from GeoJSON
//  * and provide a function to check if a point is inside India
//  */
// export default function useIndiaBoundary(map) {
//   const [indiaPolygons, setIndiaPolygons] = useState([]);

//   // Load India GeoJSON once
//   useEffect(() => {
//     if (!map) return;

//     fetch("/india-boundary.geojson")
//       .then((res) => res.json())
//       .then((data) => {
//         const polygons = [];
//         data.features.forEach((feature) => {
//           const coords = feature.geometry.coordinates; // MultiPolygon
//           coords.forEach((polygonCoords) => {
//             const paths = polygonCoords.map((ring) =>
//               ring.map(([lng, lat]) => ({ lat, lng }))
//             );
//             const poly = new window.google.maps.Polygon({
//               paths,
//               strokeOpacity: 0,
//               fillOpacity: 0,
//               map: null // invisible
//             });
//             polygons.push(poly);
//           });
//         });
//         setIndiaPolygons(polygons);
//       });
//   }, [map]);

//   // Function to check if a point is inside India
//   const isInsideIndia = (latLng) => {
//     if (!indiaPolygons.length) return false;
//     return indiaPolygons.some((poly) =>
//       window.google.maps.geometry.poly.containsLocation(
//         new window.google.maps.LatLng(latLng.lat, latLng.lng),
//         poly
//       )
//     );
//   };

//   return { isInsideIndia };
// }

import { useEffect, useState } from "react";

/**
 * Custom hook to:
 * 1. Load India's boundary polygons from GeoJSON
 * 2. Draw the visible boundary on the map
 * 3. Provide a function to check if a given point is inside India
 * 4. Return LatLngBounds for zooming/fitting India
 */
export default function useIndiaBoundary(map, options = {}) {
  const [indiaPolygons, setIndiaPolygons] = useState([]);
  const [indiaBounds, setIndiaBounds] = useState(null);

  // Default styling for India's boundary
  const defaultOptions = {
    strokeColor: "#1976D2", // Blue border
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: "#64B5F6", // Light blue fill
    fillOpacity: 0.15,
  };

  // Merge custom options with default options
  const mergedOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    if (!map || !window.google) return;

    let createdPolygons = [];

    fetch("/india-boundary.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch India boundary GeoJSON");
        return res.json();
      })
      .then((data) => {
        const bounds = new window.google.maps.LatLngBounds();

        data.features.forEach((feature) => {
          const coords = feature.geometry.coordinates; // MultiPolygon

          coords.forEach((polygonCoords) => {
            // Convert GeoJSON -> Google Maps LatLng paths
            const paths = polygonCoords.map((ring) =>
              ring.map(([lng, lat]) => {
                const point = { lat, lng };
                bounds.extend(point);
                return point;
              })
            );

            // **Visible boundary polygon**
            const visiblePolygon = new window.google.maps.Polygon({
              paths,
              strokeColor: mergedOptions.strokeColor,
              strokeOpacity: mergedOptions.strokeOpacity,
              strokeWeight: mergedOptions.strokeWeight,
              fillColor: mergedOptions.fillColor,
              fillOpacity: mergedOptions.fillOpacity,
              map, // show boundary on map
            });

            // **Invisible polygon for hit-testing only**
            const invisiblePolygon = new window.google.maps.Polygon({
              paths,
              strokeOpacity: 0,
              fillOpacity: 0,
              map: null, // not rendered
            });

            createdPolygons.push({ visiblePolygon, invisiblePolygon });
          });
        });

        setIndiaPolygons(createdPolygons);
        setIndiaBounds(bounds);
      })
      .catch((err) => {
        console.error("Error loading India boundary GeoJSON:", err);
      });

    // Cleanup on unmount or map change
    return () => {
      createdPolygons.forEach(({ visiblePolygon }) =>
        visiblePolygon.setMap(null)
      );
    };
  }, [map]);

  /**
   * Check if a given point is inside India's boundary
   * @param {{lat: number, lng: number}} latLng
   * @returns {boolean}
   */
  const isInsideIndia = (latLng) => {
    if (!indiaPolygons.length || !window.google?.maps?.geometry?.poly)
      return false;

    return indiaPolygons.some(({ invisiblePolygon }) =>
      window.google.maps.geometry.poly.containsLocation(
        new window.google.maps.LatLng(latLng.lat, latLng.lng),
        invisiblePolygon
      )
    );
  };

  return { isInsideIndia, indiaBounds };
}
