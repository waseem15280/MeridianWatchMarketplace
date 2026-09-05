import React from 'react';
import { WatchListing } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Heart,
  ShieldCheck,
  Star,
  Package,
  FileText,
  MapPin,
  Eye,
  SlidersHorizontal,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface WatchCardProps {
  watch: WatchListing;
  onSelect?: (watch: WatchListing) => void;
}

export const WatchCard: React.FC<WatchCardProps> = ({ watch, onSelect }) => {
  const {
    isInWishlist,
    toggleWishlist,
    setSelectedWatch,
    setSelectedSeller,
    getSellerById,
    compareList,
    toggleCompare,
    setCheckoutWatch,
    setIsCheckoutOpen
  } = useMarketplace();

  const isWishlisted = isInWishlist(watch.id);
  const isCompared = compareList.includes(watch.id);
  const seller = getSellerById(watch.sellerId);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(watch);
    } else {
      setSelectedWatch(watch);
    }
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (seller) {
      setSelectedSeller(seller);
    }
  };

  return (
    <motion.div
      id={`watch-card-${watch.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className="group relative bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] hover:border-[#C5A880] transition-all duration-300 flex flex-col overflow-hidden shadow-xs hover:shadow-lg cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] bg-[#EDE8E0] overflow-hidden flex items-center justify-center">
        <img
          src={watch.images[0]}
          alt={`${watch.brand} ${watch.model}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/70 via-transparent to-black/20 pointer-events-none" />

        {/* Condition & Authenticity Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[#1C1917]/85 text-[#FAF8F5] border border-[#3D3A36] backdrop-blur-md">
            {watch.condition}
          </span>
          {watch.authenticityVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#3D5A45]/90 text-[#F5F2ED] border border-[#4A6B53]/50 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-[#A7D7B5]" />
              Verified Authenticity
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${watch.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(watch.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
            isWishlisted
              ? 'bg-[#9E4738]/20 text-[#9E4738] border border-[#9E4738]/40 shadow-sm'
              : 'bg-[#FFFFFF]/85 text-[#57534E] border border-[#D8D0C5] hover:text-[#9E4738] hover:bg-[#FFFFFF]'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#9E4738] text-[#9E4738]' : ''}`} />
        </button>

        {/* Quick specs pill bottom overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#FAF8F5] z-10 pointer-events-none">
          <span className="bg-[#1C1917]/85 px-2 py-0.5 rounded-md backdrop-blur-md font-mono border border-[#3D3A36]">
            {watch.caseDiameter}mm • {watch.movement}
          </span>
          <span className="bg-[#1C1917]/85 px-2 py-0.5 rounded-md backdrop-blur-md font-mono border border-[#3D3A36]">
            {watch.year}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-[#FFFFFF]">
        <div>
          {/* Brand & Reference */}
          <div className="flex items-center justify-between text-xs text-[#967139] font-serif font-bold uppercase tracking-wider">
            <span>{watch.brand}</span>
            <span className="font-mono text-[#78716C] text-[11px]">Ref. {watch.referenceNumber}</span>
          </div>

          {/* Model Name */}
          <h3 className="mt-1 text-sm font-serif font-bold text-[#1C1917] group-hover:text-[#85642F] transition-colors line-clamp-1">
            {watch.model}
          </h3>

          {/* Package Details (Box & Papers) */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#57534E]">
            <span
              className={`flex items-center gap-1 ${
                watch.hasOriginalBox ? 'text-[#3D5A45] font-semibold' : 'text-[#A8A29E] line-through'
              }`}
            >
              <Package className="w-3 h-3" />
              Box
            </span>
            <span className="text-[#D8D0C5]">•</span>
            <span
              className={`flex items-center gap-1 ${
                watch.hasOriginalPapers ? 'text-[#3D5A45] font-semibold' : 'text-[#A8A29E] line-through'
              }`}
            >
              <FileText className="w-3 h-3" />
              Papers
            </span>
            <span className="text-[#D8D0C5]">•</span>
            <span className="text-[#78716C] truncate">{watch.dialColor} Dial</span>
          </div>
        </div>

        {/* Seller Info & Ratings Badge */}
        <div className="mt-3.5 pt-3 border-t border-[#E5DFD5] flex items-center justify-between">
          <button
            id={`seller-link-${watch.id}`}
            onClick={handleSellerClick}
            className="flex items-center gap-1.5 text-left group/seller hover:opacity-90 focus:outline-none"
          >
            <div className="flex flex-col">
              <div className="text-xs font-medium text-[#1C1917] group-hover/seller:text-[#85642F] transition-colors flex items-center gap-1">
                <span className="truncate max-w-[120px] font-semibold">{watch.sellerName}</span>
                {watch.sellerVerified && <ShieldCheck className="w-3 h-3 text-[#967139] shrink-0" />}
              </div>
              <div className="text-[10px] text-[#78716C] flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#967139]" />
                <span className="truncate max-w-[100px]">{watch.sellerLocation.split(',')[0]}</span>
              </div>
            </div>
          </button>

          {/* Star Rating based on buyer feedback */}
          <div
            id={`seller-rating-${watch.id}`}
            onClick={handleSellerClick}
            className="flex items-center gap-1 bg-[#C5A880]/20 border border-[#C5A880]/40 px-2 py-0.5 rounded-lg text-[#78592A] text-xs font-semibold hover:bg-[#C5A880]/30 transition-colors cursor-pointer"
            title={`Seller rating ${watch.sellerRating} / 5.0 from ${watch.sellerReviewCount} verified buyer reviews`}
          >
            <Star className="w-3 h-3 fill-[#C5A880] text-[#967139]" />
            <span>{watch.sellerRating.toFixed(1)}</span>
            <span className="text-[10px] text-[#8C7D70] font-normal">({watch.sellerReviewCount})</span>
          </div>
        </div>

        {/* Price and Action Bar */}
        <div className="mt-3 pt-2 flex items-center justify-between border-t border-[#F0ECE6]">
          <div>
            <div className="text-base font-bold text-[#1C1917] font-mono tracking-tight">
              ${watch.price.toLocaleString()}
            </div>
            {watch.originalPrice && watch.originalPrice > watch.price && (
              <div className="text-[10px] text-[#A8A29E] line-through font-mono">
                ${watch.originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id={`compare-btn-${watch.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleCompare(watch.id);
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors border ${
                isCompared
                  ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] font-bold'
                  : 'bg-[#EDE8E0] hover:bg-[#E2DCD2] text-[#57534E] border-[#DDD6CB]'
              }`}
              title={isCompared ? 'Comparing' : 'Add to Compare'}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              id={`inspect-btn-${watch.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWatch(watch);
              }}
              className="flex items-center gap-1 bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
