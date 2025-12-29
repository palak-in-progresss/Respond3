import { Shield, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { initiateDigiLockerLogin, isDigiLockerAuthenticated } from '../../lib/digilocker/api';
import { isDigiLockerConfigured } from '../../lib/digilocker/config';
import { mockDigiLockerLogin, saveMockDigiLockerSession, isDemoModeEnabled, enableDemoMode } from '../../lib/digilocker/demo';
import { useState } from 'react';

interface DigiLockerLoginButtonProps {
    onSuccess?: () => void;
    variant?: 'default' | 'outline';
    className?: string;
    allowDemoMode?: boolean; // Enable for hackathon/testing
}

export function DigiLockerLoginButton({
    onSuccess,
    variant = 'default',
    className = '',
    allowDemoMode = true // Default to true for hackathon
}: DigiLockerLoginButtonProps) {
    const isConfigured = isDigiLockerConfigured();
    const isAuthenticated = isDigiLockerAuthenticated();
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        if (isAuthenticated) {
            onSuccess?.();
            return;
        }

        if (!isConfigured && allowDemoMode) {
            handleDemoLogin();
            return;
        }

        if (!isConfigured) {
            alert('DigiLocker is not configured. Please add your DigiLocker API credentials to environment variables.');
            return;
        }

        initiateDigiLockerLogin();
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        try {
            // Enable demo mode
            enableDemoMode();

            // Simulate login
            await mockDigiLockerLogin();

            // Save mock session
            saveMockDigiLockerSession();

            alert('Demo Mode: DigiLocker verification simulated successfully!\n\nName: Rajesh Kumar Sharma\nLocation: Mumbai, Maharashtra\n\n(This is a demo for testing without API credentials)');

            onSuccess?.();
        } catch (error) {
            console.error('Demo login error:', error);
            alert('Demo login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isConfigured && !allowDemoMode) {
        return (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                    DigiLocker integration is not configured.
                    <br />
                    <span className="text-xs">Add VITE_DIGILOCKER_CLIENT_ID and VITE_DIGILOCKER_CLIENT_SECRET to your .env file</span>
                </p>
            </div>
        );
    }

    const isDemoActive = isDemoModeEnabled() && !isConfigured;

    return (
        <Button
            onClick={handleLogin}
            variant={variant}
            className={`w-full ${className}`}
            disabled={loading}
        >
            {loading ? (
                <>
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    Verifying...
                </>
            ) : isAuthenticated ? (
                <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isDemoActive ? 'Demo Verified' : 'Verified with DigiLocker'}
                </>
            ) : (
                <>
                    <Shield className="w-5 h-5 mr-2" />
                    {!isConfigured && allowDemoMode ? 'Try Demo Verification' : 'Login with DigiLocker'}
                </>
            )}
        </Button>
    );
}

// Compact version for inline use
export function DigiLockerBadge() {
    const isAuthenticated = isDigiLockerAuthenticated();

    if (!isAuthenticated) return null;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            <span>DigiLocker Verified</span>
            <CheckCircle className="w-4 h-4" />
        </div>
    );
}
