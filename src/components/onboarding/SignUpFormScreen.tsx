import React, { useState } from 'react';
import { ChevronLeft, User, Phone, Mail, Lock, MapPin, Award, FileText, CheckCircle } from 'lucide-react';
import { useCareX } from '../../context/CareXContext';
import { UserRole, ProviderSpecialty } from '../../types/carex';

interface SignUpFormScreenProps {
  selectedRole: UserRole;
  onBackToRoleSelection: () => void;
  onSignUpComplete: (role: UserRole) => void;
}

export const SignUpFormScreen: React.FC<SignUpFormScreenProps> = ({
  selectedRole,
  onBackToRoleSelection,
  onSignUpComplete
}) => {
  const { updatePatientProfile, updateProviderProfile } = useCareX();

  // Patient Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientGender, setPatientGender] = useState('Male');

  // Nurse / Specialist Form State
  const [nurseName, setNurseName] = useState('');
  const [nursePhone, setNursePhone] = useState('');
  const [nurseEmail, setNurseEmail] = useState('');
  const [nursePassword, setNursePassword] = useState('');
  const [nurseRegistrationNo, setNurseRegistrationNo] = useState('');
  const [nurseQualification, setNurseQualification] = useState<ProviderSpecialty>('Registered Nurse (RN)');
  const [nurseExperience, setNurseExperience] = useState('3-5 Years');
  const [nurseCity, setNurseCity] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const isNurse = selectedRole === 'provider';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isNurse) {
        // Create Patient Account
        await updatePatientProfile({
          name: patientName.trim() || 'Patient',
          email: patientEmail.trim(),
          phone: patientPhone.trim(),
          address: patientAddress.trim(),
          gender: patientGender,
          dateOfBirth: patientDob
        });
      } else {
        // Create Nurse / Specialist Account
        const pId = 'prov-nurse-new';
        await updateProviderProfile(pId, {
          name: nurseName.trim() || 'Care Specialist RN',
          phone: nursePhone.trim(),
          email: nurseEmail.trim(),
          title: nurseQualification,
          currentLocationName: nurseCity.trim() || 'Delhi NCR'
        });
      }

      // Silent completion with direct redirect to My Profile
      onSignUpComplete(selectedRole);
    } catch (err) {
      console.error('Sign up error:', err);
      onSignUpComplete(selectedRole);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#073b34] via-[#052e28] to-[#041f1b] text-white flex flex-col justify-between p-5 sm:p-7 relative overflow-y-auto scrollbar-thin select-none animate-in fade-in duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-between relative z-10 py-4">
        {/* Top Header with Back Button */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToRoleSelection}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-teal-300/20 text-white transition-all cursor-pointer active:scale-95"
              title="Back to role selection"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <span className="text-[11px] font-bold text-teal-200 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-teal-300/20">
              {isNurse ? 'Nurse Registration' : 'Patient Registration'}
            </span>
          </div>

          <div className="text-center space-y-1 mb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
              {isNurse ? 'Nurse Sign-Up' : 'Patient Sign-Up'}
            </h1>
            <p className="text-xs text-teal-200/80 font-medium">
              {isNurse 
                ? 'Create your practitioner profile to accept doorstep care visits'
                : 'Create your account to book doorstep nurses & paramedics'}
            </p>
          </div>

          {/* DEDICATED SINGLE ROLE FORM ONLY (NO TABS OR TOGGLES) */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isNurse ? (
              /* ================= PATIENT FORM FIELDS ================= */
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-teal-100/90 block">Full Name *</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Mobile Phone *</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Email Address *</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-teal-100/90 block">Create Password *</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-teal-100/90 block">Doorstep Care Address *</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      placeholder="Flat/House No., Building, Area, City"
                      className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Date of Birth</label>
                    <input
                      type="date"
                      value={patientDob}
                      onChange={(e) => setPatientDob(e.target.value)}
                      className="w-full bg-white/10 border border-teal-300/25 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full bg-[#0d4a42] border border-teal-300/25 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* ================= NURSE FORM FIELDS ================= */
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-teal-100/90 block">Full Legal Name *</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={nurseName}
                      onChange={(e) => setNurseName(e.target.value)}
                      placeholder="e.g. Nurse Anjali Verma"
                      className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Mobile Phone *</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={nursePhone}
                        onChange={(e) => setNursePhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Email Address *</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={nurseEmail}
                        onChange={(e) => setNurseEmail(e.target.value)}
                        placeholder="anjali.nurse@example.com"
                        className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-teal-100/90 block">Create Password *</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={nursePassword}
                      onChange={(e) => setNursePassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-teal-100/90 block">
                    Nursing Council Registration / License No. *
                  </label>
                  <div className="relative flex items-center">
                    <FileText className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={nurseRegistrationNo}
                      onChange={(e) => setNurseRegistrationNo(e.target.value)}
                      placeholder="e.g. INC-RN-2024-8841"
                      className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md font-medium font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Qualification *</label>
                    <div className="relative flex items-center">
                      <Award className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none z-10" />
                      <select
                        value={nurseQualification}
                        onChange={(e) => setNurseQualification(e.target.value as ProviderSpecialty)}
                        className="w-full bg-[#0d4a42] border border-teal-300/25 text-white rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                      >
                        <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                        <option value="Pediatric Nurse">Pediatric Nurse</option>
                        <option value="Licensed Physiotherapist">Licensed Physiotherapist</option>
                        <option value="General Physician (MD)">General Physician (MD)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-teal-100/90 block">Service Area / City *</label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={nurseCity}
                        onChange={(e) => setNurseCity(e.target.value)}
                        placeholder="e.g. Gurugram, Delhi NCR"
                        className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-md font-medium"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>{isNurse ? 'Complete Nurse Sign-Up' : 'Complete Patient Sign-Up'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[11px] text-teal-200/60 font-medium">
            By signing up, you agree to Map2Medic's Clinical Care Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
