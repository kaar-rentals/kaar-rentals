# Smoke Tests: Route Handler Fix

## Problem

Previously, the server would crash on startup with:
```
TypeError: argument handler must be a function
```

This occurred when route handlers were not proper functions (e.g., undefined, null, or objects).

## Fix

Added `asHandler` wrapper in `backend/routes/_routeHelpers.js` that:
- Coerces various export shapes into Express handler functions
- Provides clear error messages if handler cannot be converted
- Handles common patterns: default exports, named properties, etc.

## Verification Steps

### 1. Server Startup Test

**Before Fix:**
```bash
cd backend
node server.js
# Would crash with: TypeError: argument handler must be a function
```

**After Fix:**
```bash
cd backend
node server.js
# Should start successfully with: "🚀 Backend running on http://localhost:8080"
```

### 2. Route Registration Test

All routes should register without errors. Check console output for:
- ✅ No "argument handler must be a function" errors
- ✅ Routes mount successfully
- ✅ Server starts and listens on port

### 3. API Endpoint Test

Test that auth routes work:

```bash
# Test register endpoint
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Test login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Expected:**
- ✅ Register returns user object or error
- ✅ Login returns token and user object or error
- ✅ No crashes or "handler must be a function" errors

## Files Changed

- `backend/routes/_routeHelpers.js` - New helper file with `asHandler` function
- `backend/routes/auth.js` - Wrapped handlers with `asHandler`

## Notes

- The fix is defensive and doesn't change business logic
- If a handler truly isn't a function, `asHandler` throws a clear error with object keys
- Other route files (admin.js, payments.js, bookings.js) use controller functions but may need similar fixes if they encounter the same issue

