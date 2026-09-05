import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, DollarSign, Send, ShieldCheck, Check } from 'lucide-react';
import { WatchListing } from '../types';

interface MakeOfferModalProps {
  watch: WatchListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({ watch, isOpen, onClose }) => {
  const { makeOffer, showToast } = useMarketplace();
  const [offerPrice, setOfferPrice] = useState<number>(watch ? Math.round(watch.price * 0.95) : 0);
  const [message, setMessage] = useState('');

  if (!isOpen || !watch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (offerPrice <= 0) {
      showToast('Invalid Offer', 'Please enter a valid offer amount', 'warning');
      return;
    }

    makeOffer(watch.id, offerPrice, message);
    onClose();
  };

  const discountPercent = Math.round(((watch.price - offerPrice) / watch.price) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="make-offer-modal-content"
        className="w-full max-w-md bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-[#1C1917]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
          <h3 className="text-sm font-serif font-bold text-[#1C1917] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#967139]" />
            <span>Submit Direct Offer to Seller</span>
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E0] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watch summary */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
          <img
            src={watch.images[0]}
            alt={watch.model}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-xl object-cover border border-[#D8D0C5]"
          />
          <div>
            <div className="text-xs font-serif font-bold text-[#967139] uppercase tracking-wider">
              {watch.brand}
            </div>
            <h4 className="text-sm font-serif font-bold text-[#1C1917]">{watch.model}</h4>
            <div className="text-xs text-[#78716C] font-mono">
              List Price: ${watch.price.toLocaleString()}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
              Your Offer Amount (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] text-sm font-bold">$</span>
              <input
                id="offer-price-input"
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                min={1}
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-[#1C1917] font-bold focus:outline-none focus:border-[#967139]"
              />
            </div>
            {discountPercent > 0 && (
              <p className="text-[11px] text-[#967139] mt-1 font-mono font-medium">
                {discountPercent}% below listing asking price
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
              Message to Seller ({watch.sellerName})
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Ready for immediate wire transfer upon agreement..."
              className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl p-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] font-semibold py-2.5 rounded-xl text-xs border border-[#D8D0C5] transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-offer-btn"
              type="submit"
              className="flex-1 bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Send Offer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
