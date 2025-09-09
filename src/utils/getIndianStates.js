import indiaGeoJSON from '../../../public/india.json';

/**
 * Extracts all unique state names from the india.json file
 * @returns {string[]} Array of unique state names
 */
export function getAllIndianStates() {
  try {
    if (!indiaGeoJSON || !Array.isArray(indiaGeoJSON.features)) {
      console.error('Invalid or empty GeoJSON data');
      return [];
    }
    
    const states = new Set();
    
    indiaGeoJSON.features.forEach(feature => {
      if (feature.properties && feature.properties.st_nm) {
        states.add(feature.properties.st_nm);
      }
    });
    
    return Array.from(states).sort();
  } catch (error) {
    console.error('Error extracting states:', error);
    return [];
  }
}

// Example usage:
// const states = getAllIndianStates();
// console.log('Indian States:', states);
