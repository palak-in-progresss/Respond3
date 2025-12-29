import { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { RoleSelection } from './components/RoleSelection';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { RequesterDashboard } from './components/RequesterDashboard';
import { VolunteerOnboarding } from './components/VolunteerOnboarding';
import { LiveTracking } from './components/LiveTracking';
import { runDiagnostics } from '../diagnostics';

type Screen =
  | 'landing'
  | 'role-selection'
  | 'volunteer-onboarding'
  | 'volunteer-dashboard'
  | 'requester-dashboard'
  | 'live-tracking';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');

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
            onSelectVolunteer={() => setCurrentScreen('volunteer-onboarding')}
            onSelectRequester={() => setCurrentScreen('requester-dashboard')}
          />
        );
      case 'volunteer-onboarding':
        return (
          <VolunteerOnboarding
            onComplete={() => setCurrentScreen('volunteer-dashboard')}
            onBack={() => setCurrentScreen('role-selection')}
          />
        );
      case 'volunteer-dashboard':
        return <VolunteerDashboard onBack={() => setCurrentScreen('role-selection')} />;
      case 'requester-dashboard':
        return (
          <RequesterDashboard
            onBack={() => setCurrentScreen('role-selection')}
            onNavigateToLiveTracking={() => setCurrentScreen('live-tracking')}
          />
        );
      case 'live-tracking':
        return (
          <LiveTracking
            userType="requester"
            onComplete={() => setCurrentScreen('requester-dashboard')}
            onClose={() => setCurrentScreen('requester-dashboard')}
          />
        );
      default:
        return <Landing onGetStarted={() => setCurrentScreen('role-selection')} />;
    }
  };

  return <div className="min-h-screen">{renderScreen()}</div>;
}