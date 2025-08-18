# Redux User Store Setup

## 🎯 **What We've Built**

A complete Redux store for managing user authentication state that integrates with your Supabase auth system.

## 📁 **Files Created**

1. **`src/store/slices/userSlice.ts`** - Redux slice for user state
2. **`src/hooks/useReduxUser.ts`** - Custom hook for Redux user actions
3. **`src/hooks/useAuth.ts`** - Updated to use Redux store
4. **`src/store/store.ts`** - Updated to include user reducer

## 🚀 **How to Use**

### **1. Access User Data in Components**

```typescript
import { useReduxUser } from '@/hooks/useReduxUser'

function MyComponent() {
  const { 
    user,           // Full user object
    isAuthenticated, // Boolean auth status
    userId,         // User ID (UUID)
    userEmail,      // User email
    loading         // Loading state
  } = useReduxUser()

  if (loading) return <div>Loading...</div>
  
  if (!isAuthenticated) return <div>Please login</div>

  return (
    <div>
      <h1>Welcome {user?.user_metadata.firstName}!</h1>
      <p>User ID: {userId}</p>
      <p>Email: {userEmail}</p>
    </div>
  )
}
```

### **2. Manual Login (Store User Data)**

```typescript
import { useReduxUser } from '@/hooks/useReduxUser'

function LoginComponent() {
  const { loginUser } = useReduxUser()

  const handleLogin = async (email: string, password: string) => {
    try {
      // Your login logic here
      const response = await loginAPI(email, password)
      
      // Store in Redux
      loginUser({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: response.expires_at
      })
      
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
}
```

### **3. Logout**

```typescript
import { useReduxUser } from '@/hooks/useReduxUser'

function LogoutButton() {
  const { logoutUser } = useReduxUser()

  const handleLogout = () => {
    logoutUser() // Clears Redux store
    // Additional logout logic (e.g., redirect)
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### **4. Update User Data**

```typescript
import { useReduxUser } from '@/hooks/useReduxUser'

function ProfileEditor() {
  const { updateUser } = useReduxUser()

  const handleUpdateProfile = (newData: any) => {
    updateUser(newData) // Updates Redux store
    // Additional API call to update backend
  }
}
```

## 🔧 **Current Integration**

### **Automatic Integration**
- **`useAuth()` hook** automatically syncs with Redux store
- **Supabase auth changes** automatically update Redux state
- **Session persistence** maintained across page refreshes

### **User Data Structure**
```typescript
{
  id: "1ee65305-b084-4f8f-8afd-074a2c5770cc", // UUID
  email: "usamajawad125@gmail.com",
  user_metadata: {
    firstName: "Usama",
    lastName: "Jawad",
    memberType: "student",
    contactNumber: "+923000080216",
    // ... other metadata
  }
}
```

## 🎯 **For Booking API**

Now you can use the correct user ID in your booking API:

```typescript
import { useReduxUser } from '@/hooks/useReduxUser'

function BookingComponent() {
  const { userId } = useReduxUser()

  const createBooking = async (bookingData: any) => {
    const finalData = {
      ...bookingData,
      userId: userId, // This is the correct UUID!
    }
    
    // Send to your backend API
    const result = await createBookingAPI(finalData)
  }
}
```

## 🔍 **Redux DevTools**

Open Redux DevTools in your browser to see:
- **User state changes**
- **Auth actions** (login, logout, update)
- **Current user data**

## ✅ **What's Working Now**

1. **User authentication state** stored in Redux
2. **Automatic sync** with Supabase auth
3. **Correct user ID** (UUID) available for APIs
4. **Session persistence** across page refreshes
5. **Type-safe** user data access

## 🚀 **Next Steps**

1. **Test the booking API** with the correct user ID
2. **Add user profile management** using the Redux store
3. **Implement token refresh** logic if needed
4. **Add user preferences** to the store

Your user data is now properly stored and accessible throughout your application! 🎉
