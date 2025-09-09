// import { Box } from "@mui/material";
// import useIndiaBoundary from "../../../../hooks/useIndiaBoundary";
// import AddMarkerButton from "./AddMarkerButton";
// import ImportMarkers from "./ImportMarkers";
// import ClearMarkersButton from "./ClearMarkersButton";
// import MarkerEditDialog from "./MarkerEditDialog";
// import MarkersTable from "./MarkersTable";
// import { useMarkerManager } from "./hooks/useMarkerManager";
// import SnackbarAlert from "../PolygonDrawing/components/SnackbarAlert";

// export default function InfrastructureTab({ map }) {
//   const { isInsideIndia } = useIndiaBoundary(map);

//   const {
//     tableData,
//     lastAddedMarker,
//     editedData,
//     setEditedData,
//     editDialogOpen,
//     setEditDialogOpen,
//     addMarkerType,
//     setAddMarkerType,
//     handleViewMarker,
//     handleSaveMarker,
//     popLayer,
//     subPopLayer,
//     importMarkersRef,
//     addMarkerToTable,
//     snackbar,
//     setSnackbar
//   } = useMarkerManager(map, isInsideIndia);

//   return (
//     <>
//       {/* Add Marker Buttons */}
//       <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
//         <AddMarkerButton
//           label="Add POP"
//           onClick={() => setAddMarkerType("POP")}
//         />
//         <AddMarkerButton
//           label="Add Sub POP"
//           onClick={() => setAddMarkerType("Sub POP")}
//         />
//       </Box>

//       {/* Import Markers */}
//       <ImportMarkers
//         ref={importMarkersRef}
//         map={map}
//         addMarkerToTable={addMarkerToTable}
//       />

//       {/* Clear All Markers */}
//       <ClearMarkersButton
//         popLayer={popLayer}
//         subPopLayer={subPopLayer}
//         importMarkersRef={importMarkersRef}
//       />

//       {/* Snackbar */}
//       <SnackbarAlert
//         open={snackbar.open}
//         message={snackbar.message}
//         onClose={() => setSnackbar({ open: false, message: "" })}
//       />

//       {/* Marker Edit Dialog */}
//       <MarkerEditDialog
//         open={editDialogOpen}
//         editedData={editedData}
//         setEditedData={setEditedData}
//         onSave={handleSaveMarker}
//         onClose={() => setEditDialogOpen(false)}
//       />

//       {/* Markers Table */}
//       <MarkersTable
//         markersData={tableData}
//         onView={handleViewMarker}
//         highlightMarker={lastAddedMarker}
//       />
//     </>
//   );
// }

import { Box } from "@mui/material";
import useIndiaBoundary from "../../../../hooks/useIndiaBoundary";
import AddMarkerButton from "./AddMarkerButton";
import ImportMarkers from "./ImportMarkers";
import ClearMarkersButton from "./ClearMarkersButton";
import MarkerEditDialog from "./MarkerEditDialog";
import MarkersTable from "./MarkersTable";
import { useMarkerManager } from "./hooks/useMarkerManager";
import SnackbarAlert from "../PolygonDrawing/components/SnackbarAlert";
import CheckboxLayerToggle from "./CheckBoxlayerToggle";

export default function InfrastructureTab({ map }) {
  const { isInsideIndia } = useIndiaBoundary(map);

  const {
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
    addMarkerToTable,
    snackbar,
    setSnackbar
  } = useMarkerManager(map, isInsideIndia);

  return (
    <>
      {/* Layer Toggles */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
        <CheckboxLayerToggle
          label="Show POP Locations"
          checked={popLayer.visible}
          onChange={() => popLayer.toggleLayer()}
        />
        <CheckboxLayerToggle
          label="Show Sub POP Locations"
          checked={subPopLayer.visible}
          onChange={() => subPopLayer.toggleLayer()}
        />
      </Box>

      {/* Add Marker Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <AddMarkerButton
          label="Add POP"
          onClick={() => setAddMarkerType("POP")}
        />
        <AddMarkerButton
          label="Add Sub POP"
          onClick={() => setAddMarkerType("Sub POP")}
        />
      </Box>

      {/* Import Markers */}
      <ImportMarkers
        ref={importMarkersRef}
        map={map}
        addMarkerToTable={addMarkerToTable}
      />

      {/* Clear All Markers */}
      <ClearMarkersButton
        popLayer={popLayer}
        subPopLayer={subPopLayer}
        importMarkersRef={importMarkersRef}
      />

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar({ open: false, message: "" })}
      />

      {/* Marker Edit Dialog */}
      <MarkerEditDialog
        open={editDialogOpen}
        editedData={editedData}
        setEditedData={setEditedData}
        onSave={handleSaveMarker}
        onClose={() => setEditDialogOpen(false)}
      />

      {/* Markers Table */}
      <MarkersTable
        markersData={tableData}
        onView={handleViewMarker}
        highlightMarker={lastAddedMarker}
      />
    </>
  );
}
