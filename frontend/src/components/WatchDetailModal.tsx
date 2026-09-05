import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  Heart,
  ShieldCheck,
  Star,
  Package,
  FileText,
  Clock,
  Compass,
  Award,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Box,
  Truck,
  MessageSquare,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WatchDetailModal: React.FC = () => {
  const {
    selectedWatch,
    setSelectedWatch,
    isInWishlist,
    toggleWishlist,
    setSelectedSeller,
    getSellerById,
    setCheckoutWatch,
    setIsCheckoutOpen,
    setOfferWatch,
    setIsOfferOpen,
    compareList,
    toggleCompare,
    addToCollection,
    showToast
  } = useMarketplace();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedWatch) return null;

  const isWishlisted = isInWishlist(selectedWatch.id);
  const isCompared = compareList.includes(selectedWatch.id);
  const seller = getSellerById(selectedWatch.sellerId);

  const handleBuyNow = () => {
    setCheckoutWatch(selectedWatch);
    setIsCheckoutOpen(true);
  };

  const handleMakeOffer = () => {
    setOfferWatch(selectedWatch);
    setIsOfferOpen(true);
  };

  const handleSaveToVault = () => {
    addToCollection({
      brand: selectedWatch.brand,
      model: selectedWatch.model,
      referenceNumber: selectedWatch.referenceNumber,
      year: selectedWatch.year,
      caseDiameter: selectedWatch.caseDiameter,
      caseMaterial: selectedWatch.caseMaterial,
      movement: selectedWatch.movement,
      dialColor: selectedWatch.dialColor,
      condition: selectedWatch.condition,
      estimatedMarketValue: selectedWatch.price,
      images: selectedWatch.images,
      notes: `Imported from listing ${selectedWatch.referenceNumber}.`
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
        <motion.div
          id="watch-detail-modal"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#1C1917]"
        >
          {/* Top Bar with Close & Quick Actions */}
          <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FFFFFF]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#967139]">
                {selectedWatch.brand}
              </span>
              <span className="text-[#D8D0C5]">•</span>
              <span className="text-xs text-[#78716C] font-mono">Ref. {selectedWatch.referenceNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="modal-compare-btn"
                onClick={() => toggleCompare(selectedWatch.id)}
                className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 ${
                  isCompared
                    ? 'bg-[#1C1917] text-[#FAF8F5] font-bold'
                    : 'bg-[#FAF8F5] text-[#57534E] hover:bg-[#EDE8E0] border border-[#D8D0C5]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">{isCompared ? 'Compared' : 'Compare'}</span>
              </button>

              <button
                id="modal-wishlist-btn"
                onClick={() => toggleWishlist(selectedWatch.id)}
                className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 ${
                  isWishlisted
                    ? 'bg-[#9E4738]/15 text-[#9E4738] border border-[#9E4738]/30'
                    : 'bg-[#FAF8F5] text-[#57534E] hover:bg-[#EDE8E0] border border-[#D8D0C5]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#9E4738] text-[#9E4738]' : ''}`} />
                <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>

              <button
                id="modal-close-btn"
                onClick={() => setSelectedWatch(null)}
                className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Image Gallery */}
              <div className="lg:col-span-7 space-y-4">
                {/* Main Hero Image */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EDE8E0] border border-[#E5DFD5] flex items-center justify-center group shadow-2xs">
                  <img
                    src={selectedWatch.images[activeImageIndex] || selectedWatch.images[0]}
                    alt={`${selectedWatch.brand} ${selectedWatch.model}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  {/* Carousel Controls if multiple images */}
                  {selectedWatch.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? selectedWatch.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#1C1917] border border-[#D8D0C5] shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === selectedWatch.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#1C1917] border border-[#D8D0C5] shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FFFFFF]/95 text-[#78592A] border border-[#C5A880]/50 shadow-2xs">
                      {selectedWatch.condition}
                    </span>
                    {selectedWatch.authenticityVerified && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFFFFF]/95 text-[#3D5A45] border border-[#3D5A45]/30 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3D5A45]" />
                        100% Certified Authentic
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                {selectedWatch.images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {selectedWatch.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx
                            ? 'border-[#967139] ring-2 ring-[#C5A880]/30'
                            : 'border-[#D8D0C5] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt="thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Escrow & Buyer Protection Guarantee Banner */}
                <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#967139] font-serif font-bold text-xs">
                    <Lock className="w-4 h-4 text-[#967139]" />
                    <span>Chronos Certified Escrow & Watchmaker Inspection</span>
                  </div>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    Payment is held in secure third-party escrow. The timepiece undergoes physical authentication and multi-point timing analysis by certified master watchmakers before funds are released to the seller.
                  </p>
                </div>
              </div>

              {/* Right Column: Details, Specs, Seller & CTAs */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="text-xs text-[#967139] font-serif font-bold uppercase tracking-widest">
                    {selectedWatch.brand}
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-[#1C1917] mt-1 leading-tight">
                    {selectedWatch.model}
                  </h1>
                  <p className="text-xs text-[#78716C] mt-1 font-mono">
                    Year: {selectedWatch.year} • Reference: {selectedWatch.referenceNumber}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
                  <div className="text-xs text-[#78716C] uppercase tracking-wider font-semibold">
                    Listed Market Price
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-bold font-mono text-[#1C1917]">
                      ${selectedWatch.price.toLocaleString()}
                    </span>
                    {selectedWatch.originalPrice && selectedWatch.originalPrice > selectedWatch.price && (
                      <span className="text-sm text-[#78716C] line-through font-mono">
                        ${selectedWatch.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs text-[#3D5A45] font-semibold">Free Fully Insured Shipping</span>
                  </div>
                </div>

                {/* Main Action CTAs */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="detail-buy-now-btn"
                      onClick={handleBuyNow}
                      className="w-full bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-[#C5A880]" />
                      <span>Buy with Escrow</span>
                    </button>

                    <button
                      id="detail-make-offer-btn"
                      onClick={handleMakeOffer}
                      className="w-full bg-[#FFFFFF] hover:bg-[#EDE8E0] text-[#1C1917] font-semibold py-3 px-4 rounded-xl text-sm border border-[#D8D0C5] transition-all flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <MessageSquare className="w-4 h-4 text-[#967139]" />
                      <span>Make an Offer</span>
                    </button>
                  </div>

                  <button
                    id="detail-save-to-vault-btn"
                    onClick={handleSaveToVault}
                    className="w-full bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] hover:text-[#1C1917] font-medium py-2.5 px-4 rounded-xl text-xs border border-[#D8D0C5] transition-colors flex items-center justify-center gap-2"
                  >
                    <Box className="w-3.5 h-3.5 text-[#967139]" />
                    <span>Save to My Private Watch Box / Vault</span>
                  </button>
                </div>

                {/* Seller Trust & Ratings Card */}
                <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                      Seller Reputation & Ratings
                    </span>
                    <button
                      id="view-seller-profile-btn"
                      onClick={() => {
                        if (seller) {
                          setSelectedSeller(seller);
                        }
                      }}
                      className="text-xs text-[#967139] hover:underline font-medium transition-colors"
                    >
                      View Full Profile →
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={seller?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                      alt={selectedWatch.sellerName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-[#D8D0C5] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-serif font-bold text-[#1C1917] truncate">
                          {selectedWatch.sellerName}
                        </h4>
                        {selectedWatch.sellerVerified && (
                          <ShieldCheck className="w-4 h-4 text-[#967139] shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#78716C] mt-0.5">
                        <span className="flex items-center gap-1 text-[#967139] font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#967139]" />
                          {selectedWatch.sellerRating.toFixed(2)}
                        </span>
                        <span>({selectedWatch.sellerReviewCount} verified reviews)</span>
                      </div>

                      <div className="text-[11px] text-[#78716C] mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#967139]" />
                          {selectedWatch.sellerLocation}
                        </span>
                        <span>•</span>
                        <span>{seller?.totalSalesCount || 30}+ Sales</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller sub-ratings trust indicators */}
                  <div className="pt-2 border-t border-[#E5DFD5] grid grid-cols-2 gap-2 text-[11px] text-[#57534E]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5A45]" />
                      <span>Item Accuracy: 99.8%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#3D5A45]" />
                      <span>Avg. Dispatch: 24h</span>
                    </div>
                  </div>
                </div>

                {/* Scope of Delivery */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    Scope of Delivery
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        selectedWatch.hasOriginalBox
                          ? 'bg-[#FFFFFF] border-[#E5DFD5] text-[#1C1917]'
                          : 'bg-[#FAF8F5] border-[#E5DFD5] text-[#78716C] line-through'
                      }`}
                    >
                      <Package className="w-4 h-4 text-[#967139]" />
                      <span>Original Box</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        selectedWatch.hasOriginalPapers
                          ? 'bg-[#FFFFFF] border-[#E5DFD5] text-[#1C1917]'
                          : 'bg-[#FAF8F5] border-[#E5DFD5] text-[#78716C] line-through'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-[#967139]" />
                      <span>Original Papers</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Technical Horological Specifications Table */}
            <div className="border-t border-[#E5DFD5] pt-6 space-y-4">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#1C1917] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#967139]" />
                <span>Horological Specifications</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Movement</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5">{selectedWatch.movement}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Case Diameter</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5 font-mono">{selectedWatch.caseDiameter} mm</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Case Material</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5">{selectedWatch.caseMaterial}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Dial</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5">{selectedWatch.dialColor}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Caliber</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5 font-mono">{selectedWatch.caliber || 'In-House'}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Power Reserve</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5">{selectedWatch.powerReserve || '48-72 Hours'}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Water Resistance</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5">{selectedWatch.waterResistance || '100m'}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5]">
                  <div className="text-[#78716C] text-[11px] uppercase">Bracelet / Strap</div>
                  <div className="font-semibold text-[#1C1917] mt-0.5 truncate">{selectedWatch.braceletMaterial}</div>
                </div>
              </div>
            </div>

            {/* Description & Provenance */}
            <div className="border-t border-[#E5DFD5] pt-6 space-y-4">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#1C1917]">
                Collector Description & Provenance
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed whitespace-pre-line bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DFD5]">
                {selectedWatch.description}
              </p>

              {selectedWatch.provenanceNotes && (
                <div className="p-4 rounded-2xl bg-[#C5A880]/15 border border-[#C5A880]/30 text-xs space-y-1">
                  <div className="font-bold text-[#78592A] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#967139]" />
                    <span>Provenance & Service History</span>
                  </div>
                  <p className="text-[#57534E]">{selectedWatch.provenanceNotes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
