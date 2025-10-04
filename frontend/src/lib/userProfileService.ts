// User Profile Service - API calls for user profile management
import { supabase } from './supabaseClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000/api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberType: 'STUDENT' | 'MEMBER' | 'TUTOR' | 'ADMIN';
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
  studentVerificationImageUrl?: string;
  studentVerificationDate?: string;
  studentRejectionReason?: string | null;
  studentVerificationStatus: 'NA' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface UserProfileResponse {
  success: boolean;
  user: UserProfile;
  error?: string;
}

// Get current user's profile information
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    const data: UserProfileResponse = await response.json();
    
    if (response.ok && data.success) {
      return data.user;
    } else {
      throw new Error(data.error || 'Failed to fetch user profile');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Update user profile - Comprehensive update for both Supabase Auth and custom User table
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>, refreshCallback?: () => void): Promise<UserProfile | null> {
  try {
    // Step 1: Update Supabase Auth User metadata
    console.log('Updating Supabase Auth user metadata...')
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        memberType: profileData.memberType,
        contactNumber: profileData.contactNumber,
        studentVerificationStatus: profileData.studentVerificationStatus,
        studentVerificationImageUrl: profileData.studentVerificationImageUrl,
        updatedAt: new Date().toISOString()
      }
    })

    if (authError) {
      console.error('Supabase Auth update failed:', authError)
      throw new Error(`Auth update failed: ${authError.message}`)
    }
    console.log('Supabase Auth user metadata updated successfully')

    // Step 2: Update custom User table via your backend API
    console.log('Updating custom User table...')
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profileData,
        updatedAt: new Date().toISOString()
      }),
    });
    
    const data: UserProfileResponse = await response.json();
    
    if (response.ok && data.success) {
      console.log('Custom User table updated successfully')
      
      // Call refresh callback if provided (to refresh databaseUser state)
      if (refreshCallback) {
        console.log('Refreshing database user state...')
        await refreshCallback()
      }
      
      return data.user;
    } else {
      throw new Error(data.error || 'Failed to update user profile in custom table');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

// Alternative: Direct Supabase update (if you prefer to bypass your backend)
export async function updateUserProfileDirect(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Step 1: Update Supabase Auth User metadata
    console.log('Updating Supabase Auth user metadata...')
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        memberType: profileData.memberType,
        contactNumber: profileData.contactNumber,
        studentVerificationStatus: profileData.studentVerificationStatus,
        studentVerificationImageUrl: profileData.studentVerificationImageUrl,
        updatedAt: new Date().toISOString()
      }
    })

    if (authError) {
      console.error('Supabase Auth update failed:', authError)
      throw new Error(`Auth update failed: ${authError.message}`)
    }
    console.log('Supabase Auth user metadata updated successfully')

    // Step 2: Update custom User table directly via Supabase
    console.log('Updating custom User table directly...')
    const { data: userData, error: userError } = await supabase
      .from('User')
      .update({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        memberType: profileData.memberType,
        contactNumber: profileData.contactNumber,
        studentVerificationStatus: profileData.studentVerificationStatus,
        studentVerificationImageUrl: profileData.studentVerificationImageUrl,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (userError) {
      console.error('Custom User table update failed:', userError)
      throw new Error(`User table update failed: ${userError.message}`)
    }
    console.log('Custom User table updated successfully')

    return userData as UserProfile
  } catch (error) {
    console.error('Error updating user profile directly:', error);
    return null;
  }
}

// Helper function to format user name
export function formatUserName(user: UserProfile): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

// Helper function to get effective member type based on verification status
export function getEffectiveMemberType(memberType: string, studentVerificationStatus?: string): string {
  // If user is STUDENT but not verified, treat as MEMBER
  if (memberType === 'STUDENT' && studentVerificationStatus !== 'VERIFIED') {
    return 'MEMBER';
  }
  // If user is STUDENT and verified, they are a STUDENT
  if (memberType === 'STUDENT' && studentVerificationStatus === 'VERIFIED') {
    return 'STUDENT';
  }
  return memberType;
}

// Helper function to get member type display name
export function getMemberTypeDisplayName(memberType: string, studentVerificationStatus?: string): string {
  const effectiveMemberType = getEffectiveMemberType(memberType, studentVerificationStatus);
  
  switch (effectiveMemberType) {
    case 'STUDENT':
      return 'Student';
    case 'MEMBER':
      return 'Member';
    case 'TUTOR':
      return 'Tutor';
    case 'ADMIN':
      return 'Admin';
    default:
      return 'Member';
  }
}

// Helper function to get verification status display name
export function getVerificationStatusDisplayName(status: string): string {
  switch (status) {
    case 'VERIFIED':
      return 'Verified Student';
    case 'PENDING':
      return 'Verification Pending';
    case 'REJECTED':
      return 'Verification Rejected';
    case 'NA':
    default:
      return 'Not Verified';
  }
}

// Helper function to get verification status color
export function getVerificationStatusColor(status: string): string {
  switch (status) {
    case 'VERIFIED':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'PENDING':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'NA':
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

// Update user password (Supabase Auth only)
export async function updateUserPassword(newPassword: string): Promise<boolean> {
  try {
    console.log('Updating user password...')
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update failed:', error)
      throw new Error(`Password update failed: ${error.message}`)
    }
    
    console.log('Password updated successfully')
    return true
  } catch (error) {
    console.error('Error updating password:', error)
    return false
  }
}

// Get current user from Supabase Auth
export async function getCurrentAuthUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current auth user:', error)
    return null
  }
}
