import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { marketplaceApi } from '../services/api/marketplaceApi';
import {
  X,
  Box,
  Check,
  Sparkles,
  Upload,
  Camera,
  Loader2,
  IndianRupee
} from 'lucide-react';
import {
  CollectionWatch,
  WatchCondition,
  WatchMovement,
  WatchCaseMaterial
} from '../types';

interface ImageItem {
  id: string;
  previewUrl: string;
  file?: File;
  existingUrl?: string;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

export const AddCollectionWatchModal: React.FC = () => {
  const {
    isAddCollectionOpen,
    setIsAddCollectionOpen,
    editingCollectionWatch,
    setEditingCollectionWatch,
    addToCollection,
    updateCollectionWatch,
    isGatewayConnected,
    showToast
  } = useMarketplace();

  // Required Fields: Brand, Model Name, Timepiece Photography
  const [brand, setBrand] = useState('HMT');
  const [model, setModel] = useState('');

  // Optional Fields
  const [referenceNumber, setReferenceNumber] = useState('');
  const [year, setYear] = useState<number | ''>(2024);
  const [serialNumber, setSerialNumber] = useState('');
  const [caseDiameter, setCaseDiameter] = useState<number | ''>(40);
  const [caseMaterial, setCaseMaterial] = useState<WatchCaseMaterial>('Stainless Steel');
  const [movement, setMovement] = useState<WatchMovement>('Automatic');
  const [dialColor, setDialColor] = useState('Black');
  const [condition, setCondition] = useState<WatchCondition>('Mint');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [estimatedMarketValue, setEstimatedMarketValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Image Upload State (Maximum 2 images)
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCollectionWatch) {
      setBrand(editingCollectionWatch.brand || 'HMT');
      setModel(editingCollectionWatch.model || '');
      setReferenceNumber(editingCollectionWatch.referenceNumber || '');
      setYear(editingCollectionWatch.year || 2024);
      setSerialNumber(editingCollectionWatch.serialNumber || '');
      setCaseDiameter(editingCollectionWatch.caseDiameter || 40);
      setCaseMaterial(editingCollectionWatch.caseMaterial || 'Stainless Steel');
      setMovement(editingCollectionWatch.movement || 'Automatic');
      setDialColor(editingCollectionWatch.dialColor || 'Black');
      setCondition(editingCollectionWatch.condition || 'Mint');
      setPurchasePrice(editingCollectionWatch.purchasePrice ?? '');
      setPurchaseDate(editingCollectionWatch.purchaseDate || '');
      setEstimatedMarketValue(editingCollectionWatch.estimatedMarketValue ?? '');
      setNotes(editingCollectionWatch.notes || '');

      setImageItems(
        (editingCollectionWatch.images || []).slice(0, 2).map((url, i) => ({
          id: `existing-${i}-${url}`,
          previewUrl: url,
          existingUrl: url
        }))
      );
    } else {
      setBrand('HMT');
      setModel('');
      setReferenceNumber('');
      setSerialNumber('');
      setYear(2024);
      setCaseDiameter(40);
      setCaseMaterial('Stainless Steel');
      setMovement('Automatic');
      setDialColor('Black');
      setCondition('Mint');
      setPurchasePrice('');
      setPurchaseDate('');
      setEstimatedMarketValue('');
      setNotes('');
      setImageItems([]);
    }
  }, [editingCollectionWatch, isAddCollectionOpen]);

  if (!isAddCollectionOpen) return null;

  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const remainingSlots = 2 - imageItems.length;
    if (remainingSlots <= 0) {
      showToast('Limit Reached', 'You can upload a maximum of 2 images for your vault timepiece.', 'warning');
      return;
    }

    if (fileArray.length > remainingSlots) {
      showToast('Limit Exceeded', `Only ${remainingSlots} more image(s) can be added (maximum 2 images allowed).`, 'warning');
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

    // Required: Brand & Model Name
    if (!brand.trim() || !model.trim()) {
      showToast('Missing Fields', 'Please fill in Brand and Model Name.', 'warning');
      return;
    }

    // Required: Timepiece Photography (at least 1 image, max 2)
    if (imageItems.length === 0) {
      showToast('Image Required', 'Please upload at least one timepiece photograph (maximum 2).', 'warning');
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
        if (isGatewayConnected) {
          try {
            const uploadResponse = await marketplaceApi.uploadImages(newFilesToUpload.map((x) => x.file));
            uploadResponse.urls.forEach((url, i) => {
              const originalIndex = newFilesToUpload[i].index;
              finalUrls[originalIndex] = url;
            });
          } catch (uploadErr) {
            console.warn('Gateway Cloudinary upload error, using local fallback:', uploadErr);
            for (const item of newFilesToUpload) {
              finalUrls[item.index] = await fileToDataUrl(item.file);
            }
          }
        } else {
          for (const item of newFilesToUpload) {
            finalUrls[item.index] = await fileToDataUrl(item.file);
          }
        }
      }

      const verifiedUrls = finalUrls.filter((u): u is string => typeof u === 'string' && u.length > 0);

      const parsedPrice = purchasePrice !== '' ? Number(purchasePrice) : undefined;
      const parsedMarketValue = estimatedMarketValue !== '' ? Number(estimatedMarketValue) : (parsedPrice ?? 0);
      const parsedYear = year !== '' ? Number(year) : new Date().getFullYear();
      const parsedDiameter = caseDiameter !== '' ? Number(caseDiameter) : 40;

      if (editingCollectionWatch) {
        await updateCollectionWatch(editingCollectionWatch.id, {
          brand: brand.trim(),
          model: model.trim(),
          referenceNumber: referenceNumber.trim() || 'N/A',
          year: parsedYear,
          serialNumber: serialNumber.trim() || undefined,
          caseDiameter: parsedDiameter,
          caseMaterial,
          movement,
          dialColor,
          condition,
          purchasePrice: parsedPrice,
          purchaseDate: purchaseDate.trim() || undefined,
          estimatedMarketValue: parsedMarketValue,
          images: verifiedUrls,
          notes: notes.trim() || undefined
        });
      } else {
        await addToCollection({
          brand: brand.trim(),
          model: model.trim(),
          referenceNumber: referenceNumber.trim() || 'N/A',
          year: parsedYear,
          serialNumber: serialNumber.trim() || undefined,
          caseDiameter: parsedDiameter,
          caseMaterial,
          movement,
          dialColor,
          condition,
          purchasePrice: parsedPrice,
          purchaseDate: purchaseDate.trim() || undefined,
          estimatedMarketValue: parsedMarketValue,
          images: verifiedUrls,
          notes: notes.trim() || undefined
        });
      }

      // Cleanup local blob URLs
      imageItems.forEach((item) => {
        if (item.file && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      setIsAddCollectionOpen(false);
      setEditingCollectionWatch(null);
    } catch (err: any) {
      console.error('Error saving vault watch:', err);
      showToast('Error', err?.message || 'Failed to save timepiece to vault. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
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
            id="close-add-collection-btn"
            disabled={isUploading}
            onClick={() => {
              setIsAddCollectionOpen(false);
              setEditingCollectionWatch(null);
            }}
            className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
          {/* Brand & Model Name (Required) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Brand *
              </label>
              <input
                id="vault-watch-brand-input"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. HMT, Seiko"
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Model Name *
              </label>
              <input
                id="vault-watch-model-input"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Submariner, Speedmaster, Janata"
                required
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Timepiece Photography (Required, Maximum 2 Images) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider">
                Timepiece Photography (Maximum 2 Images) *
              </label>
              <span className="text-[11px] font-medium text-[#78716C]">
                {imageItems.length} / 2 photos selected
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
              <div className="grid grid-cols-2 gap-3 pt-1 pb-1">
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

            {/* Drag & Drop Upload Zone (shown when fewer than 2 images) */}
            {imageItems.length < 2 && (
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
                  Upload up to {2 - imageItems.length} more {imageItems.length === 0 ? 'photos' : 'photo'} (JPG, PNG, WEBP, GIF, max 10MB each)
                </div>
                <div className="text-[10px] text-[#A8A29E] mt-1 italic">
                  Photos will be stored on Cloudinary upon saving. The first photo acts as the primary cover.
                </div>
              </div>
            )}
          </div>

          {/* Optional: Reference Number, Serial Number, Year */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Reference Number
              </label>
              <input
                id="vault-watch-ref-input"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. 126610LN (Optional)"
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Serial Number (Private)
              </label>
              <input
                id="vault-watch-serial-input"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. 8921X30 (Optional)"
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
                Year of Production
              </label>
              <input
                id="vault-watch-year-input"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                min={1900}
                max={2030}
                placeholder="e.g. 2024 (Optional)"
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>
          </div>

          {/* Optional Financials: Purchase Price, Acquisition Date, Current Valuation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div>
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-1">
                Purchase Price (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] text-xs font-mono">
                  ₹
                </span>
                <input
                  id="vault-watch-price-input"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value ? Number(e.target.value) : '')}
                  min={0}
                  placeholder="Optional"
                  className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-1">
                Acquisition Date
              </label>
              <input
                id="vault-watch-date-input"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl px-3 py-2 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#967139] uppercase tracking-wider mb-1">
                Est. Market Value (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#967139] text-xs font-mono">
                  ₹
                </span>
                <input
                  id="vault-watch-valuation-input"
                  type="number"
                  value={estimatedMarketValue}
                  onChange={(e) => setEstimatedMarketValue(e.target.value ? Number(e.target.value) : '')}
                  min={0}
                  placeholder="Optional"
                  className="w-full bg-[#FAF8F5] border border-[#C5A880] rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-[#967139] font-bold focus:outline-none focus:border-[#967139]"
                />
              </div>
            </div>
          </div>

          {/* Optional: Private Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
              Private Collector Notes & Service Records
            </label>
            <textarea
              id="vault-watch-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Serviced June 2024, worn on special occasions, kept in winder... (Optional)"
              className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl p-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                setIsAddCollectionOpen(false);
                setEditingCollectionWatch(null);
              }}
              className="bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] font-semibold px-5 py-2.5 rounded-xl text-xs border border-[#D8D0C5] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              id="submit-vault-watch-btn"
              type="submit"
              disabled={isUploading}
              className="bg-[#1C1917] hover:bg-[#2D2A26] disabled:opacity-50 text-[#FAF8F5] font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Uploading & Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#C5A880]" />
                  <span>{editingCollectionWatch ? 'Save Changes' : 'Add to Vault'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
