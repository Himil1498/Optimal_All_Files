import { Box, Typography } from "@mui/material";
import MapSearchBox from "../../../Components/MapSearchBox";

export default function MapContainer({ map, mapRef, loaded, error }) {
  const handlePlaceSelect = (place) => {
    console.log("Selected place:", place);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      {loaded && map && (
        <MapSearchBox map={map} onPlaceSelect={handlePlaceSelect} />
      )}

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0
        }}
      />

      {!loaded && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
            zIndex: 10
          }}
        >
          <Typography variant="h6" color="text.secondary">
            🗺️ Loading Google Maps...
          </Typography>
        </Box>
      )}

      {error && (
        <Typography
          color="error"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "white",
            p: 2,
            borderRadius: 1,
            zIndex: 10,
            boxShadow: 2
          }}
        >
          ❌ {error}
        </Typography>
      )}
    </Box>
  );
}
