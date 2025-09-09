import { useEffect, useRef, useState } from "react";

const useGoogleMapsLazy = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Prevent duplicate script loading
    if (
      document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)
    ) {
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Load the Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${"AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ"}&libraries=places,drawing,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError(new Error("Failed to load Google Maps API"));
    };

    // Set up global callback
    window.initMap = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Clean up
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        delete window.initMap;
      }
    };
  }, [apiKey]);

  return { isLoaded, error };
};

export default useGoogleMapsLazy;
