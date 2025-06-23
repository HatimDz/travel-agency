import api from './api';
import { getToken } from './authService';

const BUNDLE_API = '/bundles';
const BUNDLE_API_PUB = '/bundles-client';

export interface BundleFormData {
  name: string;
  type: 'Silver' | 'Gold' | 'Platinum';
  description: string;
  price: number;
  active: boolean;
  product_ids: number[];
}
export const getBundlesPublic = async (filters: {
  search?: string;
} = {}): Promise<any[]> => {
  try {
   
    const publicApi = api.create();

    const response = await publicApi.get(BUNDLE_API_PUB, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status < 500
    });

    if (response.status >= 400) {
      console.log('API error, falling back to mock bundles');
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return [];
  }
};
export const getBundleClientById = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`${BUNDLE_API_PUB}/${id}`);
    if (response.data && (response.data.data || response.data)) {
      return response.data.data || response.data;
    }
    throw new Error(`Bundle with id ${id} not found`);
  } catch (error) {
    console.error(`Error fetching bundle with id ${id}:`, error);
    throw error;
  }
};


export const getBundles = async (filters: {
  search?: string;
} = {}): Promise<any[]> => {
  try {
    const token = getToken() ;
    const publicApi = api.create();

    const response = await publicApi.get(BUNDLE_API, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status < 500
    });

    if (response.status >= 400) {
      console.log('API error, falling back to mock bundles');
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return [];
  }
};

export const getBundleById = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`${BUNDLE_API}/${id}`);
    if (response.data && (response.data.data || response.data)) {
      return response.data.data || response.data;
    }
    throw new Error(`Bundle with id ${id} not found`);
  } catch (error) {
    console.error(`Error fetching bundle with id ${id}:`, error);
    throw error;
  }
};

export const createBundle = async (bundleData: BundleFormData): Promise<any> => {
  try {
    const payload = {
      ...bundleData
    };
    const response = await api.post(BUNDLE_API, payload);
    if (response.data && (response.data.data || response.data)) {
      return response.data.data || response.data;
    }
    // Fallback: return the bundleData with a mock id
    return { ...bundleData, id: Date.now().toString() };
  } catch (error) {
    console.error('Error creating bundle:', error);
    throw error;
  }
};

export const updateBundle = async (
  id: string,
  bundleData: Partial<BundleFormData>
): Promise<any> => {
  try {
    const payload = {
      ...bundleData,
      ...(bundleData.active !== undefined ? { active: bundleData.active } : {}),
    };
    const response = await api.put(`${BUNDLE_API}/${id}`, payload);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating bundle with id ${id}:`, error);
    throw error;
  }
};

export const deleteBundle = async (id: string): Promise<void> => {
  try {
    await api.delete(`${BUNDLE_API}/${id}`);
    return;
  } catch (error) {
    console.error(`Error deleting bundle with id ${id}:`, error);
    throw error;
  }
};

export const toggleBundleStatus = async (id: string, active: boolean): Promise<any> => {
  try {
    const response = await api.post(`${BUNDLE_API}/${id}/toggle-status`, {
      active: active ? 1 : 0
    });

    if (response.data && (response.data.data || response.data)) {
      return response.data.data || response.data;
    }

    throw new Error('Unexpected API response format');
  } catch (apiError) {
    console.error(`API error toggling status for bundle ${id}:`, apiError);
    throw apiError;
  }
};