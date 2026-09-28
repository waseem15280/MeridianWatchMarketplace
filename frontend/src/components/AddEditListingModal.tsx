import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { marketplaceApi } from '../services/api/marketplaceApi';
import {
  X,
  Plus,
  Upload,
  Camera,
  Loader2,
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

const POPULAR_BRANDS = [
  'HMT',
  'Seiko',
  'Citizen',
  'Ricoh',
  'Titan',
  'Omega',
  'Allwyn',
  'Timex',
  'Casio',
  'Westend'
];

const MOVEMENTS: WatchMovement[] = [
  'Automatic',
  'Manual Winding',
  'Quartz',
  'Digital',
  'Solar',
  'Hybrid'
];

const CONDITIONS: WatchCondition[] = ['Unworn', 'Mint', 'Very Good', 'Good', 'Fair'];

const CASE_MATERIALS: WatchCaseMaterial[] = [
  'Stainless Steel',
  'Gold Plated',
  'Platinum',
  'Titanium',
  'Ceramic',
  'Bronze'
];

interface ImageItem {
  id: string;
  previewUrl: string;
  file?: File;
  existingUrl?: string;
}

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

  // Image upload state (up to 5 images)
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setImageItems(
        (editingListing.images || []).map((url, i) => ({
          id: `existing-${i}-${url}`,
          previewUrl: url,
          existingUrl: url
        }))
      );
    } else {
      setModel('');
      setReferenceNumber('');
      setYear(2024);
      setPrice(12500);
      setCondition('Mint');
      setDescription('');
      setProvenanceNotes('');
      setImageItems([]);
    }
  }, [editingListing, isAddListingOpen]);

  if (!isAddListingOpen) return null;

  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const remainingSlots = 5 - imageItems.length;
    if (remainingSlots <= 0) {
      showToast('Limit Reached', 'You can upload a maximum of 5 images per timepiece listing.', 'warning');
      return;
    }

    if (fileArray.length > remainingSlots) {
      showToast('Limit Exceeded', `Only ${remainingSlots} more image(s) can be added (maximum 5 images allowed).`, 'warning');
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const validItems: ImageItem[] = [];

    for (const file of filesToAdd) {
      if (!file.type.startsWith('image/')) {
        showToast('Invalid File', `'${file.name}' is not an image file`, 'error');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('File Too Large', `'${file.name}' exceeds the 10MB limit`, 'error');
        continue;
      }

      validItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    if (validItems.length > 0) {
      setImageItems((prev) => [...prev, ...validItems]);
    }
  };

  const removeImage = (index: number) => {
    setImageItems((prev) => {
      const item = prev[index];
      if (item.file && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!model.trim() || !referenceNumber.trim() || price <= 0) {
      showToast('Missing Fields', 'Please fill in Watch Model, Reference Number, and a valid Price', 'warning');
      return;
    }

    if (imageItems.length === 0) {
      showToast('Image Required', 'Please upload at least one timepiece photograph (maximum 5).', 'warning');
      return;
    }

    setIsUploading(true);

    try {
      // Determine which files need to be uploaded to Cloudinary
      const newFilesToUpload: { index: number; file: File }[] = [];
      const finalUrls: (string | null)[] = new Array(imageItems.length).fill(null);

      imageItems.forEach((item, index) => {
        if (item.existingUrl) {
          finalUrls[index] = item.existingUrl;
        } else if (item.file) {
          newFilesToUpload.push({ index, file: item.file });
        }
      });

      if (newFilesToUpload.length > 0) {
        const uploadResponse = await marketplaceApi.uploadImages(newFilesToUpload.map((x) => x.file));
        uploadResponse.urls.forEach((url, i) => {
          const originalIndex = newFilesToUpload[i].index;
          finalUrls[originalIndex] = url;
        });
      }

      const verifiedUrls = finalUrls.filter((u): u is string => typeof u === 'string' && u.length > 0);

      if (editingListing) {
        await updateListing(editingListing.id, {
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
          images: verifiedUrls
        });
        showToast('Listing Updated', 'Your timepiece listing and Cloudinary photography have been updated.', 'success');
      } else {
        await createListing({
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
          images: verifiedUrls,
          authenticityVerified: true,
          status: 'active'
        });
        showToast('Listing Published', 'Your timepiece has been published to the marketplace with Cloudinary images.', 'success');
      }

      // Cleanup local blob URLs
      imageItems.forEach((item) => {
        if (item.file && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      setIsAddListingOpen(false);
      setEditingListing(null);
    } catch (err: any) {
      console.error('Error saving listing with Cloudinary:', err);
      showToast('Upload Error', err?.message || 'Failed to upload images or save listing. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
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
            disabled={isUploading}
            onClick={() => {
              setIsAddListingOpen(false);
              setEditingListing(null);
            }}
            className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors disabled:opacity-50"
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

          {/* Image Upload & Cloudinary Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider">
                Timepiece Photography (Maximum 5 Images) *
              </label>
              <span className="text-[11px] font-medium text-[#78716C]">
                {imageItems.length} / 5 photos selected
              </span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFilesSelected(e.target.files);
                  e.target.value = '';
                }
              }}
            />

            {/* Image Previews Grid */}
            {imageItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1 pb-1">
                {imageItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-[#D8D0C5] bg-[#FFFFFF] shadow-sm hover:border-[#967139] transition-all"
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Watch photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Cover Photo Badge */}
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-[#1C1917]/90 text-[#C5A880] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
                        Cover Photo
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => removeImage(idx)}
                      aria-label="Remove image"
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors opacity-90 group-hover:opacity-100 disabled:opacity-30 shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drag & Drop Upload Zone (shown when fewer than 5 images) */}
            {imageItems.length < 5 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDragging
                    ? 'border-[#967139] bg-[#967139]/10 scale-[1.01]'
                    : 'border-[#D8D0C5] hover:border-[#967139] bg-[#FFFFFF]/70 hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center mx-auto mb-3 text-[#967139] shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-[#1C1917] mb-1">
                  Drag & drop watch photos here, or <span className="text-[#967139] underline font-bold">browse</span>
                </div>
                <div className="text-[11px] text-[#78716C]">
                  Upload up to {5 - imageItems.length} more {imageItems.length === 0 ? 'photos' : 'photo(s)'} (JPG, PNG, WEBP, GIF, max 10MB each)
                </div>
                <div className="text-[10px] text-[#A8A29E] mt-1 italic">
                  Photos will be stored on Cloudinary upon submission. The first photo acts as the primary cover.
                </div>
              </div>
            )}
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
              disabled={isUploading}
              onClick={() => {
                setIsAddListingOpen(false);
                setEditingListing(null);
              }}
              className="bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] font-semibold px-5 py-2.5 rounded-xl text-xs border border-[#D8D0C5] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              id="submit-listing-btn"
              type="submit"
              disabled={isUploading}
              className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#C5A880]" />
                  <span>{editingListing ? 'Save Changes' : 'Publish Listing'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
