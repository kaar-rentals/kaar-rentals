# Smoke Tests - Feature Fix Issues 2

## Prerequisites

1. Run the database migration:
   ```bash
   cd backend
   node migrations/20250101_fix_owners_and_featured.js
   ```

2. Start backend server:
   ```bash
   cd backend
   npm start
   ```

3. Start frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

## Test Cases

### 1. Profile Page Shows User Name

**Steps:**
1. Create a user "Alice" with email `alice@test.com` and ensure they have a `name` field set (e.g., "Alice Smith")
2. Navigate to `/profile` (own profile) or `/profile/:unique_id` (public profile)
3. Verify the user's full name appears at the top of the page

**Expected:** User's name is displayed prominently at the top

---

### 2. Owner Details Visible Only When Authenticated

**Steps:**
1. As an unauthenticated visitor, navigate to a car listing detail page
2. Verify owner name and location are NOT visible
3. Verify "Sign in to view owner details" button is visible
4. Click the button - login modal should appear
5. Log in as any user
6. Refresh the page
7. Verify owner name and location are now visible

**Expected:** 
- Unauthenticated: Owner details hidden, login button visible
- Authenticated: Owner name and location visible

---

### 3. Contact Owner Button Functionality

**Steps:**
1. As an unauthenticated visitor, go to a car detail page
2. Click "Contact Owner" button
3. Verify login modal appears
4. Log in as any user
5. Click "Contact Owner" button again
6. Verify a modal appears showing the owner's phone number
7. Verify WhatsApp and Call buttons work correctly

**Expected:**
- Unauthenticated: Opens login modal
- Authenticated: Shows owner phone in modal with action buttons

---

### 4. Real-Time Listing Updates via Socket

**Steps:**
1. Create two users: "Alice" (regular) and "AdminBob" (is_admin=true)
2. Ensure Alice has `unique_id`, `name`, and `phone` set
3. Open Alice's profile page in a browser tab: `/profile/:alice_unique_id`
4. As AdminBob, create a listing with:
   - `owner_unique_id` = Alice's unique_id
   - `featured` = true
5. Verify the listing appears on Alice's profile page WITHOUT manual refresh
6. Check browser console for socket event logs: `[Socket] Emitted listing:created`

**Expected:** Listing appears immediately on Alice's profile without refresh

---

### 5. Status Toggle in User's Listings

**Steps:**
1. Log in as a user who owns listings
2. Navigate to `/profile` (your own profile)
3. Find a listing you own
4. Verify status toggle is visible (Available/Rented)
5. Click the toggle to change status
6. Verify status updates and toast notification appears

**Expected:** Status toggle visible and functional for listing owners

---

### 6. Admin Can Create Listings When listings_enabled is False

**Steps:**
1. Log in as an admin user
2. Navigate to `/list-car`
3. Verify admin form is visible with:
   - Owner Unique ID field
   - Featured checkbox
4. Fill in the form including `owner_unique_id` of an existing user
5. Check "Feature this listing"
6. Submit the form
7. Verify listing is created successfully

**Expected:** Admin can create listings even if global setting is disabled

---

### 7. About Page Animated Stats

**Steps:**
1. Navigate to `/about`
2. Scroll to "By the Numbers" section
3. Verify counters start at 0
4. As the section enters viewport, verify numbers animate upward
5. Verify final numbers match actual counts:
   - Users count
   - Listings count
   - Featured count

**Expected:** Numbers animate from 0 to actual values when section is visible

---

### 8. Featured Listings on Homepage

**Steps:**
1. As admin, create a listing with `featured=true`
2. Navigate to homepage (`/`)
3. Scroll to "Featured Vehicles" section
4. Verify the featured listing appears in the featured section
5. Verify it shows the "Featured" badge/ribbon

**Expected:** Only listings with `featured=true` appear in featured section

---

### 9. Owner Phone is Correct (Not Admin Phone)

**Steps:**
1. As admin, create a listing for user "Alice" (with Alice's unique_id)
2. Ensure Alice has a phone number set in her profile
3. Log in as a different user (not admin, not Alice)
4. Navigate to the listing created in step 1
5. Click "Contact Owner"
6. Verify the phone number shown is Alice's phone, NOT admin's phone

**Expected:** Contact shows the actual owner's phone, not admin's

---

### 10. ListingCard Shows Owner Info Conditionally

**Steps:**
1. As unauthenticated visitor, browse car listings
2. Verify listing cards do NOT show owner name/location
3. Verify "Sign in to view owner details" text/button is visible
4. Log in as any user
5. Refresh listings page
6. Verify owner name and location now appear on listing cards

**Expected:** Owner info only visible when authenticated

---

## Notes

- All socket events should be logged in browser console with prefix `[Socket]`
- If any test fails, check:
  - Browser console for errors
  - Backend logs for API errors
  - Network tab for failed requests
  - Database to verify data exists

## Known Issues

None at this time.

