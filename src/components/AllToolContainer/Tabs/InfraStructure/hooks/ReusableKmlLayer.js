import { useState, useRef } from "react";

export default function useKmlLayer(
  map,
  kmlPath,
  type,
  onMarkerClick, // optional callback for table actions
  customIcon
) {
  const [markers, setMarkers] = useState([]);
  const [markerDataList, setMarkerDataList] = useState([]);
  const [visible, setVisible] = useState(false);
  const infoWindowRef = useRef(null);

  // Helper to safely get InfoWindow
  const getInfoWindow = () => {
    if (!infoWindowRef.current && window.google) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }
    return infoWindowRef.current;
  };

  const getIcon = () =>
    customIcon ||
    (type.toLowerCase() === "pop"
      ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      : "http://maps.google.com/mapfiles/ms/icons/green-dot.png");

  const generateInfoWindowContent = (data, uniqueId) => {
    const fields = Object.entries(data)
      .map(([key, value]) => `<strong>${key}:</strong> ${value || ""}<br>`)
      .join("");

    return `
      <div style="padding:10px;font-family:Arial; max-width:300px; position: relative;">
        ${fields}
        <button id="editInfo-${uniqueId}" style="margin:5px;">Edit</button>
        <button id="deleteInfo-${uniqueId}" style="margin:5px;">Delete</button>
      </div>
    `;
  };

  const loadLayer = async () => {
    if (!map || !window.google) return;

    const response = await fetch(kmlPath);
    const kmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "application/xml");
    const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));

    const newMarkers = [];
    const newDataList = [];

    placemarks.forEach((pm, index) => {
      const dataElements = Array.from(pm.getElementsByTagName("Data"));
      const markerData = {};
      dataElements.forEach((el) => {
        const nameAttr = el.getAttribute("name");
        const valueEl = el.getElementsByTagName("value")[0];
        markerData[nameAttr] = valueEl?.textContent || "";
      });

      const name = pm.getElementsByTagName("name")[0]?.textContent || "Unnamed";
      const coordText = pm
        .getElementsByTagName("coordinates")[0]
        ?.textContent.trim();
      if (!coordText) return;

      const [lngStr, latStr] = coordText.split(",").map(parseFloat);
      const position = { lat: latStr, lng: lngStr };
      if (!position.lat || !position.lng) return;

      const data = {
        id: `${type}-${Date.now()}-${index}`,
        name,
        position,
        type,
        ...markerData
      };

      const uniqueId = Date.now() + Math.random().toString(36).substring(2, 7);

      const marker = new google.maps.Marker({
        position,
        map,
        title: name,
        icon: getIcon()
      });

      data.markerObject = marker;

      marker.addListener("click", () => {
        const infoWindow = getInfoWindow();
        infoWindow.setContent(generateInfoWindowContent(data, uniqueId));
        infoWindow.open(map, marker);

        setTimeout(() => {
          const editBtn = document.getElementById(`editInfo-${uniqueId}`);
          const deleteBtn = document.getElementById(`deleteInfo-${uniqueId}`);
          if (editBtn)
            editBtn.onclick = () =>
              onMarkerClick && onMarkerClick("edit", data);
          if (deleteBtn)
            deleteBtn.onclick = () =>
              onMarkerClick && onMarkerClick("delete", data);
        }, 50);
      });

      newMarkers.push(marker);
      newDataList.push(data);
    });

    setMarkers(newMarkers);
    setMarkerDataList(newDataList);
  };

  const toggleLayer = async () => {
    if (!map || !window.google) return;

    if (!visible) {
      if (markers.length === 0) await loadLayer();
      markers.forEach((m) => m.setMap(map));
    } else {
      markers.forEach((m) => m.setMap(null));
      getInfoWindow()?.close();
    }
    setVisible(!visible);
  };

  const addMarker = (data) => {
    if (!map || !window.google) return;

    const uniqueId = Date.now() + Math.random().toString(36).substring(2, 7);

    const marker = new google.maps.Marker({
      position: data.position,
      map: visible ? map : null,
      title: data.name || "Unnamed",
      icon: getIcon()
    });

    data.markerObject = marker;

    marker.addListener("click", () => {
      const infoWindow = getInfoWindow();
      infoWindow.setContent(generateInfoWindowContent(data, uniqueId));
      infoWindow.open(map, marker);

      setTimeout(() => {
        const editBtn = document.getElementById(`editInfo-${uniqueId}`);
        const deleteBtn = document.getElementById(`deleteInfo-${uniqueId}`);
        if (editBtn)
          editBtn.onclick = () => onMarkerClick && onMarkerClick("edit", data);
        if (deleteBtn)
          deleteBtn.onclick = () =>
            onMarkerClick && onMarkerClick("delete", data);
      }, 50);
    });

    setMarkers((prev) => [...prev, marker]);
    setMarkerDataList((prev) => [...prev, data]);
  };

  const openInfoWindow = (markerData) => {
    if (markerData.markerObject) {
      google.maps.event.trigger(markerData.markerObject, "click");
    } else {
      const marker = markers.find(
        (m) =>
          m.getPosition().lat().toFixed(6) ===
            markerData.position.lat.toFixed(6) &&
          m.getPosition().lng().toFixed(6) ===
            markerData.position.lng.toFixed(6)
      );
      if (marker) google.maps.event.trigger(marker, "click");
    }
  };

  return {
    markers,
    markerDataList,
    toggleLayer,
    visible,
    addMarker,
    openInfoWindow,
    getIcon
  };
}
