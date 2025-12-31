# Smoke Tests: Phone Number Saving Fix

## Prerequisites

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Ensure you have test users:
   - Alice (regular user)
   - Bob (admin user with is_admin=true)

## Test Cases

### Test 1: Registration Saves Phone

**Steps:**
1. Register a new user with phone:
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "TestUser",
       "email": "test@example.com",
       "password": "password123",
       "phone": "+92 300 1234567"
     }'
   ```

2. Verify user was created with phone:
   ```bash
   # Login to get token, then check user profile
   curl -X GET http://localhost:8080/api/auth/me \
     -H "Authorization: Bearer <TOKEN>"
   ```

**Expected Result:**
- ✅ User created successfully
- ✅ User.phone = "+92 300 1234567" in database
- ✅ Phone visible in profile response

---

### Test 2: Profile Edit Saves Phone

**Steps:**
1. Login as Alice (or any user)
2. Navigate to Profile page
3. Click "Edit" button
4. Update phone field with new value: "+92 300 9999999"
5. Click "Save"

**Expected Result:**
- ✅ Profile updated successfully
- ✅ Phone saved to User document in database
- ✅ UI shows updated phone immediately
- ✅ Phone persists after page refresh

---

### Test 3: Admin Creates Listing Without owner_phone (Owner Has Phone)

**Steps:**
1. Ensure Alice has a phone number set in her User document
2. Login as admin Bob
3. Navigate to List Car page
4. Fill in listing form
5. Set `owner_unique_id` = Alice's unique_id
6. Leave `owner_phone` field empty
7. Submit form

**Expected Result:**
- ✅ Listing created successfully
- ✅ Listing.owner points to Alice's User._id
- ✅ Alice's phone remains unchanged in database
- ✅ Contact endpoint returns Alice's existing phone

---

### Test 4: Admin Creates Listing With owner_phone (Owner Has No Phone)

**Steps:**
1. Create or find a user (Charlie) with no phone number (phone = null or empty)
2. Login as admin Bob
3. Navigate to List Car page
4. Fill in listing form
5. Set `owner_unique_id` = Charlie's unique_id
6. Set `owner_phone` = "+92 300 8888888"
7. Submit form

**Expected Result:**
- ✅ Listing created successfully
- ✅ Listing.owner points to Charlie's User._id
- ✅ Charlie's phone saved to User document: "+92 300 8888888"
- ✅ Contact endpoint returns Charlie's phone

---

### Test 5: Admin Creates Listing With owner_phone (Owner Already Has Phone)

**Steps:**
1. Ensure Alice has phone: "+92 300 1234567"
2. Login as admin Bob
3. Create listing for Alice with `owner_phone` = "+92 300 9999999"

**Expected Result:**
- ✅ Listing created successfully
- ✅ Alice's phone remains "+92 300 1234567" (not overwritten)
- ✅ Contact endpoint returns Alice's original phone

---

### Test 6: Contact Endpoint Reads From User Document

**Steps:**
1. Create listing with owner that has phone
2. Authenticate as any user
3. Call contact endpoint:
   ```bash
   curl -X GET http://localhost:8080/api/cars/<LISTING_ID>/contact \
     -H "Authorization: Bearer <TOKEN>"
   ```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response: `{ "phone": "<owner_phone_from_user_document>" }`
- ✅ Phone matches what's stored in User.phone (not from listing)

---

### Test 7: Contact Endpoint Returns 404 When Phone Missing

**Steps:**
1. Create listing with owner that has no phone (phone = null)
2. Authenticate and call contact endpoint

**Expected Result:**
- ✅ Status: 404 Not Found
- ✅ Response: `{ "message": "Owner phone not available" }`

---

### Test 8: Owner Info Visibility in Listings

**Steps:**
1. As unauthenticated visitor, GET /api/cars
2. As authenticated user, GET /api/cars

**Expected Result:**
- ✅ Unauthenticated: owner.name and owner.location are null
- ✅ Authenticated: owner.name and owner.location are visible
- ✅ Phone never exposed in listing responses (only via contact endpoint)

---

### Test 9: No Phone Values in Logs

**Steps:**
1. Perform various operations (create listing, update profile, contact endpoint)
2. Check server logs

**Expected Result:**
- ✅ No phone numbers appear in console logs
- ✅ Error logs don't expose phone values
- ✅ Only safe identifiers (listing ID, user ID) in logs

---

## Manual Test Results

Run the above tests and document results here:

### Test 1 Results (Registration):
- ✅ PASS / ❌ FAIL
- Phone saved: Yes/No
- Database verified: Yes/No

### Test 2 Results (Profile Edit):
- ✅ PASS / ❌ FAIL
- Phone updated: Yes/No
- UI reflects change: Yes/No

### Test 3 Results (Admin Create - Owner Has Phone):
- ✅ PASS / ❌ FAIL
- Owner phone unchanged: Yes/No
- Listing created: Yes/No

### Test 4 Results (Admin Create - Owner No Phone):
- ✅ PASS / ❌ FAIL
- Owner phone saved: Yes/No
- Phone value: "..."

### Test 5 Results (Admin Create - Owner Has Phone, Admin Provides):
- ✅ PASS / ❌ FAIL
- Owner phone unchanged: Yes/No
- Original phone preserved: Yes/No

### Test 6 Results (Contact Endpoint):
- ✅ PASS / ❌ FAIL
- Phone returned: Yes/No
- Matches User document: Yes/No

### Test 7 Results (Contact - No Phone):
- ✅ PASS / ❌ FAIL
- Returns 404: Yes/No
- Error message correct: Yes/No

### Test 8 Results (Owner Info Visibility):
- ✅ PASS / ❌ FAIL
- Unauthenticated hides info: Yes/No
- Authenticated shows info: Yes/No

### Test 9 Results (No Phone in Logs):
- ✅ PASS / ❌ FAIL
- No phone in logs: Yes/No

---

## Notes

- Phone is source of truth in User document, never stored on listing
- Admin can only set owner phone if owner doesn't have one
- Contact endpoint always reads from User.phone
- All phone operations are idempotent
- No sensitive data exposed in logs

