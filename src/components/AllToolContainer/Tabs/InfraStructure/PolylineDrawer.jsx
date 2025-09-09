import { useEffect, useState } from "react";
import useIndiaBoundary from "../../../../hooks/useIndiaBoundary";

export default function PolylineDrawer({ map, measuring }) {
  const { isInsideIndia } = useIndiaBoundary(map);
  const [polyline, setPolyline] = useState(null);

  const isMapReady = map && window.google;
  const showSnackbar = (msg) => alert(msg);

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
    };
  }, [map, measuring, isMapReady, isInsideIndia]);

  return null; // no UI
}
