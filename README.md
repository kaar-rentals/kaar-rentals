# Kaar.Rentals - Luxury Car Rental Platform

A comprehensive car rental platform built for the Pakistani market, featuring car listing, booking, payment integration, and admin management.

## 🚀 Features

### For Car Owners
- **User Registration & Authentication**: Secure login/register system
- **Car Listing**: Add detailed car information with Pakistani market specifications
- **Payment Integration**: SafePay integration for listing fees
- **Car Management**: Toggle rental status, edit/delete listings
- **Owner Dashboard**: View all your cars and their status

### For Customers
- **Browse Cars**: Search and filter cars by brand, category, price
- **Car Details**: Detailed specifications and booking information
- **Booking System**: Reserve cars for specific dates
- **Pakistani Market**: All prices in PKR, fuel efficiency in km/L

### For Admins
- **Admin Panel**: Comprehensive dashboard with statistics
- **Car Approval**: Review and approve/reject car listings
- **User Management**: Manage user roles and permissions
- **Payment Monitoring**: Track payments and revenue

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
   MONGO_URI=mongodb://localhost:27017/kaar-rentals
   JWT_SECRET=your-jwt-secret
   SAFE_PAY_KEY=your-safepay-key
   SAFE_PAY_SECRET=your-safepay-secret
   BASE_URL=http://localhost:8080
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

6. **Seed the database** (optional):
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
- `GET /api/cars` - Get all approved cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create new car (requires auth + membership)
- `PUT /api/cars/:id` - Update car (owner only)
- `PATCH /api/cars/:id/toggle-rental` - Toggle rental status
- `DELETE /api/cars/:id` - Delete car (owner only)
- `GET /api/cars/owner/my-cars` - Get owner's cars

### Payments
- `POST /api/payments/create-membership` - Create membership payment
- `POST /api/payments/create-car-listing` - Create car listing payment
- `POST /api/payments/webhook` - SafePay webhook

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/cars/pending` - Get pending cars
- `PATCH /api/admin/cars/:id/approve` - Approve car
- `PATCH /api/admin/cars/:id/reject` - Reject car
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role

## 💰 Payment Flow

1. **Car Owner Registration**: User registers and gets 'user' role
2. **Membership Purchase**: User purchases membership to become 'owner'
3. **Car Listing**: Owner creates car listing (requires payment)
4. **Admin Approval**: Admin reviews and approves car listing
5. **Car Goes Live**: Approved car appears in public listings

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






