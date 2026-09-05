import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  Building2,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutWatch,
    setCheckoutWatch,
    createOrder,
    setIsReviewOpen,
    setReviewTarget,
    setSelectedWatch,
    setActiveTab,
    showToast
  } = useMarketplace();

  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace, New York, NY 10001');
  const [paymentMethod, setPaymentMethod] = useState<'wire' | 'card' | 'escrow'>('escrow');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  if (!isCheckoutOpen || !checkoutWatch) return null;

  const shippingFee = 150;
  const escrowFee = 0; // Complimentary
  const total = checkoutWatch.price + shippingFee;

  const handleConfirmOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      try {
        const newOrder = createOrder(checkoutWatch.id, shippingAddress, paymentMethod);
        setCompletedOrder(newOrder);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }

        showToast('Acquisition Confirmed', `Order placed for ${checkoutWatch.brand} ${checkoutWatch.model}!`, 'success');
      } catch (err: any) {
        showToast('Error', err.message || 'Could not process order', 'error');
      }
    }, 1200);
  };

  const handleRateSellerNow = () => {
    if (completedOrder && checkoutWatch) {
      setReviewTarget({
        sellerId: checkoutWatch.sellerId,
        sellerName: checkoutWatch.sellerName,
        watchModel: checkoutWatch.model,
        watchReference: checkoutWatch.referenceNumber,
        orderId: completedOrder.id
      });
      setIsCheckoutOpen(false);
      setCheckoutWatch(null);
      setSelectedWatch(null);
      setIsReviewOpen(true);
    }
  };

  const handleFinish = () => {
    setIsCheckoutOpen(false);
    setCheckoutWatch(null);
    setSelectedWatch(null);
    setActiveTab('orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        id="checkout-modal-content"
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#1C1917]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#967139]" />
            <h2 className="text-sm font-serif font-bold text-[#1C1917] uppercase tracking-wider">
              {completedOrder ? 'Acquisition Secured' : 'Chronos Escrow Protected Checkout'}
            </h2>
          </div>

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCheckoutWatch(null);
            }}
            className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {!completedOrder ? (
            <>
              {/* Watch Summary */}
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] flex items-start gap-4 shadow-2xs">
                <img
                  src={checkoutWatch.images[0]}
                  alt={checkoutWatch.model}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover border border-[#D8D0C5] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-serif font-bold text-[#967139] uppercase tracking-wider">
                    {checkoutWatch.brand}
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#1C1917] truncate">
                    {checkoutWatch.model}
                  </h3>
                  <div className="text-xs text-[#78716C] font-mono mt-0.5">
                    Ref. {checkoutWatch.referenceNumber} • Year {checkoutWatch.year} • {checkoutWatch.condition}
                  </div>
                  <div className="text-xs text-[#78716C] mt-1">
                    Seller: <span className="text-[#1C1917] font-semibold">{checkoutWatch.sellerName}</span> (★ {checkoutWatch.sellerRating})
                  </div>
                </div>
              </div>

              {/* Escrow Guarantee Pill */}
              <div className="p-4 rounded-2xl bg-[#C5A880]/15 border border-[#C5A880]/30 text-xs text-[#57534E] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#78592A] font-serif font-bold">
                  <Lock className="w-4 h-4 text-[#967139]" />
                  <span>100% Escrow Protection</span>
                </div>
                <p className="text-[#57534E] leading-relaxed">
                  Your funds are secured until you receive the timepiece and verify authenticity. The seller receives payment only after successful inspection.
                </p>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                  Insured Delivery Address
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-2">
                  Payment & Escrow Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('escrow')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                      paymentMethod === 'escrow'
                        ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#78592A] font-semibold'
                        : 'bg-[#FFFFFF] border-[#E5DFD5] text-[#57534E]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-[#967139]" /> Escrow Wire
                    </div>
                    <div className="text-[10px] text-[#78716C] mt-1">Direct Bank Wire</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                      paymentMethod === 'card'
                        ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#78592A] font-semibold'
                        : 'bg-[#FFFFFF] border-[#E5DFD5] text-[#57534E]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#967139]" /> Black Card
                    </div>
                    <div className="text-[10px] text-[#78716C] mt-1">AMEX / Visa Infinite</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                      paymentMethod === 'wire'
                        ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#78592A] font-semibold'
                        : 'bg-[#FFFFFF] border-[#E5DFD5] text-[#57534E]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#967139]" /> Swiss Vault
                    </div>
                    <div className="text-[10px] text-[#78716C] mt-1">Geneva Depot</div>
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] text-xs space-y-2 font-mono shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C]">
                  <span>Timepiece Price</span>
                  <span className="text-[#1C1917] font-semibold">${checkoutWatch.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[#78716C]">
                  <span>Armored Insured Shipping</span>
                  <span className="text-[#1C1917] font-semibold">${shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[#3D5A45] font-semibold">
                  <span>Watchmaker Authentication & Escrow</span>
                  <span>COMPLIMENTARY</span>
                </div>
                <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-sm font-bold text-[#1C1917]">
                  <span>Total Amount</span>
                  <span className="text-base text-[#967139]">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <button
                  id="confirm-escrow-payment-btn"
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="w-full bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Securing Escrow Vault...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#C5A880]" />
                      <span>Confirm & Deposit into Escrow (${total.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Order Success State */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-[#3D5A45]/15 text-[#3D5A45] border border-[#3D5A45]/30 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-[#1C1917]">
                  Timepiece Acquisition Secured!
                </h3>
                <p className="text-xs text-[#57534E] mt-1 max-w-md mx-auto leading-relaxed">
                  Funds are secured in Chronos Escrow. The watch has also been automatically added to your private Watch Vault!
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-xs font-mono text-[#967139]">
                  Order Reference: {completedOrder.id}
                </div>
              </div>

              {/* Rate Seller Prompt Box */}
              <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#C5A880]/50 text-left space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 text-[#78592A] font-serif font-bold text-sm">
                  <Star className="w-4 h-4 fill-[#967139] text-[#967139]" />
                  <span>Rate Your Experience with {checkoutWatch.sellerName}</span>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Help the collector community by leaving feedback on this seller's communication, speed, and accuracy.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    id="checkout-rate-seller-btn"
                    onClick={handleRateSellerNow}
                    className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Star className="w-4 h-4 fill-[#C5A880] text-[#C5A880]" />
                    <span>Rate Seller Now</span>
                  </button>

                  <button
                    onClick={handleFinish}
                    className="bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] font-semibold px-4 py-2.5 rounded-xl text-xs border border-[#D8D0C5] transition-colors"
                  >
                    Go to Orders Hub
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
