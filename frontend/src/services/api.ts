import { apiUrl } from '@/lib/apiBase';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Helper to get auth headers
function getAuthHeaders(customToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = customToken || getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  category: 'Sedan' | 'SUV' | 'Hatchback';
  pricePerDay: number;
  images: string[];
  location: string;
  city: string;
  engineCapacity: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  seating: number;
  features: string[];
  description: string;
  isActive: boolean;
  isRented: boolean;
  isApproved: boolean;
  featured?: boolean;
  verified?: boolean;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  owner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateCarData {
  brand: string;
  model: string;
  year: number;
  category: 'Sedan' | 'SUV' | 'Hatchback';
  pricePerDay: number;
  images?: string[];
  location: string;
  city: string;
  engineCapacity: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  seating: number;
  features?: string[];
  description: string;
}

class ApiService {
  private getAuthHeaders(token?: string) {
    return getAuthHeaders(token);
  }

  private async parseJsonResponse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Empty response from API');
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw new Error('Invalid JSON response from API');
    }
  }

  // Car operations
  async getCars(queryParams?: { featured?: boolean; category?: string; [key: string]: any }): Promise<Car[]> {
    try {
      let url = apiUrl('/api/cars');
      
      // Add query parameters if provided
      if (queryParams) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format - API may not be running');
      }
      
      const data = await this.parseJsonResponse(response);
      // Handle both array and object response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.cars && Array.isArray(data.cars)) {
        return data.cars;
      } else {
        return [];
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getCarById(id: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/cars/${id}`), {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getOwnerCars(token?: string): Promise<Car[]> {
    try {
      const response = await fetch(apiUrl('/api/cars/owner/my-cars'), {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch owner cars');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async createCar(carData: CreateCarData, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl('/api/cars'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error('Failed to create car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async updateCar(id: string, carData: Partial<CreateCarData>, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/cars/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(carData),
      });
      
      if (response.status === 401) {
        throw new Error('You must be logged in to update car details');
      }
      
      if (response.status === 403) {
        throw new Error('You must be the listing owner to update car details');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update car: ${errorText || response.statusText}`);
      }
      
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async updateCarPrice(id: string, pricePerDay: number, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/cars/${id}/price`), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ pricePerDay }),
      });
      if (!response.ok) throw new Error('Failed to update car price');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async toggleCarRentalStatus(id: string, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/cars/${id}/toggle-rental`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to toggle car rental status');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async updateCarRentalStatus(id: string, isRented: boolean, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/cars/${id}/status`), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status: isRented ? 'rented' : 'available' }),
      });
      
      if (response.status === 401) {
        throw new Error('You must be logged in to update car status');
      }
      
      if (response.status === 403) {
        throw new Error('You must be the listing owner to update status');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update car status: ${errorText || response.statusText}`);
      }
      
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async deleteCar(id: string, token?: string): Promise<void> {
    try {
      const response = await fetch(apiUrl(`/api/cars/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to delete car');
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Payment operations
  async createCarListingPayment(carId: string, amount: number, token?: string) {
    try {
      const response = await fetch(apiUrl('/api/payments/create-car-listing'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ carId, amount }),
      });
      if (!response.ok) throw new Error('Failed to create payment');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Admin operations
  async getAdminDashboard(token?: string) {
    try {
      const response = await fetch(apiUrl('/api/admin/dashboard'), {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getPendingCars(token?: string): Promise<Car[]> {
    try {
      const response = await fetch(apiUrl('/api/admin/cars/pending'), {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch pending cars');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async approveCar(id: string, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/admin/cars/${id}/approve`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to approve car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async rejectCar(id: string, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/admin/cars/${id}/reject`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to reject car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getAllUsers(token?: string) {
    try {
      const response = await fetch(apiUrl('/api/admin/users'), {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: string, token?: string) {
    try {
      const response = await fetch(apiUrl(`/api/admin/users/${userId}/role`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update user role');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Payment operations for listing
  async createListingPayment(listingDraft: any, feature: boolean, token?: string) {
    try {
      const response = await fetch(apiUrl('/api/payments/create-listing-payment'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ listingDraft, feature }),
      });
      
      if (response.status === 401) {
        throw new Error('You must be logged in to create a listing payment');
      }
      
      if (response.status === 403) {
        throw new Error('You must be the listing owner to create payment');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create listing payment: ${errorText || response.statusText}`);
      }
      
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, token?: string) {
    try {
      const response = await fetch(apiUrl(`/api/payments/verify?paymentId=${paymentId}`), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      
      if (response.status === 401) {
        throw new Error('You must be logged in to verify payment');
      }
      
      if (response.status === 403) {
        throw new Error('You must be the payment owner to verify this payment');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to verify payment: ${errorText || response.statusText}`);
      }
      
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getPendingListings(token?: string) {
    try {
      const response = await fetch(apiUrl('/api/payments/pending-listings'), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      
      if (response.status === 401) {
        throw new Error('You must be logged in to view pending listings');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch pending listings: ${errorText || response.statusText}`);
      }
      
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getStats(): Promise<{ users_count: number; listings_count: number; featured_count: number }> {
    try {
      const response = await fetch(apiUrl('/api/stats'));
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async toggleFeatured(carId: string, featured: boolean, token?: string): Promise<Car> {
    try {
      const response = await fetch(apiUrl(`/api/cars/${carId}/featured`), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ featured }),
      });
      if (!response.ok) throw new Error('Failed to toggle featured status');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { Car, CreateCarData };
