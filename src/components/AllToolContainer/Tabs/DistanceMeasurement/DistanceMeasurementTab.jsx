import { useEffect, useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";

import Header from "./Header";
import Controls from "./Controls";
import SegmentsTable from "./SegmentsTable";
import SummaryTable from "./SummaryTable";
import SaveMeasurementDialog from "./SaveMeasurementDialog";
import ViewDialog from "./ViewDialog";
import useIndiaBoundary from "../../../../hooks/useIndiaBoundary";

export default function DistanceMeasurementTab({ map }) {
  const [segments, setSegments] = useState([]);
  const [polyline, setPolyline] = useState(null);
  const [distanceLabels, setDistanceLabels] = useState([]);
  const [measuring, setMeasuring] = useState(false);
  const [savedMeasurements, setSavedMeasurements] = useState(() =>
    JSON.parse(localStorage.getItem("measurements") || "[]")
  );

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const isMapReady = map && window.google;
  const { isInsideIndia } = useIndiaBoundary(map);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // -------------------- DistanceLabel Overlay --------------------
  const DistanceLabel = isMapReady
    ? class extends window.google.maps.OverlayView {
        constructor(position, text, map) {
          super();
          this.position = position;
          this.text = text;
          this.div = null;
          this.setMap(map);
        }
        onAdd() {
          this.div = document.createElement("div");
          this.div.style.cssText =
            "background: rgba(255,255,255,0.7); padding: 2px 4px; border-radius: 4px; font-size: 12px; color: #000; white-space: nowrap;";
          this.div.innerHTML = this.text;
          this.getPanes()?.overlayLayer.appendChild(this.div);
        }
        draw() {
          const projection = this.getProjection?.();
          if (!projection) return;
          const pos = projection.fromLatLngToDivPixel(this.position);
          if (pos && this.div) {
            this.div.style.left = pos.x + "px";
            this.div.style.top = pos.y + "px";
            this.div.style.position = "absolute";
          }
        }
        onRemove() {
          if (this.div) {
            this.div.remove();
            this.div = null;
          }
        }
      }
    : null;

  // -------------------- Extract Segments & Labels --------------------
  const extractSegments = (poly) => {
    if (!poly || !isMapReady || !DistanceLabel) return;
    const path = poly.getPath().getArray();
    let segs = [];
    let total = 0;

    distanceLabels.forEach((l) => l.setMap(null));
    let labels = [];

    for (let i = 0; i < path.length - 1; i++) {
      const dist =
        window.google.maps.geometry.spherical.computeDistanceBetween(
          path[i],
          path[i + 1]
        ) / 1000;
      total += dist;
      segs.push({ index: i + 1, distance: dist.toFixed(2) });

      const midpoint = window.google.maps.geometry.spherical.interpolate(
        path[i],
        path[i + 1],
        0.5
      );
      const label = new DistanceLabel(midpoint, `${dist.toFixed(2)} km`, map);
      labels.push(label);
    }

    segs.push({ index: "Total", distance: total.toFixed(2) });
    setSegments(segs);
    setDistanceLabels(labels);
  };

  // -------------------- DrawingManager --------------------
  useEffect(() => {
    if (!isMapReady) return;

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: measuring
        ? window.google.maps.drawing.OverlayType.POLYLINE
        : null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ["polyline"]
      },
      polylineOptions: {
        strokeColor: "#1976d2",
        strokeWeight: 3,
        editable: true
      }
    });

    drawingManager.setMap(map);

    const handlePolylineComplete = (poly) => {
      if (!poly) return;

      const path = poly.getPath();
      const allInside = path
        .getArray()
        .every((latLng) =>
          isInsideIndia({ lat: latLng.lat(), lng: latLng.lng() })
        );

      if (!allInside) {
        showSnackbar("All points must be inside India!");
        poly.setMap(null);
        return;
      }

      setPolyline(poly);
      extractSegments(poly);

      ["set_at", "insert_at", "remove_at"].forEach((event) =>
        window.google.maps.event.addListener(path, event, () => {
          const inside = path
            .getArray()
            .every((latLng) =>
              isInsideIndia({ lat: latLng.lat(), lng: latLng.lng() })
            );
          if (!inside) {
            showSnackbar("Cannot move points outside India!");
            poly.setMap(null);
            setPolyline(null);
            setDistanceLabels([]);
            setSegments([]);
          } else {
            extractSegments(poly);
          }
        })
      );
    };

    const listener = window.google.maps.event.addListener(
      drawingManager,
      "polylinecomplete",
      handlePolylineComplete
    );

    return () => {
      drawingManager.setMap(null);
      window.google?.maps?.event.removeListener(listener);
      distanceLabels.forEach((l) => l.setMap(null));
    };
  }, [map, measuring, isMapReady]);

  // -------------------- Save Measurement --------------------
  const handleSaveMeasurement = (name) => {
    if (!polyline) return;

    const path = polyline
      .getPath()
      .getArray()
      .map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));

    const newEntry = {
      id: Date.now(),
      name,
      date: new Date().toLocaleString(),
      segments,
      path
    };

    const updated = [...savedMeasurements, newEntry];
    setSavedMeasurements(updated);
    localStorage.setItem("measurements", JSON.stringify(updated));
    setSaveDialogOpen(false);
    showSnackbar(`Measurement "${name}" saved`);
  };

  // -------------------- Load Measurement --------------------
  const handleLoadMeasurement = (measurement) => {
    if (!isMapReady) return;

    if (polyline) polyline.setMap(null);
    distanceLabels.forEach((l) => l.setMap(null));
    setDistanceLabels([]);

    const newPolyline = new window.google.maps.Polyline({
      path: measurement.path.map(
        (p) => new window.google.maps.LatLng(p.lat, p.lng)
      ),
      strokeColor: "#d32f2f",
      strokeWeight: 3,
      editable: true,
      map
    });

    setPolyline(newPolyline);
    extractSegments(newPolyline);

    const bounds = new window.google.maps.LatLngBounds();
    measurement.path.forEach((p) =>
      bounds.extend(new window.google.maps.LatLng(p.lat, p.lng))
    );
    map.fitBounds(bounds);
  };

  // -------------------- Delete Measurement --------------------
  const handleDeleteMeasurement = (id) => {
    const updated = savedMeasurements.filter((m) => m.id !== id);
    setSavedMeasurements(updated);
    localStorage.setItem("measurements", JSON.stringify(updated));
    showSnackbar("Measurement deleted");

    // Remove polyline if it matches the deleted measurement
    if (polyline) {
      const currentPath = polyline
        .getPath()
        .getArray()
        .map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng()
        }));

      const deletedMeasurement = savedMeasurements.find((m) => m.id === id);
      if (
        deletedMeasurement &&
        JSON.stringify(deletedMeasurement.path) === JSON.stringify(currentPath)
      ) {
        polyline.setMap(null);
        setPolyline(null);
        distanceLabels.forEach((l) => l.setMap(null));
        setDistanceLabels([]);
        setSegments([]);
      }
    }
  };

  return (
    <Box>
      {!isMapReady && <Box>Loading map...</Box>}

      {isMapReady && (
        <>
          <Header />
          <Controls
            measuring={measuring}
            setMeasuring={setMeasuring}
            onSave={() => setSaveDialogOpen(true)}
            onView={() => setViewDialogOpen(true)}
            onClear={() => {
              if (polyline) polyline.setMap(null);
              setPolyline(null);
              distanceLabels.forEach((l) => l.setMap(null));
              setDistanceLabels([]);
              setSegments([]);
            }}
          />
          <SegmentsTable segments={segments} />
          <SummaryTable segments={segments} />
          <SaveMeasurementDialog
            open={saveDialogOpen}
            onClose={() => setSaveDialogOpen(false)}
            onSave={handleSaveMeasurement}
          />
          <ViewDialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            measurements={savedMeasurements}
            onLoad={handleLoadMeasurement}
            onDelete={handleDeleteMeasurement}
          />
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              severity="success"
              onClose={() => setSnackbarOpen(false)}
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}
