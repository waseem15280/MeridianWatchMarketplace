import { ActiveTab } from '../types';

export interface FeatureFlags {
  marketplace: boolean;      // 1) Common marketplace
  collectorVault: boolean;   // 2) Watch collector vault
  buyerWishlist: boolean;    // 3) Buyer Wishlist
  sellerHub: boolean;        // 4) Seller hub to manage seller listings
  ordersAndOffers: boolean;  // 5) Order and offers
  serviceCenter: boolean;    // 6) Watch repair service center
  userManagement: boolean;   // 7) Admin & Service Executive User Management
}

export interface FeatureFlagConfig {
  /**
   * Global master flag:
   * - When true: All features are enabled according to phase/role rules.
   * - When false: Features are enabled phase-wise according to `features` (Admins always see everything).
   */
  enableAllFeatures: boolean;

  /**
   * Phase-wise individual feature flags for registered users.
   */
  features: FeatureFlags;

  /**
   * Global feature flags for Guest (unauthenticated) users.
   * By default:
   * - marketplace: true
   * - collectorVault: false (OFF for Guest)
   * - buyerWishlist: false (OFF for Guest)
   * - sellerHub: false (OFF for Guest)
   * - ordersAndOffers: false (OFF for Guest)
   */
  guestFeatures: FeatureFlags;
}

const parseEnvBool = (val: unknown, fallback: boolean): boolean => {
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  return fallback;
};

/**
 * Global Feature Flag Configuration
 * You can toggle `enableAllFeatures` or individual feature flags here or via Vite .env variables:
 * e.g., VITE_ENABLE_ALL_FEATURES=false, VITE_FEATURE_MARKETPLACE=true
 */
export const FEATURE_FLAGS: FeatureFlagConfig = {
  enableAllFeatures: parseEnvBool((import.meta as any).env?.VITE_ENABLE_ALL_FEATURES, true),
  features: {
    marketplace: parseEnvBool((import.meta as any).env?.VITE_FEATURE_MARKETPLACE, true),
    collectorVault: parseEnvBool((import.meta as any).env?.VITE_FEATURE_COLLECTOR_VAULT, true),
    buyerWishlist: parseEnvBool((import.meta as any).env?.VITE_FEATURE_BUYER_WISHLIST, true),
    sellerHub: parseEnvBool((import.meta as any).env?.VITE_FEATURE_SELLER_HUB, true),
    ordersAndOffers: parseEnvBool((import.meta as any).env?.VITE_FEATURE_ORDERS_AND_OFFERS, true),
    serviceCenter: parseEnvBool((import.meta as any).env?.VITE_FEATURE_SERVICE_CENTER, true),
    userManagement: parseEnvBool((import.meta as any).env?.VITE_FEATURE_USER_MANAGEMENT, true)
  },
  guestFeatures: {
    marketplace: parseEnvBool((import.meta as any).env?.VITE_GUEST_FEATURE_MARKETPLACE, true),
    collectorVault: parseEnvBool((import.meta as any).env?.VITE_GUEST_FEATURE_COLLECTOR_VAULT, false), // OFF for Guest
    buyerWishlist: parseEnvBool((import.meta as any).env?.VITE_GUEST_FEATURE_BUYER_WISHLIST, false),   // OFF for Guest
    sellerHub: parseEnvBool((import.meta as any).env?.VITE_GUEST_FEATURE_SELLER_HUB, false),           // OFF for Guest
    ordersAndOffers: parseEnvBool((import.meta as any).env?.VITE_GUEST_FEATURE_ORDERS_AND_OFFERS, false), // OFF for Guest
    serviceCenter: parseEnvBool((import.meta as any).env?.VITE_GUEST_FEATURE_SERVICE_CENTER, false),   // OFF for Guest
    userManagement: false // Always OFF for Guest
  }
};

/**
 * Map each UI active tab to its corresponding feature key
 */
export const TAB_TO_FEATURE_MAP: Record<ActiveTab, keyof FeatureFlags> = {
  'explore': 'marketplace',
  'collection': 'collectorVault',
  'wishlist': 'buyerWishlist',
  'seller-hub': 'sellerHub',
  'orders': 'ordersAndOffers',
  'offers': 'ordersAndOffers',
  'service-center': 'serviceCenter',
  'user-management': 'userManagement'
};

/**
 * Checks whether a given feature is accessible for the current user.
 * - Admin users ALWAYS have access to all features.
 * - For Guest users (!isLoggedIn / isGuest):
 *   Checks `guestFeatures`. Wishlist, Watch Vault, and Seller Hub are OFF by default.
 * - For Authenticated Non-Admin users:
 *   When `enableAllFeatures` is true, all features are accessible.
 *   Otherwise, checks the specific phase-wise flag `features[featureKey]`.
 */
export function isFeatureAccessible(
  featureKey: keyof FeatureFlags,
  isAdmin: boolean,
  isGuest: boolean = false
): boolean {
  if (isAdmin) return true;
  if (isGuest) {
    return Boolean(FEATURE_FLAGS.guestFeatures[featureKey]);
  }
  if (FEATURE_FLAGS.enableAllFeatures) return true;
  return Boolean(FEATURE_FLAGS.features[featureKey]);
}

/**
 * Checks whether a feature is active in the application overall (ignoring guest restrictions).
 * Used to determine if interactive elements like the Wishlist button should be visible to guests
 * so they can click it and be prompted to log in.
 */
export function isFeatureActiveInApp(
  featureKey: keyof FeatureFlags,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  if (FEATURE_FLAGS.enableAllFeatures) return true;
  return Boolean(FEATURE_FLAGS.features[featureKey]);
}

/**
 * Checks if a specific tab is accessible for the user.
 */
export function isTabAccessible(
  tab: ActiveTab,
  isAdmin: boolean,
  isGuest: boolean = false
): boolean {
  const featureKey = TAB_TO_FEATURE_MAP[tab];
  return featureKey ? isFeatureAccessible(featureKey, isAdmin, isGuest) : true;
}

/**
 * Gets the first accessible tab for a user, or falls back to 'explore'.
 */
export function getFirstAccessibleTab(
  isAdmin: boolean,
  isGuest: boolean = false
): ActiveTab {
  const allTabs: ActiveTab[] = ['explore', 'collection', 'wishlist', 'seller-hub', 'orders', 'service-center', 'user-management'];
  for (const tab of allTabs) {
    if (isTabAccessible(tab, isAdmin, isGuest)) {
      return tab;
    }
  }
  return 'explore';
}

