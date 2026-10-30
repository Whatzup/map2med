import React, { useState } from 'react';
import { SplashScreen } from './SplashScreen';
import { AuthScreen } from './AuthScreen';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { SignUpFormScreen } from './SignUpFormScreen';
import { useCareX } from '../../context/CareXContext';
import { UserRole } from '../../types/carex';

interface OnboardingContainerProps {
  onComplete: (isNewSignUp?: boolean, role?: UserRole) => void;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({ onComplete }) => {
  const { setActiveRole, setIsLoggedIn, setActiveTab, setFlowCurrentScreen } = useCareX();
  const [currentStep, setCurrentStep] = useState<'splash' | 'auth' | 'role' | 'signup-form'>('splash');
  const [selectedRoleForSignUp, setSelectedRoleForSignUp] = useState<UserRole>('patient');

  // Step 1 -> Step 2: Splash to Auth
  const handleSplashContinue = () => {
    setCurrentStep('auth');
  };

  // Login Success (Returning User): Route silently to Services (Home)
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveTab('home');
    setFlowCurrentScreen(1);
    onComplete(false);
  };

  // Auth to Role Selection (Clicking "Sign Up")
  const handleGoToRoleSelection = () => {
    setCurrentStep('role');
  };

  // Role Selection -> Single Role Sign-Up Form
  const handleRoleSelectedForSignUp = (role: UserRole) => {
    setSelectedRoleForSignUp(role);
    setCurrentStep('signup-form');
  };

  // Sign-Up Complete (New User): Route silently directly to "My Profile"
  const handleSignUpComplete = (role: UserRole) => {
    setActiveRole(role, false);
    setIsLoggedIn(true);

    if (role === 'provider') {
      setActiveTab('provider-portal');
    } else {
      setActiveTab('patient-portal');
    }

    onComplete(true, role);
  };

  switch (currentStep) {
    case 'splash':
      return <SplashScreen onContinue={handleSplashContinue} />;
    
    case 'auth':
      return (
        <AuthScreen 
          onLoginSuccess={handleLoginSuccess}
          onGoToRoleSelection={handleGoToRoleSelection}
        />
      );

    case 'role':
      return (
        <RoleSelectionScreen
          onBackToAuth={() => setCurrentStep('auth')}
          onRoleSelected={handleRoleSelectedForSignUp}
        />
      );

    case 'signup-form':
      return (
        <SignUpFormScreen
          selectedRole={selectedRoleForSignUp}
          onBackToRoleSelection={() => setCurrentStep('role')}
          onSignUpComplete={handleSignUpComplete}
        />
      );

    default:
      return <SplashScreen onContinue={handleSplashContinue} />;
  }
};
