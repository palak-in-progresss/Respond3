import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  MapPin,
  Navigation,
  Phone,
  AlertTriangle,
  Flag,
  CheckCircle,
  X,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LiveTrackingProps {
  userType: 'volunteer' | 'requester';
  onComplete: () => void;
  onClose: () => void;
  requestId?: string | null;
}

export function LiveTracking({ userType, onComplete, onClose, requestId }: LiveTrackingProps) {
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  // Real data states
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [activeVolunteers, setActiveVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (requestId) {
      loadRealData(requestId);
    } else {
      // Fallback for demo if no ID passed (e.g. direct nav) - try to find first open request
      fetchDefaultRequest();
    }
  }, [requestId]);

  async function fetchDefaultRequest() {
    const { data } = await supabase.from('requests').select('id').eq('status', 'open').limit(1).single();
    if (data) loadRealData(data.id);
  }

  async function loadRealData(id: string) {
    setLoading(true);
    try {
      // 1. Fetch Request Details
      const { data: request } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single();

      if (request) {
        setTaskDetails({
          title: request.title,
          organization: 'Emergency Response Org',
          destination: request.location_name || 'Specified Location',
          coordinatorName: 'Mission Coordinator',
          coordinatorPhone: '+91 99999 99999',
          eta: 'Calculating...',
          status: request.status
        });
      }

      // 2. Fetch Assigned Volunteers
      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
                status,
                volunteers (
                    id,
                    full_name,
                    phone,
                    photo_url
                )
            `)
        .eq('request_id', id)
        .in('status', ['accepted', 'in_progress', 'arrived', 'completed']);

      if (assignments) {
        const mappedVolunteers = assignments.map((a: any) => ({
          id: a.volunteers.id,
          name: a.volunteers.full_name,
          photo: a.volunteers.photo_url,
          initials: (a.volunteers.full_name || 'V').substring(0, 2).toUpperCase(),
          status: a.status,
          eta: a.status === 'arrived' ? 'Arrived' : '10 min', // Mock ETA for now
          distance: a.status === 'arrived' ? '0 km' : '2.5 km' // Mock distance
        }));
        setActiveVolunteers(mappedVolunteers);
      }

    } catch (err) {
      console.error('Error loading tracking data:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'arrived':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
      case 'accepted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading || !taskDetails) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Map Area */}
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-green-100 relative">
        {/* Simulated Map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
            <p className="text-gray-600">Live Map View</p>
            <p className="text-sm text-gray-500 mt-2">
              {userType === 'volunteer'
                ? `Navigating to: ${taskDetails.destination}`
                : `Tracking ${activeVolunteers.length} volunteer(s)`}
            </p>
          </div>
        </div>

        {/* Destination Marker */}
        <div className="absolute bottom-1/3 right-1/3">
          <MapPin className="w-8 h-8 text-red-500" />
          <p className="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">
            {taskDetails.destination}
          </p>
        </div>

        {/* Dynamic Volunteer Markers */}
        {activeVolunteers.map((v, i) => (
          <div key={v.id} className="absolute" style={{ top: `${40 + (i * 10)}%`, left: `${40 + (i * 10)}%` }}>
            <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
            <p className="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">
              {v.name}
            </p>
          </div>
        ))}

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 bg-white shadow-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Top Card - Task Summary (Only for Volunteer) */}
      {userType === 'volunteer' && (
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 max-w-md mx-auto border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold">{taskDetails.title}</h4>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                In Progress
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{taskDetails.organization}</p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span>ETA: {taskDetails.eta}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#1E3A8A]"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet */}
      <div
        className={`bg-white border-t border-gray-200 transition-all duration-300 ${bottomSheetExpanded ? 'h-2/3' : 'h-auto'
          }`}
      >
        {/* Handle */}
        <button
          onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
          className="w-full py-2 flex justify-center hover:bg-gray-50 bg-white"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </button>

        <div className={`px-6 pb-6 bg-white ${bottomSheetExpanded ? 'overflow-y-auto h-full' : ''}`}>
          {userType === 'volunteer' ? (
            // Volunteer View
            <>
              <div className="space-y-3 mb-6">
                <Button
                  className={`w-full ${hasArrived
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-[#10B981] hover:bg-[#059669]'
                    }`}
                  onClick={() => setHasArrived(true)}
                  disabled={hasArrived}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {hasArrived ? "You've Arrived" : "I've Arrived"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Coordinator
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Message
                  </Button>
                </div>

                <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Need Help / Emergency
                </Button>

                <Button variant="ghost" className="w-full text-gray-600">
                  <Flag className="w-5 h-5 mr-2" />
                  Report Issue
                </Button>
              </div>

              {/* Coordinator Info */}
              {bottomSheetExpanded && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <h5 className="mb-3">Coordinator Information</h5>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback className="bg-[#1E3A8A] text-white">C</AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{taskDetails.coordinatorName}</p>
                      <p className="text-sm text-gray-600">{taskDetails.coordinatorPhone}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    Safety check-in reminder: You'll be prompted every 30 minutes
                  </div>
                </div>
              )}
            </>
          ) : (
            // Requester View
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4>Volunteers En Route</h4>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {activeVolunteers.filter((v) => v.status === 'arrived').length}/{activeVolunteers.length} Arrived
                  </Badge>
                </div>

                {activeVolunteers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No volunteers active on this request yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Assign volunteers from dashboard to see them here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeVolunteers.map((volunteer) => (
                      <div
                        key={volunteer.id}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-[#1E3A8A] text-white text-sm">
                                {volunteer.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p>{volunteer.name}</p>
                              <p className="text-xs text-gray-500">{volunteer.distance} away</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(volunteer.status)}>
                            {volunteer.status === 'arrived' ? 'Arrived' : `ETA: ${volunteer.eta}`}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {bottomSheetExpanded && (
                <>
                  <Button variant="outline" className="w-full mb-3">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Broadcast Message to All Volunteers
                  </Button>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <h5 className="mb-3">Completion Checklist</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>All volunteers accounted for</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        <span>Equipment distributed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        <span>Tasks assigned</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-[#10B981] hover:bg-[#059669]">
                      Mark Request as Resolved
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
