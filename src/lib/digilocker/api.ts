import { DIGILOCKER_CONFIG, generateState, saveState, verifyState } from './config';

// DigiLocker user profile interface
export interface DigiLockerProfile {
    name: string;
    dob: string;
    gender: string;
    photo?: string;
    aadhaar?: {
        uid: string; // Masked Aadhaar number
        name: string;
        dob: string;
        gender: string;
        address: {
            house: string;
            street: string;
            landmark: string;
            locality: string;
            vtc: string;
            district: string;
            state: string;
            pincode: string;
        };
        photo: string;
    };
    email?: string;
    mobile?: string;
}

// DigiLocker document interface
export interface DigiLockerDocument {
    uri: string;
    docType: string;
    name: string;
    size: number;
    date: string;
    issuer: string;
}

// OAuth token response
interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

/**
 * Initiate DigiLocker OAuth login flow
 */
export function initiateDigiLockerLogin(): void {
    const state = generateState();
    saveState(state);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: DIGILOCKER_CONFIG.clientId,
        redirect_uri: DIGILOCKER_CONFIG.redirectUri,
        state: state,
        scope: DIGILOCKER_CONFIG.scopes,
    });

    const authUrl = `${DIGILOCKER_CONFIG.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse | null> {
    try {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: DIGILOCKER_CONFIG.clientId,
            client_secret: DIGILOCKER_CONFIG.clientSecret,
            redirect_uri: DIGILOCKER_CONFIG.redirectUri,
        });

        const response = await fetch(DIGILOCKER_CONFIG.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            console.error('Token exchange failed:', await response.text());
            return null;
        }

        const data: TokenResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        return null;
    }
}

/**
 * Fetch user profile from DigiLocker
 */
export async function fetchDigiLockerProfile(accessToken: string): Promise<DigiLockerProfile | null> {
    try {
        const response = await fetch(`${DIGILOCKER_CONFIG.apiBaseUrl}/user`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Profile fetch failed:', await response.text());
            return null;
        }

        const profile: DigiLockerProfile = await response.json();
        return profile;
    } catch (error) {
        console.error('Error fetching DigiLocker profile:', error);
        return null;
    }
}

/**
 * Fetch Aadhaar details from DigiLocker
 */
export async function fetchAadhaarDetails(accessToken: string): Promise<DigiLockerProfile['aadhaar'] | null> {
    try {
        const response = await fetch(`${DIGILOCKER_CONFIG.apiBaseUrl}/aadhaar`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Aadhaar fetch failed:', await response.text());
            return null;
        }

        const aadhaar = await response.json();
        return aadhaar;
    } catch (error) {
        console.error('Error fetching Aadhaar details:', error);
        return null;
    }
}

/**
 * List documents in user's DigiLocker
 */
export async function listDigiLockerDocuments(accessToken: string): Promise<DigiLockerDocument[]> {
    try {
        const response = await fetch(`${DIGILOCKER_CONFIG.apiBaseUrl}/issued`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Documents list failed:', await response.text());
            return [];
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error listing documents:', error);
        return [];
    }
}

/**
 * Download a specific document
 */
export async function downloadDocument(accessToken: string, uri: string): Promise<Blob | null> {
    try {
        const response = await fetch(`${DIGILOCKER_CONFIG.apiBaseUrl}/file/${uri}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error('Document download failed:', await response.text());
            return null;
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Error downloading document:', error);
        return null;
    }
}

/**
 * Store DigiLocker session in localStorage
 */
export function saveDigiLockerSession(token: TokenResponse, profile: DigiLockerProfile): void {
    const session = {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: Date.now() + (token.expires_in * 1000),
        profile: profile,
    };
    localStorage.setItem('digilocker_session', JSON.stringify(session));
}

/**
 * Get DigiLocker session from localStorage
 */
export function getDigiLockerSession(): { accessToken: string; profile: DigiLockerProfile } | null {
    const sessionStr = localStorage.getItem('digilocker_session');
    if (!sessionStr) return null;

    try {
        const session = JSON.parse(sessionStr);

        // Check if token is expired
        if (Date.now() >= session.expiresAt) {
            clearDigiLockerSession();
            return null;
        }

        return {
            accessToken: session.accessToken,
            profile: session.profile,
        };
    } catch (error) {
        console.error('Error parsing DigiLocker session:', error);
        return null;
    }
}

/**
 * Clear DigiLocker session
 */
export function clearDigiLockerSession(): void {
    localStorage.removeItem('digilocker_session');
}

/**
 * Check if user is authenticated with DigiLocker
 */
export function isDigiLockerAuthenticated(): boolean {
    return getDigiLockerSession() !== null;
}
