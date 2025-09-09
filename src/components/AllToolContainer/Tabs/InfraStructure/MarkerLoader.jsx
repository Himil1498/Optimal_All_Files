export async function loadKmlFile(
  map,
  filePath,
  type,
  setMarkers,
  infoWindowRef,
  onMarkerClick
) {
  try {
    const response = await fetch(filePath);
    const kmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "application/xml");

    const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    const newMarkers = placemarks
      .map((pm) => {
        const dataElements = Array.from(pm.getElementsByTagName("Data"));
        const markerData = {};
        dataElements.forEach((dataEl) => {
          const name = dataEl.getAttribute("name");
          const valueEl = dataEl.getElementsByTagName("value")[0];
          markerData[name] = valueEl?.textContent || "";
        });

        const name =
          pm.getElementsByTagName("name")[0]?.textContent || "Unnamed";
        const coordText = pm
          .getElementsByTagName("coordinates")[0]
          ?.textContent.trim();
        if (!coordText) return null;

        const [lngStr, latStr] = coordText.split(",").map(parseFloat);
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
              : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });

        marker.addListener("click", () =>
          onMarkerClick(marker, { ...markerData, position: { lat, lng }, type })
        );
        return marker;
      })
      .filter(Boolean);

    setMarkers(newMarkers);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
}
