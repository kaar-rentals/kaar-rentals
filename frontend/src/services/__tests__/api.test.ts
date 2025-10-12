import { apiService } from '../api';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCarRentalStatus', () => {
    const mockCar = {
      _id: 'car123',
      brand: 'Toyota',
      model: 'Camry',
      year: 2022,
      category: 'Sedan' as const,
      pricePerDay: 5000,
      images: ['image1.jpg'],
      location: 'Karachi',
      city: 'Karachi',
      engineCapacity: '2.0L',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      mileage: '15 km/l',
      seating: 5,
      features: ['AC'],
      description: 'A reliable sedan',
      isActive: true,
      isRented: false,
      isApproved: true,
      paymentStatus: 'PAID' as const,
      owner: {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    it('successfully updates car rental status', async () => {
      const updatedCar = { ...mockCar, isRented: true };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedCar,
        text: async () => JSON.stringify(updatedCar),
      } as Response);

      const result = await apiService.updateCarRentalStatus('car123', true, 'token123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/cars/car123'),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
          },
          body: JSON.stringify({ isRented: true }),
        }
      );

      expect(result).toEqual(updatedCar);
    });

    it('handles 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Unauthorized',
      } as Response);

      await expect(
        apiService.updateCarRentalStatus('car123', true, 'invalid-token')
      ).rejects.toThrow('You must be logged in to update car status');
    });

    it('handles 403 forbidden error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Forbidden',
      } as Response);

      await expect(
        apiService.updateCarRentalStatus('car123', true, 'token123')
      ).rejects.toThrow('You must be the listing owner to update status');
    });

    it('handles general API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      } as Response);

      await expect(
        apiService.updateCarRentalStatus('car123', true, 'token123')
      ).rejects.toThrow('Failed to update car status: Server Error');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        apiService.updateCarRentalStatus('car123', true, 'token123')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getOwnerCars', () => {
    const mockCars = [
      {
        _id: 'car1',
        brand: 'Toyota',
        model: 'Camry',
        year: 2022,
        category: 'Sedan' as const,
        pricePerDay: 5000,
        images: ['image1.jpg'],
        location: 'Karachi',
        city: 'Karachi',
        engineCapacity: '2.0L',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '15 km/l',
        seating: 5,
        features: ['AC'],
        description: 'A reliable sedan',
        isActive: true,
        isRented: false,
        isApproved: true,
        paymentStatus: 'PAID' as const,
        owner: {
          _id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    it('successfully fetches owner cars', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCars,
        text: async () => JSON.stringify(mockCars),
      } as Response);

      const result = await apiService.getOwnerCars('token123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/cars/owner/my-cars'),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
          },
        }
      );

      expect(result).toEqual(mockCars);
    });

    it('handles API errors when fetching owner cars', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not Found',
      } as Response);

      await expect(apiService.getOwnerCars('token123')).rejects.toThrow('Failed to fetch owner cars');
    });
  });

  describe('getCars', () => {
    const mockCars = [
      {
        _id: 'car1',
        brand: 'Toyota',
        model: 'Camry',
        year: 2022,
        category: 'Sedan' as const,
        pricePerDay: 5000,
        images: ['image1.jpg'],
        location: 'Karachi',
        city: 'Karachi',
        engineCapacity: '2.0L',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '15 km/l',
        seating: 5,
        features: ['AC'],
        description: 'A reliable sedan',
        isActive: true,
        isRented: false,
        isApproved: true,
        paymentStatus: 'PAID' as const,
        owner: {
          _id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    it('successfully fetches all cars', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => mockCars,
        text: async () => JSON.stringify(mockCars),
      } as Response);

      const result = await apiService.getCars();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/cars'));
      expect(result).toEqual(mockCars);
    });

    it('handles invalid response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
        json: async () => mockCars,
        text: async () => JSON.stringify(mockCars),
      } as Response);

      await expect(apiService.getCars()).rejects.toThrow('Invalid response format - API may not be running');
    });

    it('handles empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => null,
        text: async () => '',
      } as Response);

      await expect(apiService.getCars()).rejects.toThrow('Empty response from API');
    });

    it('handles invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => { throw new Error('Invalid JSON'); },
        text: async () => 'invalid json',
      } as Response);

      await expect(apiService.getCars()).rejects.toThrow('Invalid JSON response from API');
    });
  });

  describe('Error Handling', () => {
    it('logs errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getCars()).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('API Error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});
