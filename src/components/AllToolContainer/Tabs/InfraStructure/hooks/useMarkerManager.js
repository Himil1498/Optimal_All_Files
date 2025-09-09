// useMarkerManager.js
import { useState, useRef, useEffect } from "react";
import useKmlLayer from "./ReusableKmlLayer";

export function useMarkerManager(map, isInsideIndia) {
  const [tableData, setTableData] = useState([]);
  const [lastAddedMarker, setLastAddedMarker] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMarkerType, setAddMarkerType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const importMarkersRef = useRef(null);
  const mapClickListenerRef = useRef(null);

  // Callbacks for edit/delete from InfoWindow
  const handleMarkerClick = (action, markerData) => {
    if (action === "edit") {
      setEditedData(markerData);
      setEditDialogOpen(true);
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this marker?")) {
        if (markerData.markerObject) {
          markerData.markerObject.setMap(null);
        }

        const storageKey =
          markerData.type === "POP"
            ? "manualPopMarkers"
            : "manualSubPopMarkers";

        const savedData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const updatedData = savedData.filter((m) => m.id !== markerData.id);
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        updateTableData();
        setSnackbar({ open: true, message: "Marker deleted successfully" });
      }
    }
  };

  // KML layers
  const popLayer = useKmlLayer(
    map,
    "/pop_location.kml",
    "POP",
    handleMarkerClick
  );
  const subPopLayer = useKmlLayer(
    map,
    "/sub_pop_location.kml",
    "Sub POP",
    handleMarkerClick
  );

  // Load manual markers on map init
  useEffect(() => {
    if (!map) return;

    const manualPop = JSON.parse(
      localStorage.getItem("manualPopMarkers") || "[]"
    );
    const manualSubPop = JSON.parse(
      localStorage.getItem("manualSubPopMarkers") || "[]"
    );

    manualPop.forEach((m) => popLayer.addMarker(m));
    manualSubPop.forEach((m) => subPopLayer.addMarker(m));

    popLayer.toggleLayer();
    subPopLayer.toggleLayer();

    updateTableData();
  }, [map]);

  // Map click to add manual marker
  useEffect(() => {
    if (!map || !addMarkerType) return;

    const listener = map.addListener("click", (e) => {
      const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      if (!isInsideIndia(position)) {
        setSnackbar({
          open: true,
          message: "Markers can only be added inside India."
        });
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        const address =
          status === "OK" && results[0] ? results[0].formatted_address : "";
        setEditedData({ type: addMarkerType, position, address });
        setEditDialogOpen(true);
        setAddMarkerType(null);
      });
    });

    mapClickListenerRef.current = listener;
    return () => google.maps.event.removeListener(mapClickListenerRef.current);
  }, [map, addMarkerType]);

  // Save marker (manual add/edit)
  const handleSaveMarker = () => {
    if (!editedData.position) return;

    const layer = editedData.type === "POP" ? popLayer : subPopLayer;
    const storageKey =
      editedData.type === "POP" ? "manualPopMarkers" : "manualSubPopMarkers";

    // Only serializable fields
    const serializableData = {
      id: editedData.id || `manual-${Date.now()}`,
      networkId: editedData.networkId || "",
      uniqueId: editedData.uniqueId || "",
      redCode: editedData.redCode || "",
      name: editedData.name || "",
      status: editedData.status || "",
      createdOn: editedData.createdOn || "",
      updatedOn: editedData.updatedOn || "",
      address: editedData.address || "",
      contactName: editedData.contactName || "",
      contactNo: editedData.contactNo || "",
      isRented: editedData.isRented || "",
      agreementStartDate: editedData.agreementStartDate || "",
      agreementEndDate: editedData.agreementEndDate || "",
      natureOfBusiness: editedData.natureOfBusiness || "",
      structureType: editedData.structureType || "",
      upsAvailability: editedData.upsAvailability || "",
      backupAvailability: editedData.backupAvailability || "",
      type: editedData.type,
      position: {
        lat: editedData.position.lat,
        lng: editedData.position.lng
      }
    };

    // Load existing saved markers
    let savedData = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Update or add new
    const existingIndex = savedData.findIndex(
      (m) => m.id === serializableData.id
    );
    if (existingIndex !== -1) {
      savedData[existingIndex] = serializableData;
    } else {
      savedData.push(serializableData);
      layer.addMarker(serializableData); // Add marker to map
    }

    // Save only serializable data
    localStorage.setItem(storageKey, JSON.stringify(savedData));

    setLastAddedMarker(serializableData);
    updateTableData();
    setEditDialogOpen(false);
  };

  const updateTableData = () => {
    const savedPop = JSON.parse(localStorage.getItem("popMarkers") || "[]");
    const savedSubPop = JSON.parse(
      localStorage.getItem("subPopMarkers") || "[]"
    );
    const manualPop = JSON.parse(
      localStorage.getItem("manualPopMarkers") || "[]"
    );
    const manualSubPop = JSON.parse(
      localStorage.getItem("manualSubPopMarkers") || "[]"
    );
    const importedData =
      importMarkersRef.current?.importedLayers?.flatMap(
        (layer) => layer.data
      ) || [];

    setTableData([
      ...savedPop,
      ...savedSubPop,
      ...manualPop,
      ...manualSubPop,
      ...importedData
    ]);
  };

  const handleViewMarker = (markerData) => {
    if (!markerData.position) return;

    map.panTo(markerData.position);
    map.setZoom(15);

    const layer = markerData.type === "POP" ? popLayer : subPopLayer;
    if (!layer.visible) layer.toggleLayer();

    // Ensure marker exists
    let marker = layer.markers.find(
      (m) =>
        m.getPosition().lat().toFixed(6) ===
          markerData.position.lat.toFixed(6) &&
        m.getPosition().lng().toFixed(6) === markerData.position.lng.toFixed(6)
    );
    if (!marker) {
      layer.addMarker(markerData);
      marker = layer.markers[layer.markers.length - 1];
    }

    layer.openInfoWindow({ ...markerData, markerObject: marker });
  };

  return {
    tableData,
    lastAddedMarker,
    editedData,
    setEditedData,
    editDialogOpen,
    setEditDialogOpen,
    addMarkerType,
    setAddMarkerType,
    handleViewMarker,
    handleSaveMarker,
    popLayer,
    subPopLayer,
    importMarkersRef,
    addMarkerToTable: updateTableData,
    snackbar,
    setSnackbar
  };
}
