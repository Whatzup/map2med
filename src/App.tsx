/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CareXProvider, useCareX } from './context/CareXContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/modals/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BottomNavBar } from './components/flow/BottomNavBar';

import { Screen1Home } from './components/flow/Screen1Home';
import { Screen2Cart } from './components/flow/Screen2Cart';
import { ServiceDetailsScreen } from './components/flow/ServiceDetailsScreen';
import { FlowServiceItem } from './types/flowTypes';
import { PaymentScreen } from './components/flow/PaymentScreen';
import { Screen3Assignment } from './components/flow/Screen3Assignment';
import { Screen4Tracking } from './components/flow/Screen4Tracking';
import { Screen5ServiceStarted } from './components/flow/Screen5ServiceStarted';
import { CallModal, ChatModal, SpecialistDetailsModal, AddressModal } from './components/flow/Modals';

import { NearbyView } from './components/views/NearbyView';
import { PatientPortalView } from './components/views/PatientPortalView';
import { ProviderPortalView } from './components/views/ProviderPortalView';
import { AdminPortalView } from './components/views/AdminPortalView';
import { AllScreensView } from './components/views/AllScreensView';

import { OnboardingContainer } from './components/onboarding/OnboardingContainer';

const AppContent: React.FC = () => {
  const { 
    isLoggedIn,
    setIsLoggedIn,
    activeTab, 
    setActiveTab,
    activeRole,
    flowCurrentScreen,
    setFlowCurrentScreen,
    cartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    deliveryAddress,
    setDeliveryAddress,
    submitOrderFromCart,
    assignSpecialistToActiveBooking,
    startActiveBookingService,
    resetBookingFlow,
    activeBooking,
    hasActiveBooking,
    providers,
    showToast
  } = useCareX();

  const assignedProvider = providers.find(p => p.id === activeBooking?.providerId) || providers[0];
  const activeSpecialistName = activeBooking?.providerName || assignedProvider?.name || 'Care Specialist';
  const activeSpecialistAvatar = assignedProvider?.avatar || '/assets/ui/hero_doctor.png';
  const activeSpecialistRole = assignedProvider?.title || 'Care Specialist • RN';

  // Modals state
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callTarget, setCallTarget] = useState<{ name: string; role: string; avatar: string }>({ 
    name: activeSpecialistName, 
    role: activeSpecialistRole,
    avatar: activeSpecialistAvatar 
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpecialistDetailsOpen, setIsSpecialistDetailsOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentStep, setIsPaymentStep] = useState(false);

  const handleOpenSpecialistCall = () => {
    setCallTarget({
      name: activeSpecialistName,
      role: activeSpecialistRole,
      avatar: activeSpecialistAvatar
    });
    setIsCallOpen(true);
  };

  const handleOpenSupportCall = () => {
    setCallTarget({
      name: 'Map2Medic 24/7 Helpline',
      role: 'Clinical Triage & Support • 1-800-MAP2MEDIC',
      avatar: '/map2medic_logo.jpeg'
    });
    setIsCallOpen(true);
  };

  const [cartBookingMeta, setCartBookingMeta] = useState<any>(null);
  const [viewingServiceDetails, setViewingServiceDetails] = useState<FlowServiceItem | null>(null);

  const handleBottomTabChange = (tab: 'home' | 'book' | 'orders' | 'profile') => {
    setIsPaymentStep(false);
    setViewingServiceDetails(null);
    if (tab === 'home') {
      setFlowCurrentScreen(1);
      setActiveTab('home');
    } else if (tab === 'book') {
      setFlowCurrentScreen(2);
      setActiveTab('booking');
    } else if (tab === 'orders') {
      if (activeBooking && (activeBooking.status === 'in_progress' || activeBooking.status === 'service_started')) {
        setFlowCurrentScreen(5);
      } else {
        setFlowCurrentScreen(4);
      }
      setActiveTab('orders');
    } else if (tab === 'profile') {
      setActiveTab('patient-portal');
    }
  };

  const isPatientMobileFlow = activeRole === 'patient' && (activeTab === 'home' || activeTab === 'booking' || activeTab === 'orders' || activeTab === 'patient-portal');

  React.useEffect(() => {
    if (activeTab === 'booking' && flowCurrentScreen !== 2) {
      setFlowCurrentScreen(2);
    }
  }, [activeTab, flowCurrentScreen, setFlowCurrentScreen]);

  const renderPatientFlowScreen = () => {
    if (viewingServiceDetails) {
      return (
        <ServiceDetailsScreen
          service={viewingServiceDetails}
          onBack={() => setViewingServiceDetails(null)}
          onAddToCart={(serv) => {
            addToCart(serv);
          }}
          onGoToCart={() => {
            setViewingServiceDetails(null);
            setFlowCurrentScreen(2);
            setActiveTab('booking');
          }}
          isInCart={cartItems.some(c => c.service.id === viewingServiceDetails.id)}
          deliveryAddress={deliveryAddress}
          onAddressClick={() => setIsAddressModalOpen(true)}
          onCallSupportClick={handleOpenSupportCall}
        />
      );
    }

    if (isPaymentStep) {
      const subTotal = cartBookingMeta?.customBasePrice ?? cartItems.reduce((acc, item) => acc + item.service.price * item.quantity, 0);
      const totalAmount = cartBookingMeta?.customTotalAmount ?? (subTotal + (cartItems.length > 0 ? 30 : 0));
      return (
        <PaymentScreen
          cartItems={cartItems}
          totalAmount={totalAmount}
          deliveryAddress={deliveryAddress}
          onAddressClick={() => setIsAddressModalOpen(true)}
          onCallSupportClick={handleOpenSupportCall}
          onBackToCart={() => setIsPaymentStep(false)}
          onPaymentSuccess={async (method, details) => {
            setIsPaymentStep(false);
            await submitOrderFromCart(method, details, cartBookingMeta);
            setFlowCurrentScreen(4);
            setActiveTab('orders');
          }}
        />
      );
    }

    // Determine current screen
    const screenToRender = activeTab === 'booking' ? 2 : flowCurrentScreen;

    switch (screenToRender) {
      case 1:
        return (
          <Screen1Home
            onSelectService={(service) => {
              addToCart(service);
              setFlowCurrentScreen(2);
              setActiveTab('booking');
            }}
            onViewServiceDetails={(service) => {
              setViewingServiceDetails(service);
            }}
            onNavigateToCart={() => {
              setFlowCurrentScreen(2);
              setActiveTab('booking');
            }}
            onNavigateToTracking={(step?: 3 | 4 | 5) => {
              const targetStep = step || (activeBooking?.status === 'in_progress' ? 5 : activeBooking?.status === 'en_route' ? 4 : 3);
              setFlowCurrentScreen(targetStep);
              setActiveTab('orders');
            }}
            onAddressClick={() => setIsAddressModalOpen(true)}
            onCallSupportClick={handleOpenSupportCall}
            onTabChange={handleBottomTabChange}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            hasActiveBooking={hasActiveBooking}
            activeBooking={activeBooking}
            deliveryAddress={deliveryAddress}
          />
        );

      case 2:
        return (
          <Screen2Cart
            cartItems={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onAddMore={() => {
              setFlowCurrentScreen(1);
              setActiveTab('home');
            }}
            onProceedToBooking={(meta) => {
              setCartBookingMeta(meta);
              setIsPaymentStep(true);
            }}
            onBackToHome={() => {
              setFlowCurrentScreen(1);
              setActiveTab('home');
            }}
            onAddressClick={() => setIsAddressModalOpen(true)}
            onCallSupportClick={handleOpenSupportCall}
            onTabChange={handleBottomTabChange}
            deliveryAddress={deliveryAddress}
          />
        );

      case 3:
        return (
          <Screen3Assignment
            bookingId={activeBooking?.id?.replace(/^booking-/, '') || 'CX-2026-8716'}
            onSpecialistAssigned={() => {
              assignSpecialistToActiveBooking();
            }}
            onAddressClick={() => setIsAddressModalOpen(true)}
            onCallSupportClick={handleOpenSupportCall}
            onTabChange={handleBottomTabChange}
            deliveryAddress={deliveryAddress}
          />
        );

      case 4:
        return (
          <Screen4Tracking
            onCallSpecialist={handleOpenSpecialistCall}
            onChatSpecialist={() => setIsChatOpen(true)}
            onViewDetails={() => setIsSpecialistDetailsOpen(true)}
            onManageBooking={() => {
              showToast('Manage Booking', 'You can contact your Care Specialist or 24/7 Helpline anytime.', 'info');
            }}
            onSpecialistArrived={() => {
              startActiveBookingService();
            }}
            onAddressClick={() => setIsAddressModalOpen(true)}
            onCallSupportClick={handleOpenSupportCall}
            onTabChange={handleBottomTabChange}
            deliveryAddress={deliveryAddress}
          />
        );

      case 5:
        return (
          <Screen5ServiceStarted
            onCallSpecialist={handleOpenSpecialistCall}
            onChatSpecialist={() => setIsChatOpen(true)}
            onViewDetails={() => setIsSpecialistDetailsOpen(true)}
            onAddressClick={() => setIsAddressModalOpen(true)}
            onCallSupportClick={handleOpenSupportCall}
            onResetFlow={() => {
              resetBookingFlow();
            }}
            onTabChange={handleBottomTabChange}
            deliveryAddress={deliveryAddress}
          />
        );

      default:
        return (
          <Screen1Home
            onSelectService={(service) => {
              addToCart(service);
              setFlowCurrentScreen(2);
              setActiveTab('booking');
            }}
            onNavigateToCart={() => {
              setFlowCurrentScreen(2);
              setActiveTab('booking');
            }}
            onNavigateToTracking={(step?: 3 | 4 | 5) => {
              setFlowCurrentScreen(step || 4);
              setActiveTab('orders');
            }}
            onAddressClick={() => setIsAddressModalOpen(true)}
            onCallSupportClick={handleOpenSupportCall}
            onTabChange={handleBottomTabChange}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            hasActiveBooking={hasActiveBooking}
            activeBooking={activeBooking}
            deliveryAddress={deliveryAddress}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center selection:bg-teal-500 selection:text-white">
        <div className="w-full max-w-[430px] min-h-screen bg-[#073b34] text-white shadow-2xl relative flex flex-col border-x border-slate-800/80 overflow-x-hidden">
          <OnboardingContainer onComplete={(isNewSignUp, role) => {
            setIsLoggedIn(true);
            if (isNewSignUp) {
              if (role === 'provider') {
                setActiveTab('provider-portal');
              } else {
                setActiveTab('patient-portal');
              }
            } else {
              setActiveTab('home');
              setFlowCurrentScreen(1);
            }
          }} />
          <ToastContainer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center selection:bg-teal-500 selection:text-white">
      {/* Shell: Centered 430px iPhone-class frame on desktop, or wide responsive canvas when desktop portals are viewed */}
      <div className={`w-full ${isPatientMobileFlow ? 'max-w-[430px]' : 'max-w-7xl'} min-h-screen bg-slate-50 text-slate-900 shadow-2xl relative flex flex-col border-x border-slate-800/80 overflow-x-hidden transition-all duration-300`}>
        <Header />
        
        <main className={`flex-1 flex flex-col ${isPatientMobileFlow ? '' : 'pb-20'}`}>
          {isPatientMobileFlow ? (
            activeTab === 'patient-portal' ? <PatientPortalView /> : renderPatientFlowScreen()
          ) : (
            <>
              {activeTab === 'home' && renderPatientFlowScreen()}
              {activeTab === 'booking' && renderPatientFlowScreen()}
              {activeTab === 'orders' && renderPatientFlowScreen()}
              {activeTab === 'nearby' && <NearbyView />}
              {activeTab === 'patient-portal' && <PatientPortalView />}
              {activeTab === 'provider-portal' && <ProviderPortalView />}
              {activeTab === 'admin-portal' && <AdminPortalView />}
              {activeTab === 'all-screens' && <AllScreensView />}
            </>
          )}
        </main>

        {isPatientMobileFlow && (
          <BottomNavBar
            activeTab={
              activeTab === 'home' ? 'home' :
              activeTab === 'booking' ? 'book' :
              activeTab === 'orders' ? 'orders' :
              activeTab === 'patient-portal' ? 'profile' : 'home'
            }
            onTabChange={handleBottomTabChange}
            badgeCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
          />
        )}

        {!isPatientMobileFlow && <Footer />}
        <ToastContainer />
        <AuthModal />
        <OfflineIndicator />

        {/* Global Interactive Modals */}
        <CallModal
          isOpen={isCallOpen}
          onClose={() => setIsCallOpen(false)}
          callerName={callTarget.name}
          callerRole={callTarget.role}
          callerAvatar={callTarget.avatar}
        />
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onCallSpecialist={handleOpenSpecialistCall}
        />
        <SpecialistDetailsModal
          isOpen={isSpecialistDetailsOpen}
          onClose={() => setIsSpecialistDetailsOpen(false)}
          onCall={handleOpenSpecialistCall}
          onChat={() => {
            setIsSpecialistDetailsOpen(false);
            setIsChatOpen(true);
          }}
        />
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          selectedAddress={deliveryAddress}
          onSelectAddress={(addr) => setDeliveryAddress(addr)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CareXProvider>
      <AppContent />
    </CareXProvider>
  );
}
