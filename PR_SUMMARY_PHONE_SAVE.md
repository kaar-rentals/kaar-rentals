# PR Summary: Fix Phone Number Saving to User Document

## Overview

Fixes the root cause where phone numbers are not saved for ads in MongoDB. Phone numbers are now properly stored in the User document (source of truth) and never duplicated on listings.

## Changes Made

### Backend

1. **User Model** (`backend/models/User.js`)
   - Ensured phone field has `trim: true` and `default: null`
   - Phone is the source of truth in User document

2. **Registration** (`backend/controllers/authController.js`)
   - Registration now accepts `phone` in request body
   - Phone saved to User document when provided

3. **Profile Update** (`backend/routes/user.js`)
   - PUT /api/user/me already updates phone correctly
   - No changes needed (already working)

4. **Admin Create Listing** (`backend/routes/cars.js`)
   - When admin creates listing with `owner_unique_id` and `owner_phone`:
     - If owner has no phone AND `owner_phone` provided → save to owner's User document
     - If owner already has phone → ignore `owner_phone` (don't overwrite)
   - Phone never stored on listing, only in User document

5. **Contact Endpoints** (`backend/routes/cars.js`, `backend/routes/listings.js`)
   - Already read from User.phone (no changes needed)
   - Return 404 if owner or phone not found
   - Never expose phone in listing responses (only via contact endpoint)

### Frontend

1. **Profile Edit** (`frontend/src/pages/Profile.tsx`)
   - Already includes phone field in edit form
   - Already saves phone via PUT /api/user/me
   - No changes needed (already working)

2. **Admin Create Listing** (`frontend/src/pages/ListCar.tsx`)
   - Added optional `owner_phone` input field in admin settings section
   - Field only visible to admins
   - Sends `owner_phone` in payload (server decides whether to save)
   - Helpful text explains: "If the owner doesn't have a phone number set, this will be saved to their profile"

## Key Behaviors

### Phone Storage
- ✅ Phone stored ONLY in User document (never on listing)
- ✅ User.phone is source of truth
- ✅ Contact endpoints read from User.phone

### Admin Behavior
- ✅ Admin can set owner phone ONLY if owner has no phone
- ✅ Admin cannot overwrite existing owner phone
- ✅ Admin must provide `owner_unique_id` to create listing

### Security
- ✅ Phone never exposed in listing responses
- ✅ Phone only accessible via authenticated contact endpoint
- ✅ No phone values in server logs
- ✅ Proper error handling (404 for missing phone, not 500)

## API Changes

### POST /api/auth/register
**New:** Accepts optional `phone` field
```json
{
  "name": "User",
  "email": "user@example.com",
  "password": "password",
  "phone": "+92 300 1234567"  // Optional
}
```

### POST /api/cars (Admin Only)
**New:** Accepts optional `owner_phone` field
```json
{
  "owner_unique_id": "abc123",
  "owner_phone": "+92 300 1234567",  // Optional, only used if owner has no phone
  "brand": "Toyota",
  // ... other fields
}
```

### GET /api/cars/:id/contact
**Unchanged:** Already reads from User.phone
- Returns 404 if owner has no phone
- Returns 200 with `{ phone: "<owner_phone>" }` if phone exists

## Files Changed

**Backend:**
- `backend/models/User.js` - Phone field with trim and default
- `backend/controllers/authController.js` - Registration accepts phone
- `backend/routes/cars.js` - Admin create saves owner_phone to User if missing

**Frontend:**
- `frontend/src/pages/ListCar.tsx` - Added owner_phone input field

**Documentation:**
- `SMOKE_PHONE_SAVE.md` - Comprehensive smoke test instructions

## Smoke Test Checklist

See `SMOKE_PHONE_SAVE.md` for detailed instructions. Quick checklist:

- [ ] Registration saves phone if provided
- [ ] Profile edit saves phone correctly
- [ ] Admin create listing with owner_phone saves to User if owner has no phone
- [ ] Admin create listing does NOT overwrite existing owner phone
- [ ] Contact endpoint reads from User.phone
- [ ] Contact endpoint returns 404 if phone missing
- [ ] No phone values in server logs
- [ ] Owner info visibility works (authenticated vs unauthenticated)

## Breaking Changes

None - all changes are additive or fix existing behavior.

## Notes

- Phone is idempotent - safe to run operations multiple times
- Admin can only set phone if owner doesn't have one (prevents overwriting)
- All phone operations respect User document as source of truth
- No legacy phone fields removed (if they exist, they're just not used)

