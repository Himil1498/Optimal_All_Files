/**
 * Region name normalization and mapping utilities
 */

// List of all Indian states and UTs in camelCase format (internal storage format)
export const REGION_KEYS = [
  "AndhraPradesh",
  "ArunachalPradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "HimachalPradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "MadhyaPradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "TamilNadu",
  "Telangana",
  "Tripura",
  "UttarPradesh",
  "Uttarakhand",
  "WestBengal",
  "AndamanAndNicobarIslands",
  "Chandigarh",
  "DadraAndNagarHaveliAndDamanAndDiu",
  "Delhi",
  "JammuAndKashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
].sort();

// Map of region keys to display names
const REGION_DISPLAY_NAMES = {
  // States
  AndhraPradesh: "Andhra Pradesh",
  ArunachalPradesh: "Arunachal Pradesh",
  Assam: "Assam",
  Bihar: "Bihar",
  Chhattisgarh: "Chhattisgarh",
  Goa: "Goa",
  Gujarat: "Gujarat",
  Haryana: "Haryana",
  HimachalPradesh: "Himachal Pradesh",
  Jharkhand: "Jharkhand",
  Karnataka: "Karnataka",
  Kerala: "Kerala",
  MadhyaPradesh: "Madhya Pradesh",
  Maharashtra: "Maharashtra",
  Manipur: "Manipur",
  Meghalaya: "Meghalaya",
  Mizoram: "Mizoram",
  Nagaland: "Nagaland",
  Odisha: "Odisha",
  Punjab: "Punjab",
  Rajasthan: "Rajasthan",
  Sikkim: "Sikkim",
  TamilNadu: "Tamil Nadu",
  Telangana: "Telangana",
  Tripura: "Tripura",
  UttarPradesh: "Uttar Pradesh",
  Uttarakhand: "Uttarakhand",
  WestBengal: "West Bengal",

  // Union Territories
  AndamanAndNicobarIslands: "Andaman & Nicobar",
  Chandigarh: "Chandigarh",
  DadraAndNagarHaveliAndDamanAndDiu: "Dadra & Nagar Haveli and Daman & Diu",
  Delhi: "Delhi",
  JammuAndKashmir: "Jammu & Kashmir",
  Ladakh: "Ladakh",
  Lakshadweep: "Lakshadweep",
  Puducherry: "Puducherry",

  // Special case for full India access
  Bharat: "Bharat (All India)",
};

// Reverse mapping for display name to key
const DISPLAY_NAME_TO_KEY = Object.entries(REGION_DISPLAY_NAMES).reduce(
  (acc, [key, value]) => {
    acc[value.toLowerCase()] = key;
    return acc;
  },
  {}
);

/**
 * Convert a region key to its display name
 * @param {string} key - The region key (e.g., 'UttarPradesh')
 * @returns {string} The display name (e.g., 'Uttar Pradesh')
 */
export const toDisplayName = (key) => {
  if (!key) return "";
  return REGION_DISPLAY_NAMES[key] || key;
};

/**
 * Convert a display name to its region key
 * @param {string} displayName - The display name (e.g., 'Uttar Pradesh')
 * @returns {string} The region key (e.g., 'UttarPradesh')
 */
export const toRegionKey = (displayName) => {
  if (!displayName) return "";
  return DISPLAY_NAME_TO_KEY[displayName.toLowerCase()] || displayName;
};

/**
 * Normalize a region name to match GeoJSON properties
 * @param {string} value - The region name to normalize
 * @returns {string} The normalized region name
 */
export const normalizeForMap = (value) => {
  if (!value) return null;

  // Handle special cases and common variations
  const specialCases = {
    // State variations
    andhrapradesh: "Andhra Pradesh",
    arunachalpradesh: "Arunachal Pradesh",
    himachalpradesh: "Himachal Pradesh",
    madhyapradesh: "Madhya Pradesh",
    uttarpradesh: "Uttar Pradesh",
    westbengal: "West Bengal",
    tamilnadu: "Tamil Nadu",
    jammukashmir: "Jammu & Kashmir",
    andamannicobar: "Andaman & Nicobar",
    andamannicobarislands: "Andaman & Nicobar",
    dadraandnagarhavelianddamananddiu: "Dadra & Nagar Haveli and Daman & Diu",
    dadraandnagarhaveli: "Dadra & Nagar Haveli and Daman & Diu",
    damananddiu: "Dadra & Nagar Haveli and Daman & Diu",
    puducherry: "Puducherry",
    pondicherry: "Puducherry",
    delhi: "Delhi",
    nctofdelhi: "Delhi",
    newdelhi: "Delhi",
    bharat: "Bharat",
    india: "Bharat",
  };

  const lowerValue = value.toString().toLowerCase().trim();

  // Check special cases first
  if (specialCases[lowerValue]) {
    return specialCases[lowerValue];
  }

  // Try direct match with display names
  const displayMatch = Object.entries(REGION_DISPLAY_NAMES).find(
    ([, displayName]) => displayName.toLowerCase() === lowerValue
  );
  if (displayMatch) {
    return displayMatch[1];
  }

  // Try converting from camelCase to display name
  const fromCamelCase = toDisplayName(value);
  if (fromCamelCase && fromCamelCase !== value) {
    return fromCamelCase;
  }

  // Try to convert from display name to key and back to handle case variations
  const fromDisplayName = toDisplayName(toRegionKey(value));
  if (fromDisplayName && fromDisplayName !== value) {
    return fromDisplayName;
  }

  // Fallback: convert to title case and hope for the best
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

/**
 * Get all region display names
 * @returns {string[]} Sorted array of display names
 */
export const getAllDisplayNames = () => {
  return Object.values(REGION_DISPLAY_NAMES).sort();
};

/**
 * Get all region keys
 * @returns {string[]} Sorted array of region keys
 */
export const getAllRegionKeys = () => {
  return [...REGION_KEYS, "Bharat"].sort();
};

/**
 * Check if a region is valid
 * @param {string} region - The region to check
 * @returns {boolean} True if the region is valid
 */
export const isValidRegion = (region) => {
  if (!region) return false;
  const normalized = normalizeForMap(region);
  return (
    Object.values(REGION_DISPLAY_NAMES).includes(normalized) ||
    normalized === "Bharat"
  );
};

/**
 * Normalize a list of regions
 * @param {string[]} regions - Array of region names/keys
 * @returns {string[]} Array of normalized region names
 */
export const normalizeRegionList = (regions = []) => {
  if (!Array.isArray(regions)) return [];

  return regions
    .map((region) => normalizeForMap(region))
    .filter(Boolean) // Remove any null/undefined values
    .filter((region, index, self) => self.indexOf(region) === index); // Remove duplicates
};
