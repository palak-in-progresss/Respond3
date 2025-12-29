# 🔐 DigiLocker Integration Setup Guide

## ✅ What's Been Added

I've successfully integrated DigiLocker authentication into RESPOND! Here's what's new:

### 📁 New Files Created:

1. **`src/lib/digilocker/config.ts`** - DigiLocker API configuration
2. **`src/lib/digilocker/api.ts`** - DigiLocker API client functions
3. **`src/app/components/DigiLockerCallback.tsx`** - OAuth callback handler
4. **`src/app/components/DigiLockerLoginButton.tsx`** - Login button component

### 🔧 Modified Files:

1. **`src/types/database.ts`** - Added `digilocker_id` and `photo_url` fields to volunteers table

## 🎯 How DigiLocker Integration Works

### User Flow:
```
1. User clicks "Login with DigiLocker"
   ↓
2. Redirected to DigiLocker OAuth page
   ↓
3. User authorizes RESPOND to access their data
   ↓
4. DigiLocker redirects back with authorization code
   ↓
5. RESPOND exchanges code for access token
   ↓
6. Fetches verified profile data (Name, Aadhaar, Photo, Address)
   ↓
7. Creates volunteer profile in Supabase (auto-verified!)
   ↓
8. User is logged in and redirected to dashboard
```

### Benefits:
- ✅ **Government-verified identity** - No fake profiles
- ✅ **Auto-fill data** - Name, DOB, Address from Aadhaar
- ✅ **Persistent sessions** - Stay logged in across refreshes
- ✅ **Trust score boost** - DigiLocker verified = higher credibility
- ✅ **No password management** - DigiLocker handles authentication

## 📋 Setup Instructions

### Step 1: Register Your App with DigiLocker

1. **Go to DigiLocker Developer Portal**: https://www.digilocker.gov.in/
2. **Create an account** or login
3. **Register a new application**:
   - App Name: `RESPOND Emergency Platform`
   - App Description: `Emergency volunteer coordination platform`
   - Redirect URI: `http://localhost:5173/auth/digilocker/callback` (for development)
   - For production: `https://respond3.vercel.app/auth/digilocker/callback`
   - Scopes: Select `profile`, `aadhaar`, `documents`

4. **Get your credentials**:
   - Client ID
   - Client Secret

### Step 2: Add Environment Variables

Add these to your `.env.local` file:

```env
# DigiLocker API Credentials
VITE_DIGILOCKER_CLIENT_ID=your_client_id_here
VITE_DIGILOCKER_CLIENT_SECRET=your_client_secret_here
VITE_DIGILOCKER_REDIRECT_URI=http://localhost:5173/auth/digilocker/callback
```

For Vercel deployment, add these same variables in the Vercel dashboard under "Environment Variables".

### Step 3: Update Supabase Database Schema

Run this SQL in your Supabase SQL Editor to add DigiLocker fields:

```sql
-- Add DigiLocker fields to volunteers table
ALTER TABLE volunteers 
ADD COLUMN IF NOT EXISTS digilocker_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_volunteers_digilocker_id 
ON volunteers(digilocker_id);
```

### Step 4: Add Routing for Callback

Update your `App.tsx` to handle the DigiLocker callback route:

```typescript
import { DigiLockerCallback } from './components/DigiLockerCallback';

// In your routing logic:
if (window.location.pathname === '/auth/digilocker/callback') {
  return <DigiLockerCallback />;
}
```

### Step 5: Add Login Button to Your UI

In `RoleSelection.tsx` or `VolunteerOnboarding.tsx`:

```typescript
import { DigiLockerLoginButton } from './DigiLockerLoginButton';

// Add the button:
<DigiLockerLoginButton 
  onSuccess={() => {
    // User is authenticated, redirect to dashboard
    setCurrentScreen('volunteer-dashboard');
  }}
/>
```

## 🔄 How It Solves the Refresh Problem

### Before DigiLocker:
```
User fills form → Data saved → volunteerId in localStorage
↓
User refreshes → Data lost → Has to start over ❌
```

### After DigiLocker:
```
User logs in with DigiLocker → Session token stored
↓
User refreshes → Session valid → Auto-loads profile ✅
↓
User closes browser → Comes back later → Still logged in ✅
```

## 📊 Data Retrieved from DigiLocker

When a user authenticates, you get:

```typescript
{
  name: "John Doe",
  dob: "1990-01-01",
  gender: "M",
  email: "john@example.com",
  mobile: "9876543210",
  aadhaar: {
    uid: "XXXX-XXXX-1234", // Masked Aadhaar
    name: "John Doe",
    dob: "1990-01-01",
    gender: "M",
    address: {
      house: "123",
      street: "Main Street",
      locality: "Downtown",
      vtc: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    photo: "base64_encoded_photo_string"
  }
}
```

## 🎨 UI Components Available

### 1. DigiLockerLoginButton
```typescript
<DigiLockerLoginButton 
  variant="default" // or "outline"
  className="custom-classes"
  onSuccess={() => console.log('Logged in!')}
/>
```

### 2. DigiLockerBadge
Shows a verification badge for authenticated users:
```typescript
<DigiLockerBadge />
// Displays: 🛡️ DigiLocker Verified ✓
```

## 🔐 Security Features

1. **State Parameter**: Prevents CSRF attacks
2. **Token Expiry**: Automatic session expiration
3. **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
4. **Aadhaar Masking**: Only last 4 digits shown
5. **OAuth 2.0**: Industry-standard authentication

## 🧪 Testing

### Development Testing:
1. Make sure `.env.local` has your DigiLocker credentials
2. Start dev server: `npm run dev`
3. Click "Login with DigiLocker"
4. You'll be redirected to DigiLocker sandbox (if using test credentials)
5. Authorize the app
6. You'll be redirected back with your profile data

### Production Testing:
1. Add environment variables to Vercel
2. Update redirect URI to production URL
3. Test the full flow on live site

## 🚨 Important Notes

### For Hackathon Demo:
- If you don't have DigiLocker API credentials yet, the app will show a message: "DigiLocker integration is not configured"
- You can still use the regular onboarding flow
- DigiLocker is an **enhancement**, not a requirement

### For Production:
- Register your app with DigiLocker
- Use production credentials
- Update redirect URIs
- Consider adding refresh token logic
- Implement proper error handling
- Add logging for debugging

## 📚 API Documentation

Full DigiLocker API docs: https://www.digilocker.gov.in/assets/img/digilocker_api_specifications.pdf

## 🎯 Next Steps

1. **Register with DigiLocker** to get API credentials
2. **Add credentials** to environment variables
3. **Update database schema** with new fields
4. **Add routing** for callback handler
5. **Add login button** to your UI
6. **Test the flow** end-to-end
7. **Deploy to Vercel** with production credentials

## 💡 Quick Integration Example

Here's how to quickly add DigiLocker to your volunteer onboarding:

```typescript
// In VolunteerOnboarding.tsx
import { DigiLockerLoginButton, isDigiLockerAuthenticated } from './DigiLockerLoginButton';

// At the start of onboarding:
{!isDigiLockerAuthenticated() && (
  <div className="mb-6">
    <h3>Quick Verification with DigiLocker</h3>
    <p>Skip the form and verify instantly with your Aadhaar</p>
    <DigiLockerLoginButton 
      onSuccess={() => {
        // User is verified, skip to dashboard
        onComplete();
      }}
    />
    <div className="text-center my-4">
      <span className="text-gray-500">or</span>
    </div>
  </div>
)}

{/* Regular onboarding form below */}
```

## 🎉 Benefits Summary

✅ **Instant verification** - No manual document upload
✅ **Government-backed** - Highest trust level
✅ **Auto-fill data** - No typing required
✅ **Persistent sessions** - No more lost progress
✅ **Better UX** - One-click authentication
✅ **Fraud prevention** - Real identity verification

---

**Your RESPOND platform now has enterprise-grade authentication! 🚀**

When you're ready to enable it, just add the API credentials and you're good to go!
