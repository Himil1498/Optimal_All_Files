import { useState, forwardRef, useImperativeHandle } from "react";
import { Button, Box } from "@mui/material";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const COLORS = ["red", "orange", "purple", "cyan", "yellow"];

const ImportMarkers = forwardRef(({ map, addMarkerToTable }, ref) => {
  const [importedLayers, setImportedLayers] = useState([]);

  // Expose clearMarkers to parent
  useImperativeHandle(ref, () => ({
    clearMarkers: () => {
      importedLayers.forEach((layer) =>
        layer.markers.forEach((m) => m.setMap(null))
      );
      setImportedLayers([]);
      // Clear imported markers from localStorage
      localStorage.removeItem("importedMarkers");
      addMarkerToTable(); // update table
    }
  }));

  // Attach InfoWindow to each marker
  const attachInfoWindowToMarker = (marker, data) => {
    const infoWindow = new google.maps.InfoWindow({
      content: `
      <div style="padding:10px;font-family:Arial; min-width:180px; position: relative;">
        <button id="closeInfoBtn-${
          data.id
        }" style="position:absolute; top:2px; right:2px;">✕</button>
        <h3>${data.name || "Unnamed"}</h3>
        <strong>Latitude:</strong> ${data.position.lat}<br>
        <strong>Longitude:</strong> ${data.position.lng}<br>
        <strong>Type:</strong> Imported
      </div>
    `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);

      // Wait for the DOM to be ready
      google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        const closeBtn = document.getElementById(`closeInfoBtn-${data.id}`);
        if (closeBtn) {
          closeBtn.onclick = () => infoWindow.close();
        }
      });
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !map || !window.google) return;

    const ext = file.name.split(".").pop().toLowerCase();
    let markers = [];

    if (ext === "kml") {
      const text = await file.text();
      const xml = new DOMParser().parseFromString(text, "application/xml");
      const placemarks = Array.from(xml.getElementsByTagName("Placemark"));
      markers = placemarks
        .map((pm, i) => {
          const name =
            pm.getElementsByTagName("name")[0]?.textContent || "Unnamed";
          const coordText = pm
            .getElementsByTagName("coordinates")[0]
            ?.textContent?.trim();
          if (!coordText) return null;
          const [lng, lat] = coordText.split(",").map(Number);
          return {
            name,
            position: { lat, lng },
            id: `import-${Date.now()}-${i}`,
            type: "Imported"
          };
        })
        .filter(Boolean);
    } else if (ext === "csv") {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      markers = result.data.map((row, i) => ({
        name: row.name || "Unnamed",
        position: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
        id: `import-${Date.now()}-${i}`,
        type: "Imported"
      }));
    } else if (ext === "xlsx") {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );
      markers = sheet.map((row, i) => ({
        name: row.name || "Unnamed",
        position: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
        id: `import-${Date.now()}-${i}`,
        type: "Imported"
      }));
    }

    if (!markers.length) return;

    const color = COLORS[importedLayers.length % COLORS.length];

    const markerObjects = markers.map((m) => {
      const marker = new google.maps.Marker({
        position: m.position,
        map,
        title: m.name,
        icon: {
          url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
        }
      });
      attachInfoWindowToMarker(marker, m);
      m.markerObject = marker;
      return marker;
    });

    setImportedLayers((prev) => [
      ...prev,
      { markers: markerObjects, color, fileName: file.name, data: markers }
    ]);

    // Save imported markers in localStorage
    const savedImported = JSON.parse(
      localStorage.getItem("importedMarkers") || "[]"
    );
    localStorage.setItem(
      "importedMarkers",
      JSON.stringify([...savedImported, ...markers])
    );

    // Add markers to table
    addMarkerToTable();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="contained" component="label">
        Import File
        <input
          hidden
          type="file"
          accept=".kml,.csv,.xlsx"
          onChange={handleFileUpload}
        />
      </Button>
    </Box>
  );
});

export default ImportMarkers;
