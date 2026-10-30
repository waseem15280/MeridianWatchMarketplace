import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserAccount,
  UserLogin,
  WatchListing,
  CollectionWatch,
  SellerReview,
  OrderTransaction,
  WatchOffer,
  FilterOptions,
  ActiveTab,
  UserRole,
  ServiceRequest,
  ServiceWorkflowState,
  ServiceRequestAuditLog
} from '../types';
import {
  FeatureFlags,
  isFeatureAccessible,
  isFeatureActiveInApp,
  isTabAccessible,
  getFirstAccessibleTab
} from '../config/featureFlags';
import {
  marketplaceApi,
  collectorVaultApi,
  buyerWishlistApi,
  sellerHubApi,
  customerOrdersApi,
  userManagementApi,
  serviceCenterApi,
  TransitionRequestPayload,
  checkGatewayHealth,
  RegisterRequest
} from '../services/api';

export const GUEST_LOGIN: UserLogin = {
  id: 'guest',
  username: 'guest',
  email: 'guest@thc.com',
  accounts: []
};

export const GUEST_ACCOUNT: UserAccount = {
  id: 'guest-buyer',
  userLoginId: 'guest',
  name: 'Guest Collector',
  email: 'guest@thc.com',
  role: 'buyer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  location: 'Global',
  memberSince: new Date().getFullYear().toString(),
  verifiedDealer: false,
  bio: 'Exploring The Heritage Club as a guest.',
  rating: 0,
  reviewCount: 0,
  totalSalesCount: 0,
  responseRate: '100%',
  avgShipTime: 'N/A',
  isDefault: true
};
GUEST_LOGIN.accounts = [GUEST_ACCOUNT];

export const sanitizeAccount = (acc: UserAccount): UserAccount => {
  if (!acc.reviewCount || acc.reviewCount === 0) {
    return { ...acc, rating: 0, reviewCount: 0 };
  }
  return acc;
};

export const sanitizeListing = (listing: WatchListing): WatchListing => {
  if (!listing.sellerReviewCount || listing.sellerReviewCount === 0) {
    return { ...listing, sellerRating: 0, sellerReviewCount: 0 };
  }
  return listing;
};

const EMPTY_USER = GUEST_ACCOUNT;
const EMPTY_LOGIN = GUEST_LOGIN;

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface MarketplaceContextType {
  // Backend & Gateway Connectivity
  isGatewayConnected: boolean;
  isSyncing: boolean;
  refreshData: () => Promise<boolean>;

  // User & Accounts
  // Authentication & Login (Separated from accounts)
  isLoggedIn: boolean;
  currentLogin: UserLogin;
  availableLogins: Array<UserLogin & { accounts?: UserAccount[] }>;
  loginUser: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  registerUser: (data: RegisterRequest) => Promise<boolean>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  switchLogin: (loginId: string) => Promise<void>;

  // User & Accounts (1 Login -> N Accounts, 1 role per Account)
  currentUser: UserAccount;
  userAccounts: UserAccount[];
  accounts: UserAccount[];
  switchUser: (userId: string) => void;
  setUserRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserAccount>) => void;
  createUserAccount: (role: UserRole, name: string, bio?: string) => Promise<UserAccount>;
  
  // Feature Flags & Admin Role Access
  isAdmin: boolean;
  isServiceExecutive: boolean;
  canManageUsers: boolean;
  isGuest: boolean;
  isFeatureEnabled: (featureKey: keyof FeatureFlags) => boolean;
  isFeatureActive: (featureKey: keyof FeatureFlags) => boolean;
  isTabEnabled: (tab: ActiveTab) => boolean;

  // User Management Atelier & Directory (Admin & Service Executive only)
  allLogins: Array<UserLogin & { accounts: UserAccount[]; isActive?: boolean }>;
  loadAllLogins: () => Promise<void>;
  updateUserStatus: (loginId: string | number, isActive: boolean) => Promise<boolean>;
  resetUserPassword: (loginId: string | number, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateUserLogin: (loginId: string | number, updates: { username?: string; email?: string; isActive?: boolean }) => Promise<boolean>;
  deleteUserLogin: (loginId: string | number) => Promise<boolean>;
  updateUserPersonaRole: (personaId: string | number, role: UserRole) => Promise<boolean>;
  deleteUserPersona: (personaId: string | number) => Promise<boolean>;
  createPersonaForUser: (loginId: string | number, role: UserRole, name: string, bio?: string) => Promise<boolean>;

  // Global Authentication & Login Modal
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  promptLogin: (message?: string, watchIdToWishlist?: string) => void;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Listings
  listings: WatchListing[];
  filteredListings: WatchListing[];
  createListing: (listingData: Omit<WatchListing, 'id' | 'createdAt' | 'viewsCount' | 'wishlistCount' | 'sellerId' | 'sellerName' | 'sellerRating' | 'sellerReviewCount' | 'sellerVerified' | 'sellerLocation'>) => WatchListing;
  updateListing: (id: string, updates: Partial<WatchListing>) => void;
  deleteListing: (id: string) => void;
  toggleListingStatus: (id: string, newStatus: WatchListing['status']) => void;
  listFromCollection: (collectionWatchId: string, price: number, description?: string) => void;
  
  // Personal Collection / Watch Vault
  collection: CollectionWatch[];
  addToCollection: (watchData: Omit<CollectionWatch, 'id' | 'userId' | 'createdAt' | 'isListedForSale'>) => CollectionWatch;
  updateCollectionWatch: (id: string, updates: Partial<CollectionWatch>) => void;
  deleteFromCollection: (id: string) => void;
  unlinkCollectionListing: (collectionWatchId: string) => void;
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (watchId: string) => void;
  isInWishlist: (watchId: string) => boolean;
  clearWishlist: () => void;
  
  // Seller Ratings & Reviews
  reviews: SellerReview[];
  addSellerReview: (reviewData: Omit<SellerReview, 'id' | 'date' | 'buyerId' | 'buyerName' | 'buyerAvatar'>, orderId?: string) => void;
  replyToSellerReview: (reviewId: string, reply: string) => void;
  getSellerReviews: (sellerId: string) => SellerReview[];
  getSellerById: (sellerId: string) => UserAccount | undefined;
  
  // Orders & Transactions
  orders: OrderTransaction[];
  createOrder: (listingId: string, shippingAddress: string, paymentMethod: string) => OrderTransaction;
  updateOrderStatus: (orderId: string, status: OrderTransaction['status']) => void;
  
  // Offers
  offers: WatchOffer[];
  createOffer: (listingId: string, offerAmount: number, message: string) => WatchOffer;
  respondToOffer: (offerId: string, action: 'accepted' | 'declined' | 'countered', counterAmount?: number) => void;
  
  // Service Center (Watch Repair Service)
  serviceRequests: ServiceRequest[];
  createServiceRequest: (data: Omit<ServiceRequest, 'id' | 'currentState' | 'createdAt' | 'updatedAt' | 'auditLogs'>) => Promise<ServiceRequest>;
  transitionServiceRequest: (id: string | number, payload: TransitionRequestPayload) => Promise<boolean>;
  
  // Filters & Search
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  
  // Comparison
  compareList: string[];
  toggleCompare: (watchId: string) => void;
  clearCompare: () => void;
  
  // Modals UI State
  selectedWatch: WatchListing | null;
  setSelectedWatch: (watch: WatchListing | null) => void;
  selectedSeller: UserAccount | null;
  setSelectedSeller: (seller: UserAccount | null) => void;
  
  isAddListingOpen: boolean;
  setIsAddListingOpen: (open: boolean) => void;
  editingListing: WatchListing | null;
  setEditingListing: (listing: WatchListing | null) => void;
  
  isAddCollectionOpen: boolean;
  setIsAddCollectionOpen: (open: boolean) => void;
  editingCollectionWatch: CollectionWatch | null;
  setEditingCollectionWatch: (watch: CollectionWatch | null) => void;
  
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutWatch: WatchListing | null;
  setCheckoutWatch: (watch: WatchListing | null) => void;
  
  isOfferOpen: boolean;
  setIsOfferOpen: (open: boolean) => void;
  offerWatch: WatchListing | null;
  setOfferWatch: (watch: WatchListing | null) => void;
  
  isReviewOpen: boolean;
  setIsReviewOpen: (open: boolean) => void;
  reviewTarget: {
    sellerId: string;
    sellerName: string;
    watchModel: string;
    watchReference?: string;
    orderId?: string;
  } | null;
  setReviewTarget: (target: { sellerId: string; sellerName: string; watchModel: string; watchReference?: string; orderId?: string } | null) => void;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  brand: [],
  movement: [],
  condition: [],
  minPrice: 0,
  maxPrice: 150000,
  hasBox: false,
  hasPapers: false,
  minSellerRating: 0,
  sortBy: 'newest',
  caseDiameterRange: [30, 48]
};

export const DEFAULT_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 1,
    userId: '1',
    customerName: 'Alexander Vance',
    customerEmail: 'alexander.vance@horology.com',
    customerPhone: '+1 212 555 0199',
    watchBrand: 'Patek Philippe',
    watchModel: 'Calatrava 5196G White Gold',
    movementType: 'Manual Winding',
    isWorking: false,
    glassChangeRequired: true,
    issueDescription: 'Watch stopped ticking after minor impact. Front sapphire crystal has hairline fracture near 2 o\'clock.',
    currentState: 'ServiceRequestCreated',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    auditLogs: [
      {
        id: 1,
        serviceRequestId: 1,
        fromState: 'ServiceRequestCreated',
        toState: 'ServiceRequestCreated',
        action: 'Service Request Created',
        triggeredByUserId: '1',
        triggeredByName: 'Alexander Vance',
        triggeredByRole: 'buyer',
        notes: 'Initial request submitted with sapphire glass replacement inquiry.',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ]
  },
  {
    id: 2,
    userId: '2',
    customerName: 'Julian Sterling',
    customerEmail: 'j.sterling@collector.io',
    customerPhone: '+44 20 7946 0912',
    watchBrand: 'Audemars Piguet',
    watchModel: 'Royal Oak \'Jumbo\' Extra-Thin 15202ST',
    movementType: 'Automatic',
    isWorking: true,
    glassChangeRequired: false,
    issueDescription: 'Movement running fast (+28s/day). Needs complete ultrasonic cleaning, gasket refresh, and regulation.',
    currentState: 'ServiceRequestAccepted',
    estimatedPrice: 45000,
    serviceNotes: 'Standard Calibre 2121 complete overhaul and demagnetization required.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    auditLogs: [
      {
        id: 2,
        serviceRequestId: 2,
        fromState: 'ServiceRequestCreated',
        toState: 'ServiceRequestAccepted',
        action: 'Accept Request',
        triggeredByUserId: '11',
        triggeredByName: 'Jean-Marc Piguet (Service Lead)',
        triggeredByRole: 'service_executive',
        notes: 'Approved diagnostic inspection. Estimated cost quoted at ₹45,000.',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ]
  },
  {
    id: 3,
    userId: '1',
    customerName: 'Alexander Vance',
    customerEmail: 'alexander.vance@horology.com',
    customerPhone: '+1 212 555 0199',
    watchBrand: 'Rolex',
    watchModel: 'Submariner Date 126610LN',
    movementType: 'Automatic',
    isWorking: true,
    glassChangeRequired: false,
    issueDescription: 'Periodic bezel stiffness and periodic amplitude drop on Calibre 3235.',
    currentState: 'InTransit',
    estimatedPrice: 32000,
    courierCompany: 'Blue Dart Express',
    trackingNumber: 'BD-882910394IN',
    serviceNotes: 'Customer dispatched via insured express parcel.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    auditLogs: [
      {
        id: 3,
        serviceRequestId: 3,
        fromState: 'ServiceRequestAccepted',
        toState: 'InTransit',
        action: 'Dispatch Watch',
        triggeredByUserId: '1',
        triggeredByName: 'Alexander Vance',
        triggeredByRole: 'buyer',
        notes: 'Shipped via Blue Dart Express, tracking #BD-882910394IN',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ]
  },
  {
    id: 4,
    userId: '4',
    customerName: 'Geneva Horology Gallery',
    customerEmail: 'contact@genevahorology.ch',
    customerPhone: '+41 22 731 0022',
    watchBrand: 'Omega',
    watchModel: 'Speedmaster Professional \'Moonwatch\' Sapphire',
    movementType: 'Manual Winding',
    isWorking: false,
    glassChangeRequired: false,
    issueDescription: 'Chronograph reset pusher unresponsive; Calibre 1861 balance assembly replacement required.',
    currentState: 'UnderRepair',
    estimatedPrice: 38500,
    courierCompany: 'DHL International',
    trackingNumber: 'DHL-554499118',
    serviceNotes: 'Disassembly complete. Escapement cleaned; waiting on authentic Omega 1861 reset hammer.',
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    auditLogs: [
      {
        id: 4,
        serviceRequestId: 4,
        fromState: 'InTransit',
        toState: 'UnderRepair',
        action: 'Begin Repair',
        triggeredByUserId: '11',
        triggeredByName: 'Jean-Marc Piguet (Service Lead)',
        triggeredByRole: 'service_executive',
        notes: 'Package received in good order. Transferred to master watchmaker bench #3.',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ]
  },
  {
    id: 5,
    userId: '1',
    customerName: 'Alexander Vance',
    customerEmail: 'alexander.vance@horology.com',
    customerPhone: '+1 212 555 0199',
    watchBrand: 'Cartier',
    watchModel: 'Santos de Cartier Medium Steel',
    movementType: 'Automatic',
    isWorking: true,
    glassChangeRequired: true,
    issueDescription: 'Glass scratched, routine 5-year overhaul of Calibre 1847 MC.',
    currentState: 'InTesting',
    estimatedPrice: 28000,
    courierCompany: 'FedEx Express',
    trackingNumber: 'FDX-771122334',
    serviceNotes: 'Sapphire crystal replaced with genuine Cartier optic. Calibre 1847 MC re-lubricated. Currently in 5-position chronometer timing machine.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    auditLogs: [
      {
        id: 5,
        serviceRequestId: 5,
        fromState: 'UnderRepair',
        toState: 'InTesting',
        action: 'Move to Testing',
        triggeredByUserId: '11',
        triggeredByName: 'Jean-Marc Piguet (Service Lead)',
        triggeredByRole: 'service_executive',
        notes: 'Reassembly passed. 48-hour power reserve and 100m ISO 22810 pressure test initiated.',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 6,
    userId: '2',
    customerName: 'Julian Sterling',
    customerEmail: 'j.sterling@collector.io',
    customerPhone: '+44 20 7946 0912',
    watchBrand: 'Vacheron Constantin',
    watchModel: 'Overseas Chronograph Blue Dial',
    movementType: 'Automatic',
    isWorking: true,
    glassChangeRequired: false,
    issueDescription: 'Comprehensive factory service, column-wheel chronograph calibration, case satin refinishing.',
    currentState: 'TransitBack',
    estimatedPrice: 62000,
    courierCompany: 'Blue Dart Express',
    trackingNumber: 'BD-11223344IN',
    returnCourierCompany: 'Blue Dart Secure Armored',
    returnTrackingNumber: 'BD-RET-99002211IN',
    serviceNotes: 'All Geneva seal performance requirements exceeded (+1.8s/day average). Dispatched in protective THC service pod.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    auditLogs: [
      {
        id: 6,
        serviceRequestId: 6,
        fromState: 'InTesting',
        toState: 'TransitBack',
        action: 'Dispatch Return',
        triggeredByUserId: '11',
        triggeredByName: 'Jean-Marc Piguet (Service Lead)',
        triggeredByRole: 'service_executive',
        notes: 'Testing passed with honors. Dispatched back to customer via Blue Dart Secure.',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ]
  }
];

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial local states with localStorage fallback (defaults to GUEST if no saved authenticated session)
  const [currentLoginId, setCurrentLoginId] = useState<string | number>(() => {
    const saved = localStorage.getItem('chronos_current_login_id');
    return saved && saved !== 'guest' ? saved : GUEST_LOGIN.id;
  });

  const [availableLogins, setAvailableLogins] = useState<Array<UserLogin & { accounts?: UserAccount[] }>>(() => {
    const savedLoginId = localStorage.getItem('chronos_current_login_id');
    const savedLogins = localStorage.getItem('chronos_available_logins');
    if (savedLoginId && savedLoginId !== 'guest' && savedLogins) {
      try {
        const parsed = JSON.parse(savedLogins);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return [GUEST_LOGIN];
  });

  const [allLogins, setAllLogins] = useState<Array<UserLogin & { accounts: UserAccount[]; isActive?: boolean }>>([]);

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const savedLoginId = localStorage.getItem('chronos_current_login_id');
    const saved = localStorage.getItem('chronos_accounts');
    if (savedLoginId && savedLoginId !== 'guest' && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeAccount);
      } catch {
        // fallback
      }
    }
    return [GUEST_ACCOUNT];
  });

  const [currentUserId, setCurrentUserId] = useState<string | number>(() => {
    const savedLoginId = localStorage.getItem('chronos_current_login_id');
    const saved = localStorage.getItem('chronos_current_user_id');
    return savedLoginId && savedLoginId !== 'guest' ? saved : GUEST_ACCOUNT.id;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');

  const [listings, setListings] = useState<WatchListing[]>(() => {
    const saved = localStorage.getItem('chronos_listings');
    return saved ? JSON.parse(saved).map(sanitizeListing) : [];
  });

  const [collection, setCollection] = useState<CollectionWatch[]>(() => {
    const saved = localStorage.getItem('chronos_collection');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    // Clean up deprecated global key to avoid cross-user leakage
    try {
      localStorage.removeItem('chronos_wishlist');
    } catch {
      // ignore
    }

    const savedLoginId = localStorage.getItem('chronos_current_login_id');
    const savedUserId = localStorage.getItem('chronos_current_user_id');
    if (savedLoginId && savedLoginId !== 'guest' && savedUserId && savedUserId !== 'guest' && savedUserId !== 'guest-buyer') {
      const saved = localStorage.getItem(`chronos_wishlist_${savedUserId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  const [reviews, setReviews] = useState<SellerReview[]>(() => {
    const saved = localStorage.getItem('chronos_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<OrderTransaction[]>(() => {
    const saved = localStorage.getItem('chronos_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [offers, setOffers] = useState<WatchOffer[]>(() => {
    const saved = localStorage.getItem('chronos_offers');
    return saved ? JSON.parse(saved) : [];
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('chronos_service_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_SERVICE_REQUESTS;
  });

  const [compareList, setCompareList] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  // Global Authentication & Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [pendingWishlistId, setPendingWishlistId] = useState<string | null>(null);

  // Modals & UI States
  const [selectedWatch, setSelectedWatch] = useState<WatchListing | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<UserAccount | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<WatchListing | null>(null);
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState<boolean>(false);
  const [editingCollectionWatch, setEditingCollectionWatch] = useState<CollectionWatch | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutWatch, setCheckoutWatch] = useState<WatchListing | null>(null);
  const [isOfferOpen, setIsOfferOpen] = useState<boolean>(false);
  const [offerWatch, setOfferWatch] = useState<WatchListing | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [reviewTarget, setReviewTarget] = useState<{
    sellerId: string;
    sellerName: string;
    watchModel: string;
    watchReference?: string;
    orderId?: string;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const promptLogin = (message?: string, watchIdToWishlist?: string) => {
    if (watchIdToWishlist) {
      setPendingWishlistId(watchIdToWishlist);
    }
    setIsLoginModalOpen(true);
    showToast('Authentication Required', message || 'Please log in to continue.', 'info');
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('chronos_available_logins', JSON.stringify(availableLogins));
  }, [availableLogins]);

  useEffect(() => {
    localStorage.setItem('chronos_current_login_id', String(currentLoginId));
  }, [currentLoginId]);

  useEffect(() => {
    localStorage.setItem('chronos_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('chronos_current_user_id', String(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('chronos_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('chronos_collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    if (currentUserId && currentUserId !== 'guest' && currentUserId !== 'guest-buyer') {
      try {
        localStorage.setItem(`chronos_wishlist_${currentUserId}`, JSON.stringify(wishlist));
      } catch (e) {
        console.warn('Could not cache user wishlist in localStorage', e);
      }
    }
  }, [wishlist, currentUserId]);

  useEffect(() => {
    localStorage.setItem('chronos_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('chronos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('chronos_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    try {
      localStorage.setItem('chronos_service_requests', JSON.stringify(serviceRequests));
    } catch (e) {
      console.warn('Could not cache service requests in localStorage', e);
    }
  }, [serviceRequests]);

  // Backend & API Gateway Connectivity
  const [isGatewayConnected, setIsGatewayConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshData = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const isHealthy = await checkGatewayHealth();
      setIsGatewayConnected(isHealthy);
      if (!isHealthy) {
        setIsSyncing(false);
        return false;
      }

      // Query catalog and operational microservices in parallel via YARP Gateway (:5000)
      // Note: User logins are NOT retrieved in bulk on startup or guest mode.
      // Wishlist is only queried if a real authenticated user persona is active.
      const shouldFetchWishlist = Boolean(
        currentLoginId &&
        currentLoginId !== 'guest' &&
        currentUserId &&
        currentUserId !== 'guest' &&
        currentUserId !== 'guest-buyer'
      );

      const [
        listingsRes,
        collectionRes,
        wishlistRes,
        profilesRes,
        reviewsRes,
        ordersRes,
        offersRes,
        serviceRequestsRes
      ] = await Promise.allSettled([
        marketplaceApi.getListings(),
        collectorVaultApi.getWatches(),
        shouldFetchWishlist ? buyerWishlistApi.getWishlist(String(currentUserId)) : Promise.resolve([]),
        sellerHubApi.getProfiles(),
        sellerHubApi.getReviews(),
        customerOrdersApi.getOrders(),
        customerOrdersApi.getBuyerOffers(),
        serviceCenterApi.getServiceRequests(currentUserId, currentUser?.role)
      ]);

      if (listingsRes.status === 'fulfilled' && Array.isArray(listingsRes.value)) {
        const sanitized = listingsRes.value.map(sanitizeListing);
        setListings(sanitized);
        try {
          localStorage.setItem('chronos_listings', JSON.stringify(sanitized));
        } catch (e) {
          console.warn('Could not cache listings in localStorage', e);
        }
      }
      if (collectionRes.status === 'fulfilled' && Array.isArray(collectionRes.value)) {
        setCollection(collectionRes.value);
        try {
          localStorage.setItem('chronos_collection', JSON.stringify(collectionRes.value));
        } catch (e) {
          console.warn('Could not cache collection in localStorage', e);
        }
      }
      if (shouldFetchWishlist && wishlistRes.status === 'fulfilled' && Array.isArray(wishlistRes.value)) {
        const ids = wishlistRes.value.map((item) => String(item.listingId));
        setWishlist(ids);
        try {
          localStorage.setItem(`chronos_wishlist_${currentUserId}`, JSON.stringify(ids));
        } catch (e) {
          console.warn('Could not cache wishlist in localStorage', e);
        }
      } else if (!shouldFetchWishlist) {
        setWishlist([]);
      }

      if (serviceRequestsRes.status === 'fulfilled' && Array.isArray(serviceRequestsRes.value) && serviceRequestsRes.value.length > 0) {
        setServiceRequests(serviceRequestsRes.value);
        try {
          localStorage.setItem('chronos_service_requests', JSON.stringify(serviceRequestsRes.value));
        } catch (e) {
          console.warn('Could not cache service requests in localStorage', e);
        }
      }

      // If user is already authenticated in localStorage, refresh ONLY their accounts
      if (currentLoginId && currentLoginId !== 'guest') {
        try {
          const userAccounts = await userManagementApi.getLoginAccounts(currentLoginId);
          if (Array.isArray(userAccounts) && userAccounts.length > 0) {
            const sanitizedAccs = userAccounts.map(sanitizeAccount);
            setAccounts(sanitizedAccs);
            try {
              localStorage.setItem('chronos_accounts', JSON.stringify(sanitizedAccs));
            } catch (e) {
              console.warn('Could not cache accounts in localStorage', e);
            }
          }
        } catch (accErr) {
          console.warn('Could not refresh accounts for active login:', accErr);
        }
      } else if (profilesRes.status === 'fulfilled' && Array.isArray(profilesRes.value) && profilesRes.value.length > 0) {
        // Fallback seller profiles for marketplace cards only if no accounts
      }

      if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
        setReviews(reviewsRes.value);
        try {
          localStorage.setItem('chronos_reviews', JSON.stringify(reviewsRes.value));
        } catch (e) {
          console.warn('Could not cache reviews in localStorage', e);
        }
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setOrders(ordersRes.value);
        try {
          localStorage.setItem('chronos_orders', JSON.stringify(ordersRes.value));
        } catch (e) {
          console.warn('Could not cache orders in localStorage', e);
        }
      }
      if (offersRes.status === 'fulfilled' && Array.isArray(offersRes.value)) {
        setOffers(offersRes.value);
        try {
          localStorage.setItem('chronos_offers', JSON.stringify(offersRes.value));
        } catch (e) {
          console.warn('Could not cache offers in localStorage', e);
        }
      }
      return true;
    } catch (err) {
      console.warn('Backend microservices sync error:', err);
      const recheck = await checkGatewayHealth().catch(() => false);
      setIsGatewayConnected(recheck);
      return recheck;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Background health check & auto-reconnect every 15 seconds
    const intervalId = setInterval(async () => {
      const isHealthy = await checkGatewayHealth();
      setIsGatewayConnected((prev) => {
        if (!prev && isHealthy) {
          refreshData();
        }
        return isHealthy;
      });
    }, 15000);

    const handleFocusOrOnline = () => {
      checkGatewayHealth().then((isHealthy) => {
        setIsGatewayConnected((prev) => {
          if (!prev && isHealthy) {
            refreshData();
          }
          return isHealthy;
        });
      });
    };

    window.addEventListener('focus', handleFocusOrOnline);
    window.addEventListener('online', handleFocusOrOnline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusOrOnline);
      window.removeEventListener('online', handleFocusOrOnline);
    };
  }, []);

  // Authentication state flag
  const isLoggedIn = useMemo(() => {
    return Boolean(currentLoginId && currentLoginId !== 'guest');
  }, [currentLoginId]);

  // Current Login helper (Separated from accounts)
  const currentLogin = useMemo(() => {
    if (!isLoggedIn) return GUEST_LOGIN;
    return availableLogins.find((l) => l.id === currentLoginId) || availableLogins[0] || GUEST_LOGIN;
  }, [availableLogins, currentLoginId, isLoggedIn]);

  // Accounts belonging to the current Login
  const userAccounts = useMemo(() => {
    if (!isLoggedIn) return [GUEST_ACCOUNT];
    const matched = accounts.filter((a) => a.userLoginId === currentLogin.id);
    return matched.length > 0 ? matched : accounts.filter((a) => a.id === currentUserId);
  }, [accounts, currentLogin.id, currentUserId, isLoggedIn]);

  // Current active user account persona helper
  const currentUser = useMemo(() => {
    if (!isLoggedIn) return GUEST_ACCOUNT;
    const user = accounts.find((acc) => acc.id === currentUserId);
    const activeAcc = user || (userAccounts.length > 0 ? userAccounts[0] : (accounts[0] || GUEST_ACCOUNT));
    return sanitizeAccount(activeAcc);
  }, [accounts, currentUserId, userAccounts, isLoggedIn]);

  // Admin access check: user is admin if their active account or any account has admin role
  const isAdmin = useMemo(() => {
    if (!isLoggedIn) return false;
    return currentUser?.role === 'admin' || userAccounts.some((acc) => acc.role === 'admin');
  }, [currentUser?.role, userAccounts, isLoggedIn]);

  // Service Executive access check: user is service executive if their active account or any account has service_executive role
  const isServiceExecutive = useMemo(() => {
    if (!isLoggedIn) return false;
    return (
      currentUser?.role === 'service_executive' ||
      (currentUser?.role as string) === 'serviceexecutive' ||
      userAccounts.some((acc) => acc.role === 'service_executive' || (acc.role as string) === 'serviceexecutive')
    );
  }, [currentUser?.role, userAccounts, isLoggedIn]);

  // Can manage users: Admin and Service Executive only
  const canManageUsers = useMemo(() => {
    return isAdmin || isServiceExecutive;
  }, [isAdmin, isServiceExecutive]);

  const isGuest = !isLoggedIn;

  // Check if a feature is enabled for current session (incorporating admin & guest status)
  const isFeatureEnabled = useMemo(() => {
    return (featureKey: keyof FeatureFlags) => isFeatureAccessible(featureKey, isAdmin, isGuest);
  }, [isAdmin, isGuest]);

  // Check if a feature is active in the application overall (ignoring guest restrictions)
  const isFeatureActive = useMemo(() => {
    return (featureKey: keyof FeatureFlags) => isFeatureActiveInApp(featureKey, isAdmin);
  }, [isAdmin]);

  // Check if a navigation tab is enabled for current session
  const isTabEnabled = useMemo(() => {
    return (tab: ActiveTab) => {
      if (tab === 'user-management') {
        return canManageUsers && isFeatureEnabled('userManagement');
      }
      return isTabAccessible(tab, isAdmin, isGuest);
    };
  }, [isAdmin, isGuest, canManageUsers, isFeatureEnabled]);

  // Auto-fallback: if the current active tab is disabled, switch to the first accessible tab
  useEffect(() => {
    if (!isTabEnabled(activeTab)) {
      setActiveTab(getFirstAccessibleTab(isAdmin, isGuest));
    }
  }, [activeTab, isTabEnabled, isAdmin, isGuest]);

  // Load and sync wishlist when current user / login state changes
  useEffect(() => {
    if (!isLoggedIn || !currentUserId || currentUserId === 'guest' || currentUserId === 'guest-buyer') {
      setWishlist([]);
      return;
    }

    const scopedKey = `chronos_wishlist_${currentUserId}`;
    const cached = localStorage.getItem(scopedKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        } else {
          setWishlist([]);
        }
      } catch {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }

    if (isGatewayConnected) {
      buyerWishlistApi.getWishlist(String(currentUserId))
        .then((items) => {
          if (Array.isArray(items)) {
            const ids = items.map((item) => String(item.listingId));
            setWishlist(ids);
            try {
              localStorage.setItem(scopedKey, JSON.stringify(ids));
            } catch (e) {
              console.warn('Could not cache wishlist in localStorage', e);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to load wishlist for user from microservice', err);
        });
    }
  }, [isLoggedIn, currentUserId, isGatewayConnected]);

  const switchUser = (userId: string) => {
    const target = accounts.find((a) => a.id === userId);
    if (target) {
      setCurrentUserId(userId);
      showToast('Switched Persona', `Active account: ${target.name} (${target.role.toUpperCase()})`, 'info');
    }
  };

  const switchLogin = async (loginId: string) => {
    if (!loginId || loginId === 'guest') {
      logoutUser();
      return;
    }
    const target = availableLogins.find((l) => l.id === loginId);
    if (!target) return;
    setCurrentLoginId(loginId);
    localStorage.setItem('chronos_current_login_id', loginId);

    if (isGatewayConnected) {
      try {
        const backendAccounts = await userManagementApi.getLoginAccounts(loginId);
        if (backendAccounts && backendAccounts.length > 0) {
          setAccounts((prev) => {
            const others = prev.filter((a) => a.userLoginId !== loginId);
            return [...others, ...backendAccounts];
          });
          const defaultAcc = backendAccounts.find((a) => a.isDefault) || backendAccounts[0];
          setCurrentUserId(defaultAcc.id);
          showToast('Login Switched', `Logged in as @${target.username} (${backendAccounts.length} persona accounts)`, 'info');
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch accounts for login:', err);
      }
    }

    const localAccounts = accounts.filter((a) => a.userLoginId === loginId);
    if (localAccounts.length > 0) {
      const defaultAcc = localAccounts.find((a) => a.isDefault) || localAccounts[0];
      setCurrentUserId(defaultAcc.id);
    }
    showToast('Login Switched', `Logged in as @${target.username}`, 'info');
  };

  const loginUser = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    if (isGatewayConnected) {
      try {
        // Calls the new /api/users/validate endpoint to verify credentials against database
        const res = await userManagementApi.validate(usernameOrEmail, password);
        if (res && res.login && Array.isArray(res.accounts) && res.accounts.length > 0) {
          const activeAccId = res.activeAccountId || res.accounts[0].id;

          // Set state for authenticated session
          setCurrentLoginId(res.login.id);
          setAvailableLogins([res.login]);
          setAccounts(res.accounts);
          setCurrentUserId(activeAccId);

          // ONLY on successful login checks, fill localStorage with userlogin and all its associated accounts
          localStorage.setItem('chronos_current_login_id', String(res.login.id));
          localStorage.setItem('chronos_current_user_id', String(activeAccId));
          localStorage.setItem('chronos_accounts', JSON.stringify(res.accounts));
          localStorage.setItem('chronos_available_logins', JSON.stringify([res.login]));

          // If there was a pending watch to add to wishlist before logging in, add it now
          if (pendingWishlistId) {
            const targetWatchId = pendingWishlistId;
            setPendingWishlistId(null);
            setWishlist((prev) => {
              if (!prev.includes(targetWatchId)) {
                const updated = [...prev, targetWatchId];
                try {
                  localStorage.setItem(`chronos_wishlist_${activeAccId}`, JSON.stringify(updated));
                } catch (e) {}
                buyerWishlistApi.addToWishlist({
                  listingId: targetWatchId,
                  buyerId: String(activeAccId)
                }).catch((e) => console.warn('Could not sync pending wishlist item to backend', e));
                return updated;
              }
              return prev;
            });
            showToast('Saved to Wishlist', 'The timepiece has been saved to your personal wishlist.', 'success');
          }

          setIsLoginModalOpen(false);
          showToast('Authentication Successful', `Welcome back, @${res.login.username}!`, 'success');
          return true;
        }
      } catch (err: any) {
        console.warn('Backend login validation failed:', err);
        const errMsg = err?.data?.message || err?.message || 'Invalid username or password.';
        showToast('Authentication Error', errMsg, 'error');
        // If login attempt fails, continue using guest login and accounts
        return false;
      }
    }

    // Offline / Local cache fallback check
    const matched = availableLogins.find(
      (l) => (l.username.toLowerCase() === usernameOrEmail.toLowerCase() || l.email.toLowerCase() === usernameOrEmail.toLowerCase()) && l.id !== 'guest'
    );
    if (matched) {
      await switchLogin(matched.id);
      if (pendingWishlistId) {
        const targetWatchId = pendingWishlistId;
        setPendingWishlistId(null);
        setWishlist((prev) => {
          const updated = prev.includes(targetWatchId) ? prev : [...prev, targetWatchId];
          try {
            localStorage.setItem(`chronos_wishlist_${matched.id}`, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        showToast('Saved to Wishlist', 'The timepiece has been saved to your personal wishlist.', 'success');
      }
      setIsLoginModalOpen(false);
      return true;
    }

    showToast('Authentication Error', 'Invalid username or password.', 'error');
    return false;
  };

  const logoutUser = () => {
    // Clear user session from localStorage
    localStorage.removeItem('chronos_current_login_id');
    localStorage.removeItem('chronos_current_user_id');
    localStorage.removeItem('chronos_accounts');
    localStorage.removeItem('chronos_available_logins');

    // Reset context state to guest
    setCurrentLoginId(GUEST_LOGIN.id);
    setAvailableLogins([GUEST_LOGIN]);
    setAccounts([GUEST_ACCOUNT]);
    setCurrentUserId(GUEST_ACCOUNT.id);
    setWishlist([]);

    showToast('Signed Out', 'You have been signed out. Returned to Guest mode.', 'info');
  };

  const registerUser = async (data: RegisterRequest): Promise<boolean> => {
    if (isGatewayConnected) {
      try {
        const res = await userManagementApi.register(data);
        if (res && res.login) {
          setAvailableLogins((prev) => {
            const exists = prev.some((l) => l.id === res.login.id);
            const updated = exists
              ? prev.map((l) => (l.id === res.login.id ? { ...res.login, accounts: res.accounts } : l))
              : [...prev, { ...res.login, accounts: res.accounts }];
            localStorage.setItem('chronos_available_logins', JSON.stringify(updated));
            return updated;
          });
          setCurrentLoginId(res.login.id);
          localStorage.setItem('chronos_current_login_id', String(res.login.id));

          setAccounts((prev) => {
            const others = prev.filter((a) => a.userLoginId !== res.login.id);
            const updated = [...others, ...res.accounts];
            localStorage.setItem('chronos_accounts', JSON.stringify(updated));
            return updated;
          });

          const activeAccId = res.activeAccountId || res.accounts[0]?.id;
          if (activeAccId) {
            setCurrentUserId(activeAccId);
            localStorage.setItem('chronos_current_user_id', String(activeAccId));
          }

          showToast('Registration Successful', `Welcome to The Heritage Club, @${res.login.username}! Active persona: ${data.role.toUpperCase()}`, 'success');
          return true;
        }
      } catch (err: any) {
        console.error('Backend registration error:', err);
        const errorMsg = err?.data?.message || err?.message || 'Registration failed. Please check your details.';
        showToast('Registration Error', errorMsg, 'error');
        throw err;
      }
    }

    // Offline / Local fallback logic
    const fallbackLoginId = 'login-' + Date.now().toString(36);
    const fallbackAccountId = 'account-' + Date.now().toString(36);
    const newLogin: UserLogin & { accounts?: UserAccount[] } = {
      id: fallbackLoginId,
      username: data.username.trim(),
      email: data.email.trim(),
      accounts: []
    };
    const newAccount: UserAccount = {
      id: fallbackAccountId,
      userLoginId: fallbackLoginId,
      name: data.accountName.trim(),
      email: data.email.trim(),
      role: data.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: data.location || 'Global',
      memberSince: new Date().getFullYear().toString(),
      verifiedDealer: data.role === 'seller',
      bio: data.bio || `${data.role.toUpperCase()} profile persona for ${data.accountName}`,
      rating: 0,
      reviewCount: 0,
      totalSalesCount: 0,
      responseRate: '100%',
      avgShipTime: data.role === 'seller' ? 'Within 24 hours' : 'N/A',
      isDefault: true
    };
    newLogin.accounts = [newAccount];

    setAvailableLogins((prev) => {
      const updated = [...prev, newLogin];
      localStorage.setItem('chronos_available_logins', JSON.stringify(updated));
      return updated;
    });
    setCurrentLoginId(fallbackLoginId);
    localStorage.setItem('chronos_current_login_id', fallbackLoginId);

    setAccounts((prev) => {
      const updated = [...prev, newAccount];
      localStorage.setItem('chronos_accounts', JSON.stringify(updated));
      return updated;
    });
    setCurrentUserId(fallbackAccountId);
    localStorage.setItem('chronos_current_user_id', fallbackAccountId);

    showToast('Account Created (Offline)', `Registered @${data.username} locally as ${data.role.toUpperCase()}`, 'success');
    return true;
  };

  const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!isLoggedIn) {
      return { success: false, message: 'You must be logged in to change your password.' };
    }

    if (isGatewayConnected) {
      try {
        const res = await userManagementApi.changePassword({
          usernameOrEmail: currentLogin.username,
          loginId: currentLogin.id,
          currentPassword,
          newPassword
        });
        showToast('Password Updated', res.message || 'Your password was changed successfully.', 'success');
        return res;
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || 'Failed to change password. Please verify your current password.';
        showToast('Change Password Failed', msg, 'error');
        return { success: false, message: msg };
      }
    }

    // Local / Offline demo mode fallback
    showToast('Password Updated', 'Your password was changed successfully (Offline Mode).', 'success');
    return { success: true, message: 'Password changed successfully.' };
  };

  const createUserAccount = async (role: UserRole, name: string, bio?: string): Promise<UserAccount> => {
    const newAccount: UserAccount = {
      id: 'account-' + Date.now().toString(36),
      userLoginId: currentLogin.id,
      name: name.trim(),
      email: currentLogin.email,
      role: role,
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: currentUser.location || 'Global',
      memberSince: new Date().getFullYear().toString(),
      verifiedDealer: role === 'seller',
      bio: bio || `${role.toUpperCase()} profile persona for ${name}`,
      rating: 0,
      reviewCount: 0,
      totalSalesCount: 0,
      responseRate: '100%',
      avgShipTime: role === 'seller' ? 'Within 24 hours' : 'N/A',
      isDefault: false
    };

    if (isGatewayConnected) {
      try {
        const created = await userManagementApi.createAccount({
          userLoginId: currentLogin.id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
          avatar: newAccount.avatar,
          location: newAccount.location,
          bio: newAccount.bio,
          isDefault: false
        });
        if (created && created.id) {
          const sanitizedCreated = sanitizeAccount(created);
          setAccounts((prev) => [...prev, sanitizedCreated]);
          setCurrentUserId(sanitizedCreated.id);
          showToast('New Persona Created', `Switched to ${sanitizedCreated.name} (${sanitizedCreated.role.toUpperCase()})`, 'success');
          return sanitizedCreated;
        }
      } catch (err) {
        console.warn('Backend create account failed:', err);
      }
    }

    setAccounts((prev) => [...prev, newAccount]);
    setCurrentUserId(newAccount.id);
    showToast('New Persona Created', `Switched to ${newAccount.name} (${newAccount.role.toUpperCase()})`, 'success');
    return newAccount;
  };

  const setUserRole = (newRole: UserRole) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === currentUser.id ? { ...acc, role: newRole } : acc))
    );
    showToast('Role Mode Updated', `Switched to ${newRole.toUpperCase()} mode`, 'info');
  };

  const updateUserProfile = (updates: Partial<UserAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === currentUser.id ? { ...acc, ...updates } : acc))
    );
    showToast('Profile Updated', 'Your profile details have been saved', 'success');

    if (isGatewayConnected) {
      sellerHubApi.updateProfile(currentUser.id, updates).catch((err) => {
        console.warn('Failed to update profile on SellerHub microservice', err);
      });
      userManagementApi.updateAccount(currentUser.id, updates).catch((err) => {
        console.warn('Failed to update profile on UserManagement microservice', err);
      });
    }
  };

  // Listings Management
  const createListing = (
    listingData: Omit<
      WatchListing,
      | 'id'
      | 'createdAt'
      | 'viewsCount'
      | 'wishlistCount'
      | 'sellerId'
      | 'sellerName'
      | 'sellerRating'
      | 'sellerReviewCount'
      | 'sellerVerified'
      | 'sellerLocation'
    >
  ): WatchListing => {
    const newListing: WatchListing = {
      ...listingData,
      id: 'watch-' + Date.now(),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerRating: currentUser.rating,
      sellerReviewCount: currentUser.reviewCount,
      sellerVerified: currentUser.verifiedDealer,
      sellerLocation: currentUser.location,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      wishlistCount: 0
    };

    setListings((prev) => [newListing, ...prev]);
    showToast('Listing Published', `${newListing.brand} ${newListing.model} is now live on the marketplace!`, 'success');

    if (isGatewayConnected) {
      marketplaceApi.createListing(newListing).catch((err) => {
        console.warn('Failed to persist listing to Marketplace microservice', err);
      });
    }

    return newListing;
  };

  const updateListing = (id: string, updates: Partial<WatchListing>) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast('Listing Updated', 'Watch details have been saved', 'success');

    if (isGatewayConnected) {
      marketplaceApi.updateListing(id, updates).catch((err) => {
        console.warn('Failed to update listing on Marketplace microservice', err);
      });
    }
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    // If linked to a collection watch, unlink
    setCollection((prev) =>
      prev.map((cw) => (cw.listingId === id ? { ...cw, isListedForSale: false, listingId: undefined } : cw))
    );
    showToast('Listing Removed', 'The timepiece listing was removed from marketplace', 'info');

    if (isGatewayConnected) {
      marketplaceApi.deleteListing(id).catch((err) => {
        console.warn('Failed to delete listing on Marketplace microservice', err);
      });
    }
  };

  const toggleListingStatus = (id: string, newStatus: WatchListing['status']) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    showToast('Status Changed', `Listing status updated to ${newStatus}`, 'info');

    if (isGatewayConnected) {
      marketplaceApi.updateStatus(id, newStatus).catch((err) => {
        console.warn('Failed to update status on Marketplace microservice', err);
      });
    }
  };

  // Convert Collection watch into active Marketplace Listing
  const listFromCollection = (collectionWatchId: string, price: number, description?: string) => {
    const watch = collection.find((w) => w.id === collectionWatchId);
    if (!watch) return;

    const newListingId = 'watch-' + Date.now();
    const newListing: WatchListing = {
      id: newListingId,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerRating: currentUser.rating,
      sellerReviewCount: currentUser.reviewCount,
      sellerVerified: currentUser.verifiedDealer,
      sellerLocation: currentUser.location,
      brand: watch.brand,
      model: watch.model,
      referenceNumber: watch.referenceNumber,
      year: watch.year,
      price: price,
      originalPrice: watch.estimatedMarketValue,
      currency: 'INR',
      condition: watch.condition,
      movement: watch.movement,
      caseMaterial: watch.caseMaterial,
      caseDiameter: watch.caseDiameter,
      dialColor: watch.dialColor,
      braceletMaterial: 'Original Factory Bracelet/Strap',
      hasOriginalBox: true,
      hasOriginalPapers: true,
      images: watch.images.length > 0 ? watch.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'],
      description: description || watch.notes || `Collector-owned ${watch.brand} ${watch.model} (${watch.referenceNumber}) from private vault.`,
      authenticityVerified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      wishlistCount: 0,
      fromPersonalCollectionId: collectionWatchId
    };

    setListings((prev) => [newListing, ...prev]);

    // Update collection record to show it is listed
    setCollection((prev) =>
      prev.map((cw) => (cw.id === collectionWatchId ? { ...cw, isListedForSale: true, listingId: newListing.id } : cw))
    );

    showToast('Published to Marketplace', `${watch.brand} ${watch.model} is now listed for ₹${price.toLocaleString()}!`, 'success');

    if (isGatewayConnected) {
      // Inter-service orchestration: CollectorVault microservice creates listing via MarketplaceClient
      collectorVaultApi.listForSale(collectionWatchId, {
        price,
        description,
        sellerId: currentUser.id,
        sellerName: currentUser.name
      }).then((res) => {
        if (res.listingId) {
          setListings((prev) =>
            prev.map((l) => (l.id === newListingId ? { ...l, id: res.listingId } : l))
          );
          setCollection((prev) =>
            prev.map((cw) => (cw.id === collectionWatchId ? { ...cw, listingId: res.listingId } : cw))
          );
        }
      }).catch((err) => {
        console.warn('Failed to orchestrate listing from vault via microservice', err);
      });
    }
  };

  const unlinkCollectionListing = (collectionWatchId: string) => {
    const watch = collection.find((w) => w.id === collectionWatchId);
    if (watch?.listingId) {
      deleteListing(watch.listingId);
    }
    if (isGatewayConnected) {
      collectorVaultApi.unlinkListing(collectionWatchId).catch((err) => {
        console.warn('Failed to unlink vault listing in microservice', err);
      });
    }
  };

  // Personal Collection Management
  const addToCollection = (
    watchData: Omit<CollectionWatch, 'id' | 'userId' | 'createdAt' | 'isListedForSale'>
  ): CollectionWatch => {
    const newWatch: CollectionWatch = {
      ...watchData,
      id: 'col-' + Date.now(),
      userId: currentUser.id,
      isListedForSale: false,
      createdAt: new Date().toISOString()
    };
    setCollection((prev) => [newWatch, ...prev]);
    showToast('Added to Vault', `${newWatch.brand} ${newWatch.model} added to your personal watch box`, 'success');

    if (isGatewayConnected) {
      collectorVaultApi.addWatch(newWatch).catch((err) => {
        console.warn('Failed to persist watch to CollectorVault microservice', err);
      });
    }

    return newWatch;
  };

  const updateCollectionWatch = (id: string, updates: Partial<CollectionWatch>) => {
    setCollection((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast('Watch Box Updated', 'Piece details saved in vault', 'success');

    if (isGatewayConnected) {
      collectorVaultApi.updateWatch(id, updates).catch((err) => {
        console.warn('Failed to update watch in CollectorVault microservice', err);
      });
    }
  };

  const deleteFromCollection = (id: string) => {
    setCollection((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed from Vault', 'Piece removed from personal collection', 'info');

    if (isGatewayConnected) {
      collectorVaultApi.deleteWatch(id).catch((err) => {
        console.warn('Failed to delete watch from CollectorVault microservice', err);
      });
    }
  };

  // Wishlist
  const toggleWishlist = (watchId: string) => {
    if (!isLoggedIn) {
      promptLogin('Please log in to add timepieces to your wishlist.', watchId);
      return;
    }

    const isCurrentlyWishlisted = wishlist.includes(watchId);
    const watch = listings.find((l) => l.id === watchId);

    setWishlist((prev) => {
      if (isCurrentlyWishlisted) {
        showToast('Wishlist Updated', 'Watch removed from your wishlist', 'info');
        return prev.filter((id) => id !== watchId);
      } else {
        showToast('Saved to Wishlist', 'Watch added to your curated wishlist', 'success');
        return [...prev, watchId];
      }
    });

    // Update wishlist counter on listing
    setListings((prev) =>
      prev.map((listing) => {
        if (listing.id === watchId) {
          const isCurrentlyWishlisted = wishlist.includes(watchId);
          return {
            ...listing,
            wishlistCount: Math.max(0, listing.wishlistCount + (isCurrentlyWishlisted ? -1 : 1))
          };
        }
        return listing;
      })
    );

    if (isGatewayConnected) {
      if (isCurrentlyWishlisted) {
        buyerWishlistApi.removeFromWishlist(watchId, currentUser.id).catch((err) => {
          console.warn('Failed to remove from BuyerWishlist microservice', err);
        });
      } else {
        buyerWishlistApi.addToWishlist({
          buyerId: currentUser.id,
          listingId: watchId,
          watchBrand: watch?.brand,
          watchModel: watch?.model,
          priceWhenAdded: watch?.price
        }).catch((err) => {
          console.warn('Failed to add to BuyerWishlist microservice', err);
        });
      }
    }
  };

  const isInWishlist = (watchId: string) => wishlist.includes(watchId);

  const clearWishlist = () => {
    setWishlist([]);
    if (currentUser?.id && currentUser.id !== 'guest-buyer') {
      try {
        localStorage.removeItem(`chronos_wishlist_${currentUser.id}`);
      } catch (e) {
        console.warn('Could not clear cached wishlist', e);
      }
    }
    showToast('Wishlist Cleared', 'All saved items have been cleared', 'info');

    if (isGatewayConnected && currentUser?.id && currentUser.id !== 'guest-buyer') {
      buyerWishlistApi.clearWishlist(String(currentUser.id)).catch((err) => {
        console.warn('Failed to clear BuyerWishlist microservice', err);
      });
    }
  };

  // Seller Reviews & Ratings Engine
  const addSellerReview = (
    reviewData: Omit<SellerReview, 'id' | 'date' | 'buyerId' | 'buyerName' | 'buyerAvatar'>,
    orderId?: string
  ) => {
    const newReview: SellerReview = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerAvatar: currentUser.avatar,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate seller rating and update seller account
    const sellerReviews = [...reviews.filter((r) => r.sellerId === reviewData.sellerId), newReview];
    const totalRatingSum = sellerReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRatingSum / sellerReviews.length).toFixed(2));

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === reviewData.sellerId) {
          return {
            ...acc,
            rating: avgRating,
            reviewCount: sellerReviews.length
          };
        }
        return acc;
      })
    );

    // Update seller rating across all active listings by that seller
    setListings((prev) =>
      prev.map((listing) => {
        if (listing.sellerId === reviewData.sellerId) {
          return {
            ...listing,
            sellerRating: avgRating,
            sellerReviewCount: sellerReviews.length
          };
        }
        return listing;
      })
    );

    if (orderId) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, hasReviewed: true } : ord))
      );
    }

    showToast('Feedback Published', 'Thank you! Your verified rating & review have been submitted.', 'success');

    if (isGatewayConnected) {
      sellerHubApi.addReview(newReview).catch((err) => {
        console.warn('Failed to submit review to SellerHub microservice', err);
      });
    }
  };

  const replyToSellerReview = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, sellerReply: reply } : r))
    );
    showToast('Reply Posted', 'Your response to the buyer review is published', 'success');

    if (isGatewayConnected) {
      sellerHubApi.replyToReview(reviewId, reply).catch((err) => {
        console.warn('Failed to reply to review on SellerHub microservice', err);
      });
    }
  };

  const getSellerReviews = (sellerId: string) => {
    return reviews.filter((r) => r.sellerId === sellerId);
  };

  const getSellerById = (sellerId: string) => {
    return accounts.find((a) => a.id === sellerId);
  };

  // Orders
  const createOrder = (listingId: string, shippingAddress: string, paymentMethod: string): OrderTransaction => {
    const watch = listings.find((l) => l.id === listingId);
    if (!watch) throw new Error('Listing not found');

    const shippingFee = 150;
    const newOrder: OrderTransaction = {
      id: 'ord-' + Math.floor(100000 + Math.random() * 900000),
      listingId: watch.id,
      watchModel: watch.model,
      watchBrand: watch.brand,
      watchReference: watch.referenceNumber,
      watchImage: watch.images[0],
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: watch.sellerId,
      sellerName: watch.sellerName,
      price: watch.price,
      shippingFee,
      totalAmount: watch.price + shippingFee,
      status: 'authenticated',
      createdAt: new Date().toISOString(),
      trackingNumber: 'CHRONO-ESCROW-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      hasReviewed: false
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Mark listing as reserved/sold
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: 'sold' } : l))
    );

    // Increase seller sales count
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === watch.sellerId ? { ...acc, totalSalesCount: acc.totalSalesCount + 1 } : acc
      )
    );

    // Automatically add watch to buyer's collection!
    addToCollection({
      brand: watch.brand,
      model: watch.model,
      referenceNumber: watch.referenceNumber,
      year: watch.year,
      caseDiameter: watch.caseDiameter,
      caseMaterial: watch.caseMaterial,
      movement: watch.movement,
      dialColor: watch.dialColor,
      condition: watch.condition,
      purchasePrice: watch.price,
      purchaseDate: new Date().toISOString().split('T')[0],
      estimatedMarketValue: watch.price,
      images: watch.images,
      notes: `Purchased from ${watch.sellerName} via Chronos Escrow.`
    });

    if (isGatewayConnected) {
      // CustomerOrders microservice handles order creation and inter-service calls to Marketplace & SellerHub
      customerOrdersApi.createOrder({
        listingId: watch.id,
        watchModel: watch.model,
        watchBrand: watch.brand,
        watchReference: watch.referenceNumber,
        watchImage: watch.images[0] || '',
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: watch.sellerId,
        sellerName: watch.sellerName,
        price: watch.price,
        shippingFee,
        shippingAddress,
        paymentMethod
      }).catch((err) => {
        console.warn('Failed to record order on CustomerOrders microservice', err);
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderTransaction['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    showToast('Order Updated', `Order status set to ${status}`, 'info');

    if (isGatewayConnected) {
      customerOrdersApi.updateOrderStatus(orderId, status).catch((err) => {
        console.warn('Failed to update order status on CustomerOrders microservice', err);
      });
    }
  };

  // Offers
  const createOffer = (listingId: string, offerAmount: number, message: string): WatchOffer => {
    const watch = listings.find((l) => l.id === listingId);
    if (!watch) throw new Error('Listing not found');

    const newOffer: WatchOffer = {
      id: 'off-' + Date.now(),
      listingId: watch.id,
      watchModel: watch.model,
      watchBrand: watch.brand,
      watchImage: watch.images[0],
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: watch.sellerId,
      offerAmount,
      originalListingPrice: watch.price,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOffers((prev) => [newOffer, ...prev]);
    showToast('Offer Submitted', `Your offer of ₹${offerAmount.toLocaleString()} has been sent to ${watch.sellerName}!`, 'success');

    if (isGatewayConnected) {
      customerOrdersApi.createOffer({
        listingId: watch.id,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: watch.sellerId,
        watchModel: watch.model,
        watchBrand: watch.brand,
        watchImage: watch.images[0] || '',
        offerAmount,
        originalListingPrice: watch.price,
        message
      }).catch((err) => {
        console.warn('Failed to send offer to CustomerOrders microservice', err);
      });
    }

    return newOffer;
  };

  const respondToOffer = (offerId: string, action: 'accepted' | 'declined' | 'countered', counterAmount?: number) => {
    setOffers((prev) =>
      prev.map((off) => {
        if (off.id === offerId) {
          return {
            ...off,
            status: action,
            counterAmount: action === 'countered' ? counterAmount : off.counterAmount
          };
        }
        return off;
      })
    );
    showToast('Offer Status Updated', `Offer ${action} successfully`, 'info');

    if (isGatewayConnected) {
      customerOrdersApi.respondToOffer(offerId, action, counterAmount).catch((err) => {
        console.warn('Failed to respond to offer on CustomerOrders microservice', err);
      });
    }
  };

  // Service Center (Watch Repair Service Workflow Engine)
  const createServiceRequest = async (
    data: Omit<ServiceRequest, 'id' | 'currentState' | 'createdAt' | 'updatedAt' | 'auditLogs'>
  ): Promise<ServiceRequest> => {
    const newRequest: ServiceRequest = {
      ...data,
      id: Date.now(),
      currentState: 'ServiceRequestCreated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditLogs: [
        {
          id: Date.now(),
          serviceRequestId: Date.now(),
          fromState: 'ServiceRequestCreated',
          toState: 'ServiceRequestCreated',
          action: 'Service Request Created',
          triggeredByUserId: String(currentUser.id),
          triggeredByName: currentUser.name,
          triggeredByRole: currentUser.role,
          notes: 'Initial watch repair service request submitted.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    setServiceRequests((prev) => [newRequest, ...prev]);
    showToast('Service Request Created', `Diagnostic request for ${data.watchBrand} ${data.watchModel} initiated.`, 'success');

    if (isGatewayConnected) {
      try {
        const res = await serviceCenterApi.createServiceRequest({
          userId: String(currentUser.id),
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          customerPhone: data.customerPhone || currentUser.phone,
          watchBrand: data.watchBrand,
          watchModel: data.watchModel,
          movementType: data.movementType,
          isWorking: data.isWorking,
          glassChangeRequired: data.glassChangeRequired,
          issueDescription: data.issueDescription
        });
        if (res && res.id) {
          setServiceRequests((prev) => prev.map((r) => (r.id === newRequest.id ? res : r)));
          return res;
        }
      } catch (err) {
        console.warn('Failed to persist service request to ServiceCenter microservice', err);
      }
    }

    return newRequest;
  };

  const transitionServiceRequest = async (
    id: string | number,
    payload: TransitionRequestPayload
  ): Promise<boolean> => {
    const targetState = payload.targetState as ServiceWorkflowState;
    const nowIso = new Date().toISOString();

    setServiceRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const audit: ServiceRequestAuditLog = {
            id: Date.now(),
            serviceRequestId: r.id,
            fromState: r.currentState,
            toState: targetState,
            action: payload.action,
            triggeredByUserId: payload.userId,
            triggeredByName: payload.userName,
            triggeredByRole: payload.userRole,
            notes: payload.notes || payload.rejectionReason,
            timestamp: nowIso
          };

          return {
            ...r,
            currentState: targetState,
            estimatedPrice: payload.estimatedPrice ?? r.estimatedPrice,
            rejectionReason: payload.rejectionReason ?? r.rejectionReason,
            courierCompany: payload.courierCompany ?? r.courierCompany,
            trackingNumber: payload.trackingNumber ?? r.trackingNumber,
            returnCourierCompany: payload.returnCourierCompany ?? r.returnCourierCompany,
            returnTrackingNumber: payload.returnTrackingNumber ?? r.returnTrackingNumber,
            serviceNotes: payload.notes
              ? (r.serviceNotes ? `${r.serviceNotes}\n[${new Date().toLocaleDateString()}] ${payload.notes}` : payload.notes)
              : r.serviceNotes,
            updatedAt: nowIso,
            auditLogs: [audit, ...(r.auditLogs || [])]
          };
        }
        return r;
      })
    );

    showToast('Workflow Updated', `Watch transitioned to '${targetState}'.`, 'success');

    if (isGatewayConnected) {
      try {
        const res = await serviceCenterApi.transitionServiceRequest(id, payload);
        if (res && res.id) {
          setServiceRequests((prev) => prev.map((r) => (r.id === id ? res : r)));
          return true;
        }
      } catch (err: any) {
        console.warn('Failed to transition service request in ServiceCenter microservice', err);
        const errMsg = err?.data?.message || err?.message || 'Workflow transition failed.';
        showToast('Transition Warning', errMsg, 'warning');
        return false;
      }
    }

    return true;
  };

  // Compare
  const toggleCompare = (watchId: string) => {
    setCompareList((prev) => {
      if (prev.includes(watchId)) {
        return prev.filter((id) => id !== watchId);
      }
      if (prev.length >= 4) {
        showToast('Comparison Limit', 'You can compare up to 4 timepieces simultaneously', 'warning');
        return prev;
      }
      return [...prev, watchId];
    });
  };

  const clearCompare = () => setCompareList([]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Filtered Listings computation
  const filteredListings = useMemo(() => {
    return listings
      .filter((watch) => {
        if (watch.status !== 'active') return false;

        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchBrand = watch.brand.toLowerCase().includes(q);
          const matchModel = watch.model.toLowerCase().includes(q);
          const matchRef = watch.referenceNumber.toLowerCase().includes(q);
          const matchDial = watch.dialColor.toLowerCase().includes(q);
          const matchSeller = watch.sellerName.toLowerCase().includes(q);
          if (!matchBrand && !matchModel && !matchRef && !matchDial && !matchSeller) {
            return false;
          }
        }

        // Brands
        if (filters.brand.length > 0 && !filters.brand.includes(watch.brand)) {
          return false;
        }

        // Movement
        if (filters.movement.length > 0 && !filters.movement.includes(watch.movement)) {
          return false;
        }

        // Condition
        if (filters.condition.length > 0 && !filters.condition.includes(watch.condition)) {
          return false;
        }

        // Price range
        if (watch.price < filters.minPrice || watch.price > filters.maxPrice) {
          return false;
        }

        // Box and Papers
        if (filters.hasBox && !watch.hasOriginalBox) return false;
        if (filters.hasPapers && !watch.hasOriginalPapers) return false;

        // Seller rating
        if (filters.minSellerRating > 0 && watch.sellerRating < filters.minSellerRating) {
          return false;
        }

        // Case diameter
        if (
          watch.caseDiameter < filters.caseDiameterRange[0] ||
          watch.caseDiameter > filters.caseDiameterRange[1]
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating-desc') return b.sellerRating - a.sellerRating;
        if (filters.sortBy === 'popular') return b.wishlistCount - a.wishlistCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, filters]);

  return (
    <MarketplaceContext.Provider
      value={{
        isGatewayConnected,
        isSyncing,
        refreshData,
        isLoggedIn,
        currentLogin,
        availableLogins,
        loginUser,
        logoutUser,
        registerUser,
        changeUserPassword,
        switchLogin,
        currentUser,
        userAccounts,
        accounts,
        isAdmin,
        isGuest,
        isFeatureEnabled,
        isFeatureActive,
        isTabEnabled,
        isLoginModalOpen,
        setIsLoginModalOpen,
        promptLogin,
        switchUser,
        setUserRole,
        updateUserProfile,
        createUserAccount,
        activeTab,
        setActiveTab,
        listings,
        filteredListings,
        createListing,
        updateListing,
        deleteListing,
        toggleListingStatus,
        listFromCollection,
        collection,
        addToCollection,
        updateCollectionWatch,
        deleteFromCollection,
        unlinkCollectionListing,
        wishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        reviews,
        addSellerReview,
        replyToSellerReview,
        getSellerReviews,
        getSellerById,
        orders,
        createOrder,
        updateOrderStatus,
        offers,
        createOffer,
        respondToOffer,
        serviceRequests,
        createServiceRequest,
        transitionServiceRequest,
        filters,
        setFilters,
        resetFilters,
        compareList,
        toggleCompare,
        clearCompare,
        selectedWatch,
        setSelectedWatch,
        selectedSeller,
        setSelectedSeller,
        isAddListingOpen,
        setIsAddListingOpen,
        editingListing,
        setEditingListing,
        isAddCollectionOpen,
        setIsAddCollectionOpen,
        editingCollectionWatch,
        setEditingCollectionWatch,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutWatch,
        setCheckoutWatch,
        isOfferOpen,
        setIsOfferOpen,
        offerWatch,
        setOfferWatch,
        isReviewOpen,
        setIsReviewOpen,
        reviewTarget,
        setReviewTarget,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
