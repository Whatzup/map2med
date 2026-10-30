import React, { useState, useMemo } from 'react';
import { useCareX } from '../../context/CareXContext';
import { Booking, ServiceItem, HealthcareProvider } from '../../types/carex';
import { VisitDetailsModal } from '../modals/VisitDetailsModal';
import { ServiceIcon } from '../ServiceIcon';
import { calculateAgeFromDob, getDisplayAge } from '../../lib/dateUtils';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle2, 
  Clock, 
  Upload, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Activity,
  ArrowLeft,
  X,
  Edit3,
  Plus,
  RefreshCw,
  Calendar,
  User,
  FileCheck,
  Camera,
  Award,
  Zap,
  Users,
  Check,
  Trash2,
  Layers,
  Search,
  Sparkles,
  Star,
  Map,
  XCircle,
  Truck,
  LogOut,
  KeyRound
} from 'lucide-react';

export const ProviderPortalView: React.FC = () => {
  const { 
    providers, 
    services,
    bookings, 
    activeProviderId,
    updateBookingStatus, 
    toggleProviderAvailability,
    updateProviderProfile,
    uploadProviderCredential,
    showToast,
    refreshData,
    openAuthModal,
    isLoadingDb,
    setActiveTab,
    logout,
    verifyOtpAndStartService,
    completeBookingByProvider
  } = useCareX();

  const [otpModalBooking, setOtpModalBooking] = useState<Booking | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Route / View Mode: 'profile' (Home Read-Only Profile) vs 'edit-profile' (Dedicated Edit Page)
  const [viewMode, setViewMode] = useState<'profile' | 'edit-profile'>('profile');

  // Collapsible boxes state
  const [isVisitsOpen, setIsVisitsOpen] = useState(true);
  const [isSkillsOpen, setIsSkillsOpen] = useState(true);
  const [isBoardAuditOpen, setIsBoardAuditOpen] = useState(true);

  // Visit Filter state: 'active' | 'cancelled' | 'completed'
  const [visitFilterTab, setVisitFilterTab] = useState<'active' | 'cancelled' | 'completed'>('active');
  const [visitSearchQuery, setVisitSearchQuery] = useState('');

  // Selected Booking Modal
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  // Skill Catalog Search & Category Filter (in Edit Profile mode)
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('all');

  // Modals & Uploads
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<'Medical License' | 'Government ID' | 'BLS / CPR Certification' | 'Malpractice Insurance'>('Medical License');
  const [uploadFileName, setUploadFileName] = useState('');

  // Current logged in provider
  const currentProvider = providers.find(p => p.id === activeProviderId) || providers[0] || null;

  // Edit provider form state
  const [editName, setEditName] = useState(currentProvider?.name || '');
  const [editTitle, setEditTitle] = useState(currentProvider?.title || 'Registered Nurse (RN)');
  const [editBio, setEditBio] = useState(currentProvider?.bio || '');
  const [editPhone, setEditPhone] = useState(currentProvider?.phone || '');
  const [editEmail, setEditEmail] = useState(currentProvider?.email || '');
  const [editRate, setEditRate] = useState(currentProvider?.hourlyRate ? currentProvider.hourlyRate.toString() : '50');
  const [editLocation, setEditLocation] = useState(currentProvider?.currentLocationName || '');
  const [editAvatar, setEditAvatar] = useState(currentProvider?.avatar || '');

  // Keep form fields synced if currentProvider changes
  React.useEffect(() => {
    if (currentProvider) {
      setEditName(currentProvider.name);
      setEditTitle(currentProvider.title);
      setEditBio(currentProvider.bio || '');
      setEditPhone(currentProvider.phone || '');
      setEditEmail(currentProvider.email || '');
      setEditRate(currentProvider.hourlyRate ? currentProvider.hourlyRate.toString() : '50');
      setEditLocation(currentProvider.currentLocationName || '');
      setEditAvatar(currentProvider.avatar || '');
    }
  }, [currentProvider]);

  if (!currentProvider) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 text-slate-900 max-w-md shadow-lg space-y-4">
          <Stethoscope className="w-12 h-12 text-teal-700 mx-auto" />
          <h2 className="text-xl font-bold font-heading">No Healthcare Provider Active</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please register or log in with a Clinician account to view your practitioner profile, manage skills, and review assigned visits.
          </p>
          <button
            onClick={() => openAuthModal('provider', 'signup')}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-xs shadow-md cursor-pointer"
          >
            Register as Care Provider
          </button>
        </div>
      </div>
    );
  }

  // Filter provider's assigned jobs
  const providerJobs = (bookings || []).filter(b => Boolean(b && (b.providerId === currentProvider.id || !b.providerId || b.providerId === 'prov-001')));
  const pendingVisits = providerJobs.filter(b => Boolean(b && b.status && b.status !== 'completed' && b.status !== 'cancelled'));
  const completedVisits = providerJobs.filter(b => Boolean(b && b.status === 'completed'));
  const cancelledVisits = providerJobs.filter(b => Boolean(b && b.status === 'cancelled'));

  // Filtered jobs list based on active tab and search query
  const displayJobs = useMemo(() => {
    let baseList: Booking[] = [];
    if (visitFilterTab === 'completed') baseList = completedVisits;
    else if (visitFilterTab === 'cancelled') baseList = cancelledVisits;
    else baseList = pendingVisits;

    const query = visitSearchQuery.toLowerCase().trim();
    if (!query) return baseList;

    return baseList.filter(job => 
      job.id.toLowerCase().includes(query) ||
      job.patientName.toLowerCase().includes(query) ||
      job.serviceName.toLowerCase().includes(query) ||
      (job.patientPhone && job.patientPhone.toLowerCase().includes(query)) ||
      (job.patientAddress && job.patientAddress.toLowerCase().includes(query))
    );
  }, [visitFilterTab, visitSearchQuery, pendingVisits, completedVisits, cancelledVisits]);

  // Active certified skill badges
  const activeBadges = currentProvider.badges || [];

  // Handle Save Profile
  const handleSaveProfileForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProviderProfile(currentProvider.id, {
        name: editName,
        title: editTitle as any,
        bio: editBio,
        phone: editPhone,
        email: editEmail,
        hourlyRate: parseFloat(editRate) || 50,
        currentLocationName: editLocation,
        avatar: editAvatar
      });
      setViewMode('profile');
      showToast('Profile Saved', 'Your practitioner profile and bio have been updated in the database.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Error saving profile changes.', 'error');
    }
  };

  // Toggle Skill in Profile (Add / Remove)
  const handleToggleSkill = async (service: ServiceItem) => {
    const isAlreadyAdded = activeBadges.some(b => 
      b.toLowerCase() === service.name.toLowerCase() || 
      b.toLowerCase() === service.category.toLowerCase()
    );

    let updatedBadges: string[];
    if (isAlreadyAdded) {
      updatedBadges = activeBadges.filter(b => 
        b.toLowerCase() !== service.name.toLowerCase() && 
        b.toLowerCase() !== service.category.toLowerCase()
      );
      showToast('Skill Detached', `"${service.name}" removed from active profile capabilities.`, 'info');
    } else {
      updatedBadges = [...activeBadges, service.name];
      showToast('Skill Added', `"${service.name}" attached to certified capabilities!`, 'success');
    }

    try {
      await updateProviderProfile(currentProvider.id, {
        badges: updatedBadges
      });
      fetch('/api/provider/skills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: currentProvider.id, badges: updatedBadges })
      }).catch(() => {});
    } catch (err) {
      console.warn('Error saving skills:', err);
    }
  };

  const handleSaveVitalsFromModal = async (bookingId: string, vitals: NonNullable<Booking['vitalsRecorded']>) => {
    try {
      await updateBookingStatus(bookingId, selectedBookingForDetail?.status || 'in_progress', vitals);
      showToast('Vitals Recorded', 'Clinical vitals updated in electronic medical record.', 'success');
    } catch (err: any) {
      showToast('Error Recording Vitals', err.message || 'Could not record vitals.', 'error');
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: any) => {
    try {
      await updateBookingStatus(bookingId, status);
      setSelectedBookingForDetail(prev => prev && prev.id === bookingId ? { ...prev, status } : prev);
    } catch (err: any) {
      showToast('Status Update Error', err.message || 'Could not update status.', 'error');
    }
  };

  // Keep selectedBookingForDetail synced if bookings updates in context
  React.useEffect(() => {
    if (selectedBookingForDetail) {
      const fresh = bookings.find(b => b.id === selectedBookingForDetail.id);
      if (fresh && (fresh.status !== selectedBookingForDetail.status || fresh.vitalsRecorded !== selectedBookingForDetail.vitalsRecorded)) {
        setSelectedBookingForDetail(fresh);
      }
    }
  }, [bookings, selectedBookingForDetail]);

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* VIEW MODE 1: READ-ONLY PROVIDER PROFILE & OPERATIONAL DASHBOARD (HOME PAGE) */}
        {/* ========================================================================= */}
        {viewMode === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Main Clinician Profile Header Card (With Bio included right inside banner) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Top Banner Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Clinician Avatar & Primary Info */}
                <div className="flex items-start gap-5 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={currentProvider.avatar}
                      alt={currentProvider.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-teal-600 shadow-md"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                      currentProvider.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`} title={currentProvider.isAvailable ? 'Online Standby Active' : 'Offline'} />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">{currentProvider.name}</h1>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
                        {currentProvider.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        Board Certified Practitioner
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        {currentProvider.rating} ({currentProvider.reviewCount} Reviews)
                      </span>
                      <span>·</span>
                      <span>{currentProvider.experienceYears} Years Clinical Experience</span>
                      <span>·</span>
                      <span>Rate: ₹{currentProvider.hourlyRate}/hr</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-teal-700" />
                        {currentProvider.phone || '+91 99066 66452'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Mail className="w-3.5 h-3.5 text-teal-700" />
                        {currentProvider.email || 'practitioner@map2medic.com'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-teal-700" />
                        {currentProvider.currentLocationName} (10 km Operational Radius)
                      </span>
                    </div>

                    {/* CLINICAL BACKGROUND & BIO AT TOP INSIDE NAME BANNER */}
                    <div className="pt-2.5 border-t border-slate-100 mt-2">
                      <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider block mb-0.5">Clinical Background &amp; Bio</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {currentProvider.bio || 'Board-certified practitioner specializing in acute medical care, wound management, vitals monitoring, and patient rehabilitation.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch md:self-auto shrink-0">
                  <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">On-Duty Standby:</span>
                    <button
                      onClick={() => toggleProviderAvailability(currentProvider.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        currentProvider.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentProvider.isAvailable ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <button
                    onClick={() => setViewMode('edit-profile')}
                    className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile &amp; Manage Skills</span>
                  </button>

                  <button
                    onClick={logout}
                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    title="Log out of Care Specialist account"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Operational Coverage & Status Summary */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider block">Primary Coverage Zone</span>
                  <p className="font-extrabold text-teal-950 mt-0.5">{currentProvider.currentLocationName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider block">Operational Radius</span>
                  <p className="font-extrabold text-teal-950 mt-0.5">10 km District Dispatch Zone</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider block">Active Certified Skills</span>
                  <p className="font-extrabold text-teal-950 mt-0.5">{activeBadges.length} Certified Procedures</p>
                </div>
              </div>
            </div>

            {/* SECTION 1: VISIT METRICS & SCHEDULED DISPATCHES LIST (TOP / PRIMARY) */}
            <div className="space-y-6">
              
              {/* VISIT METRICS BAR (Active Visits, Completed Visits, Monthly Earnings) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Active Visits</span>
                  <p className="text-2xl font-extrabold text-teal-900 font-mono">{pendingVisits.length}</p>
                  <span className="text-[11px] text-teal-700 font-medium">Pending clinician visits</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Completed Visits</span>
                  <p className="text-2xl font-extrabold text-emerald-900 font-mono">{completedVisits.length}</p>
                  <span className="text-[11px] text-emerald-700 font-medium">Fulfilled patient visits</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Monthly Earnings</span>
                  <p className="text-2xl font-extrabold text-slate-900 font-mono">₹{(currentProvider.totalEarningsMonth || 48500).toLocaleString()}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Verified payout balance</span>
                </div>
              </div>

              {/* SCHEDULED & DISPATCHED VISITS LIST (COLLAPSIBLE) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                <div 
                  onClick={() => setIsVisitsOpen(!isVisitsOpen)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-700" />
                    <h3 className="text-lg font-bold text-slate-900">Scheduled &amp; Dispatched Visits</h3>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {pendingVisits.length} Active
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isVisitsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isVisitsOpen && (
                  <div className="p-6 sm:p-8 pt-0 border-t border-slate-100 space-y-4 mt-2 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <span className="text-xs font-semibold text-slate-500">Filter and search patient visit records:</span>

                      {/* Visit Filter Tabs (Active, Cancelled/Declined, Completed) */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl flex-wrap">
                        {[
                          { id: 'active', label: `Active (${pendingVisits.length})` },
                          { id: 'cancelled', label: `Cancelled/Declined (${cancelledVisits.length})` },
                          { id: 'completed', label: `Completed (${completedVisits.length})` }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisitFilterTab(tab.id as any);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              visitFilterTab === tab.id
                                ? 'bg-teal-700 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Input for Visits */}
                    <div className="relative w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={visitSearchQuery}
                        onChange={(e) => setVisitSearchQuery(e.target.value)}
                        placeholder="Search visits by patient name, ID (#CX-2026...), procedure, phone, or address..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    {/* Render Filtered Visits */}
                    <div className="space-y-3">
                      {displayJobs.length > 0 ? (
                        displayJobs.map((job) => {
                          const stageSteps = [
                            { id: 'confirmed', label: '1. Request', num: 1 },
                            { id: 'assigned', label: '2. Accepted', num: 2 },
                            { id: 'en_route', label: '3. En Route', num: 3 },
                            { id: 'arrived', label: '4. Arrived', num: 4 },
                            { id: 'in_progress', label: '5. In Progress', num: 5 },
                            { id: 'completed', label: '6. Completed', num: 6 },
                          ];

                          const currentStepNum = 
                            job.status === 'confirmed' ? 1 :
                            job.status === 'assigned' ? 2 :
                            job.status === 'en_route' ? 3 :
                            job.status === 'arrived' ? 4 :
                            job.status === 'in_progress' ? 5 :
                            job.status === 'completed' ? 6 : 0;

                          return (
                            <div 
                              key={job.id} 
                              onClick={() => setSelectedBookingForDetail(job)}
                              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-teal-300 transition-all cursor-pointer flex flex-col space-y-3 shadow-2xs group"
                            >
                              {/* Header Row: Service Name with Contextual Icon & Status Chip */}
                              <div className="flex items-start justify-between flex-wrap gap-2 border-b border-slate-200/60 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <ServiceIcon category={job.category} serviceName={job.serviceName} className="w-5 h-5 text-teal-700 shrink-0" />
                                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-teal-900">{job.serviceName}</span>
                                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">#{job.id}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                    job.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : job.status === 'cancelled'
                                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                                        : job.status === 'in_progress'
                                          ? 'bg-teal-100 text-teal-900 border-teal-300 animate-pulse'
                                          : job.status === 'arrived'
                                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                                            : job.status === 'en_route'
                                              ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                              : job.status === 'assigned'
                                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                                : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                  }`}>
                                    {job.status === 'confirmed' ? 'Awaiting Acceptance ⏳' :
                                     job.status === 'assigned' ? 'Accepted · Transit Ready' :
                                     job.status === 'en_route' ? 'En Route 🚗' :
                                     job.status === 'arrived' ? 'Arrived on Site 🏠' :
                                     job.status === 'in_progress' ? 'Care In Progress 🩺' :
                                     job.status === 'completed' ? 'Completed ✅' :
                                     'Cancelled / Declined ❌'}
                                  </span>
                                  <span className="text-xs font-bold font-mono text-teal-900">₹{job.totalAmount}</span>
                                </div>
                              </div>

                              {/* Patient & Time Slot Details */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                <div>
                                  <p>Patient: <strong>{job.patientName}</strong> ({job.patientPhone})</p>
                                  <p className="text-[11px] text-slate-500 truncate"><MapPin className="w-3 h-3 text-teal-600 inline mr-1" />{job.patientAddress}</p>
                                </div>
                                <div>
                                  <p><Calendar className="w-3.5 h-3.5 text-teal-600 inline mr-1" />Slot: <strong>{job.date} · {job.timeSlot}</strong></p>
                                  {job.intakeIntent && (
                                    <p className="text-[11px] text-teal-800 font-medium truncate">Note: {job.intakeIntent}</p>
                                  )}
                                </div>
                              </div>

                              {/* Recorded Vitals Summary if available */}
                              {job?.vitalsRecorded && (job.vitalsRecorded.bloodPressure || job.vitalsRecorded.pulseRate || job.vitalsRecorded.temperature) && (
                                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 font-medium flex items-center gap-3 flex-wrap">
                                  <span className="font-bold flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-teal-700" /> Recorded Vitals:</span>
                                  {job.vitalsRecorded.bloodPressure && <span>BP: <strong>{job.vitalsRecorded.bloodPressure}</strong></span>}
                                  {job.vitalsRecorded.pulseRate && <span>Pulse: <strong>{job.vitalsRecorded.pulseRate}</strong></span>}
                                  {job.vitalsRecorded.spO2 && <span>SpO2: <strong>{job.vitalsRecorded.spO2}</strong></span>}
                                </div>
                              )}

                              {/* PROGRESSIVE LIFECYCLE STEP TRACKER */}
                              {job.status !== 'cancelled' && (
                                <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200/70 space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                    <span className="text-teal-900 font-extrabold flex items-center gap-1">
                                      <Activity className="w-3 h-3 text-teal-700" />
                                      {job.status === 'confirmed' && 'New Request: Patient booking awaiting your approval'}
                                      {job.status === 'assigned' && 'Accepted: Ready to depart for patient address'}
                                      {job.status === 'en_route' && 'Transit In Progress: Traveling to patient address 🚗'}
                                      {job.status === 'arrived' && 'On-Site: Arrived at patient doorstep 🏠'}
                                      {job.status === 'in_progress' && 'Treatment Underway: Administer care & record vitals 🩺'}
                                      {job.status === 'completed' && 'Fulfilled: Electronic clinical record archived ✅'}
                                    </span>
                                    <span className="font-mono text-[9px] text-slate-400">Step {currentStepNum}/6</span>
                                  </div>

                                  <div className="grid grid-cols-6 gap-1 items-center">
                                    {stageSteps.map((s) => {
                                      const isPassed = currentStepNum > s.num;
                                      const isCurrent = currentStepNum === s.num;
                                      return (
                                        <div key={s.id} className="flex flex-col items-center gap-0.5">
                                          <div className={`w-full h-1.5 rounded-full transition-all ${
                                            isPassed 
                                              ? 'bg-emerald-500' 
                                              : isCurrent 
                                                ? 'bg-teal-600 animate-pulse' 
                                                : 'bg-slate-200'
                                          }`} />
                                          <span className={`text-[8px] sm:text-[9px] truncate max-w-full font-bold ${
                                            isCurrent 
                                              ? 'text-teal-900 font-extrabold' 
                                              : isPassed 
                                                ? 'text-emerald-700' 
                                                : 'text-slate-400'
                                          }`}>
                                            {s.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* ACTION ROW: PROGRESSIVE STAGE TRANSITIONS */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                                <span className="text-[11px] text-teal-700 font-bold hover:underline">
                                  Click card to open full clinical chart, address &amp; vitals →
                                </span>

                                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                                  {/* Stage 1: confirmed -> Accept or Decline */}
                                  {job.status === 'confirmed' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateStatus(job.id, 'cancelled');
                                        }}
                                        className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                                        title="Decline visit request"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Decline</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateStatus(job.id, 'assigned');
                                        }}
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                        title="Accept this patient appointment"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Accept Request</span>
                                      </button>
                                    </>
                                  )}

                                  {/* Stage 2: assigned -> Start Travel (En Route) */}
                                  {job.status === 'assigned' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateStatus(job.id, 'en_route');
                                      }}
                                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                    >
                                      <Truck className="w-3.5 h-3.5" />
                                      <span>Start Travel (En Route 🚗)</span>
                                    </button>
                                  )}

                                  {/* Stage 3: en_route -> Arrived */}
                                  {job.status === 'en_route' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateStatus(job.id, 'arrived');
                                      }}
                                      className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                    >
                                      <MapPin className="w-3.5 h-3.5" />
                                      <span>Arrived at Doorstep 🏠</span>
                                    </button>
                                  )}

                                  {/* Stage 4: arrived -> Unlock with Patient OTP */}
                                  {(job.status === 'arrived' || job.status === 'arriving') && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOtpModalBooking(job);
                                        setEnteredOtp('');
                                        setOtpError('');
                                      }}
                                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                    >
                                      <KeyRound className="w-3.5 h-3.5" />
                                      <span>Verify Patient OTP 🔐</span>
                                    </button>
                                  )}

                                  {/* Stage 5: in_progress / service_started -> Complete Visit & Log Vitals */}
                                  {(job.status === 'in_progress' || job.status === 'service_started' || job.status === 'awaiting_completion_confirmation') && (
                                    job.isCompletedByProvider ? (
                                      <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                                          <span>Awaiting Patient Confirmation ⏳</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBookingForDetail(job);
                                          }}
                                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer"
                                        >
                                          Chart
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBookingForDetail(job);
                                          }}
                                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                                        >
                                          <Activity className="w-3.5 h-3.5" />
                                          <span>Log Vitals</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            await completeBookingByProvider(job.id);
                                          }}
                                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Complete Visit (Provider) ✅</span>
                                        </button>
                                      </div>
                                    )
                                  )}

                                  {/* Stage 6: completed */}
                                  {job.status === 'completed' && (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-1">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                          <p className="font-bold text-slate-800">No Visits Found</p>
                          <p>No appointments match the selected filter or search query.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: CERTIFIED SKILLS & MEDICAL BOARD AUDIT (BELOW VISITS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* COLLAPSIBLE BOX 1: CERTIFIED SKILLS & CAPABILITIES */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                <div 
                  onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-700" />
                    <h3 className="text-sm font-bold text-slate-900">Certified Skills &amp; Capabilities</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode('edit-profile');
                      }}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-xl border border-teal-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isSkillsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isSkillsOpen && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-3 mt-1 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Active clinical procedures certified for doorstep dispatches and patient skill matching.
                    </p>

                    {activeBadges.length > 0 ? (
                      <div className="flex flex-col gap-2 pt-1">
                        {activeBadges.map((badge, idx) => (
                          <div
                            key={idx}
                            className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-50/80 text-emerald-950 border border-emerald-200/90 shadow-2xs flex items-center justify-between"
                          >
                            <span className="truncate max-w-[240px]">{badge}</span>
                            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-2">
                        <Award className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700">No Skills Attached Yet</p>
                        <p>Click "Manage" to attach procedures.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* COLLAPSIBLE BOX 2: MEDICAL BOARD AUDIT & CREDENTIALS */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                <div 
                  onClick={() => setIsBoardAuditOpen(!isBoardAuditOpen)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-700" />
                    <h3 className="text-sm font-bold text-slate-900">Medical Board Audit</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUploadDocOpen(true);
                      }}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-xl border border-teal-200"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isBoardAuditOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isBoardAuditOpen && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-3 mt-1 animate-in fade-in duration-150">
                    {(currentProvider.documents || [
                      { id: 'doc-1', docType: 'Medical License', fileName: 'State_Medical_Board_License.pdf', status: 'verified', uploadedAt: '2026-01-15' },
                      { id: 'doc-2', docType: 'BLS / CPR Certification', fileName: 'AHA_CPR_Certification.pdf', status: 'verified', uploadedAt: '2026-02-10' }
                    ]).map((doc) => (
                      <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">{doc.docType}</span>
                          <p className="font-bold text-slate-900 line-clamp-1">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-400">Uploaded {doc.uploadedAt}</p>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          ✓ {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: DEDICATED EDIT PROFILE & SKILLS CATALOG MANAGER PAGE */}
        {/* ========================================================================= */}
        {viewMode === 'edit-profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Page Header with Clean Back Navigation Button */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('profile')}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4 text-teal-700" />
                  <span>Back to Profile</span>
                </button>

                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
                    Edit Practitioner Profile &amp; Manage Skills
                  </h1>
                  <p className="text-xs text-slate-500">
                    Update personal details and manage your certified clinical procedures catalog.
                  </p>
                </div>
              </div>

              <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-2xl border border-teal-200 self-start sm:self-auto">
                {activeBadges.length} Certified Skills Attached
              </span>
            </div>

            {/* SECTION 1: EDIT PERSONAL & PROFESSIONAL DETAILS FORM */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                <span>Personal &amp; Contact Details</span>
              </h3>

              <form onSubmit={handleSaveProfileForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Practitioner Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Title / Specialty Designation</label>
                    <select
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                      <option value="General Physician (MD)">General Physician (MD)</option>
                      <option value="Licensed Physiotherapist">Licensed Physiotherapist</option>
                      <option value="Phlebotomist / Lab Tech">Phlebotomist / Lab Tech</option>
                      <option value="Pediatric Nurse">Pediatric Nurse</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Location / Zone Name</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Background &amp; Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('profile')}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 2: SKILLS & CAPABILITIES CATALOG MANAGEMENT */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                    <Award className="w-3.5 h-3.5 text-teal-600" />
                    <span>Clinical Competency Catalog</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 mt-1">
                    Manage Certified Skills &amp; Capabilities
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attach clinical procedures you are certified to perform. Added skills immediately feed into the platform's multi-service skill-matching logic.
                  </p>
                </div>

                <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-right">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Active Skill Profile</span>
                  <span className="text-base font-extrabold text-emerald-950 font-mono">{activeBadges.length} Certified Procedures</span>
                </div>
              </div>

              {/* Filter & Search Bar for Skills Catalog */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Search clinical procedures (e.g. wound dressing, IV drip, ECG, catheter)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <select
                  value={skillCategoryFilter}
                  onChange={(e) => setSkillCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="basic_nursing">Basic Nursing Care</option>
                  <option value="clinical_procedures">Clinical Procedures</option>
                  <option value="post_hospital_recovery">Post-OP Recovery</option>
                  <option value="elderly_care">Elderly Care</option>
                  <option value="rehab_support">Rehab &amp; Physio</option>
                  <option value="diagnostic_assistance">Diagnostics &amp; Labs</option>
                </select>
              </div>

              {/* Platform Clinical Procedures Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services
                  .filter(srv => {
                    const matchCat = skillCategoryFilter === 'all' || srv.category === skillCategoryFilter;
                    const query = skillSearchQuery.toLowerCase().trim();
                    const matchQuery = !query || srv.name.toLowerCase().includes(query) || srv.description.toLowerCase().includes(query);
                    return matchCat && matchQuery;
                  })
                  .map((srv) => {
                    const isMapped = activeBadges.some(b => 
                      b.toLowerCase() === srv.name.toLowerCase() || 
                      b.toLowerCase() === srv.category.toLowerCase()
                    );

                    return (
                      <div
                        key={srv.id}
                        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                          isMapped
                            ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200">
                              {srv.category.replace(/_/g, ' ')}
                            </span>
                            {isMapped && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-700" />
                                Active Certified Skill
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">{srv.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{srv.description}</p>
                          
                          <div className="text-[10px] text-slate-400 font-semibold pt-1">
                            <span>Est. Duration: {srv.duration} · Payout Rate: ₹{srv.price}</span>
                          </div>
                        </div>

                        {/* Action Toggle Button: Add Skill or Remove Skill */}
                        <button
                          type="button"
                          onClick={() => handleToggleSkill(srv)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                            isMapped
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-teal-700 hover:bg-teal-800 text-white'
                          }`}
                        >
                          {isMapped ? (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Skill</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Skill</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* UPLOAD CREDENTIAL DOCUMENT MODAL */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload Practitioner Credential</h3>
              <button onClick={() => setIsUploadDocOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Credential Type</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Medical License">Medical Board License</option>
                  <option value="BLS / CPR Certification">BLS / CPR Certification</option>
                  <option value="Government ID">Government Photo ID</option>
                  <option value="Malpractice Insurance">Malpractice Insurance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Document File Name</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g. State_Medical_Board_License.pdf"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsUploadDocOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!uploadFileName.trim()) {
                      showToast('Name Required', 'Please enter a document file name.', 'warning');
                      return;
                    }
                    await uploadProviderCredential(currentProvider.id, uploadDocType, uploadFileName);
                    setIsUploadDocOpen(false);
                    setUploadFileName('');
                  }}
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit for Board Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedBookingForDetail && (
        <VisitDetailsModal
          booking={selectedBookingForDetail}
          onClose={() => setSelectedBookingForDetail(null)}
          onSaveVitals={(bId, vitals) => handleSaveVitalsFromModal(bId, vitals)}
          onUpdateStatus={(bId, status) => handleUpdateStatus(bId, status)}
          isProviderView={true}
        />
      )}

      {/* OTP VERIFICATION MODAL TO UNLOCK BEDSIDE TREATMENT */}
      {otpModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Enter Patient Security OTP</h3>
              <p className="text-xs text-slate-500">
                Ask patient <strong>{otpModalBooking.patientName}</strong> for their 4-digit code shown on screen to start treatment.
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => {
                  setEnteredOtp(e.target.value);
                  setOtpError('');
                }}
                placeholder="e.g. 8716"
                className="w-full text-center font-mono text-2xl font-black tracking-widest py-3 border-2 border-emerald-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100"
              />
              {otpError && <p className="text-xs text-rose-600 font-bold text-center">{otpError}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setOtpModalBooking(null);
                  setEnteredOtp('');
                  setOtpError('');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!enteredOtp.trim()) {
                    setOtpError('Please enter the 4-digit OTP.');
                    return;
                  }
                  const res = await verifyOtpAndStartService(enteredOtp, otpModalBooking.id);
                  if (res.success) {
                    setOtpModalBooking(null);
                    setEnteredOtp('');
                    setOtpError('');
                    await refreshData();
                  } else {
                    setOtpError(res.error || 'Invalid OTP code.');
                  }
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Verify &amp; Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
