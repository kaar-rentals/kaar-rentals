const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin.replace('://www.', '://api.')}/api`
    : 'http://localhost:8080/api');

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
  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
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
  async getCars(): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format - API may not be running');
      }
      
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getCarById(id: string): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`);
      if (!response.ok) throw new Error('Failed to fetch car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getOwnerCars(token: string): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/owner/my-cars`, {
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch owner cars');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async createCar(carData: CreateCarData, token: string): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error('Failed to create car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async updateCar(id: string, carData: Partial<CreateCarData>, token: string): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error('Failed to update car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async toggleCarRentalStatus(id: string, token: string): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}/toggle-rental`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to toggle car rental status');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async deleteCar(id: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to delete car');
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Payment operations
  async createCarListingPayment(carId: string, amount: number, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-car-listing`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
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
  async getAdminDashboard(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getPendingCars(token: string): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/cars/pending`, {
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch pending cars');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async approveCar(id: string, token: string): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/cars/${id}/approve`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to approve car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async rejectCar(id: string, token: string): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/cars/${id}/reject`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to reject car');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getAllUsers(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: this.getAuthHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update user role');
      return await this.parseJsonResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { Car, CreateCarData };
