import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Box, Check, Sparkles } from 'lucide-react';
import {
  CollectionWatch,
  WatchCondition,
  WatchMovement,
  WatchCaseMaterial
} from '../types';

const PRESET_WATCH_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80'
];

export const AddCollectionWatchModal: React.FC = () => {
  const {
    isAddCollectionOpen,
    setIsAddCollectionOpen,
    editingCollectionWatch,
    setEditingCollectionWatch,
    addToCollection,
    updateCollectionWatch,
    showToast
  } = useMarketplace();

  const [brand, setBrand] = useState('Rolex');
  const [model, setModel] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [year, setYear] = useState(2023);
  const [serialNumber, setSerialNumber] = useState('');
  const [caseDiameter, setCaseDiameter] = useState(40);
  const [caseMaterial, setCaseMaterial] = useState<WatchCaseMaterial>('Stainless Steel');
  const [movement, setMovement] = useState<WatchMovement>('Automatic');
  const [dialColor, setDialColor] = useState('Black');
  const [condition, setCondition] = useState<WatchCondition>('Mint');
  const [purchasePrice, setPurchasePrice] = useState<number>(10000);
  const [purchaseDate, setPurchaseDate] = useState<string>('2024-01-15');
  const [estimatedMarketValue, setEstimatedMarketValue] = useState<number>(12000);
  const [imageUrl, setImageUrl] = useState<string>(PRESET_WATCH_IMAGES[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingCollectionWatch) {
      setBrand(editingCollectionWatch.brand);
      setModel(editingCollectionWatch.model);
      setReferenceNumber(editingCollectionWatch.referenceNumber);
      setYear(editingCollectionWatch.year);
      setSerialNumber(editingCollectionWatch.serialNumber || '');
      setCaseDiameter(editingCollectionWatch.caseDiameter);
      setCaseMaterial(editingCollectionWatch.caseMaterial);
      setMovement(editingCollectionWatch.movement);
      setDialColor(editingCollectionWatch.dialColor);
      setCondition(editingCollectionWatch.condition);
      setPurchasePrice(editingCollectionWatch.purchasePrice || 10000);
      setPurchaseDate(editingCollectionWatch.purchaseDate || '2024-01-15');
      setEstimatedMarketValue(editingCollectionWatch.estimatedMarketValue);
      setImageUrl(editingCollectionWatch.images[0] || PRESET_WATCH_IMAGES[0]);
      setNotes(editingCollectionWatch.notes || '');
    } else {
      setModel('');
      setReferenceNumber('');
      setSerialNumber('');
      setYear(2023);
      setPurchasePrice(10000);
      setEstimatedMarketValue(11500);
      setNotes('');
    }
  }, [editingCollectionWatch, isAddCollectionOpen]);

  if (!isAddCollectionOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!model.trim() || !referenceNumber.trim()) {
      showToast('Missing Fields', 'Please enter Model and Reference Number', 'warning');
      return;
    }

    if (editingCollectionWatch) {
      updateCollectionWatch(editingCollectionWatch.id, {
        brand,
        model,
        referenceNumber,
        year,
        serialNumber,
        caseDiameter,
        caseMaterial,
        movement,
        dialColor,
        condition,
        purchasePrice,
        purchaseDate,
        estimatedMarketValue,
        images: [imageUrl],
        notes
      });
    } else {
      addToCollection({
        brand,
        model,
        referenceNumber,
        year,
        serialNumber,
        caseDiameter,
        caseMaterial,
        movement,
        dialColor,
        condition,
        purchasePrice,
        purchaseDate,
        estimatedMarketValue,
        images: [imageUrl],
        notes
      });
    }

    setIsAddCollectionOpen(false);
    setEditingCollectionWatch(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        id="add-collection-modal-content"
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#1C1917]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#967139]">
              Watch Vault & Box
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1C1917] mt-0.5">
              {editingCollectionWatch ? 'Edit Vault Piece' : 'Add Timepiece to Personal Vault'}
            </h2>
          </div>

          <button
            onClick={() => {
              setIsAddCollectionOpen(false);
              setEditingCollectionWatch(null);
            }}
            className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Brand *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Rolex, Patek Philippe"
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Model Name *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Submariner, Speedmaster"
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Reference Number *
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. 126610LN"
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Serial Number (Private)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. 8921X30"
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Financials: Purchase Price & Current Valuation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div>
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-1">
                Purchase Price (USD)
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl px-3 py-2 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-1">
                Acquisition Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl px-3 py-2 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#967139] uppercase tracking-wider mb-1">
                Est. Market Value ($) *
              </label>
              <input
                type="number"
                value={estimatedMarketValue}
                onChange={(e) => setEstimatedMarketValue(Number(e.target.value))}
                required
                className="w-full bg-[#FAF8F5] border border-[#C5A880] rounded-xl px-3 py-2 text-xs font-mono text-[#967139] font-bold focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
              Watch Photo (Select Preset or Enter URL)
            </label>
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
              {PRESET_WATCH_IMAGES.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="preset"
                  referrerPolicy="no-referrer"
                  onClick={() => setImageUrl(img)}
                  className={`w-14 h-14 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                    imageUrl === img ? 'border-[#967139] ring-2 ring-[#C5A880]/40' : 'border-[#E5DFD5] opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
              Private Collector Notes & Service Records
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Serviced June 2024, worn on special occasions, kept in winder..."
              className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl p-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddCollectionOpen(false);
                setEditingCollectionWatch(null);
              }}
              className="bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] font-semibold px-5 py-2.5 rounded-xl text-xs border border-[#D8D0C5] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4 text-[#C5A880]" />
              <span>{editingCollectionWatch ? 'Save Changes' : 'Add to Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
