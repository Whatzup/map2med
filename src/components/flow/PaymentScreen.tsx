import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { HeaderBar } from './HeaderBar';
import { PaymentMethod } from '../../types/carex';
import { FlowCartItem } from '../../types/flowTypes';

interface PaymentScreenProps {
  cartItems: FlowCartItem[];
  totalAmount: number;
  deliveryAddress?: string;
  onBackToCart: () => void;
  onPaymentSuccess: (method: PaymentMethod, details: any) => Promise<void>;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  cartItems,
  totalAmount,
  deliveryAddress,
  onBackToCart,
  onPaymentSuccess,
  onAddressClick,
  onCallSupportClick
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [upiId, setUpiId] = useState('');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  
  // Bank state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subTotal = cartItems.reduce((acc, i) => acc + i.service.price * i.quantity, 0);
  const convenienceFee = cartItems.length > 0 ? 30 : 0;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handlePayNow = async () => {
    setErrorMsg('');

    // Basic validation
    if (selectedMethod === 'upi' && selectedUpiApp === 'custom') {
      if (!upiId || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g., yourname@okhdfcbank)');
        return;
      }
    }

    if (selectedMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setErrorMsg('Please enter a valid 16-digit card number');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg('Please enter a valid MM/YY expiry');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter a valid 3-digit CVV');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate real-time payment gateway latency
      await new Promise(resolve => setTimeout(resolve, 1200));

      const paymentDetails = {
        method: selectedMethod,
        upiApp: selectedMethod === 'upi' ? selectedUpiApp : undefined,
        upiId: selectedMethod === 'upi' && selectedUpiApp === 'custom' ? upiId : undefined,
        cardLast4: selectedMethod === 'card' ? cardNumber.slice(-4) : undefined,
        bank: selectedMethod === 'net_banking' ? selectedBank : undefined,
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        paidAt: new Date().toISOString()
      };

      await onPaymentSuccess(selectedMethod, paymentDetails);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment transaction failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] text-slate-800 text-left">
      {/* Top Header */}
      <HeaderBar 
        currentAddress={deliveryAddress} 
        onAddressClick={onAddressClick} 
        onCallSupportClick={onCallSupportClick} 
      />

      {/* Title Bar */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={onBackToCart}
          className="flex items-center gap-1.5 text-slate-900 font-bold text-xs hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Checkout &amp; Payment</span>
        </button>

        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Step 2 of 3
        </span>
      </div>

      {/* Scrollable Payment Options Content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 scrollbar-thin pb-36">
        {/* Payable Amount Summary Banner */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] uppercase tracking-wider font-semibold text-emerald-200">
              Total Payable Amount
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {cartItems.length} {cartItems.length === 1 ? 'Service' : 'Services'}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-emerald-200 font-medium">all taxes &amp; fees included</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-600/60 flex items-center justify-between text-[10px] text-emerald-100">
            <span>Subtotal: ₹{subTotal}</span>
            <span>Convenience fee: ₹{convenienceFee}</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Payment Methods Accordion / Options */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">Select Payment Option</h3>

          {/* Option 1: UPI */}
          <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${selectedMethod === 'upi' ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30' : 'border-slate-200 hover:border-slate-300'}`}>
            <label className="flex items-center justify-between p-3.5 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'upi'}
                  onChange={() => setSelectedMethod('upi')}
                  className="w-4 h-4 accent-emerald-700"
                />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">UPI Instant Pay</span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Faster</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm, or UPI ID</p>
                  </div>
                </div>
              </div>
            </label>

            {selectedMethod === 'upi' && (
              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('gpay')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedUpiApp === 'gpay'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Google Pay</span>
                    {selectedUpiApp === 'gpay' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('phonepe')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedUpiApp === 'phonepe'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>PhonePe</span>
                    {selectedUpiApp === 'phonepe' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('paytm')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedUpiApp === 'paytm'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Paytm</span>
                    {selectedUpiApp === 'paytm' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                  </button>
                </div>

                <div className="pt-1">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1 block">
                    Or Enter UPI ID / VPA
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setSelectedUpiApp('custom');
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Credit / Debit Card */}
          <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${selectedMethod === 'card' ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30' : 'border-slate-200 hover:border-slate-300'}`}>
            <label className="flex items-center justify-between p-3.5 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'card'}
                  onChange={() => setSelectedMethod('card')}
                  className="w-4 h-4 accent-emerald-700"
                />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Credit / Debit Card</span>
                    <p className="text-[10px] text-slate-500">Visa, Mastercard, RuPay, Amex</p>
                  </div>
                </div>
              </div>
            </label>

            {selectedMethod === 'card' && (
              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 mb-1 block">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4532 8920 1234 5678"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 mb-1 block">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 mb-1 block">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                      maxLength={4}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 mb-1 block">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name as on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Option 3: Net Banking */}
          <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${selectedMethod === 'net_banking' ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30' : 'border-slate-200 hover:border-slate-300'}`}>
            <label className="flex items-center justify-between p-3.5 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'net_banking'}
                  onChange={() => setSelectedMethod('net_banking')}
                  className="w-4 h-4 accent-emerald-700"
                />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Net Banking</span>
                    <p className="text-[10px] text-slate-500">All major Indian banks supported</p>
                  </div>
                </div>
              </div>
            </label>

            {selectedMethod === 'net_banking' && (
              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <label className="text-[10px] font-semibold text-slate-600 block">
                  Select Your Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                </select>
              </div>
            )}
          </div>

          {/* Option 4: Pay on Visit / Cash */}
          <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${selectedMethod === 'cash' ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30' : 'border-slate-200 hover:border-slate-300'}`}>
            <label className="flex items-center justify-between p-3.5 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'cash'}
                  onChange={() => setSelectedMethod('cash')}
                  className="w-4 h-4 accent-emerald-700"
                />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Pay on Visit (Cash / UPI)</span>
                    <p className="text-[10px] text-slate-500">Pay certified clinician directly upon arrival</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Security & Guarantee Note */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h5 className="text-[10.5px] font-bold text-slate-900 leading-tight">
              100% Safe &amp; Secure Payments
            </h5>
            <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
              RBI Certified • 256-Bit SSL Encryption • Instant refund on cancellation
            </p>
          </div>
        </div>

        {/* Primary Pay CTA Button */}
        <button
          onClick={handlePayNow}
          disabled={isProcessing}
          className="w-full bg-[#084d3e] hover:bg-[#063f33] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Lock className="w-4 h-4 text-emerald-200" />
            )}
            <span className="text-xs uppercase tracking-wider font-extrabold">
              {isProcessing ? 'Processing Secure Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
            </span>
          </div>
          {!isProcessing && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
        </button>
      </div>
    </div>
  );
};
