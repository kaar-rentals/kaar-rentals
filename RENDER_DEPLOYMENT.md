# Render Deployment Checklist

## Backend Deployment

1. **Create Web Service** on Render
   - Connect your GitHub repository
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Environment: Node 18

2. **Set Environment Variables:**
   ```
   PORT=10000 (auto-set by Render, but can override)
   FRONTEND_ORIGIN=https://your-frontend.onrender.com
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGINS=https://your-frontend.onrender.com,https://yourdomain.com (optional, FRONTEND_ORIGIN takes precedence)
   ```

3. **Clear Build Cache** (if issues occur):
   - Go to Settings → Clear Build Cache

## Frontend Deployment

1. **Create Static Site** on Render
   - Connect your GitHub repository
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

2. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=wss://your-backend.onrender.com (optional; leave empty to use same origin)
   ```

3. **Clear Build Cache** (if issues occur):
   - Go to Settings → Clear Build Cache

## Testing Commands

### Test Backend Locally
```bash
cd backend
FRONTEND_ORIGIN=http://localhost:5173 PORT=8080 node server.js
```

### Test Frontend Locally
```bash
cd frontend
VITE_API_URL=http://localhost:8080/api npm run dev
```

### Verify Socket Connection
- Open browser console
- Check for WebSocket connection errors
- Should connect to `wss://your-backend.onrender.com/socket.io/` in production

## Common Issues

1. **CORS Errors**: Ensure `FRONTEND_ORIGIN` matches your frontend URL exactly
2. **Socket Connection Failed**: Check that `VITE_SOCKET_URL` uses `wss://` (not `ws://`) for HTTPS sites
3. **API 404 Errors**: Verify `VITE_API_URL` includes `/api` suffix
4. **Build Failures**: Clear build cache and rebuild

