/**
 * API utility for making requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || ''; // Default to relative path for proxy support

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
    const method = options?.method || 'GET';
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    // Check if the response is HTML (likely a 404/fallback serving index.html)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        throw new Error("API not available (received HTML response)");
    }

    return response;
}
