import { request } from './client';
import { WatchListing, FilterOptions } from '../../types';

export const marketplaceApi = {
  // GET /api/marketplace/listings
  getListings: async (filters?: Partial<FilterOptions>): Promise<WatchListing[]> => {
    const params = new URLSearchParams();

    if (filters?.searchQuery) params.append('search', filters.searchQuery);
    if (filters?.brand && filters.brand.length > 0) params.append('brand', filters.brand.join(','));
    if (filters?.movement && filters.movement.length > 0) params.append('movement', filters.movement.join(','));
    if (filters?.condition && filters.condition.length > 0) params.append('condition', filters.condition.join(','));
    if (filters?.minPrice && filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice && filters.maxPrice < 150000) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.hasBox) params.append('hasBox', 'true');
    if (filters?.hasPapers) params.append('hasPapers', 'true');
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const endpoint = queryString ? `/api/marketplace/listings?${queryString}` : '/api/marketplace/listings';
    return request<WatchListing[]>(endpoint);
  },

  // GET /api/marketplace/listings/{id}
  getListingById: async (id: string): Promise<WatchListing> => {
    return request<WatchListing>(`/api/marketplace/listings/${id}`);
  },

  // POST /api/marketplace/listings
  createListing: async (listing: Partial<WatchListing>): Promise<WatchListing> => {
    return request<WatchListing>('/api/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(listing)
    });
  },

  // PUT /api/marketplace/listings/{id}
  updateListing: async (id: string, updates: Partial<WatchListing>): Promise<WatchListing> => {
    return request<WatchListing>(`/api/marketplace/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // DELETE /api/marketplace/listings/{id}
  deleteListing: async (id: string): Promise<void> => {
    return request<void>(`/api/marketplace/listings/${id}`, {
      method: 'DELETE'
    });
  },

  // PATCH /api/marketplace/listings/{id}/status
  updateStatus: async (id: string, status: WatchListing['status']): Promise<{ id: string; status: string }> => {
    return request<{ id: string; status: string }>(`/api/marketplace/listings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // POST /api/marketplace/listings/{id}/view
  recordView: async (id: string): Promise<{ viewsCount: number }> => {
    return request<{ viewsCount: number }>(`/api/marketplace/listings/${id}/view`, {
      method: 'POST'
    });
  }
};

