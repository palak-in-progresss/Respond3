import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    Phone,
    Mail,
    MapPin,
    ArrowLeft,
    Eye,
    AlertTriangle,
    Calendar,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Volunteer = Database['public']['Tables']['volunteers']['Row'];

interface AdminVerificationPanelProps {
    onBack: () => void;
}

export function AdminVerificationPanel({ onBack }: AdminVerificationPanelProps) {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

    useEffect(() => {
        loadVolunteers();
    }, [filter]);

    async function loadVolunteers() {
        setLoading(true);
        try {
            let query = supabase
                .from('volunteers')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('verification_status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setVolunteers(data || []);
        } catch (error) {
            console.error('Error loading volunteers:', error);
            alert('Error loading volunteers');
        } finally {
            setLoading(false);
        }
    }

    async function updateVerificationStatus(volunteerId: string, status: 'verified' | 'rejected') {
        try {
            const { error } = await supabase
                .from('volunteers')
                .update({ verification_status: status })
                .eq('id', volunteerId);

            if (error) throw error;

            alert(`Volunteer ${status === 'verified' ? 'approved' : 'rejected'} successfully!`);
            loadVolunteers();
            setSelectedVolunteer(null);
        } catch (error) {
            console.error('Error updating verification:', error);
            alert('Error updating status. Please try again.');
        }
    }

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            verified: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        };

        const { color, icon: Icon } = config[status as keyof typeof config] || config.pending;

        return (
            <Badge variant="outline" className={`${color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getInitials = (name: string) => {
        if (!name) return 'V';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h2 className="text-xl font-semibold">Volunteer Verification</h2>
                                <p className="text-sm text-gray-600">Review and approve volunteer applications</p>
                            </div>
                        </div>

                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Shield className="w-4 h-4 mr-1" />
                            Admin Panel
                        </Badge>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? 'default' : 'outline'}
                            onClick={() => setFilter(status)}
                            className={filter === status ? 'bg-[#1E3A8A]' : ''}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <Badge variant="secondary" className="ml-2">
                                {volunteers.filter((v) => status === 'all' || v.verification_status === status).length}
                            </Badge>
                        </Button>
                    ))}
                </div>

                {/* Volunteers List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading volunteers...</p>
                    </div>
                ) : volunteers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No volunteers found in this category</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {volunteers.map((volunteer) => (
                            <div
                                key={volunteer.id}
                                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <Avatar className="w-16 h-16">
                                            <AvatarFallback className="bg-[#1E3A8A] text-white text-lg">
                                                {getInitials(volunteer.full_name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{volunteer.full_name}</h3>
                                                {getStatusBadge(volunteer.verification_status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    {volunteer.email || 'No email'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    {volunteer.phone || 'No phone'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {volunteer.location || 'No location'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Applied: {new Date(volunteer.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {volunteer.skills?.map((skill) => (
                                                    <Badge key={skill} variant="outline" className="bg-blue-50 text-blue-700">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-gray-600">
                                                    <strong>{volunteer.tasks_completed || 0}</strong> tasks completed
                                                </span>
                                                <span className="text-gray-600">
                                                    <strong>{volunteer.rating?.toFixed(1) || '0.0'}</strong> rating
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedVolunteer(volunteer)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>

                                        {volunteer.verification_status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => updateVerificationStatus(volunteer.id, 'verified')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => updateVerificationStatus(volunteer.id, 'rejected')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedVolunteer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Volunteer Details</h3>
                            <Button variant="ghost" onClick={() => setSelectedVolunteer(null)}>
                                <XCircle className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Full Name</label>
                                <p className="text-lg">{selectedVolunteer.full_name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p>{selectedVolunteer.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Phone</label>
                                    <p>{selectedVolunteer.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Location</label>
                                <p>{selectedVolunteer.location || 'Not provided'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Skills</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedVolunteer.skills?.map((skill) => (
                                        <Badge key={skill} variant="outline">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Availability Status</label>
                                <p className="capitalize">{selectedVolunteer.availability_status}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Verification Status</label>
                                <div className="mt-1">{getStatusBadge(selectedVolunteer.verification_status)}</div>
                            </div>

                            {selectedVolunteer.verification_status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => updateVerificationStatus(selectedVolunteer.id, 'verified')}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Volunteer
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant="destructive"
                                        onClick={() => updateVerificationStatus(selectedVolunteer.id, 'rejected')}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Application
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
