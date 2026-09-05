import { request } from './client';
import { OrderTransaction, WatchOffer } from '../../types';

export const customerOrdersApi = {
  // GET /api/customer-orders?userId={userId}&role={role}
  getOrders: async (userId?: string, role?: 'buyer' | 'seller'): Promise<OrderTransaction[]> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);

    const queryString = params.toString();
    const endpoint = queryString ? `/api/customer-orders?${queryString}` : '/api/customer-orders';
    return request<OrderTransaction[]>(endpoint);
  },

  // GET /api/customer-orders/{id}
  getOrderById: async (id: string): Promise<OrderTransaction> => {
    return request<OrderTransaction>(`/api/customer-orders/${encodeURIComponent(id)}`);
  },

  // POST /api/customer-orders (Checkout)
  createOrder: async (data: {
    listingId: string;
    watchModel: string;
    watchBrand: string;
    watchReference: string;
    watchImage: string;
    buyerId?: string;
    buyerName?: string;
    sellerId: string;
    sellerName: string;
    price: number;
    shippingFee: number;
    shippingAddress: string;
    paymentMethod?: string;
  }): Promise<OrderTransaction> => {
    return request<OrderTransaction>('/api/customer-orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // PATCH /api/customer-orders/{id}/status
  updateOrderStatus: async (id: string, status: OrderTransaction['status'], trackingNumber?: string): Promise<OrderTransaction> => {
    return request<OrderTransaction>(`/api/customer-orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, trackingNumber })
    });
  },

  // GET /api/customer-orders/offers?buyerId={buyerId}
  getBuyerOffers: async (buyerId?: string): Promise<WatchOffer[]> => {
    const endpoint = buyerId ? `/api/customer-orders/offers?buyerId=${encodeURIComponent(buyerId)}` : '/api/customer-orders/offers';
    return request<WatchOffer[]>(endpoint);
  },

  // POST /api/customer-orders/offers
  createOffer: async (data: {
    listingId: string;
    buyerId?: string;
    buyerName?: string;
    sellerId: string;
    watchModel: string;
    watchBrand: string;
    watchImage: string;
    offerAmount: number;
    originalListingPrice: number;
    message: string;
  }): Promise<WatchOffer> => {
    return request<WatchOffer>('/api/customer-orders/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // PATCH /api/customer-orders/offers/{offerId}/respond
  respondToOffer: async (offerId: string, status: string, counterAmount?: number): Promise<WatchOffer> => {
    return request<WatchOffer>(`/api/customer-orders/offers/${encodeURIComponent(offerId)}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ status, counterAmount })
    });
  }
};

