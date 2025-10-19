// Central configuration for Vibe Mind Extension
// Update these URLs to match your deployment environment

const CONFIG = {
    // Backend API URL - Change this to your Railway/production URL
    API_BASE_URL: 'https://vibemind-production.up.railway.app/api',

    // Full API URL without /api suffix (for health checks, shutdown, etc)
    API_ROOT_URL: 'https://vibemind-production.up.railway.app',

    // Frontend app URL (if you deploy the React frontend separately)
    // FRONTEND_URL: 'http://localhost:3000',

    // For local development, uncomment these:
    // API_BASE_URL: 'http://localhost:8000/api',
    // API_ROOT_URL: 'http://localhost:8000',
    // FRONTEND_URL: 'http://localhost:3000',
};
