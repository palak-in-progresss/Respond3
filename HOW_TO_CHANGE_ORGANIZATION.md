# 🏢 How to Change Organization Name

## ✅ Organization Name is Now Configurable!

I've made the organization name dynamic instead of hardcoded. Here's how to change it:

## 📝 Quick Change (1 Minute)

### Open: `src/app/App.tsx`

Find this section (around line 21):

```typescript
// Organization configuration - Change this to customize your organization
const ORGANIZATION_CONFIG = {
  name: 'Emergency Response Organization',
  id: 'org_emergency_response',
};
```

### Change it to whatever you want:

```typescript
// Example 1: Kerala State Disaster Management
const ORGANIZATION_CONFIG = {
  name: 'Kerala State Disaster Management',
  id: 'org_kerala_sdm',
};

// Example 2: Mumbai Emergency Services
const ORGANIZATION_CONFIG = {
  name: 'Mumbai Emergency Services',
  id: 'org_mumbai_emergency',
};

// Example 3: National Disaster Response Force
const ORGANIZATION_CONFIG = {
  name: 'National Disaster Response Force',
  id: 'org_ndrf',
};

// Example 4: Your Custom Organization
const ORGANIZATION_CONFIG = {
  name: 'Your Organization Name Here',
  id: 'org_your_id_here',
};
```

## 🎯 What Gets Updated Automatically:

When you change `ORGANIZATION_CONFIG`, these places update automatically:

1. ✅ **Requester Dashboard Header** - Shows organization name
2. ✅ **Create Request Modal** - Uses organization ID and name
3. ✅ **All New Requests** - Tagged with your organization
4. ✅ **Database Records** - Saved with correct organization info

## 📊 Current Default:

```
Name: "Emergency Response Organization"
ID: "org_emergency_response"
```

## 🚀 Examples for Different Use Cases:

### For Hackathon Demo:
```typescript
const ORGANIZATION_CONFIG = {
  name: 'RESPOND Emergency Platform',
  id: 'org_respond_demo',
};
```

### For Kerala Floods:
```typescript
const ORGANIZATION_CONFIG = {
  name: 'Kerala State Disaster Management',
  id: 'org_kerala_sdm',
};
```

### For General Emergency:
```typescript
const ORGANIZATION_CONFIG = {
  name: 'National Emergency Response',
  id: 'org_national_emergency',
};
```

### For NGO:
```typescript
const ORGANIZATION_CONFIG = {
  name: 'Red Cross India',
  id: 'org_red_cross_india',
};
```

## ⚠️ Important Notes:

1. **ID Format**: Use lowercase with underscores (e.g., `org_my_organization`)
2. **Name Format**: Can be anything (e.g., "My Organization Name")
3. **Consistency**: The ID should stay the same once you start creating requests
4. **Database**: All requests created will use this organization info

## 🎯 Where to Find It:

**File**: `src/app/App.tsx`
**Line**: ~21-24
**Section**: Right after `const [currentScreen, setCurrentScreen]`

## 📝 Summary:

**Before:** Organization name was hardcoded as "Kerala State Disaster Management"

**After:** Organization name is configurable in one place (`App.tsx`)

**To Change:** Edit `ORGANIZATION_CONFIG` in `App.tsx`

**Takes:** 30 seconds

**Your progress is safe!** This is a simple configuration change. ✅

---

**Need to change it? Just edit those 2 lines in App.tsx!** 🎉
