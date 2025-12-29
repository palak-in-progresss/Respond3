/**
 * Demo/Mock DigiLocker for testing without API credentials
 * This allows you to test the flow during development or hackathon demos
 */

import { DigiLockerProfile } from './api';

const MOCK_DIGILOCKER_PROFILE: DigiLockerProfile = {
    name: 'Rajesh Kumar Sharma',
    dob: '15/08/1995',
    gender: 'M',
    email: 'rajesh.sharma@example.com',
    mobile: '+91 98765 43210',
    aadhaar: {
        uid: 'XXXX-XXXX-4567', // Masked Aadhaar
        name: 'Rajesh Kumar Sharma',
        dob: '15/08/1995',
        gender: 'M',
        address: {
            house: 'H.No. 123',
            street: 'MG Road',
            landmark: 'Near City Hospital',
            locality: 'Gandhi Nagar',
            vtc: 'Mumbai',
            district: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
        },
        photo: '', // Base64 photo would go here
    },
};

/**
 * Simulate DigiLocker OAuth login flow (Mock)
 */
export function mockDigiLockerLogin(): Promise<DigiLockerProfile> {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            console.log('[DEMO MODE] Mock DigiLocker login successful');
            resolve(MOCK_DIGILOCKER_PROFILE);
        }, 1500);
    });
}

/**
 * Store mock DigiLocker session
 */
export function saveMockDigiLockerSession(): void {
    const session = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token',
        expiresAt: Date.now() + (3600 * 1000), // 1 hour
        profile: MOCK_DIGILOCKER_PROFILE,
    };
    localStorage.setItem('digilocker_session', JSON.stringify(session));
    console.log('[DEMO MODE] Mock session saved');
}

/**
 * Check if demo mode is enabled
 */
export function isDemoModeEnabled(): boolean {
    return localStorage.getItem('digilocker_demo_mode') === 'true';
}

/**
 * Enable demo mode
 */
export function enableDemoMode(): void {
    localStorage.setItem('digilocker_demo_mode', 'true');
    console.log('[DEMO MODE] DigiLocker demo mode enabled');
}

/**
 * Disable demo mode
 */
export function disableDemoMode(): void {
    localStorage.removeItem('digilocker_demo_mode');
    localStorage.removeItem('digilocker_session');
    console.log('[DEMO MODE] DigiLocker demo mode disabled');
}

/**
 * Custom mock profiles for different scenarios
 */
export const MOCK_PROFILES = {
    VOLUNTEER_MEDICAL: {
        ...MOCK_DIGILOCKER_PROFILE,
        name: 'Dr. Priya Patel',
        aadhaar: {
            ...MOCK_DIGILOCKER_PROFILE.aadhaar!,
            name: 'Dr. Priya Patel',
            address: {
                ...MOCK_DIGILOCKER_PROFILE.aadhaar!.address,
                locality: 'Medical College Area',
                vtc: 'Pune',
                district: 'Pune',
                state: 'Maharashtra',
                pincode: '411001',
            },
        },
    },
    VOLUNTEER_DRIVER: {
        ...MOCK_DIGILOCKER_PROFILE,
        name: 'Amit Singh',
        aadhaar: {
            ...MOCK_DIGILOCKER_PROFILE.aadhaar!,
            name: 'Amit Singh',
            address: {
                ...MOCK_DIGILOCKER_PROFILE.aadhaar!.address,
                locality: 'Transport Nagar',
                vtc: 'Delhi',
                district: 'New Delhi',
                state: 'Delhi',
                pincode: '110001',
            },
        },
    },
};

export default {
    mockDigiLockerLogin,
    saveMockDigiLockerSession,
    isDemoModeEnabled,
    enableDemoMode,
    disableDemoMode,
    MOCK_PROFILES,
};
