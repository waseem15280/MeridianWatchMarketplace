import { ActiveTab } from '../types';

export interface FeatureFlags {
  marketplace: boolean;      // 1) Common marketplace
  collectorVault: boolean;   // 2) Watch collector vault
  buyerWishlist: boolean;    // 3) Buyer Wishlist
  sellerHub: boolean;        // 4) Seller hub to manage seller listings
  ordersAndOffers: boolean;  // 5) Order and offers
}

export interface FeatureFlagConfig {
  /**
   * Global master flag:
   * - When true: All features are enabled for all users.
   * - When false: Features are enabled phase-wise according to `features` (Admins always see everything).
   */
  enableAllFeatures: boolean;

  /**
   * Phase-wise individual feature flags.
   * Active when `enableAllFeatures` is false.
   */
  features: FeatureFlags;
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
    ordersAndOffers: parseEnvBool((import.meta as any).env?.VITE_FEATURE_ORDERS_AND_OFFERS, true)
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
  'orders': 'ordersAndOffers'
};

/**
 * Checks whether a given feature is accessible for the current user.
 * - Admin users ALWAYS have access to all features.
 * - When `enableAllFeatures` is true, all features are accessible.
 * - Otherwise, checks the specific phase-wise flag.
 */
export function isFeatureAccessible(
  featureKey: keyof FeatureFlags,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  if (FEATURE_FLAGS.enableAllFeatures) return true;
  return Boolean(FEATURE_FLAGS.features[featureKey]);
}

/**
 * Checks if a specific tab is accessible for the user.
 */
export function isTabAccessible(tab: ActiveTab, isAdmin: boolean): boolean {
  const featureKey = TAB_TO_FEATURE_MAP[tab];
  return featureKey ? isFeatureAccessible(featureKey, isAdmin) : true;
}

/**
 * Gets the first accessible tab for a user, or falls back to 'explore'.
 */
export function getFirstAccessibleTab(isAdmin: boolean): ActiveTab {
  const allTabs: ActiveTab[] = ['explore', 'collection', 'wishlist', 'seller-hub', 'orders'];
  for (const tab of allTabs) {
    if (isTabAccessible(tab, isAdmin)) {
      return tab;
    }
  }
  return 'explore';
}

