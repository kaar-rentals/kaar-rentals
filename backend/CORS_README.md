# CORS Configuration

The backend uses environment-based CORS configuration to allow requests from specific frontend origins.

## Environment Variable

Set `CORS_ORIGINS` in your environment (Render, Vercel, or `.env` file) as a comma-separated list of allowed origins:

```bash
CORS_ORIGINS=https://kaar.rentals,https://www.kaar.rentals,http://localhost:3000,http://localhost:5173
```

## Default Origins

If `CORS_ORIGINS` is not set, the following defaults are used:
- `https://kaar.rentals`
- `https://www.kaar.rentals`
- `http://localhost:3000`
- `http://localhost:5173`

## Setting in Render

1. Go to your Render dashboard
2. Select your backend service
3. Navigate to "Environment" tab
4. Add environment variable:
   - Key: `CORS_ORIGINS`
   - Value: `https://kaar.rentals,https://www.kaar.rentals,http://localhost:5173`
5. Save and redeploy

## Testing

Test CORS with curl:

```bash
curl -I -H "Origin: https://kaar.rentals" https://<your-backend>/api/cars?page=1
```

Expected response header: `Access-Control-Allow-Origin: https://kaar.rentals`

