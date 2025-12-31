# Smoke Tests for Site Settings and Contact Endpoints

## Prerequisites

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Run the migration (if not already done):
   ```bash
   node migrations/20250104_add_site_settings.js
   ```

3. Ensure you have a test user and a listing created.

## Test Cases

### Test 1: Site Settings Endpoint Returns Settings

**Steps:**
1. Call the endpoint:
   ```bash
   curl -i http://localhost:8080/api/site-settings
   ```

**Expected Result:**
- Status: 200 OK
- Response: JSON object with at least `listings_enabled` key
- Example: `{ "listings_enabled": false }`
- Headers include: `Vary: Authorization`

**Notes:**
- If site_settings collection doesn't exist, should fall back to `process.env.LISTINGS_ENABLED`
- If collection exists but listings_enabled is not set, should default to `false`

---

### Test 2: Contact Endpoint Returns Owner Phone (Authenticated)

**Steps:**
1. Authenticate as any user to get a JWT token
2. Create or use an existing listing with an owner that has a phone number
3. Call the endpoint:
   ```bash
   curl -X GET http://localhost:8080/api/cars/<LISTING_ID>/contact \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- Status: 200 OK
- Response: `{ "phone": "<owner_phone>" }`
- Headers include:
  - `Vary: Authorization`
  - `Cache-Control: private, max-age=0, no-store`

---

### Test 3: Contact Endpoint Returns 401 (Unauthenticated)

**Steps:**
1. Call the endpoint without authentication:
   ```bash
   curl -X GET http://localhost:8080/api/cars/<LISTING_ID>/contact \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- Status: 401 Unauthorized
- Response: `{ "message": "Authentication required" }`

---

### Test 4: Contact Endpoint Returns 404 (Non-existent Listing)

**Steps:**
1. Authenticate to get a JWT token
2. Call the endpoint with a non-existent listing ID:
   ```bash
   curl -X GET http://localhost:8080/api/cars/000000000000000000000000/contact \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- Status: 404 Not Found
- Response: `{ "message": "Listing not found" }`

---

### Test 5: Contact Endpoint Returns 404 (Owner Not Found)

**Steps:**
1. Create a listing with an owner_id that doesn't exist in users collection (or manually set owner to invalid ObjectId)
2. Authenticate to get a JWT token
3. Call the endpoint for that listing:
   ```bash
   curl -X GET http://localhost:8080/api/cars/<LISTING_ID>/contact \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- Status: 404 Not Found
- Response: `{ "message": "Owner not found" }`

---

### Test 6: Contact Endpoint Returns 404 (Owner Phone Not Available)

**Steps:**
1. Create or find a listing with an owner that has no phone number set (phone is null/empty)
2. Authenticate to get a JWT token
3. Call the endpoint for that listing:
   ```bash
   curl -X GET http://localhost:8080/api/cars/<LISTING_ID>/contact \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- Status: 404 Not Found
- Response: `{ "message": "Owner phone not available" }`

---

### Test 7: Alias Route /api/listings/:id/contact Works

**Steps:**
1. Authenticate to get a JWT token
2. Call the alias endpoint:
   ```bash
   curl -X GET http://localhost:8080/api/listings/<LISTING_ID>/contact \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- Status: 200 OK
- Response: `{ "phone": "<owner_phone>" }`
- Same behavior as /api/cars/:id/contact

---

### Test 8: Contact Endpoint Handles Exceptions Gracefully

**Steps:**
1. This test verifies that unhandled exceptions return 500
2. The endpoint should never throw unhandled exceptions
3. All errors should be caught and return appropriate status codes

**Expected Result:**
- No unhandled exceptions
- All errors return proper HTTP status codes (401, 404, or 500)
- Error messages don't expose sensitive information

---

## Manual Test Results

Run the above tests and document results here:

### Test 1 Results (Site Settings):
- ✅ PASS / ❌ FAIL
- Response: `{ "listings_enabled": ... }`
- Status Code: 200

### Test 2 Results (Authenticated Contact):
- ✅ PASS / ❌ FAIL
- Response: `{ "phone": "..." }`
- Status Code: 200
- Headers verified: Vary, Cache-Control

### Test 3 Results (Unauthenticated Contact):
- ✅ PASS / ❌ FAIL
- Response: `{ "message": "Authentication required" }`
- Status Code: 401

### Test 4 Results (Non-existent Listing):
- ✅ PASS / ❌ FAIL
- Response: `{ "message": "Listing not found" }`
- Status Code: 404

### Test 5 Results (Owner Not Found):
- ✅ PASS / ❌ FAIL
- Response: `{ "message": "Owner not found" }`
- Status Code: 404

### Test 6 Results (Phone Not Available):
- ✅ PASS / ❌ FAIL
- Response: `{ "message": "Owner phone not available" }`
- Status Code: 404

### Test 7 Results (Alias Route):
- ✅ PASS / ❌ FAIL
- Alias route works correctly
- Status Code: 200

### Test 8 Results (Exception Handling):
- ✅ PASS / ❌ FAIL
- No unhandled exceptions
- All errors return proper status codes

---

## Notes

- Site settings endpoint should work even if the site_settings collection doesn't exist (falls back to env)
- Contact endpoint should never return 500 for missing owner/phone (should return 404)
- All endpoints should handle exceptions gracefully
- No sensitive data (phone numbers) should appear in logs
- Cache-Control headers ensure contact responses are never cached publicly

