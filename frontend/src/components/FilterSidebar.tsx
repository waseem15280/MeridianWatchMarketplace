import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  SlidersHorizontal,
  RotateCcw,
  Star,
  Check,
  Package,
  FileText,
  DollarSign,
  Compass,
  X
} from 'lucide-react';
import { WatchCondition, WatchMovement } from '../types';

const BRANDS = [
  'Rolex',
  'Patek Philippe',
  'Audemars Piguet',
  'Omega',
  'Cartier',
  'Grand Seiko',
  'Tudor',
  'Vacheron Constantin',
  'IWC'
];

const MOVEMENTS: WatchMovement[] = [
  'Automatic',
  'Manual Winding',
  'Spring Drive',
  'Quartz'
];

const CONDITIONS: WatchCondition[] = [
  'Unworn',
  'Mint',
  'Very Good',
  'Good'
];

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onCloseMobile }) => {
  const { filters, setFilters, resetFilters, listings } = useMarketplace();

  const handleBrandToggle = (brandName: string) => {
    setFilters((prev) => {
      const exists = prev.brand.includes(brandName);
      return {
        ...prev,
        brand: exists ? prev.brand.filter((b) => b !== brandName) : [...prev.brand, brandName]
      };
    });
  };

  const handleMovementToggle = (movement: WatchMovement) => {
    setFilters((prev) => {
      const exists = prev.movement.includes(movement);
      return {
        ...prev,
        movement: exists ? prev.movement.filter((m) => m !== movement) : [...prev.movement, movement]
      };
    });
  };

  const handleConditionToggle = (condition: WatchCondition) => {
    setFilters((prev) => {
      const exists = prev.condition.includes(condition);
      return {
        ...prev,
        condition: exists ? prev.condition.filter((c) => c !== condition) : [...prev.condition, condition]
      };
    });
  };

  // Count helper
  const getBrandCount = (brand: string) => {
    return listings.filter((l) => l.brand === brand && l.status === 'active').length;
  };

  return (
    <aside
      id="filters-sidebar"
      className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-5 text-[#1C1917] shadow-xs h-fit space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#967139]" />
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1C1917]">
            Horology Filters
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reset-filters-btn"
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] text-[#78716C] hover:text-[#967139] transition-colors font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-[#78716C] hover:text-[#1C1917]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2">
          Sort Timepieces
        </label>
        <select
          id="sort-listings-select"
          value={filters.sortBy}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
          className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Top Rated Sellers (★ 4.9+)</option>
          <option value="popular">Most Wishlisted</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2">
          <span>Price Range (USD)</span>
          <span className="text-[#967139] font-mono text-xs font-bold">
            ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}
          </span>
        </div>

        <div className="space-y-3">
          <input
            id="price-range-slider"
            type="range"
            min={0}
            max={150000}
            step={2500}
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
            }
            className="w-full accent-[#967139] bg-[#E5DFD5] h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C7D70] text-xs font-mono">$</span>
              <input
                id="min-price-input"
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minPrice: Number(e.target.value) || 0 }))
                }
                placeholder="Min"
                className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-lg pl-6 pr-2 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139] font-mono"
              />
            </div>
            <span className="text-[#8C7D70] text-xs">-</span>
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C7D70] text-xs font-mono">$</span>
              <input
                id="max-price-input"
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) || 150000 }))
                }
                placeholder="Max"
                className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-lg pl-6 pr-2 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139] font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Selector */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2">
          Manufacture / Brand
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {BRANDS.map((brand) => {
            const isChecked = filters.brand.includes(brand);
            const count = getBrandCount(brand);
            return (
              <button
                key={brand}
                id={`filter-brand-${brand.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleBrandToggle(brand)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isChecked
                    ? 'bg-[#C5A880]/20 text-[#1C1917] font-semibold'
                    : 'text-[#57534E] hover:bg-[#EDE8E0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-[#1C1917] border-[#1C1917] text-[#FAF8F5]'
                        : 'border-[#D8D0C5] bg-[#FFFFFF]'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{brand}</span>
                </div>
                <span className="text-[10px] text-[#8C7D70] font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2">
          Condition
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((cond) => {
            const isSelected = filters.condition.includes(cond);
            return (
              <button
                key={cond}
                id={`filter-condition-${cond.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleConditionToggle(cond)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#1C1917] text-[#FAF8F5] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] border border-[#D8D0C5] text-[#57534E] hover:border-[#B8AEA3]'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movement */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2">
          Caliber Movement
        </label>
        <div className="space-y-1">
          {MOVEMENTS.map((mov) => {
            const isSelected = filters.movement.includes(mov);
            return (
              <button
                key={mov}
                id={`filter-movement-${mov.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleMovementToggle(mov)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#C5A880]/20 text-[#1C1917] font-semibold'
                    : 'text-[#57534E] hover:bg-[#EDE8E0]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#1C1917] border-[#1C1917] text-[#FAF8F5]'
                      : 'border-[#D8D0C5] bg-[#FFFFFF]'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>{mov}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Box & Papers */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2">
          Scope of Delivery
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            id="filter-box-toggle"
            onClick={() => setFilters((prev) => ({ ...prev, hasBox: !prev.hasBox }))}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs border transition-colors ${
              filters.hasBox
                ? 'bg-[#C5A880]/25 border-[#C5A880] text-[#1C1917] font-semibold'
                : 'bg-[#FAF8F5] border-[#D8D0C5] text-[#57534E] hover:border-[#B8AEA3]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#967139]" />
            <span>Original Box</span>
          </button>

          <button
            id="filter-papers-toggle"
            onClick={() => setFilters((prev) => ({ ...prev, hasPapers: !prev.hasPapers }))}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs border transition-colors ${
              filters.hasPapers
                ? 'bg-[#C5A880]/25 border-[#C5A880] text-[#1C1917] font-semibold'
                : 'bg-[#FAF8F5] border-[#D8D0C5] text-[#57534E] hover:border-[#B8AEA3]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#967139]" />
            <span>Papers</span>
          </button>
        </div>
      </div>

      {/* Seller Rating Filter */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2">
          Minimum Seller Rating
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'All', value: 0 },
            { label: '4.5+ ★', value: 4.5 },
            { label: '4.9+ ★', value: 4.9 }
          ].map((item) => {
            const isSelected = filters.minSellerRating === item.value;
            return (
              <button
                key={item.label}
                id={`filter-rating-${item.value}`}
                onClick={() => setFilters((prev) => ({ ...prev, minSellerRating: item.value }))}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#1C1917] text-[#FAF8F5] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] border border-[#D8D0C5] text-[#57534E] hover:border-[#B8AEA3]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
