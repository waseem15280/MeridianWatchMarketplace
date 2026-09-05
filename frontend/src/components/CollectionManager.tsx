import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Box,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  Edit,
  Trash2,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Watch,
  FileText,
  Clock,
  Eye
} from 'lucide-react';
import { CollectionWatch } from '../types';

export const CollectionManager: React.FC = () => {
  const {
    currentUser,
    collection,
    setIsAddCollectionOpen,
    setEditingCollectionWatch,
    deleteFromCollection,
    listFromCollection,
    listings,
    setSelectedWatch,
    showToast
  } = useMarketplace();

  const [listModalWatch, setListModalWatch] = useState<CollectionWatch | null>(null);
  const [listingPrice, setListingPrice] = useState<number>(0);
  const [listingDescription, setListingDescription] = useState<string>('');

  const myCollection = collection.filter((c) => c.userId === currentUser.id);

  // Compute metrics
  const totalValue = myCollection.reduce((sum, w) => sum + (w.estimatedMarketValue || 0), 0);
  const totalCost = myCollection.reduce((sum, w) => sum + (w.purchasePrice || w.estimatedMarketValue || 0), 0);
  const appreciation = totalValue - totalCost;
  const appreciationPercent = totalCost > 0 ? (appreciation / totalCost) * 100 : 0;

  const handleOpenListModal = (watch: CollectionWatch) => {
    setListModalWatch(watch);
    setListingPrice(watch.estimatedMarketValue || 5000);
    setListingDescription(watch.notes || `Collector-owned ${watch.brand} ${watch.model} (Ref. ${watch.referenceNumber}) in ${watch.condition} condition.`);
  };

  const handleConfirmList = () => {
    if (!listModalWatch) return;
    if (listingPrice <= 0) {
      showToast('Invalid Price', 'Please enter a valid listing price', 'warning');
      return;
    }
    listFromCollection(listModalWatch.id, listingPrice, listingDescription);
    setListModalWatch(null);
  };

  return (
    <div id="collection-manager" className="space-y-8 pb-12">
      {/* Vault Hero & Value Metrics */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD5] relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/50 flex items-center justify-center text-[#967139] shrink-0">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1C1917]">
                  {currentUser.name.split(' ')[0]}'s Watch Vault & Collection
                </h1>
              </div>
              <p className="text-xs text-[#57534E] mt-1 max-w-xl">
                Personal Horology Box • Track your luxury timepieces, estimated market valuation, serials, wrist time, and convert pieces into marketplace listings with a single click.
              </p>
            </div>
          </div>

          <button
            id="add-watch-to-vault-btn"
            onClick={() => {
              setEditingCollectionWatch(null);
              setIsAddCollectionOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] px-5 py-3 rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A880]" />
            <span>Add Piece to Vault</span>
          </button>
        </div>

        {/* Analytics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E5DFD5]">
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Total Vault Value
            </div>
            <div className="text-2xl font-bold text-[#1C1917] font-mono mt-1">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8C7D70] mt-0.5">Estimated market value</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Valuation Gain / Loss
            </div>
            <div
              className={`text-2xl font-bold font-mono mt-1 flex items-center gap-1 ${
                appreciation >= 0 ? 'text-[#3D5A45]' : 'text-[#9E4738]'
              }`}
            >
              {appreciation >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{appreciation >= 0 ? '+' : ''}${Math.abs(appreciation).toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-[#8C7D70] mt-0.5">
              {appreciationPercent >= 0 ? '+' : ''}{appreciationPercent.toFixed(1)}% total appreciation
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Timepieces in Box
            </div>
            <div className="text-2xl font-bold text-[#1C1917] font-mono mt-1">
              {myCollection.length} Pieces
            </div>
            <div className="text-[10px] text-[#967139] mt-0.5 font-mono font-medium">
              {myCollection.filter((w) => w.isListedForSale).length} currently listed for sale
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Acquisition Cost Base
            </div>
            <div className="text-2xl font-bold text-[#57534E] font-mono mt-1">
              ${totalCost.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8C7D70] mt-0.5">Historical purchase base</div>
          </div>
        </div>
      </div>

      {/* Watch Box Display Layout */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-[#967139]" />
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-[#1C1917]">
              Personal Timepiece Vault ({myCollection.length})
            </h2>
          </div>
        </div>

        {myCollection.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-4">
            <Box className="w-12 h-12 text-[#8C7D70] mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#1C1917]">Your Watch Box is Empty</h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Start cataloging your personal collection of luxury watches to track their values and list them on the marketplace whenever you want.
            </p>
            <button
              onClick={() => {
                setEditingCollectionWatch(null);
                setIsAddCollectionOpen(true);
              }}
              className="bg-[#1C1917] text-[#FAF8F5] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#2D2A26] transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#C5A880]" />
              <span>Add Your First Watch</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {myCollection.map((watch) => {
              const watchGain = (watch.estimatedMarketValue || 0) - (watch.purchasePrice || watch.estimatedMarketValue || 0);
              const watchGainPercent = watch.purchasePrice
                ? (watchGain / watch.purchasePrice) * 100
                : 0;

              // Find if there is an active listing
              const linkedListing = watch.listingId
                ? listings.find((l) => l.id === watch.listingId)
                : null;

              return (
                <div
                  key={watch.id}
                  id={`collection-card-${watch.id}`}
                  className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#C5A880] transition-all flex flex-col justify-between space-y-5 relative shadow-xs"
                >
                  {/* Top Row: Photo & Core Details */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-[#EDE8E0] border border-[#D8D0C5] shrink-0">
                      <img
                        src={watch.images[0]}
                        alt={watch.model}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-[#1C1917]/85 text-[10px] font-mono px-1.5 py-0.5 rounded text-[#FAF8F5]">
                        {watch.year}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-[#967139] uppercase tracking-wider">
                          {watch.brand}
                        </span>

                        {watch.isListedForSale ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#3D5A45]/15 text-[#3D5A45] border border-[#3D5A45]/30 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-[#3D5A45]" />
                            Listed for Sale
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#78716C] bg-[#EDE8E0] px-2 py-0.5 rounded-full border border-[#DDD6CB]">
                            Private Vault
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-serif font-bold text-[#1C1917] mt-1 truncate">
                        {watch.model}
                      </h3>

                      <div className="text-[11px] text-[#78716C] font-mono mt-0.5">
                        Ref. {watch.referenceNumber} {watch.serialNumber ? `• S/N: ${watch.serialNumber}` : ''}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#57534E] mt-2">
                        <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#D8D0C5]">
                          {watch.caseDiameter}mm
                        </span>
                        <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#D8D0C5]">
                          {watch.movement}
                        </span>
                        <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#D8D0C5]">
                          {watch.condition}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Valuation & Gain stats */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-xs">
                    <div>
                      <div className="text-[#78716C] text-[10px] uppercase font-semibold">
                        Est. Market Valuation
                      </div>
                      <div className="text-base font-bold font-mono text-[#1C1917] mt-0.5">
                        ${watch.estimatedMarketValue.toLocaleString()}
                      </div>
                      {watchGain !== 0 && (
                        <div
                          className={`text-[10px] font-mono mt-0.5 flex items-center gap-0.5 ${
                            watchGain > 0 ? 'text-[#3D5A45]' : 'text-[#9E4738]'
                          }`}
                        >
                          {watchGain > 0 ? '+' : ''}${watchGain.toLocaleString()} ({watchGainPercent.toFixed(1)}%)
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[#78716C] text-[10px] uppercase font-semibold">
                        Purchase Base
                      </div>
                      <div className="text-base font-bold font-mono text-[#57534E] mt-0.5">
                        ${(watch.purchasePrice || watch.estimatedMarketValue).toLocaleString()}
                      </div>
                      {watch.purchaseDate && (
                        <div className="text-[10px] text-[#8C7D70] font-mono mt-0.5">
                          Acquired {watch.purchaseDate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes if any */}
                  {watch.notes && (
                    <p className="text-xs text-[#57534E] italic bg-[#EDE8E0]/70 p-2.5 rounded-xl border border-[#DDD6CB]">
                      "{watch.notes}"
                    </p>
                  )}

                  {/* Bottom Actions: Convert to Listing / Manage / Edit */}
                  <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCollectionWatch(watch);
                          setIsAddCollectionOpen(true);
                        }}
                        className="p-2 rounded-xl bg-[#FAF8F5] border border-[#D8D0C5] hover:border-[#B8AEA3] text-[#57534E] hover:text-[#1C1917] transition-colors"
                        title="Edit Vault Watch"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteFromCollection(watch.id)}
                        className="p-2 rounded-xl bg-[#FAF8F5] border border-[#D8D0C5] hover:border-[#9E4738]/40 text-[#8C7D70] hover:text-[#9E4738] transition-colors"
                        title="Remove from Vault"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Listing Action */}
                    {watch.isListedForSale && linkedListing ? (
                      <button
                        onClick={() => setSelectedWatch(linkedListing)}
                        className="flex items-center gap-1.5 bg-[#EDE8E0] hover:bg-[#E2DCD2] text-[#1C1917] px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#967139]" />
                        <span>View Live Listing</span>
                      </button>
                    ) : (
                      <button
                        id={`list-from-vault-btn-${watch.id}`}
                        onClick={() => handleOpenListModal(watch)}
                        className="flex items-center gap-1.5 bg-[#C5A880] hover:bg-[#B3936A] text-[#1C1917] font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>List on Marketplace</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick List From Vault Modal */}
      {listModalWatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
              <h3 className="text-sm font-serif font-bold text-[#1C1917] flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-[#967139]" />
                <span>Publish to Marketplace</span>
              </h3>
              <button
                onClick={() => setListModalWatch(null)}
                className="text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5]">
              <img
                src={listModalWatch.images[0]}
                alt={listModalWatch.model}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <div className="text-xs font-serif font-bold text-[#967139] uppercase font-mono">
                  {listModalWatch.brand}
                </div>
                <h4 className="text-sm font-serif font-bold text-[#1C1917]">{listModalWatch.model}</h4>
                <div className="text-[11px] text-[#78716C] font-mono">
                  Ref. {listModalWatch.referenceNumber} • {listModalWatch.year}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Asking Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7D70] text-sm font-mono">$</span>
                <input
                  id="vault-publish-price-input"
                  type="number"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
                  placeholder="e.g. 15000"
                />
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">
                Estimated market value is ${listModalWatch.estimatedMarketValue.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Public Listing Description
              </label>
              <textarea
                value={listingDescription}
                onChange={(e) => setListingDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl p-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
                placeholder="Highlight condition, completeness, and service provenance..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setListModalWatch(null)}
                className="flex-1 bg-[#EDE8E0] hover:bg-[#E2DCD2] text-[#57534E] font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                id="vault-confirm-publish-btn"
                onClick={handleConfirmList}
                className="flex-1 bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Confirm & List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
