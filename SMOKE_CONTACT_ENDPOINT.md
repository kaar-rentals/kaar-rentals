# Smoke Tests for Contact Endpoint

## Prerequisites

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Ensure you have a test user and a listing created.

## Test Cases

### Test 1: Authenticated Request Returns Owner Phone

**Steps:**
1. Create or use an existing test user (e.g., Alice) with a phone number set
2. Create a listing with `owner_id` pointing to that user, or use an existing listing ID
3. Authenticate as any user (doesn't need to be the owner) to get a JWT token
4. Call the endpoint:
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

### Test 2: Unauthenticated Request Returns 401

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

### Test 3: Non-Existent Listing Returns 404

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

### Test 4: Alias Route /api/listings/:id/contact Works

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

### Test 5: Owner Without Phone Returns 500

**Steps:**
1. Create or find a listing with an owner that has no phone number set
2. Authenticate to get a JWT token
3. Call the endpoint for that listing:
   ```bash
   curl -X GET http://localhost:8080/api/cars/<LISTING_ID>/contact \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- Status: 500 Internal Server Error
- Response: `{ "message": "Server error: owner contact unavailable" }`
- Server logs should show a warning (without exposing sensitive data)

---

## Manual Test Results

Run the above tests and document results here:

### Test 1 Results:
- ✅ PASS / ❌ FAIL
- Response: `{ "phone": "..." }`
- Status Code: 200
- Headers verified: Vary, Cache-Control

### Test 2 Results:
- ✅ PASS / ❌ FAIL
- Response: `{ "message": "Authentication required" }`
- Status Code: 401

### Test 3 Results:
- ✅ PASS / ❌ FAIL
- Response: `{ "message": "Listing not found" }`
- Status Code: 404

### Test 4 Results:
- ✅ PASS / ❌ FAIL
- Alias route works correctly
- Status Code: 200

### Test 5 Results:
- ✅ PASS / ❌ FAIL
- Response: `{ "message": "Server error: owner contact unavailable" }`
- Status Code: 500

---

## Notes

- Ensure test users have phone numbers set in the database
- The endpoint should never return admin phone or placeholder values
- All sensitive data (phone numbers) should not appear in logs
- Cache-Control headers ensure the response is never cached publicly

