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
  UserRole
} from '../types';
import {
  marketplaceApi,
  collectorVaultApi,
  buyerWishlistApi,
  sellerHubApi,
  customerOrdersApi,
  userManagementApi,
  checkGatewayHealth,
  RegisterRequest
} from '../services/api';

const EMPTY_USER: UserAccount = {
  id: '',
  name: 'Loading user...',
  email: '',
  role: 'buyer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  location: '',
  memberSince: '',
  verifiedDealer: false,
  bio: '',
  rating: 5.0,
  reviewCount: 0,
  totalSalesCount: 0,
  responseRate: '100%',
  avgShipTime: 'N/A'
};

const EMPTY_LOGIN: UserLogin = {
  id: '',
  username: 'guest',
  email: '',
  accounts: []
};

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
  refreshData: () => Promise<void>;

  // User & Accounts
  // Authentication & Login (Separated from accounts)
  currentLogin: UserLogin;
  availableLogins: Array<UserLogin & { accounts?: UserAccount[] }>;
  loginUser: (usernameOrEmail: string, password: string) => Promise<boolean>;
  registerUser: (data: RegisterRequest) => Promise<boolean>;
  switchLogin: (loginId: string) => Promise<void>;

  // User & Accounts (1 Login -> N Accounts, 1 role per Account)
  currentUser: UserAccount;
  userAccounts: UserAccount[];
  accounts: UserAccount[];
  switchUser: (userId: string) => void;
  setUserRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserAccount>) => void;
  createUserAccount: (role: UserRole, name: string, bio?: string) => Promise<UserAccount>;
  
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

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial local states with localStorage fallback (empty arrays if no cache)
  const [availableLogins, setAvailableLogins] = useState<Array<UserLogin & { accounts?: UserAccount[] }>>(() => {
    const saved = localStorage.getItem('chronos_available_logins');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentLoginId, setCurrentLoginId] = useState<string>(() => {
    return localStorage.getItem('chronos_current_login_id') || '';
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('chronos_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('chronos_current_user_id') || '';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');

  const [listings, setListings] = useState<WatchListing[]>(() => {
    const saved = localStorage.getItem('chronos_listings');
    return saved ? JSON.parse(saved) : [];
  });

  const [collection, setCollection] = useState<CollectionWatch[]>(() => {
    const saved = localStorage.getItem('chronos_collection');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('chronos_wishlist');
    return saved ? JSON.parse(saved) : [];
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

  const [compareList, setCompareList] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

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

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('chronos_available_logins', JSON.stringify(availableLogins));
  }, [availableLogins]);

  useEffect(() => {
    localStorage.setItem('chronos_current_login_id', currentLoginId);
  }, [currentLoginId]);

  useEffect(() => {
    localStorage.setItem('chronos_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('chronos_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('chronos_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('chronos_collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('chronos_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('chronos_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('chronos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('chronos_offers', JSON.stringify(offers));
  }, [offers]);

  // Backend & API Gateway Connectivity
  const [isGatewayConnected, setIsGatewayConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshData = async () => {
    setIsSyncing(true);
    try {
      const isHealthy = await checkGatewayHealth();
      setIsGatewayConnected(isHealthy);
      if (!isHealthy) {
        setIsSyncing(false);
        return;
      }

      // Query microservices in parallel via YARP Gateway (:5000)
      const [
        listingsRes,
        collectionRes,
        wishlistRes,
        profilesRes,
        reviewsRes,
        ordersRes,
        offersRes,
        loginsRes,
        userAccountsRes
      ] = await Promise.allSettled([
        marketplaceApi.getListings(),
        collectorVaultApi.getWatches(),
        buyerWishlistApi.getWishlist(),
        sellerHubApi.getProfiles(),
        sellerHubApi.getReviews(),
        customerOrdersApi.getOrders(),
        customerOrdersApi.getBuyerOffers(),
        userManagementApi.getLogins(),
        userManagementApi.getAccounts()
      ]);

      if (listingsRes.status === 'fulfilled' && Array.isArray(listingsRes.value)) {
        setListings(listingsRes.value);
        localStorage.setItem('chronos_listings', JSON.stringify(listingsRes.value));
      }
      if (collectionRes.status === 'fulfilled' && Array.isArray(collectionRes.value)) {
        setCollection(collectionRes.value);
        localStorage.setItem('chronos_collection', JSON.stringify(collectionRes.value));
      }
      if (wishlistRes.status === 'fulfilled' && Array.isArray(wishlistRes.value)) {
        const ids = wishlistRes.value.map((item) => item.listingId);
        setWishlist(ids);
        localStorage.setItem('chronos_wishlist', JSON.stringify(ids));
      }
      if (loginsRes.status === 'fulfilled' && Array.isArray(loginsRes.value)) {
        setAvailableLogins(loginsRes.value);
        localStorage.setItem('chronos_available_logins', JSON.stringify(loginsRes.value));
        if (loginsRes.value.length > 0) {
          setCurrentLoginId((prev) => {
            const exists = loginsRes.value.some((l) => l.id === prev);
            const selected = exists ? prev : loginsRes.value[0].id;
            localStorage.setItem('chronos_current_login_id', selected);
            return selected;
          });
        }
      }
      if (userAccountsRes.status === 'fulfilled' && Array.isArray(userAccountsRes.value)) {
        setAccounts(userAccountsRes.value);
        localStorage.setItem('chronos_accounts', JSON.stringify(userAccountsRes.value));
        if (userAccountsRes.value.length > 0) {
          setCurrentUserId((prev) => {
            const exists = userAccountsRes.value.some((a) => a.id === prev);
            if (exists) return prev;
            const defaultAccount = userAccountsRes.value.find((a) => a.isDefault) || userAccountsRes.value[0];
            localStorage.setItem('chronos_current_user_id', defaultAccount.id);
            return defaultAccount.id;
          });
        }
      } else if (profilesRes.status === 'fulfilled' && Array.isArray(profilesRes.value)) {
        setAccounts(profilesRes.value);
        localStorage.setItem('chronos_accounts', JSON.stringify(profilesRes.value));
      }
      if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
        setReviews(reviewsRes.value);
        localStorage.setItem('chronos_reviews', JSON.stringify(reviewsRes.value));
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setOrders(ordersRes.value);
        localStorage.setItem('chronos_orders', JSON.stringify(ordersRes.value));
      }
      if (offersRes.status === 'fulfilled' && Array.isArray(offersRes.value)) {
        setOffers(offersRes.value);
        localStorage.setItem('chronos_offers', JSON.stringify(offersRes.value));
      }
    } catch (err) {
      console.warn('Backend microservices sync error:', err);
      setIsGatewayConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Current Login helper (Separated from accounts)
  const currentLogin = useMemo(() => {
    return availableLogins.find((l) => l.id === currentLoginId) || availableLogins[0] || EMPTY_LOGIN;
  }, [availableLogins, currentLoginId]);

  // Accounts belonging to the current Login
  const userAccounts = useMemo(() => {
    const matched = accounts.filter((a) => a.userLoginId === currentLogin.id);
    return matched.length > 0 ? matched : accounts.filter((a) => a.id === currentUserId);
  }, [accounts, currentLogin.id, currentUserId]);

  // Current active user account persona helper
  const currentUser = useMemo(() => {
    const user = accounts.find((acc) => acc.id === currentUserId);
    if (user) return user;
    if (userAccounts.length > 0) return userAccounts[0];
    return accounts[0] || EMPTY_USER;
  }, [accounts, currentUserId, userAccounts]);

  const switchUser = (userId: string) => {
    const target = accounts.find((a) => a.id === userId);
    if (target) {
      setCurrentUserId(userId);
      showToast('Switched Persona', `Active account: ${target.name} (${target.role.toUpperCase()})`, 'info');
    }
  };

  const switchLogin = async (loginId: string) => {
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
        const res = await userManagementApi.login(usernameOrEmail, password);
        if (res && res.login) {
          setCurrentLoginId(res.login.id);
          localStorage.setItem('chronos_current_login_id', res.login.id);
          setAccounts((prev) => {
            const others = prev.filter((a) => a.userLoginId !== res.login.id);
            return [...others, ...res.accounts];
          });
          setCurrentUserId(res.activeAccountId || res.accounts[0]?.id || currentUserId);
          showToast('Authentication Successful', `Welcome back, @${res.login.username}!`, 'success');
          return true;
        }
      } catch (err) {
        console.warn('Backend login failed:', err);
      }
    }

    // Local / Offline fallback check
    const matched = availableLogins.find(
      (l) => l.username.toLowerCase() === usernameOrEmail.toLowerCase() || l.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );
    if (matched) {
      await switchLogin(matched.id);
      return true;
    }

    showToast('Authentication Error', 'Invalid credentials or user not found', 'error');
    return false;
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
          localStorage.setItem('chronos_current_login_id', res.login.id);

          setAccounts((prev) => {
            const others = prev.filter((a) => a.userLoginId !== res.login.id);
            const updated = [...others, ...res.accounts];
            localStorage.setItem('chronos_accounts', JSON.stringify(updated));
            return updated;
          });

          const activeAccId = res.activeAccountId || res.accounts[0]?.id;
          if (activeAccId) {
            setCurrentUserId(activeAccId);
            localStorage.setItem('chronos_current_user_id', activeAccId);
          }

          showToast('Registration Successful', `Welcome to Meridian, @${res.login.username}! Active persona: ${data.role.toUpperCase()}`, 'success');
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
      rating: 5.0,
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
      rating: 5.0,
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
          setAccounts((prev) => [...prev, created]);
          setCurrentUserId(created.id);
          showToast('New Persona Created', `Switched to ${created.name} (${created.role.toUpperCase()})`, 'success');
          return created;
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
      currency: 'USD',
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

    showToast('Published to Marketplace', `${watch.brand} ${watch.model} is now listed for $${price.toLocaleString()}!`, 'success');

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
    showToast('Wishlist Cleared', 'All saved items have been cleared', 'info');

    if (isGatewayConnected) {
      buyerWishlistApi.clearWishlist(currentUser.id).catch((err) => {
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
    showToast('Offer Submitted', `Your offer of $${offerAmount.toLocaleString()} has been sent to ${watch.sellerName}!`, 'success');

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
        currentLogin,
        availableLogins,
        loginUser,
        registerUser,
        switchLogin,
        currentUser,
        userAccounts,
        accounts,
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
