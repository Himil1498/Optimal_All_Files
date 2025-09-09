const fs = require('fs');
const path = require('path');

// Read the JSON file
const filePath = path.join(__dirname, 'public', 'india.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Extract all unique state names
const states = new Set();

data.features.forEach(feature => {
  if (feature.properties && feature.properties.st_nm) {
    states.add(feature.properties.st_nm);
  }
});

// Convert to array and sort
const sortedStates = Array.from(states).sort();

// Display the results
console.log('List of Indian States and Union Territories:');
console.log('======================================');
sortedStates.forEach((state, index) => {
  console.log(`${index + 1}. ${state}`);
});

console.log('\nTotal:', sortedStates.length, 'states/UTs');

// Optionally write to a file
fs.writeFileSync(
  path.join(__dirname, 'indian_states.json'),
  JSON.stringify(sortedStates, null, 2),
  'utf8'
);
