import React, { useState, useEffect } from 'react';
import { useCareX } from '../../context/CareXContext';
import { getDisplayAge } from '../../lib/dateUtils';
import { HeaderBar } from '../flow/HeaderBar';
import { 
  HeartPulse, 
  MapPin, 
  User, 
  FileText, 
  Activity, 
  AlertCircle, 
  ChevronDown,
  ChevronUp,
  ShieldCheck, 
  Download,
  Plus,
  Edit3,
  X,
  PhoneCall,
  AlertTriangle,
  FileCheck,
  Check,
  LogOut,
  Camera
} from 'lucide-react';

export const PatientPortalView: React.FC = () => {
  const { 
    patientUser, 
    updatePatientProfile,
    addPatientPrescription,
    showToast,
    logout,
    savedAddresses,
    selectedAddress,
    setSelectedAddress,
    addSavedAddress
  } = useCareX();

  // Accordion state for profile sections - ALL COLLAPSED BY DEFAULT
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: false,
    addresses: false,
    medical: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Logout confirmation modal state
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Add Address Inline Form state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState<'HOME' | 'WORK' | 'PARENTS' | 'OTHER'>('HOME');
  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressLandmark, setNewAddressLandmark] = useState('');

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDoctor, setNewDocDoctor] = useState('');

  // Edit Profile Form State
  const [editName, setEditName] = useState(patientUser.name);
  const [editEmail, setEditEmail] = useState(patientUser.email);
  const [editPhone, setEditPhone] = useState(patientUser.phone);
  const [editAddress, setEditAddress] = useState(patientUser.address);
  const [editAvatar, setEditAvatar] = useState(patientUser.avatar || '');
  const [editGender, setEditGender] = useState<string>(patientUser.gender || 'Male');
  const [editDob, setEditDob] = useState(patientUser.dateOfBirth || '');
  const [editBloodGroup, setEditBloodGroup] = useState(patientUser.bloodGroup || '');
  const [editAllergies, setEditAllergies] = useState(patientUser.allergies || '');
  const [editMedicalHistory, setEditMedicalHistory] = useState(patientUser.medicalHistory || '');
  const [editEmergencyName, setEditEmergencyName] = useState(patientUser.emergencyContact?.name || '');
  const [editEmergencyRel, setEditEmergencyRel] = useState(patientUser.emergencyContact?.relationship || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(patientUser.emergencyContact?.phone || '');
  const [editInsuranceProvider, setEditInsuranceProvider] = useState(patientUser.insuranceProvider || '');
  const [editInsurancePolicy, setEditInsurancePolicy] = useState(patientUser.insurancePolicyNumber || '');

  useEffect(() => {
    setEditName(patientUser.name);
    setEditEmail(patientUser.email);
    setEditPhone(patientUser.phone);
    setEditAddress(patientUser.address);
    setEditAvatar(patientUser.avatar || '');
    setEditDob(patientUser.dateOfBirth || '');
    setEditGender(patientUser.gender || 'Male');
    setEditBloodGroup(patientUser.bloodGroup || 'O+');
    setEditAllergies(patientUser.allergies || '');
    setEditMedicalHistory(patientUser.medicalHistory || '');
    setEditEmergencyName(patientUser.emergencyContact?.name || '');
    setEditEmergencyRel(patientUser.emergencyContact?.relationship || '');
    setEditEmergencyPhone(patientUser.emergencyContact?.phone || '');
    setEditInsuranceProvider(patientUser.insuranceProvider || '');
    setEditInsurancePolicy(patientUser.insurancePolicyNumber || '');
  }, [patientUser]);

  const handlePatientAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 5MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
        showToast('Photo Selected', 'Save profile changes to apply your photo.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedAge = getDisplayAge(editDob, patientUser.age, 35);
    await updatePatientProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      avatar: editAvatar,
      age: calculatedAge,
      gender: editGender,
      dateOfBirth: editDob,
      bloodGroup: editBloodGroup,
      allergies: editAllergies,
      medicalHistory: editMedicalHistory,
      emergencyContact: {
        name: editEmergencyName,
        relationship: editEmergencyRel,
        phone: editEmergencyPhone
      },
      insuranceProvider: editInsuranceProvider,
      insurancePolicyNumber: editInsurancePolicy
    });
    setIsEditProfileOpen(false);
    showToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    await addPatientPrescription(newDocName, newDocDoctor || 'Attending Physician');
    setIsUploadDocOpen(false);
    setNewDocName('');
    setNewDocDoctor('');
    showToast('Document Uploaded', 'Medical record added to your account.', 'success');
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    try {
      if (addSavedAddress) {
        await addSavedAddress({
          label: newAddressLabel,
          address: newAddressText.trim(),
          landmark: newAddressLandmark.trim(),
          isDefault: false
        });
      }
      setIsAddAddressOpen(false);
      setNewAddressText('');
      setNewAddressLandmark('');
      showToast('Address Saved', `New ${newAddressLabel} address saved to your profile.`, 'success');
    } catch (err) {
      showToast('Address Saved', 'Saved address locally.', 'info');
      setIsAddAddressOpen(false);
    }
  };

  const addressList = (savedAddresses && savedAddresses.length > 0) ? savedAddresses : [
    { id: 'addr-default-1', label: 'HOME', address: patientUser.address || 'B12 DLF Phase 3, Gurugram', isDefault: true },
    { id: 'addr-default-2', label: 'WORK', address: 'Cyber City, Tower B, Sector 25, Gurugram', isDefault: false },
    { id: 'addr-default-3', label: "PARENTS' HOME", address: 'Sector 43, Golf Course Road, Gurugram', isDefault: false },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] text-slate-800 text-left min-h-screen pb-36">
      {/* Top Header */}
      <HeaderBar
        currentAddress={patientUser.address}
        onAddressClick={() => toggleSection('addresses')}
        onCallSupportClick={() => {
          showToast('24/7 Helpline', 'Connecting you to 1-800-MAP2MEDIC support triage...', 'info');
        }}
      />

      <div className="flex-1 px-3.5 py-4 space-y-3.5 max-w-2xl mx-auto w-full">
        {/* ========================================================= */}
        {/* TOP PATIENT PROFILE HEADER CARD                             */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                {patientUser.avatar ? (
                  <img
                    src={patientUser.avatar}
                    alt={patientUser.name || 'Patient'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#084d3e] to-[#047857] text-white font-extrabold text-xl flex items-center justify-center border-2 border-emerald-500 shadow-xs">
                    {patientUser.name ? patientUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User className="w-7 h-7" />}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Patient" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-extrabold text-slate-900 truncate">{patientUser.name || 'Patient Name'}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
                    Verified Patient
                  </span>
                  {patientUser.bloodGroup && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 whitespace-nowrap shrink-0">
                      {patientUser.bloodGroup}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span>{patientUser.phone || 'Phone not set'}</span>
                  {patientUser.email && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[140px]">{patientUser.email}</span>
                    </>
                  )}
                </p>

                <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{patientUser.address || 'Address not set'}</span>
                </p>
              </div>
            </div>

            {/* Subtle Edit Profile Pill Button in Top Card */}
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="shrink-0 py-1.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Edit Profile Details"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INLINE ACCORDION CARD 1: PERSONAL INFORMATION             */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('personal')}
            className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Personal Information
                </h2>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Identity, age, gender &amp; primary contact details
                </p>
              </div>
            </div>

            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              {openSections.personal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Inline Expanded Content */}
          {openSections.personal && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <p className="font-bold text-slate-900">{patientUser.name || 'Not provided'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Primary Phone</span>
                  <p className="font-bold text-slate-900">{patientUser.phone || 'Not provided'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <p className="font-bold text-slate-900 truncate">{patientUser.email || 'Not provided'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Age &amp; Gender</span>
                  <p className="font-bold text-slate-900">
                    {patientUser.age ? `${patientUser.age} Years` : '35 Years'} • {patientUser.gender || 'Male'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                  <p className="font-bold text-slate-900">{patientUser.dateOfBirth || '1991-04-12'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Blood Group</span>
                  <p className="font-bold text-emerald-800">{patientUser.bloodGroup || 'O+'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Designated Emergency Kin</span>
                  <p className="font-bold text-slate-900">
                    {patientUser.emergencyContact?.name || 'Pooja Sharma'} ({patientUser.emergencyContact?.relationship || 'Spouse'})
                    <span className="font-mono text-slate-500 font-normal ml-2">{patientUser.emergencyContact?.phone || '+91 98765 00000'}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Update Personal Details</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* INLINE ACCORDION CARD 2: SAVED DELIVERY ADDRESSES          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('addresses')}
            className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider truncate">
                    Saved Delivery Addresses
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-200 whitespace-nowrap shrink-0">
                    {addressList.length} Saved
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Doorstep locations for nurse &amp; medic dispatch
                </p>
              </div>
            </div>

            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              {openSections.addresses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Inline Expanded Content */}
          {openSections.addresses && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-600 font-medium">
                  Select your primary delivery location for active home visits:
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(true)}
                  className="px-3 py-1.5 bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Add New Address Form Inline */}
              {isAddAddressOpen && (
                <form onSubmit={handleAddNewAddress} className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-950">Add New Saved Address</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Address Tag</label>
                    <div className="flex items-center gap-2">
                      {(['HOME', 'WORK', 'PARENTS', 'OTHER'] as const).map(label => (
                        <button
                          type="button"
                          key={label}
                          onClick={() => setNewAddressLabel(label)}
                          className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            newAddressLabel === label
                              ? 'bg-[#084d3e] text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Full Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      placeholder="Flat/House number, Apartment/Society, Sector, City"
                      className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Nearby Landmark (Optional)</label>
                    <input
                      type="text"
                      value={newAddressLandmark}
                      onChange={(e) => setNewAddressLandmark(e.target.value)}
                      placeholder="Near Metro Station, Opposite Park, etc."
                      className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Clean Address Items Selection List (NO cluttering edit buttons) */}
              <div className="space-y-2.5">
                {addressList.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id || (!selectedAddress && addr.isDefault);

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress?.(addr);
                        showToast('Active Address Selected', `Delivering visits to ${addr.label}.`, 'success');
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-950 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200 whitespace-nowrap shrink-0">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded whitespace-nowrap shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-800 mt-1 leading-snug">
                            {addr.address}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all whitespace-nowrap ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'border border-slate-200 text-slate-600 bg-slate-50'
                        }`}>
                          {isSelected ? 'Selected ✓' : 'Use This'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* INLINE ACCORDION CARD 3: MEDICAL HISTORY & ALLERGIES     */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('medical')}
            className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Medical History &amp; Allergies
                </h2>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Drug allergies, chronic conditions, health insurance &amp; records
                </p>
              </div>
            </div>

            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              {openSections.medical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Inline Expanded Content */}
          {openSections.medical && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
              {/* Allergies & Chronic Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-rose-50/50 rounded-2xl border border-rose-200/80 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Drug Allergies</h4>
                      <p className="text-[9.5px] text-slate-500">Shared with visiting nurses prior to injections</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-rose-950 bg-white p-2.5 rounded-xl border border-rose-100">
                    {patientUser.allergies ? patientUser.allergies : 'No known drug allergies reported'}
                  </p>
                </div>

                <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Chronic Conditions</h4>
                      <p className="text-[9.5px] text-slate-500">Past surgical &amp; medical background</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-emerald-100">
                    {patientUser.medicalHistory ? patientUser.medicalHistory : 'No chronic conditions or past surgical history recorded'}
                  </p>
                </div>
              </div>

              {/* Insurance & Emergency Support */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Health Insurance</h4>
                      <p className="text-[9.5px] text-slate-500">Direct billing &amp; claim verification</p>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{patientUser.insuranceProvider || 'Direct Pay / Self Covered'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Policy ID: {patientUser.insurancePolicyNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Emergency Kin</h4>
                      <p className="text-[9.5px] text-slate-500">Immediate emergency contact</p>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {patientUser.emergencyContact?.name || 'Emergency Contact'} ({patientUser.emergencyContact?.relationship || 'Family'})
                    </p>
                    <p className="text-xs font-mono font-bold text-rose-700">
                      {patientUser.emergencyContact?.phone || '+91 98765 00000'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescriptions & Diagnostic Records */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Prescriptions &amp; Diagnostic Records</h4>
                    <p className="text-[10px] text-slate-500">Official clinical orders and laboratory slips</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadDocOpen(true)}
                    className="px-2.5 py-1.5 bg-[#084d3e] hover:bg-[#063b30] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-200/80 bg-white rounded-xl border border-slate-200/80 px-3">
                  {(patientUser.prescriptions && patientUser.prescriptions.length > 0) ? (
                    patientUser.prescriptions.map(rx => (
                      <div key={rx.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                            <FileCheck className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{rx.name}</h5>
                            <p className="text-[9.5px] text-slate-500 truncate">Doc: {rx.doctor} • Date: {rx.date}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => showToast('Document Downloaded', `Saved "${rx.name}" to your device.`, 'success')}
                          className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Download className="w-3 h-3 text-teal-600" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">No prescriptions or records uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SAFE LOG OUT BUTTON SECTION (At bottom of My Profile)      */}
        {/* ========================================================= */}
        <div className="pt-8 pb-4 flex flex-col items-center border-t border-slate-200/80 mt-8">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full max-w-sm py-2.5 px-4 rounded-xl border border-rose-300 hover:border-rose-400 bg-rose-50/80 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Log Out of Map2Medic</span>
          </button>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Signed in as <span className="font-medium text-slate-600">{patientUser.email || patientUser.phone}</span>
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT PROFILE                                    */}
      {/* ======================================================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
            <div className="p-4 px-5 bg-gradient-to-r from-[#073b34] to-[#0a4a40] text-white relative">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold font-heading">Edit Patient Profile</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Update personal information, medical history &amp; emergency contacts.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="p-3.5 sm:p-4 space-y-2.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Primary Delivery Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Emergency Kin</label>
                  <input
                    type="text"
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Relation</label>
                  <input
                    type="text"
                    value={editEmergencyRel}
                    onChange={(e) => setEditEmergencyRel(e.target.value)}
                    placeholder="Spouse / Parent"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Kin Phone</label>
                  <input
                    type="text"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Known Drug Allergies</label>
                <input
                  type="text"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs, Latex, None"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Medical History &amp; Chronic Conditions</label>
                <textarea
                  rows={2}
                  value={editMedicalHistory}
                  onChange={(e) => setEditMedicalHistory(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes Type II, Asthma, Past surgeries"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: UPLOAD DOCUMENT                                 */}
      {/* ======================================================== */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-3.5 px-4 bg-gradient-to-r from-[#073b34] to-[#0a4a40] text-white relative">
              <button
                type="button"
                onClick={() => setIsUploadDocOpen(false)}
                className="absolute top-3.5 right-3.5 p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold font-heading">Upload Medical Document</h3>
              <p className="text-[10px] text-emerald-100 mt-0.5">
                Add prescription slips, doctor notes, or lab test reports.
              </p>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} className="p-4 space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Document Title</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Cardiologist Prescription - Oct 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Ordering Physician / Hospital</label>
                <input
                  type="text"
                  value={newDocDoctor}
                  onChange={(e) => setNewDocDoctor(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma, Max Healthcare"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 font-medium placeholder:text-[10px] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-emerald-50/50 transition-colors cursor-pointer">
                <FileText className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">Click to select PDF or image file</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, PDF up to 10MB</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Upload &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: LOG OUT CONFIRMATION MODAL                      */}
      {/* ======================================================== */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 text-rose-600" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Log Out Confirmation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to log out of your Map2Medic account? You will need to sign in again to book visits.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  logout();
                  showToast('Logged Out', 'You have been safely signed out.', 'info');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
