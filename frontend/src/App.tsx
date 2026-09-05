import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { ToastContainer } from './components/ToastContainer';
import { Header } from './components/Header';
import { ExploreView } from './components/ExploreView';
import { SellerDashboard } from './components/SellerDashboard';
import { CollectionManager } from './components/CollectionManager';
import { WishlistView } from './components/WishlistView';
import { OrdersOffersView } from './components/OrdersOffersView';
import { WatchDetailModal } from './components/WatchDetailModal';
import { SellerProfileModal } from './components/SellerProfileModal';
import { AddEditListingModal } from './components/AddEditListingModal';
import { AddCollectionWatchModal } from './components/AddCollectionWatchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { LeaveReviewModal } from './components/LeaveReviewModal';
import { CompareDrawer } from './components/CompareDrawer';
import { ShieldCheck, Lock, Award, Heart } from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const { activeTab } = useMarketplace();

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1C1917] flex flex-col font-sans selection:bg-[#C5A880]/30 selection:text-[#1C1917]">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Primary Header */}
      <Header />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'seller-hub' && <SellerDashboard />}
        {activeTab === 'collection' && <CollectionManager />}
        {activeTab === 'wishlist' && <WishlistView />}
        {activeTab === 'orders' && <OrdersOffersView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5DFD5] bg-[#EDE8E0]/70 py-10 mt-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#78716C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2D2A26] text-[#F5F2ED] flex items-center justify-center font-serif text-sm font-bold shadow-sm">
              M
            </div>
            <div>
              <span className="font-serif font-bold text-[#1C1917] tracking-widest text-sm">MERIDIAN</span>
              <p className="text-[11px] text-[#8C7D70]">The Fine Antiquité Horlogerie Marketplace & Curated Vault</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[#57534E]">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#967139]" />
              Verified Authenticity
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#3D5A45]" />
              Insured Escrow Custody
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-[#967139]" />
              Buyer-Rated Sellers
            </span>
          </div>

          <div className="text-[#8C7D70] text-center md:text-right font-mono text-[11px]">
            © {new Date().getFullYear()} Meridian Antiquité Horlogerie. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <WatchDetailModal />
      <SellerProfileModal />
      <AddEditListingModal />
      <AddCollectionWatchModal />
      <CheckoutModal />
      <LeaveReviewModal />
      <CompareDrawer />
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
