import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { WatchCard } from './WatchCard';
import { FilterSidebar } from './FilterSidebar';
import {
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  ArrowUpDown,
  Search,
  X,
  Store,
  Box,
  TrendingUp
} from 'lucide-react';

export const ExploreView: React.FC = () => {
  const {
    filteredListings,
    searchQuery,
    setSearchQuery,
    selectedBrand,
    setSelectedBrand,
    sortBy,
    setSortBy,
    resetFilters,
    setIsAddListingOpen,
    setEditingListing,
    setActiveTab,
    currentUser
  } = useMarketplace();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div id="explore-view" className="space-y-8 pb-16">
      {/* Editorial Luxury Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#EDE8E0] border border-[#DDD6CB] p-6 md:p-10 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-[#EDE8E0] via-[#EDE8E0]/90 to-transparent z-0 pointer-events-none" />
        <div
          className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-25 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80')`
          }}
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/25 border border-[#C5A880]/60 text-[#78592A] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#967139]" />
            <span>Expert Authenticity Check also available</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917] font-serif leading-tight">
            The Meridian Antiquité Horlogerie Marketplace
          </h1>

          <p className="text-sm md:text-base text-[#57534E] leading-relaxed">
            Trade rare vintage and modern timepieces directly between verified sellers and private collectors. Every transaction backed by expert watch collector authentication and escrow protection(feature under development).
          </p>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-sell-watch-btn"
              onClick={() => {
                setEditingListing(null);
                setIsAddListingOpen(true);
              }}
              className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Store className="w-4 h-4 text-[#C5A880]" />
              <span>List a Timepiece</span>
            </button>

            <button
              onClick={() => setActiveTab('collection')}
              className="bg-[#FAF8F5] hover:bg-[#FFFFFF] text-[#1C1917] border border-[#D8D0C5] px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Box className="w-4 h-4 text-[#967139]" />
              <span>Manage Personal Vault</span>
            </button>
          </div>
        </div>

        {/* Feature Badges Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#DDD6CB] relative z-10 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#967139] shrink-0" />
            <div>
              <div className="font-bold text-[#1C1917]">100% Escrow Protection</div>
              <div className="text-[11px] text-[#78716C]">Funds released after buyer inspection</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-[#967139] shrink-0" />
            <div>
              <div className="font-bold text-[#1C1917]">Verified Seller Ratings</div>
              <div className="text-[11px] text-[#78716C]">Buyer reviews with authentic feedback</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#967139] shrink-0" />
            <div>
              <div className="font-bold text-[#1C1917]">Live Valuation Index</div>
              <div className="text-[11px] text-[#78716C]">Real-time reference pricing tracking</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#967139] shrink-0" />
            <div>
              <div className="font-bold text-[#1C1917]">Personal Vault Manager</div>
              <div className="text-[11px] text-[#78716C]">One-click collection to listing flow</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Browse Section: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24">
          <FilterSidebar />
        </div>

        {/* Mobile Filter Trigger */}
        <div className="w-full lg:hidden flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-[#FFFFFF] border border-[#D8D0C5] px-4 py-2.5 rounded-xl text-xs font-semibold text-[#1C1917]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#967139]" />
            <span>Filters & Brands</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] font-mono">
              {filteredListings.length} Timepieces
            </span>
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm lg:hidden">
            <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl p-6 relative shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5] mb-4">
                <h3 className="text-sm font-serif font-bold text-[#1C1917] uppercase tracking-wider">
                  Filter Listings
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-[#78716C] hover:text-[#1C1917]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar />
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-4 bg-[#1C1917] text-[#FAF8F5] font-bold py-2.5 rounded-xl text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Right Content Area: Controls Bar + Cards Grid */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Controls Bar: Sort, Search Tag, Listing Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#57534E] font-mono">
                Showing <strong className="text-[#1C1917] font-bold">{filteredListings.length}</strong> timepieces
              </span>

              {/* Active Filter Tags */}
              {(selectedBrand !== 'All' || searchQuery) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedBrand !== 'All' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EDE8E0] text-[#1C1917] px-2 py-0.5 rounded-lg border border-[#DDD6CB]">
                      {selectedBrand}
                      <button onClick={() => setSelectedBrand('All')}>
                        <X className="w-3 h-3 text-[#78716C] hover:text-[#1C1917]" />
                      </button>
                    </span>
                  )}

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EDE8E0] text-[#1C1917] px-2 py-0.5 rounded-lg border border-[#DDD6CB]">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}>
                        <X className="w-3 h-3 text-[#78716C] hover:text-[#1C1917]" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-[#967139] hover:underline ml-1 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#78716C]" />
              <label className="text-xs text-[#78716C] font-semibold">Sort By:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF8F5] border border-[#D8D0C5] text-[#1C1917] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#967139]"
              >
                <option value="featured">Featured & Verified</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Recently Listed</option>
                <option value="year-desc">Year: Modern to Vintage</option>
                <option value="rating">Top Seller Rating</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="p-16 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EDE8E0] text-[#78716C] mx-auto flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1C1917]">No Timepieces Found</h3>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                No active listings match your current search and filter criteria. Try adjusting your filters or search keywords.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#1C1917] text-[#FAF8F5] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#2D2A26] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map((watch) => (
                <WatchCard key={watch.id} watch={watch} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
