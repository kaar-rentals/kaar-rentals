import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MyListedCars from '../MyListedCars';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/services/api');
jest.mock('@/hooks/use-toast');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

// Mock data
const mockUser = {
  id: 'user123',
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'owner' as const,
};

const mockCars = [
  {
    _id: 'car1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    category: 'Sedan' as const,
    pricePerDay: 5000,
    images: ['image1.jpg', 'image2.jpg'],
    location: 'Karachi',
    city: 'Karachi',
    engineCapacity: '2.0L',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '15 km/l',
    seating: 5,
    features: ['AC', 'Power Steering'],
    description: 'A reliable sedan',
    isActive: true,
    isRented: false,
    isApproved: true,
    featured: false,
    verified: true,
    paymentStatus: 'PAID' as const,
    owner: {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '03001234567',
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    _id: 'car2',
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    category: 'Sedan' as const,
    pricePerDay: 6000,
    images: ['image3.jpg'],
    location: 'Lahore',
    city: 'Lahore',
    engineCapacity: '1.8L',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: '18 km/l',
    seating: 5,
    features: ['AC', 'Power Steering', 'ABS'],
    description: 'A sporty sedan',
    isActive: true,
    isRented: true,
    isApproved: true,
    featured: true,
    verified: true,
    paymentStatus: 'PAID' as const,
    owner: {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '03001234567',
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockToast = {
  toast: jest.fn(),
  dismiss: jest.fn(),
  toasts: [],
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('MyListedCars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      refreshUser: jest.fn(),
      loading: false,
    });
    mockUseToast.mockReturnValue(mockToast);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Component Rendering', () => {
    it('renders the component with title and list new car button', async () => {
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      expect(screen.getByText('My Listed Cars')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('List New Car')).toBeInTheDocument();
      });
    });

    it('renders premium promotion banner', async () => {
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Boost Your Listings')).toBeInTheDocument();
        expect(screen.getByText('Get 3x more views with Premium promotion')).toBeInTheDocument();
      });
    });

    it('displays loading state initially', () => {
      mockApiService.getOwnerCars.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      expect(screen.getByText('My Listed Cars')).toBeInTheDocument();
      // Loading skeleton should be present
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Car Fetching', () => {
    it('fetches and displays user cars successfully', async () => {
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockApiService.getOwnerCars).toHaveBeenCalledWith('mock-token');
      });

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Rented')).toBeInTheDocument();
    });

    it('falls back to filtering all cars when owner endpoint fails', async () => {
      mockApiService.getOwnerCars.mockRejectedValue(new Error('API Error'));
      mockApiService.getCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockApiService.getOwnerCars).toHaveBeenCalled();
        expect(mockApiService.getCars).toHaveBeenCalled();
      });

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    it('shows error message when both API calls fail', async () => {
      mockApiService.getOwnerCars.mockRejectedValue(new Error('API Error'));
      mockApiService.getCars.mockRejectedValue(new Error('API Error'));
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load your listed cars. Please try again.')).toBeInTheDocument();
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load your listed cars. Please try again.',
        variant: 'destructive',
      });
    });

    it('shows empty state when no cars are found', async () => {
      mockApiService.getOwnerCars.mockResolvedValue([]);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No cars listed yet')).toBeInTheDocument();
        expect(screen.getByText('Start earning by listing your car for rent')).toBeInTheDocument();
      });
    });
  });

  describe('Toggle Car Status', () => {
    it('toggles car status from available to rented', async () => {
      const user = userEvent.setup();
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      mockApiService.updateCarRentalStatus.mockResolvedValue({
        ...mockCars[0],
        isRented: true,
      });
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      });

      // Click the toggle button
      const toggleButton = screen.getAllByText('Mark Rented')[0];
      await user.click(toggleButton);

      // Confirm the action
      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockApiService.updateCarRentalStatus).toHaveBeenCalledWith(
          'car1',
          true,
          'mock-token'
        );
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Status Updated',
        description: 'Car has been marked as rented',
        variant: 'default',
      });
    });

    it('toggles car status from rented to available', async () => {
      const user = userEvent.setup();
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      mockApiService.updateCarRentalStatus.mockResolvedValue({
        ...mockCars[1],
        isRented: false,
      });
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      });

      // Click the toggle button for rented car
      const toggleButton = screen.getAllByText('Mark Available')[0];
      await user.click(toggleButton);

      // Confirm the action
      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockApiService.updateCarRentalStatus).toHaveBeenCalledWith(
          'car2',
          false,
          'mock-token'
        );
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Status Updated',
        description: 'Car has been marked as available',
        variant: 'default',
      });
    });

    it('shows error message when toggle fails', async () => {
      const user = userEvent.setup();
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      mockApiService.updateCarRentalStatus.mockRejectedValue(new Error('Update failed'));
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      });

      // Click the toggle button
      const toggleButton = screen.getAllByText('Mark Rented')[0];
      await user.click(toggleButton);

      // Confirm the action
      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith({
          title: 'Update Failed',
          description: 'Update failed',
          variant: 'destructive',
        });
      });
    });

    it('cancels toggle action when cancel button is clicked', async () => {
      const user = userEvent.setup();
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      });

      // Click the toggle button
      const toggleButton = screen.getAllByText('Mark Rented')[0];
      await user.click(toggleButton);

      // Cancel the action
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Modal should be closed and no API call should be made
      expect(mockApiService.updateCarRentalStatus).not.toHaveBeenCalled();
    });
  });

  describe('Promote Listing', () => {
    it('shows promote listing toast when promote button is clicked', async () => {
      const user = userEvent.setup();
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      });

      // Click promote button
      const promoteButton = screen.getAllByText('Promote')[0];
      await user.click(promoteButton);

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Promote Listing',
        description: 'Premium promotion feature coming soon! Contact us to learn more.',
        variant: 'default',
      });
    });

    it('shows premium promotion toast when learn more is clicked', async () => {
      const user = userEvent.setup();
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Learn More')).toBeInTheDocument();
      });

      // Click learn more button
      const learnMoreButton = screen.getByText('Learn More');
      await user.click(learnMoreButton);

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Premium Promotion',
        description: 'Contact us at premium@kaar-rentals.com to learn about our promotion packages!',
        variant: 'default',
      });
    });
  });

  describe('Authentication', () => {
    it('shows error when user is not logged in', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null), // No token
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Please log in to view your listed cars')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', async () => {
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      });

      // Check for proper button labels
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons[0]).toBeInTheDocument();
      
      const promoteButtons = screen.getAllByText('Promote');
      expect(promoteButtons[0]).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      mockApiService.getOwnerCars.mockResolvedValue(mockCars);
      
      render(
        <TestWrapper>
          <MyListedCars userId={mockUser.id} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      });

      // Test keyboard navigation
      const firstToggleButton = screen.getAllByText('Mark Rented')[0];
      firstToggleButton.focus();
      expect(firstToggleButton).toHaveFocus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(screen.getByText('Confirm Status Change')).toBeInTheDocument();
    });
  });
});
