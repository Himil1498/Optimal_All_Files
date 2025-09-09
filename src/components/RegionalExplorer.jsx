import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function RegionExplorer() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [indiaPolygons, setIndiaPolygons] = useState([]);
  const [statePolygons, setStatePolygons] = useState([]);
  const [districtPolygons, setDistrictPolygons] = useState([]);
  const [subdistrictPolygons, setSubdistrictPolygons] = useState([]);
  const [districtHighlight, setDistrictHighlight] = useState([]);
  const [subdistrictHighlight, setSubdistrictHighlight] = useState([]);

  const [boundaryVisible, setBoundaryVisible] = useState(false);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState("");

  const COLORS = {
    STATE: "#3cba54", // Green
    DISTRICT: "#4287f5", // Blue
    SUBDISTRICT: "#f4c20d" // Yellow
  };

  const convertCoords = (coords) => {
    if (coords[0][0].length === 2 && typeof coords[0][0][0] === "number")
      return [coords[0].map((c) => ({ lat: c[1], lng: c[0] }))];
    return coords.map((poly) => poly[0].map((c) => ({ lat: c[1], lng: c[0] })));
  };

  const smoothFitBounds = (bounds) => {
    map && map.fitBounds(bounds, 50);
  };

  const resetToIndiaView = () => {
    map && map.setCenter({ lat: 22.5, lng: 78.9 });
    map && map.setZoom(5);
  };

  const clearAllBoundaries = () => {
    indiaPolygons.forEach((p) => p.setMap(null));
    statePolygons.forEach((p) => p.setMap(null));
    districtPolygons.forEach(({ poly }) => poly.setMap(null));
    subdistrictPolygons.forEach(({ poly }) => poly.setMap(null));
    setStatePolygons([]);
    setDistrictPolygons([]);
    setSubdistrictPolygons([]);
    setDistrictHighlight([]);
    setSubdistrictHighlight([]);
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedSubdistrict("");
    setDistricts([]);
    setSubdistricts([]);
    setBoundaryVisible(false);
    resetToIndiaView();
  };

  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 22.5, lng: 78.9 },
      zoom: 5,
      mapTypeId: window.google.maps.MapTypeId.HYBRID
    });

    setMap(initMap);

    fetch("/india.json")
      .then((res) => res.json())
      .then((data) => {
        const stateNames = data.features
          .map((f) => f.properties.st_nm)
          .sort((a, b) => a.localeCompare(b));
        setStates(stateNames);

        const polys = [];
        data.features.forEach((f) => {
          const pathsArray = convertCoords(f.geometry.coordinates);
          pathsArray.forEach((paths) => {
            const poly = new window.google.maps.Polygon({
              paths,
              strokeColor: "teal",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "teal",
              fillOpacity: 0.1,
              map: null
            });
            polys.push(poly);
          });
        });
        setIndiaPolygons(polys);
      });
  }, [mapRef, map]);

  useEffect(() => {
    if (!map) return;

    if (!selectedState) {
      statePolygons.forEach((p) => p.setMap(null));
      districtPolygons.forEach(({ poly }) => poly.setMap(null));
      subdistrictPolygons.forEach(({ poly }) => poly.setMap(null));
      setStatePolygons([]);
      setDistrictPolygons([]);
      setSubdistrictPolygons([]);
      setDistrictHighlight([]);
      setSubdistrictHighlight([]);
      setDistricts([]);
      setSubdistricts([]);
      setSelectedDistrict("");
      setSelectedSubdistrict("");
      resetToIndiaView();
      return;
    }

    fetch("/india.json")
      .then((res) => res.json())
      .then((data) => {
        const feature = data.features.find(
          (f) => f.properties.st_nm === selectedState
        );
        if (!feature) return;

        statePolygons.forEach((p) => p.setMap(null));
        const pathsArray = convertCoords(feature.geometry.coordinates);
        const bounds = new window.google.maps.LatLngBounds();
        const polys = [];
        pathsArray.forEach((paths) => {
          const poly = new window.google.maps.Polygon({
            paths,
            strokeColor: COLORS.STATE,
            strokeWeight: 3,
            fillColor: COLORS.STATE,
            fillOpacity: 0.2,
            map
          });
          paths.forEach((p) => bounds.extend(p));
          polys.push(poly);
        });
        smoothFitBounds(bounds);
        setStatePolygons(polys);

        if (selectedState === "Gujarat") {
          fetch("/GUJARAT_DISTRICTS.geojson")
            .then((res) => res.json())
            .then((dData) => {
              const gujDistricts = dData.features.sort((a, b) =>
                (a.properties.dtname || a.properties.name).localeCompare(
                  b.properties.dtname || b.properties.name
                )
              );
              setDistricts(
                gujDistricts.map(
                  (d) => d.properties.dtname || d.properties.name || d.id
                )
              );

              const distPolys = [];
              gujDistricts.forEach((d) => {
                const pathsArray = convertCoords(d.geometry.coordinates);
                pathsArray.forEach((paths) => {
                  const poly = new window.google.maps.Polygon({
                    paths,
                    strokeColor: COLORS.DISTRICT,
                    strokeWeight: 2,
                    fillColor: COLORS.DISTRICT,
                    fillOpacity: 0.2,
                    map: null
                  });
                  distPolys.push({ name: d.properties.dtname, poly });
                });
              });
              setDistrictPolygons(distPolys);
            });

          fetch("/GUJARAT_SUBDISTRICTS.geojson")
            .then((res) => res.json())
            .then((subData) => {
              const sortedSub = subData.features.sort((a, b) =>
                a.properties.sdtname.localeCompare(b.properties.sdtname)
              );
              setSubdistricts(sortedSub.map((f) => f.properties.sdtname));

              const subPolys = [];
              sortedSub.forEach((f) => {
                const pathsArray = convertCoords(f.geometry.coordinates);
                pathsArray.forEach((paths) => {
                  const poly = new window.google.maps.Polygon({
                    paths,
                    strokeColor: COLORS.SUBDISTRICT,
                    strokeWeight: 1.5,
                    fillColor: COLORS.SUBDISTRICT,
                    fillOpacity: 0.2,
                    map: null
                  });
                  subPolys.push({ name: f.properties.sdtname, poly });
                });
              });
              setSubdistrictPolygons(subPolys);
            });
        }
      });
  }, [selectedState, map]);

  const highlightPolygon = (selected, polygons, setter) => {
    polygons.forEach(({ poly }) => poly.setMap(null));
    if (!selected) return;

    const match = polygons.filter((d) => d.name === selected);
    const highlightPolys = match.map((d) => {
      d.poly.setMap(map);
      d.poly.setOptions({ fillOpacity: 0.6, strokeWeight: 3 });
      return d.poly;
    });

    const bounds = new window.google.maps.LatLngBounds();
    highlightPolys.forEach((poly) =>
      poly.getPath().forEach((latlng) => bounds.extend(latlng))
    );
    smoothFitBounds(bounds);
    setter(highlightPolys);
  };

  useEffect(() => {
    highlightPolygon(selectedDistrict, districtPolygons, setDistrictHighlight);
  }, [selectedDistrict]);

  useEffect(() => {
    highlightPolygon(
      selectedSubdistrict,
      subdistrictPolygons,
      setSubdistrictHighlight
    );
  }, [selectedSubdistrict]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        background: "linear-gradient(135deg, #f6f9fc, #e9effd)",
        p: 2,
        pt: "1vh",
        boxSizing: "border-box",
        position: "fixed"
      }}
    >
      <Paper
        elevation={5}
        sx={{
          display: "flex",
          width: "100%",
          borderRadius: 3,
          p: 3,
          textAlign: "left",
          position: "relative"
        }}
      >
        {/* Sidebar Controls */}
        <Box sx={{ width: "300px", mr: 2 }}>
          <IconButton
            onClick={() => navigate("/dashboard")}
            sx={{
              mb: 2,
              transition: "all 0.2s ease-in-out", // smooth animation
              "&:hover": {
                transform: "scale(1.1)", // slightly bigger on hover
                backgroundColor: "#e0f0ff" // subtle background change
              },
              "&:active": {
                transform: "scale(0.95)" // slight press effect
              },
              "&:focus, &:focus-visible": {
                outline: "none",
                boxShadow: "none"
              }
            }}
            disableRipple
          >
            <ArrowBackIcon />
            <Typography sx={{ ml: 1 }}></Typography>
          </IconButton>

          <Typography variant="h6" gutterBottom>
            Controls
          </Typography>

          <Button
            variant="contained"
            color={boundaryVisible ? "error" : "success"}
            onClick={() => {
              indiaPolygons.forEach((p) =>
                p.setMap(boundaryVisible ? null : map)
              );
              setBoundaryVisible(!boundaryVisible);
            }}
            sx={{ mb: 1, width: "100%" }}
          >
            {boundaryVisible ? "Hide India Boundary" : "Show India Boundary"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={clearAllBoundaries}
            sx={{ mb: 2, width: "100%" }}
          >
            Close All Boundaries
          </Button>

          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>State</InputLabel>
            <Select
              value={selectedState}
              label="State"
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <MenuItem value="">
                <em>-- None --</em>
              </MenuItem>
              {states.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {districts.length > 0 && (
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel>District</InputLabel>
              <Select
                value={selectedDistrict}
                label="District"
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <MenuItem value="">
                  <em>-- None --</em>
                </MenuItem>
                {districts.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {subdistricts.length > 0 && (
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel>Subdistrict</InputLabel>
              <Select
                value={selectedSubdistrict}
                label="Subdistrict"
                onChange={(e) => setSelectedSubdistrict(e.target.value)}
              >
                <MenuItem value="">
                  <em>-- None --</em>
                </MenuItem>
                {subdistricts.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            height: "80vh",
            borderRadius: 2,
            position: "relative"
          }}
        >
          {/* Google Map */}
          <Box
            ref={mapRef}
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 2
            }}
          />

          {/* Floating Legend */}
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              top: 10,
              right: 60,
              bgcolor: "rgba(255,255,255,0.95)",
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              zIndex: 9999, // Ensure it's above the map canvas
              minWidth: 120
            }}
          >
            {/* <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Legend
            </Typography> */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box
                sx={{ width: 20, height: 20, bgcolor: COLORS.STATE, mr: 1 }}
              />
              <Typography variant="body2">State</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box
                sx={{ width: 20, height: 20, bgcolor: COLORS.DISTRICT, mr: 1 }}
              />
              <Typography variant="body2">District</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: COLORS.SUBDISTRICT,
                  mr: 1
                }}
              />
              <Typography variant="body2">Subdistrict</Typography>
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
