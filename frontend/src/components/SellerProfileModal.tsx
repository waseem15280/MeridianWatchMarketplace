import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Watch,
  Award,
  ExternalLink,
  CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WatchCard } from './WatchCard';

export const SellerProfileModal: React.FC = () => {
  const {
    selectedSeller,
    setSelectedSeller,
    listings,
    getSellerReviews,
    setIsReviewOpen,
    setReviewTarget,
    currentUser
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  if (!selectedSeller) return null;

  const sellerReviews = getSellerReviews(selectedSeller.id);
  const sellerListings = listings.filter((l) => l.sellerId === selectedSeller.id && l.status === 'active');

  // Compute rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = sellerReviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = sellerReviews.length > 0 ? (count / sellerReviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  const handleOpenLeaveReview = () => {
    setReviewTarget({
      sellerId: selectedSeller.id,
      sellerName: selectedSeller.name,
      watchModel: sellerListings[0]?.model || 'Haute Horlogerie Timepiece',
      watchReference: sellerListings[0]?.referenceNumber || 'Verified-Escrow'
    });
    setIsReviewOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
        <motion.div
          id="seller-profile-modal"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#1C1917]"
        >
          {/* Top Bar with Close */}
          <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FFFFFF]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#967139]">
                Dealer & Collector Profile
              </span>
              {selectedSeller.verifiedDealer && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-[#C5A880]/20 text-[#78592A] border border-[#C5A880]/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-[#967139]" />
                  Chronos Verified Dealer
                </span>
              )}
            </div>

            <button
              id="seller-modal-close-btn"
              onClick={() => setSelectedSeller(null)}
              className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* Seller Hero Header */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5DFD5] grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-2xs">
              <div className="md:col-span-8 flex items-start gap-4">
                <img
                  src={selectedSeller.avatar}
                  alt={selectedSeller.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C5A880] shadow-sm shrink-0"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-serif font-bold text-[#1C1917]">{selectedSeller.name}</h2>
                    {selectedSeller.verifiedDealer && (
                      <ShieldCheck className="w-5 h-5 text-[#967139] shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-[#57534E] leading-relaxed max-w-xl">
                    {selectedSeller.bio}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#967139]" />
                      {selectedSeller.location}
                    </span>
                    <span className="text-[#D8D0C5]">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#967139]" />
                      Member since {selectedSeller.memberSince}
                    </span>
                    <span className="text-[#D8D0C5]">•</span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[#967139]" />
                      {selectedSeller.totalSalesCount} Completed Sales
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Ratings Summary Card */}
              <div className="md:col-span-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-center space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
                  Buyer Trust Rating
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold font-mono text-[#967139]">
                    {selectedSeller.rating.toFixed(2)}
                  </span>
                  <div className="text-left">
                    <div className="flex items-center text-[#967139]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#967139]" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#78716C] font-mono">
                      {selectedSeller.reviewCount} verified reviews
                    </span>
                  </div>
                </div>

                <button
                  id="seller-profile-leave-review-btn"
                  onClick={handleOpenLeaveReview}
                  className="w-full bg-[#C5A880]/20 hover:bg-[#C5A880]/30 text-[#78592A] border border-[#C5A880]/40 text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <Star className="w-3.5 h-3.5 fill-[#967139] text-[#967139]" />
                  <span>Rate This Seller</span>
                </button>
              </div>
            </div>

            {/* Ratings Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Star Rating Distribution Bars */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-2.5 shadow-2xs">
                <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1C1917] mb-3">
                  Star Rating Distribution
                </h4>
                {ratingDistribution.map((item) => (
                  <div key={item.star} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-mono text-[#57534E] flex items-center gap-1">
                      {item.star} <Star className="w-3 h-3 fill-[#967139] text-[#967139]" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[#EDE8E0] overflow-hidden border border-[#D8D0C5]">
                      <div
                        className="h-full bg-[#C5A880] rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[#78716C] text-[11px]">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sub-Ratings Accuracy & Trust Metrics */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-3 shadow-2xs">
                <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1C1917] mb-3">
                  Detailed Service Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5]">
                    <div className="text-[#78716C] text-[11px]">Item Accuracy</div>
                    <div className="text-base font-bold text-[#1C1917] font-mono flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-[#967139] text-[#967139]" /> 5.0 / 5.0
                    </div>
                    <div className="text-[10px] text-[#3D5A45] mt-0.5">100% matched listings</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5]">
                    <div className="text-[#78716C] text-[11px]">Authenticity</div>
                    <div className="text-base font-bold text-[#1C1917] font-mono flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3D5A45]" /> 100%
                    </div>
                    <div className="text-[10px] text-[#3D5A45] mt-0.5">Guaranteed genuine</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5]">
                    <div className="text-[#78716C] text-[11px]">Communication</div>
                    <div className="text-base font-bold text-[#1C1917] font-mono flex items-center gap-1 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#967139]" /> {selectedSeller.responseRate}
                    </div>
                    <div className="text-[10px] text-[#78716C] mt-0.5">Rapid horology inquiry</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5]">
                    <div className="text-[#78716C] text-[11px]">Shipping & Packing</div>
                    <div className="text-base font-bold text-[#1C1917] font-mono flex items-center gap-1 mt-0.5">
                      <Package className="w-3.5 h-3.5 text-[#967139]" /> {selectedSeller.avgShipTime}
                    </div>
                    <div className="text-[10px] text-[#3D5A45] mt-0.5">Armored insured courier</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs between Listings & Reviews */}
            <div className="border-b border-[#E5DFD5] flex items-center gap-4">
              <button
                id="seller-tab-listings-btn"
                onClick={() => setActiveTab('listings')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
                  activeTab === 'listings' ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Watch className="w-4 h-4 text-[#967139]" />
                <span>Active Listings ({sellerListings.length})</span>
                {activeTab === 'listings' && (
                  <motion.div
                    layoutId="sellerTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#967139]"
                  />
                )}
              </button>

              <button
                id="seller-tab-reviews-btn"
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
                  activeTab === 'reviews' ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#967139]" />
                <span>Buyer Reviews & Ratings ({sellerReviews.length})</span>
                {activeTab === 'reviews' && (
                  <motion.div
                    layoutId="sellerTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#967139]"
                  />
                )}
              </button>
            </div>

            {/* Tab 1: Seller's Active Listings */}
            {activeTab === 'listings' && (
              <div>
                {sellerListings.length === 0 ? (
                  <div className="p-8 text-center bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] text-[#78716C] text-xs">
                    No active listings currently available from this seller.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellerListings.map((watch) => (
                      <WatchCard key={watch.id} watch={watch} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Buyer Reviews & Feedback Feed */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {sellerReviews.length === 0 ? (
                  <div className="p-8 text-center bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] text-[#78716C] text-xs">
                    No reviews submitted yet. Be the first to purchase and review!
                  </div>
                ) : (
                  sellerReviews.map((rev) => (
                    <div
                      key={rev.id}
                      id={`review-card-${rev.id}`}
                      className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              rev.buyerAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={rev.buyerName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-[#D8D0C5]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#1C1917] flex items-center gap-2">
                              <span>{rev.buyerName}</span>
                              {rev.verifiedPurchase && (
                                <span className="text-[10px] font-semibold bg-[#3D5A45]/15 text-[#3D5A45] border border-[#3D5A45]/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#78716C] font-mono mt-0.5">
                              Purchased: {rev.watchModel}{' '}
                              {rev.watchReference ? `(Ref. ${rev.watchReference})` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center text-[#967139] justify-end">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-[#967139]' : 'text-[#D8D0C5]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-[#78716C] font-mono mt-0.5 block">
                            {rev.date}
                          </span>
                        </div>
                      </div>

                      {/* Review text */}
                      <p className="text-xs text-[#57534E] leading-relaxed pl-13">
                        "{rev.comment}"
                      </p>

                      {/* Seller response if any */}
                      {rev.sellerReply && (
                        <div className="ml-13 p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-[#967139] font-semibold text-[11px]">
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Response from {selectedSeller.name}</span>
                          </div>
                          <p className="text-[#57534E] text-[11px] pl-5">{rev.sellerReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
