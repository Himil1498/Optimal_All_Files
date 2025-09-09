import { useState, useCallback } from "react";

export default function useSavedPolygons() {
  const [savedPolygons, setSavedPolygons] = useState(
    JSON.parse(localStorage.getItem("savedPolygons")) || []
  );
  const [deleteIndex, setDeleteIndex] = useState(null);

  const addPolygon = (name, points, area) => {
    const updated = [...savedPolygons, { name, points, area }];
    localStorage.setItem("savedPolygons", JSON.stringify(updated));
    setSavedPolygons(updated);
  };

  const deletePolygon = useCallback(
    (index) => {
      const filtered = savedPolygons.filter((_, i) => i !== index);
      localStorage.setItem("savedPolygons", JSON.stringify(filtered));
      setSavedPolygons(filtered);
    },
    [savedPolygons]
  );

  return {
    savedPolygons,
    addPolygon,
    deletePolygon,
    deleteIndex,
    setDeleteIndex
  };
}
