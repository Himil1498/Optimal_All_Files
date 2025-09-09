import { useEffect, useRef, useState } from "react";
import {
  TextField,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ClearIcon from "@mui/icons-material/Clear";

export default function MapSearchBox({ map, onPlaceSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [markers, setMarkers] = useState([]);

  const searchBoxRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use Text Search API instead of deprecated AutocompleteService
  const searchPlaces = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      // Using Text Search (New) API
      const response = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ",
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.location,places.id,places.types"
          },
          body: JSON.stringify({
            textQuery: `${searchQuery} India`,
            regionCode: "IN",
            maxResultCount: 10
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.places && data.places.length > 0) {
        const formattedSuggestions = data.places.map((place) => ({
          id: place.id,
          displayName: place.displayName?.text || "Unknown Place",
          formattedAddress: place.formattedAddress || "",
          location: place.location,
          types: place.types || []
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Places API Error:", error);
      // Fallback to Geocoding API for basic search
      fallbackToGeocoding(searchQuery);
    }

    setIsLoading(false);
  };

  // Fallback method using Geocoding API
  const fallbackToGeocoding = (searchQuery) => {
    if (!window.google?.maps?.Geocoder) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        address: `${searchQuery}, India`,
        componentRestrictions: { country: "IN" }
      },
      (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const formattedSuggestions = results
            .slice(0, 10)
            .map((result, index) => ({
              id: result.place_id || `geocode_${index}`,
              displayName:
                result.address_components[0]?.long_name ||
                result.formatted_address.split(",")[0],
              formattedAddress: result.formatted_address,
              location: {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
              },
              types: result.types || [],
              isGeocoded: true,
              geocodeResult: result
            }));

          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search requests
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const clearMarkers = () => {
    markers.forEach((marker) => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    setMarkers([]);
  };

  const handleSelectPlace = (suggestion) => {
    if (!suggestion.location) return;

    clearMarkers();

    const lat = suggestion.location.latitude;
    const lng = suggestion.location.longitude;
    const position = { lat, lng };

    // Center map on selected location
    map.panTo(position);
    map.setZoom(15);

    // Create marker
    const marker = new window.google.maps.Marker({
      position,
      map,
      title: suggestion.displayName,
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    // Detailed InfoWindow
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
      <div style="padding:8px; max-width:280px; font-family:Arial,sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <h4 style="margin:0; font-size:14px; color:#1976d2;">${
            suggestion.displayName
          }</h4>
          <button id="close-info" style="background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer; padding:2px 6px; font-size:12px;">✖</button>
        </div>
        <p style="margin:2px 0; color:#555; font-size:12px;"><strong>Address:</strong> ${
          suggestion.formattedAddress
        }</p>
        <p style="margin:2px 0; color:#555; font-size:12px;"><strong>Coordinates:</strong> ${lat.toFixed(
          6
        )}, ${lng.toFixed(6)}</p>
        ${
          suggestion.types && suggestion.types.length > 0
            ? `<p style="margin:2px 0; color:#555; font-size:12px;"><strong>Types:</strong> ${suggestion.types
                .join(", ")
                .replace(/_/g, " ")}</p>`
            : ""
        }
        <p style="margin:2px 0; color:#555; font-size:12px;"><strong>Place ID:</strong> ${
          suggestion.id
        }</p>
        <p style="margin:2px 0; color:#555; font-size:12px;"><strong>Source:</strong> ${
          suggestion.isGeocoded ? "Geocoding API" : "Places API"
        }</p>
      </div>
    `,
      disableAutoPan: false,
      maxWidth: 280
    });

    // Hide default close button and attach custom red close button
    window.google.maps.event.addListener(infoWindow, "domready", () => {
      const iwClose = document.querySelector(".gm-ui-hover-effect");
      if (iwClose) iwClose.style.display = "none";

      const closeBtn = document.getElementById("close-info");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => infoWindow.close());
      }
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    setMarkers([marker]);

    if (onPlaceSelect) {
      onPlaceSelect({
        name: suggestion.displayName,
        address: suggestion.formattedAddress,
        location: { lat, lng },
        id: suggestion.id,
        types: suggestion.types
      });
    }

    setQuery(suggestion.displayName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    clearMarkers();
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  };

  return (
    <Box
      ref={searchBoxRef}
      sx={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "600px",
        zIndex: 1400
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for places in India..."
        value={query}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
          ),
          endAdornment: query && (
            <ClearIcon
              sx={{
                color: "text.secondary",
                cursor: "pointer",
                "&:hover": { color: "error.main" }
              }}
              onClick={handleClearSearch}
            />
          ),
          sx: {
            backgroundColor: "white",
            borderRadius: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "& fieldset": { border: "none" },
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
            },
            "&.Mui-focused": {
              boxShadow: "0 6px 20px rgba(25,118,210,0.3)"
            }
          }
        }}
      />

      {isLoading && (
        <Paper sx={{ mt: 1, p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            🔍 Searching...
          </Typography>
        </Paper>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            mt: 1,
            maxHeight: 400,
            overflowY: "auto",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
          }}
        >
          <List dense>
            {suggestions.map((suggestion) => (
              <ListItem
                button
                key={suggestion.id}
                onClick={() => handleSelectPlace(suggestion)}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(25,118,210,0.08)"
                  },
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LocationOnIcon
                    sx={{
                      color: "primary.main",
                      fontSize: 20
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "text.primary"
                      }}
                    >
                      {suggestion.displayName}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem"
                      }}
                    >
                      {suggestion.formattedAddress}
                    </Typography>
                  }
                />
                {suggestion.types &&
                  suggestion.types[0] &&
                  !suggestion.isCoordinate && (
                    <Chip
                      label={suggestion.types[0].replace(/_/g, " ")}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "0.6rem",
                        height: 20,
                        textTransform: "capitalize"
                      }}
                    />
                  )}
                {suggestion.isCoordinate && (
                  <Chip
                    label="Coordinates"
                    size="small"
                    variant="filled"
                    color="secondary"
                    sx={{
                      fontSize: "0.6rem",
                      height: 20
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {showSuggestions &&
        suggestions.length === 0 &&
        !isLoading &&
        query.length > 2 && (
          <Paper sx={{ mt: 1, p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No places found for "{query}"
            </Typography>
          </Paper>
        )}
    </Box>
  );
}
