// DigiLocker API Configuration
// Docs: https://www.digilocker.gov.in/assets/img/digilocker_api_specifications.pdf

export const DIGILOCKER_CONFIG = {
    // DigiLocker OAuth endpoints
    authUrl: 'https://digilocker.gov.in/public/oauth2/1/authorize',
    tokenUrl: 'https://digilocker.gov.in/public/oauth2/1/token',
    apiBaseUrl: 'https://api.digilocker.gov.in/public/oauth2/1',

    // Your app credentials (you'll need to register at https://www.digilocker.gov.in/)
    clientId: import.meta.env.VITE_DIGILOCKER_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_DIGILOCKER_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_DIGILOCKER_REDIRECT_URI || `${window.location.origin}/auth/digilocker/callback`,

    // Scopes - what data we want to access
    scopes: [
        'profile',      // Basic profile info
        'aadhaar',      // Aadhaar details
        'documents',    // Access to uploaded documents
    ].join(' '),

    // Document types we can request
    documentTypes: {
        AADHAAR: 'AADHAAR',
        PAN: 'PAN',
        DRIVING_LICENSE: 'DRVLC',
        VOTER_ID: 'VOTER',
        PASSPORT: 'PASSPORT',
    },
};

// Helper to check if DigiLocker is configured
export function isDigiLockerConfigured(): boolean {
    return !!(DIGILOCKER_CONFIG.clientId && DIGILOCKER_CONFIG.clientSecret);
}

// Generate state parameter for OAuth security
export function generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

// Store state in sessionStorage for verification
export function saveState(state: string): void {
    sessionStorage.setItem('digilocker_oauth_state', state);
}

// Verify state matches
export function verifyState(state: string): boolean {
    const savedState = sessionStorage.getItem('digilocker_oauth_state');
    sessionStorage.removeItem('digilocker_oauth_state');
    return savedState === state;
}
