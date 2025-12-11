/**
 * API utility for making requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

if (import.meta.env.PROD && API_URL.includes('localhost')) {
    console.warn(
        'WARNING: You are running in production mode but using localhost as the API URL.\n' +
        'Make sure you have set the VITE_API_URL environment variable in your deployment settings (e.g., Vercel).\n' +
        'Current API_URL:', API_URL
    );
}

// DEBUG: Log environment diagnostic info
const debugInfo = [
    '--- ENV DIAGNOSTICS ---',
    'Mode: ' + import.meta.env.MODE,
    'Prod: ' + import.meta.env.PROD,
    'VITE_API_URL: ' + import.meta.env.VITE_API_URL,
    'Resolved API_URL: ' + API_URL,
].join('\n');

console.log(debugInfo);

// Temporary: Alert so you can't miss it
if (import.meta.env.PROD) {
    alert(debugInfo);
}

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., '/api/users')
 * @returns Full URL to the API endpoint
 */
export function getApiUrl(endpoint: string): string {
    // If no API_URL is set, return the endpoint as-is (for backward compatibility)
    if (!API_URL) {
        return endpoint;
    }

    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_URL}/${cleanEndpoint}`;
}

/**
 * Make an API request with credentials
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function apiRequest(endpoint: string, options?: RequestInit): Promise<Response> {
    const url = getApiUrl(endpoint);
    return fetch(url, {
        ...options,
        credentials: 'include', // Important for cookies/sessions
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
}
