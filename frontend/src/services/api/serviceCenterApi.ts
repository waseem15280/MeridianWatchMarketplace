import { request } from './client';
import { ServiceRequest } from '../../types';

export interface CreateServiceRequestPayload {
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  watchBrand: string;
  watchModel: string;
  movementType: string;
  isWorking: boolean;
  glassChangeRequired: boolean;
  issueDescription: string;
}

export interface TransitionRequestPayload {
  targetState: string;
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  estimatedPrice?: number;
  rejectionReason?: string;
  courierCompany?: string;
  trackingNumber?: string;
  returnCourierCompany?: string;
  returnTrackingNumber?: string;
  notes?: string;
}

export interface WorkflowDefinitionResponse {
  id: string;
  name: string;
  initialState: string;
  states: Array<{
    id: string;
    name: string;
    description: string;
    isFinal: boolean;
  }>;
  transitions: Array<{
    id: string;
    from: string;
    to: string;
    action: string;
    allowedRoles: string[];
    allowedFor?: string;
    requiredFields: string[];
    description: string;
  }>;
}

export const serviceCenterApi = {
  // GET /api/service-center?userId={userId}&role={role}
  getServiceRequests: async (userId?: string | number, role?: string): Promise<ServiceRequest[]> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', String(userId));
    if (role) params.append('role', role);
    const endpoint = `/api/service-center${params.toString() ? `?${params.toString()}` : ''}`;
    return request<ServiceRequest[]>(endpoint);
  },

  // GET /api/service-center/{id}
  getServiceRequestById: async (id: string | number): Promise<ServiceRequest> => {
    return request<ServiceRequest>(`/api/service-center/${id}`);
  },

  // POST /api/service-center
  createServiceRequest: async (data: CreateServiceRequestPayload): Promise<ServiceRequest> => {
    return request<ServiceRequest>('/api/service-center', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // POST /api/service-center/{id}/transition
  transitionServiceRequest: async (id: string | number, payload: TransitionRequestPayload): Promise<ServiceRequest> => {
    return request<ServiceRequest>(`/api/service-center/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // GET /api/service-center/workflow/definition
  getWorkflowDefinition: async (): Promise<WorkflowDefinitionResponse> => {
    return request<WorkflowDefinitionResponse>('/api/service-center/workflow/definition');
  }
};

