import { useState } from "react";
import { Button } from "@mui/material";
import JSZip from "jszip";

// Marker icons
const POP_ICON = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
const SUB_POP_ICON = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

export default function ImportKmlKmzButton({
  map,
  markerType = "POP", // "POP" or "Sub POP"
  onMarkersAdded,
  setSnackbarMessage,
  setSnackbarOpen
}) {
  const [importedMarkers, setImportedMarkers] = useState([]);

  const handleFileImport = async (files) => {
    if (!files?.length) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      let text = e.target.result;

      // KMZ support
      if (file.name.toLowerCase().endsWith(".kmz")) {
        try {
          const zip = await JSZip.loadAsync(text);
          const kmlFile = Object.keys(zip.files).find((name) =>
            name.toLowerCase().endsWith(".kml")
          );
          if (!kmlFile) throw new Error("No KML found in KMZ");
          text = await zip.files[kmlFile].async("string");
        } catch (err) {
          console.error("Error reading KMZ:", err);
          setSnackbarMessage("Failed to read KMZ file");
          setSnackbarOpen(true);
          return;
        }
      }

      if (!window.google || !map) return;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml");
      const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));

      if (!placemarks.length) {
        setSnackbarMessage("No placemarks found in KML/KMZ");
        setSnackbarOpen(true);
        return;
      }

      if (!window.importedInfoWindow)
        window.importedInfoWindow = new google.maps.InfoWindow();

      const icon = markerType === "POP" ? POP_ICON : SUB_POP_ICON;
      const newMarkers = placemarks
        .map((pm) => {
          const coordText = pm
            .getElementsByTagName("coordinates")[0]
            ?.textContent?.trim();
          if (!coordText) return null;

          const [lngStr, latStr] = coordText.split(",").map(parseFloat);
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!lat || !lng) return null;

          const name =
            pm.getElementsByTagName("name")[0]?.textContent || "Unnamed";

          const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: name,
            icon
          });

          marker.addListener("click", () => {
            window.importedInfoWindow.setContent(
              `<div style="padding:10px;font-family:Arial;"><h3>${name}</h3></div>`
            );
            window.importedInfoWindow.open(map, marker);
          });

          return {
            marker,
            data: { position: { lat, lng }, type: markerType, name }
          };
        })
        .filter(Boolean);

      setImportedMarkers((prev) => [...prev, ...newMarkers]);
      onMarkersAdded?.(newMarkers);

      setSnackbarMessage("Data imported successfully!");
      setSnackbarOpen(true);
    };

    if (file.name.toLowerCase().endsWith(".kmz"))
      reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  return (
    <Button
      variant="contained"
      component="label"
      sx={{ backgroundColor: markerType === "POP" ? "#2196f3" : "#4caf50" }}
    >
      Import {markerType} Data
      <input
        type="file"
        hidden
        accept=".kml,.kmz"
        onChange={(e) => handleFileImport(e.target.files)}
      />
    </Button>
  );
}
