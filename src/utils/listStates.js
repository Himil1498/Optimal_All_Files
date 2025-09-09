import { getAllIndianStates } from './getIndianStates';

// Get and log all Indian states
const states = getAllIndianStates();
console.log('List of Indian States and Union Territories:');
console.log('======================================');
states.forEach((state, index) => {
  console.log(`${index + 1}. ${state}`);
});
console.log('\nTotal:', states.length, 'states/UTs');
