import { request } from './client';
import { UserAccount, SellerReview, WatchOffer } from '../../types';

export const sellerHubApi = {
  // GET /api/seller-hub/profiles
  getProfiles: async (): Promise<UserAccount[]> => {
    return request<UserAccount[]>('/api/seller-hub/profiles');
  },

  // GET /api/seller-hub/profiles/{userId}
  getProfileById: async (userId: string): Promise<UserAccount> => {
    return request<UserAccount>(`/api/seller-hub/profiles/${encodeURIComponent(userId)}`);
  },

  // PUT /api/seller-hub/profiles/{userId}
  updateProfile: async (userId: string, updates: Partial<UserAccount>): Promise<UserAccount> => {
    return request<UserAccount>(`/api/seller-hub/profiles/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // GET /api/seller-hub/reviews?sellerId={sellerId}
  getReviews: async (sellerId?: string): Promise<SellerReview[]> => {
    const endpoint = sellerId ? `/api/seller-hub/reviews?sellerId=${encodeURIComponent(sellerId)}` : '/api/seller-hub/reviews';
    return request<SellerReview[]>(endpoint);
  },

  // POST /api/seller-hub/reviews
  addReview: async (review: Partial<SellerReview>): Promise<SellerReview> => {
    return request<SellerReview>('/api/seller-hub/reviews', {
      method: 'POST',
      body: JSON.stringify(review)
    });
  },

  // POST /api/seller-hub/reviews/{reviewId}/reply
  replyToReview: async (reviewId: string, sellerReply: string): Promise<SellerReview> => {
    return request<SellerReview>(`/api/seller-hub/reviews/${encodeURIComponent(reviewId)}/reply`, {
      method: 'POST',
      body: JSON.stringify({ sellerReply })
    });
  },

  // GET /api/seller-hub/offers?sellerId={sellerId}
  getSellerOffers: async (sellerId?: string): Promise<WatchOffer[]> => {
    const endpoint = sellerId ? `/api/seller-hub/offers?sellerId=${encodeURIComponent(sellerId)}` : '/api/seller-hub/offers';
    return request<WatchOffer[]>(endpoint);
  },

  // PATCH /api/seller-hub/offers/{offerId}/respond
  respondToOffer: async (offerId: string, status: string, counterAmount?: number): Promise<WatchOffer> => {
    return request<WatchOffer>(`/api/seller-hub/offers/${encodeURIComponent(offerId)}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ status, counterAmount })
    });
  }
};

