# Kaar.Rentals Backend Production Deployment Guide

## Current Issue
The frontend is deployed to `https://www.kaar.rentals` but the backend is running locally on `http://localhost:8080`. This causes CORS errors because:
1. Production frontend cannot access localhost
2. Need to deploy backend to production server

## Solutions

### Option 1: Deploy Backend to Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the backend folder
4. Set environment variables:
   ```
   PORT=8080
   FRONTEND_URL=https://www.kaar.rentals
   MONGO_URI=mongodb+srv://kaarrentals_db-user:Jhb9eGKbmCzARTpq@kaar-rentalscluster.vmeqg24.mongodb.net/kaarDB
   MONGO_DBNAME=kaarDB
   JWT_SECRET=8f0a92c5d7b14836b1d2f4e9c7a3f0e4!KaarRentals@2025#Secure
   SAFE_PUBLIC_KEY=sec_167c5fcd-b873-4980-bfd9-5a80fbff8589
   SAFE_SECRET_KEY=44dcd730dc85766e8dfae69d08a5744654420b6b29e70b7d866df1711b9c830a
   SAFE_ENV=production
   ```

### Option 2: Deploy Backend to Render
1. Go to [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Set environment variables (same as above)

### Option 3: Deploy Backend to Heroku
1. Go to [Heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repository
4. Set environment variables (same as above)

## Update Frontend API URL
After deploying the backend, update the frontend API URL:

1. In `frontend/src/services/api.ts`, change:
   ```typescript
   const API_BASE_URL = 'http://localhost:8080';
   ```
   to:
   ```typescript
   const API_BASE_URL = 'https://your-backend-url.railway.app'; // or your deployed URL
   ```

2. Redeploy the frontend to Vercel

## Current Status
✅ CORS configuration updated for production domain
✅ Backend working locally with MongoDB
✅ Authentication and cars endpoints functional
❌ Backend needs production deployment
❌ Frontend API URL needs updating

## Test Credentials
- Admin: `admin@kaar.rentals` / `admin123`
- Owner: `owner@kaar.rentals` / `owner123`





