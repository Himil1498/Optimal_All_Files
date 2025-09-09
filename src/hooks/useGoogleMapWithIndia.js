import { useEffect, useRef, useState } from "react";

let googleMapsPromise = null;

export default function useGoogleMapWithIndia({
  apiKey,
  libraries = ["drawing", "geometry", "places"],
  mapOptions = {},
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!googleMapsPromise) {
      googleMapsPromise = new Promise((resolve, reject) => {
        if (window.google) return resolve(window.google);

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${"AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ"}&libraries=${libraries.join(
          ","
        )}&v=weekly`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve(window.google);
        script.onerror = () => reject("Failed to load Google Maps API");

        document.head.appendChild(script);
      });
    }

    googleMapsPromise
      .then((google) => {
        if (mapRef.current && !map) {
          try {
            const indiaBounds = {
              north: 37.1,
              south: 6.7,
              west: 68.1,
              east: 97.4,
            };

            // Add loading event listeners
            const mapInstance = new google.maps.Map(mapRef.current, {
              center: { lat: 22.5, lng: 78.9 },
              zoom: 5,
              mapTypeId: "hybrid",
              restriction: {
                latLngBounds: indiaBounds,
                strictBounds: true,
              },
              ...mapOptions,
            });

            // Optional: India rectangle boundary (transparent)
            new google.maps.Rectangle({
              bounds: indiaBounds,
              map: mapInstance,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "transparent",
              fillOpacity: 0.05,
            });

            // Listen for the map's idle event to confirm it's fully loaded
            google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
              setLoaded(true);
              console.log('Google Map fully loaded');
            });

            // Listen for map errors
            google.maps.event.addListener(mapInstance, 'error', (e) => {
              console.error('Google Maps error:', e);
              setError(`Map rendering error: ${e.error}`);
            });

            setMap(mapInstance);
          } catch (err) {
            console.error('Error initializing map:', err);
            setError(`Failed to initialize map: ${err.message}`);
          }
        } else {
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Google Maps API loading error:', err);
        setError(`Failed to load Google Maps API: ${err.message || 'Unknown error'}`);
      });
  }, [apiKey, libraries, mapOptions]);

  return { mapRef, map, loaded, error };
}
