import { request } from './client';
import { CollectionWatch } from '../../types';

export interface ValuationRecordResponse {
  id: number;
  vaultWatchId: string;
  estimatedValue: number;
  recordedDate: string;
  source: string;
  notes?: string;
}

export const collectorVaultApi = {
  // GET /api/collector-vault/watches?userId={userId}
  getWatches: async (userId?: string): Promise<CollectionWatch[]> => {
    const endpoint = userId ? `/api/collector-vault/watches?userId=${encodeURIComponent(userId)}` : '/api/collector-vault/watches';
    return request<CollectionWatch[]>(endpoint);
  },

  // GET /api/collector-vault/watches/{id}
  getWatchById: async (id: string): Promise<CollectionWatch> => {
    return request<CollectionWatch>(`/api/collector-vault/watches/${id}`);
  },

  // POST /api/collector-vault/watches
  addWatch: async (watch: Partial<CollectionWatch>): Promise<CollectionWatch> => {
    return request<CollectionWatch>('/api/collector-vault/watches', {
      method: 'POST',
      body: JSON.stringify(watch)
    });
  },

  // PUT /api/collector-vault/watches/{id}
  updateWatch: async (id: string, updates: Partial<CollectionWatch>): Promise<CollectionWatch> => {
    return request<CollectionWatch>(`/api/collector-vault/watches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // DELETE /api/collector-vault/watches/{id}
  deleteWatch: async (id: string): Promise<void> => {
    return request<void>(`/api/collector-vault/watches/${id}`, {
      method: 'DELETE'
    });
  },

  // POST /api/collector-vault/watches/{id}/valuations
  addValuation: async (id: string, valuation: { estimatedValue: number; notes?: string; source?: string }): Promise<ValuationRecordResponse> => {
    return request<ValuationRecordResponse>(`/api/collector-vault/watches/${id}/valuations`, {
      method: 'POST',
      body: JSON.stringify(valuation)
    });
  },

  // GET /api/collector-vault/watches/{id}/valuations
  getValuations: async (id: string): Promise<ValuationRecordResponse[]> => {
    return request<ValuationRecordResponse[]>(`/api/collector-vault/watches/${id}/valuations`);
  },

  // POST /api/collector-vault/watches/{id}/list-for-sale (Orchestrates listing creation on Marketplace)
  listForSale: async (id: string, data: { price: number; description?: string; sellerId?: string; sellerName?: string }): Promise<{ message: string; watchId: string; listingId: string }> => {
    return request<{ message: string; watchId: string; listingId: string }>(`/api/collector-vault/watches/${id}/list-for-sale`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // POST /api/collector-vault/watches/{id}/unlink-listing
  unlinkListing: async (id: string): Promise<{ message: string; watchId: string }> => {
    return request<{ message: string; watchId: string }>(`/api/collector-vault/watches/${id}/unlink-listing`, {
      method: 'POST'
    });
  }
};

