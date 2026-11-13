export type SystemRole = 'guest' | 'buyer' | 'seller' | 'collector' | 'admin' | 'service_executive';
export type UserRole = SystemRole | string;

export type Permission =
  | 'marketplace_access'
  | 'wishlist_access'
  | 'orders_access'
  | 'offers_access'
  | 'my_vault_access'
  | 'seller_hub_access'
  | 'service_center_access'
  | 'manage_service_center'
  | 'manage_users'
  | 'manage_orders'
  | 'manage_vault'
  | 'manage_seller_hub'
  | 'manage_roles';

export interface RoleDefinition {
  id: string; // identifier e.g. 'admin', 'vip_collector'
  name: string; // display name e.g. 'Administrator', 'VIP Collector'
  description: string;
  permissions: Permission[];
  isSystem?: boolean; // system roles cannot be deleted
  color?: string; // hex color for avatar/badge accents
}

export const PERMISSION_METADATA: Record<Permission, { label: string; description: string; category: string }> = {
  marketplace_access: {
    label: 'Marketplace Access',
    description: 'Can browse, filter, and view luxury watch marketplace listings',
    category: 'Marketplace'
  },
  wishlist_access: {
    label: 'Wishlist Access',
    description: 'Can save timepieces to personal wishlist and track price movements',
    category: 'Marketplace'
  },
  orders_access: {
    label: 'My Orders Access',
    description: 'Can view own purchase orders and track dispatch/delivery status',
    category: 'Commerce'
  },
  offers_access: {
    label: 'My Offers Access',
    description: 'Can submit, negotiate, and view own purchase/sale offers',
    category: 'Commerce'
  },
  my_vault_access: {
    label: 'My Watch Vault Access',
    description: 'Can curate personal horological collection in private vault',
    category: 'Collection & Vault'
  },
  seller_hub_access: {
    label: 'Seller Hub Access',
    description: 'Can access Seller Hub, manage listings, and create new watch listings',
    category: 'Seller & Inventory'
  },
  service_center_access: {
    label: 'Service Center Access',
    description: 'Can submit repair/service requests and monitor own service tickets',
    category: 'Service Center'
  },
  manage_service_center: {
    label: 'Manage Service Center',
    description: 'Full supervisory authority over service tickets, repair workflows, and technician notes',
    category: 'Administration'
  },
  manage_users: {
    label: 'Manage Users',
    description: 'Can manage user accounts, toggle active status, and administer personas',
    category: 'Administration'
  },
  manage_orders: {
    label: 'Manage All Orders',
    description: 'Supervisory authority over all platform transactions and customer orders',
    category: 'Administration'
  },
  manage_vault: {
    label: 'Manage All Vaults',
    description: 'Supervisory oversight over timepieces across all user vaults',
    category: 'Administration'
  },
  manage_seller_hub: {
    label: 'Manage All Seller Listings',
    description: 'Supervisory oversight over all seller listings across the entire platform',
    category: 'Administration'
  },
  manage_roles: {
    label: 'Manage Roles & Permissions',
    description: 'Can create custom roles and dynamically assign/revoke permissions across any role',
    category: 'Administration'
  }
};

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'guest',
    name: 'Guest / Visitor',
    description: 'Unauthenticated platform visitor with public browsing and timepiece exploration access.',
    permissions: [
      'marketplace_access'
    ],
    isSystem: true,
    color: '#94A3B8'
  },
  {
    id: 'buyer',
    name: 'Buyer / Client',
    description: 'Can browse marketplace, curate wishlist, submit purchase orders and offers.',
    permissions: [
      'marketplace_access',
      'wishlist_access',
      'orders_access',
      'offers_access'
    ],
    isSystem: true,
    color: '#3B82F6'
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Enjoys personal Watch Vault curation, service requests, and active acquisition.',
    permissions: [
      'marketplace_access',
      'wishlist_access',
      'orders_access',
      'offers_access',
      'my_vault_access',
      'service_center_access'
    ],
    isSystem: true,
    color: '#8B5CF6'
  },
  {
    id: 'seller',
    name: 'Authorized Dealer / Seller',
    description: 'Can list luxury watches for sale, manage inventory in Seller Hub, and service watches.',
    permissions: [
      'marketplace_access',
      'orders_access',
      'offers_access',
      'service_center_access',
      'seller_hub_access'
    ],
    isSystem: true,
    color: '#D4AF37'
  },
  {
    id: 'admin',
    name: 'Platform Administrator',
    description: 'Full supervisory authority including user governance, custom role creation, and platform controls.',
    permissions: [
      'marketplace_access',
      'wishlist_access',
      'orders_access',
      'offers_access',
      'my_vault_access',
      'seller_hub_access',
      'service_center_access',
      'manage_service_center',
      'manage_users',
      'manage_orders',
      'manage_vault',
      'manage_seller_hub',
      'manage_roles'
    ],
    isSystem: true,
    color: '#EF4444'
  },
  {
    id: 'service_executive',
    name: 'Horology Service Executive',
    description: 'Dedicated horology technician managing repair pipelines, quotes, and service dispatch.',
    permissions: [
      'manage_service_center'
    ],
    isSystem: true,
    color: '#10B981'
  }
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  guest: [
    'marketplace_access'
  ],
  buyer: [
    'marketplace_access',
    'wishlist_access',
    'orders_access',
    'offers_access'
  ],
  collector: [
    'marketplace_access',
    'wishlist_access',
    'orders_access',
    'offers_access',
    'my_vault_access',
    'service_center_access'
  ],
  seller: [
    'marketplace_access',
    'orders_access',
    'offers_access',
    'service_center_access',
    'seller_hub_access'
  ],
  admin: [
    'marketplace_access',
    'wishlist_access',
    'orders_access',
    'offers_access',
    'my_vault_access',
    'seller_hub_access',
    'service_center_access',
    'manage_service_center',
    'manage_users',
    'manage_orders',
    'manage_vault',
    'manage_seller_hub',
    'manage_roles'
  ],
  service_executive: [
    'manage_service_center'
  ]
};

export interface UserLogin {
  id: string | number;
  username: string;
  email: string;
  isActive?: boolean;
  created?: string;
  lastLoginAt?: string;
  accounts?: UserAccount[];
}

export type WatchCondition = 'Unworn' | 'Mint' | 'Very Good' | 'Good' | 'Fair' | string;

export type WatchMovement = 'Automatic' | 'Manual Winding' | 'Quartz' | 'Digital' | 'Solar' | 'Hybrid' | 'Spring Drive' | string;

export type WatchCaseMaterial = 
  | 'Stainless Steel' 
  | 'Gold Plated' 
  | 'Platinum' 
  | 'Titanium' 
  | 'Ceramic' 
  | 'Bronze'
  | 'Other'
  | string;

export interface SellerReview {
  id: string | number;
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
  id: string | number;
  userLoginId?: string | number;
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
  isDefault?: boolean;
  permissions?: Permission[];
}

export interface WatchListing {
  id: string | number;
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
  fromPersonalCollectionId?: string | number;
}

export interface CollectionWatch {
  id: string | number;
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
  listingId?: string | number;
  createdAt: string;
}

export interface OrderTransaction {
  id: string | number;
  listingId: string | number;
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
  id: string | number;
  listingId: string | number;
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

export type ServiceWorkflowState =
  | 'ServiceRequestCreated'
  | 'ServiceRequestAccepted'
  | 'ServiceRequestRejected'
  | 'InTransit'
  | 'UnderRepair'
  | 'InTesting'
  | 'TransitBack';

export interface ServiceRequestAuditLog {
  id: number;
  serviceRequestId: number | string;
  fromState: string;
  toState: string;
  action: string;
  triggeredByUserId: string;
  triggeredByName: string;
  triggeredByRole: string;
  timestamp: string;
  notes?: string;
}

export interface ServiceRequest {
  id: number | string;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  watchBrand: string;
  watchModel: string;
  movementType: WatchMovement | string;
  isWorking: boolean;
  glassChangeRequired: boolean;
  issueDescription: string;
  currentState: ServiceWorkflowState;
  estimatedPrice?: number;
  rejectionReason?: string;
  courierCompany?: string;
  trackingNumber?: string;
  returnCourierCompany?: string;
  returnTrackingNumber?: string;
  serviceNotes?: string;
  createdAt: string;
  updatedAt: string;
  auditLogs?: ServiceRequestAuditLog[];
}

export type ActiveTab = 'explore' | 'seller-hub' | 'collection' | 'wishlist' | 'orders' | 'offers' | 'service-center' | 'user-management' | 'role-management';
