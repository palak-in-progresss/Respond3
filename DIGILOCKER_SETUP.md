# DigiLocker Integration Guide

## 🎯 What is DigiLocker?

DigiLocker is India's official digital document storage system by the Government of India. It allows citizens to store and share verified government-issued documents like Aadhaar, Driving License, PAN card, etc.

## 🔧 Setup Instructions

### Step 1: Register Your Application

1. Go to [DigiLocker Partners Portal](https://partners.digilocker.gov.in/)
2. Sign up / Log in
3. Navigate to "My Applications" → "Create New Application"
4. Fill in the details:
   - **Application Name**: RESPOND Emergency Platform
   - **Description**: Emergency volunteer coordination platform
   - **Redirect URI**: `http://localhost:5173/auth/digilocker/callback` (for development)
   - **Production URI**: `https://yourdomain.com/auth/digilocker/callback`
   - **Scopes**: Select `profile`, `aadhaar`, `documents`

5. Submit for approval (can take 1-2 business days)

### Step 2: Get Your Credentials

Once approved, you'll receive:
- **Client ID**: e.g., `ABC123XYZ456`
- **Client Secret**: e.g., `secret_key_here`

### Step 3: Configure Environment Variables

Add to your `.env.local` file:

```env
# DigiLocker API Configuration
VITE_DIGILOCKER_CLIENT_ID=your_client_id_here
VITE_DIGILOCKER_CLIENT_SECRET=your_client_secret_here
VITE_DIGILOCKER_REDIRECT_URI=http://localhost:5173/auth/digilocker/callback
```

### Step 4: Create Callback Route

The callback handler already exists at `src/app/components/DigiLockerCallback.tsx`.

Make sure your routing includes:
```tsx
case 'digilocker-callback':
  return <DigiLockerCallback onComplete={() => setCurrentScreen('volunteer-dashboard')} />;
```

## 🧪 Testing DigiLocker Integration

### Option 1: Use DigiLocker Sandbox

DigiLocker provides a sandbox environment for testing:
- Sandbox URL: `https://sandbox.digilocker.gov.in/`
- Test credentials are provided on their portal

### Option 2: Demo Mode (For Hackathons)

If you don't have API credentials yet, you can use **mock verification**:

1. The button will show a warning but allow you to proceed
2. For demo purposes, we can simulate verification success

## 🔐 How It Works

1. **User clicks "Login with DigiLocker"**
2. **OAuth Flow Starts**: User is redirected to DigiLocker
3. **User Authorizes**: Grants permission to access their documents
4. **Callback Received**: DigiLocker returns with auth code
5. **Token Exchange**: We exchange code for access token
6. **Fetch Profile**: We retrieve user's verified Aadhaar details
7. **Auto-Fill Form**: Name, DOB, Address pre-populated
8. **Verification Badge**: User gets "DigiLocker Verified" status

## 📋 What Data We Get

From DigiLocker, you can access:
- ✅ Full Name (verified by Aadhaar)
- ✅ Date of Birth
- ✅ Gender
- ✅ Complete Address (State, District, PIN)
- ✅ Masked Aadhaar Number (XXXX-XXXX-1234)
- ✅ Photo (if available)
- ✅ Other documents (Driving License, PAN, etc.)

## 🎨 UI Components

We have two components ready:

### 1. DigiLockerLoginButton
Full button for onboarding:
```tsx
<DigiLockerLoginButton 
  onSuccess={() => console.log('Verified!')}
  variant="default"
/>
```

### 2. DigiLockerBadge
Small badge to show verification status:
```tsx
<DigiLockerBadge />
```

## 🚨 Important Notes

1. **Production Deployment**: Update redirect URI in DigiLocker portal
2. **HTTPS Required**: DigiLocker requires HTTPS in production
3. **Client Secret Security**: Never commit `.env.local` to git
4. **Approval Time**: Account approval can take 1-2 business days
5. **Rate Limits**: DigiLocker has API rate limits (check their docs)

## 🎯 For Hackathon Demo

If you don't have time to get DigiLocker approval:

1. **Show the UI**: The button will display a helpful message
2. **Manual Verification**: Allow manual Aadhaar entry as fallback
3. **Mock Success**: For demo, simulate successful verification
4. **Explain Benefit**: Tell judges this would be integrated in production

## 📞 Support

- DigiLocker API Docs: https://www.digilocker.gov.in/assets/img/digilocker_api_specifications.pdf
- Support Email: support@digilocker.gov.in
- Partners Portal: https://partners.digilocker.gov.in/

## ✅ Current Status

- ✅ API Integration Code: Complete
- ✅ OAuth Flow: Implemented
- ✅ Profile Fetching: Ready
- ✅ UI Components: Built
- ⏳ API Credentials: **Pending Registration**

Once you add credentials to `.env.local`, everything will work automatically!
