export type UserRole = 'buyer' | 'seller' | 'collector';

export type WatchCondition = 'Unworn' | 'Mint' | 'Very Good' | 'Good' | 'Fair';

export type WatchMovement = 'Automatic' | 'Manual Winding' | 'Quartz' | 'Tourbillon' | 'Spring Drive' | 'Co-Axial Chronometer';

export type WatchCaseMaterial = 
  | 'Stainless Steel' 
  | 'Oystersteel' 
  | '18k Yellow Gold' 
  | '18k Rose/Pink Gold' 
  | '18k White Gold' 
  | 'Platinum' 
  | 'Titanium' 
  | 'Ceramic' 
  | 'Bronze' 
  | 'Two-Tone (Steel & Gold)';

export interface SellerReview {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  rating: number; // 1-5
  subRatings?: {
    accuracy: number;
    communication: number;
    shipping: number;
    authenticity: number;
  };
  comment: string;
  watchModel: string;
  watchReference?: string;
  date: string;
  verifiedPurchase: boolean;
  sellerReply?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  location: string;
  memberSince: string;
  verifiedDealer: boolean;
  bio: string;
  rating: number; // Average rating (e.g. 4.9)
  reviewCount: number;
  totalSalesCount: number;
  responseRate: string; // e.g. "99%"
  avgShipTime: string; // e.g. "Within 24 hours"
  phone?: string;
}

export interface WatchListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerReviewCount: number;
  sellerVerified: boolean;
  sellerLocation: string;
  
  // Watch Details
  brand: string;
  model: string;
  referenceNumber: string;
  year: number;
  price: number;
  originalPrice?: number;
  currency: string;
  
  condition: WatchCondition;
  movement: WatchMovement;
  caseMaterial: WatchCaseMaterial;
  caseDiameter: number; // in mm, e.g. 40
  dialColor: string;
  braceletMaterial: string;
  waterResistance?: string;
  caliber?: string;
  powerReserve?: string;
  
  // Package details
  hasOriginalBox: boolean;
  hasOriginalPapers: boolean;
  hasServicePapers?: boolean;
  warrantyUntil?: string;
  
  // Content & Visuals
  images: string[];
  description: string;
  provenanceNotes?: string;
  authenticityVerified: boolean;
  
  // Status & Metrics
  status: 'active' | 'reserved' | 'sold' | 'paused';
  createdAt: string;
  viewsCount: number;
  wishlistCount: number;
  isFeatured?: boolean;
  fromPersonalCollectionId?: string;
}

export interface CollectionWatch {
  id: string;
  userId: string;
  brand: string;
  model: string;
  referenceNumber: string;
  year: number;
  serialNumber?: string;
  caseDiameter: number;
  caseMaterial: WatchCaseMaterial;
  movement: WatchMovement;
  dialColor: string;
  condition: WatchCondition;
  purchasePrice?: number;
  purchaseDate?: string;
  estimatedMarketValue: number;
  images: string[];
  notes?: string;
  isListedForSale: boolean;
  listingId?: string;
  createdAt: string;
}

export interface OrderTransaction {
  id: string;
  listingId: string;
  watchModel: string;
  watchBrand: string;
  watchReference: string;
  watchImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  price: number;
  shippingFee: number;
  totalAmount: number;
  status: 'pending' | 'authenticated' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string;
  trackingNumber?: string;
  hasReviewed: boolean;
}

export interface WatchOffer {
  id: string;
  listingId: string;
  watchModel: string;
  watchBrand: string;
  watchImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  offerAmount: number;
  originalListingPrice: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  counterAmount?: number;
  createdAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  brand: string[];
  movement: string[];
  condition: string[];
  minPrice: number;
  maxPrice: number;
  hasBox: boolean;
  hasPapers: boolean;
  minSellerRating: number;
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'rating-desc' | 'popular';
  caseDiameterRange: [number, number];
}

export type ActiveTab = 'explore' | 'seller-hub' | 'collection' | 'wishlist' | 'orders' | 'offers';
