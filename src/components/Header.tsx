import React, { useState, useEffect, useRef } from 'react';
import { useCareX, NavigationTab } from '../context/CareXContext';
import { UserRole } from '../types/carex';
import { Map2MedicLogo } from './Map2MedicLogo';
import { NotificationDropdown } from './NotificationDropdown';
import { 
  HeartPulse, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  PhoneCall, 
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  Bell,
  Home,
  Calendar,
  ShoppingCart,
  MapPin,
  Activity,
  FlaskConical,
  ClipboardList
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    setActiveTab, 
    activeTab,
    bookings,
    activeRole, 
    openAuthModal,
    isLoggedIn,
    logout,
    patientUser,
    unreadNotifCount,
    markAllNotificationsRead,
    providers,
    activeProviderId,
    hasActiveBooking,
    activeBooking,
    cartItems,
    setFlowCurrentScreen
  } = useCareX();

  const cartCount = (cartItems || []).reduce((acc, i) => acc + i.quantity, 0);

  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const authDropdownRef = useRef<HTMLDivElement>(null);

  // Collapse auth dropdown when clicked anywhere outside on screen
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (authDropdownOpen && authDropdownRef.current && !authDropdownRef.current.contains(e.target as Node)) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [authDropdownOpen]);

  const activeBookingsCount = (bookings || []).filter(b => Boolean(b && b.status && b.status !== 'completed' && b.status !== 'cancelled')).length;

  const patientTabs: { label: string; tab: NavigationTab; icon: React.ReactNode; badge?: number }[] = [
    { label: 'Services', tab: 'home', icon: <Home className="w-4 h-4" /> },
    { label: 'Book Visit', tab: 'booking', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Nearby Map', tab: 'nearby', icon: <MapPin className="w-4 h-4" /> },
  ];

  const providerTabs: { label: string; tab: NavigationTab; icon: React.ReactNode; badge?: number }[] = [
    { label: 'Live Demand Map', tab: 'nearby', icon: <MapPin className="w-4 h-4" /> },
  ];

  const adminTabs: { label: string; tab: NavigationTab; icon: React.ReactNode; badge?: number }[] = [
    { label: 'Admin Review', tab: 'admin-portal', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Services', tab: 'home', icon: <Home className="w-4 h-4" /> },
    { label: 'All Screens', tab: 'all-screens', icon: <Activity className="w-4 h-4" /> },
  ];

  const navTabs = activeRole === 'patient' 
    ? patientTabs 
    : activeRole === 'provider' 
      ? providerTabs 
      : adminTabs;

  const roleLabels: Record<UserRole, { title: string; subtitle: string; icon: React.ReactNode; color: string }> = {
    patient: {
      title: 'Patient',
      subtitle: patientUser.name || 'Patient Member',
      icon: <User className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    provider: {
      title: 'Care Specialist',
      subtitle: 'Provider Portal',
      icon: <Stethoscope className="w-4 h-4 text-teal-600" />,
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    admin: {
      title: 'Medical Board',
      subtitle: 'Admin Review',
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    }
  };

  const handleSelectRoleAuth = (role: UserRole, mode: 'login' | 'signup' = 'login') => {
    setAuthDropdownOpen(false);
    openAuthModal(role, mode);
  };

  const handleTabClick = (tab: NavigationTab) => {
    if (tab === 'home') setFlowCurrentScreen(1);
    if (tab === 'booking') setFlowCurrentScreen(2);
    if (tab === 'orders') {
      if (activeBooking && (activeBooking.status === 'in_progress' || activeBooking.status === 'service_started')) {
        setFlowCurrentScreen(5);
      } else {
        setFlowCurrentScreen(4);
      }
    }
    setActiveTab(tab);
  };

  const isPatientMobileFlow = isLoggedIn && activeRole === 'patient' && (activeTab === 'home' || activeTab === 'booking' || activeTab === 'orders' || activeTab === 'patient-portal');

  return (
    <header className={`${isPatientMobileFlow ? 'contents' : 'sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs'}`}>
      {/* Top micro emergency alert bar (hidden on patient mobile flow to match exact mockup) */}
      {!isPatientMobileFlow && (
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white text-[11px] py-1 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-200 text-[10px] sm:text-[11px] truncate max-w-[240px] sm:max-w-none">
                {activeRole === 'provider' 
                  ? '🟢 Clinician Dispatch Network: Standby Online · Available for On-Demand Visits' 
                  : 'Map2Medic Live Dispatch: Average arrival '}
                {activeRole !== 'provider' && <strong className="text-emerald-300">22 mins</strong>}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:18002273963" className="flex items-center gap-1.5 text-teal-200 hover:text-white transition-colors">
                <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-semibold text-[10px] sm:text-[11px] hidden sm:inline">24/7 Triage: 1-800-MAP2MEDIC</span>
                <span className="font-semibold text-[10px] sm:hidden">1-800-MAP2MEDIC</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar (hidden on patient mobile flow to match mockup) */}
      {!isPatientMobileFlow && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Clicking takes back to Map2Medic Health home page */}
          <div 
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
          >
            <Map2MedicLogo size="md" />
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 self-center border border-teal-200 shrink-0">
              {isLoggedIn 
                ? (activeRole === 'patient' ? 'Patient' : activeRole === 'provider' ? 'Specialist' : 'Admin')
                : 'Health'}
            </span>
          </div>

          {/* Native Mobile Header: Navigation is handled via Thumb-Zone Bottom Nav Bar */}

          {/* Right Header Actions: My Profile, Notification Bell, Dedicated Log Out, or Compact Log In */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* My Profile Button (Positioned to the left of Notification Bell & Logout) */}
                <button
                  onClick={() => handleTabClick(activeRole === 'patient' ? 'patient-portal' : activeRole === 'provider' ? 'provider-portal' : 'admin-portal')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer hover:opacity-90 transition-all min-h-[36px] ${
                    activeTab === 'patient-portal' || activeTab === 'provider-portal' || activeTab === 'admin-portal'
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                      : roleLabels[activeRole].color
                  }`}
                  title="My Profile & Account Settings"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline sm:inline">Profile</span>
                </button>

                {/* Centralized Notification Bell with Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      const opening = !isNotifDropdownOpen;
                      setIsNotifDropdownOpen(opening);
                      if (opening) {
                        markAllNotificationsRead();
                      }
                    }}
                    className="p-1.5 sm:p-2 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-xl transition-all border border-slate-200/80 relative cursor-pointer active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="View Dispatch Notifications & Alerts"
                    aria-label="View Dispatch Notifications & Alerts"
                    aria-expanded={isNotifDropdownOpen}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifCount > 0 && (
                      <>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                          {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                        </span>
                      </>
                    )}
                  </button>

                  <NotificationDropdown 
                    isOpen={isNotifDropdownOpen} 
                    onClose={() => setIsNotifDropdownOpen(false)} 
                  />
                </div>

                {/* 1-Tap Emergency / Support Call Button (Strictly Replaces Logout on Top Header) */}
                <a
                  href="tel:18006272633"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[36px] shrink-0 shadow-2xs font-bold text-xs"
                  title="24/7 Clinical Emergency & Support Hotline: 1-800-MAP2MEDIC"
                  aria-label="Call 24/7 Support Hotline"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-700 shrink-0 animate-pulse" />
                  <span className="hidden xs:inline sm:inline text-xs font-bold text-emerald-950">1-800-MAP2MEDIC</span>
                  <span className="xs:hidden sm:hidden text-xs font-bold text-emerald-950">SOS Call</span>
                </a>
              </div>
            ) : (
              /* COMPACT, MOBILE-PERFECT LOGIN BUTTON */
              <div ref={authDropdownRef} className="relative">
                <button
                  onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 min-h-[34px] sm:min-h-[38px]"
                  aria-expanded={authDropdownOpen}
                  title="Log In / Sign Up"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-200 shrink-0" />
                  <span>Log In</span>
                  <ChevronDown className={`w-3 h-3 text-teal-200 transition-transform duration-200 shrink-0 ${authDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU WITH 3 OPTIONS: PATIENT, CARE PROVIDER, ADMIN */}
                {authDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setAuthDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                            Select Account Role
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-teal-600" /> Log In &amp; Sign Up
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Choose whether to log in or create a new account
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {/* Option 1: Patient Card with Log In & Sign Up buttons */}
                        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">1. Patient</h4>
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  Families
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">Book and track on-demand home visits</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-emerald-100">
                            <button
                              onClick={() => handleSelectRoleAuth('patient', 'login')}
                              className="flex-1 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer min-h-[40px]"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              Log In
                            </button>
                            <button
                              onClick={() => handleSelectRoleAuth('patient', 'signup')}
                              className="flex-1 py-2 px-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[40px]"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Sign Up
                            </button>
                          </div>
                        </div>

                        {/* Option 2: Care Provider Card with Log In & Sign Up buttons */}
                        <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/40 hover:bg-teal-50/70 transition-all">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                              <Stethoscope className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">2. Care Provider</h4>
                                <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                                  Clinicians &amp; RNs
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">Accept visits, manage schedule &amp; earnings</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-teal-100">
                            <button
                              onClick={() => handleSelectRoleAuth('provider', 'login')}
                              className="flex-1 py-2 px-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer min-h-[40px]"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              Log In
                            </button>
                            <button
                              onClick={() => handleSelectRoleAuth('provider', 'signup')}
                              className="flex-1 py-2 px-2 bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[40px]"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Sign Up / Apply
                            </button>
                          </div>
                        </div>

                        {/* Option 3: Admin Card with Log In & Sign Up buttons */}
                        <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50/70 transition-all">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">3. Admin</h4>
                                <span className="text-[9px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded">
                                  Medical Board
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">Audit licenses &amp; verify service pricing</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-purple-100">
                            <button
                              onClick={() => handleSelectRoleAuth('admin', 'login')}
                              className="flex-1 py-2 px-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer min-h-[40px]"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              Log In
                            </button>
                            <button
                              onClick={() => handleSelectRoleAuth('admin', 'signup')}
                              className="flex-1 py-2 px-2 bg-white border border-purple-300 hover:bg-purple-50 text-purple-800 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[40px]"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Sign Up
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Active profile badge in footer */}
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-1 font-semibold">
                        <span>Currently active: <strong className="text-slate-800">{roleLabels[activeRole].title}</strong></span>
                        <button
                          onClick={() => {
                            setAuthDropdownOpen(false);
                            handleTabClick(activeRole === 'patient' ? 'patient-portal' : activeRole === 'provider' ? 'provider-portal' : 'admin-portal');
                          }}
                          className="text-teal-700 font-bold hover:underline cursor-pointer"
                        >
                          Go to Portal →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* NATIVE MOBILE FIXED BOTTOM NAVIGATION BAR - Strictly for Provider/Admin portals on mobile (Patient flow uses dedicated BottomNavBar in App.tsx) */}
      {isLoggedIn && !isPatientMobileFlow && (activeRole === 'provider' || activeRole === 'admin') && (
        <div className="md:hidden fixed bottom-0 inset-x-0 max-w-[430px] mx-auto w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-2 py-1.5 shadow-xl flex items-center justify-around pb-safe select-none">
          {activeRole === 'provider' ? (
            <>
              {/* Provider Mobile Tabs: Live Demand, My Profile, Alerts, Log Out */}
              <button
                onClick={() => handleTabClick('nearby')}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'nearby' ? 'text-teal-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Live Demand</span>
              </button>

              <button
                onClick={() => handleTabClick('provider-portal')}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'provider-portal' ? 'text-teal-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">My Profile</span>
              </button>

              <button
                onClick={() => {
                  const opening = !isNotifDropdownOpen;
                  setIsNotifDropdownOpen(opening);
                  if (opening) {
                    markAllNotificationsRead();
                  }
                }}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-slate-800 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Alerts</span>
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-3 min-w-[14px] h-[14px] px-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                onClick={logout}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-rose-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Log Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Admin Mobile Tabs: Admin Review, Services, All Screens, My Profile */}
              <button
                onClick={() => handleTabClick('admin-portal')}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin-portal' ? 'text-purple-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Admin Review</span>
              </button>

              <button
                onClick={() => handleTabClick('home')}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'home' ? 'text-purple-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Services</span>
              </button>

              <button
                onClick={() => handleTabClick('all-screens')}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'all-screens' ? 'text-purple-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">All Screens</span>
              </button>

              <button
                onClick={() => handleTabClick('admin-portal')}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] px-1 py-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin-portal' ? 'text-purple-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">My Profile</span>
              </button>

              <button
                onClick={logout}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[50px] px-1 py-1 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-rose-600 active:scale-95"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                <span className="text-[10px] font-bold mt-0.5 text-rose-600">Log Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
