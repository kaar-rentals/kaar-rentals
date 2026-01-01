# Smoke Tests: Final Profile Listing Fixes

## Prerequisites

1. Backend running on `http://localhost:8081` (or configured API URL)
2. Frontend running on `http://localhost:5173` (or configured frontend URL)
3. MongoDB connected and running

## Test Steps

### 1. Register with Phone Only (No Email)

**Steps:**
1. Navigate to `/auth`
2. Click "Register" tab
3. Fill in:
   - Name: "Test User"
   - Phone: "03001234567" (required)
   - Email: (leave empty - optional)
   - Password: "test123"
   - Confirm Password: "test123"
4. Click "Create Account"

**Expected:**
- ✅ Registration succeeds
- ✅ Token stored in localStorage
- ✅ User auto-logged in
- ✅ Redirected to home or profile

**Verify:**
```bash
# Check localStorage
localStorage.getItem('token') // Should return token
localStorage.getItem('user') // Should return user object with phone
```

---

### 2. My Cars Navigation

**Steps:**
1. While logged in, click "My Cars" button in header
2. Logout
3. Click "My Cars" button again

**Expected:**
- ✅ When logged in: navigates to `/profile/me`
- ✅ When not logged in: opens login modal or navigates to `/auth`

---

### 3. Profile Listings Auto-Refresh (Socket Event)

**Steps:**
1. Login as a regular user (e.g., "Test User" from step 1)
2. Navigate to `/profile/me`
3. Note: listings should be empty initially
4. As admin (or via API), create a listing with `owner_unique_id` set to the user's unique_id:
   ```bash
   curl -X POST http://localhost:8081/api/cars \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "brand": "Toyota",
       "model": "Corolla",
       "year": 2023,
       "category": "Sedan",
       "pricePerDay": 5000,
       "priceType": "daily",
       "owner_unique_id": "<user_unique_id>",
       ...
     }'
   ```

**Expected:**
- ✅ Listing appears in user's profile automatically (within 1-2 seconds)
- ✅ No manual page refresh required
- ✅ Socket event triggers refetch

**Verify:**
- Check browser console for: `[Socket] Listing created for this user, refetching...`
- Listing card appears in profile without refresh

---

### 4. Edit Price and PriceType

**Steps:**
1. On `/profile/me`, find a listing you own
2. Click edit icon (pencil) next to price
3. Update price: e.g., change from 5000 to 6000
4. Change priceType: select "monthly" from dropdown
5. Click save (checkmark icon)

**Expected:**
- ✅ Price updates immediately in UI
- ✅ PriceType changes to "/month"
- ✅ Success toast appears
- ✅ Changes persist after page reload

**Verify:**
```bash
# Fetch listing to verify persistence
curl http://localhost:8081/api/cars/<listing_id> \
  -H "Authorization: Bearer <token>"

# Should return: { price: 6000, priceType: "monthly", ... }
```

---

### 5. Toggle Status (Available ↔ Rented)

**Steps:**
1. On `/profile/me`, find a listing you own
2. Click "Change status" button
3. Observe badge color change

**Expected:**
- ✅ Badge changes from green "Available" to red "Rented" (or vice versa)
- ✅ Status persists after page reload
- ✅ Listing remains visible (not filtered out)
- ✅ Success toast appears

**Verify:**
- Badge shows correct color (green for available, red for rented)
- After reload, status persists
- API returns updated status: `{ status: "rented" }` or `{ status: "available" }`

---

### 6. Auth Persistence on Reload

**Steps:**
1. Login as any user
2. Navigate to `/profile/me`
3. Hard refresh page (Cmd+Shift+R or Ctrl+Shift+R)
4. Or close and reopen browser tab

**Expected:**
- ✅ User remains logged in
- ✅ Profile data loads automatically
- ✅ No redirect to signup/login page
- ✅ Listings are visible

**Verify:**
- Check localStorage still has token
- User object is restored
- Profile page shows user's name and listings

---

### 7. Contact Owner Endpoint

**Steps:**
1. As authenticated user, navigate to any car detail page
2. Click "Contact Owner" button
3. Verify phone number is displayed

**Expected:**
- ✅ Phone number is shown in modal
- ✅ Phone comes from owner's User document
- ✅ If owner has no phone, shows "Owner phone not available"

**Verify:**
```bash
# Test endpoint directly
curl http://localhost:8081/api/cars/<car_id>/contact \
  -H "Authorization: Bearer <token>"

# Expected: { "phone": "03001234567" }
```

---

### 8. Review UI Removed

**Steps:**
1. Navigate to any car detail page (`/car/:id`)
2. Check for review/rating elements

**Expected:**
- ✅ No star ratings visible
- ✅ No review forms
- ✅ No review lists
- ✅ No rating badges

**Verify:**
- Inspect page source - no review-related components
- No API calls to review endpoints

---

## Additional Checks

### Backend API Tests

```bash
# Test status update
curl -X PUT http://localhost:8081/api/cars/<id>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "rented"}'

# Test price update
curl -X PUT http://localhost:8081/api/cars/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"price": 7000, "priceType": "monthly"}'

# Test user profile
curl http://localhost:8081/api/user/me \
  -H "Authorization: Bearer <token>"
```

### Frontend Build Test

```bash
cd frontend
npm run build
# Should complete without errors
```

---

## Expected Results Summary

✅ All 8 smoke tests pass  
✅ Backend starts without errors  
✅ Frontend builds successfully  
✅ No console errors in browser  
✅ Socket events trigger refetch  
✅ Auth persists across reloads  

---

## Troubleshooting

**Issue:** Listings not appearing after creation
- Check socket connection in browser console
- Verify `owner_unique_id` matches user's unique_id
- Check network tab for API calls

**Issue:** Auth not persisting
- Check localStorage has token
- Verify `/api/user/me` endpoint returns user
- Check browser console for errors

**Issue:** Price editing not working
- Verify user is owner or admin
- Check API response for errors
- Verify price is positive number

