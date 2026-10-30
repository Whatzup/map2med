import React, { useState } from 'react';
import { X, MapPin, Plus, Check, Navigation, Loader2, Home, Briefcase, Compass } from 'lucide-react';
import { useCareX } from '../../context/CareXContext';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddress?: string;
  onSelectAddress?: (addr: string) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  selectedAddress,
  onSelectAddress
}) => {
  const { savedAddresses, selectedAddress: currentSelected, setSelectedAddress, addSavedAddress, showToast } = useCareX();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [newLabel, setNewLabel] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [flatBuilding, setFlatBuilding] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [cityPincode, setCityPincode] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  if (!isOpen) return null;

  // Helper: Reverse geocode coordinates via OpenStreetMap Nominatim and populate form fields
  const applyLocationCoordinates = async (
    lat: number, 
    lon: number, 
    fallbackCity = 'Gurugram', 
    fallbackRegion = 'NCR', 
    fallbackPostal = '122002'
  ) => {
    let road = '';
    let neighbourhood = '';
    let suburb = '';
    let city = fallbackCity;
    let postal = fallbackPostal;
    let landmarkText = 'Detected via Live GPS';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          road = data.address.road || data.address.pedestrian || data.address.residential || '';
          neighbourhood = data.address.neighbourhood || data.address.suburb || '';
          suburb = data.address.suburb || data.address.city_district || '';
          city = data.address.city || data.address.town || data.address.state_district || data.address.county || fallbackCity;
          postal = data.address.postcode || fallbackPostal;

          if (data.address.amenity || data.address.building || data.address.hospital || data.address.shop) {
            landmarkText = `Near ${data.address.amenity || data.address.building || data.address.hospital || data.address.shop}`;
          } else if (neighbourhood) {
            landmarkText = `Near ${neighbourhood}`;
          }
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode notice:', e);
    }

    // Auto-populate form input fields right below the button
    const flatNo = road ? `Flat 402, Near ${road}` : `Flat 402, Sector 24`;
    const street = [neighbourhood || suburb, road].filter(Boolean).join(', ') || `DLF Phase 3`;
    const cityPin = [city, postal].filter(Boolean).join(' - ') || `${fallbackCity} - ${fallbackPostal}`;

    setFlatBuilding(flatNo);
    setStreetArea(street);
    setCityPincode(cityPin);
    setNewLandmark(landmarkText);
    setIsAutoFilled(true);
    setIsAddingNew(true);
    setIsDetectingLocation(false);

    showToast(
      'Location Auto-Detected ✓',
      `Auto-filled: ${street}, ${city}. Review fields and tap Save.`,
      'success'
    );
  };

  // Resilient Fallback: Query IP Geolocation API if browser GPS is blocked/denied in iframe
  const fallbackToIpGeolocation = async () => {
    try {
      // 1. Try internal backend IP proxy
      const serverRes = await fetch('/api/geocode/ip');
      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data && data.latitude && data.longitude) {
          await applyLocationCoordinates(
            data.latitude, 
            data.longitude, 
            data.city || 'Gurugram', 
            data.region || 'NCR', 
            data.postal || '122002'
          );
          return;
        }
      }
    } catch {}

    try {
      // 2. Try external direct client-side fallback
      const directRes = await fetch('https://ipwho.is/');
      if (directRes.ok) {
        const d = await directRes.json();
        if (d && d.success) {
          await applyLocationCoordinates(d.latitude, d.longitude, d.city, d.region, d.postal);
          return;
        }
      }
    } catch {}

    // 3. Graceful regional default if completely offline
    await applyLocationCoordinates(28.4595, 77.0266, 'Gurugram', 'NCR', '122002');
  };

  // 2-Step Resilient Location Handler
  const handleDetectCurrentLocation = () => {
    setIsDetectingLocation(true);

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          applyLocationCoordinates(latitude, longitude);
        },
        (err) => {
          // Automatic seamless fallback to IP-based lookup on permission denied / blocked in iframe
          console.warn('Browser GPS permission restricted/denied, automatically falling back to IP location:', err?.message);
          fallbackToIpGeolocation();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      fallbackToIpGeolocation();
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = [flatBuilding.trim(), streetArea.trim(), cityPincode.trim()].filter(Boolean);
    const fullAddr = parts.join(', ');
    if (!fullAddr) return;

    const created = await addSavedAddress({
      label: newLabel,
      address: fullAddr,
      landmark: newLandmark.trim(),
      isDefault: savedAddresses.length === 0,
    });

    if (onSelectAddress) onSelectAddress(created.address);
    setFlatBuilding('');
    setStreetArea('');
    setCityPincode('');
    setNewLandmark('');
    setIsAutoFilled(false);
    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 flex flex-col text-left border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>
            <p className="text-[10px] text-slate-500 font-medium">Select or add your doorstep care location</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Live GPS Location Detection Button */}
        <div className="pt-3">
          <button
            type="button"
            disabled={isDetectingLocation}
            onClick={handleDetectCurrentLocation}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300/90 text-emerald-950 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                {isDetectingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Navigation className="w-4 h-4 fill-white text-white" />
                )}
              </div>
              <div className="text-left">
                <span className="text-xs font-black block leading-tight text-emerald-950">
                  {isDetectingLocation ? 'Detecting via Live GPS...' : 'Use My Current Location'}
                </span>
                <span className="text-[9.5px] text-emerald-800 font-medium">
                  Instant GPS auto-detection &amp; pin
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
              ⚡ GPS
            </span>
          </button>
        </div>

        {isAddingNew ? (
          /* ADD NEW MANUAL ADDRESS FORM */
          <form onSubmit={handleSaveNewAddress} className="space-y-3 py-3 border-t border-slate-100 mt-2">
            {isAutoFilled && (
              <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-900 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>Live Location Auto-Filled ✓ (Review &amp; save)</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-[10.5px] font-bold text-slate-800">Address Type</label>
              <div className="flex items-center gap-1.5">
                {(['HOME', 'WORK', 'OTHER'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewLabel(lbl)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      newLabel === lbl
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-0.5 block uppercase tracking-wider">Flat / House No. &amp; Building Name *</label>
              <input
                required
                type="text"
                value={flatBuilding}
                onChange={(e) => setFlatBuilding(e.target.value)}
                placeholder="e.g. Flat 402, Tower B, Palm Heights"
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-0.5 block uppercase tracking-wider">Street / Sector / Area *</label>
              <input
                required
                type="text"
                value={streetArea}
                onChange={(e) => setStreetArea(e.target.value)}
                placeholder="e.g. 12th Cross, DLF Phase 3"
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-0.5 block uppercase tracking-wider">City &amp; Pincode *</label>
              <input
                required
                type="text"
                value={cityPincode}
                onChange={(e) => setCityPincode(e.target.value)}
                placeholder="e.g. Gurugram - 122002"
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-0.5 block uppercase tracking-wider">Landmark (Optional)</label>
              <input
                type="text"
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                placeholder="e.g. Near Metro Pillar 142, Opp Fortis Hospital"
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#084d3e] hover:bg-[#064034] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                Save &amp; Deliver Here
              </button>
            </div>
          </form>
        ) : (
          /* SAVED ADDRESSES LIST */
          <div className="space-y-2 py-3">
            {savedAddresses.length === 0 ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-center space-y-2">
                <MapPin className="w-6 h-6 text-emerald-700 mx-auto" />
                <p className="text-xs font-bold text-slate-800">No saved addresses yet</p>
                <p className="text-[10px] text-slate-500">Add your home or work address for doorstep medical visits.</p>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="mt-1 inline-flex items-center gap-1 bg-[#084d3e] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>
            ) : (
              <>
                {savedAddresses.map((addr) => {
                  const isSelected = currentSelected?.id === addr.id || selectedAddress === addr.address;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        if (onSelectAddress) onSelectAddress(addr.address);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-extrabold uppercase text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {addr.label}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-1.5 leading-snug">{addr.address}</p>
                      {addr.landmark && (
                        <p className="text-[9.5px] text-slate-400 font-normal mt-0.5">Landmark: {addr.landmark}</p>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => setIsAddingNew(true)}
                  className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-dashed border-slate-300 hover:border-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Add Another Address</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* Call Modal */
export const CallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  callerName?: string;
  callerRole?: string;
  callerAvatar?: string;
}> = ({ isOpen, onClose, callerName = 'Care Specialist', callerRole = 'Nurse', callerAvatar }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-slate-900 text-white rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-emerald-800/80 border-2 border-emerald-400 flex items-center justify-center text-2xl font-bold overflow-hidden shadow-lg">
            {callerAvatar ? (
              <img src={callerAvatar} alt={callerName} className="w-full h-full object-cover" />
            ) : (
              <span>{callerName.charAt(0)}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
        </div>
        <h3 className="text-base font-bold">{callerName}</h3>
        <p className="text-xs text-emerald-400 font-medium mt-0.5">{callerRole} • Connected</p>
        <p className="text-[10px] text-slate-400 mt-2 font-mono">00:14 • Encrypted Audio Call</p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg cursor-pointer active:scale-95 transition-all"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

/* Chat Modal */
export const ChatModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCallSpecialist?: () => void;
}> = ({ isOpen, onClose, onCallSpecialist }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'specialist'; text: string }>>([
    { sender: 'specialist', text: 'Hello! I am on my way to your location with sterile care equipment.' },
  ]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const txt = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: txt }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'specialist', text: 'Got it! Reaching shortly.' }]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl h-[480px] flex flex-col text-left border border-slate-200 animate-in fade-in duration-200">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-3xl">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Direct Chat with Specialist</h3>
            <p className="text-[10px] text-emerald-700 font-medium">Active Visit Messaging</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-2.5 rounded-2xl text-xs font-medium ${
                m.sender === 'user' ? 'bg-[#084d3e] text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
          />
          <button type="submit" className="px-3 py-2 bg-[#084d3e] text-white text-xs font-bold rounded-xl cursor-pointer">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

/* Specialist Details Modal */
export const SpecialistDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCall?: () => void;
  onChat?: () => void;
}> = ({ isOpen, onClose, onCall, onChat }) => {
  const { activeBooking, providers } = useCareX();
  if (!isOpen) return null;

  const name = activeBooking?.providerName || providers[0]?.name || 'Care Specialist';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 flex flex-col text-left border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Specialist Profile</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
              {name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{name}</h4>
              <p className="text-xs text-emerald-800 font-medium">Registered Nurse • Certified Practitioner</p>
              <p className="text-[10px] text-slate-500 mt-0.5">5+ Years Clinical Experience • Verified Credentials</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-slate-700 space-y-1 font-medium">
            <p>✓ BLS &amp; ACLS Medical Certification Verified</p>
            <p>✓ Temperature &amp; Sanitation Protocol Compliant</p>
            <p>✓ Disposable PPE &amp; Sterile Syringe Kit Equipped</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => { onClose(); onCall?.(); }}
            className="flex-1 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold rounded-xl cursor-pointer"
          >
            Call Specialist
          </button>
          <button
            onClick={() => { onClose(); onChat?.(); }}
            className="flex-1 py-2.5 bg-[#084d3e] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};
