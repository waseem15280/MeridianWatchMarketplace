import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Scale, Trash2, ArrowRight } from 'lucide-react';

export const CompareDrawer: React.FC = () => {
  const {
    compareList,
    toggleCompare,
    clearCompare,
    listings,
    setSelectedWatch,
    setCheckoutWatch,
    setIsCheckoutOpen
  } = useMarketplace();

  if (compareList.length === 0) return null;

  const compareWatches = listings.filter((l) => compareList.includes(l.id));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E5DFD5] shadow-2xl p-4 transition-all text-[#1C1917]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#967139]" />
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1C1917]">
              Timepiece Comparison Matrix ({compareWatches.length}/3)
            </h3>
          </div>

          <button
            onClick={clearCompare}
            className="text-xs text-[#78716C] hover:text-[#967139] flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 overflow-x-auto">
          {compareWatches.map((w) => (
            <div
              key={w.id}
              className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] flex items-center justify-between gap-3 text-xs shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={w.images[0]}
                  alt={w.model}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#D8D0C5]"
                />
                <div className="min-w-0">
                  <div className="text-[10px] font-serif font-bold text-[#967139] uppercase tracking-wider">
                    {w.brand}
                  </div>
                  <div className="font-serif font-bold text-[#1C1917] truncate">{w.model}</div>
                  <div className="text-[11px] font-mono text-[#57534E]">
                    ${w.price.toLocaleString()} • {w.caseDiameter}mm • {w.condition}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setSelectedWatch(w)}
                  className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => toggleCompare(w.id)}
                  className="p-1.5 text-[#78716C] hover:text-[#967139] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
