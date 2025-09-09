export const formatArea = (area) => {
  if (area >= 1e6) return `${(area / 1e6).toFixed(3)} km²`;
  if (area >= 1e4) return `${(area / 1e4).toFixed(2)} hectares`;
  return `${area.toFixed(2)} m²`;
};
