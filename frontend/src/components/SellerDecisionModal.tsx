import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CheckCircle, XCircle, Award, Store, ShieldCheck, ArrowRight } from 'lucide-react';

export const SellerDecisionModal: React.FC = () => {
  const { pendingSellerDecision, dismissSellerDecision, setActiveTab } = useMarketplace();

  if (!pendingSellerDecision) return null;

  const isApproved = pendingSellerDecision.status === 'approved';

  const handleAcknowledge = async () => {
    if (isApproved) {
      await dismissSellerDecision();
      setActiveTab('seller-hub');
    } else {
      await dismissSellerDecision();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#FAF8F5] rounded-3xl border border-[#DDD6CB] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center animate-scaleUp overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 ${
            isApproved
              ? 'bg-gradient-to-r from-[#C5A059] via-[#E5C384] to-[#C5A059]'
              : 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-600'
          }`}
        />

        {/* Header Icon */}
        <div className="flex justify-center pt-2">
          {isApproved ? (
            <div className="w-16 h-16 rounded-3xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#85642F] shadow-sm">
              <Award className="w-8 h-8 text-[#C5A059]" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
              <XCircle className="w-8 h-8 text-rose-600" />
            </div>
          )}
        </div>

        {/* Title & Tag */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#EDE8E0] text-[#78716C] border border-[#DDD6CB]">
            <ShieldCheck className="w-3 h-3 text-[#C5A059]" />
            <span>THC Concierge • Seller Determination Notice</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-[#1C1917]">
            {isApproved ? 'Seller Application Approved' : 'Seller Application Status'}
          </h2>

          <p className="text-xs text-[#78716C]">
            {isApproved
              ? 'Official determination on your verified seller onboarding request'
              : 'Notice regarding your seller application determination'}
          </p>
        </div>

        {/* Store / Persona Badge */}
        <div className="bg-[#FFFFFF] border border-[#DDD6CB] rounded-2xl p-4 text-left space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs font-bold text-[#1C1917]">
                {pendingSellerDecision.displayName || 'Seller Persona'}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isApproved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {isApproved ? 'Verified Seller' : 'Application Declined'}
            </span>
          </div>

          <p className="text-xs text-[#57534E] leading-relaxed">
            {pendingSellerDecision.message}
          </p>

          {/* Rejection Reason (if rejected) */}
          {!isApproved && pendingSellerDecision.rejectionReason && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wider block text-rose-700">
                Administrative Reason:
              </span>
              <p className="italic">{pendingSellerDecision.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Explanatory Note */}
        <p className="text-xs text-[#78716C] leading-relaxed">
          {isApproved
            ? 'Your Seller persona has been activated with full Seller Hub capabilities. You can now create watch listings and respond to prospective buyer inquiries.'
            : 'You are welcome to continue exploring the marketplace, curating your watch vault, and making purchase offers.'}
        </p>

        {/* Mandatory Explicit Dismiss Action */}
        <div className="pt-2">
          {isApproved ? (
            <button
              type="button"
              id="acknowledge-seller-approval-btn"
              onClick={handleAcknowledge}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-semibold shadow-md transition-all group"
            >
              <span>Acknowledge & Access Seller Hub</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              type="button"
              id="acknowledge-seller-rejection-btn"
              onClick={handleAcknowledge}
              className="w-full py-3 px-6 rounded-xl bg-[#1C1917] hover:bg-[#3D3A36] text-[#FAF8F5] text-xs font-semibold shadow-md transition-all"
            >
              I Understand & Close Notice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
