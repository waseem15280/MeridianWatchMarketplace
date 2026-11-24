import { SellerProfile, ChatConversation, ChatMessage, MobileInquiryNotification } from '../types';

export const INITIAL_SELLERS: SellerProfile[] = [
  {
    id: '1',
    name: 'Geneva Horology Gallery',
    email: 'contact@genevahorology.ch',
    location: 'Geneva, Switzerland',
    isKycDone: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+41 22 819 4000'
  },
  {
    id: '2',
    name: 'Heritage Chrono & Co.',
    email: 'info@heritagechrono.co.uk',
    location: 'Mayfair, London, UK',
    isKycDone: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '+44 20 7946 0912'
  },
  {
    id: '3',
    name: 'Vance Chrono Atelier',
    email: 'alex@meridian.com',
    location: 'London, UK',
    isKycDone: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    phone: '+44 20 7000 0000'
  }
];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1-buyer-101',
    listingId: '1',
    watchModel: 'Cosmograph Daytona "Panda"',
    watchBrand: 'Rolex',
    watchImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    price: 2450000,
    buyerId: 'buyer-101',
    buyerName: 'Arjun Mehta',
    sellerId: '1',
    sellerName: 'Geneva Horology Gallery',
    lastMessage: 'Is this timepiece still available for purchase with original box?',
    lastMessageAt: new Date(Date.now() - 10 * 60000).toISOString(),
    unreadCountSeller: 1,
    unreadCountBuyer: 0
  },
  {
    id: 'conv-2-buyer-102',
    listingId: '2',
    watchModel: 'Nautilus Blue Dial',
    watchBrand: 'Patek Philippe',
    watchImage: 'https://images.unsplash.com/photo-1547996160-71dfabb1d46b?auto=format&fit=crop&w=600&q=80',
    price: 9200000,
    buyerId: 'buyer-102',
    buyerName: 'Rohan Kapoor',
    sellerId: '2',
    sellerName: 'Heritage Chrono & Co.',
    lastMessage: 'Would you be open to an escrow inspection at the Geneva service atelier?',
    lastMessageAt: new Date(Date.now() - 45 * 60000).toISOString(),
    unreadCountSeller: 1,
    unreadCountBuyer: 0
  }
];

export const INITIAL_NOTIFICATIONS: MobileInquiryNotification[] = [
  {
    id: 'notif-init-1',
    conversationId: 'conv-1-buyer-101',
    listingId: '1',
    watchModel: 'Cosmograph Daytona "Panda"',
    watchBrand: 'Rolex',
    watchImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    price: 2450000,
    buyerName: 'Arjun Mehta',
    messageText: 'Is this timepiece still available for purchase with original box?',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    isRead: false
  }
];
