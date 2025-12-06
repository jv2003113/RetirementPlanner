/**
 * API utility for making requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || '';

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
