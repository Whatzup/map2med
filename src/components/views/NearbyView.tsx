import React, { useState, useMemo } from 'react';
import { useCareX } from '../../context/CareXContext';
import { HealthcareProvider, PatientDemandPoint } from '../../types/carex';
import { INITIAL_PATIENT_DEMAND_POINTS } from '../../data/mockData';
import { 
  MapPin, 
  Search, 
  Star, 
  Navigation, 
  Clock, 
  Phone, 
  ShieldCheck, 
  BadgeCheck, 
  Calendar, 
  Filter,
  CheckCircle2,
  X,
  Zap,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  User,
  Activity
} from 'lucide-react';

export const NearbyView: React.FC = () => {
  const { 
    providers, 
    startBookingWithService, 
    services, 
    showToast, 
    activeRole,
    activeProviderId 
  } = useCareX();

  // -------------------------------------------------------------
  // PATIENT VIEW STATE
  // -------------------------------------------------------------
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderForModal, setSelectedProviderForModal] = useState<HealthcareProvider | null>(null);

  // -------------------------------------------------------------
  // PROVIDER DEMAND MAP STATE (OLA/UBER DRIVER STYLE)
  // -------------------------------------------------------------
  const [demandFilter, setDemandFilter] = useState<'all' | 'within_radius' | 'outer_surge'>('all');
  const [selectedDemandPoint, setSelectedDemandPoint] = useState<PatientDemandPoint | null>(null);

  const currentProvider = providers.find(p => p.id === activeProviderId) || providers[0] || null;

  // Filtered Patient Demand Points for Provider View
  const filteredDemandPoints = useMemo(() => {
    return INITIAL_PATIENT_DEMAND_POINTS.filter(pt => {
      if (demandFilter === 'within_radius') return pt.isWithinRadius;
      if (demandFilter === 'outer_surge') return !pt.isWithinRadius;
      return true;
    });
  }, [demandFilter]);

  const innerDemandPoints = useMemo(() => {
    return INITIAL_PATIENT_DEMAND_POINTS.filter(pt => pt.isWithinRadius);
  }, []);

  const outerSurgeHotspots = useMemo(() => {
    return INITIAL_PATIENT_DEMAND_POINTS.filter(pt => !pt.isWithinRadius);
  }, []);

  // -------------------------------------------------------------
  // RENDER OLA/UBER DRIVER STYLE DEMAND MAP FOR PROVIDER ROLE
  // -------------------------------------------------------------
  if (activeRole === 'provider') {
    return (
      <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live GPS Demand Radar Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                Live Patient Demand &amp; Surge Radar
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Real-time map of patient care dispatches within your 10 km service zone and high-demand surge clusters in outer sectors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Service Zone</span>
                <span className="text-xs font-bold text-slate-800">{currentProvider?.currentLocationName || 'Springfield Central'} (10 km)</span>
              </div>
            </div>
          </div>

          {/* DRIVER APP STYLE RADAR MAP CANVAS */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-2xl border border-slate-800 h-[480px] flex items-center justify-center">
            {/* Radar Grid & Scanning Rings */}
            <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-20 pointer-events-none" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-full border border-teal-500/30 animate-ping opacity-40" />
              <div className="w-[380px] h-[380px] rounded-full border border-teal-500/20" />
              <div className="w-[580px] h-[580px] rounded-full border border-teal-500/10" />
              {/* 10 km Service Radius Boundary Line */}
              <div className="w-[360px] h-[360px] rounded-full border-2 border-dashed border-teal-400/50 absolute flex items-start justify-center pt-2">
                <span className="bg-teal-950 text-teal-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-teal-500/40">
                  10 km Provider Service Radius
                </span>
              </div>
            </div>

            {/* CENTER PROVIDER LOCATION PIN */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30 pointer-events-none">
              <span className="w-12 h-12 rounded-full bg-teal-500/30 animate-ping absolute" />
              <div className="w-11 h-11 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center shadow-2xl">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="bg-slate-900/90 text-teal-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 border border-teal-500/40 shadow-lg">
                Your On-Duty Standby
              </span>
            </div>

            {/* INNER PATIENT DEMAND PINS (<= 10km) */}
            {innerDemandPoints.map((pt, idx) => {
              const offsets = [
                { x: -110, y: -70 },
                { x: 90, y: -90 },
                { x: -80, y: 80 },
                { x: 100, y: 70 }
              ];
              const pos = offsets[idx % offsets.length];

              return (
                <div
                  key={pt.id}
                  onClick={() => setSelectedDemandPoint(pt)}
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`
                  }}
                  className="absolute inset-0 m-auto w-max h-max flex flex-col items-center cursor-pointer group z-20 transition-transform hover:scale-110"
                >
                  <div className="relative">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/40 animate-ping absolute -inset-1" />
                    <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-lg group-hover:bg-emerald-500">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-400/40 text-[10px] font-extrabold text-white shadow-xl mt-1.5 whitespace-nowrap group-hover:border-emerald-300">
                    <span className="text-emerald-300">{pt.patientName}</span> · {pt.distanceKm}km
                  </div>
                </div>
              );
            })}

            {/* OUTER HIGH-DEMAND SURGE HOTSPOTS (> 10km Radius) WITH EXPLICIT AREA LABELS */}
            {outerSurgeHotspots.map((spot, idx) => {
              const outerOffsets = [
                { x: -210, y: -160 },
                { x: 220, y: -150 },
                { x: -220, y: 160 },
                { x: 210, y: 170 }
              ];
              const pos = outerOffsets[idx % outerOffsets.length];

              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedDemandPoint(spot)}
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`
                  }}
                  className="absolute inset-0 m-auto w-max h-max flex flex-col items-center cursor-pointer group z-20 transition-transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 bg-rose-600/95 text-white px-3 py-1.5 rounded-2xl text-[10px] font-extrabold shadow-2xl border border-rose-300 animate-pulse group-hover:bg-rose-500">
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                    <span>{spot.areaName} ({spot.surgeMultiplier})</span>
                  </div>
                  <span className="bg-slate-950/90 text-rose-200 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 border border-rose-500/30">
                    {spot.distanceKm} km away · {spot.requestedProcedure}
                  </span>
                </div>
              );
            })}

            {/* MAP OVERLAY LEGEND & CONTROLS */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none flex-wrap gap-2">
              <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 text-xs font-semibold flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {innerDemandPoints.length} In-Zone Requests (&lt;=10km)
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {outerSurgeHotspots.length} Outer Surge Clusters (&gt;10km)
                </span>
              </div>
            </div>
          </div>

          {/* DEMAND FILTER BUTTONS & ACTIVE DISPATCH LIST */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Active Patient Dispatch Feed</h3>
              
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                {[
                  { id: 'all', label: 'All Demand Points' },
                  { id: 'within_radius', label: 'Within 10km Zone' },
                  { id: 'outer_surge', label: 'Outer Surge Hotspots (>10km)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDemandFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      demandFilter === f.id
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDemandPoints.map((pt) => (
                <div
                  key={pt.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                    pt.isWithinRadius
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                      : 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        pt.isWithinRadius
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}>
                        {pt.isWithinRadius ? 'Within 10 km Zone' : 'Outer Surge Hotspot'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 font-mono">
                        {pt.surgeMultiplier}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{pt.areaName}</h4>
                    <p className="text-xs font-semibold text-slate-700">{pt.patientName}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{pt.requestedProcedure}</p>
                    
                    <div className="text-[10px] text-slate-400 font-medium pt-1">
                      <span>Distance: {pt.distanceKm} km · ETA: ~{pt.etaMinutes} mins</span>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast('Dispatch Accepted', `Navigating to ${pt.areaName} for care visit.`, 'success')}
                    className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Accept Dispatch
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER PATIENT SEARCH FOR PATIENT / ADMIN ROLES
  // -------------------------------------------------------------
  const specialties = [
    { id: 'all', label: 'All Specialties' },
    { id: 'nurse', label: 'Registered Nurses (RN)' },
    { id: 'doctor', label: 'Physicians (MD)' },
    { id: 'physio', label: 'Physiotherapists' },
    { id: 'lab', label: 'Phlebotomy / Lab Techs' }
  ];

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      let matchesSpec = true;
      if (selectedSpecialty === 'nurse') matchesSpec = p.title.toLowerCase().includes('nurse');
      else if (selectedSpecialty === 'doctor') matchesSpec = p.title.toLowerCase().includes('physician') || p.title.toLowerCase().includes('md');
      else if (selectedSpecialty === 'physio') matchesSpec = p.title.toLowerCase().includes('physio');
      else if (selectedSpecialty === 'lab') matchesSpec = p.title.toLowerCase().includes('lab') || p.title.toLowerCase().includes('phleb');

      const matchesDist = p.distanceKm <= maxDistance;
      const matchesAvail = !onlyAvailable || p.isAvailable;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        p.name.toLowerCase().includes(q) || 
        p.title.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q);

      return matchesSpec && matchesDist && matchesAvail && matchesQuery;
    });
  }, [providers, selectedSpecialty, maxDistance, onlyAvailable, searchQuery]);

  const handleBookProvider = (prov: HealthcareProvider) => {
    let matchedSrv = services[0];
    if (prov.title.includes('Physician')) {
      matchedSrv = services.find(s => s.category === 'doctor') || services[0];
    } else if (prov.title.includes('Physio')) {
      matchedSrv = services.find(s => s.category === 'physiotherapy') || services[0];
    } else if (prov.title.includes('Lab') || prov.title.includes('Phleb')) {
      matchedSrv = services.find(s => s.category === 'diagnostics') || services[0];
    } else {
      matchedSrv = services.find(s => s.category === 'nursing') || services[0];
    }

    startBookingWithService(matchedSrv);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Live Geographic Healthcare Dispatch
              </span>
            </div>
            <h1 className="text-3xl font-bold font-heading text-slate-900">
              Nearby Medical Providers &amp; Clinics
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Locate certified healthcare professionals currently on duty within your district. 
              Real-time response times, distance calculations, and immediate dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 shadow-xs">
              <Navigation className="w-4 h-4 text-teal-600" />
              <span>Current Location: <strong className="text-slate-900">Springfield Metro (Radius: {maxDistance}km)</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Radar Map Preview Simulation */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl border border-slate-800 h-80 sm:h-96">
          <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-teal-500/20 animate-ping opacity-30" />
            <div className="w-96 h-96 rounded-full border border-teal-500/20" />
            <div className="w-[500px] h-[500px] rounded-full border border-teal-500/10" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-emerald-400 border-4 border-white shadow-lg shadow-emerald-400/50 animate-bounce" />
              <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                You Are Here
              </span>
            </div>
          </div>

          {filteredProviders.map((p, idx) => {
            const angles = [45, 130, 220, 310, 85];
            const angle = angles[idx % angles.length];
            const dist = 60 + (p.distanceKm * 28);
            const x = Math.cos((angle * Math.PI) / 180) * dist;
            const y = Math.sin((angle * Math.PI) / 180) * dist;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProviderForModal(p)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className="absolute inset-0 m-auto w-max h-max flex flex-col items-center cursor-pointer group z-20 transition-transform hover:scale-110"
              >
                <div className="relative">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-400 shadow-lg group-hover:border-emerald-300"
                  />
                  {p.isAvailable ? (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-900" />
                  )}
                </div>
                <div className="bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-teal-500/30 text-[10px] font-bold text-white shadow-md mt-1 whitespace-nowrap group-hover:bg-teal-700">
                  {p.name.split(',')[0]} • {p.etaMinutes}m
                </div>
              </div>
            );
          })}

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{filteredProviders.length} active practitioners in {maxDistance}km radius</span>
            </div>

            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 hidden sm:flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Avg arrival time: <strong>18 - 25 minutes</strong></span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by provider name, specialty..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {specialties.map(spec => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSpecialty === spec.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Max:</span>
              <input
                type="range"
                min={2}
                max={20}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-20 accent-teal-600 cursor-pointer"
              />
              <span className="font-bold text-slate-800 w-8">{maxDistance}km</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Online Only</span>
            </label>
          </div>
        </div>

        {/* Providers Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(prov => (
            <div
              key={prov.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={prov.avatar}
                      alt={prov.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-600"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      prov.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">{prov.name}</h3>
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-xs font-semibold text-teal-800">{prov.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        ★ {prov.rating}
                      </span>
                      <span>•</span>
                      <span>{prov.experienceYears} yrs exp</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{prov.bio}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Est. ETA: <strong className="text-slate-900">{prov.etaMinutes} mins</strong></span>
                  <span className="font-extrabold text-teal-900 font-mono">${prov.hourlyRate}/hr</span>
                </div>
              </div>

              <button
                onClick={() => handleBookProvider(prov)}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Visit with {prov.name.split(' ')[0]}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
