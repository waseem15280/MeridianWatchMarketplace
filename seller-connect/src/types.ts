export interface ChatMessage {
  id: string;
  conversationId: string;
  listingId: string | number;
  buyerId: string | number;
  buyerName: string;
  sellerId: string | number;
  sellerName: string;
  sender: 'buyer' | 'seller';
  text: string;
  imageUrl?: string;
  watchBrand?: string;
  watchModel?: string;
  price?: number;
  createdAt: string;
  isRead?: boolean;
}

export interface ChatConversation {
  id: string;
  listingId: string | number;
  watchModel: string;
  watchBrand: string;
  watchImage: string;
  price: number;
  buyerId: string | number;
  buyerName: string;
  sellerId: string | number;
  sellerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountSeller: number;
  unreadCountBuyer: number;
}

export interface MobileInquiryNotification {
  id: string;
  conversationId: string;
  listingId: string | number;
  watchModel: string;
  watchBrand: string;
  watchImage: string;
  price: number;
  buyerName: string;
  messageText: string;
  timestamp: string;
  isRead: boolean;
}

export interface SellerProfile {
  id: string | number;
  name: string;
  email: string;
  location: string;
  isKycDone: boolean;
  avatar: string;
  phone?: string;
}

export interface UserAccount {
  id: string | number;
  userLoginId: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'collector' | 'admin' | string;
  avatar?: string;
  location?: string;
  memberSince?: string;
  verifiedDealer?: boolean;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  totalSalesCount?: number;
  responseRate?: string;
  avgShipTime?: string;
  phone?: string;
  isDefault?: boolean;
  isKycDone?: boolean;
}

export interface UserLogin {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  login: UserLogin;
  accounts: UserAccount[];
  activeAccountId: number;
}
