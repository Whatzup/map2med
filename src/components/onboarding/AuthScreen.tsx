import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Smartphone, ChevronRight } from 'lucide-react';
import { useCareX } from '../../context/CareXContext';

interface AuthScreenProps {
  onLoginSuccess: () => void;
  onGoToRoleSelection: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onGoToRoleSelection }) => {
  const { loginWithOtp } = useCareX();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [useOtp, setUseOtp] = useState<boolean>(false);

  // STRICTLY EMPTY DEFAULT FIELDS (NO PRE-FILLED DATA)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        // Returning user login -> Silent transition directly to main services screen
        await loginWithOtp(identifier, 'patient', otpCode);
        onLoginSuccess();
      } else {
        // Sign-Up transition -> Silent transition to Role Selection
        onGoToRoleSelection();
      }
    } catch (err) {
      console.error('Auth error:', err);
      onLoginSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = () => {
    // Silent social login transition
    setTimeout(() => {
      onLoginSuccess();
    }, 400);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-gradient-to-b from-[#073b34] via-[#052e28] to-[#041f1b] text-white flex flex-col justify-between px-5 py-4 sm:px-6 sm:py-5 overflow-hidden select-none animate-in fade-in duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col justify-between h-full relative z-10">
        {/* Header Section: Logo, Brand Title & Concise "Login to access" */}
        <div className="text-center pt-1">
          <div className="flex items-center justify-center">
            <img 
              src="/map2medic_logo.jpeg" 
              alt="Map2Medic Logo" 
              className="h-11 sm:h-12 w-auto object-contain rounded-xl drop-shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-transform hover:scale-105"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading mt-1.5 leading-none">
            Map2Medic
          </h1>

          <p className="text-xs font-semibold text-teal-200/90 mt-1">
            {authMode === 'login' ? 'Login to access' : 'Sign up to access'}
          </p>
        </div>

        {/* Center Section: Mode Toggle + Compact Form + Social Login */}
        <div className="my-auto space-y-2.5 py-1">
          {/* Quick Mode Toggle Row (Password vs OTP) */}
          {authMode === 'login' && (
            <div className="flex items-center justify-center gap-1.5 p-0.5 bg-white/10 rounded-xl border border-teal-300/20 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setUseOtp(false)}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  !useOtp 
                    ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setUseOtp(true)}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  useOtp 
                    ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>4-Digit OTP</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Email / Mobile Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-teal-100/90 block">
                Email / Mobile Phone
              </label>
              <div className="relative flex items-center">
                <User className="w-3.5 h-3.5 text-teal-300 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or phone"
                  className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition-all font-medium"
                />
              </div>
            </div>

            {/* Password or OTP Field */}
            {!useOtp ? (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-teal-100/90 block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-3.5 h-3.5 text-teal-300 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-9 pr-9 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-0.5 text-teal-300 hover:text-white cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-teal-100/90 block">
                    SMS OTP Code
                  </label>
                </div>
                <div className="relative flex items-center">
                  <Smartphone className="w-3.5 h-3.5 text-teal-300 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter OTP code"
                    className="w-full bg-white/10 border border-teal-300/25 text-white placeholder-teal-200/50 rounded-xl pl-9 pr-3 py-2 text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition-all font-bold"
                  />
                </div>
              </div>
            )}

            {/* Utility Row (Remember Me + Forgot Password) */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-teal-200/90 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-teal-400/30 text-emerald-500 focus:ring-emerald-400 bg-white/10 accent-emerald-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1"
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Login' : 'Continue to Role Selection'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="space-y-2 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-teal-300/20 w-full" />
              <span className="bg-[#052e28] px-2 text-[10px] font-semibold text-teal-200/60 uppercase tracking-wider shrink-0">
                Or login with
              </span>
            </div>

            {/* Google & Apple Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleSocialLogin}
                className="bg-white/10 hover:bg-white/20 border border-teal-300/20 text-white font-bold text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.7-1.3-1.6-1.3-2.6z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleSocialLogin}
                className="bg-white/10 hover:bg-white/20 border border-teal-300/20 text-white font-bold text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.34c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.87-1 3 1.07.08 2.15-.52 2.81-1.34z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Toggle (Sign Up / Log In) */}
        <div className="text-center pt-1 pb-1">
          {authMode === 'login' ? (
            <p className="text-[11px] text-teal-200/90 font-medium">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onGoToRoleSelection()}
                className="text-emerald-400 font-bold hover:underline cursor-pointer ml-1 inline-flex items-center gap-0.5"
              >
                <span>Sign Up &amp; Select Role</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </p>
          ) : (
            <p className="text-[11px] text-teal-200/90 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-emerald-400 font-bold hover:underline cursor-pointer ml-1"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
