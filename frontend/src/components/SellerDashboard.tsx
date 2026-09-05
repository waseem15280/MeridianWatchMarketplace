import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Store,
  PlusCircle,
  Package,
  DollarSign,
  Star,
  ShieldCheck,
  Edit,
  Trash2,
  PauseCircle,
  PlayCircle,
  Eye,
  CheckCircle2,
  Box,
  ArrowUpRight,
  MessageSquare,
  CornerDownRight,
  Clock,
  Sparkles,
  Layers,
  Send
} from 'lucide-react';
import { WatchListing, CollectionWatch } from '../types';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    listings,
    collection,
    updateListing,
    deleteListing,
    toggleListingStatus,
    setIsAddListingOpen,
    setEditingListing,
    listFromCollection,
    getSellerReviews,
    replyToSellerReview,
    offers,
    respondToOffer,
    setSelectedWatch,
    showToast
  } = useMarketplace();

  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'from-collection' | 'reviews' | 'offers'>('listings');
  const [collectionImportPrice, setCollectionImportPrice] = useState<{ [id: string]: number }>({});
  const [replyInput, setReplyInput] = useState<{ [reviewId: string]: string }>({});
  const [counterPriceInput, setCounterPriceInput] = useState<{ [offerId: string]: number }>({});

  // Filter listings by current user
  const myListings = listings.filter((l) => l.sellerId === currentUser.id);
  const myActiveListings = myListings.filter((l) => l.status === 'active');
  const myReviews = getSellerReviews(currentUser.id);
  const myReceivedOffers = offers.filter((o) => o.sellerId === currentUser.id);

  // Unlisted collection watches
  const unlistedCollection = collection.filter((c) => c.userId === currentUser.id && !c.isListedForSale);

  // Compute stats
  const totalInventoryValue = myActiveListings.reduce((sum, item) => sum + item.price, 0);

  const handlePublishFromCollection = (watch: CollectionWatch) => {
    const price = collectionImportPrice[watch.id] || watch.estimatedMarketValue || 5000;
    listFromCollection(watch.id, price, watch.notes);
  };

  const handleSendReply = (reviewId: string) => {
    const text = replyInput[reviewId];
    if (!text || !text.trim()) return;
    replyToSellerReview(reviewId, text.trim());
    setReplyInput((prev) => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div id="seller-dashboard" className="space-y-8 pb-12">
      {/* Seller Hero & Top Metrics */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD5] relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C5A880] shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1C1917]">{currentUser.name}</h1>
                {currentUser.verifiedDealer && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold bg-[#C5A880]/20 text-[#78592A] border border-[#C5A880]/40 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#967139]" />
                    Verified Dealer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#57534E] mt-1 max-w-xl">
                Seller Command Center • Manage active horology inventory, publish watches from your personal collection vault, review buyer feedback, and handle offers.
              </p>
            </div>
          </div>

          <button
            id="seller-create-new-listing-btn"
            onClick={() => {
              setEditingListing(null);
              setIsAddListingOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] px-5 py-3 rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A880]" />
            <span>Create New Listing</span>
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E5DFD5]">
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Active Listings
            </div>
            <div className="text-2xl font-bold text-[#1C1917] font-mono mt-1">
              {myActiveListings.length}
            </div>
            <div className="text-[10px] text-[#967139] mt-0.5 font-medium">Live on marketplace</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Listed Inventory Value
            </div>
            <div className="text-2xl font-bold text-[#1C1917] font-mono mt-1">
              ${totalInventoryValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#3D5A45] mt-0.5 font-medium">Escrow protected</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Seller Rating
            </div>
            <div className="text-2xl font-bold text-[#967139] font-mono mt-1 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-[#967139] text-[#967139]" />
              <span>{currentUser.rating.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-[#78716C] mt-0.5 font-mono">
              From {myReviews.length} buyer reviews
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs">
            <div className="text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
              Completed Transactions
            </div>
            <div className="text-2xl font-bold text-[#1C1917] font-mono mt-1">
              {currentUser.totalSalesCount}
            </div>
            <div className="text-[10px] text-[#78716C] mt-0.5">Total authenticated sales</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-2 overflow-x-auto no-scrollbar">
        <button
          id="seller-tab-my-listings"
          onClick={() => setActiveSubTab('listings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'listings'
              ? 'bg-[#1C1917] text-[#FAF8F5] shadow-sm'
              : 'bg-[#FAF8F5] text-[#57534E] border border-[#D8D0C5] hover:bg-[#EDE8E0]'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>My Listings ({myListings.length})</span>
        </button>

        <button
          id="seller-tab-from-collection"
          onClick={() => setActiveSubTab('from-collection')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'from-collection'
              ? 'bg-[#1C1917] text-[#FAF8F5] shadow-sm'
              : 'bg-[#FAF8F5] text-[#57534E] border border-[#D8D0C5] hover:bg-[#EDE8E0]'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-[#967139]" />
          <span>Publish from Vault ({unlistedCollection.length})</span>
        </button>

        <button
          id="seller-tab-received-reviews"
          onClick={() => setActiveSubTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'reviews'
              ? 'bg-[#1C1917] text-[#FAF8F5] shadow-sm'
              : 'bg-[#FAF8F5] text-[#57534E] border border-[#D8D0C5] hover:bg-[#EDE8E0]'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-[#967139] text-[#967139]" />
          <span>Buyer Reviews & Ratings ({myReviews.length})</span>
        </button>

        <button
          id="seller-tab-offers"
          onClick={() => setActiveSubTab('offers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'offers'
              ? 'bg-[#1C1917] text-[#FAF8F5] shadow-sm'
              : 'bg-[#FAF8F5] text-[#57534E] border border-[#D8D0C5] hover:bg-[#EDE8E0]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Buyer Offers ({myReceivedOffers.length})</span>
        </button>
      </div>

      {/* Tab 1: My Listings Manager */}
      {activeSubTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE8E0] text-[#967139] mx-auto flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1C1917]">No Listings Yet</h3>
              <p className="text-xs text-[#78716C] max-w-md mx-auto">
                You haven't listed any timepieces on the marketplace. Create a new listing or publish an existing piece from your personal watch vault.
              </p>
              <button
                onClick={() => {
                  setEditingListing(null);
                  setIsAddListingOpen(true);
                }}
                className="bg-[#1C1917] text-[#FAF8F5] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#2D2A26] transition-colors inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-[#C5A880]" />
                <span>Create Your First Listing</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myListings.map((watch) => (
                <div
                  key={watch.id}
                  id={`seller-listing-${watch.id}`}
                  className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-[#C5A880] transition-colors shadow-2xs"
                >
                  {/* Left: Thumbnail & Watch Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={watch.images[0]}
                      alt={watch.model}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover bg-[#EDE8E0] border border-[#D8D0C5] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-[#967139] uppercase tracking-wider">
                          {watch.brand}
                        </span>
                        <span className="text-[#D8D0C5]">•</span>
                        <span className="text-[11px] text-[#78716C] font-mono">
                          Ref. {watch.referenceNumber}
                        </span>
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            watch.status === 'active'
                              ? 'bg-[#3D5A45]/15 text-[#3D5A45] border border-[#3D5A45]/30'
                              : watch.status === 'sold'
                              ? 'bg-[#EDE8E0] text-[#78716C] border border-[#DDD6CB]'
                              : 'bg-[#C5A880]/20 text-[#78592A] border border-[#C5A880]/40'
                          }`}
                        >
                          {watch.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-serif font-bold text-[#1C1917] mt-1">{watch.model}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E] mt-1">
                        <span className="font-mono">{watch.year}</span>
                        <span>•</span>
                        <span>{watch.caseDiameter}mm</span>
                        <span>•</span>
                        <span>{watch.condition}</span>
                        <span>•</span>
                        <span className="text-[#78716C]">
                          {watch.viewsCount} views • {watch.wishlistCount} wishlists
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & Management Controls */}
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5DFD5]">
                    <div className="text-left md:text-right">
                      <div className="text-base font-bold text-[#1C1917] font-mono">
                        ${watch.price.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#78716C] font-mono">
                        Listed {new Date(watch.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle status (Active / Paused) */}
                      {watch.status !== 'sold' && (
                        <button
                          id={`toggle-status-btn-${watch.id}`}
                          onClick={() =>
                            toggleListingStatus(
                              watch.id,
                              watch.status === 'active' ? 'paused' : 'active'
                            )
                          }
                          className="p-2 rounded-xl bg-[#FAF8F5] border border-[#D8D0C5] hover:border-[#B8AEA3] text-[#57534E] transition-colors"
                          title={watch.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
                        >
                          {watch.status === 'active' ? (
                            <PauseCircle className="w-4 h-4 text-[#967139]" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-[#3D5A45]" />
                          )}
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        id={`edit-listing-btn-${watch.id}`}
                        onClick={() => {
                          setEditingListing(watch);
                          setIsAddListingOpen(true);
                        }}
                        className="p-2 rounded-xl bg-[#FAF8F5] border border-[#D8D0C5] hover:border-[#B8AEA3] text-[#57534E] hover:text-[#1C1917] transition-colors"
                        title="Edit Details & Price"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Inspect/View */}
                      <button
                        onClick={() => setSelectedWatch(watch)}
                        className="p-2 rounded-xl bg-[#FAF8F5] border border-[#D8D0C5] hover:border-[#B8AEA3] text-[#57534E] hover:text-[#967139] transition-colors"
                        title="Preview Public Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        id={`delete-listing-btn-${watch.id}`}
                        onClick={() => deleteListing(watch.id)}
                        className="p-2 rounded-xl bg-[#FAF8F5] border border-[#D8D0C5] hover:border-[#9E4738]/40 text-[#8C7D70] hover:text-[#9E4738] transition-colors"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Publish from Personal Collection Vault */}
      {activeSubTab === 'from-collection' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-xs text-[#78592A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-[#967139]" />
            <span>
              Directly list any watch from your private collection vault onto the marketplace with one click.
            </span>
          </div>

          {unlistedCollection.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-3">
              <Box className="w-10 h-10 text-[#8C7D70] mx-auto" />
              <h3 className="text-sm font-serif font-bold text-[#1C1917]">
                All Vault Watches Are Currently Listed
              </h3>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                Add more timepieces to your personal collection vault to list them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlistedCollection.map((cw) => {
                const currentPrice =
                  collectionImportPrice[cw.id] !== undefined
                    ? collectionImportPrice[cw.id]
                    : cw.estimatedMarketValue || 5000;

                return (
                  <div
                    key={cw.id}
                    id={`unlisted-vault-watch-${cw.id}`}
                    className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-4 flex flex-col justify-between shadow-2xs"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={cw.images[0]}
                        alt={cw.model}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-cover bg-[#EDE8E0] border border-[#D8D0C5] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-serif font-bold text-[#967139] uppercase tracking-wider">
                          {cw.brand}
                        </div>
                        <h4 className="text-sm font-serif font-bold text-[#1C1917] truncate">{cw.model}</h4>
                        <div className="text-[11px] text-[#78716C] font-mono mt-0.5">
                          Ref. {cw.referenceNumber} • {cw.year} • {cw.caseDiameter}mm
                        </div>
                        <div className="text-[11px] text-[#57534E] mt-1">
                          Est. Value: ${cw.estimatedMarketValue?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5DFD5] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-[#57534E] mb-1">
                            Listing Price (USD)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C7D70] text-xs font-mono">
                              $
                            </span>
                            <input
                              type="number"
                              value={currentPrice}
                              onChange={(e) =>
                                setCollectionImportPrice({
                                  ...collectionImportPrice,
                                  [cw.id]: Number(e.target.value)
                                })
                              }
                              className="w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl pl-6 pr-3 py-2 text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#967139]"
                            />
                          </div>
                        </div>

                        <div className="self-end">
                          <button
                            id={`publish-vault-btn-${cw.id}`}
                            onClick={() => handlePublishFromCollection(cw)}
                            className="bg-[#C5A880] hover:bg-[#B3936A] text-[#1C1917] font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 h-[38px] shadow-2xs"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Publish</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Buyer Reviews & Ratings */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#1C1917] uppercase tracking-wider">
              Customer Feedback ({myReviews.length} verified ratings)
            </h3>
            <div className="flex items-center gap-1.5 text-[#967139] text-xs font-bold bg-[#C5A880]/20 px-3 py-1 rounded-xl border border-[#C5A880]/40">
              <Star className="w-4 h-4 fill-[#967139]" />
              <span>Overall Average: {currentUser.rating.toFixed(2)} / 5.0</span>
            </div>
          </div>

          {myReviews.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-3">
              <Star className="w-8 h-8 text-[#8C7D70] mx-auto" />
              <h4 className="text-sm font-serif font-bold text-[#1C1917]">No Reviews Received Yet</h4>
              <p className="text-xs text-[#78716C]">
                When buyers purchase and verify timepieces, their ratings and reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((rev) => (
                <div
                  key={rev.id}
                  id={`seller-received-review-${rev.id}`}
                  className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.buyerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                        alt={rev.buyerName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-[#D8D0C5]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#1C1917] flex items-center gap-2">
                          <span>{rev.buyerName}</span>
                          <span className="text-[10px] font-semibold bg-[#3D5A45]/15 text-[#3D5A45] border border-[#3D5A45]/30 px-1.5 py-0.2 rounded">
                            Verified Buyer
                          </span>
                        </div>
                        <div className="text-[11px] text-[#78716C] font-mono mt-0.5">
                          Piece: {rev.watchModel}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-[#967139] justify-end">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-[#967139]' : 'text-[#D8D0C5]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#78716C] font-mono mt-0.5 block">
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#57534E] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5]">
                    "{rev.comment}"
                  </p>

                  {/* Existing Reply or Reply Input */}
                  {rev.sellerReply ? (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#C5A880]/40 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[#967139] font-semibold text-[11px]">
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Your Response:</span>
                      </div>
                      <p className="text-[#57534E] text-xs pl-5">{rev.sellerReply}</p>
                    </div>
                  ) : (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write an official seller reply to this buyer review..."
                        value={replyInput[rev.id] || ''}
                        onChange={(e) =>
                          setReplyInput({ ...replyInput, [rev.id]: e.target.value })
                        }
                        className="flex-1 bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
                      />
                      <button
                        onClick={() => handleSendReply(rev.id)}
                        className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Received Buyer Offers */}
      {activeSubTab === 'offers' && (
        <div className="space-y-4">
          <h3 className="text-sm font-serif font-bold text-[#1C1917] uppercase tracking-wider">
            Incoming Buyer Offers ({myReceivedOffers.length})
          </h3>

          {myReceivedOffers.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-3">
              <DollarSign className="w-8 h-8 text-[#8C7D70] mx-auto" />
              <h4 className="text-sm font-serif font-bold text-[#1C1917]">No Pending Offers</h4>
              <p className="text-xs text-[#78716C]">
                When buyers make offers on your listed timepieces, they will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReceivedOffers.map((offer) => (
                <div
                  key={offer.id}
                  id={`seller-offer-${offer.id}`}
                  className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-4 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={offer.watchImage}
                        alt={offer.watchModel}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover bg-[#EDE8E0] border border-[#D8D0C5] shrink-0"
                      />
                      <div>
                        <div className="text-xs font-serif font-bold text-[#967139]">
                          {offer.watchBrand}
                        </div>
                        <h4 className="text-sm font-serif font-bold text-[#1C1917]">{offer.watchModel}</h4>
                        <div className="text-xs text-[#78716C] mt-0.5">
                          From buyer: <span className="text-[#1C1917] font-semibold">{offer.buyerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#78716C]">Offer Amount</div>
                      <div className="text-xl font-bold text-[#1C1917] font-mono">
                        ${offer.offerAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#78716C] font-mono">
                        List Price: ${offer.originalListingPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {offer.message && (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-xs text-[#57534E]">
                      <span className="text-[#78716C] font-semibold">Message: </span>
                      "{offer.message}"
                    </div>
                  )}

                  {/* Status / Actions */}
                  <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between">
                    <div className="text-xs font-mono text-[#78716C]">
                      Status: <span className="uppercase text-[#967139] font-bold">{offer.status}</span>
                    </div>

                    {offer.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => respondToOffer(offer.id, 'accepted')}
                          className="bg-[#3D5A45] hover:bg-[#324b39] text-[#FAF8F5] font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-2xs"
                        >
                          Accept Offer
                        </button>

                        <button
                          onClick={() => respondToOffer(offer.id, 'declined')}
                          className="bg-[#EDE8E0] hover:bg-[#E2DCD2] text-[#57534E] font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
