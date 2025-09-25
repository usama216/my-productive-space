// Pricing Service - API calls for pricing configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

export interface PricingConfiguration {
  id: string;
  location: string;
  memberType: 'STUDENT' | 'MEMBER' | 'TUTOR';
  oneHourRate: number;
  overOneHourRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PricingResponse {
  success: boolean;
  data: PricingConfiguration | PricingConfiguration[];
  count?: number;
  message?: string;
}

// Get all pricing configurations
export const getAllPricingConfigurations = async (): Promise<PricingConfiguration[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pricing`);
    if (!response.ok) {
      throw new Error('Failed to fetch pricing configurations');
    }
    const result: PricingResponse = await response.json();
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error('Error fetching pricing configurations:', error);
    throw error;
  }
};

// Get pricing by location and member type
export const getPricingByLocationAndMemberType = async (
  location: string, 
  memberType: 'STUDENT' | 'MEMBER' | 'TUTOR'
): Promise<PricingConfiguration> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pricing/${location}/${memberType}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pricing configuration');
    }
    const result: PricingResponse = await response.json();
    return result.data as PricingConfiguration;
  } catch (error) {
    console.error('Error fetching pricing configuration:', error);
    throw error;
  }
};

// Admin functions
export const upsertPricingConfiguration = async (pricingData: {
  location: string;
  memberType: 'STUDENT' | 'MEMBER' | 'TUTOR';
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  isActive?: boolean;
}): Promise<PricingConfiguration> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pricingData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save pricing configuration');
    }
    
    const result: PricingResponse = await response.json();
    return result.data as PricingConfiguration;
  } catch (error) {
    console.error('Error saving pricing configuration:', error);
    throw error;
  }
};

export const deletePricingConfiguration = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/pricing/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete pricing configuration');
    }
  } catch (error) {
    console.error('Error deleting pricing configuration:', error);
    throw error;
  }
};

// Get all pricing for a location in a single call (like the old static pricing structure)
export const getAllPricingForLocation = async (
  location: string = 'Kovan'
): Promise<{
  student: { oneHourRate: number; overOneHourRate: number };
  member: { oneHourRate: number; overOneHourRate: number };
  tutor: { oneHourRate: number; overOneHourRate: number };
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pricing/${location}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pricing for ${location}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error getting all pricing for location:', error);
    // Fallback to Kovan default pricing if database fetch fails
    return {
      student: { oneHourRate: 4.00, overOneHourRate: 3.00 },
      member: { oneHourRate: 5.00, overOneHourRate: 4.00 },
      tutor: { oneHourRate: 6.00, overOneHourRate: 5.00 },
    };
  }
};

// Helper function to get pricing for booking calculation (defaults to Kovan)
export const getPricingForBooking = async (
  location: string = 'Kovan', // Default to Kovan since it's the only location
  memberType: 'STUDENT' | 'MEMBER' | 'TUTOR'
): Promise<{
  oneHourRate: number;
  overOneHourRate: number;
}> => {
  try {
    const pricing = await getPricingByLocationAndMemberType(location, memberType);
    return {
      oneHourRate: pricing.oneHourRate,
      overOneHourRate: pricing.overOneHourRate,
    };
  } catch (error) {
    console.error('Error getting pricing for booking:', error);
    // Fallback to Kovan default pricing if database fetch fails
    const kovanDefaultPricing = {
      'STUDENT': { oneHourRate: 4.00, overOneHourRate: 3.00 },
      'MEMBER': { oneHourRate: 5.00, overOneHourRate: 4.00 },
      'TUTOR': { oneHourRate: 6.00, overOneHourRate: 5.00 },
    };
    
    return kovanDefaultPricing[memberType] || kovanDefaultPricing['MEMBER'];
  }
};
