// export default function InfrastructureTab({ map }) {
//   const { isInsideIndia } = useIndiaBoundary(map);
//   const { ready, isInsideAllowedArea, fitMapToAllowedRegions } =
//     useRegionAccess(map);
//   const [markers, setMarkers] = useState([]); // Array of marker objects on the map
//   const [storedData, setStoredData] = useState([]); // Infrastructure data from localStorage
//   const [kmlData, setKmlData] = useState([]); // Data imported from KML/KMZ files
//   const [openForm, setOpenForm] = useState(false);
//   const [formData, setFormData] = useState({
//     id: "", // Unique identifier for the infrastructure point
//     location: "", // Name of the location
//     locationType: "", // Type from locationTypes
//     buildingHeight: "", // Height of building in meters
//     towerHeight: "", // Height of tower in meters
//     latitude: "", // Geographic coordinates
//     longitude: "",
//     address: "", // Physical address
//   });
//   const [addingMode, setAddingMode] = useState(false); // Tracks if in 'add marker' mode
//   const [isLoading, setIsLoading] = useState(false); // Loading state for async operations
//   const [searchTerm, setSearchTerm] = useState(""); // Search filter term
//   const [filterType, setFilterType] = useState(""); // Type filter
//   const [confirmOpen, setConfirmOpen] = useState(false); // Delete confirmation dialog
//   const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // Bulk delete confirmation
//   const [showSuccess, setShowSuccess] = useState(false); // Success message state
//   const [deleteTarget, setDeleteTarget] = useState(null); // Item to be deleted
//   const [rowToDelete, setRowToDelete] = useState(null); // Row data for deletion
//   const [step, setStep] = useState(0); // 0 = idle, 1 = coords, 2 = details form
//   const [manualCoords, setManualCoords] = useState({ lat: "", lng: "" });
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [anchorEl, setAnchorEl] = useState(null);
//   const openMenu = Boolean(anchorEl);
//   const [templateAnchor, setTemplateAnchor] = useState(null);
//   const [exportAnchor, setExportAnchor] = useState(null);
//   const [showPop, setShowPop] = useState(false);
//   const [showSubPop, setShowSubPop] = useState(false);
//   const [popMarkers, setPopMarkers] = useState([]);
//   const [subPopMarkers, setSubPopMarkers] = useState([]);
//   const [infoWindow, setInfoWindow] = useState(null);
//   const [selectedMarker, setSelectedMarker] = useState(null);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [editedData, setEditedData] = useState({});
//   const [tableData, setTableData] = useState([]); // Data for the table view
//   const [selectedMarkers, setSelectedMarkers] = useState(new Set());
//   const locationTypes = [
//     "Communication Tower",
//     "Office Complex",
//     "Manufacturing Unit",
//     "Data Center",
//     "Warehouse",
//     "Retail Store",
//     "Hospital",
//     "Educational Institute",
//   ];
//   const loadKmlFile = async (filePath, type) => {
//     try {
//       const response = await fetch(filePath);
//       const kmlText = await response.text();
//       const parser = new DOMParser();
//       const xmlDoc = parser.parseFromString(kmlText, "application/xml");
//       const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));
//       if (!infoWindow) {
//         setInfoWindow(new window.google.maps.InfoWindow());
//       }
//       const newMarkers = placemarks
//         .map((pm, index) => {
//           const dataElements = Array.from(pm.getElementsByTagName("Data"));
//           const markerData = {};
//           dataElements.forEach((dataEl) => {
//             const name = dataEl.getAttribute("name");
//             const valueEl = dataEl.getElementsByTagName("value")[0];
//             if (valueEl) {
//               markerData[name] = valueEl.textContent;
//             } else {
//               markerData[name] = "";
//             }
//           });
//           const name =
//             pm.getElementsByTagName("name")[0]?.textContent || "Unnamed";
//           const coordText = pm
//             .getElementsByTagName("coordinates")[0]
//             ?.textContent.trim();
//           if (!coordText) return null;
//           const [lngStr, latStr] = coordText
//             .split(",")
//             .map((x) => parseFloat(x));
//           const lat = parseFloat(latStr);
//           const lng = parseFloat(lngStr);
//           if (!lat || !lng) return null;
//           const marker = new window.google.maps.Marker({
//             position: { lat, lng },
//             map,
//             title: name,
//             icon:
//               type === "pop"
//                 ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
//                 : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//           });
//           marker.addListener("click", () => {
//             const markerDataWithType = {
//               ...markerData,
//               position: { lat, lng },
//               type: type,
//             };
//             setSelectedMarker(markerDataWithType);
//             showInfoWindowForMarker(marker, markerDataWithType);
//           });
//           return marker;
//         })
//         .filter(Boolean);
//       if (type === "pop") {
//         setPopMarkers(newMarkers);
//       } else {
//         setSubPopMarkers(newMarkers);
//       }
//     } catch (error) {
//       console.error(`Error loading ${filePath}:`, error);
//     }
//   };
//   const addPopMarker = (position, data) => {
//     const markerData = { ...data, type: "pop" };
//     const marker = new window.google.maps.Marker({
//       position,
//       map: showPop ? map : null,
//       title: data.name || "POP",
//       icon: {
//         url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//         scaledSize: new window.google.maps.Size(32, 32),
//       },
//       data: markerData,
//     });
//     marker.addListener("click", () => {
//       handleMarkerClick(marker, markerData);
//     });
//     setPopMarkers((prev) => [...prev, marker]);
//     if (showPop) {
//       setTableData((prev) => [...prev, markerData]);
//     }
//     return marker;
//   };
//   const addSubPopMarker = (position, data) => {
//     const markerData = { ...data, type: "subpop" };
//     const marker = new window.google.maps.Marker({
//       position,
//       map: showSubPop ? map : null,
//       title: data.name || "Sub POP",
//       icon: {
//         url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//         scaledSize: new window.google.maps.Size(32, 32),
//       },
//       data: markerData,
//     });

//     marker.addListener("click", () => {
//       handleMarkerClick(marker, markerData);
//     });
//     setSubPopMarkers((prev) => [...prev, marker]);
//     if (showSubPop) {
//       setTableData((prev) => [...prev, markerData]);
//     }
//     return marker;
//   };
//   const togglePopLayer = () => {
//     if (!showPop) {
//       loadKmlFile("/pop_location.kml", "pop");
//     } else {
//       popMarkers.forEach((marker) => marker.setMap(null));
//       setPopMarkers([]);
//       if (infoWindow) {
//         infoWindow.close();
//       }
//     }
//     setShowPop(!showPop);
//   };
//   const toggleSubPopLayer = () => {
//     if (!showSubPop) {
//       loadKmlFile("/sub_pop_location.kml", "subpop");
//     } else {
//       subPopMarkers.forEach((marker) => marker.setMap(null));
//       setSubPopMarkers([]);
//       if (infoWindow) {
//         infoWindow.close();
//       }
//     }
//     setShowSubPop(!showSubPop);
//   };
//   const togglePopMarkers = () => {
//     const newShowPop = !showPop;
//     setShowPop(newShowPop);
//     if (newShowPop) {
//       const popData = popMarkers.map((marker) => marker.data || {});
//       setTableData((prev) => [...prev, ...popData]);
//     } else {
//       setTableData((prev) => prev.filter((item) => item.type !== "pop"));
//     }
//   };
//   const toggleSubPopMarkers = () => {
//     const newShowSubPop = !showSubPop;
//     setShowSubPop(newShowSubPop);
//     if (newShowSubPop) {
//       const subPopData = subPopMarkers.map((marker) => marker.data || {});
//       setTableData((prev) => [...prev, ...subPopData]);
//     } else {
//       setTableData((prev) => prev.filter((item) => item.type !== "subpop"));
//     }
//   };
//   const showInfoWindowForMarker = (marker, markerData) => {
//     const name = marker.getTitle();
//     const content = `
//       <div style="max-width: 300px; max-height: 400px; overflow-y: auto;">
//         <h3>${name}</h3>
//         <div style="margin: 10px 0;">
//           <strong>ID:</strong> ${markerData.id || "N/A"}<br>
//           <strong>Unique ID:</strong> ${markerData.unique_id || "N/A"}<br>
//           <strong>Network ID:</strong> ${markerData.network_id || "N/A"}<br>
//           <strong>Status:</strong> ${markerData.status || "N/A"}<br>
//           <strong>Created On:</strong> ${markerData.created_on || "N/A"}<br>
//           <strong>Updated On:</strong> ${markerData.updated_on || "N/A"}<br>
//           <strong>Address:</strong> ${markerData.address || "N/A"}<br>
//           <strong>Contact:</strong> ${markerData.contact_name || "N/A"} (${
//       markerData.contact_no || "N/A"
//     })<br>
//         </div>
//         <button id="editMarkerBtn" style="padding: 5px 10px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
//           Edit Details
//         </button>
//       </div>
//     `;
//     if (infoWindow) {
//       infoWindow.close();
//     }
//     const newInfoWindow = new window.google.maps.InfoWindow({
//       content: content,
//       maxWidth: 350,
//     });
//     setInfoWindow(newInfoWindow);
//     newInfoWindow.open(map, marker);
//     setTimeout(() => {
//       const editBtn = document.getElementById("editMarkerBtn");
//       if (editBtn) {
//         editBtn.addEventListener("click", () => {
//           setEditedData({
//             ...markerData,
//             position: marker.getPosition().toJSON(),
//             type: markerData.type || "pop",
//           });
//           setEditDialogOpen(true);
//           newInfoWindow.close();
//         });
//       }
//     }, 100);
//   };
//   const handleMarkerCheckboxChange = (marker, markerData, isChecked) => {
//     const newSelectedMarkers = new Set(selectedMarkers);
//     if (isChecked) {
//       newSelectedMarkers.add(marker);
//       showInfoWindowForMarker(marker, markerData);
//     } else {
//       newSelectedMarkers.delete(marker);
//       if (infoWindow) {
//         infoWindow.close();
//       }
//     }
//     setSelectedMarkers(newSelectedMarkers);
//   };
//   const handleSaveMarkerChanges = () => {
//     if (!editedData) return;
//     console.log("Saving marker changes:", editedData);
//     setSnackbarMessage("Marker details updated successfully!");
//     setSnackbarOpen(true);
//     setEditDialogOpen(false);
//     if (editedData.type === "pop") {
//       const marker = popMarkers.find((m) => m.getTitle() === editedData.name);
//       if (marker) {
//         marker.setTitle(editedData.name);
//       }
//     } else {
//       const marker = subPopMarkers.find(
//         (m) => m.getTitle() === editedData.name
//       );
//       if (marker) {
//         marker.setTitle(editedData.name);
//       }
//     }
//   };
//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem("infrastructureData")) || [];
//     setStoredData(saved);
//     const imported = JSON.parse(localStorage.getItem("kmlImportedData")) || [];
//     setKmlData(imported);
//   }, []);
//   useEffect(() => {
//     if (!map || !addingMode) return;
//     const listener = map.addListener("click", (e) => {
//       const newPoint = {
//         lat: e.latLng.lat(),
//         lng: e.latLng.lng(),
//       };
//       if (!isInsideIndia(newPoint)) {
//         setSnackbarMessage("Cannot add point outside India!");
//         setSnackbarOpen(true);
//         return;
//       }
//       if (ready && !isInsideAllowedArea(newPoint)) {
//         setSnackbarMessage("You don't have access to this region.");
//         setSnackbarOpen(true);
//         return;
//       }
//       setFormData({
//         id: `inf-${Date.now()}`,
//         location: "",
//         locationType: "",
//         buildingHeight: "",
//         towerHeight: "",
//         latitude: newPoint.lat,
//         longitude: newPoint.lng,
//         address: "",
//       });
//       setOpenForm(true);
//       setAddingMode(false);
//     });

//     return () => {
//       if (listener && window.google?.maps?.event) {
//         window.google.maps.event.removeListener(listener);
//       }
//     };
//   }, [map, addingMode, ready, isInsideAllowedArea, isInsideIndia]);
//   useEffect(() => {
//     if (!map || !window.google?.maps) return;
//     const saved = JSON.parse(localStorage.getItem("infrastructureData")) || [];
//     const filtered = saved.filter((p) => {
//       const pt = { lat: Number(p.latitude), lng: Number(p.longitude) };
//       if (!isInsideIndia(pt)) return false;
//       if (ready && !isInsideAllowedArea(pt)) return false;
//       return true;
//     });
//     filtered.forEach((point) => addMarker(point));
//   }, [map, ready, isInsideAllowedArea, isInsideIndia]);
//   const addMarker = (point) => {
//     if (!map || !window.google?.maps) return null;
//     const lat = Number(point.latitude);
//     const lng = Number(point.longitude);
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
//     let icon = point.iconUrl
//       ? { url: point.iconUrl, scaledSize: new google.maps.Size(32, 32) }
//       : {
//           path: window.google.maps.SymbolPath.CIRCLE,
//           fillColor: "#1976d2",
//           fillOpacity: 1,
//           strokeColor: "#0d47a1",
//           strokeWeight: 2,
//           scale: 8,
//         };
//     const marker = new google.maps.Marker({
//       position: { lat, lng },
//       map,
//       title: point.location || "Infrastructure",
//       icon,
//       zIndex: 1000,
//     });
//     const iconOptions = [
//       { name: "Default", url: null },
//       {
//         name: "Red Dot",
//         url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//       },
//       {
//         name: "Blue Dot",
//         url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//       },
//       {
//         name: "Green Dot",
//         url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//       },
//       {
//         name: "Yellow Dot",
//         url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
//       },
//       {
//         name: "Purple Dot",
//         url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
//       },
//       {
//         name: "Orange Dot",
//         url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
//       },
//       {
//         name: "Home",
//         url: "https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png",
//       },
//       {
//         name: "Tower",
//         url: "https://maps.google.com/mapfiles/kml/shapes/target.png",
//       },
//       {
//         name: "Pole",
//         url: "https://maps.google.com/mapfiles/kml/shapes/poi.png",
//       },
//       {
//         name: "Building",
//         url: "https://maps.google.com/mapfiles/kml/shapes/library_maps.png",
//       },
//       {
//         name: "Cell Tower",
//         url: "https://maps.google.com/mapfiles/kml/shapes/capital_big.png",
//       },
//       {
//         name: "Antenna",
//         url: "https://cdn-icons-png.flaticon.com/512/483/483947.png",
//       },
//       {
//         name: "Data Center",
//         url: "https://maps.google.com/mapfiles/kml/shapes/info-i.png",
//       },
//       {
//         name: "Satellite",
//         url: "https://cdn-icons-png.flaticon.com/512/2103/2103580.png",
//       },
//       {
//         name: "Fiber Hub",
//         url: "https://maps.google.com/mapfiles/kml/shapes/flag.png",
//       },
//       {
//         name: "Customer",
//         url: "https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
//       },
//     ];
//     const infoContent = `
//     <div style="font-family: 'Roboto', sans-serif; max-width: 300px; padding: 12px; position: relative; border-radius: 8px;">
//       <!-- Close button -->
//       <button id="close-btn-${point.id}" style="
//         position: absolute;
//         top: 8px;
//         right: 8px;
//         border: none;
//         border-radius: 50%;
//         font-size: 18px;
//         font-weight: bold;
//         cursor: pointer;
//         transition: all 0.2s;
//         display:flex;
//         justify-content:center;
//         align-items:center;
//       " onmouseover="this.style.background='#e0e0e0'; this.style.color='#000';"
//          onmouseout="this.style.background='#f5f5f5'; this.style.color='#333';"
//       >&times;</button>
//       <h3 style="margin: 0 0 8px 0; color: #1565c0; font-size: 16px; font-weight: 500;">
//         ${point.location || "Unnamed"}
//       </h3>
//       <div style="color: #424242; font-size: 14px; line-height: 1.6;">
//         <div><strong>Type:</strong> ${point.locationType || "-"}</div>
//         <div><strong>Building:</strong> ${point.buildingHeight || "-"} m</div>
//         <div><strong>Tower:</strong> ${point.towerHeight || "-"} m</div>
//         <div><strong>Address:</strong> ${point.address || "-"}</div>
//       </div>
//       <div style="margin-top: 10px;">
//         <strong>Select Icon:</strong>
//         <div id="icon-menu-${
//           point.id
//         }" style="display:flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
//           ${iconOptions
//             .map(
//               (opt) => `
//             <img src="${
//               opt.url ||
//               "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
//             }" 
//                  title="${opt.name}" width="28" height="28"
//                  style="cursor:pointer; border: 1px solid #ccc; border-radius: 4px;" />
//           `
//             )
//             .join("")}
//         </div>
//       </div>
//       <div style="margin-top: 10px; display:flex; gap: 6px;">
//         <button id="edit-btn-${point.id}" style="
//           flex:1; padding:4px 0; cursor:pointer; border:none; border-radius:4px;
//           background:#1976d2; color:white;">Edit</button>
//         <button id="delete-btn-${point.id}" style="
//           flex:1; padding:4px 0; cursor:pointer; border:none; border-radius:4px;
//           background:#d32f2f; color:white;">Delete</button>
//       </div>
//     </div>
//   `;
//     const info = new google.maps.InfoWindow({ content: infoContent });
//     marker.addListener("click", () => {
//       info.open(map, marker);
//       setTimeout(() => {
//         // Close button
//         const closeBtn = document.getElementById(`close-btn-${point.id}`);
//         if (closeBtn) closeBtn.onclick = () => info.close();
//         // Icon menu
//         const menu = document.getElementById(`icon-menu-${point.id}`);
//         if (menu) {
//           Array.from(menu.children).forEach((img, index) => {
//             img.onclick = () => {
//               const newIcon = {
//                 url: iconOptions[index].url || null,
//                 scaledSize: new google.maps.Size(32, 32),
//               };
//               if (newIcon.url) marker.setIcon(newIcon);
//               else
//                 marker.setIcon({
//                   path: window.google.maps.SymbolPath.CIRCLE,
//                   fillColor: "#1976d2",
//                   fillOpacity: 1,
//                   strokeColor: "#0d47a1",
//                   strokeWeight: 2,
//                   scale: 8,
//                 });
//               const iconUrl = newIcon.url || null;
//               point.iconUrl = iconUrl;
//               setStoredData((prev) => {
//                 const updated = prev.map((d) =>
//                   d.id === point.id ? { ...d, iconUrl } : d
//                 );
//                 localStorage.setItem(
//                   "infrastructureData",
//                   JSON.stringify(updated)
//                 );
//                 return updated;
//               });
//               setKmlData((prev) => {
//                 const updated = prev.map((d) =>
//                   d.id === point.id ? { ...d, iconUrl } : d
//                 );
//                 localStorage.setItem(
//                   "kmlImportedData",
//                   JSON.stringify(updated)
//                 );
//                 return updated;
//               });
//             };
//           });
//         }
//         const editBtn = document.getElementById(`edit-btn-${point.id}`);
//         if (editBtn)
//           editBtn.onclick = () => {
//             setFormData(point);
//             setOpenForm(true);
//             info.close();
//           };
//         const deleteBtn = document.getElementById(`delete-btn-${point.id}`);
//         if (deleteBtn)
//           deleteBtn.onclick = () => {
//             marker.setMap(null);
//             setMarkers((prev) => prev.filter((m) => m.id !== point.id));
//             const updatedStored = storedData.filter((d) => d.id !== point.id);
//             setStoredData(updatedStored);
//             localStorage.setItem(
//               "infrastructureData",
//               JSON.stringify(updatedStored)
//             );
//             const updatedKml = kmlData.filter((d) => d.id !== point.id);
//             setKmlData(updatedKml);
//             localStorage.setItem("kmlImportedData", JSON.stringify(updatedKml));
//             info.close();
//             if (map) {
//               map.setCenter({ lat: 22.5, lng: 78.9 }); // Approx center of India
//               map.setZoom(5); // Zoom out
//             }
//           };
//       }, 0);
//     });
//     setMarkers((prev) => [...prev, { id: point.id, marker }]);
//     return marker;
//   };
//   const addMarkersInBatches = useCallback(
//     (points) => {
//       if (!map || !window.google?.maps) return;
//       markersRef.current.forEach((m) => m.setMap(null));
//       markersRef.current = [];
//       const BATCH_SIZE = 200; // number of markers per batch
//       let index = 0;
//       const processBatch = () => {
//         const slice = points.slice(index, index + BATCH_SIZE);
//         slice.forEach((point) => {
//           const marker = new window.google.maps.Marker({
//             position: {
//               lat: Number(point.latitude),
//               lng: Number(point.longitude),
//             },
//             map,
//             title: point.location || "Infrastructure",
//             icon: {
//               path: window.google.maps.SymbolPath.CIRCLE,
//               fillColor: "#1976d2",
//               fillOpacity: 1,
//               strokeColor: "#0d47a1",
//               strokeWeight: 2,
//               scale: 8,
//             },
//           });
//           markersRef.current.push(marker);
//         });
//         index += BATCH_SIZE;
//         if (index < points.length) {
//           requestAnimationFrame(processBatch); // schedule next batch
//         }
//       };
//       requestAnimationFrame(processBatch);
//     },
//     [map]
//   );
//   const handleShow = (row) => {
//     if (!map || !window.google?.maps) return;

//     const pt = { lat: Number(row.latitude), lng: Number(row.longitude) };
//     if (!isInsideIndia(pt)) {
//       setSnackbarMessage("Point is outside India.");
//       setSnackbarOpen(true);
//       return;
//     }
//     if (ready && !isInsideAllowedArea(pt)) {
//       setSnackbarMessage("You don't have access to this region.");
//       setSnackbarOpen(true);
//       return;
//     }

//     const existing = markers.find((m) => m.id === row.id);
//     const marker =
//       existing?.marker ||
//       addMarker({
//         ...row,
//         latitude: Number(row.latitude),
//         longitude: Number(row.longitude),
//       });

//     if (!marker) return;

//     map.panTo(marker.getPosition());
//     map.setZoom(16);
//     window.google.maps.event.trigger(marker, "click");

//     // brief bounce to highlight
//     if (window.google.maps.Animation?.BOUNCE) {
//       marker.setAnimation(window.google.maps.Animation.BOUNCE);
//       setTimeout(() => marker.setAnimation(null), 700);
//     }
//   };
//   const allData = [...storedData, ...kmlData];
//   const filteredData = allData.filter((item) => {
//     const matchesSearch =
//       item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.address.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterType === "" || item.locationType === filterType;
//     return matchesSearch && matchesFilter;
//   });
//   const getTypeColor = (type) => {
//     switch (type) {
//       case "Communication Tower":
//         return "warning";
//       case "Office Complex":
//         return "primary";
//       case "Manufacturing Unit":
//         return "success";
//       case "Data Center":
//         return "secondary";
//       case "Warehouse":
//         return "default";
//       default:
//         return "default";
//     }
//   };
//   return (
//     <Box sx={{ p: 0, m: 0 }}>
//       {/* Action Buttons */}
//       <Fade in={showSuccess}>
//         <Alert
//           severity="success"
//           sx={{ m: 0, p: 0 }}
//           action={
//             <IconButton size="small" onClick={() => setShowSuccess(false)}>
//               <CloseIcon fontSize="inherit" />
//             </IconButton>
//           }
//         >
//           Infrastructure point added successfully!
//         </Alert>
//       </Fade>
//       {/* Modern Action Buttons */}
//       <Card
//         elevation={0}
//         sx={{
//           mb: 4,
//           border: "1px solid",
//           borderColor: "divider",
//           borderRadius: 3,
//           overflow: "hidden",
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           <Typography
//             variant="h6"
//             sx={{ mb: 3, fontWeight: 600, color: "#1a202c" }}
//           >
//             Quick Actions
//           </Typography>

//           <Stack spacing={3}>
//             {/* Primary Actions */}
//             {/* Quick Actions */}
//             <Card
//               elevation={2}
//               sx={{
//                 borderRadius: 3,
//                 border: "1px solid",
//                 borderColor: "primary.light",
//                 backgroundColor: "rgba(59,130,246,0.04)", // light blue background
//                 mb: 4,
//               }}
//             >
//               <CardContent>
//                 {/* Title Section */}
//                 <Stack spacing={0.5} mb={2}>
//                   <Stack direction="row" alignItems="center" spacing={1.2}>
//                     <BoltIcon sx={{ color: "primary.main" }} />{" "}
//                     {/* ⚡ or another action icon */}
//                     <Typography
//                       variant="subtitle1"
//                       sx={{ fontWeight: 600, color: "primary.main" }}
//                     >
//                       Quick Actions
//                     </Typography>
//                   </Stack>
//                   <Typography variant="body2" color="text.secondary">
//                     Add, import, or export your infrastructure data instantly.
//                   </Typography>
//                 </Stack>

//                 {/* Action Buttons */}
//                 <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
//                   {/* ➕ Add Infrastructure */}

//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 2,
//                       mt: 2,
//                     }}
//                   >
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           checked={showPop}
//                           onChange={togglePopLayer}
//                           color="primary"
//                         />
//                       }
//                       label="Show POP Locations"
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           checked={showSubPop}
//                           onChange={toggleSubPopLayer}
//                           color="primary"
//                         />
//                       }
//                       label="Show Sub POP Locations"
//                     />
//                   </Box>

//                   <Button
//                     variant="contained"
//                     startIcon={
//                       addingMode ? (
//                         <CircularProgress size={16} color="inherit" />
//                       ) : (
//                         <AddIcon />
//                       )
//                     }
//                     onClick={() => setAddingMode(true)}
//                     disabled={addingMode}
//                     sx={{
//                       minWidth: 160,
//                       borderRadius: 2,
//                       px: 3,
//                       py: 1.2,
//                       fontWeight: 600,
//                       backgroundColor: "#2563eb",
//                       "&:hover": { backgroundColor: "#1d4ed8" },
//                     }}
//                   >
//                     {addingMode ? "Click on Map to Add" : "Add Infrastructure"}
//                   </Button>

//                   {/* 📂 Import Data */}
//                   <Button
//                     variant="contained"
//                     startIcon={<UploadIcon />}
//                     onClick={handleMenuOpen}
//                     sx={{
//                       minWidth: 160,
//                       borderRadius: 2,
//                       px: 3,
//                       py: 1.2,
//                       fontWeight: 600,
//                       backgroundColor: "#10b981",
//                       "&:hover": { backgroundColor: "#059669" },
//                     }}
//                   >
//                     Import Data
//                   </Button>
//                   <Menu
//                     anchorEl={anchorEl}
//                     open={openMenu}
//                     onClose={handleMenuClose}
//                   >
//                     <MenuItem>
//                       <label style={{ cursor: "pointer" }}>
//                         Import KML/KMZ
//                         <input
//                           type="file"
//                           accept=".kml,.kmz"
//                           hidden
//                           onChange={handleKmlKmzUpload}
//                         />
//                       </label>
//                     </MenuItem>
//                     <MenuItem>
//                       <label style={{ cursor: "pointer" }}>
//                         Import CSV
//                         <input
//                           type="file"
//                           accept=".csv"
//                           hidden
//                           onChange={handleCsvXlsxUpload}
//                         />
//                       </label>
//                     </MenuItem>
//                     <MenuItem>
//                       <label style={{ cursor: "pointer" }}>
//                         Import Excel (XLSX)
//                         <input
//                           type="file"
//                           accept=".xlsx"
//                           hidden
//                           onChange={handleCsvXlsxUpload}
//                         />
//                       </label>
//                     </MenuItem>
//                   </Menu>

//                   {/* 📥 Download Templates */}
//                   <Button
//                     variant="outlined"
//                     onClick={(e) => setTemplateAnchor(e.currentTarget)}
//                     sx={{ minWidth: 160, borderRadius: 2, px: 3, py: 1.2 }}
//                   >
//                     Download Template
//                   </Button>
//                   <Menu
//                     anchorEl={templateAnchor}
//                     open={Boolean(templateAnchor)}
//                     onClose={() => setTemplateAnchor(null)}
//                   >
//                     <MenuItem onClick={() => downloadTemplate("csv")}>
//                       CSV Template
//                     </MenuItem>
//                     <MenuItem onClick={() => downloadTemplate("xlsx")}>
//                       Excel Template
//                     </MenuItem>
//                   </Menu>

//                   {/* 📤 Export Data */}
//                   <Button
//                     variant="outlined"
//                     onClick={(e) => setExportAnchor(e.currentTarget)}
//                     sx={{ minWidth: 160, borderRadius: 2, px: 3, py: 1.2 }}
//                   >
//                     Export Data
//                   </Button>
//                   <Menu
//                     anchorEl={exportAnchor}
//                     open={Boolean(exportAnchor)}
//                     onClose={() => setExportAnchor(null)}
//                   >
//                     <MenuItem onClick={() => exportData("csv")}>
//                       Export as CSV
//                     </MenuItem>
//                     <MenuItem onClick={() => exportData("xlsx")}>
//                       Export as Excel
//                     </MenuItem>
//                     <MenuItem onClick={() => exportData("kml")}>
//                       Export as KML
//                     </MenuItem>
//                     <MenuItem onClick={() => exportData("kmz")}>
//                       Export as KMZ
//                     </MenuItem>
//                   </Menu>
//                 </Box>
//               </CardContent>
//             </Card>

//             {/* Manual Coordinates Input */}
//             {step === 1 && (
//               <Fade in timeout={300}>
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 3,
//                     bgcolor: "#f8fafc",
//                     border: "1px dashed #cbd5e1",
//                     borderRadius: 2,
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     sx={{ mb: 2, fontWeight: 600 }}
//                   >
//                     Enter Coordinates Manually
//                   </Typography>
//                   <Stack
//                     direction="row"
//                     spacing={2}
//                     alignItems="center"
//                     flexWrap="wrap"
//                   >
//                     <TextField
//                       label="Latitude"
//                       size="medium"
//                       value={manualCoords.lat}
//                       onChange={(e) =>
//                         setManualCoords((prev) => ({
//                           ...prev,
//                           lat: e.target.value,
//                         }))
//                       }
//                       sx={{ minWidth: 140 }}
//                     />
//                     <TextField
//                       label="Longitude"
//                       size="medium"
//                       value={manualCoords.lng}
//                       onChange={(e) =>
//                         setManualCoords((prev) => ({
//                           ...prev,
//                           lng: e.target.value,
//                         }))
//                       }
//                       sx={{ minWidth: 140 }}
//                     />
//                     <ButtonGroup variant="contained">
//                       <Button
//                         color="success"
//                         onClick={() => {
//                           const lat = parseFloat(manualCoords.lat);
//                           const lng = parseFloat(manualCoords.lng);
//                           if (Number.isFinite(lat) && Number.isFinite(lng)) {
//                             const pos = { lat, lng };
//                             if (!isInsideIndia(pos)) {
//                               setSnackbarMessage(
//                                 "Cannot add point outside India!"
//                               );
//                               setSnackbarOpen(true);
//                               return;
//                             }
//                             if (ready && !isInsideAllowedArea(pos)) {
//                               setSnackbarMessage(
//                                 "You don't have access to this region."
//                               );
//                               setSnackbarOpen(true);
//                               return;
//                             }

//                             const newPoint = {
//                               id: `manual-${Date.now()}`,
//                               location: "",
//                               locationType: "",
//                               buildingHeight: "",
//                               towerHeight: "",
//                               latitude: lat,
//                               longitude: lng,
//                               address: "",
//                             };

//                             const newPoints = [...storedData, newPoint];
//                             setStoredData(newPoints);
//                             localStorage.setItem(
//                               "infrastructureData",
//                               JSON.stringify(newPoints)
//                             );

//                             addMarker(newPoint);
//                             map.panTo({ lat, lng });
//                             map.setZoom(14);

//                             setFormData(newPoint);
//                             setOpenForm(true);

//                             setStep(0);
//                             setManualCoords({ lat: "", lng: "" });
//                           } else {
//                             alert(
//                               "Please enter valid numeric latitude and longitude."
//                             );
//                           }
//                         }}
//                         sx={{ px: 3 }}
//                       >
//                         Create Point
//                       </Button>
//                       <Button
//                         color="error"
//                         onClick={() => {
//                           setStep(0);
//                           setManualCoords({ lat: "", lng: "" });
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </ButtonGroup>
//                   </Stack>
//                 </Paper>
//               </Fade>
//             )}
//           </Stack>
//         </CardContent>
//       </Card>
//       <Card>
//         <CardContent sx={{ p: 0 }}>
//           {filteredData.length > 0 && (
//             <TableContainer
//               sx={{
//                 maxHeight: 300, // keep your desired height
//                 overflowY: "auto",
//                 "&::-webkit-scrollbar": {
//                   display: "none", // Chrome, Safari
//                 },
//                 scrollbarWidth: "none", // Firefox
//                 msOverflowStyle: "none", // IE/Edge
//               }}
//             >
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
//                       Location
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
//                       Type
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
//                       Building (m)
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
//                       Tower (m)
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
//                       Coordinates
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
//                       Address
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         bgcolor: "#f5f5f5",
//                         textAlign: "center",
//                       }}
//                     >
//                       Actions
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {filteredData.map((row) => (
//                     <TableRow
//                       key={row.id}
//                       sx={{
//                         "&:hover": { bgcolor: "rgba(25, 118, 210, 0.04)" },
//                         "&:nth-of-type(odd)": {
//                           bgcolor: "rgba(0, 0, 0, 0.02)",
//                         },
//                       }}
//                     >
//                       <TableCell>
//                         <Box sx={{ display: "flex", alignItems: "center" }}>
//                           {getTypeIcon(row.locationType)}
//                           <Box sx={{ ml: 2 }}>
//                             <Typography variant="body2" fontWeight={500}>
//                               {row.location}
//                             </Typography>
//                             <Typography
//                               variant="caption"
//                               color="text.secondary"
//                             >
//                               ID: {row.id}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={row.locationType}
//                           color={getTypeColor(row.locationType)}
//                           size="small"
//                           variant="outlined"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           {row.buildingHeight ? `${row.buildingHeight}m` : "-"}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           {row.towerHeight ? `${row.towerHeight}m` : "-"}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="caption" component="div">
//                           {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
//                         </Typography>
//                       </TableCell>
//                       <TableCell sx={{ maxWidth: 200 }}>
//                         <Typography
//                           variant="body2"
//                           sx={{
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {row.address || "-"}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Stack
//                           direction="row"
//                           spacing={1}
//                           justifyContent="center"
//                         >
//                           <Tooltip title="Show on Map">
//                             <IconButton
//                               size="small"
//                               onClick={() => handleShow(row)}
//                               color="primary"
//                             >
//                               <VisibilityIcon fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Delete">
//                             <IconButton
//                               size="small"
//                               onClick={() => {
//                                 setDeleteTarget(row.id);
//                                 setConfirmOpen(true);
//                                 setRowToDelete(row);
//                                 setOpenConfirm(true);
//                               }}
//                               color="error"
//                             >
//                               <DeleteIcon fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                         </Stack>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }


/**
 * InfrastructureTab Component
 *
 * A component for managing infrastructure points on a map with CRUD operations.
 * Allows users to add, view, update, and delete infrastructure locations.
 * Supports KML/KMZ file imports and provides filtering/search capabilities.
 */

import { useEffect, useState, useCallback } from "react";
// Material-UI Components
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  FormControl,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  Fab,
  Tooltip,
  Alert,
  Fade,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
  Snackbar,
  ButtonGroup,
  Grow,
  Menu,
  MenuItem,
} from "@mui/material";
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import LocationOffIcon from "@mui/icons-material/LocationOff";
// Material-UI Icons
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  NetworkCell as TowerIcon,
  Map as MapIcon,
  Close as CloseIcon,
  LocationOn,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import UploadIcon from "@mui/icons-material/Upload";
import SecurityIcon from "@mui/icons-material/Security";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BoltIcon from "@mui/icons-material/Bolt";

// For handling ZIP files (KML/KMZ)
import { ZipReader, BlobReader, TextWriter } from "@zip.js/zip.js";
import JSZip from "jszip";
import * as XLSX from "xlsx"; // ✅ install xlsx
import useIndiaBoundary from "../useIndiaBoundary";
import useRegionAccess from "../useRegionAccess";

export default function InfrastructureTab({ map }) {
  const { isInsideIndia } = useIndiaBoundary(map);
  const { ready, isInsideAllowedArea, fitMapToAllowedRegions } =
    useRegionAccess(map);

  // State for managing map markers and their data
  const [markers, setMarkers] = useState([]); // Array of marker objects on the map
  const [storedData, setStoredData] = useState([]); // Infrastructure data from localStorage
  const [kmlData, setKmlData] = useState([]); // Data imported from KML/KMZ files

  // Form state management
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "", // Unique identifier for the infrastructure point
    location: "", // Name of the location
    locationType: "", // Type from locationTypes
    buildingHeight: "", // Height of building in meters
    towerHeight: "", // Height of tower in meters
    latitude: "", // Geographic coordinates
    longitude: "",
    address: "", // Physical address
  });

  // UI State
  const [addingMode, setAddingMode] = useState(false); // Tracks if in 'add marker' mode
  const [isLoading, setIsLoading] = useState(false); // Loading state for async operations
  const [searchTerm, setSearchTerm] = useState(""); // Search filter term
  const [filterType, setFilterType] = useState(""); // Type filter

  // Dialog/Modal states
  const [confirmOpen, setConfirmOpen] = useState(false); // Delete confirmation dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // Bulk delete confirmation
  const [showSuccess, setShowSuccess] = useState(false); // Success message state
  const [deleteTarget, setDeleteTarget] = useState(null); // Item to be deleted
  const [rowToDelete, setRowToDelete] = useState(null); // Row data for deletion

  // Step control for Add Infrastructure
  const [step, setStep] = useState(0); // 0 = idle, 1 = coords, 2 = details form
  const [manualCoords, setManualCoords] = useState({ lat: "", lng: "" });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // state for menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [templateAnchor, setTemplateAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const [showPop, setShowPop] = useState(false);
  const [showSubPop, setShowSubPop] = useState(false);
  const [popMarkers, setPopMarkers] = useState([]);
  const [subPopMarkers, setSubPopMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [tableData, setTableData] = useState([]); // Data for the table view
  const [selectedMarkers, setSelectedMarkers] = useState(new Set());

  // Available infrastructure types for the dropdown
  const locationTypes = [
    "Communication Tower",
    "Office Complex",
    "Manufacturing Unit",
    "Data Center",
    "Warehouse",
    "Retail Store",
    "Hospital",
    "Educational Institute",
  ];

  const loadKmlFile = async (filePath, type) => {
    try {
      const response = await fetch(filePath);
      const kmlText = await response.text();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(kmlText, "application/xml");

      const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));

      // Initialize info window if not already done
      if (!infoWindow) {
        setInfoWindow(new window.google.maps.InfoWindow());
      }

      const newMarkers = placemarks
        .map((pm, index) => {
          // Extract all data from ExtendedData
          const dataElements = Array.from(pm.getElementsByTagName("Data"));
          const markerData = {};

          dataElements.forEach((dataEl) => {
            const name = dataEl.getAttribute("name");
            const valueEl = dataEl.getElementsByTagName("value")[0];
            if (valueEl) {
              markerData[name] = valueEl.textContent;
            } else {
              markerData[name] = "";
            }
          });

          const name =
            pm.getElementsByTagName("name")[0]?.textContent || "Unnamed";
          const coordText = pm
            .getElementsByTagName("coordinates")[0]
            ?.textContent.trim();

          if (!coordText) return null;

          const [lngStr, latStr] = coordText
            .split(",")
            .map((x) => parseFloat(x));
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);

          if (!lat || !lng) return null;

          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: name,
            icon:
              type === "pop"
                ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });

          // Add click listener to show InfoWindow
          marker.addListener("click", () => {
            // Set the selected marker data
            const markerDataWithType = {
              ...markerData,
              position: { lat, lng },
              type: type,
            };
            setSelectedMarker(markerDataWithType);
            showInfoWindowForMarker(marker, markerDataWithType);
          });

          return marker;
        })
        .filter(Boolean);

      if (type === "pop") {
        setPopMarkers(newMarkers);
      } else {
        setSubPopMarkers(newMarkers);
      }
    } catch (error) {
      console.error(`Error loading ${filePath}:`, error);
    }
  };

  const addPopMarker = (position, data) => {
    const markerData = { ...data, type: "pop" };
    const marker = new window.google.maps.Marker({
      position,
      map: showPop ? map : null,
      title: data.name || "POP",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(32, 32),
      },
      data: markerData,
    });

    marker.addListener("click", () => {
      handleMarkerClick(marker, markerData);
    });

    setPopMarkers((prev) => [...prev, marker]);

    // Add to table if POP is visible
    if (showPop) {
      setTableData((prev) => [...prev, markerData]);
    }

    return marker;
  };

  const addSubPopMarker = (position, data) => {
    const markerData = { ...data, type: "subpop" };
    const marker = new window.google.maps.Marker({
      position,
      map: showSubPop ? map : null,
      title: data.name || "Sub POP",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        scaledSize: new window.google.maps.Size(32, 32),
      },
      data: markerData,
    });

    marker.addListener("click", () => {
      handleMarkerClick(marker, markerData);
    });

    setSubPopMarkers((prev) => [...prev, marker]);

    // Add to table if Sub POP is visible
    if (showSubPop) {
      setTableData((prev) => [...prev, markerData]);
    }

    return marker;
  };

  const togglePopLayer = () => {
    if (!showPop) {
      // Load and show markers
      loadKmlFile("/pop_location.kml", "pop");
    } else {
      // Hide markers
      popMarkers.forEach((marker) => marker.setMap(null));
      setPopMarkers([]);
      // Clear any open info windows when hiding the layer
      if (infoWindow) {
        infoWindow.close();
      }
    }
    setShowPop(!showPop);
  };

  const toggleSubPopLayer = () => {
    if (!showSubPop) {
      // Load and show markers
      loadKmlFile("/sub_pop_location.kml", "subpop");
    } else {
      // Hide markers
      subPopMarkers.forEach((marker) => marker.setMap(null));
      setSubPopMarkers([]);
      // Clear any open info windows when hiding the layer
      if (infoWindow) {
        infoWindow.close();
      }
    }
    setShowSubPop(!showSubPop);
  };

  const togglePopMarkers = () => {
    const newShowPop = !showPop;
    setShowPop(newShowPop);

    // Update table data based on visibility
    if (newShowPop) {
      const popData = popMarkers.map((marker) => marker.data || {});
      setTableData((prev) => [...prev, ...popData]);
    } else {
      setTableData((prev) => prev.filter((item) => item.type !== "pop"));
    }
  };

  const toggleSubPopMarkers = () => {
    const newShowSubPop = !showSubPop;
    setShowSubPop(newShowSubPop);

    // Update table data based on visibility
    if (newShowSubPop) {
      const subPopData = subPopMarkers.map((marker) => marker.data || {});
      setTableData((prev) => [...prev, ...subPopData]);
    } else {
      setTableData((prev) => prev.filter((item) => item.type !== "subpop"));
    }
  };

  const showInfoWindowForMarker = (marker, markerData) => {
    const name = marker.getTitle();
    const content = `
      <div style="max-width: 300px; max-height: 400px; overflow-y: auto;">
        <h3>${name}</h3>
        <div style="margin: 10px 0;">
          <strong>ID:</strong> ${markerData.id || "N/A"}<br>
          <strong>Unique ID:</strong> ${markerData.unique_id || "N/A"}<br>
          <strong>Network ID:</strong> ${markerData.network_id || "N/A"}<br>
          <strong>Status:</strong> ${markerData.status || "N/A"}<br>
          <strong>Created On:</strong> ${markerData.created_on || "N/A"}<br>
          <strong>Updated On:</strong> ${markerData.updated_on || "N/A"}<br>
          <strong>Address:</strong> ${markerData.address || "N/A"}<br>
          <strong>Contact:</strong> ${markerData.contact_name || "N/A"} (${
      markerData.contact_no || "N/A"
    })<br>
        </div>
        <button id="editMarkerBtn" style="padding: 5px 10px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Edit Details
        </button>
      </div>
    `;

    // Close any existing info window
    if (infoWindow) {
      infoWindow.close();
    }

    // Create a new info window
    const newInfoWindow = new window.google.maps.InfoWindow({
      content: content,
      maxWidth: 350,
    });

    // Set the info window and open it
    setInfoWindow(newInfoWindow);
    newInfoWindow.open(map, marker);

    // Add click listener for the edit button after a small delay to ensure DOM is ready
    setTimeout(() => {
      const editBtn = document.getElementById("editMarkerBtn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          setEditedData({
            ...markerData,
            position: marker.getPosition().toJSON(),
            type: markerData.type || "pop",
          });
          setEditDialogOpen(true);
          newInfoWindow.close();
        });
      }
    }, 100);
  };

  const handleMarkerCheckboxChange = (marker, markerData, isChecked) => {
    const newSelectedMarkers = new Set(selectedMarkers);

    if (isChecked) {
      newSelectedMarkers.add(marker);
      // Show info window when checked
      showInfoWindowForMarker(marker, markerData);
    } else {
      newSelectedMarkers.delete(marker);
      // Close info window when unchecked
      if (infoWindow) {
        infoWindow.close();
      }
    }

    setSelectedMarkers(newSelectedMarkers);
  };

  const handleSaveMarkerChanges = () => {
    if (!editedData) return;

    // Here you would typically make an API call to save the changes
    // For now, we'll just log the changes and close the dialog
    console.log("Saving marker changes:", editedData);

    // Show success message
    setSnackbarMessage("Marker details updated successfully!");
    setSnackbarOpen(true);

    // Close the dialog
    setEditDialogOpen(false);

    // If you need to update the marker on the map, you would do it here
    // For example, you might want to update the marker's title or other properties
    if (editedData.type === "pop") {
      const marker = popMarkers.find((m) => m.getTitle() === editedData.name);
      if (marker) {
        marker.setTitle(editedData.name);
        // Update other marker properties as needed
      }
    } else {
      const marker = subPopMarkers.find(
        (m) => m.getTitle() === editedData.name
      );
      if (marker) {
        marker.setTitle(editedData.name);
        // Update other marker properties as needed
      }
    }
  };

  /**
   * Loads saved data from localStorage on component mount
   */

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("infrastructureData")) || [];
    setStoredData(saved);

    const imported = JSON.parse(localStorage.getItem("kmlImportedData")) || [];
    setKmlData(imported);
  }, []);

  /**
   * Handles map click events when in 'add marker' mode
   * Sets up a click listener on the map to capture coordinates
   */
  useEffect(() => {
    if (!map || !addingMode) return;

    const listener = map.addListener("click", (e) => {
      const newPoint = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      // Check if the point is inside India
      if (!isInsideIndia(newPoint)) {
        setSnackbarMessage("Cannot add point outside India!");
        setSnackbarOpen(true);
        return;
      }

      // Check region access
      if (ready && !isInsideAllowedArea(newPoint)) {
        setSnackbarMessage("You don't have access to this region.");
        setSnackbarOpen(true);
        return;
      }

      // If valid, open form
      setFormData({
        id: `inf-${Date.now()}`,
        location: "",
        locationType: "",
        buildingHeight: "",
        towerHeight: "",
        latitude: newPoint.lat,
        longitude: newPoint.lng,
        address: "",
      });
      setOpenForm(true);
      setAddingMode(false);
    });

    return () => {
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [map, addingMode, ready, isInsideAllowedArea, isInsideIndia]);

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    const saved = JSON.parse(localStorage.getItem("infrastructureData")) || [];
    const filtered = saved.filter((p) => {
      const pt = { lat: Number(p.latitude), lng: Number(p.longitude) };
      if (!isInsideIndia(pt)) return false;
      if (ready && !isInsideAllowedArea(pt)) return false;
      return true;
    });
    filtered.forEach((point) => addMarker(point));
  }, [map, ready, isInsideAllowedArea, isInsideIndia]);

  /**
   * Adds a marker to the map at the specified coordinates
   * @param {Object} point - The point data containing coordinates and metadata
   * @returns {Object|null} The created marker or null if invalid
   */
  const addMarker = (point) => {
    if (!map || !window.google?.maps) return null;

    const lat = Number(point.latitude);
    const lng = Number(point.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    // Marker icon
    let icon = point.iconUrl
      ? { url: point.iconUrl, scaledSize: new google.maps.Size(32, 32) }
      : {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#1976d2",
          fillOpacity: 1,
          strokeColor: "#0d47a1",
          strokeWeight: 2,
          scale: 8,
        };

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: point.location || "Infrastructure",
      icon,
      zIndex: 1000,
    });

    const iconOptions = [
      { name: "Default", url: null },
      {
        name: "Red Dot",
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
      {
        name: "Blue Dot",
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
      {
        name: "Green Dot",
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
      {
        name: "Yellow Dot",
        url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      },
      {
        name: "Purple Dot",
        url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
      },
      {
        name: "Orange Dot",
        url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
      },
      {
        name: "Home",
        url: "https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png",
      },
      {
        name: "Tower",
        url: "https://maps.google.com/mapfiles/kml/shapes/target.png",
      },
      {
        name: "Pole",
        url: "https://maps.google.com/mapfiles/kml/shapes/poi.png",
      },
      {
        name: "Building",
        url: "https://maps.google.com/mapfiles/kml/shapes/library_maps.png",
      },
      {
        name: "Cell Tower",
        url: "https://maps.google.com/mapfiles/kml/shapes/capital_big.png",
      },
      {
        name: "Antenna",
        url: "https://cdn-icons-png.flaticon.com/512/483/483947.png",
      },
      {
        name: "Data Center",
        url: "https://maps.google.com/mapfiles/kml/shapes/info-i.png",
      },
      {
        name: "Satellite",
        url: "https://cdn-icons-png.flaticon.com/512/2103/2103580.png",
      },
      {
        name: "Fiber Hub",
        url: "https://maps.google.com/mapfiles/kml/shapes/flag.png",
      },
      {
        name: "Customer",
        url: "https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
      },
    ];

    const infoContent = `
    <div style="font-family: 'Roboto', sans-serif; max-width: 300px; padding: 12px; position: relative; border-radius: 8px;">
      <!-- Close button -->
      <button id="close-btn-${point.id}" style="
        position: absolute;
        top: 8px;
        right: 8px;
        border: none;
        border-radius: 50%;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        display:flex;
        justify-content:center;
        align-items:center;
      " onmouseover="this.style.background='#e0e0e0'; this.style.color='#000';"
         onmouseout="this.style.background='#f5f5f5'; this.style.color='#333';"
      >&times;</button>

      <h3 style="margin: 0 0 8px 0; color: #1565c0; font-size: 16px; font-weight: 500;">
        ${point.location || "Unnamed"}
      </h3>

      <div style="color: #424242; font-size: 14px; line-height: 1.6;">
        <div><strong>Type:</strong> ${point.locationType || "-"}</div>
        <div><strong>Building:</strong> ${point.buildingHeight || "-"} m</div>
        <div><strong>Tower:</strong> ${point.towerHeight || "-"} m</div>
        <div><strong>Address:</strong> ${point.address || "-"}</div>
      </div>

      <div style="margin-top: 10px;">
        <strong>Select Icon:</strong>
        <div id="icon-menu-${
          point.id
        }" style="display:flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
          ${iconOptions
            .map(
              (opt) => `
            <img src="${
              opt.url ||
              "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            }" 
                 title="${opt.name}" width="28" height="28"
                 style="cursor:pointer; border: 1px solid #ccc; border-radius: 4px;" />
          `
            )
            .join("")}
        </div>
      </div>

      <div style="margin-top: 10px; display:flex; gap: 6px;">
        <button id="edit-btn-${point.id}" style="
          flex:1; padding:4px 0; cursor:pointer; border:none; border-radius:4px;
          background:#1976d2; color:white;">Edit</button>
        <button id="delete-btn-${point.id}" style="
          flex:1; padding:4px 0; cursor:pointer; border:none; border-radius:4px;
          background:#d32f2f; color:white;">Delete</button>
      </div>
    </div>
  `;

    const info = new google.maps.InfoWindow({ content: infoContent });

    marker.addListener("click", () => {
      info.open(map, marker);

      setTimeout(() => {
        // Close button
        const closeBtn = document.getElementById(`close-btn-${point.id}`);
        if (closeBtn) closeBtn.onclick = () => info.close();

        // Icon menu
        const menu = document.getElementById(`icon-menu-${point.id}`);
        if (menu) {
          Array.from(menu.children).forEach((img, index) => {
            img.onclick = () => {
              const newIcon = {
                url: iconOptions[index].url || null,
                scaledSize: new google.maps.Size(32, 32),
              };
              if (newIcon.url) marker.setIcon(newIcon);
              else
                marker.setIcon({
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: "#1976d2",
                  fillOpacity: 1,
                  strokeColor: "#0d47a1",
                  strokeWeight: 2,
                  scale: 8,
                });

              const iconUrl = newIcon.url || null;
              point.iconUrl = iconUrl;
              setStoredData((prev) => {
                const updated = prev.map((d) =>
                  d.id === point.id ? { ...d, iconUrl } : d
                );
                localStorage.setItem(
                  "infrastructureData",
                  JSON.stringify(updated)
                );
                return updated;
              });
              setKmlData((prev) => {
                const updated = prev.map((d) =>
                  d.id === point.id ? { ...d, iconUrl } : d
                );
                localStorage.setItem(
                  "kmlImportedData",
                  JSON.stringify(updated)
                );
                return updated;
              });
            };
          });
        }

        // Edit button
        const editBtn = document.getElementById(`edit-btn-${point.id}`);
        if (editBtn)
          editBtn.onclick = () => {
            setFormData(point);
            setOpenForm(true);
            info.close();
          };

        // Delete button
        const deleteBtn = document.getElementById(`delete-btn-${point.id}`);
        if (deleteBtn)
          deleteBtn.onclick = () => {
            // Remove marker from map
            marker.setMap(null);

            // Remove marker from state (real-time update)
            setMarkers((prev) => prev.filter((m) => m.id !== point.id));

            // Remove from stored data & localStorage
            const updatedStored = storedData.filter((d) => d.id !== point.id);
            setStoredData(updatedStored);
            localStorage.setItem(
              "infrastructureData",
              JSON.stringify(updatedStored)
            );

            // Remove from KML data & localStorage
            const updatedKml = kmlData.filter((d) => d.id !== point.id);
            setKmlData(updatedKml);
            localStorage.setItem("kmlImportedData", JSON.stringify(updatedKml));

            // Close info window
            info.close();

            // Re-center and resize map
            if (map) {
              map.setCenter({ lat: 22.5, lng: 78.9 }); // Approx center of India
              map.setZoom(5); // Zoom out
            }
          };
      }, 0);
    });

    setMarkers((prev) => [...prev, { id: point.id, marker }]);
    return marker;
  };

  const addMarkersInBatches = useCallback(
    (points) => {
      if (!map || !window.google?.maps) return;

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const BATCH_SIZE = 200; // number of markers per batch
      let index = 0;

      const processBatch = () => {
        const slice = points.slice(index, index + BATCH_SIZE);
        slice.forEach((point) => {
          const marker = new window.google.maps.Marker({
            position: {
              lat: Number(point.latitude),
              lng: Number(point.longitude),
            },
            map,
            title: point.location || "Infrastructure",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#1976d2",
              fillOpacity: 1,
              strokeColor: "#0d47a1",
              strokeWeight: 2,
              scale: 8,
            },
          });
          markersRef.current.push(marker);
        });

        index += BATCH_SIZE;
        if (index < points.length) {
          requestAnimationFrame(processBatch); // schedule next batch
        }
      };

      requestAnimationFrame(processBatch);
    },
    [map]
  );

  /**
   * Saves the current form data as a new infrastructure point
   * Updates both the UI state and localStorage
   */
  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // Create new points array with the form data
        const newPoints = [...storedData, formData];

        // Update state and localStorage
        setStoredData(newPoints);
        localStorage.setItem("infrastructureData", JSON.stringify(newPoints));

        // Add marker to the map
        addMarker(formData);

        // Reset form and show success message
        setOpenForm(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Error saving infrastructure point:", error);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  /**
   * Displays all infrastructure points on the map
   * Combines both manually added points and KML imports
   * Adjusts the map view to fit all markers
   */
  const handleShowAll = () => {
    if (!map || !window.google?.maps) return;

    // Combine infrastructure data from different sources
    const infraPoints = storedData || [];
    const kmlPoints = JSON.parse(localStorage.getItem("kmlImportedData")) || [];
    const allPoints = [...infraPoints, ...kmlPoints];

    if (allPoints.length === 0) {
      console.warn("No infrastructure points to display");
      return;
    }

    // Clear existing markers from the map
    markers.forEach((markerObj) => markerObj.marker?.setMap(null));
    setMarkers([]);

    // Add points permitted to the map and calculate bounds
    const bounds = new window.google.maps.LatLngBounds();
    let any = false;
    allPoints.forEach((point) => {
      const pt = { lat: Number(point.latitude), lng: Number(point.longitude) };
      if (!isInsideIndia(pt)) return;
      if (ready && !isInsideAllowedArea(pt)) return;
      addMarker(point);
      bounds.extend(pt);
      any = true;
    });
    if (any) map.fitBounds(bounds);
  };

  /**
   * Clears all markers from the map and resets the view
   * Does not delete the underlying data, only removes visual markers
   */
  const handleClearAll = () => {
    // Remove all markers from the map
    markers.forEach((markerObj) => {
      if (markerObj.marker) {
        markerObj.marker.setMap(null);
      }
    });

    // Clear markers from state
    setMarkers([]);

    // Reset map to default view (centered on India)
    if (map) {
      map.setCenter({ lat: 22.5, lng: 78.9 }); // Approximate center of India
      map.setZoom(5);
    }
  };

  /**
   * Reloads all markers from stored data
   * Useful if markers need to be refreshed without changing the map view
   */
  const handleReloadMarkers = () => {
    // Clear existing markers
    markers.forEach((markerObj) => {
      if (markerObj.marker) {
        markerObj.marker.setMap(null);
      }
    });
    setMarkers([]);
    if (storedData.length > 0 && map && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      storedData.forEach((p) => {
        addMarker(p);
        bounds.extend({ lat: p.latitude, lng: p.longitude });
      });
      map.fitBounds(bounds);
    }
  };

  const handleShow = (row) => {
    if (!map || !window.google?.maps) return;

    const pt = { lat: Number(row.latitude), lng: Number(row.longitude) };
    if (!isInsideIndia(pt)) {
      setSnackbarMessage("Point is outside India.");
      setSnackbarOpen(true);
      return;
    }
    if (ready && !isInsideAllowedArea(pt)) {
      setSnackbarMessage("You don't have access to this region.");
      setSnackbarOpen(true);
      return;
    }

    const existing = markers.find((m) => m.id === row.id);
    const marker =
      existing?.marker ||
      addMarker({
        ...row,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
      });

    if (!marker) return;

    map.panTo(marker.getPosition());
    map.setZoom(16);
    window.google.maps.event.trigger(marker, "click");

    // brief bounce to highlight
    if (window.google.maps.Animation?.BOUNCE) {
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 700);
    }
  };

  const handleDelete = () => {
    if (!rowToDelete) return;

    // Remove marker from map if exists
    const markerObj = markers.find((m) => m.id === rowToDelete.id);
    if (markerObj) {
      markerObj.marker.setMap(null);
      setMarkers((prev) => prev.filter((m) => m.id !== rowToDelete.id));
    }

    // Update storedData
    const updated = storedData.filter((d) => d.id !== rowToDelete.id);
    setStoredData(updated);
    localStorage.setItem("infrastructureData", JSON.stringify(updated));

    // Update KML data if needed
    const updatedKml = kmlData.filter((d) => d.id !== rowToDelete.id);
    setKmlData(updatedKml);
    localStorage.setItem("kmlImportedData", JSON.stringify(updatedKml));

    // Reset map view
    if (map) {
      map.setCenter({ lat: 22.5, lng: 78.9 });
      map.setZoom(5);
    }

    setConfirmOpen(false);
    setRowToDelete(null);
  };

  const allData = [...storedData, ...kmlData];

  const filteredData = allData.filter((item) => {
    const matchesSearch =
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "" || item.locationType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "Communication Tower":
        return <TowerIcon sx={{ color: "#ff9800" }} />;
      case "Office Complex":
        return <BusinessIcon sx={{ color: "#2196f3" }} />;
      case "Manufacturing Unit":
        return <BusinessIcon sx={{ color: "#4caf50" }} />;
      case "Data Center":
        return <BusinessIcon sx={{ color: "#9c27b0" }} />;
      case "Warehouse":
        return <BusinessIcon sx={{ color: "#795548" }} />;
      default:
        return <LocationIcon sx={{ color: "#607d8b" }} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Communication Tower":
        return "warning";
      case "Office Complex":
        return "primary";
      case "Manufacturing Unit":
        return "success";
      case "Data Center":
        return "secondary";
      case "Warehouse":
        return "default";
      default:
        return "default";
    }
  };

  // ---------- NEW: KML/KMZ import that APPENDS to existing data ----------
  const parseKmlTextToPoints = (kmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "application/xml");
    const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));

    const points = [];
    placemarks.forEach((pm, idx) => {
      const name =
        pm.getElementsByTagName("name")[0]?.textContent?.trim() || "Unnamed";
      const coordNode = pm.getElementsByTagName("coordinates")[0];
      if (!coordNode) return;
      const coordText = coordNode.textContent.trim();

      // KML order = lon,lat[,alt]; handle extra whitespace/newlines
      const [lngStr, latStr] = coordText.split(/[\s,]+/);
      const lng = Number(lngStr);
      const lat = Number(latStr);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        points.push({
          id: `kml-${Date.now()}-${idx}`,
          location: name,
          locationType: "Imported",
          buildingHeight: "",
          towerHeight: "",
          latitude: lat,
          longitude: lng,
          address: "",
        });
      }
    });

    return points;
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // CSV/XLSX Upload
  const handleCsvXlsxUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "csv") {
        const text = await file.text();
        const rows = text.split("\n").map((r) => r.split(","));
        const headers = rows.shift();
        let newPoints = rows
          .filter((r) => r.length >= 7)
          .map((r, idx) => ({
            id: r[0] || `csv-${Date.now()}-${idx}`,
            location: r[1],
            locationType: r[2],
            buildingHeight: r[3],
            towerHeight: r[4],
            latitude: Number(r[5]),
            longitude: Number(r[6]),
            address: r[7] || "",
          }));
        // Filter to allowed regions only
        const filtered = newPoints.filter((p) => {
          const pt = { lat: p.latitude, lng: p.longitude };
          if (!isInsideIndia(pt)) return false;
          if (ready && !isInsideAllowedArea(pt)) return false;
          return true;
        });
        const skipped = newPoints.length - filtered.length;
        newPoints = filtered;
        setStoredData((prev) => [...prev, ...newPoints]);
        localStorage.setItem(
          "infrastructureData",
          JSON.stringify([...storedData, ...newPoints])
        );
        newPoints.forEach(addMarker);
        if (skipped > 0) {
          setSnackbarMessage(`${skipped} out-of-region rows skipped`);
          setSnackbarOpen(true);
        }
      } else if (ext === "xlsx") {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        let newPoints = json.map((row, idx) => ({
          id: row.id || `xlsx-${Date.now()}-${idx}`,
          location: row.location,
          locationType: row.locationType,
          buildingHeight: row.buildingHeight || "",
          towerHeight: row.towerHeight || "",
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          address: row.address || "",
        }));
        const filtered = newPoints.filter((p) => {
          const pt = { lat: p.latitude, lng: p.longitude };
          if (!isInsideIndia(pt)) return false;
          if (ready && !isInsideAllowedArea(pt)) return false;
          return true;
        });
        const skipped = newPoints.length - filtered.length;
        newPoints = filtered;
        setStoredData((prev) => [...prev, ...newPoints]);
        localStorage.setItem(
          "infrastructureData",
          JSON.stringify([...storedData, ...newPoints])
        );
        newPoints.forEach(addMarker);
        if (skipped > 0) {
          setSnackbarMessage(`${skipped} out-of-region rows skipped`);
          setSnackbarOpen(true);
        }
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      event.target.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to parse file. Check format.");
    }
  };

  const downloadTemplate = (type) => {
    const headers = [
      "id",
      "location",
      "locationType",
      "buildingHeight",
      "towerHeight",
      "latitude",
      "longitude",
      "address",
    ];

    const sampleRow = {
      id: "inf-1",
      location: "My Tower",
      locationType: "Communication Tower",
      buildingHeight: 30,
      towerHeight: 50,
      latitude: 23.0225,
      longitude: 72.5714,
      address: "Ahmedabad, Gujarat",
    };

    if (type === "csv") {
      const csvContent =
        headers.join(",") + "\n" + headers.map((h) => sampleRow[h]).join(",");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "infrastructure_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === "xlsx") {
      const worksheet = XLSX.utils.json_to_sheet([sampleRow], {
        header: headers,
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, "infrastructure_template.xlsx");
    }
  };

  // De-dupe by name+lat+lng (rounded)
  // const mergePoints = (existing, incoming) => {
  //   const key = (p) =>
  //     `${(p.location || "").trim()}|${p.latitude.toFixed(
  //       6
  //     )}|${p.longitude.toFixed(6)}`;
  //   const seen = new Set(existing.map(key));
  //   const uniqueIncoming = incoming.filter((p) => !seen.has(key(p)));
  //   return [...existing, ...uniqueIncoming];
  // };

  const handleKmlKmzUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let kmlText = "";
      const lower = file.name.toLowerCase();

      if (lower.endsWith(".kml")) {
        kmlText = await file.text();
      } else if (lower.endsWith(".kmz")) {
        const zipReader = new ZipReader(new BlobReader(file));
        const entries = await zipReader.getEntries();
        if (!entries?.length) throw new Error("Empty KMZ archive.");
        let kmlEntry =
          entries.find((e) => e.filename.toLowerCase() === "doc.kml") ||
          entries.find((e) => e.filename.toLowerCase().endsWith(".kml"));
        if (!kmlEntry) throw new Error("No KML found inside KMZ.");
        kmlText = await kmlEntry.getData(new TextWriter());
        await zipReader.close();
      } else {
        throw new Error("Unsupported file type (use .kml or .kmz).");
      }

      let newPoints = parseKmlTextToPoints(kmlText);
      if (!newPoints.length) throw new Error("No Point Placemarks found.");

      // Filter to allowed regions only
      const filtered = newPoints.filter((p) => {
        const pt = { lat: p.latitude, lng: p.longitude };
        if (!isInsideIndia(pt)) return false;
        if (ready && !isInsideAllowedArea(pt)) return false;
        return true;
      });
      const skipped = newPoints.length - filtered.length;
      newPoints = filtered;

      // Store imported KML points in a different localStorage key
      localStorage.setItem("kmlImportedData", JSON.stringify(newPoints));
      setKmlData(newPoints); // ✅ refresh table immediately

      // Optionally, show markers on map (append to existing markers)
      newPoints.forEach((point) => addMarker(point));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      event.target.value = "";
      if (skipped > 0) {
        setSnackbarMessage(
          `${skipped} KML points skipped (outside allowed regions)`
        );
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error(err);
      alert(
        `Failed to import file: ${
          err?.message || "Unknown error"
        }\nTip: For KMZ, ensure it contains 'doc.kml' or a .kml file.`
      );
    }
  };

  const exportData = async (type) => {
    if (!storedData || storedData.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = [
      "id",
      "location",
      "locationType",
      "buildingHeight",
      "towerHeight",
      "latitude",
      "longitude",
      "address",
    ];

    if (type === "csv") {
      // ✅ already in your code
      const csvRows = [
        headers.join(","),
        ...storedData.map((item) =>
          headers.map((h) => (item[h] !== undefined ? item[h] : "")).join(",")
        ),
      ];
      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "infrastructure_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === "xlsx") {
      // ✅ already in your code
      const worksheet = XLSX.utils.json_to_sheet(storedData, {
        header: headers,
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Infrastructure");
      XLSX.writeFile(workbook, "infrastructure_data.xlsx");
    } else if (type === "kml") {
      // 🟢 NEW: Export as KML
      const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>`;
      const kmlFooter = `</Document></kml>`;

      const placemarks = storedData
        .map(
          (item) => `
        <Placemark>
          <name>${item.location || "No Name"}</name>
          <description>${item.address || ""} (${
            item.locationType || ""
          })</description>
          <Point>
            <coordinates>${item.longitude},${item.latitude},0</coordinates>
          </Point>
        </Placemark>`
        )
        .join("");

      const kmlContent = `${kmlHeader}${placemarks}${kmlFooter}`;

      const blob = new Blob([kmlContent], {
        type: "application/vnd.google-earth.kml+xml",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "infrastructure_data.kml");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === "kmz") {
      // 🟢 NEW: Export as KMZ (zipped KML)
      const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>`;
      const kmlFooter = `</Document></kml>`;

      const placemarks = storedData
        .map(
          (item) => `
        <Placemark>
          <name>${item.location || "No Name"}</name>
          <description>${item.address || ""} (${
            item.locationType || ""
          })</description>
          <Point>
            <coordinates>${item.longitude},${item.latitude},0</coordinates>
          </Point>
        </Placemark>`
        )
        .join("");

      const kmlContent = `${kmlHeader}${placemarks}${kmlFooter}`;

      const zip = new JSZip();
      zip.file("doc.kml", kmlContent);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "infrastructure_data.kmz");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box sx={{ p: 0, m: 0 }}>
      {/* Success Alert */}
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: "#1565c0" }}
        >
          🏗️ Infrastructure Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor your infrastructure points across different
          locations
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Fade in={showSuccess}>
        <Alert
          severity="success"
          sx={{ m: 0, p: 0 }}
          action={
            <IconButton size="small" onClick={() => setShowSuccess(false)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          Infrastructure point added successfully!
        </Alert>
      </Fade>
      {/* Modern Action Buttons */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: 600, color: "#1a202c" }}
          >
            Quick Actions
          </Typography>

          <Stack spacing={3}>
            {/* Primary Actions */}
            {/* Quick Actions */}
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "primary.light",
                backgroundColor: "rgba(59,130,246,0.04)", // light blue background
                mb: 4,
              }}
            >
              <CardContent>
                {/* Title Section */}
                <Stack spacing={0.5} mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1.2}>
                    <BoltIcon sx={{ color: "primary.main" }} />{" "}
                    {/* ⚡ or another action icon */}
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Quick Actions
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Add, import, or export your infrastructure data instantly.
                  </Typography>
                </Stack>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {/* ➕ Add Infrastructure */}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showPop}
                          onChange={togglePopLayer}
                          color="primary"
                        />
                      }
                      label="Show POP Locations"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showSubPop}
                          onChange={toggleSubPopLayer}
                          color="primary"
                        />
                      }
                      label="Show Sub POP Locations"
                    />
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={
                      addingMode ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AddIcon />
                      )
                    }
                    onClick={() => setAddingMode(true)}
                    disabled={addingMode}
                    sx={{
                      minWidth: 160,
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                      backgroundColor: "#2563eb",
                      "&:hover": { backgroundColor: "#1d4ed8" },
                    }}
                  >
                    {addingMode ? "Click on Map to Add" : "Add Infrastructure"}
                  </Button>

                  {/* 📂 Import Data */}
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleMenuOpen}
                    sx={{
                      minWidth: 160,
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                      backgroundColor: "#10b981",
                      "&:hover": { backgroundColor: "#059669" },
                    }}
                  >
                    Import Data
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                  >
                    <MenuItem>
                      <label style={{ cursor: "pointer" }}>
                        Import KML/KMZ
                        <input
                          type="file"
                          accept=".kml,.kmz"
                          hidden
                          onChange={handleKmlKmzUpload}
                        />
                      </label>
                    </MenuItem>
                    <MenuItem>
                      <label style={{ cursor: "pointer" }}>
                        Import CSV
                        <input
                          type="file"
                          accept=".csv"
                          hidden
                          onChange={handleCsvXlsxUpload}
                        />
                      </label>
                    </MenuItem>
                    <MenuItem>
                      <label style={{ cursor: "pointer" }}>
                        Import Excel (XLSX)
                        <input
                          type="file"
                          accept=".xlsx"
                          hidden
                          onChange={handleCsvXlsxUpload}
                        />
                      </label>
                    </MenuItem>
                  </Menu>

                  {/* 📥 Download Templates */}
                  <Button
                    variant="outlined"
                    onClick={(e) => setTemplateAnchor(e.currentTarget)}
                    sx={{ minWidth: 160, borderRadius: 2, px: 3, py: 1.2 }}
                  >
                    Download Template
                  </Button>
                  <Menu
                    anchorEl={templateAnchor}
                    open={Boolean(templateAnchor)}
                    onClose={() => setTemplateAnchor(null)}
                  >
                    <MenuItem onClick={() => downloadTemplate("csv")}>
                      CSV Template
                    </MenuItem>
                    <MenuItem onClick={() => downloadTemplate("xlsx")}>
                      Excel Template
                    </MenuItem>
                  </Menu>

                  {/* 📤 Export Data */}
                  <Button
                    variant="outlined"
                    onClick={(e) => setExportAnchor(e.currentTarget)}
                    sx={{ minWidth: 160, borderRadius: 2, px: 3, py: 1.2 }}
                  >
                    Export Data
                  </Button>
                  <Menu
                    anchorEl={exportAnchor}
                    open={Boolean(exportAnchor)}
                    onClose={() => setExportAnchor(null)}
                  >
                    <MenuItem onClick={() => exportData("csv")}>
                      Export as CSV
                    </MenuItem>
                    <MenuItem onClick={() => exportData("xlsx")}>
                      Export as Excel
                    </MenuItem>
                    <MenuItem onClick={() => exportData("kml")}>
                      Export as KML
                    </MenuItem>
                    <MenuItem onClick={() => exportData("kmz")}>
                      Export as KMZ
                    </MenuItem>
                  </Menu>
                </Box>
              </CardContent>
            </Card>

            {/* Manual Coordinates Input */}
            {step === 1 && (
              <Fade in timeout={300}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Enter Coordinates Manually
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <TextField
                      label="Latitude"
                      size="medium"
                      value={manualCoords.lat}
                      onChange={(e) =>
                        setManualCoords((prev) => ({
                          ...prev,
                          lat: e.target.value,
                        }))
                      }
                      sx={{ minWidth: 140 }}
                    />
                    <TextField
                      label="Longitude"
                      size="medium"
                      value={manualCoords.lng}
                      onChange={(e) =>
                        setManualCoords((prev) => ({
                          ...prev,
                          lng: e.target.value,
                        }))
                      }
                      sx={{ minWidth: 140 }}
                    />
                    <ButtonGroup variant="contained">
                      <Button
                        color="success"
                        onClick={() => {
                          const lat = parseFloat(manualCoords.lat);
                          const lng = parseFloat(manualCoords.lng);
                          if (Number.isFinite(lat) && Number.isFinite(lng)) {
                            const pos = { lat, lng };
                            if (!isInsideIndia(pos)) {
                              setSnackbarMessage(
                                "Cannot add point outside India!"
                              );
                              setSnackbarOpen(true);
                              return;
                            }
                            if (ready && !isInsideAllowedArea(pos)) {
                              setSnackbarMessage(
                                "You don't have access to this region."
                              );
                              setSnackbarOpen(true);
                              return;
                            }

                            const newPoint = {
                              id: `manual-${Date.now()}`,
                              location: "",
                              locationType: "",
                              buildingHeight: "",
                              towerHeight: "",
                              latitude: lat,
                              longitude: lng,
                              address: "",
                            };

                            const newPoints = [...storedData, newPoint];
                            setStoredData(newPoints);
                            localStorage.setItem(
                              "infrastructureData",
                              JSON.stringify(newPoints)
                            );

                            addMarker(newPoint);
                            map.panTo({ lat, lng });
                            map.setZoom(14);

                            setFormData(newPoint);
                            setOpenForm(true);

                            setStep(0);
                            setManualCoords({ lat: "", lng: "" });
                          } else {
                            alert(
                              "Please enter valid numeric latitude and longitude."
                            );
                          }
                        }}
                        sx={{ px: 3 }}
                      >
                        Create Point
                      </Button>
                      <Button
                        color="error"
                        onClick={() => {
                          setStep(0);
                          setManualCoords({ lat: "", lng: "" });
                        }}
                      >
                        Cancel
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Paper>
              </Fade>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Stats Cards */}
            <Grid
              container
              spacing={2}
              sx={{ mb: 2, display: "flex", justifyContent: "center" }}
            >
              {/* Total Points */}
              <Grid item xs={6} sm={4} md={2}>
                <Card
                  sx={{
                    width: 180,
                    height: 90,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "100%",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          {storedData.length}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          Total Points
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          width: 50,
                          height: 50,
                        }}
                      >
                        <LocationIcon sx={{ color: "white", fontSize: 30 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Towers */}
              <Grid item xs={6} sm={4} md={2}>
                <Card
                  sx={{
                    width: 180,
                    height: 90,
                    background:
                      "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "100%",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          {
                            storedData.filter(
                              (d) => d.locationType === "Communication Tower"
                            ).length
                          }
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          Towers
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          width: 50,
                          height: 50,
                        }}
                      >
                        <TowerIcon sx={{ color: "white", fontSize: 30 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Buildings */}
              <Grid item xs={6} sm={4} md={2}>
                <Card
                  sx={{
                    width: 180,
                    height: 90,
                    background:
                      "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "100%",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          {
                            storedData.filter(
                              (d) => d.locationType !== "Communication Tower"
                            ).length
                          }
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          Buildings
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          width: 50,
                          height: 50,
                        }}
                      >
                        <BusinessIcon sx={{ color: "white", fontSize: 30 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Active Markers */}
              <Grid item xs={6} sm={4} md={2}>
                <Card
                  sx={{
                    width: 180,
                    height: 90,
                    background:
                      "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "100%",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          {markers.filter((m) => m.marker?.getMap()).length}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          Active Markers
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          width: 50,
                          height: 50,
                        }}
                      >
                        <MapIcon sx={{ color: "white", fontSize: 30 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Secondary Actions */}
            <Stack spacing={3}>
              {/* Safe Actions */}
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={0.5} mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <SecurityIcon sx={{ color: "#10b981" }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "text.secondary" }}
                      >
                        Data Actions
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Manage and refresh your map data without losing anything.
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={handleShowAll}
                      disabled={storedData.length === 0 && kmlData.length === 0}
                      sx={{
                        minWidth: 130,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        borderColor: "#10b981",
                        color: "#10b981",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "#059669",
                          backgroundColor: "rgba(16,185,129,0.06)",
                        },
                      }}
                    >
                      Show All ({allData.length})
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<VisibilityOffIcon />}
                      onClick={handleClearAll}
                      disabled={markers.length === 0}
                      sx={{
                        minWidth: 130,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        borderColor: "#f59e0b",
                        color: "#f59e0b",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "#d97706",
                          backgroundColor: "rgba(245,158,11,0.06)",
                        },
                      }}
                    >
                      Clear Map
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleReloadMarkers}
                      disabled={storedData.length === 0}
                      sx={{
                        minWidth: 130,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        borderColor: "#3b82f6",
                        color: "#3b82f6",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "#2563eb",
                          backgroundColor: "rgba(59,130,246,0.06)",
                        },
                      }}
                    >
                      Reload
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "error.light",
                  backgroundColor: "rgba(239,68,68,0.04)",
                }}
              >
                <CardContent>
                  <Stack spacing={0.5} mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <WarningAmberIcon sx={{ color: "error.main" }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "error.main" }}
                      >
                        Cleanup
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="error.main">
                      Irreversible actions. Deleting data cannot be undone.
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={0.1} flexWrap="wrap">
                    <Button
                      variant="contained"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete all infrastructure data?"
                          )
                        ) {
                          localStorage.removeItem("infrastructureData");
                          setStoredData([]);
                          setShowSuccess(true);
                          setTimeout(() => setShowSuccess(false), 2500);
                        }
                      }}
                      disabled={storedData.length === 0}
                      sx={{
                        minWidth: 160,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        backgroundColor: "#ef4444",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#dc2626",
                        },
                      }}
                    >
                      Delete Manual Data
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<DeleteSweepIcon />}
                      onClick={() => setConfirmDeleteOpen(true)}
                      disabled={kmlData.length === 0}
                      sx={{
                        minWidth: 160,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1.2,
                        my: 10,
                        backgroundColor: "#dc2626",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#b91c1c",
                        },
                      }}
                    >
                      Delete KML Data
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // 3 seconds
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search by location or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Filter by Type"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Types</MenuItem>
                  {locationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Showing {filteredData.length} of {storedData.length} records
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredData.length > 0 && (
            <TableContainer
              sx={{
                maxHeight: 300, // keep your desired height
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  display: "none", // Chrome, Safari
                },
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                      Location
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                      Building (m)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                      Tower (m)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                      Coordinates
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                      Address
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        bgcolor: "#f5f5f5",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:hover": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                        "&:nth-of-type(odd)": {
                          bgcolor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getTypeIcon(row.locationType)}
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {row.location}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {row.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.locationType}
                          color={getTypeColor(row.locationType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.buildingHeight ? `${row.buildingHeight}m` : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.towerHeight ? `${row.towerHeight}m` : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" component="div">
                          {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.address || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Show on Map">
                            <IconButton
                              size="small"
                              onClick={() => handleShow(row)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeleteTarget(row.id);
                                setConfirmOpen(true);
                                setRowToDelete(row);
                                setOpenConfirm(true);
                              }}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      {/* Add Infrastructure Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        {/* Enhanced Gradient Header */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            pb: 3,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="30" r="1.5" fill="white" opacity="0.15"/><circle cx="40" cy="70" r="1" fill="white" opacity="0.1"/></svg>\')',
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  mr: 2,
                  width: 48,
                  height: 48,
                }}
              >
                <AddIcon sx={{ color: "white", fontSize: "1.5rem" }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                  Add Infrastructure Point
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontWeight: 300 }}
                >
                  Create a new infrastructure location with detailed
                  specifications
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Progress Indicator */}
          <Box
            sx={{
              height: 4,
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              mb: 4,
            }}
          />

          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* ID and Type Section */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "#2d3748",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      1
                    </Typography>
                  </Box>
                  Basic Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Unique Identifier"
                  value={formData.id}
                  disabled
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8fafc",
                      borderRadius: 3,
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #667eea, #764ba2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "white", fontWeight: 700 }}
                          >
                            ID
                          </Typography>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                >
                  <InputLabel>Infrastructure Type</InputLabel>
                  <Select
                    value={formData.locationType}
                    onChange={(e) =>
                      setFormData({ ...formData, locationType: e.target.value })
                    }
                    label="Infrastructure Type"
                    startAdornment={
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #4CAF50, #8BC34A)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <BusinessIcon
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </Box>
                      </InputAdornment>
                    }
                  >
                    {locationTypes.map((type) => (
                      <MenuItem
                        key={type}
                        value={type}
                        sx={{
                          py: 1.5,
                          "&:hover": {
                            backgroundColor: "rgba(102, 126, 234, 0.08)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getTypeIcon(type)}
                          <Typography sx={{ ml: 2, fontWeight: 500 }}>
                            {type}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location Details Section */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "#2d3748",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      2
                    </Typography>
                  </Box>
                  Location Details
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Location Name"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  placeholder="Enter descriptive location name..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <LocationOn
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Measurements Section */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "#2d3748",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      3
                    </Typography>
                  </Box>
                  Physical Measurements
                </Typography>
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Building Height"
                  value={formData.buildingHeight}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingHeight: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  type="number"
                  placeholder="0"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #9C27B0, #E91E63)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <BusinessIcon
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip
                          label="meters"
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(135deg, #9C27B0, #E91E63)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Pole/Tower Height"
                  value={formData.towerHeight}
                  onChange={(e) =>
                    setFormData({ ...formData, towerHeight: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  type="number"
                  placeholder="0"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #FF9800, #FF5722)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <TowerIcon
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip
                          label="meters"
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(135deg, #FF9800, #FF5722)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Coordinates Section */}
              <Grid xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "#2d3748",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      4
                    </Typography>
                  </Box>
                  Geographic Coordinates
                </Typography>
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Latitude"
                  value={formData.latitude}
                  disabled
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f0f9ff",
                      borderRadius: 3,
                      "& fieldset": {
                        borderColor: "#e0f2fe",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #2196F3, #03DAC6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "white", fontWeight: 700 }}
                          >
                            LAT
                          </Typography>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Longitude"
                  value={formData.longitude}
                  disabled
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f0f9ff",
                      borderRadius: 3,
                      "& fieldset": {
                        borderColor: "#e0f2fe",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #00BCD4, #009688)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "white", fontWeight: 700 }}
                          >
                            LNG
                          </Typography>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Address Section */}
              <Grid xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "#2d3748",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      5
                    </Typography>
                  </Box>
                  Address Information
                </Typography>
              </Grid>

              <Grid xs={12}>
                <TextField
                  label="Complete Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  placeholder="Enter the complete address with landmarks, city, state, and postal code..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", pt: 2 }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #795548, #8D6E63)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                          }}
                        >
                          <MapIcon
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        {/* Enhanced Action Footer */}
        <DialogActions
          sx={{
            p: 4,
            borderTop: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Button
            onClick={() => setOpenForm(false)}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              borderColor: "#cbd5e1",
              color: "#64748b",
              "&:hover": {
                borderColor: "#94a3b8",
                backgroundColor: "#f8fafc",
              },
            }}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            size="large"
            disabled={isLoading || !formData.location || !formData.locationType}
            sx={{
              borderRadius: 3,
              px: 6,
              py: 1.5,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 10px 25px -5px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                boxShadow: "0 15px 35px -5px rgba(102, 126, 234, 0.6)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "#e2e8f0",
                boxShadow: "none",
                transform: "none",
              },
              transition: "all 0.3s ease",
            }}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                <AddIcon />
              )
            }
          >
            {isLoading ? "Saving Infrastructure..." : "Save Infrastructure"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this infrastructure point?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all imported KML/KMZ data? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // ✅ remove from localStorage
              localStorage.removeItem("kmlImportedData");

              // ✅ clear table
              setKmlData([]);

              // ✅ clear KML markers from map in real time
              markers.forEach((m) => {
                if (m.id?.startsWith("kml-")) {
                  m.marker?.setMap(null);
                }
              });

              // close dialog
              setConfirmDeleteOpen(false);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Marker Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Marker Details</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ID"
                  value={editedData.id || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, id: e.target.value })
                  }
                  margin="normal"
                  disabled
                />
                <TextField
                  fullWidth
                  label="Name"
                  value={editedData.name || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Unique ID"
                  value={editedData.unique_id || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, unique_id: e.target.value })
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Network ID"
                  value={editedData.network_id || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, network_id: e.target.value })
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Status"
                  value={editedData.status || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, status: e.target.value })
                  }
                  margin="normal"
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Planned">Planned</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={editedData.contact_name || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      contact_name: e.target.value,
                    })
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={editedData.contact_no || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, contact_no: e.target.value })
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Address"
                  value={editedData.address || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, address: e.target.value })
                  }
                  margin="normal"
                  multiline
                  rows={3}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedData.is_rented === "true"}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          is_rented: e.target.checked ? "true" : "false",
                        })
                      }
                      color="primary"
                    />
                  }
                  label="Is Rented"
                />
                <TextField
                  fullWidth
                  label="Agreement Start Date"
                  type="date"
                  value={editedData.agreement_start_date?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      agreement_start_date: e.target.value,
                    })
                  }
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Agreement End Date"
                  type="date"
                  value={editedData.agreement_end_date?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      agreement_end_date: e.target.value,
                    })
                  }
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nature of Business"
                  value={editedData.nature_of_business || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      nature_of_business: e.target.value,
                    })
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Structure Type"
                  value={editedData.structure_type || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      structure_type: e.target.value,
                    })
                  }
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedData.ups_availability === "true"}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          ups_availability: e.target.checked ? "true" : "false",
                        })
                      }
                      color="primary"
                    />
                  }
                  label="UPS Available"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedData.backup_availability === "true"}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          backup_availability: e.target.checked
                            ? "true"
                            : "false",
                        })
                      }
                      color="primary"
                    />
                  }
                  label="Backup Available"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveMarkerChanges}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
