import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  MapPin,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Stethoscope,
  Truck,
  Heart,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { getRequests } from '../../lib/api/requests';
import { createAssignment } from '../../lib/api/assignments';
import type { Database } from '../../types/database';
import { supabase } from '../../lib/supabase';

type Request = Database['public']['Tables']['requests']['Row'];
type Assignment = Database['public']['Tables']['assignments']['Row'];

// Update Assignment type to include joined request data
type AssignmentWithRequest = Assignment & {
  requests: {
    title: string;
    location_name: string;
  }
};

interface VolunteerDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

export function VolunteerDashboard({ onBack, onLogout }: VolunteerDashboardProps) {
  const [nearbyRequests, setNearbyRequests] = useState<Request[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [volunteerData, setVolunteerData] = useState<any>(null);

  // Load volunteer data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('volunteerData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setVolunteerData(data);
      } catch (error) {
        console.error('Error parsing volunteer data:', error);
      }
    }
  }, []);

  // Get volunteer initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'V';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Fetch open requests
      let requests = await getRequests({ status: 'open' });

      // Filter requests based on volunteer skills
      const volunteerId = localStorage.getItem('volunteerId');
      const storedData = localStorage.getItem('volunteerData');

      if (storedData) {
        const volData = JSON.parse(storedData);
        const userSkills = (volData.skills || []).map((s: string) => s.toLowerCase());

        if (true) {
          // Calculate match score for each request
          const scoredRequests = requests.map(req => {
            const reqSkills = (req.skills_needed || []).map((s: string) => s.toLowerCase());
            // If request needs no specific skills, it's a match for everyone (score 1)
            if (reqSkills.length === 0) return { ...req, matchScore: 1 };

            // Count matching skills
            const matches = reqSkills.filter((s: string) => userSkills.includes(s));
            // Score = number of matches
            return { ...req, matchScore: matches.length };
          });

          // Filter out requests with 0 score (unless request has no skill requirements)
          // And sort by score descending
          requests = scoredRequests
            .filter(req => req.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
        }
      }

      setNearbyRequests(requests);

      // Fetch volunteer's assignments if logged in
      if (volunteerId) {
        // Custom query to get request details
        const { data: userAssignments, error } = await supabase
          .from('assignments')
          .select(`
            *,
            requests (
              title,
              location_name
            )
          `)
          .eq('volunteer_id', volunteerId)
          .order('created_at', { ascending: false });

        if (userAssignments) {
          setAssignments(userAssignments as any);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptTask(requestId: string) {
    const volunteerId = localStorage.getItem('volunteerId');
    if (!volunteerId) {
      alert('Please complete onboarding first');
      return;
    }

    try {
      const assignment = await createAssignment({
        request_id: requestId,
        volunteer_id: volunteerId,
        status: 'accepted'
      });

      if (assignment) {
        alert('Task accepted! Check your upcoming tasks.');
        loadData(); // Refresh data
      } else {
        alert('Error accepting task. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting task:', error);
      alert('Error accepting task. Please try again.');
    }
  }

  const getIconForRequest = (skills: string[]) => {
    if (skills.some(s => s.toLowerCase().includes('medical') || s.toLowerCase().includes('doctor'))) {
      return Stethoscope;
    }
    if (skills.some(s => s.toLowerCase().includes('driving') || s.toLowerCase().includes('logistics'))) {
      return Truck;
    }
    return Heart;
  };
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'URGENT';
      case 'medium':
        return 'MODERATE';
      case 'low':
        return 'LOW';
      default:
        return 'NORMAL';
    }
  };

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
            <h2>Volunteer Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            {volunteerData?.verified && (
              <Badge variant="outline" className="bg-[#10B981] text-white border-[#10B981] hidden sm:flex">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}

            <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-[#1E3A8A] text-white">
                  {volunteerData ? getInitials(volunteerData.name) : 'V'}
                </AvatarFallback>
              </Avatar>
              {volunteerData && (
                <div className="hidden md:block text-right mr-2">
                  <p className="text-sm font-medium leading-none">{volunteerData.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{volunteerData.phone || volunteerData.email}</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-red-600 border-red-200 hover:bg-red-50 ml-2"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl mb-1">{assignments.filter(a => a.status === 'completed').length}</div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl mb-1">{assignments.filter(a => a.status === 'completed').length * 4}</div>
                <div className="text-sm text-gray-600">Hours Served</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl mb-1">5.0</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>

            {/* Nearby Requests */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3>Nearby Emergency Requests</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500">Loading requests...</p>
                ) : nearbyRequests.length === 0 ? (
                  <p className="text-gray-500">No nearby requests at the moment</p>
                ) : (
                  nearbyRequests.map((request) => {
                    const IconComponent = getIconForRequest(request.skills_needed);
                    return (
                      <div
                        key={request.id}
                        className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-xl flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="mb-1">{request.title}</h4>
                                <p className="text-sm text-gray-600">{request.organization_name}</p>
                              </div>
                              <Badge className={`${getUrgencyColor(request.urgency)} text-white border-0`}>
                                {getUrgencyLabel(request.urgency)}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {request.skills_needed.map((skill: string) => (
                                <Badge key={skill} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {request.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(request.created_at).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{request.volunteers_assigned || 0}/{request.volunteers_needed} volunteers</span>
                              {assignments.some(a => a.request_id === request.id) ? (
                                <Button
                                  variant="outline"
                                  className="border-green-500 text-green-600 bg-green-50 cursor-default hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Accepted
                                </Button>
                              ) : (
                                <Button
                                  className="bg-[#10B981] hover:bg-[#059669]"
                                  onClick={() => handleAcceptTask(request.id)}
                                >
                                  Accept Task
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Calendar */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4>Availability</h4>
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monday - Friday</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Available
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekends</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Available
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Time</span>
                  <span className="text-sm text-gray-600">9 AM - 6 PM</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                Update Availability
              </Button>
            </div>

            {/* My Tasks */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="mb-4">My Upcoming Tasks</h4>

              <div className="space-y-3">
                {assignments.filter(a => ['accepted', 'in_progress'].includes(a.status)).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
                ) : (
                  assignments.filter(a => ['accepted', 'in_progress'].includes(a.status)).map((task) => (
                    <div key={task.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-sm font-medium mb-1">{task.requests?.title || 'Untitled Task'}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {task.requests?.location_name || 'Location N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.created_at).toLocaleDateString()}
                        <Badge variant="outline" className="ml-auto text-[10px] h-5 bg-white">
                          {task.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Tasks
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl p-6 text-white">
              <AlertCircle className="w-8 h-8 mb-3" />
              <h4 className="mb-2 text-white">Emergency Alert</h4>
              <p className="text-sm text-orange-100 mb-4">
                Enable notifications for urgent requests in your area
              </p>
              <Button className="w-full bg-white text-[#F59E0B] hover:bg-gray-100">
                Enable Alerts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
