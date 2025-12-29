import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    exchangeCodeForToken,
    fetchDigiLockerProfile,
    fetchAadhaarDetails,
    saveDigiLockerSession,
    verifyState
} from '../../lib/digilocker/api';
import { createVolunteer } from '../../lib/api/volunteers';

export function DigiLockerCallback() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing DigiLocker authentication...');

    useEffect(() => {
        handleCallback();
    }, []);

    async function handleCallback() {
        try {
            // Get code and state from URL
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const state = params.get('state');
            const error = params.get('error');

            // Check for errors
            if (error) {
                setStatus('error');
                setMessage(`DigiLocker authentication failed: ${error}`);
                return;
            }

            // Verify we have code and state
            if (!code || !state) {
                setStatus('error');
                setMessage('Invalid callback parameters');
                return;
            }

            // Verify state to prevent CSRF attacks
            if (!verifyState(state)) {
                setStatus('error');
                setMessage('Invalid state parameter. Please try again.');
                return;
            }

            setMessage('Exchanging authorization code...');

            // Exchange code for access token
            const tokenResponse = await exchangeCodeForToken(code);
            if (!tokenResponse) {
                setStatus('error');
                setMessage('Failed to obtain access token');
                return;
            }

            setMessage('Fetching your profile from DigiLocker...');

            // Fetch user profile
            const profile = await fetchDigiLockerProfile(tokenResponse.access_token);
            if (!profile) {
                setStatus('error');
                setMessage('Failed to fetch profile');
                return;
            }

            setMessage('Fetching Aadhaar details...');

            // Fetch Aadhaar details
            const aadhaar = await fetchAadhaarDetails(tokenResponse.access_token);
            if (aadhaar) {
                profile.aadhaar = aadhaar;
            }

            setMessage('Creating your volunteer profile...');

            // Create or update volunteer in Supabase
            const volunteer = await createVolunteer({
                full_name: profile.aadhaar?.name || profile.name,
                email: profile.email || '',
                phone: profile.mobile || '',
                date_of_birth: profile.aadhaar?.dob || profile.dob,
                gender: profile.aadhaar?.gender || profile.gender,
                location: profile.aadhaar ? {
                    city: profile.aadhaar.address.vtc,
                    state: profile.aadhaar.address.state,
                    pincode: profile.aadhaar.address.pincode,
                } : undefined,
                digilocker_id: profile.aadhaar?.uid || '', // Use Aadhaar UID as unique identifier
                photo_url: profile.aadhaar?.photo || profile.photo,
                verification_status: 'verified', // Auto-verified via DigiLocker
                verification_documents: ['DigiLocker Aadhaar'],
                skills: [], // Will be filled in onboarding
                availability: {
                    weekdays: true,
                    weekends: true,
                    timeSlots: ['morning', 'afternoon', 'evening'],
                },
                emergency_contact: {
                    name: '',
                    phone: '',
                    relationship: '',
                },
            });

            if (!volunteer) {
                setStatus('error');
                setMessage('Failed to create volunteer profile');
                return;
            }

            // Save session
            saveDigiLockerSession(tokenResponse, profile);

            // Save volunteer ID to localStorage
            localStorage.setItem('volunteerId', volunteer.id);

            setStatus('success');
            setMessage('Authentication successful! Redirecting...');

            // Redirect to volunteer dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = '/volunteer-dashboard';
            }, 2000);

        } catch (error) {
            console.error('DigiLocker callback error:', error);
            setStatus('error');
            setMessage('An unexpected error occurred. Please try again.');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                    {status === 'loading' && (
                        <>
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1E3A8A] mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold mb-2">Processing...</h2>
                            <p className="text-gray-600">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
                            <p className="text-gray-600">{message}</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
                            <p className="text-gray-600 mb-4">{message}</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-[#1E3A8A] text-white px-6 py-2 rounded-lg hover:bg-[#1E40AF]"
                            >
                                Return to Home
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
