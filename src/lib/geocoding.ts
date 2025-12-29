/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Converts addresses to coordinates and vice versa
 */

export interface GeocodingResult {
    latitude: number;
    longitude: number;
    displayName: string;
    address: {
        city?: string;
        state?: string;
        country?: string;
        countryCode?: string;
    };
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Add delay to respect Nominatim usage policy (1 request per second)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let lastRequestTime = 0;

async function throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < 1000) {
        await delay(1000 - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();
}

/**
 * Geocode: Convert address string to coordinates
 * @param address - Human-readable address (e.g., "Mumbai, India")
 * @returns Coordinates and detailed address info
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!address || address.trim().length < 3) {
        return null;
    }

    try {
        await throttleRequest();

        const params = new URLSearchParams({
            q: address,
            format: 'json',
            limit: '1',
            addressdetails: '1',
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
            headers: {
                'User-Agent': 'RESPOND Emergency App/1.0', // Required by Nominatim
            },
        });

        if (!response.ok) {
            console.error('Geocoding failed:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            console.warn('No geocoding results for:', address);
            return null;
        }

        const result = data[0];

        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            displayName: result.display_name,
            address: {
                city: result.address?.city || result.address?.town || result.address?.village,
                state: result.address?.state,
                country: result.address?.country,
                countryCode: result.address?.country_code,
            },
        };
    } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
    }
}

/**
 * Reverse Geocode: Convert coordinates to address
 * @param latitude 
 * @param longitude 
 * @returns Human-readable address
 */
export async function reverseGeocode(
    latitude: number,
    longitude: number
): Promise<GeocodingResult | null> {
    try {
        await throttleRequest();

        const params = new URLSearchParams({
            lat: latitude.toString(),
            lon: longitude.toString(),
            format: 'json',
            addressdetails: '1',
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
            headers: {
                'User-Agent': 'RESPOND Emergency App/1.0',
            },
        });

        if (!response.ok) {
            console.error('Reverse geocoding failed:', response.statusText);
            return null;
        }

        const result = await response.json();

        if (!result || result.error) {
            console.warn('No reverse geocoding results for:', latitude, longitude);
            return null;
        }

        return {
            latitude,
            longitude,
            displayName: result.display_name,
            address: {
                city: result.address?.city || result.address?.town || result.address?.village,
                state: result.address?.state,
                country: result.address?.country,
                countryCode: result.address?.country_code,
            },
        };
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
}

/**
 * Get current location using browser's Geolocation API
 * @returns Current coordinates
 */
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported by browser');
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Error getting current location:', error);
                resolve(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 300000, // 5 minutes cache
            }
        );
    });
}
