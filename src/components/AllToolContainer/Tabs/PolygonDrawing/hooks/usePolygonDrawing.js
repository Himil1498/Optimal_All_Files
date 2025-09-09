import { useState, useCallback, useRef } from "react";

/**
 * usePolygonDrawing
 * - manages drawing state, markers, polygon shape, and area calculation
 * - exposes showSavedPolygon to render saved polygon on map
 */
export default function usePolygonDrawing(map) {
  const [drawingPolygon, setDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polygonArea, setPolygonArea] = useState(0);
  const [polygonShape, setPolygonShape] = useState(null);
  const [polygonMarkers, setPolygonMarkers] = useState([]);

  // refs to keep current objects available inside event handlers
  const polygonPointsRef = useRef([]);
  const polygonMarkersRef = useRef([]);
  const polygonShapeRef = useRef(null);

  const clearPolygon = useCallback(() => {
    // remove markers
    polygonMarkersRef.current.forEach((m) => {
      try {
        m.setMap(null);
      } catch (e) {}
    });
    polygonMarkersRef.current = [];
    setPolygonMarkers([]);

    // remove polygon
    if (polygonShapeRef.current) {
      try {
        polygonShapeRef.current.setMap(null);
      } catch (e) {}
      polygonShapeRef.current = null;
      setPolygonShape(null);
    }

    polygonPointsRef.current = [];
    setPolygonPoints([]);
    setPolygonArea(0);
  }, []);

  const startDrawing = () => {
    setDrawingPolygon(true);
    clearPolygon();
  };

  const stopDrawing = () => {
    setDrawingPolygon(false);
  };

  const handleMapClick = useCallback(
    (event) => {
      if (!drawingPolygon || !map) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPoint = { lat, lng };

      // create marker
      const marker = new window.google.maps.Marker({
        position: newPoint,
        map,
        title: `Vertex ${polygonPointsRef.current.length + 1}`
      });

      // update refs + state
      polygonMarkersRef.current = [...polygonMarkersRef.current, marker];
      setPolygonMarkers([...polygonMarkersRef.current]);

      polygonPointsRef.current = [...polygonPointsRef.current, newPoint];
      setPolygonPoints([...polygonPointsRef.current]);

      // remove previous polygon if any
      if (polygonShapeRef.current) {
        try {
          polygonShapeRef.current.setMap(null);
        } catch (e) {}
        polygonShapeRef.current = null;
        setPolygonShape(null);
      }

      // draw polygon only if 3+ points
      if (polygonPointsRef.current.length > 2) {
        const polygon = new window.google.maps.Polygon({
          paths: polygonPointsRef.current,
          strokeColor: "#FF9800",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF9800",
          fillOpacity: 0.35,
          map
        });

        polygonShapeRef.current = polygon;
        setPolygonShape(polygon);

        // calculate area (m²)
        if (window.google?.maps?.geometry?.spherical?.computeArea) {
          const area = window.google.maps.geometry.spherical.computeArea(
            polygon.getPath()
          );
          setPolygonArea(area);
        } else {
          setPolygonArea(0);
        }
      }
    },
    [drawingPolygon, map, clearPolygon]
  );

  const showSavedPolygon = useCallback(
    (points) => {
      if (!map || !points || points.length === 0) return;

      clearPolygon();

      const polygon = new window.google.maps.Polygon({
        paths: points,
        strokeColor: "#1976d2",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#1976d2",
        fillOpacity: 0.25,
        map
      });

      polygonShapeRef.current = polygon;
      setPolygonShape(polygon);

      polygonPointsRef.current = points;
      setPolygonPoints(points);

      if (window.google?.maps?.geometry?.spherical?.computeArea) {
        const area = window.google.maps.geometry.spherical.computeArea(
          polygon.getPath()
        );
        setPolygonArea(area);
      } else {
        setPolygonArea(0);
      }

      // fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      points.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);
    },
    [map, clearPolygon]
  );

  return {
    drawingPolygon,
    polygonPoints,
    polygonArea,
    polygonShape,
    polygonMarkers,
    startDrawing,
    stopDrawing,
    clearPolygon,
    handleMapClick,
    showSavedPolygon,
    polygonShape
  };
}
