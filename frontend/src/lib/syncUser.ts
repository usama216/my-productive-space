// Utility function to check if user exists in database and provide guidance
export const checkUserSync = async (userId: string) => {
  try {
    const response = await fetch('/api/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('User sync check result:', result.message)
      return { success: true, message: result.message }
    } else {
      console.error('Failed to check user sync:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error checking user sync:', error)
    return { success: false, error: 'Network error' }
  }
}

// Function to manually sync user (for development/testing)
export const manualUserSync = async (userId: string) => {
  console.log('🔧 Manual User Sync Required')
  console.log('User ID:', userId)
  console.log('')
  console.log('📋 To fix the foreign key constraint error, run this SQL in your Supabase database:')
  console.log('')
  console.log(`INSERT INTO "User" (
    id, 
    email, 
    "firstName", 
    "lastName", 
    "memberType", 
    "contactNumber", 
    "studentVerificationStatus", 
    "createdAt", 
    "updatedAt"
  ) VALUES (
    '${userId}',
    'usamajawad125@gmail.com',
    'Usama',
    'Jawad',
    'STUDENT',
    '+923000080216',
    'PENDING',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;`)
  console.log('')
  console.log('📍 Go to: Supabase Dashboard → SQL Editor → Run this command')
  console.log('')
  
  return { 
    success: false, 
    message: 'Manual sync required - check console for SQL command' 
  }
}

// Simple function to log user info for debugging
export const logUserInfo = (userId: string) => {
  console.log('🔍 User Info for Debugging:')
  console.log('User ID:', userId)
  console.log('Email: usamajawad125@gmail.com')
  console.log('Name: Usama Jawad')
  console.log('Member Type: STUDENT')
  console.log('Contact: +923000080216')
  console.log('')
  console.log('💡 If you get foreign key errors, click the "Sync User to DB" button in your dashboard!')
}
