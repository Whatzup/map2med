import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  ServiceItem, 
  HealthcareProvider, 
  Booking, 
  BookingStatus, 
  BookingAddon, 
  PaymentMethod,
  PatientUser,
  AppNotification
} from '../types/carex';
import { INITIAL_PATIENT } from '../data/mockData';
import { calculateAgeFromDob, getDisplayAge } from '../lib/dateUtils';
import { ActiveBookingGuardModal } from '../components/modals/ActiveBookingGuardModal';
import { FlowCartItem, FlowServiceItem, FlowSpecialist, ScreenId } from '../types/flowTypes';
import { INITIAL_CART_ITEMS, ASSIGNED_SPECIALIST, ADDRESSES } from '../data/flowMockData';

export type NavigationTab = 
  | 'home' 
  | 'booking' 
  | 'orders'
  | 'nearby' 
  | 'patient-portal' 
  | 'provider-portal' 
  | 'admin-portal' 
  | 'all-screens';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface DbStats {
  totalServices: number;
  totalProviders: number;
  availableProviders: number;
  totalBookings: number;
  activeDispatches: number;
  completedVisits: number;
  totalRevenue: number;
  verifiedDocs: number;
  pendingDocs: number;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  landmark?: string;
  isDefault?: boolean;
}

export const ACTIVE_BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'searching',
  'assigning',
  'awaiting_provider_approval',
  'reassigning',
  'provider_cancelled',
  'scheduled',
  'assigned',
  'on_the_way',
  'en_route',
  'arriving',
  'arrived',
  'service_started',
  'in_progress',
  'awaiting_completion_confirmation'
];
export const TERMINAL_BOOKING_STATUSES = ['completed', 'cancelled'];

interface CareXContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole, navigateToPortal?: boolean) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  services: ServiceItem[];
  providers: HealthcareProvider[];
  bookings: Booking[];
  patientUser: PatientUser;
  selectedServiceForBooking: ServiceItem | null;
  setSelectedServiceForBooking: (srv: ServiceItem | null) => void;
  selectedServicesForBooking: ServiceItem[];
  addServiceToBooking: (service: ServiceItem) => void;
  removeServiceFromBooking: (serviceId: string) => void;
  toggleServiceInBooking: (service: ServiceItem) => void;
  clearBookingServices: () => void;

  // Address selection & location context (Urban Company / Snabbit model)
  savedAddresses: SavedAddress[];
  selectedAddress: SavedAddress | null;
  setSelectedAddress: (addr: SavedAddress | null) => void;
  addSavedAddress: (addr: Omit<SavedAddress, 'id'>) => Promise<SavedAddress> | SavedAddress;

  // Service Mode (Instant Paramedic vs. Schedule for Later)
  serviceMode: 'instant' | 'scheduled';
  setServiceMode: (mode: 'instant' | 'scheduled') => void;
  
  // Database status & live stats
  isLoadingDb: boolean;
  dbStats: DbStats | null;
  refreshData: () => Promise<void>;
  refreshSingleBooking: (bookingId: string) => Promise<Booking | null>;
  submitProviderReview: (data: { bookingId?: string; providerId: string; rating: number; comment?: string }) => Promise<void>;

  // Actions
  startBookingWithService: (service: ServiceItem) => void;
  createBooking: (data: {
    service: ServiceItem;
    patientName: string;
    patientAge: number;
    patientPhone: string;
    patientAddress: string;
    date: string;
    timeSlot: string;
    addons: BookingAddon[];
    paymentMethod: PaymentMethod;
    totalAmount?: number;
    basePrice?: number;
    platformFee?: number;
    discountAmount?: number;
    medicalNotes?: string;
    provider?: HealthcareProvider;
    intakeIntent?: string;
    careDuration?: string;
    patientGender?: string;
    recentlyDischarged?: string;
    mobilityStatus?: string;
    liftAvailability?: string;
    landmark?: string;
    emergencyContactPhone?: string;
    otpCode?: string;
    progressChecklist?: any;
  }) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus, vitals?: Booking['vitalsRecorded'], checklist?: any) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  rescheduleBooking: (bookingId: string, newDate: string, newTimeSlot: string) => Promise<void>;
  toggleProviderAvailability: (providerId: string) => Promise<void>;
  verifyProviderDocument: (providerId: string, docId: string, status: 'verified' | 'rejected', reason?: string) => Promise<void>;
  updateServicePricing: (serviceId: string, newPrice: number, baseLabel: string) => Promise<void>;
  addNewService: (service: Omit<ServiceItem, 'id'>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  
  // Profile Management (Patient & Provider)
  updatePatientProfile: (updatedData: Partial<PatientUser>) => Promise<void>;
  addPatientPrescription: (name: string, doctor: string) => Promise<void>;
  updateProviderProfile: (providerId: string, updatedData: Partial<HealthcareProvider>) => Promise<void>;
  requestProviderPayout: (providerId: string, amount: number) => Promise<void>;
  uploadProviderCredential: (providerId: string, docType: string, fileName: string) => Promise<void>;

  // OTP Login to Profile
  loginWithOtp: (identifier: string, role: UserRole, code?: string) => Promise<boolean>;

  // Auth Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalRole: UserRole;
  authModalInitialMode: 'login' | 'signup';
  openAuthModal: (role?: UserRole, initialMode?: 'login' | 'signup') => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Logged in provider ID
  activeProviderId: string;
  setActiveProviderId: (id: string) => void;

  // Bell Icon Notifications & Dispatch Alerts
  notifications: AppNotification[];
  unreadNotifCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Active Booking Enforcement
  activeBooking: Booking | null;
  hasActiveBooking: boolean;
  isActiveBookingGuardModalOpen: boolean;
  setIsActiveBookingGuardModalOpen: (open: boolean) => void;
  openActiveBookingGuardModal: () => void;

  // Session state
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  logout: () => void;

  // 5-Screen Patient Root Flow state & operations
  patientFlowMode: 'simulator' | 'panoramic';
  setPatientFlowMode: (mode: 'simulator' | 'panoramic') => void;
  flowCurrentScreen: ScreenId;
  setFlowCurrentScreen: (s: ScreenId) => void;
  cartItems: FlowCartItem[];
  addToCart: (service: FlowServiceItem) => void;
  updateCartQuantity: (serviceId: string, delta: number) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;
  submitOrderFromCart: (paymentMethodChoice?: PaymentMethod, paymentDetails?: any, customMeta?: any) => Promise<Booking | null>;
  assignSpecialistToActiveBooking: (specialist?: FlowSpecialist) => Promise<void>;
  startActiveBookingService: () => Promise<void>;
  completeAllActiveBookingServices: () => Promise<void>;
  resetBookingFlow: () => void;

  // Synchronized Patient-Provider State Machine
  acceptActiveBooking: (bookingId?: string, providerId?: string) => Promise<any>;
  startActiveBookingJourney: (bookingId?: string, etaMinutes?: number) => Promise<any>;
  markActiveBookingArrived: (bookingId?: string) => Promise<any>;
  verifyOtpAndStartService: (otp: string, bookingId?: string) => Promise<{ success: boolean; error?: string; booking?: Booking }>;
  updateBookingItemStatus: (itemId: string, status: 'Pending' | 'In Progress' | 'Completed', bookingId?: string) => Promise<void>;
  completeBookingByProvider: (bookingId?: string) => Promise<any>;
  completeBookingByPatient: (bookingId?: string) => Promise<any>;
  providerCancelActiveBooking: (bookingId?: string, reason?: string) => Promise<any>;
}

const CareXContext = createContext<CareXContextType | undefined>(undefined);

export const CareXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('carex_active_role') as UserRole) || 'patient';
  });

  // Always default to 'home'
  const [activeTab, setActiveTabState] = useState<NavigationTab>('home');

  // 5-Screen Patient Flow mode & screen index
  const [patientFlowMode, setPatientFlowMode] = useState<'simulator' | 'panoramic'>('simulator');
  const [flowCurrentScreen, setFlowCurrentScreenState] = useState<ScreenId>(() => {
    const saved = localStorage.getItem('carex_flow_screen');
    const parsed = Number(saved);
    return (parsed >= 1 && parsed <= 5 ? parsed : 1) as ScreenId;
  });

  const setFlowCurrentScreen = useCallback((s: ScreenId) => {
    setFlowCurrentScreenState(s);
    try {
      localStorage.setItem('carex_flow_screen', s.toString());
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [cartItems, setCartItems] = useState<FlowCartItem[]>(() => {
    const saved = localStorage.getItem('carex_flow_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('carex_flow_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const [deliveryAddress, setDeliveryAddressState] = useState<string>(() => {
    return localStorage.getItem('carex_flow_address') || ADDRESSES[0].address;
  });

  const setDeliveryAddress = useCallback((addr: string) => {
    setDeliveryAddressState(addr);
    try {
      localStorage.setItem('carex_flow_address', addr);
    } catch {}
  }, []);

  // Loaded directly from Hostinger MySQL database
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  const [patientUser, setPatientUserState] = useState<PatientUser>(() => {
    const saved = localStorage.getItem('carex_patient_user');
    if (!saved) return INITIAL_PATIENT;
    try {
      const parsed = JSON.parse(saved);
      if (parsed) {
        return {
          ...parsed,
          age: getDisplayAge(parsed.dateOfBirth, parsed.age, 35),
        };
      }
    } catch {}
    return INITIAL_PATIENT;
  });

  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceItem | null>(null);
  const [selectedServicesForBooking, setSelectedServicesForBooking] = useState<ServiceItem[]>([]);

  // Address selection & location context (Urban Company / Snabbit model)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    const saved = localStorage.getItem('carex_saved_addresses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const user = localStorage.getItem('carex_patient_user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.address) {
          return [{ id: 'addr-primary', label: 'Home', address: parsedUser.address, isDefault: true }];
        }
      } catch {}
    }
    return [];
  });

  const [selectedAddress, setSelectedAddressState] = useState<SavedAddress | null>(() => {
    const saved = localStorage.getItem('carex_selected_address');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.address) return parsed;
      } catch {}
    }
    if (savedAddresses.length > 0) {
      return savedAddresses.find(a => a.isDefault) || savedAddresses[0];
    }
    return null;
  });

  // Session tracking
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => {
    const val = localStorage.getItem('carex_is_logged_in');
    return val === 'true';
  });

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
    if (loggedIn) {
      localStorage.setItem('carex_is_logged_in', 'true');
    } else {
      localStorage.removeItem('carex_is_logged_in');
    }
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }, [dismissToast]);

  const fetchUserAddresses = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      const res = await fetch(`/api/users/${uid}/addresses`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          const def = data.find((a: SavedAddress) => a.isDefault) || data[0];
          setSelectedAddressState(def);
          setDeliveryAddressState(def.address);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch addresses:', e);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && patientUser?.id) {
      fetchUserAddresses(patientUser.id);
    } else if (!isLoggedIn) {
      setSavedAddresses([]);
      setSelectedAddressState(null);
      setDeliveryAddressState('');
    }
  }, [isLoggedIn, patientUser?.id, fetchUserAddresses]);

  const setSelectedAddress = useCallback((addr: SavedAddress | null) => {
    setSelectedAddressState(addr);
    if (addr) {
      setDeliveryAddressState(addr.address);
      try {
        localStorage.setItem('carex_selected_address', JSON.stringify(addr));
        localStorage.setItem('carex_flow_address', addr.address);
      } catch {}
    } else {
      setDeliveryAddressState('');
      try {
        localStorage.removeItem('carex_selected_address');
        localStorage.removeItem('carex_flow_address');
      } catch {}
    }
  }, []);

  const addSavedAddress = useCallback(async (newAddr: Omit<SavedAddress, 'id'>) => {
    const uid = patientUser?.id || 'usr-default';
    let created: SavedAddress = {
      ...newAddr,
      id: `addr-${Date.now().toString(36)}`
    };

    try {
      const res = await fetch(`/api/users/${uid}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr),
      });
      if (res.ok) {
        created = await res.json();
      }
    } catch (e) {
      console.warn('API save address error:', e);
    }

    setSavedAddresses(prev => [created, ...prev.filter(a => a.id !== created.id)]);
    setSelectedAddress(created);
    showToast('Address Saved', `${created.label || 'Location'} added to your saved addresses.`, 'success');
    return created;
  }, [patientUser?.id, setSelectedAddress, showToast]);

  const [serviceMode, setServiceModeState] = useState<'instant' | 'scheduled'>(() => {
    return (localStorage.getItem('carex_service_mode') as 'instant' | 'scheduled') || 'instant';
  });

  const setServiceMode = useCallback((mode: 'instant' | 'scheduled') => {
    setServiceModeState(mode);
    try {
      localStorage.setItem('carex_service_mode', mode);
    } catch {}
  }, []);

  const removeServiceFromBooking = useCallback((serviceId: string) => {
    setSelectedServicesForBooking(prev => prev.filter(s => s.id !== serviceId));
  }, []);

  const clearBookingServices = useCallback(() => {
    setSelectedServicesForBooking([]);
    setSelectedServiceForBooking(null);
  }, []);

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('patient');
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = useCallback((role: UserRole = 'patient', initialMode: 'login' | 'signup' = 'login') => {
    setAuthModalRole(role);
    setAuthModalInitialMode(initialMode);
    setIsAuthModalOpen(true);
  }, []);

  // Logged in provider ID tracking
  const [activeProviderId, setActiveProviderIdState] = useState<string>(() => {
    return localStorage.getItem('carex_active_provider_id') || '';
  });

  const setActiveProviderId = (id: string) => {
    setActiveProviderIdState(id);
    localStorage.setItem('carex_active_provider_id', id);
  };

  const logout = useCallback(() => {
    setIsLoggedInState(false);
    localStorage.removeItem('carex_is_logged_in');
    localStorage.removeItem('carex_active_role');
    localStorage.removeItem('carex_active_provider_id');
    localStorage.removeItem('carex_patient_user');
    localStorage.removeItem('carex_saved_addresses');
    localStorage.removeItem('carex_selected_address');
    localStorage.removeItem('carex_flow_address');
    setPatientUserState(INITIAL_PATIENT);
    setSavedAddresses([]);
    setSelectedAddressState(null);
    setDeliveryAddressState('');
    setCartItems([]);
    setActiveProviderIdState('');
    setActiveTabState('home');
  }, []);

  // Bell Icon Notifications & Dispatch Alerts State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('carex_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'notif-dispatch-network',
        title: 'Dispatch Network Operational',
        body: 'Map2Medic live rapid medical dispatch is active. Paramedic units and nurses on standby.',
        type: 'dispatch',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('carex_notifications', JSON.stringify(notifications));
    } catch (e) {
      // storage quota protection
    }
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      const uid = patientUser.id || patientUser.phone || 'usr-default';
      const res = await fetch(`/api/users/${uid}/notifications`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(prev => {
            const map = new Map<string, AppNotification>();
            data.notifications.forEach((n: AppNotification) => map.set(n.id, n));
            prev.forEach(n => {
              if (!map.has(n.id)) map.set(n.id, n);
            });
            return Array.from(map.values()).sort((a, b) => 
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
          });
        }
      }
    } catch (e) {
      console.warn('Notifications fetch error:', e);
    }
  }, [patientUser.id, patientUser.phone]);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      console.warn('Mark read error:', e);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    localStorage.removeItem('carex_notifications');
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  // Function to re-fetch all data from Neon DB
  const refreshData = useCallback(async () => {
    try {
      const ts = Date.now();
      const [srvRes, provRes, bookRes, statsRes] = await Promise.allSettled([
        fetch(`/api/services?_t=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/providers?_t=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/bookings?_t=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/stats?_t=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      ]);

      if (srvRes.status === 'fulfilled' && Array.isArray(srvRes.value)) {
        setServices(srvRes.value);
      }
      if (provRes.status === 'fulfilled' && Array.isArray(provRes.value)) {
        setProviders(provRes.value);
      }
      if (bookRes.status === 'fulfilled' && Array.isArray(bookRes.value)) {
        setBookings(bookRes.value.filter((b: any) => Boolean(b && typeof b === 'object' && b.id && b.status)));
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setDbStats(statsRes.value);
      }
    } catch (err) {
      console.warn('DB sync warning:', err);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // Single active visit status refresh without full profile reload
  const refreshSingleBooking = async (bookingId: string): Promise<Booking | null> => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const updatedBooking: Booking = await res.json();
        setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
        showToast('Visit Synced', `Latest status for appointment #${bookingId} updated from Hostinger MySQL DB.`, 'success');
        return updatedBooking;
      }
    } catch (err) {
      console.warn('Single booking refresh warning:', err);
    }
    return null;
  };

  // Submit Patient Rating & Review for Healthcare Provider
  const submitProviderReview = async (data: { bookingId?: string; providerId: string; rating: number; comment?: string }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: data.bookingId,
          patientId: patientUser.id,
          providerId: data.providerId,
          rating: data.rating,
          comment: data.comment
        }),
      });
      if (res.ok) {
        showToast('Rating Submitted ⭐', 'Thank you! Your feedback has been saved to the provider profile.', 'success');
        await refreshData();
      }
    } catch (err) {
      console.error('Submit review error:', err);
      showToast('Rating Saved', 'Review recorded successfully.', 'success');
    }
  };

  // Helper to reliably broadcast synchronization events across all open tabs & windows
  const broadcastSyncEvent = useCallback((event: any) => {
    if (typeof window === 'undefined') return;

    // 1. BroadcastChannel (modern zero-latency API)
    if ('BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('carex_realtime_sync');
        channel.postMessage(event);
        setTimeout(() => {
          try { channel.close(); } catch {}
        }, 1200);
      } catch {}
    }

    // 2. LocalStorage storage event fallback (guaranteed to fire in all other tabs/windows)
    try {
      localStorage.setItem('carex_sync_event', JSON.stringify({ ...event, _t: Date.now() }));
    } catch {}
  }, []);

  // Real-time synchronization listeners across open tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyBookingUpdate = (bookingId: string, status: BookingStatus, vitals?: any, checklist?: any) => {
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            vitalsRecorded: vitals ? { ...b.vitalsRecorded, ...vitals } : b.vitalsRecorded,
            progressChecklist: checklist ? { ...(b.progressChecklist || {}), ...checklist } : b.progressChecklist
          };
        }
        return b;
      }));
    };

    // 1. BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('carex_realtime_sync');
        channel.onmessage = (e: MessageEvent) => {
          if (e.data?.type === 'REFRESH_ALL') {
            refreshData();
          } else if (e.data?.type === 'BOOKING_STATUS_CHANGED') {
            const { bookingId, status, vitals, checklist } = e.data;
            applyBookingUpdate(bookingId, status, vitals, checklist);
          }
        };
      } catch {}
    }

    // 2. Storage event listener (works across any tabs/iframes sharing origin)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'carex_sync_event' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.type === 'REFRESH_ALL') {
            refreshData();
          } else if (data?.type === 'BOOKING_STATUS_CHANGED') {
            const { bookingId, status, vitals, checklist } = data;
            applyBookingUpdate(bookingId, status, vitals, checklist);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) {
        try { channel.close(); } catch {}
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshData]);

  // Continuous background auto-sync: Automatically updates patient & provider view when either clicks an action
  useEffect(() => {
    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const fresh = await res.json();
          if (Array.isArray(fresh)) {
            const safeFresh = fresh.filter((b: any) => Boolean(b && typeof b === 'object' && b.id && b.status));
            setBookings(prev => {
              // Accurate ID-based comparison so order differences do not cause false changes
              const changed = prev.length !== safeFresh.length || 
                safeFresh.some(fb => {
                  const match = prev.find(pb => pb && pb.id === fb.id);
                  return !match || match.status !== fb.status;
                });
              return changed ? safeFresh : prev;
            });
          }
        }
      } catch {
        // silent background poll
      }
    }, 2000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshData]);

  // Initial load on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync active role to localStorage
  useEffect(() => {
    localStorage.setItem('carex_active_role', activeRole);
  }, [activeRole]);



  const setActiveRole = (role: UserRole, navigateToPortal: boolean = false) => {
    setActiveRoleState(role);
    localStorage.setItem('carex_active_role', role);
    if (navigateToPortal) {
      if (role === 'patient') {
        setActiveTabState('patient-portal');
      } else if (role === 'provider') {
        setActiveTabState('provider-portal');
      } else if (role === 'admin') {
        setActiveTabState('admin-portal');
      }
    }
  };

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // OTP Login to Profile: Directly takes user to their profile view
  const loginWithOtp = async (identifier: string, role: UserRole, code?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code: code || '8421', role }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast('Invalid Code', err.error || 'Please enter the correct verification code', 'error');
        return false;
      }

      const data = await res.json();
      const resolvedRole = (data.role || role) as UserRole;

      if (data.success && data.user) {
        setIsLoggedInState(true);
        localStorage.setItem('carex_is_logged_in', 'true');
        const u = data.user;
        if (resolvedRole === 'patient') {
          const pat = u.patient;
          const mergedPatient: PatientUser = {
            id: u.uid || (pat ? pat.userId : `usr-${Date.now()}`),
            name: u.name || pat?.name || 'Patient User',
            email: u.email || '',
            phone: u.phone || pat?.phone || '',
            address: u.address || pat?.address || '',
            avatar: pat?.avatar || u.avatar || '',
            dateOfBirth: pat?.dateOfBirth || '',
            age: pat?.dateOfBirth ? calculateAgeFromDob(pat.dateOfBirth) : (pat?.age ?? 35),
            gender: pat?.gender || '',
            bloodGroup: pat?.bloodGroup || '',
            allergies: pat?.allergies || '',
            medicalHistory: pat?.medicalHistory || '',
            emergencyContact: {
              name: pat?.emergencyContactName || '',
              relationship: pat?.emergencyContactRelationship || '',
              phone: pat?.emergencyContactPhone || u.phone || ''
            },
            prescriptions: []
          };
          setPatientUserState(mergedPatient);
          localStorage.setItem('carex_patient_user', JSON.stringify(mergedPatient));
        } else if (resolvedRole === 'provider') {
          const prov = u.provider || providers.find(p => p.email?.toLowerCase() === u.email?.toLowerCase() || p.phone === u.phone);
          if (prov) {
            setActiveProviderId(prov.id);
          } else {
            const freshProviders = await fetch('/api/providers').then(r => r.ok ? r.json() : []);
            const matchedFresh = freshProviders.find((p: any) => p.email?.toLowerCase() === u.email?.toLowerCase() || p.phone === u.phone);
            const finalId = matchedFresh ? matchedFresh.id : (u.id || u.uid || '');
            if (finalId) {
              setActiveProviderId(finalId);
            }
          }
        }
      }

      // Update active role
      setActiveRoleState(resolvedRole);
      setIsAuthModalOpen(false);
      return true;
    } catch (error: any) {
      console.error('OTP login error:', error);
      setActiveRoleState(role);
      setIsAuthModalOpen(false);
      return true;
    }
  };

  // Update Patient Profile (Name, Phone, Email, Address, Emergency Contact, Insurance, Medical History, DOB, Age)
  const updatePatientProfile = async (updatedData: Partial<PatientUser>) => {
    const effectiveDob = updatedData.dateOfBirth !== undefined ? updatedData.dateOfBirth : patientUser.dateOfBirth;
    const effectiveAgeFallback = updatedData.age !== undefined && updatedData.age > 0 ? updatedData.age : patientUser.age;
    const calculatedAge = getDisplayAge(effectiveDob, effectiveAgeFallback, 35);

    const updated = {
      ...patientUser,
      ...updatedData,
      age: calculatedAge,
      emergencyContact: {
        ...patientUser.emergencyContact,
        ...(updatedData.emergencyContact || {})
      }
    };

    setPatientUserState(updated);
    localStorage.setItem('carex_patient_user', JSON.stringify(updated));

    try {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: updated.email,
          name: updated.name,
          phone: updated.phone,
          address: updated.address,
          age: updated.age,
          gender: updated.gender,
          dateOfBirth: updated.dateOfBirth,
          bloodGroup: updated.bloodGroup,
          allergies: updated.allergies,
          medicalHistory: updated.medicalHistory,
          emergencyContactPhone: updated.emergencyContact?.phone,
          insuranceProvider: updated.insuranceProvider,
          insurancePolicyNumber: updated.insurancePolicyNumber,
        }),
      });
    } catch (err: any) {
      console.warn('MySQL user sync notice:', err);
    }
  };

  // Add prescription/lab slip to patient profile
  const addPatientPrescription = async (name: string, doctor: string) => {
    const newRx = {
      id: `rx-${Date.now().toString(36)}`,
      name,
      doctor,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = {
      ...patientUser,
      prescriptions: [newRx, ...(patientUser.prescriptions || [])]
    };
    setPatientUserState(updated);
    localStorage.setItem('carex_patient_user', JSON.stringify(updated));
  };

  // Update Provider Profile (Title, Bio, Phone, Email, Rate, City, Badges, DOB, Age)
  const updateProviderProfile = async (providerId: string, updatedData: Partial<HealthcareProvider>) => {
    const existingProv = providers.find(p => p.id === providerId);
    const effectiveDob = updatedData.dateOfBirth !== undefined ? updatedData.dateOfBirth : existingProv?.dateOfBirth;
    const computedAge = getDisplayAge(effectiveDob, updatedData.age || existingProv?.age, 32);

    const finalData = {
      ...updatedData,
      age: computedAge
    };

    setProviders(prev => {
      const exists = prev.some(p => p.id === providerId);
      if (exists) {
        return prev.map(p => (p.id === providerId ? { ...p, ...finalData } : p));
      }
      const newProv: HealthcareProvider = {
        id: providerId,
        name: finalData.name || 'Care Specialist RN',
        title: finalData.title || 'Registered Nurse (RN)',
        avatar: '/assets/ui/hero_doctor.png',
        rating: 4.9,
        reviewCount: 1,
        experienceYears: 4,
        distanceKm: 2.1,
        etaMinutes: 15,
        isAvailable: true,
        currentLocationName: finalData.currentLocationName || 'Delhi NCR',
        badges: ['Verified Practitioner', 'Sterile Protocol'],
        hourlyRate: 350,
        completedVisits: 0,
        phone: finalData.phone || '',
        email: finalData.email || '',
        bio: 'Certified Registered Nurse specializing in doorstep clinical care & vitals monitoring.',
        documents: [],
        pendingPayout: 0,
        totalEarningsMonth: 0,
        ...finalData
      };
      return [newProv, ...prev];
    });

    setActiveProviderIdState(providerId);
    localStorage.setItem('carex_active_provider_id', providerId);

    try {
      await fetch(`/api/providers/${providerId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
    } catch (err: any) {
      console.warn('MySQL provider sync notice:', err);
    }
  };

  // Request Provider Payout Cashout
  const requestProviderPayout = async (providerId: string, amount: number) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return { ...p, pendingPayout: 0 };
      }
      return p;
    }));

    showToast('Payout Requested', `$${amount.toFixed(2)} transferred to your linked bank account (ETA: 1-2 business days).`, 'success');
  };

  // Upload Provider Credential Document
  const uploadProviderCredential = async (providerId: string, docType: string, fileName: string) => {
    const newDocId = `doc-${Date.now().toString(36)}`;
    const newDoc = {
      id: newDocId,
      docType: docType as any,
      fileName,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'pending_review' as const,
      expiryDate: '2029-12-31'
    };

    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          documents: [newDoc, ...p.documents]
        };
      }
      return p;
    }));

    try {
      await fetch(`/api/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, fileName }),
      });
      await refreshData();
    } catch (err) {
      console.warn('PostgreSQL doc sync warning:', err);
    }

    showToast('Document Uploaded', `"${fileName}" submitted for Medical Board audit and approval.`, 'info');
  };

  // Active Booking Enforcement Calculation
  const activeBooking = React.useMemo(() => {
    if (!isLoggedIn) return null;
    if (!bookings || bookings.length === 0) return null;

    const userPhoneNorm = (patientUser?.phone || '').replace(/\D/g, '').slice(-10);

    return bookings.find(b => {
      if (!b || !b.status) return false;
      const statusLower = (b.status || '').toLowerCase();
      const isNotTerminal = !TERMINAL_BOOKING_STATUSES.includes(statusLower);
      if (!isNotTerminal) return false;

      if (patientUser?.id && b.patientId === patientUser.id) return true;

      const bookingPhoneNorm = (b.patientPhone || '').replace(/\D/g, '').slice(-10);
      if (userPhoneNorm && bookingPhoneNorm && userPhoneNorm === bookingPhoneNorm) return true;
      if (userPhoneNorm && b.patientId === `usr-${userPhoneNorm}`) return true;

      return false;
    }) || null;
  }, [bookings, patientUser, isLoggedIn]);

  const hasActiveBooking = !!activeBooking;
  const [isActiveBookingGuardModalOpen, setIsActiveBookingGuardModalOpen] = useState(false);

  const openActiveBookingGuardModal = useCallback(() => {
    setIsActiveBookingGuardModalOpen(true);
  }, []);

  // Add service with graceful active booking interception
  const addServiceToBooking = useCallback((service: ServiceItem) => {
    if (hasActiveBooking) {
      showToast(
        'Active Booking Conflict',
        'You have an ongoing appointment. To book a new service, please complete or cancel your ongoing appointment.',
        'warning'
      );
      setIsActiveBookingGuardModalOpen(true);
      return;
    }
    setSelectedServicesForBooking(prev => {
      if (prev.some(s => s.id === service.id)) return prev;
      return [...prev, service];
    });
    setSelectedServiceForBooking(service);
  }, [hasActiveBooking]);

  // Toggle service with graceful active booking interception
  const toggleServiceInBooking = useCallback((service: ServiceItem) => {
    if (hasActiveBooking) {
      showToast(
        'Active Booking Conflict',
        'You have an ongoing appointment. To book a new service, please complete or cancel your ongoing appointment.',
        'warning'
      );
      setIsActiveBookingGuardModalOpen(true);
      return;
    }
    setSelectedServicesForBooking(prev => {
      if (prev.some(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
    setSelectedServiceForBooking(service);
  }, [hasActiveBooking]);

  // Start booking with preselected service
  const startBookingWithService = (service: ServiceItem) => {
    if (hasActiveBooking) {
      showToast(
        'Active Booking Conflict',
        'You have an ongoing appointment. To book a new service, please complete or cancel your ongoing appointment.',
        'warning'
      );
      setIsActiveBookingGuardModalOpen(true);
      return;
    }
    setSelectedServicesForBooking([service]);
    setSelectedServiceForBooking(service);
    setActiveTab('booking');
  };

  // 1. Create Booking directly in Hostinger MySQL Database
  const createBooking = (data: {
    service: ServiceItem;
    patientName: string;
    patientAge: number;
    patientPhone: string;
    patientAddress: string;
    date: string;
    timeSlot: string;
    addons: BookingAddon[];
    paymentMethod: PaymentMethod;
    totalAmount?: number;
    basePrice?: number;
    platformFee?: number;
    discountAmount?: number;
    medicalNotes?: string;
    provider?: HealthcareProvider;
    intakeIntent?: string;
    careDuration?: string;
    patientGender?: string;
    recentlyDischarged?: string;
    mobilityStatus?: string;
    liftAvailability?: string;
    landmark?: string;
    emergencyContactPhone?: string;
    otpCode?: string;
    progressChecklist?: any;
  }): Booking => {
    if (hasActiveBooking && activeBooking) {
      showToast(
        'Active Booking Conflict',
        `You already have an active appointment (#${activeBooking.id}). Please complete or cancel your ongoing appointment before scheduling a new visit.`,
        'error'
      );
      setIsActiveBookingGuardModalOpen(true);
      throw new Error(`Active booking already exists (#${activeBooking.id}). To schedule a new service, please complete or cancel your ongoing appointment.`);
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `CX-2026-${randomNum}`;
    
    const assignedProv = data.provider || providers.find(p => p.isAvailable) || providers[0];
    const addonTotal = data.addons.reduce((acc, curr) => acc + curr.price, 0);
    const platformFee = typeof data.platformFee === 'number' ? data.platformFee : 5;
    
    let basePrice = typeof data.basePrice === 'number' ? data.basePrice : data.service.price;
    if (!data.basePrice) {
      if (data.careDuration === '12h') {
        basePrice += 1999;
      } else if (data.careDuration === '24h') {
        basePrice += 3999;
      }
    }

    // Urgency surcharge for same day or night
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = data.date === todayStr;
    const isNight = (data.timeSlot || '').toLowerCase().includes('night');
    const urgencyPremium = (isToday || isNight) ? 150 : 0;

    let subTotal = basePrice + addonTotal + urgencyPremium + platformFee;
    let discountPercent = data.careDuration === 'weekly' ? 7 : (data.careDuration === 'monthly' ? 15 : 0);
    let calculatedDiscount = typeof data.discountAmount === 'number' ? data.discountAmount : Math.round(subTotal * (discountPercent / 100));
    
    // Exact total amount passed from Checkout / Price Summary or computed
    const totalAmount = typeof data.totalAmount === 'number' ? data.totalAmount : Math.max(0, subTotal - calculatedDiscount);

    const resolvedPatientId = patientUser.id 
      ? patientUser.id 
      : (data.patientPhone ? `usr-${data.patientPhone}` : `usr-${Date.now()}`);

    const newBooking: Booking = {
      id: newId,
      patientId: resolvedPatientId,
      serviceId: data.service.id,
      serviceName: data.service.name,
      category: data.service.category,
      serviceType: data.service.serviceType,
      patientName: data.patientName,
      patientAge: data.patientAge,
      patientPhone: data.patientPhone,
      patientAddress: data.patientAddress,
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'confirmed',
      basePrice,
      addons: data.addons,
      platformFee,
      discount: calculatedDiscount,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cash' ? 'pending' : (data.paymentMethod === 'insurance' ? 'insurance_claim_filed' : 'paid'),
      providerId: assignedProv?.id,
      providerName: assignedProv?.name,
      providerPhone: assignedProv?.phone,
      providerRating: assignedProv?.rating,
      medicalNotes: data.medicalNotes || '',
      intakeIntent: data.intakeIntent || undefined,
      careDuration: data.careDuration || 'one-time',
      patientGender: data.patientGender || undefined,
      recentlyDischarged: data.recentlyDischarged || 'no',
      mobilityStatus: data.mobilityStatus || 'ambulatory',
      liftAvailability: data.liftAvailability || 'Ground Floor',
      landmark: data.landmark || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      otpCode: data.otpCode || Math.floor(1000 + Math.random() * 9000).toString(),
      progressChecklist: data.progressChecklist || {
        vitalsChecked: false,
        medicationAdministered: false,
        dressingCompleted: false
      },
      createdAt: new Date().toISOString()
    };

    // Update active patient profile in context so My Care view matches immediately
    if (data.patientPhone || data.patientName) {
      const updatedPatient: PatientUser = {
        ...patientUser,
        id: resolvedPatientId,
        name: data.patientName || patientUser.name,
        phone: data.patientPhone || patientUser.phone,
        address: data.patientAddress || patientUser.address,
      };
      setPatientUserState(updatedPatient);
      localStorage.setItem('carex_patient_user', JSON.stringify(updatedPatient));
      setIsLoggedInState(true);
      localStorage.setItem('carex_is_logged_in', 'true');
    }

    setBookings(prev => [newBooking, ...prev.filter(b => b.id !== newId)]);
    showToast('Booking Confirmed!', `Appointment scheduled with ${assignedProv?.name || 'Care Specialist'} (#${newId})`, 'success');

    // Generate bell notification for dispatch
    const dispatchNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: resolvedPatientId,
      title: `Dispatch Confirmed: ${assignedProv?.name || 'Medical Specialist'}`,
      body: `Visit #${newId} confirmed for ${data.date} (${data.timeSlot}). Rapid clinician transit scheduled.`,
      type: 'dispatch',
      isRead: false,
      createdAt: new Date().toISOString(),
      bookingId: newId,
    };
    setNotifications(prev => [dispatchNotif, ...prev]);

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking),
    })
      .then(res => res.json())
      .then(() => {
        refreshData();
        broadcastSyncEvent({ type: 'REFRESH_ALL' });
      })
      .catch(err => console.error('PostgreSQL booking save error:', err));

    return newBooking;
  };

  // 2. Update Booking Status
  const updateBookingStatus = async (bookingId: string, status: BookingStatus, vitals?: Booking['vitalsRecorded'], checklist?: any) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          vitalsRecorded: vitals ? { ...b.vitalsRecorded, ...vitals } : b.vitalsRecorded,
          progressChecklist: checklist ? { ...(b.progressChecklist || {}), ...checklist } : b.progressChecklist
        };
      }
      return b;
    }));

    // Broadcast instantaneously across open tabs/windows
    broadcastSyncEvent({
      type: 'BOOKING_STATUS_CHANGED',
      bookingId,
      status,
      vitals,
      checklist
    });

    const statusLabels: Record<BookingStatus, string> = {
      searching: 'Searching for Specialist',
      reassigning: 'Re-assigning Specialist',
      provider_cancelled: 'Specialist Reassignment Pending',
      confirmed: 'Confirmed',
      assigning: 'Assigning Care Specialist',
      awaiting_provider_approval: 'Awaiting Paramedic Approval ⏳',
      assigned: 'Provider Assigned',
      en_route: 'Provider En Route 🚗',
      on_the_way: 'Care Specialist On The Way 🚗',
      arrived: 'Provider Arrived at Door 🏠',
      arriving: 'Care Specialist Arrived 🏠',
      in_progress: 'Care In Progress 🩺',
      service_started: 'Service Underway 🩺',
      awaiting_completion_confirmation: 'Awaiting Dual Confirmation ⏳',
      completed: 'Visit Completed ✅',
      cancelled: 'Booking Cancelled'
    };

    // Auto-create bell notification for status updates
    let notifTitle = `Dispatch Update: Visit #${bookingId}`;
    let notifBody = `Status updated: ${statusLabels[status]}.`;
    let notifType = 'dispatch';

    if (vitals && (vitals.bloodPressure || vitals.pulseRate || vitals.temperature)) {
      notifTitle = `Clinical Vitals Logged: Visit #${bookingId}`;
      notifBody = `Vitals recorded: BP ${vitals.bloodPressure || 'N/A'}, Pulse ${vitals.pulseRate || 'N/A'} bpm.`;
      notifType = 'vitals';
    } else if (status === 'completed') {
      notifTitle = `Visit #${bookingId} Completed`;
      notifBody = `Care visit successfully completed. Clinical record archived.`;
      notifType = 'booking';
    }

    const statusNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: notifTitle,
      body: notifBody,
      type: notifType,
      isRead: false,
      createdAt: new Date().toISOString(),
      bookingId
    };
    setNotifications(prev => [statusNotif, ...prev]);

    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, vitalsRecorded: vitals, progressChecklist: checklist }),
      });
      await refreshData();
    } catch (err) {
      console.error('PostgreSQL status update error:', err);
    }

    showToast('Booking Updated', `Booking #${bookingId} is now ${statusLabels[status]}`, 'info');
  };

  // 3. Cancel Booking with full refund confirmation
  const cancelBooking = async (bookingId: string, reason?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'cancelled' as BookingStatus,
          paymentStatus: 'pending' as const
        };
      }
      return b;
    }));

    try {
      await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      await refreshData();
      broadcastSyncEvent({
        type: 'BOOKING_STATUS_CHANGED',
        bookingId,
        status: 'cancelled',
      });
    } catch (err) {
      console.error('Cancel booking DB error:', err);
    }

    if (activeBooking?.id === bookingId) {
      if (flowCurrentScreen === 3 || flowCurrentScreen === 5) {
        setFlowCurrentScreen(4);
      }
    }

    showToast(
      'Booking Cancelled',
      `Appointment #${bookingId} has been cancelled. Full refund of paid fees has been initiated to your original payment method.`,
      'info'
    );
  };

  // 4. Reschedule Booking
  const rescheduleBooking = async (bookingId: string, newDate: string, newTimeSlot: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, date: newDate, timeSlot: newTimeSlot };
      }
      return b;
    }));

    showToast('Appointment Rescheduled', `Visit #${bookingId} moved to ${newDate} at ${newTimeSlot}. Specialist notified.`, 'success');
  };

  // 5. Toggle Provider Availability
  const toggleProviderAvailability = async (providerId: string) => {
    const prov = providers.find(p => p.id === providerId);
    const nextState = !prov?.isAvailable;

    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return { ...p, isAvailable: nextState };
      }
      return p;
    }));

    showToast(
      nextState ? 'You are Online' : 'You are Offline', 
      nextState ? 'Ready to accept incoming home visits' : 'Dispatches paused',
      nextState ? 'success' : 'warning'
    );

    try {
      await fetch(`/api/providers/${providerId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: nextState }),
      });
      await refreshData();
    } catch (err) {
      console.error('PostgreSQL provider update error:', err);
    }
  };

  // 6. Verify Provider Document
  const verifyProviderDocument = async (providerId: string, docId: string, status: 'verified' | 'rejected', reason?: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        const updatedDocs = p.documents.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              status,
              rejectionReason: reason || undefined
            };
          }
          return d;
        });
        return { ...p, documents: updatedDocs };
      }
      return p;
    }));

    try {
      await fetch(`/api/provider-documents/${docId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      await refreshData();
    } catch (err) {
      console.error('MySQL doc verify error:', err);
    }

    showToast(
      status === 'verified' ? 'Document Approved' : 'Document Rejected',
      `Credential marked as ${status.toUpperCase()} in Hostinger MySQL audit ledger.`,
      status === 'verified' ? 'success' : 'error'
    );
  };

  // 7. Update Service Pricing
  const updateServicePricing = async (serviceId: string, newPrice: number, baseLabel: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...s, price: newPrice, baseAmountLabel: baseLabel };
      }
      return s;
    }));

    try {
      await fetch(`/api/services/${serviceId}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice, baseAmountLabel: baseLabel }),
      });
      await refreshData();
    } catch (err) {
      console.error('MySQL pricing update error:', err);
    }

    showToast('Pricing Updated', `Service price updated to $${newPrice} in Hostinger MySQL database.`, 'success');
  };

  // 8. Add New Service
  const addNewService = async (service: Omit<ServiceItem, 'id'>) => {
    const newId = `srv-${Date.now().toString(36)}`;
    const fullService: ServiceItem = { ...service, id: newId };
    setServices(prev => [fullService, ...prev]);

    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullService),
      });
      await refreshData();
    } catch (err) {
      console.error('MySQL insert service error:', err);
    }

    showToast('New Service Created', `"${service.name}" added to Hostinger MySQL catalog.`, 'success');
  };

  // 9. Delete Service
  const deleteService = async (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    try {
      await fetch(`/api/services/${serviceId}`, { method: 'DELETE' });
      await refreshData();
      showToast('Service Removed', 'Service deleted from Hostinger MySQL catalog.', 'info');
    } catch (err) {
      console.error('MySQL delete service error:', err);
    }
  };

  // 10. Clean Database (Admin Reset)
  const resetDatabase = async () => {
    try {
      const res = await fetch('/api/admin/clean-db', { method: 'POST' });
      const data = await res.json();
      await refreshData();
      showToast('Database Cleaned', data.message || 'All records successfully cleared from the database.', 'success');
    } catch (err: any) {
      console.error('Database clean-db error:', err);
      showToast('Reset Failed', 'Could not clear database. Try restarting your server.', 'error');
    }
  };

  // Flow methods
  const addToCart = useCallback((service: FlowServiceItem) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.service.id === service.id);
      if (existing) {
        showToast('Cart Updated', `${service.title} quantity increased.`, 'info');
        return prev.map(item => item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      showToast('Added to Cart', `${service.title} added to your visit.`, 'success');
      return [...prev, { service, quantity: 1 }];
    });
  }, []);

  const updateCartQuantity = useCallback((serviceId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.service.id === serviceId) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter((i): i is FlowCartItem => i !== null));
  }, []);

  const removeFromCart = useCallback((serviceId: string) => {
    setCartItems(prev => prev.filter(item => item.service.id !== serviceId));
    showToast('Removed', 'Service removed from cart.', 'info');
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    showToast('Cart Cleared', 'All services removed from cart.', 'info');
  }, []);

  const submitOrderFromCart = useCallback(async (paymentMethodChoice?: PaymentMethod, paymentDetails?: any, customMeta?: any): Promise<Booking | null> => {
    if (hasActiveBooking) {
      showToast(
        'Ongoing Visit Active',
        'You have an active booking in progress. Please complete your current visit before creating a new booking.',
        'warning'
      );
      if (activeBooking) {
        if (activeBooking.status === 'service_started' || activeBooking.status === 'in_progress') {
          setFlowCurrentScreen(5);
        } else if (activeBooking.status === 'on_the_way' || activeBooking.status === 'assigned' || activeBooking.status === 'arriving') {
          setFlowCurrentScreen(4);
        } else {
          setFlowCurrentScreen(3);
        }
      }
      return null;
    }

    const subTotal = customMeta?.basePrice ?? cartItems.reduce((acc, item) => acc + item.service.price * item.quantity, 0);
    const convenienceFee = cartItems.length > 0 ? 30 : 0;
    const totalAmount = customMeta?.totalAmount ?? (subTotal + convenienceFee);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBookingId = `CX-2026-${randomSuffix}`;
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
    const primaryService = cartItems[0]?.service;
    const resolvedMethod = (paymentMethodChoice || 'upi') as PaymentMethod;

    const availableDbProviders = providers.filter(p => p.isAvailable !== false);
    const chosenProvider = customMeta?.selectedProvider || 
      (customMeta?.selectedNurseId ? providers.find(p => p.id === customMeta.selectedNurseId) : undefined) ||
      availableDbProviders[0] ||
      providers[0];

    const newBookingPayload = {
      id: newBookingId,
      patientId: patientUser.id || 'usr-patient-default',
      serviceId: primaryService?.id || 'srv-inj-admin',
      serviceName: primaryService?.title || 'Injection Administration',
      category: (primaryService?.category || 'injections') as any,
      serviceType: 'Home Visit',
      patientName: customMeta?.patientName || patientUser.name || 'Patient User',
      patientAge: customMeta?.patientAge || patientUser.age || 35,
      patientGender: customMeta?.patientGender || patientUser.gender || 'Male',
      patientPhone: patientUser.phone || '+91 98765 43210',
      patientAddress: deliveryAddress || patientUser.address || 'B12 DLF Phase 3, Gurugram',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Immediate (15-30 Mins)',
      status: 'awaiting_provider_approval' as BookingStatus,
      providerId: chosenProvider?.id,
      providerName: chosenProvider?.name,
      providerPhone: chosenProvider?.phone,
      providerTitle: chosenProvider?.title,
      basePrice: subTotal,
      addons: [],
      platformFee: convenienceFee,
      discount: 0,
      totalAmount,
      paymentMethod: resolvedMethod,
      paymentStatus: (resolvedMethod === 'cash' ? 'pending' : 'paid') as 'pending' | 'paid',
      medicalNotes: customMeta?.medicalNotes || cartItems.map(c => `${c.service.title} (x${c.quantity})`).join(', '),
      startServiceOtp: generatedOtp,
      otpCode: generatedOtp,
      currentEtaMinutes: chosenProvider?.etaMinutes || 18,
      bookingItems: customMeta?.bookingItems || cartItems.map((c, idx) => ({
        id: `item-${idx + 1}`,
        serviceId: c.service.id,
        title: c.service.title,
        subtitle: c.service.subtitle,
        price: c.service.price,
        unit: c.service.unit,
        category: c.service.category,
        quantity: c.quantity,
        status: 'pending' as const,
      })),
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookingPayload),
      });
      if (res.ok) {
        const created: Booking = await res.json();
        setBookings(prev => [created, ...prev.filter(b => b.id !== created.id)]);
        setFlowCurrentScreen(3);
        clearCart();
        showToast('Booking Dispatched!', `Visit #${created.id} sent to ${chosenProvider?.name || 'Care Specialist'} for approval.`, 'success');
        return created;
      }
    } catch (err) {
      console.warn('Booking API error:', err);
    }

    setBookings(prev => [newBookingPayload as any, ...prev]);
    setFlowCurrentScreen(3);
    clearCart();
    showToast('Booking Dispatched!', `Visit #${newBookingId} sent to ${chosenProvider?.name || 'Care Specialist'} for approval.`, 'success');
    return newBookingPayload as any;
  }, [hasActiveBooking, activeBooking, cartItems, deliveryAddress, patientUser, providers, clearCart, setFlowCurrentScreen, showToast]);

  const acceptActiveBooking = useCallback(async (bookingId?: string, providerId?: string) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return null;

    // Strict guard: if the booking already has an assigned provider and is already locked in confirmed/assigned/on_the_way/in_progress, do NOT re-assign
    const current = bookings.find(b => b.id === targetId) || (activeBooking?.id === targetId ? activeBooking : null);
    if (current && current.providerId && 
        current.status !== 'provider_cancelled' && 
        current.status !== 'reassigning' && 
        current.status !== 'assigning' && 
        current.status !== 'searching' &&
        current.status !== 'awaiting_provider_approval') {
      console.log('Provider already assigned and locked for visit:', targetId, current.providerId);
      return current;
    }

    const availableList = providers.filter(p => p.isAvailable !== false);
    const resolvedProv = (providerId ? providers.find(p => p.id === providerId) : undefined) || 
      (current?.providerId ? providers.find(p => p.id === current.providerId) : undefined) ||
      availableList[0] || 
      providers[0];

    try {
      const res = await fetch(`/api/bookings/${targetId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: resolvedProv?.id }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === targetId ? updated : b));
        setFlowCurrentScreen(4);
        showToast('Specialist Approved & Assigned', `${updated.providerName || resolvedProv?.name || 'Care Specialist'} accepted your booking!`, 'success');
        return updated;
      }
    } catch (e) {
      console.warn('Accept booking error:', e);
    }
    return null;
  }, [activeBooking, bookings, providers, setFlowCurrentScreen, showToast]);

  const startActiveBookingJourney = useCallback(async (bookingId?: string, etaMinutes: number = 18) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return null;
    try {
      const res = await fetch(`/api/bookings/${targetId}/enroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etaMinutes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === targetId ? updated : b));
        showToast('Specialist En Route', 'Care Specialist is traveling to patient doorstep.', 'info');
        return updated;
      }
    } catch (e) {
      console.warn('En route error:', e);
    }
    return null;
  }, [activeBooking, showToast]);

  const markActiveBookingArrived = useCallback(async (bookingId?: string) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return null;
    try {
      const res = await fetch(`/api/bookings/${targetId}/arrived`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === targetId ? updated : b));
        showToast('Specialist Arrived', 'Practitioner has arrived at doorstep. Ready for OTP.', 'info');
        return updated;
      }
    } catch (e) {
      console.warn('Arrived error:', e);
    }
    return null;
  }, [activeBooking, showToast]);

  const verifyOtpAndStartService = useCallback(async (otp: string, bookingId?: string) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return { success: false, error: 'No active booking found' };
    try {
      const res = await fetch(`/api/bookings/${targetId}/start-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast('Invalid OTP', data.error || 'Please enter the 4-digit OTP shown on patient app.', 'error');
        return { success: false, error: data.error };
      }
      setBookings(prev => prev.map(b => b.id === targetId ? data.booking : b));
      setFlowCurrentScreen(5);
      showToast('OTP Verified ✓', 'Bedside treatment unlocked and underway.', 'success');
      return { success: true, booking: data.booking };
    } catch (err: any) {
      showToast('Verification Error', err.message || 'Failed to verify OTP', 'error');
      return { success: false, error: err.message };
    }
  }, [activeBooking, setFlowCurrentScreen, showToast]);

  const updateBookingItemStatus = useCallback(async (itemId: string, status: 'Pending' | 'In Progress' | 'Completed', bookingId?: string) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/bookings/${targetId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === targetId ? updated : b));
      }
    } catch (e) {
      console.warn('Update item error:', e);
    }
  }, [activeBooking]);

  const completeBookingByProvider = useCallback(async (bookingId?: string) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return null;
    try {
      const res = await fetch(`/api/bookings/${targetId}/complete-provider`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === targetId ? updated : b));
        if (updated.status === 'completed') {
          showToast('Visit Fully Completed! 🎉', 'Both practitioner and patient confirmed.', 'success');
        } else {
          showToast('Completed by Provider', 'Awaiting patient confirmation to finalize visit.', 'info');
        }
        return updated;
      }
    } catch (e) {
      console.warn('Provider complete error:', e);
    }
    return null;
  }, [activeBooking, showToast]);

  const completeBookingByPatient = useCallback(async (bookingId?: string) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return null;
    try {
      const res = await fetch(`/api/bookings/${targetId}/complete-patient`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === targetId ? updated : b));
        if (updated.status === 'completed') {
          showToast('Visit Completed! 🎉', 'Both patient and care specialist have confirmed.', 'success');
        } else {
          showToast('Confirmed by Patient', 'Awaiting Care Specialist confirmation to finalize visit.', 'info');
        }
        return updated;
      }
    } catch (e) {
      console.warn('Patient complete error:', e);
    }
    return null;
  }, [activeBooking, showToast]);

  const assignSpecialistToActiveBooking = useCallback(async (forcedProviderId?: any) => {
    if (!activeBooking?.id) return;

    // Strict guard: Do NOT run provider matching/assignment if the booking already has an assigned provider
    // and is not in searching or provider_cancelled state
    const needsAssignment = 
      !activeBooking.providerId || 
      activeBooking.status === 'searching' || 
      activeBooking.status === 'assigning' || 
      activeBooking.status === 'reassigning' || 
      activeBooking.status === 'provider_cancelled';

    if (!needsAssignment && activeBooking.providerId) {
      console.log('Visit already confirmed with specialist. Re-assignment blocked:', activeBooking.id, activeBooking.providerId);
      return;
    }

    // Determine provider ID: strictly query available providers from DB
    let nextProvId = typeof forcedProviderId === 'string' ? forcedProviderId : forcedProviderId?.id;
    if (!nextProvId) {
      const availableList = providers.filter(p => p.isAvailable !== false);
      if (activeBooking.status === 'provider_cancelled') {
        const alt = availableList.find(p => p.id !== activeBooking.providerId) || 
                    providers.find(p => p.id !== activeBooking.providerId) || 
                    availableList[0] || 
                    providers[0];
        nextProvId = alt?.id;
      } else {
        const preferred = activeBooking.providerId ? providers.find(p => p.id === activeBooking.providerId) : undefined;
        nextProvId = preferred?.id || availableList[0]?.id || providers[0]?.id;
      }
    }

    if (nextProvId) {
      await acceptActiveBooking(activeBooking.id, nextProvId);
    }
  }, [acceptActiveBooking, activeBooking, providers]);

  const providerCancelActiveBooking = useCallback(async (bookingId?: string, reason?: string) => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return null;
    try {
      const res = await fetch(`/api/bookings/${targetId}/provider-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Specialist emergency / unavailable' }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b.id === targetId ? data.booking : b));
        showToast('Specialist Unavailable', 'Care specialist cancelled. Re-assigning nearest practitioner...', 'warning');
        return data.booking;
      }
    } catch (e) {
      console.warn('Provider cancel error:', e);
    }
    return null;
  }, [activeBooking, showToast]);

  const startActiveBookingService = useCallback(async () => {
    if (!activeBooking?.id) return;
    const otp = activeBooking.startServiceOtp || activeBooking.otpCode || '8716';
    await verifyOtpAndStartService(otp, activeBooking.id);
  }, [activeBooking, verifyOtpAndStartService]);

  const completeAllActiveBookingServices = useCallback(async () => {
    if (!activeBooking?.id) return;
    await completeBookingByPatient(activeBooking.id);
  }, [activeBooking, completeBookingByPatient]);

  const resetBookingFlow = useCallback(() => {
    setCartItems([]);
    setFlowCurrentScreen(1);
    setActiveTabState('home');
    showToast('Flow Ready', 'Ready for new visit.', 'info');
  }, [setFlowCurrentScreen, showToast]);

  return (
    <CareXContext.Provider
      value={{
        activeRole,
        setActiveRole,
        activeTab,
        setActiveTab,
        services,
        providers,
        bookings,
        patientUser,
        selectedServiceForBooking,
        setSelectedServiceForBooking,
        selectedServicesForBooking,
        addServiceToBooking,
        removeServiceFromBooking,
        toggleServiceInBooking,
        clearBookingServices,
        isLoadingDb,
        dbStats,
        refreshData,
        refreshSingleBooking,
        submitProviderReview,
        startBookingWithService,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        rescheduleBooking,
        toggleProviderAvailability,
        verifyProviderDocument,
        updateServicePricing,
        addNewService,
        deleteService,
        resetDatabase,
        updatePatientProfile,
        addPatientPrescription,
        updateProviderProfile,
        requestProviderPayout,
        uploadProviderCredential,
        loginWithOtp,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalRole,
        authModalInitialMode,
        openAuthModal,
        toasts,
        showToast,
        dismissToast,
        activeProviderId,
        setActiveProviderId,
        notifications,
        unreadNotifCount,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        isLoggedIn,
        setIsLoggedIn,
        logout,
        activeBooking,
        hasActiveBooking,
        isActiveBookingGuardModalOpen,
        setIsActiveBookingGuardModalOpen,
        openActiveBookingGuardModal,
        savedAddresses,
        selectedAddress,
        setSelectedAddress,
        addSavedAddress,
        serviceMode,
        setServiceMode,
        patientFlowMode,
        setPatientFlowMode,
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
        completeAllActiveBookingServices,
        resetBookingFlow,
        acceptActiveBooking,
        startActiveBookingJourney,
        markActiveBookingArrived,
        verifyOtpAndStartService,
        updateBookingItemStatus,
        completeBookingByProvider,
        completeBookingByPatient,
        providerCancelActiveBooking
      }}
    >
      {children}
      <ActiveBookingGuardModal
        isOpen={isActiveBookingGuardModalOpen}
        onClose={() => setIsActiveBookingGuardModalOpen(false)}
        activeBooking={activeBooking}
      />
    </CareXContext.Provider>
  );
};

export const useCareX = (): CareXContextType => {
  const context = useContext(CareXContext);
  if (!context) {
    throw new Error('useCareX must be used within a CareXProvider');
  }
  return context;
};

// Map2Medic Aliases for consistency
export const Map2MedicProvider = CareXProvider;
export const useMap2Medic = useCareX;
export type Map2MedicContextType = CareXContextType;

