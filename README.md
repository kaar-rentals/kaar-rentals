# Kaar.Rentals - Luxury Car Rental Platform

A comprehensive car rental platform built for the Pakistani market, featuring car listing, booking, payment integration, and admin management.

## 🚀 Features

### For Car Owners
- **User Registration & Authentication**: Secure login/register system with unique IDs
- **Unique ID System**: Each user gets a unique 8-12 character alphanumeric ID
- **Public Profile**: Share your profile via unique ID (`/profile/:unique_id`)
- **Car Listing**: View your listings on your profile page
- **Listing Status Toggle**: Mark listings as available or rented

### For Customers
- **Browse Cars**: Search and filter cars by brand, category, price with pagination
- **Car Details**: Detailed specifications and booking information
- **Owner Contact**: View owner contact details when signed in (hidden for anonymous users)
- **Featured Listings**: Real-time featured cars on homepage
- **Lazy Loading**: Optimized image loading for better performance
- **Pakistani Market**: All prices in PKR, fuel efficiency in km/L

### For Admins
- **Admin-Only Listing Creation**: Only admins can create listings (free for admins)
- **Owner Assignment**: Admins can assign listings to any user via unique_id
- **Admin Panel**: Comprehensive dashboard with statistics (revenue section removed)
- **Car Approval**: Review and approve/reject car listings
- **User Management**: Manage user roles and permissions
- **Site Settings**: Toggle listings feature globally via database or environment variable

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **SafePay** for payment processing
- **bcryptjs** for password hashing

## 📁 Project Structure

```
kaar-rentals/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- SafePay account (for payments)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/kaarDB
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # SafePay Configuration
   SAFEPAY_KEY=your-safepay-api-key
   SAFEPAY_SECRET=your-safepay-secret
   SAFEPAY_SANDBOX=true
   SAFEPAY_WEBHOOK_SECRET=your-webhook-secret
   
   # Server
   PORT=8080
   NODE_ENV=development
   BASE_URL=http://localhost:8080
   FRONTEND_URL=http://localhost:5173
   
   # Site Settings (optional - defaults to DB value)
   LISTINGS_ENABLED=false
   ```

5. **Run database migrations**:
   ```bash
   node scripts/migrate-unique-id.js
   ```
   This will:
   - Add `unique_id` to all existing users
   - Add `is_admin` field to users
   - Create `site_settings` collection with `listings_enabled=false` default

6. **Start the server**:
   ```bash
   npm run dev
   ```

7. **Seed the database** (optional):
   ```bash
   curl -X POST http://localhost:8080/api/seed/seed
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   echo "VITE_API_URL=http://localhost:8080/api" > .env
   echo "VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name" >> .env
   echo "VITE_SHOW_TEST_CREDENTIALS=true" >> .env # set to false in production
   echo "VITE_LISTINGS_ENABLED=false" >> .env # optional, defaults to DB value
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔐 Accounts & Test Credentials

After seeding the database, default accounts may be created (see `backend/routes/seed.js`).

- Do not expose test credentials publicly in production builds.
- Frontend displays any dev test credentials only when `VITE_SHOW_TEST_CREDENTIALS==="true"`.
- Set `VITE_SHOW_TEST_CREDENTIALS=false` for production deployments.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Cars
- `GET /api/cars` - Get all approved cars (supports pagination: `limit`, `offset`, `featured`, `owner_unique_id`)
- `GET /api/cars/:id` - Get car by ID (owner contact hidden for unauthenticated users)
- `POST /api/cars` - Create new car (admin only, requires `owner_unique_id`)
- `PUT /api/cars/:id/status` - Update listing status (available/rented) - owner or admin
- `PATCH /api/cars/:id/status` - Same as PUT (backward compatibility)
- `DELETE /api/cars/:id` - Delete car (owner or admin)
- `GET /api/cars/owner/my-cars` - Get owner's cars

### User Profiles
- `GET /api/user/profile/:unique_id` - Get public user profile by unique_id
- `GET /api/user/listings` - Get authenticated user's listings

### Payments
- `POST /api/payments/create-membership` - Create membership payment
- `POST /api/payments/create-car-listing` - Create car listing payment
- `POST /api/payments/webhook` - SafePay webhook

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (revenue removed)
- `GET /api/admin/cars/pending` - Get pending cars
- `PATCH /api/admin/cars/:id/approve` - Approve car
- `PATCH /api/admin/cars/:id/reject` - Reject car
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role

### Site Settings
- `GET /api/site-settings` - Get site settings (public)
- `PUT /api/site-settings/:key` - Update site setting (admin only)

## 🔄 New Features (Latest Update)

### Admin Listing Management
- **Admin-Only Creation**: Only admins can create listings via `/list-car`
- **Owner Assignment**: Admins specify `owner_unique_id` when creating listings
- **Free for Admins**: Admin-created listings are free and auto-approved
- **Global Toggle**: Listings feature can be disabled globally via `site_settings.listings_enabled`

### User Unique IDs
- **Automatic Generation**: Every user gets a unique 8-12 character ID at registration
- **Public Profiles**: Users can share their profile via `/profile/:unique_id`
- **Profile Display**: Unique ID shown prominently on profile page
- **Listing Association**: Listings linked to users via `owner_id` appear on their profile

### Security & Privacy
- **Owner Contact Protection**: Owner contact details hidden for unauthenticated users
- **Login Modal**: Unauthenticated users see "Sign in to view owner details" button
- **No Redirect Loops**: Profile page accessible without forcing login

### Performance Improvements
- **Server-Side Pagination**: Listings support `limit` and `offset` parameters
- **Database Indexes**: Added indexes on `created_at`, `owner_id`, `featured`
- **Image Lazy Loading**: All images use `loading="lazy"` attribute
- **Response Compression**: Gzip compression enabled for all responses
- **Caching Headers**: Short TTL cache headers for listing GET requests

### UI/UX Improvements
- **Featured Section**: Homepage shows real-time featured listings from database
- **Status Toggle**: Listing owners can toggle between `available` and `rented`
- **Removed Elements**: Rating stars and "verified pics" text removed
- **Revenue Panel**: Removed from admin dashboard

## 💰 Payment Flow

1. **User Registration**: User registers and gets a `unique_id` automatically
2. **Admin Listing Creation**: Admin creates listing and assigns to user via `owner_unique_id`
3. **Listing Visibility**: Listing appears on assigned user's profile
4. **Status Management**: Owner or admin can toggle listing status (available/rented)

## 🎨 Pakistani Market Features

- **Currency**: All prices in Pakistani Rupees (PKR)
- **Fuel Efficiency**: Displayed in km/L instead of MPG
- **Fuel Type**: "Petrol" instead of "Gasoline"
- **Cities**: Karachi, Lahore, Islamabad support
- **Phone Numbers**: Pakistani format (+92)
- **WhatsApp Integration**: Direct WhatsApp contact

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm start
```

## 📦 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Heroku (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Environment Variables for Production
```env
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
SAFE_PAY_KEY=your-production-safepay-key
SAFE_PAY_SECRET=your-production-safepay-secret
BASE_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email kaar.rentals@gmail.com or contact us via WhatsApp at +923090017510.

## 🔮 Future Features

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Insurance integration
- [ ] GPS tracking
- [ ] Driver verification system






