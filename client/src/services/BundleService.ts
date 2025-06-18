import api from './api';
import { Product, ProductType, ProductFormData } from '@/types/product';
import { mockProducts, getDefaultImageByType } from '@/mocks/productData';

 const BUNDLE_API = '/bundles';

export const getBundles = async (filters: {
    search?: string;
    isActive?: boolean;
} = {}): Promise<any[]> => {
    try {
        const publicApi = api.create();
        const response = await publicApi.get(BUNDLE_API, {
            params: { ...filters, public: true },
            headers: {
                'Content-Type': 'application/json',
            },
            validateStatus: (status) => status < 500
        });

        if (response.status >= 400) {
            console.log('API error, falling back to mock bundles');
            // You should create mockBundles in your mocks if you want fallback
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
        try {
            const response = await api.get(`${BUNDLE_API}/${id}`);
            if (response.data && (response.data.data || response.data)) {
                return response.data.data || response.data;
            }
        } catch (apiError) {
            console.log('API request failed, falling back to mock bundle');
        }
        // Fallback: return undefined or throw
        throw new Error(`Bundle with id ${id} not found`);
    } catch (error) {
        console.error(`Error fetching bundle with id ${id}:`, error);
        throw error;
    }
};

export const createBundle = async (bundleData: any): Promise<any> => {
    try {
        try {
            const response = await api.post(BUNDLE_API, bundleData);
            if (response.data && (response.data.data || response.data)) {
                return response.data.data || response.data;
            }
        } catch (apiError) {
            console.log('API create failed, using mock data');
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
    bundleData: Partial<any>
): Promise<any> => {
    try {
        const response = await api.put(`${BUNDLE_API}/${id}`, bundleData);
        return response.data.data || response.data;
    } catch (error) {
        console.error(`Error updating bundle with id ${id}:`, error);
        throw error;
    }
};

export const deleteBundle = async (id: string): Promise<void> => {
    try {
        try {
            await api.delete(`${BUNDLE_API}/${id}`);
            return;
        } catch (apiError) {
            console.log('API delete failed, using mock data');
        }
        // Fallback: do nothing
        return;
    } catch (error) {
        console.error(`Error deleting bundle with id ${id}:`, error);
        throw error;
    }
};

export const toggleBundleStatus = async (id: string, isActive: boolean): Promise<any> => {
    try {
        const response = await api.post(`${BUNDLE_API}/${id}/toggle-status`, {
            is_active: isActive ? 1 : 0
        });

        if (response.data && (response.data.data || response.data)) {
            return response.data.data || response.data;
        }

        throw new Error('Unexpected API response format');
    } catch (apiError) {
        console.error(`API error toggling status for bundle ${id}:`, apiError);
        // Fallback: return undefined or throw
        throw apiError;
    }
};