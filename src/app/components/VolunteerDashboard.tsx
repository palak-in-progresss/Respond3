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
  ArrowLeft
} from 'lucide-react';
import { getRequests } from '../../lib/api/requests';
import { getAssignmentsByVolunteer, createAssignment } from '../../lib/api/assignments';
import type { Database } from '../../types/database';

type Request = Database['public']['Tables']['requests']['Row'];
type Assignment = Database['public']['Tables']['assignments']['Row'];

interface VolunteerDashboardProps {
  onBack: () => void;
}

const myTasks = [
  {
    id: 1,
    title: 'Blood Donation Camp',
    date: 'Dec 30, 2025',
    time: '10:00 AM',
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'Vaccination Drive',
    date: 'Jan 2, 2026',
    time: '9:00 AM',
    status: 'upcoming',
  },
];

export function VolunteerDashboard({ onBack }: VolunteerDashboardProps) {
  const [nearbyRequests, setNearbyRequests] = useState<Request[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Fetch open requests
      const requests = await getRequests({ status: 'open' });
      setNearbyRequests(requests);

      // Fetch volunteer's assignments if logged in
      const volunteerId = localStorage.getItem('volunteerId');
      if (volunteerId) {
        const userAssignments = await getAssignmentsByVolunteer(volunteerId);
        setAssignments(userAssignments);
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
            <Badge variant="outline" className="bg-[#10B981] text-white border-[#10B981]">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
              Medical Professional
            </Badge>
            <Button variant="ghost" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-[#1E3A8A] text-white">AK</AvatarFallback>
            </Avatar>
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
                <div className="text-3xl mb-1">24</div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl mb-1">156</div>
                <div className="text-sm text-gray-600">Hours Served</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl mb-1">4.9</div>
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
                              <Button
                                className="bg-[#10B981] hover:bg-[#059669]"
                                onClick={() => handleAcceptTask(request.id)}
                              >
                                Accept Task
                              </Button>
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
                {myTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm mb-1">{task.title}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {task.date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {task.time}
                    </div>
                  </div>
                ))}
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
