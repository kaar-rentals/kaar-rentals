# PR Summary: Fix Site Settings and Contact Endpoints

## Overview

Fixes 404 errors for `/api/site-settings` and 500 errors for `/api/cars/:id/contact` by adding robust endpoints with proper error handling.

## Changes Made

### 1. Site Settings Endpoint

**Files Created:**
- `backend/models/SiteSettings.js` - Mongoose model for site_settings collection
- `backend/routes/siteSettings.js` - Route handler for GET /api/site-settings
- `backend/migrations/20250104_add_site_settings.js` - Migration script

**Behavior:**
- Returns site settings from MongoDB `site_settings` collection
- Falls back to `process.env.LISTINGS_ENABLED` if collection doesn't exist
- Returns JSON: `{ listings_enabled: boolean, ... }`
- Handles type conversion (booleans, numbers) from string values
- Sets `Vary: Authorization` header

### 2. Contact Endpoints Fixed

**Files Updated:**
- `backend/routes/cars.js` - Fixed GET /api/cars/:id/contact
- `backend/routes/listings.js` - Fixed GET /api/listings/:id/contact

**Changes:**
- Changed missing owner from 500 → 404 with "Owner not found"
- Changed missing phone from 500 → 404 with "Owner phone not available"
- Improved error handling - all exceptions caught and return 500
- Removed sensitive data from logs
- Both endpoints use same robust handler logic

**Error Response Codes:**
- 401: Unauthenticated → `{ message: 'Authentication required' }`
- 404: Listing not found → `{ message: 'Listing not found' }`
- 404: Owner not found → `{ message: 'Owner not found' }`
- 404: Phone not available → `{ message: 'Owner phone not available' }`
- 500: Server error → `{ message: 'Internal server error' }`

**Security Headers:**
- `Vary: Authorization`
- `Cache-Control: private, max-age=0, no-store`

### 3. Server Configuration

**Files Updated:**
- `backend/server.js` - Added `/api/site-settings` route registration

### 4. Documentation

**Files Created:**
- `SMOKE_CONTACT_AND_SETTINGS.md` - Comprehensive smoke test instructions

## API Examples

### GET /api/site-settings
```bash
curl http://localhost:8080/api/site-settings
```
Response:
```json
{
  "listings_enabled": false
}
```

### GET /api/cars/:id/contact (Authenticated)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/cars/<id>/contact
```
Response (200):
```json
{
  "phone": "+92 300 1234567"
}
```

## Migration Instructions

Before deploying, run the migration to create the site_settings collection:

```bash
cd backend
node migrations/20250104_add_site_settings.js
```

This will:
- Create the `site_settings` collection if it doesn't exist
- Seed `listings_enabled` with default value `false` if not present
- Safe to run multiple times (idempotent)

## Smoke Test Checklist

See `SMOKE_CONTACT_AND_SETTINGS.md` for detailed instructions.

### Quick Test Checklist:

- [x] GET /api/site-settings returns 200 with listings_enabled
- [x] GET /api/cars/:id/contact (authenticated) returns 200 with phone
- [x] GET /api/cars/:id/contact (unauthenticated) returns 401
- [x] GET /api/cars/:id/contact (non-existent) returns 404
- [x] GET /api/cars/:id/contact (no owner) returns 404
- [x] GET /api/cars/:id/contact (no phone) returns 404
- [x] GET /api/listings/:id/contact works as alias
- [x] All exceptions handled gracefully (no 500 for expected errors)

## Breaking Changes

None - all changes are additive or fix existing behavior.

## Notes

- Site settings endpoint works even if collection doesn't exist (env fallback)
- Contact endpoints now return proper 404s instead of 500s for missing data
- All endpoints handle exceptions gracefully
- No sensitive data exposed in logs or error messages
- Both `/api/cars/:id/contact` and `/api/listings/:id/contact` use identical logic
