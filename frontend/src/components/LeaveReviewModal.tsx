import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Star, ShieldCheck, Check, Sparkles } from 'lucide-react';

export const LeaveReviewModal: React.FC = () => {
  const {
    isReviewOpen,
    setIsReviewOpen,
    reviewTarget,
    setReviewTarget,
    addSellerReview,
    showToast
  } = useMarketplace();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [shipping, setShipping] = useState<number>(5);
  const [authenticity, setAuthenticity] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  if (!isReviewOpen || !reviewTarget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      showToast('Comment Required', 'Please share a brief note about your experience', 'warning');
      return;
    }

    addSellerReview(
      {
        sellerId: reviewTarget.sellerId,
        rating,
        subRatings: {
          accuracy,
          communication,
          shipping,
          authenticity
        },
        comment: comment.trim(),
        watchModel: reviewTarget.watchModel,
        watchReference: reviewTarget.watchReference,
        verifiedPurchase: true
      },
      reviewTarget.orderId
    );

    setIsReviewOpen(false);
    setReviewTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        id="leave-review-modal-content"
        className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#1C1917]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#967139]">
              Verified Buyer Rating
            </span>
            <h2 className="text-base font-serif font-bold text-[#1C1917] mt-0.5">
              Review {reviewTarget.sellerName}
            </h2>
          </div>

          <button
            onClick={() => {
              setIsReviewOpen(false);
              setReviewTarget(null);
            }}
            className="p-2 rounded-xl bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE8E0] border border-[#D8D0C5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Piece Reference Banner */}
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] flex items-center justify-between text-xs shadow-2xs">
            <div>
              <div className="text-[10px] text-[#78716C] uppercase font-semibold">
                Timepiece Verified
              </div>
              <div className="font-serif font-bold text-[#1C1917]">{reviewTarget.watchModel}</div>
            </div>
            {reviewTarget.watchReference && (
              <span className="text-[11px] font-mono text-[#967139] bg-[#C5A880]/15 px-2 py-0.5 rounded border border-[#C5A880]/30 font-semibold">
                Ref. {reviewTarget.watchReference}
              </span>
            )}
          </div>

          {/* Main 5-Star Rating Selector */}
          <div className="text-center p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-2 shadow-2xs">
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1C1917]">
              Overall Seller Star Rating *
            </label>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    id={`star-btn-${star}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isActive
                          ? 'fill-[#967139] text-[#967139]'
                          : 'text-[#D8D0C5] hover:text-[#C5A880]'
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-[#78592A] font-mono">
              {rating === 5 && '★★★★★ Outstanding Experience (5.0)'}
              {rating === 4 && '★★★★☆ Great Seller (4.0)'}
              {rating === 3 && '★★★☆☆ Average (3.0)'}
              {rating === 2 && '★★☆☆☆ Below Expectations (2.0)'}
              {rating === 1 && '★☆☆☆☆ Poor (1.0)'}
            </div>
          </div>

          {/* Sub-ratings Breakdown */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] text-xs shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Detailed Experience Ratings
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#57534E]">Item Accuracy & Condition</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAccuracy(s)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                        accuracy >= s ? 'bg-[#1C1917] text-[#FAF8F5]' : 'bg-[#EDE8E0] text-[#78716C]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#57534E]">Seller Communication & Responsiveness</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCommunication(s)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                        communication >= s ? 'bg-[#1C1917] text-[#FAF8F5]' : 'bg-[#EDE8E0] text-[#78716C]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#57534E]">Shipping & Packaging Care</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShipping(s)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                        shipping >= s ? 'bg-[#1C1917] text-[#FAF8F5]' : 'bg-[#EDE8E0] text-[#78716C]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Written Feedback Text */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1.5">
              Buyer Review Comment *
            </label>
            <textarea
              id="review-comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              placeholder="Describe the timepiece accuracy, delivery speed, packaging protection, and overall experience..."
              className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl p-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsReviewOpen(false);
                setReviewTarget(null);
              }}
              className="bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E] font-semibold px-4 py-2.5 rounded-xl text-xs border border-[#D8D0C5] transition-colors"
            >
              Cancel
            </button>

            <button
              id="submit-review-btn"
              type="submit"
              className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#C5A880]" />
              <span>Publish Verified Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
