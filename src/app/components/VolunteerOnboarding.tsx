import { useState } from 'react';
import { PersonalInformation } from './volunteer-onboarding/PersonalInformation';
import { SkillsCertifications } from './volunteer-onboarding/SkillsCertifications';
import { VerificationDocuments } from './volunteer-onboarding/VerificationDocuments';
import { AvailabilitySettings } from './volunteer-onboarding/AvailabilitySettings';
import { ReviewConfirmation } from './volunteer-onboarding/ReviewConfirmation';
import { VerificationPending } from './volunteer-onboarding/VerificationPending';
import { createVolunteer } from '../../lib/api/volunteers';

interface VolunteerOnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

export function VolunteerOnboarding({ onComplete, onBack }: VolunteerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {},
    skills: {},
    verification: {},
    availability: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async (stepData: any) => {
    const stepKeys = ['personalInfo', 'skills', 'verification', 'availability', 'review'];
    const currentKey = stepKeys[currentStep - 1];

    const updatedData = {
      ...formData,
      [currentKey]: stepData,
    };

    setFormData(updatedData);

    // If this is the final step (review), save to Supabase
    if (currentStep === 5) {
      setIsSubmitting(true);
      try {
        const volunteerData = {
          full_name: updatedData.personalInfo.fullName || '',
          email: updatedData.personalInfo.email || '',
          phone: updatedData.personalInfo.phone || '',
          location: `${updatedData.personalInfo.city || ''}, ${updatedData.personalInfo.state || ''}`,
          latitude: 19.0760, // Default Mumbai coordinates - should be geocoded in production
          longitude: 72.8777,
          skills: updatedData.skills.selectedSkills || [],
          certifications: updatedData.skills.certifications || {},
          verification_status: 'pending' as const,
          availability_status: 'available' as const,
          availability_schedule: {
            days: updatedData.availability.selectedDays || [],
            maxDistance: updatedData.availability.maxDistance || 10,
          },
          rating: 0, // New volunteers start with 0 rating
          tasks_completed: 0, // New volunteers have 0 completed tasks
        };

        const result = await createVolunteer(volunteerData);

        if (result) {
          // Store volunteer ID in localStorage for demo
          localStorage.setItem('volunteerId', result.id);
          setCurrentStep((prev) => prev + 1);
        } else {
          alert('Error saving volunteer data. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting volunteer:', error);
        alert('Error saving volunteer data. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInformation onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <SkillsCertifications onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <VerificationDocuments onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <AvailabilitySettings onNext={handleNext} onBack={handleBack} />;
      case 5:
        return (
          <ReviewConfirmation
            onNext={handleNext}
            onBack={handleBack}
            onEdit={handleEdit}
            data={formData}
          />
        );
      case 6:
        return <VerificationPending onGoToDashboard={onComplete} />;
      default:
        return <PersonalInformation onNext={handleNext} onBack={handleBack} />;
    }
  };

  return <div>{renderStep()}</div>;
}
