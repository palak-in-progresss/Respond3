import { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { RoleSelection } from './components/RoleSelection';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { RequesterDashboard } from './components/RequesterDashboard';
import { VolunteerOnboarding } from './components/VolunteerOnboarding';
import { VolunteerLogin } from './components/VolunteerLogin';
import { LiveTracking } from './components/LiveTracking';
import { AdminVerificationPanel } from './components/AdminVerificationPanel';
import { runDiagnostics } from '../diagnostics';

type Screen =
  | 'landing'
  | 'role-selection'
  | 'volunteer-login'
  | 'volunteer-onboarding'
  | 'volunteer-dashboard'
  | 'requester-dashboard'
  | 'live-tracking'
  | 'admin-verification';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [trackingRequestId, setTrackingRequestId] = useState<string | null>(null);

  // Organization configuration - Change this to customize your organization
  const ORGANIZATION_CONFIG = {
    name: 'Emergency Response Organization',
    id: 'org_emergency_response',
  };

  // Diagnostic keyboard shortcut: Press Shift+D to run diagnostics
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        console.log('🔍 Running diagnostics...');
        runDiagnostics();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <Landing onGetStarted={() => setCurrentScreen('role-selection')} />;
      case 'role-selection':
        return (
          <RoleSelection
            onSelectVolunteer={() => {
              // Check if volunteer is already logged in
              const volunteerId = localStorage.getItem('volunteerId');
              if (volunteerId) {
                setCurrentScreen('volunteer-dashboard');
              } else {
                setCurrentScreen('volunteer-login');
              }
            }}
            onSelectRequester={() => setCurrentScreen('requester-dashboard')}
          />
        );
      case 'volunteer-login':
        return (
          <VolunteerLogin
            onLoginSuccess={() => setCurrentScreen('volunteer-dashboard')}
            onBack={() => setCurrentScreen('volunteer-onboarding')}
          />
        );
      case 'volunteer-onboarding':
        return (
          <VolunteerOnboarding
            onComplete={() => setCurrentScreen('volunteer-dashboard')}
            onBack={() => setCurrentScreen('volunteer-login')}
          />
        );
      case 'volunteer-dashboard':
        return (
          <VolunteerDashboard
            onBack={() => setCurrentScreen('role-selection')}
            onLogout={() => {
              // Clear session data
              localStorage.removeItem('volunteerId');
              localStorage.removeItem('volunteerData');
              localStorage.removeItem('digilocker_session');

              // Redirect to login screen
              setCurrentScreen('volunteer-login');
            }}
          />
        );
      case 'requester-dashboard':
        return (
          <RequesterDashboard
            onBack={() => setCurrentScreen('role-selection')}
            onNavigateToLiveTracking={(requestId) => {
              setTrackingRequestId(requestId);
              setCurrentScreen('live-tracking');
            }}
            onNavigateToAdmin={() => setCurrentScreen('admin-verification')}
            organizationName={ORGANIZATION_CONFIG.name}
            organizationId={ORGANIZATION_CONFIG.id}
          />
        );
      case 'live-tracking':
        return (
          <LiveTracking
            userType="requester"
            requestId={trackingRequestId}
            onComplete={() => setCurrentScreen('requester-dashboard')}
            onClose={() => setCurrentScreen('requester-dashboard')}
          />
        );
      case 'admin-verification':
        return (
          <AdminVerificationPanel
            onBack={() => setCurrentScreen('requester-dashboard')}
          />
        );
      default:
        return <Landing onGetStarted={() => setCurrentScreen('role-selection')} />;
    }
  };

  return <div className="min-h-screen">{renderScreen()}</div>;
}