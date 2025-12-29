import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import {
  Bell,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  TrendingUp,
  Plus,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';
import { getRequests } from '../../lib/api/requests';
import { getVerifiedVolunteers } from '../../lib/api/volunteers';
import { matchVolunteersToRequest, type MatchScore } from '../../lib/matching/matcher';
import { createAssignment } from '../../lib/api/assignments';
import { CreateRequestModal } from './CreateRequestModal';
import { RequestDetailView } from './RequestDetailView';
import type { Database } from '../../types/database';

type Request = Database['public']['Tables']['requests']['Row'];

interface RequesterDashboardProps {
  onBack: () => void;
  onNavigateToLiveTracking?: () => void;
  organizationName?: string;
  organizationId?: string;
}

export function RequesterDashboard({
  onBack,
  onNavigateToLiveTracking,
  organizationName = 'Emergency Response Organization',
  organizationId = 'org_default'
}: RequesterDashboardProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedVolunteers, setMatchedVolunteers] = useState<Map<string, MatchScore[]>>(new Map());
  const [selectedVolunteers, setSelectedVolunteers] = useState<Map<string, Set<string>>>(new Map());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const reqs = await getRequests({ status: 'open' });
      setRequests(reqs);

      // For each request, run matching algorithm
      const volunteers = await getVerifiedVolunteers();
      const matches = new Map<string, MatchScore[]>();
      reqs.forEach(req => {
        const topMatches = matchVolunteersToRequest(volunteers, req).slice(0, 10);
        matches.set(req.id, topMatches);
      });
      setMatchedVolunteers(matches);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignVolunteers(requestId: string) {
    const volunteerIds = selectedVolunteers.get(requestId);
    if (!volunteerIds || volunteerIds.size === 0) {
      alert('Please select at least one volunteer');
      return;
    }

    try {
      const assignments = await Promise.all(
        Array.from(volunteerIds).map(volunteerId =>
          createAssignment({
            request_id: requestId,
            volunteer_id: volunteerId,
            status: 'pending'
          })
        )
      );

      if (assignments.every(a => a !== null)) {
        alert(`Successfully assigned ${assignments.length} volunteer${assignments.length !== 1 ? 's' : ''}!`);
        // Clear selection
        const newSelection = new Map(selectedVolunteers);
        newSelection.delete(requestId);
        setSelectedVolunteers(newSelection);
        loadData(); // Refresh to show updated counts
      }
    } catch (error) {
      console.error('Error assigning volunteers:', error);
      alert('Error assigning volunteers');
    }
  }

  function toggleVolunteerSelection(requestId: string, volunteerId: string) {
    const newSelection = new Map(selectedVolunteers);
    const currentSet = newSelection.get(requestId) || new Set<string>();

    if (currentSet.has(volunteerId)) {
      currentSet.delete(volunteerId);
    } else {
      currentSet.add(volunteerId);
    }

    newSelection.set(requestId, currentSet);
    setSelectedVolunteers(newSelection);
  }

  function getUrgencyColor(urgency: string) {
    switch (urgency) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2>Requester Dashboard</h2>
              <p className="text-sm text-gray-600">{organizationName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              className="bg-[#F59E0B] hover:bg-[#D97706]"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Request
            </Button>
            {onNavigateToLiveTracking && (
              <Button
                variant="outline"
                onClick={onNavigateToLiveTracking}
              >
                View Live Tracking
              </Button>
            )}
            <Button variant="ghost" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-[#1E3A8A] text-white">KS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <Clock className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="text-3xl mb-1">4 min</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>12% faster</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Match Rate</span>
              <CheckCircle className="w-5 h-5 text-[#1E3A8A]" />
            </div>
            <div className="text-3xl mb-1">87%</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>5% increase</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active Volunteers</span>
              <Users className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="text-3xl mb-1">142</div>
            <div className="text-sm text-gray-600">Across 8 requests</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Open Requests</span>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                3
              </div>
            </div>
            <div className="text-3xl mb-1">3</div>
            <div className="text-sm text-gray-600">2 high priority</div>
          </div>
        </div>

        {/* Open Requests Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3>Open Requests ({requests.length})</h3>
            <Button variant="outline" size="sm">View History</Button>
          </div>

          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <p className="text-gray-500">No open requests at the moment</p>
              </div>
            ) : (
              requests.map((request) => {
                const matches = matchedVolunteers.get(request.id) || [];
                const selectedCount = selectedVolunteers.get(request.id)?.size || 0;

                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4>{request.title}</h4>
                          <Badge className={`${getUrgencyColor(request.urgency)} border-0`}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Posted {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {request.skills_needed.map((skill) => (
                        <Badge key={skill} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Volunteer Progress</span>
                        <span>
                          {request.volunteers_assigned}/{request.volunteers_needed} assigned
                        </span>
                      </div>
                      <Progress
                        value={(request.volunteers_assigned / request.volunteers_needed) * 100}
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{matches.length} matched</span>
                        <span>{request.volunteers_needed - request.volunteers_assigned} still needed</span>
                      </div>
                    </div>

                    {/* Matched Volunteers */}
                    <div className="mb-4">
                      <h5 className="text-sm mb-3">Matched Volunteers ({matches.length})</h5>
                      {matches.length === 0 ? (
                        <p className="text-sm text-gray-500">No matched volunteers yet</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {matches.slice(0, 6).map((match) => {
                            const isSelected = selectedVolunteers.get(request.id)?.has(match.volunteer.id) || false;
                            return (
                              <div
                                key={match.volunteer.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                  }`}
                                onClick={() => toggleVolunteerSelection(request.id, match.volunteer.id)}
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-[#1E3A8A] text-white text-sm">
                                    {match.volunteer.full_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm truncate">{match.volunteer.full_name}</span>
                                    {match.volunteer.verification_status === 'verified' && (
                                      <CheckCircle className="w-3 h-3 text-[#10B981] flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 truncate">
                                    {match.volunteer.skills.slice(0, 2).join(', ')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ★ {match.volunteer.rating.toFixed(1)} • Score: {match.score}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        className="bg-[#10B981] hover:bg-[#059669]"
                        onClick={() => handleAssignVolunteers(request.id)}
                        disabled={selectedCount === 0}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Assign {selectedCount > 0 ? `${selectedCount} ` : ''}Volunteer{selectedCount !== 1 ? 's' : ''}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailView(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button variant="outline">Message All</Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Request Modal */}
      <CreateRequestModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => loadData()}
        organizationId={organizationId}
        organizationName={organizationName}
      />

      {/* Request Detail View */}
      {showDetailView && selectedRequest && (
        <RequestDetailView
          onClose={() => {
            setShowDetailView(false);
            setSelectedRequest(null);
          }}
          onAccept={() => {
            // This would be used if viewing as a volunteer
            setShowDetailView(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}
