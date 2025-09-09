// src/config.js
const config = {
  useTempAdmin: true, // 👈 development mode (set false in production)
  apiBaseUrl: "/api" // 👈 replace with your backend URL in production
};

export default config;

// Set config.useTempAdmin = false

// Point config.apiBaseUrl to your backend

// Expose a /login and (optionally) /validate-token endpoint on your backend
