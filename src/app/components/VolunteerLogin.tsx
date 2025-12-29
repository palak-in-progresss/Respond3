import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Shield, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VolunteerLoginProps {
    onLoginSuccess: (volunteerId: string, volunteerData: any) => void;
    onBack: () => void;
}

export function VolunteerLogin({ onLoginSuccess, onBack }: VolunteerLoginProps) {
    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Search for volunteer by phone or email
            const { data: volunteers, error: searchError } = await supabase
                .from('volunteers')
                .select('*')
                .or(`phone.eq.${phoneOrEmail},email.eq.${phoneOrEmail}`)
                .limit(1);

            if (searchError) {
                console.error('Search error:', searchError);
                setError('Error searching for volunteer. Please try again.');
                setLoading(false);
                return;
            }

            if (!volunteers || volunteers.length === 0) {
                setError('No volunteer found with this phone number or email. Please complete onboarding first.');
                setLoading(false);
                return;
            }

            const volunteer = volunteers[0];

            // Save to localStorage
            localStorage.setItem('volunteerId', volunteer.id);
            localStorage.setItem('volunteerData', JSON.stringify({
                id: volunteer.id,
                name: volunteer.full_name,
                email: volunteer.email,
                phone: volunteer.phone,
                photo: volunteer.photo_url || volunteer.profile_image_url,
                verified: volunteer.verification_status === 'verified',
            }));

            // Call success callback
            onLoginSuccess(volunteer.id, volunteer);

        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
                        <p className="text-gray-600">Login to access your volunteer dashboard</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Phone Number or Email
                            </label>
                            <Input
                                type="text"
                                value={phoneOrEmail}
                                onChange={(e) => setPhoneOrEmail(e.target.value)}
                                placeholder="Enter your phone or email"
                                required
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Use the phone number or email you registered with
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !phoneOrEmail}
                            className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF]"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Login
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    {/* New Volunteer */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            className="w-full"
                        >
                            Complete Onboarding
                        </Button>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Your data is securely stored and encrypted
                    </p>
                </div>
            </div>
        </div>
    );
}
