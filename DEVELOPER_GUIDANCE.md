# Kaar Rentals - Developer Guidance

## 🚗 Project Overview

Kaar Rentals is a premium peer-to-peer car rental platform built with React, TypeScript, and Tailwind CSS. This guide provides comprehensive information for developers working on the project.

## 📁 Key Files to Edit

### Core Components

#### 1. **Card Components**
- **`src/components/cars/FeaturedCarCard.tsx`** - Premium car card with BMW-style design
- **`src/components/ListingCard.jsx`** - Alternative card component for listings
- **`src/components/cars/StatusBadge.tsx`** - Reusable status badge component

**Key Features:**
- Responsive grid layout (1/2/3/4 columns)
- Featured car treatment with gold outline
- Image carousel with navigation
- Accessibility features (ARIA labels, keyboard focus)
- Premium typography and spacing

#### 2. **Page Components**
- **`src/pages/Cars.tsx`** - Main cars listing page
- **`src/pages/CarDetails.tsx`** - Detailed car view (PakWheels/Airbnb style)
- **`src/pages/OwnerProfile.tsx`** - Car owner dashboard
- **`src/pages/ListCar.tsx`** - Car listing form

#### 3. **Helper Components**
- **`src/components/cars/FullScreenCarModal.tsx`** - Full-screen car modal
- **`src/components/cars/ImageCarousel.tsx`** - Reusable image carousel
- **`src/components/MyListedCars.tsx`** - Owner's car management

### Legal & Navigation

#### 4. **Legal Pages**
- **`src/pages/PrivacyPolicy.tsx`** - Privacy policy page
- **`src/pages/TermsOfService.tsx`** - Terms of service page
- **`src/components/layout/Footer.tsx`** - Footer with legal links

#### 5. **Routing**
- **`src/App.tsx`** - Main app routes configuration

## 🎨 Styling System

### Tailwind CSS Configuration
- **`tailwind.config.ts`** - Tailwind configuration with custom colors and plugins
- **`@tailwindcss/line-clamp`** - Plugin for text truncation

### Design System
```typescript
// Color Palette
primary: 'hsl(var(--primary))'
secondary: 'hsl(var(--secondary))'
accent: 'hsl(var(--accent))'
muted: 'hsl(var(--muted))'

// Spacing
gap-6: 1.5rem (24px)
p-6: 1.5rem (24px)
space-y-4: 1rem (16px)

// Border Radius
rounded-xl: 12px
rounded-lg: 8px
```

## 🔧 API Integration

### API Service
- **`src/services/api.ts`** - Centralized API service with error handling

### Key Methods
```typescript
// Car Operations
getCars(): Promise<Car[]>
getCarById(id: string): Promise<Car>
updateCarRentalStatus(id: string, isRented: boolean, token: string): Promise<Car>
getOwnerCars(token: string): Promise<Car[]>

// Error Handling
- 401: Authentication required
- 403: Owner authorization required
- Toast notifications for user feedback
```

## 🚀 Implementation Guidelines

### 1. Card Design Standards

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {cars.map(car => <FeaturedCarCard key={car._id} car={car} />)}
</div>
```

#### Featured Car Treatment
```tsx
<div className={`border ${
  car.featured 
    ? 'border-amber-200 ring-1 ring-amber-100' 
    : 'border-gray-100'
}`}>
  {car.featured && (
    <div className="absolute top-0 right-0 z-10">
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
        <Crown className="h-3 w-3 inline mr-1" />
        Featured
      </div>
    </div>
  )}
</div>
```

### 2. Accessibility Standards

#### ARIA Labels
```tsx
<Link 
  to={`/car/${car._id}/details`}
  aria-label={`View details for ${car.brand} ${car.model} - ${car.year} ${car.category}`}
>
```

#### Keyboard Focus
```tsx
<button 
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
  tabIndex={0}
  aria-label="Previous image"
>
```

#### Image Alt Text
```tsx
<img 
  src={car.image}
  alt={`${car.brand} ${car.model} ${car.year} - ${car.category} car for rent`}
  loading="lazy"
  role="img"
/>
```

### 3. State Management

#### Optimistic Updates
```tsx
// Update UI immediately
setCars(prevCars => 
  prevCars.map(car => 
    car._id === carId ? { ...car, isRented: newStatus } : car
  )
);

// API call
await apiService.updateCarRentalStatus(carId, newStatus, token);

// Revert on error
catch (error) {
  await loadMyCars(); // Reload from server
}
```

### 4. Error Handling

#### Toast Notifications
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({
  title: "Status Updated",
  description: `Car has been marked as ${newStatus ? 'rented' : 'available'}`,
  variant: "default",
});

// Error
toast({
  title: "Update Failed",
  description: errorMessage,
  variant: "destructive",
});
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 640px` (1 column)
- **Tablet**: `640px - 1024px` (2 columns)
- **Desktop**: `1024px - 1280px` (3 columns)
- **Large**: `> 1280px` (4 columns)

### Mobile-First Approach
```tsx
// Start with mobile, add larger breakpoints
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

## 🔐 Security Considerations

### Authentication
- Bearer token in Authorization header
- Token validation before API calls
- Automatic logout on 401 responses

### Authorization
- Owner-only actions require ownership verification
- Server-side validation for all sensitive operations
- Clear error messages for unauthorized access

## 🧪 Testing Guidelines

### Component Testing
```tsx
// Test accessibility
expect(screen.getByRole('img')).toHaveAttribute('alt', expect.stringContaining('car for rent'));

// Test interactions
fireEvent.click(screen.getByLabelText('Add to favorites'));
expect(mockToggleFavorite).toHaveBeenCalled();
```

### API Testing
```tsx
// Mock API responses
jest.mock('@/services/api', () => ({
  apiService: {
    updateCarRentalStatus: jest.fn().mockResolvedValue(mockCar),
  },
}));
```

## 🚀 Deployment

### Environment Variables
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Kaar Rentals
```

### Build Commands
```bash
npm run build
npm run preview
```

## 📚 Additional Resources

### Documentation
- [React Router v6](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

### Code Style
- Use TypeScript for all new components
- Follow existing naming conventions
- Use functional components with hooks
- Implement proper error boundaries

## 🐛 Common Issues & Solutions

### 1. Image Loading
```tsx
// Always provide fallback
<img 
  src={car.image || '/placeholder-car.jpg'}
  alt="Car image"
  loading="lazy"
/>
```

### 2. State Updates
```tsx
// Use functional updates for state
setCars(prevCars => prevCars.map(car => 
  car._id === id ? { ...car, isRented: !car.isRented } : car
));
```

### 3. Route Parameters
```tsx
// Always handle missing parameters
const { id } = useParams();
if (!id) {
  return <Navigate to="/cars" replace />;
}
```

## 📞 Support

For questions or issues, contact:
- **Email**: dev@kaar-rentals.com
- **Slack**: #kaar-rentals-dev
- **Documentation**: [Internal Wiki](https://wiki.kaar-rentals.com)

---

**Last Updated**: December 2024
**Version**: 1.0.0
