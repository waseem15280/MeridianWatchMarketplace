import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShoppingBag,
  ShieldCheck,
  Star,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Box,
  CornerDownRight,
  ArrowRight
} from 'lucide-react';
import { OrderTransaction, WatchOffer } from '../types';

export const OrdersOffersView: React.FC = () => {
  const {
    currentUser,
    orders,
    offers,
    setIsReviewOpen,
    setReviewTarget,
    setSelectedSeller,
    getSellerById,
    updateOrderStatus
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'orders' | 'offers'>('orders');

  // Filter orders where currentUser is buyer or seller
  const myBuyerOrders = orders.filter((o) => o.buyerId === currentUser.id);
  const mySubmittedOffers = offers.filter((o) => o.buyerId === currentUser.id);

  const handleOpenReview = (order: OrderTransaction) => {
    setReviewTarget({
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      watchModel: order.watchModel,
      watchReference: order.watchReference,
      orderId: order.id
    });
    setIsReviewOpen(true);
  };

  return (
    <div id="orders-offers-view" className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#FAF8F5] border border-[#E5DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#967139]">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-serif font-bold uppercase tracking-wider">Transaction Hub</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1C1917] mt-1">
            Orders, Escrow & Offers
          </h1>
          <p className="text-xs text-[#57534E] mt-1">
            Track certified shipments, escrow releases, and provide verified ratings for sellers.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-[#EDE8E0] p-1.5 rounded-2xl border border-[#D8D0C5]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#1C1917] text-[#FAF8F5] shadow-sm'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            My Orders ({myBuyerOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'offers'
                ? 'bg-[#1C1917] text-[#FAF8F5] shadow-sm'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            My Offers ({mySubmittedOffers.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myBuyerOrders.length === 0 ? (
            <div className="p-16 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-3">
              <ShoppingBag className="w-10 h-10 text-[#8C7D70] mx-auto" />
              <h3 className="text-sm font-serif font-bold text-[#1C1917]">No Orders Yet</h3>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                Acquire timepieces with certified escrow protection on the marketplace.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBuyerOrders.map((order) => {
                const seller = getSellerById(order.sellerId);
                return (
                  <div
                    key={order.id}
                    id={`order-card-${order.id}`}
                    className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-5 shadow-2xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
                      <div>
                        <div className="text-[11px] font-mono text-[#78716C]">
                          ORDER ID: <span className="text-[#1C1917] font-bold">{order.id}</span> • Placed {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[#57534E] mt-0.5 flex items-center gap-2">
                          <span>Seller:</span>
                          <button
                            onClick={() => seller && setSelectedSeller(seller)}
                            className="text-[#967139] font-bold hover:underline flex items-center gap-1"
                          >
                            {order.sellerName}
                            <ShieldCheck className="w-3.5 h-3.5 text-[#967139]" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#3D5A45]/15 text-[#3D5A45] border border-[#3D5A45]/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Escrow {order.status}
                        </span>

                        {/* Leave Review CTA if not reviewed */}
                        {!order.hasReviewed ? (
                          <button
                            id={`leave-review-btn-${order.id}`}
                            onClick={() => handleOpenReview(order)}
                            className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
                            <span>Rate Seller & Feedback</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#967139] flex items-center gap-1 bg-[#C5A880]/20 px-3 py-1.5 rounded-xl border border-[#C5A880]/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#967139]" />
                            Feedback Submitted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-8 flex items-start gap-4">
                        <img
                          src={order.watchImage}
                          alt={order.watchModel}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-2xl object-cover bg-[#EDE8E0] border border-[#D8D0C5] shrink-0"
                        />
                        <div>
                          <div className="text-xs font-serif font-bold text-[#967139] uppercase tracking-wider">
                            {order.watchBrand}
                          </div>
                          <h3 className="text-base font-serif font-bold text-[#1C1917]">{order.watchModel}</h3>
                          <div className="text-xs text-[#78716C] font-mono mt-0.5">
                            Reference: {order.watchReference}
                          </div>
                          {order.trackingNumber && (
                            <div className="text-[11px] text-[#57534E] font-mono mt-2 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-[#967139]" />
                              <span>Tracking: {order.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-right space-y-1">
                        <div className="text-[11px] text-[#78716C]">Total Authenticated Amount</div>
                        <div className="text-xl font-bold font-mono text-[#1C1917]">
                          ${order.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#3D5A45] font-medium">
                          Includes fully insured shipping + Watchmaker Authentication
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

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {mySubmittedOffers.length === 0 ? (
            <div className="p-16 text-center bg-[#FFFFFF] rounded-3xl border border-[#E5DFD5] space-y-3">
              <DollarSign className="w-10 h-10 text-[#8C7D70] mx-auto" />
              <h3 className="text-sm font-serif font-bold text-[#1C1917]">No Offers Submitted</h3>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                When you make offers on timepieces, you can track seller responses here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mySubmittedOffers.map((offer) => (
                <div
                  key={offer.id}
                  id={`buyer-offer-${offer.id}`}
                  className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-3 shadow-2xs"
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
                        <div className="text-xs text-[#57534E] mt-0.5">
                          Status: <span className="font-bold uppercase text-[#967139]">{offer.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#78716C]">Your Offer</div>
                      <div className="text-xl font-bold text-[#1C1917] font-mono">
                        ${offer.offerAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#78716C] font-mono">
                        Listed at ${offer.originalListingPrice.toLocaleString()}
                      </div>
                    </div>
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
