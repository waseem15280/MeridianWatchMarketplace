import { request } from './client';

export interface WishlistItemResponse {
  id: number;
  buyerId: string;
  listingId: string;
  watchBrand?: string;
  watchModel?: string;
  priceWhenAdded?: number;
  notes?: string;
  priority: string;
  addedAt: string;
}

export const buyerWishlistApi = {
  // GET /api/buyer-wishlist?buyerId={buyerId}
  getWishlist: async (buyerId?: string): Promise<WishlistItemResponse[]> => {
    const endpoint = buyerId ? `/api/buyer-wishlist?buyerId=${encodeURIComponent(buyerId)}` : '/api/buyer-wishlist';
    return request<WishlistItemResponse[]>(endpoint);
  },

  // GET /api/buyer-wishlist/check?buyerId={buyerId}&listingId={listingId}
  checkInWishlist: async (buyerId: string, listingId: string): Promise<{ inWishlist: boolean }> => {
    return request<{ inWishlist: boolean }>(`/api/buyer-wishlist/check?buyerId=${encodeURIComponent(buyerId)}&listingId=${encodeURIComponent(listingId)}`);
  },

  // POST /api/buyer-wishlist
  addToWishlist: async (data: { buyerId?: string; listingId: string; watchBrand?: string; watchModel?: string; priceWhenAdded?: number; notes?: string; priority?: string }): Promise<WishlistItemResponse> => {
    return request<WishlistItemResponse>('/api/buyer-wishlist', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // DELETE /api/buyer-wishlist/{listingId}?buyerId={buyerId}
  removeFromWishlist: async (listingId: string, buyerId?: string): Promise<void> => {
    const endpoint = buyerId ? `/api/buyer-wishlist/${listingId}?buyerId=${encodeURIComponent(buyerId)}` : `/api/buyer-wishlist/${listingId}`;
    return request<void>(endpoint, {
      method: 'DELETE'
    });
  },

  // DELETE /api/buyer-wishlist/clear?buyerId={buyerId}
  clearWishlist: async (buyerId?: string): Promise<void> => {
    const endpoint = buyerId ? `/api/buyer-wishlist/clear?buyerId=${encodeURIComponent(buyerId)}` : '/api/buyer-wishlist/clear';
    return request<void>(endpoint, {
      method: 'DELETE'
    });
  },

  // PUT /api/buyer-wishlist/{id}/notes
  updateNotes: async (id: number, notes: string, priority?: string): Promise<WishlistItemResponse> => {
    return request<WishlistItemResponse>(`/api/buyer-wishlist/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes, priority })
    });
  }
};

