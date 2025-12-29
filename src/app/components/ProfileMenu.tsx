/**
 * Profile dropdown menu component for Volunteer Dashboard
 * Shows verification status and quick actions
 */

import { Shield, User, LogOut, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProfileMenuProps {
    volunteerData: any;
    onLogout: () => void;
    onClose: () => void;
}

export function ProfileMenu({ volunteerData, onLogout, onClose }: ProfileMenuProps) {
    const getVerificationBadge = (status: string) => {
        const config = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending Review' },
            verified: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Verified' },
            rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Not Approved' },
        };

        const { color, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

        return (
            <Badge variant="outline" className={`${color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {label}
            </Badge>
        );
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'pending':
                return "Your application is under review. We'll notify you once verified.";
            case 'rejected':
                return 'Your application was not approved. Please contact support for details.';
            case 'verified':
                return "✓ You're verified and can accept emergency tasks!";
            default:
                return 'Verification status unknown';
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold">{volunteerData?.full_name || volunteerData?.name}</p>
                <p className="text-sm text-gray-600">{volunteerData?.email}</p>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Verification Status</span>
                    <Shield className="w-4 h-4 text-gray-400" />
                </div>
                {getVerificationBadge(volunteerData?.verification_status || 'pending')}

                <p className={`text-xs mt-2 ${volunteerData?.verification_status === 'rejected' ? 'text-red-600' :
                        volunteerData?.verification_status === 'verified' ? 'text-green-600' :
                            'text-gray-500'
                    }`}>
                    {getStatusMessage(volunteerData?.verification_status)}
                </p>
            </div>

            <button
                onClick={() => {
                    onClose();
                    // Future: navigate to profile page
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
                <User className="w-4 h-4" />
                View Profile
            </button>

            <button
                onClick={() => {
                    onClose();
                    onLogout();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </button>
        </div>
    );
}
