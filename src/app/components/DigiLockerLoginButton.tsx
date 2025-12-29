import { Shield, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { initiateDigiLockerLogin, isDigiLockerAuthenticated } from '../../lib/digilocker/api';
import { isDigiLockerConfigured } from '../../lib/digilocker/config';

interface DigiLockerLoginButtonProps {
    onSuccess?: () => void;
    variant?: 'default' | 'outline';
    className?: string;
}

export function DigiLockerLoginButton({
    onSuccess,
    variant = 'default',
    className = ''
}: DigiLockerLoginButtonProps) {
    const isConfigured = isDigiLockerConfigured();
    const isAuthenticated = isDigiLockerAuthenticated();

    const handleLogin = () => {
        if (!isConfigured) {
            alert('DigiLocker is not configured. Please add your DigiLocker API credentials to environment variables.');
            return;
        }

        if (isAuthenticated) {
            onSuccess?.();
            return;
        }

        initiateDigiLockerLogin();
    };

    if (!isConfigured) {
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

    return (
        <Button
            onClick={handleLogin}
            variant={variant}
            className={`w-full ${className}`}
        >
            <Shield className="w-5 h-5 mr-2" />
            {isAuthenticated ? (
                <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verified with DigiLocker
                </>
            ) : (
                'Login with DigiLocker'
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
