import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  Plus,
  Image,
  Sparkles,
  ShieldCheck,
  Package,
  FileText,
  DollarSign,
  Compass,
  Check
} from 'lucide-react';
import {
  WatchListing,
  WatchCondition,
  WatchMovement,
  WatchCaseMaterial
} from '../types';

const PRESET_WATCH_IMAGES = [
  {
    name: 'Rolex Daytona White Dial',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Rolex Submariner Green/Black',
    url: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Patek Philippe Nautilus Blue',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Audemars Piguet Royal Oak',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Omega Speedmaster Chrono',
    url: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Cartier Santos Steel',
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Grand Seiko Shunbun Titanium',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Tudor Black Bay Vintage',
    url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=1200&q=80'
  }
];

const POPULAR_BRANDS = [
  'Rolex',
  'Patek Philippe',
  'Audemars Piguet',
  'Omega',
  'Cartier',
  'Grand Seiko',
  'Tudor',
  'Vacheron Constantin',
  'IWC',
  'Jaeger-LeCoultre'
];

const MOVEMENTS: WatchMovement[] = [
  'Automatic',
  'Manual Winding',
  'Spring Drive',
  'Quartz',
  'Tourbillon',
  'Co-Axial Chronometer'
];

const CONDITIONS: WatchCondition[] = ['Unworn', 'Mint', 'Very Good', 'Good', 'Fair'];

const CASE_MATERIALS: WatchCaseMaterial[] = [
  'Stainless Steel',
  'Oystersteel',
  '18k Yellow Gold',
  '18k Rose/Pink Gold',
  '18k White Gold',
  'Platinum',
  'Titanium',
  'Ceramic',
  'Two-Tone (Steel & Gold)'
];

export const AddEditListingModal: React.FC = () => {
  const {
    isAddListingOpen,
    setIsAddListingOpen,
    editingListing,
    setEditingListing,
    createListing,
    updateListing,
    showToast
  } = useMarketplace();

  const [brand, setBrand] = useState('Rolex');
  const [model, setModel] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [year, setYear] = useState<number>(2023);
  const [price, setPrice] = useState<number>(10000);
  const [condition, setCondition] = useState<WatchCondition>('Mint');
  const [movement, setMovement] = useState<WatchMovement>('Automatic');
  const [caseMaterial, setCaseMaterial] = useState<WatchCaseMaterial>('Stainless Steel');
  const [caseDiameter, setCaseDiameter] = useState<number>(40);
  const [dialColor, setDialColor] = useState('Black');
  const [braceletMaterial, setBraceletMaterial] = useState('Stainless Steel Bracelet');
  const [hasOriginalBox, setHasOriginalBox] = useState(true);
  const [hasOriginalPapers, setHasOriginalPapers] = useState(true);
  const [description, setDescription] = useState('');
  const [provenanceNotes, setProvenanceNotes] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([PRESET_WATCH_IMAGES[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Pre-fill if editing
  useEffect(() => {
    if (editingListing) {
      setBrand(editingListing.brand);
      setModel(editingListing.model);
      setReferenceNumber(editingListing.referenceNumber);
      setYear(editingListing.year);
      setPrice(editingListing.price);
      setCondition(editingListing.condition);
      setMovement(editingListing.movement);
      setCaseMaterial(editingListing.caseMaterial);
      setCaseDiameter(editingListing.caseDiameter);
      setDialColor(editingListing.dialColor);
      setBraceletMaterial(editingListing.braceletMaterial);
      setHasOriginalBox(editingListing.hasOriginalBox);
      setHasOriginalPapers(editingListing.hasOriginalPapers);
      setDescription(editingListing.description);
      setProvenanceNotes(editingListing.provenanceNotes || '');
      setImageUrls(editingListing.images);
    } else {
      setModel('');
      setReferenceNumber('');
      setYear(2024);
      setPrice(12500);
      setCondition('Mint');
      setDescription('');
      setProvenanceNotes('');
      setImageUrls([PRESET_WATCH_IMAGES[0].url]);
    }
  }, [editingListing, isAddListingOpen]);

  if (!isAddListingOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!model.trim() || !referenceNumber.trim() || price <= 0) {
      showToast('Missing Fields', 'Please fill in Watch Model, Reference Number, and a valid Price', 'warning');
      return;
    }

    if (imageUrls.length === 0) {
      showToast('Image Required', 'Please select or add at least one watch photo', 'warning');
      return;
    }

    if (editingListing) {
      updateListing(editingListing.id, {
        brand,
        model,
        referenceNumber,
        year,
        price,
        condition,
        movement,
        caseMaterial,
        caseDiameter,
        dialColor,
        braceletMaterial,
        hasOriginalBox,
        hasOriginalPapers,
        description: description || `Certified ${brand} ${model} in ${condition} condition.`,
        provenanceNotes,
        images: imageUrls
      });
    } else {
      createListing({
        brand,
        model,
        referenceNumber,
        year,
        price,
        currency: 'USD',
        condition,
        movement,
        caseMaterial,
        caseDiameter,
        dialColor,
        braceletMaterial,
        hasOriginalBox,
        hasOriginalPapers,
        description: description || `Certified authentic ${brand} ${model} reference ${referenceNumber}. Inspected and timed.`,
        provenanceNotes,
        images: imageUrls,
        authenticityVerified: true,
        status: 'active'
      });
    }

    setIsAddListingOpen(false);
    setEditingListing(null);
  };

  const addCustomImage = () => {
    if (customImageUrl.trim()) {
      setImageUrls((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        id="add-listing-modal-content"
        className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#1C1917]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#967139]">
              Seller Management
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1C1917] mt-0.5">
              {editingListing ? 'Edit Timepiece Listing' : 'Create New Marketplace Listing'}
            </h2>
          </div>

          <button
            id="close-add-listing-btn"
            onClick={() => {
              setIsAddListingOpen(false);
              setEditingListing(null);
            }}
            className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Brand & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Manufacture / Brand *
              </label>
              <select
                id="listing-brand-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              >
                {POPULAR_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Model Name *
              </label>
              <input
                id="listing-model-input"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Cosmograph Daytona, Nautilus, Royal Oak"
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Reference Number & Year & Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Reference Number *
              </label>
              <input
                id="listing-ref-input"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. 116500LN, 5711/1A"
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Year of Production
              </label>
              <input
                id="listing-year-input"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1950}
                max={2026}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Asking Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] text-xs font-mono">
                  $
                </span>
                <input
                  id="listing-price-input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl pl-7 pr-3 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139] font-bold"
                />
              </div>
            </div>
          </div>

          {/* Condition, Movement, Diameter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Condition
              </label>
              <select
                id="listing-condition-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as WatchCondition)}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Caliber Movement
              </label>
              <select
                id="listing-movement-select"
                value={movement}
                onChange={(e) => setMovement(e.target.value as WatchMovement)}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              >
                {MOVEMENTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Case Diameter (mm)
              </label>
              <input
                id="listing-diameter-input"
                type="number"
                value={caseDiameter}
                onChange={(e) => setCaseDiameter(Number(e.target.value))}
                min={28}
                max={50}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Case Material & Dial & Bracelet */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Case Material
              </label>
              <select
                value={caseMaterial}
                onChange={(e) => setCaseMaterial(e.target.value as WatchCaseMaterial)}
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              >
                {CASE_MATERIALS.map((cm) => (
                  <option key={cm} value={cm}>
                    {cm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Dial Color
              </label>
              <input
                type="text"
                value={dialColor}
                onChange={(e) => setDialColor(e.target.value)}
                placeholder="e.g. Sunburst Blue, Panda White"
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Bracelet / Strap
              </label>
              <input
                type="text"
                value={braceletMaterial}
                onChange={(e) => setBraceletMaterial(e.target.value)}
                placeholder="e.g. Oystersteel Bracelet"
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Scope of Delivery */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-2">
              Scope of Delivery (Box & Papers)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] cursor-pointer shadow-2xs">
                <input
                  type="checkbox"
                  checked={hasOriginalBox}
                  onChange={(e) => setHasOriginalBox(e.target.checked)}
                  className="accent-[#967139] w-4 h-4 rounded"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#1C1917]">Original Manufacturer Box</div>
                  <div className="text-[10px] text-[#78716C]">Presentation case included</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] cursor-pointer shadow-2xs">
                <input
                  type="checkbox"
                  checked={hasOriginalPapers}
                  onChange={(e) => setHasOriginalPapers(e.target.checked)}
                  className="accent-[#967139] w-4 h-4 rounded"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#1C1917]">Original Warranty Papers / Card</div>
                  <div className="text-[10px] text-[#78716C]">Certificate of authenticity</div>
                </div>
              </label>
            </div>
          </div>

          {/* Visuals & Photo Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider">
              Timepiece Photography & Gallery
            </label>

            {/* Selected image previews */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-20 rounded-xl overflow-hidden border border-[#D8D0C5] shrink-0 group shadow-2xs">
                  <img src={url} alt="watch" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Presets Picker */}
            <div>
              <div className="text-[11px] text-[#78716C] font-semibold mb-1.5">
                Quick Select Luxury Photo Presets:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_WATCH_IMAGES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!imageUrls.includes(preset.url)) {
                        setImageUrls([preset.url, ...imageUrls]);
                      }
                    }}
                    className="p-2 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] hover:border-[#967139] text-left text-[11px] text-[#1C1917] transition-colors flex items-center gap-2 truncate shadow-2xs"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover shrink-0 border border-[#E5DFD5]"
                    />
                    <span className="truncate">{preset.name.split(' ')[0]} {preset.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste custom image URL (https://...)"
                className="flex-1 bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
              <button
                type="button"
                onClick={addCustomImage}
                className="bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#1C1917] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#D8D0C5] transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Description & Provenance */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Listing Description & Condition Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe bezel state, crystal clarity, timing performance, service history, and completeness..."
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl p-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Provenance & Service History
              </label>
              <input
                type="text"
                value={provenanceNotes}
                onChange={(e) => setProvenanceNotes(e.target.value)}
                placeholder="e.g. Single collector owner, serviced at Geneva Service Center in 2024"
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddListingOpen(false);
                setEditingListing(null);
              }}
              className="bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] font-semibold px-5 py-2.5 rounded-xl text-xs border border-[#D8D0C5] transition-colors"
            >
              Cancel
            </button>

            <button
              id="submit-listing-btn"
              type="submit"
              className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#C5A880]" />
              <span>{editingListing ? 'Save Changes' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
