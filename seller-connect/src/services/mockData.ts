import { SellerProfile, ChatConversation, MobileInquiryNotification } from '../types';

export const INITIAL_SELLERS: SellerProfile[] = [
  {
    id: '7',
    name: 'Geneva Horology Gallery',
    email: 'contact@genevahorology.ch',
    location: 'Geneva, Switzerland',
    isKycDone: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+41 22 819 4000'
  },
  {
    id: '1',
    name: 'Alexander Vance (Dealer Studio)',
    email: 'alexander.vance@horology.com',
    location: 'New York, USA',
    isKycDone: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    phone: '+1 212 555 0199'
  },
  {
    id: '8',
    name: 'Crown & Caliber Atelier',
    email: 'vault@crowncaliber.co.uk',
    location: 'Mayfair, London, UK',
    isKycDone: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '+44 20 7946 0912'
  },
  {
    id: '9',
    name: 'Ginza Chrono Vault',
    email: 'tokyo@ginzachronovault.jp',
    location: 'Ginza, Tokyo, Japan',
    isKycDone: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    phone: '+81 3 5555 0143'
  }
];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1-buyer-101',
    listingId: '1',
    watchModel: 'Cosmograph Daytona "Panda"',
    watchBrand: 'Rolex',
    watchImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    price: 31500,
    buyerId: 'buyer-101',
    buyerName: 'Arjun Mehta',
    sellerId: '7',
    sellerName: 'Geneva Horology Gallery',
    lastMessage: 'Is this timepiece still available for purchase with original box?',
    lastMessageAt: new Date(Date.now() - 10 * 60000).toISOString(),
    unreadCountSeller: 1,
    unreadCountBuyer: 0
  }
];

export const INITIAL_NOTIFICATIONS: MobileInquiryNotification[] = [
  {
    id: 'notif-seed-1',
    conversationId: 'conv-1-buyer-101',
    listingId: '1',
    watchModel: 'Cosmograph Daytona "Panda"',
    watchBrand: 'Rolex',
    watchImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    price: 31500,
    buyerName: 'Arjun Mehta',
    messageText: 'Buyer inquiry received for Rolex Cosmograph Daytona "Panda" ($31,500).',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    isRead: false
  }
];
