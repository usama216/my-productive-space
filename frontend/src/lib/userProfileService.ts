// User Profile Service - API calls for user profile management
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000/api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberType: 'STUDENT' | 'MEMBER' | 'TUTOR';
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
  studentVerificationImageUrl?: string;
  studentVerificationDate?: string;
  studentRejectionReason?: string | null;
  studentVerificationStatus: 'NA' | 'PENDING' | 'VERIFIED';
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

// Update user profile
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    const data: UserProfileResponse = await response.json();
    
    if (response.ok && data.success) {
      return data.user;
    } else {
      throw new Error(data.error || 'Failed to update user profile');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

// Helper function to format user name
export function formatUserName(user: UserProfile): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

// Helper function to get member type display name
export function getMemberTypeDisplayName(memberType: string): string {
  switch (memberType) {
    case 'STUDENT':
      return 'Student';
    case 'MEMBER':
      return 'Member';
    case 'TUTOR':
      return 'Tutor';
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
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'NA':
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}
