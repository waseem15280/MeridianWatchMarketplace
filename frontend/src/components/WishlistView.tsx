import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Heart, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Eye, Layers } from 'lucide-react';
import { WatchCard } from './WatchCard';

export const WishlistView: React.FC = () => {
  const { wishlist, listings, clearWishlist, setActiveTab, setSelectedWatch } = useMarketplace();

  const wishlistedWatches = listings.filter((l) => wishlist.includes(l.id));
  const totalWishlistValue = wishlistedWatches.reduce((sum, w) => sum + w.price, 0);

  return (
    <div id="wishlist-view" className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#9E4738]">
            <Heart className="w-5 h-5 fill-[#9E4738] text-[#9E4738]" />
            <span className="text-xs font-serif font-bold uppercase tracking-wider">Curated Wishlist</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1C1917] mt-1">
            Saved Timepieces ({wishlistedWatches.length})
          </h1>
          <p className="text-xs text-[#57534E] mt-1">
            Monitor price movements, compare references, and acquire your grail watches directly.
          </p>
        </div>

        {wishlistedWatches.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-[#78716C] uppercase font-semibold">
                Total Wishlist Value
              </div>
              <div className="text-xl font-bold font-mono text-[#1C1917]">
                ${totalWishlistValue.toLocaleString()}
              </div>
            </div>

            <button
              id="clear-wishlist-btn"
              onClick={clearWishlist}
              className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] hover:border-[#9E4738]/40 text-[#57534E] hover:text-[#9E4738] text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Wishlisted Watches */}
      {wishlistedWatches.length === 0 ? (
        <div className="p-16 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#9E4738]/10 text-[#9E4738] mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#1C1917]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#78716C] max-w-sm mx-auto">
            Browse the luxury marketplace and click the heart icon on any timepiece to save it here.
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="bg-[#1C1917] text-[#FAF8F5] font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-[#2D2A26] transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
            <span>Explore Marketplace</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedWatches.map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      )}
    </div>
  );
};
