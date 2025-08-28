// Promo Code Service - API Integration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://productive-space-backend.vercel.app/api';

console.log('API_BASE_URL set to:', API_BASE_URL);

// Types
export interface PromoCode {
  id: string;
  code: string;
  name?: string;
  description: string;
  discounttype: 'percentage' | 'fixed';
  discountvalue: number;
  minimumamount: number;
  maximumdiscount: number | null;
  maxusageperuser: number;
  maxtotalusage: number;
  currentusage?: number;
  activefrom: string;
  activeto: string | null;
  isactive: boolean;
  category?: 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL';
  createdat?: string;
  updatedat?: string;
  usageCount?: number;
}

export interface PromoCodeUsage {
  id: string;
  promoCodeId: string;
  userId: string;
  usedAt: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  bookingId?: string;
  packageId?: string;
}

export interface PromoCodeCalculation {
  discountAmount: number;
  finalAmount: number;
  isValid: boolean;
  message: string;
}

export interface PromoCodeResponse {
  success: boolean;
  message: string;
  data?: PromoCode;
  error?: string;
}

export interface AvailablePromosResponse {
  success: boolean;
  message: string;
  data: PromoCode[];
  error?: string;
}

export interface UsedPromosResponse {
  success: boolean;
  message: string;
  data: PromoCodeUsage[];
  error?: string;
}

export interface ApplyPromoCodeRequest {
  promoCode: string;
  userId: string;
  bookingAmount: number;
  bookingId?: string;
  packageId?: string;
}

export interface ApplyPromoCodeResponse {
  success: boolean;
  message: string;
  data?: {
    promoCode: PromoCode;
    discountAmount: number;
    finalAmount: number;
  };
  error?: string;
}

// API Functions
export const applyPromoCode = async (request: ApplyPromoCodeRequest): Promise<ApplyPromoCodeResponse> => {
  const url = `${API_BASE_URL}/promocode/apply`;
  console.log('Calling applyPromoCode with URL:', url);
  console.log('Request body:', request);
  
  try {
    // Transform the request to match API expectations
    const apiRequest = {
      promoCode: request.promoCode,
      userId: request.userId,
      bookingAmount: request.bookingAmount,
      ...(request.bookingId && { bookingId: request.bookingId }),
      ...(request.packageId && { packageId: request.packageId })
    };
    
    console.log('Transformed API request:', apiRequest);
    console.log('Full request details:', {
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiRequest)
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequest),
    });

    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('API response body:', result);
    
    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        details: result
      });
      
      return {
        success: false,
        message: result.error || 'Failed to apply promo code',
        error: result.error || 'Failed to apply promo code',
      };
    }

    return result;
  } catch (error) {
    console.error('Error applying promo code:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return {
      success: false,
      message: 'Network error occurred',
      error: 'Network error occurred',
    };
  }
};

export const getAvailablePromoCodes = async (userId: string): Promise<AvailablePromosResponse> => {
  // First try to get full promo code details from admin endpoint
  try {
    const adminResponse = await fetch(`${API_BASE_URL}/promocode/admin/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (adminResponse.ok) {
      const adminResult = await adminResponse.json();
      console.log('Admin endpoint response:', adminResult);
      
      if (adminResult.promoCodes && Array.isArray(adminResult.promoCodes)) {
                 // Filter active promo codes and map to PromoCode interface
         const availablePromos = adminResult.promoCodes
           .filter((promo: any) => {
             // Only show active promo codes
             if (promo.isactive !== true) return false;
             
             // Check if promo code is within valid date range
             const now = new Date();
             const activeFrom = new Date(promo.activefrom);
             
             // Must be active from now or in the past (allow future start dates for preview)
             if (activeFrom > now) return false;
             
             // If there's an expiry date, must not be expired
             if (promo.activeto) {
               const activeTo = new Date(promo.activeto);
               if (activeTo < now) return false;
             }
             
             // Check if promo code hasn't reached its total usage limit
             if (promo.maxtotalusage && promo.currentusage >= promo.maxtotalusage) return false;
             
             // Additional validation: ensure promo code has valid discount values
             if (promo.discountvalue <= 0) return false;
             if (promo.minimumamount < 0) return false;
             
             return true;
           })
           .map((promo: any) => ({
             id: promo.id,
             code: promo.code,
             name: promo.name,
             description: promo.description,
             discounttype: promo.discounttype,
             discountvalue: promo.discountvalue,
             minimumamount: promo.minimumamount,
             maximumdiscount: promo.maximumdiscount,
             maxusageperuser: promo.maxusageperuser,
             maxtotalusage: promo.maxtotalusage,
             currentusage: promo.currentusage,
             activefrom: promo.activefrom,
             activeto: promo.activeto,
             isactive: promo.isactive,
             category: promo.category,
             createdat: promo.createdat,
             updatedat: promo.updatedat,
             usageCount: promo.usageCount
           }));
        
        return {
          success: true,
          data: availablePromos,
          message: 'Promo codes fetched successfully from admin endpoint'
        };
      }
    }
  } catch (error) {
    console.log('Admin endpoint failed, falling back to user endpoint:', error);
  }

  // Fallback to user endpoint if admin endpoint fails
  const url = `${API_BASE_URL}/promocode/user/${userId}/available`;
  console.log('Calling getAvailablePromoCodes with fallback URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API response status:', response.status);
    const result = await response.json();
    console.log('API response body:', result);
    
    if (!response.ok) {
      return {
        success: false,
        data: [],
        error: result.error || 'Failed to fetch available promo codes',
        message: 'Failed to fetch available promo codes',
      };
    }

    // Handle the actual API response format
    if (result.availablePromos && Array.isArray(result.availablePromos)) {
      return {
        success: true,
        data: result.availablePromos,
        message: 'Promo codes fetched successfully from user endpoint'
      };
    }

    // Fallback to direct data if not in expected format
    return result;
  } catch (error) {
    console.error('Error fetching available promo codes:', error);
    return {
      success: false,
      data: [],
      error: 'Network error occurred',
      message: 'Network error occurred',
    };
  }
};

export const getUsedPromoCodes = async (userId: string): Promise<UsedPromosResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promocode/user/${userId}/used`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        data: [],
        error: result.error || 'Failed to fetch used promo codes',
        message: 'Failed to fetch used promo codes',
      };
    }

    return result;
  } catch (error) {
    console.error('Error fetching used promo codes:', error);
    return {
      success: false,
      data: [],
      error: 'Network error occurred',
      message: 'Network error occurred',
    };
  }
};

// Admin API Functions
export const createPromoCode = async (promoData: {
  code: string;
  name?: string;
  description: string;
  discounttype: 'percentage' | 'fixed';
  discountvalue: number;
  minimumamount: number;
  maximumdiscount?: number;
  maxusageperuser: number;
  maxtotalusage: number;
  category?: 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL';
  isactive: boolean;
  activefrom: string;
  activeto?: string | null;
}): Promise<PromoCodeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promocode/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promoData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to create promo code',
        error: result.error || 'Failed to create promo code',
      };
    }

    return result;
  } catch (error) {
    console.error('Error creating promo code:', error);
    return {
      success: false,
      message: 'Network error occurred',
      error: 'Network error occurred',
    };
  }
};

export const updatePromoCode = async (id: string, promoData: Partial<{
  code: string;
  name?: string;
  description: string;
  discounttype: 'percentage' | 'fixed';
  discountvalue: number;
  minimumamount: number;
  maximumdiscount?: number;
  maxusageperuser: number;
  maxtotalusage: number;
  category?: 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL';
  isactive: boolean;
  activefrom: string;
  activeto?: string | null;
}>): Promise<PromoCodeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promocode/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promoData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update promo code',
        message: 'Failed to update promo code',
      };
    }

    return result;
  } catch (error) {
    console.error('Error updating promo code:', error);
    return {
      success: false,
      error: 'Network error occurred',
      message: 'Network error occurred',
    };
  }
};

export const deletePromoCode = async (id: string): Promise<PromoCodeResponse> => {
  try {
    console.log('Attempting to delete promo code:', id);
    
    const response = await fetch(`${API_BASE_URL}/promocode/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('Delete response:', { status: response.status, result });
    
    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = 'Failed to delete promo code';
      
      if (result.error) {
        if (result.error.includes('usage')) {
          errorMessage = 'Cannot delete promo code that is currently in use. Please deactivate it first.';
        } else if (result.error.includes('constraint')) {
          errorMessage = 'Cannot delete promo code due to existing references. Please deactivate it first.';
        } else {
          errorMessage = result.error;
        }
      }
      
      return {
        success: false,
        error: result.error || 'Failed to delete promo code',
        message: errorMessage,
      };
    }

    return result;
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return {
      success: false,
      error: 'Network error occurred',
      message: 'Network error occurred. Please try again.',
    };
  }
};

export const getAllPromoCodes = async (): Promise<AvailablePromosResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promocode/admin/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        data: [],
        error: result.error || 'Failed to fetch all promo codes',
        message: 'Failed to fetch all promo codes',
      };
    }

    // Handle the API response structure where data is in 'promoCodes' array
    if (result.promoCodes && Array.isArray(result.promoCodes)) {
      console.log('Raw API response promoCodes:', result.promoCodes);
      
             // Map the response to match our snake_case interface
       const mappedPromoCodes = result.promoCodes.map((promo: any) => {
         const mapped = {
           id: promo.id,
           code: promo.code,
           name: promo.name,
           description: promo.description,
           discounttype: promo.discounttype || promo.discountType,
           discountvalue: promo.discountvalue || promo.discountValue,
           minimumamount: promo.minimumamount || promo.minimumAmount,
           maximumdiscount: promo.maximumdiscount || promo.maxDiscountAmount,
           maxusageperuser: promo.maxusageperuser || promo.maxUsagePerUser,
           maxtotalusage: promo.maxtotalusage || promo.maxTotalUsage,
           currentusage: promo.currentusage || promo.currentUsage,
           activefrom: promo.activefrom || promo.activeFrom,
           activeto: promo.activeto || promo.activeTo,
           isactive: promo.isactive || promo.isActive,
           category: promo.category,
           createdat: promo.createdat || promo.createdAt,
           updatedat: promo.updatedat || promo.updatedAt,
           usageCount: promo.usageCount
         };
         console.log('Mapped promo code:', mapped);
         return mapped;
       });
      
      return {
        success: true,
        data: mappedPromoCodes,
        message: 'Promo codes fetched successfully'
      };
    }

    // Fallback to direct data if not in expected format
    return result;
  } catch (error) {
    console.error('Error fetching all promo codes:', error);
    return {
      success: false,
      data: [],
      error: 'Network error occurred',
      message: 'Network error occurred',
    };
  }
};

// Local Utility Functions (for immediate validation and calculation)
export const validatePromoCodeLocally = (promoCode: PromoCode, amount: number): { isValid: boolean; message: string } => {
  // Check if promo code is active
  if (!promoCode.isactive) {
    return { isValid: false, message: 'Promo code is not active' };
  }

  // Check usage limit
  if (promoCode.usageCount && promoCode.usageCount >= promoCode.maxusageperuser) {
    return { isValid: false, message: 'Promo code usage limit reached' };
  }

  // Check minimum amount requirement if available
  if (promoCode.minimumamount && amount < promoCode.minimumamount) {
    return { 
      isValid: false, 
      message: `Minimum order amount of $${promoCode.minimumamount} required. Your order is $${amount}.` 
    };
  }

  return { isValid: true, message: 'Promo code is valid' };
 };

export const calculateDiscountLocally = (promoCode: PromoCode, amount: number): { discountAmount: number; finalAmount: number } => {
  // Check if promo code is active first
  if (!promoCode.isactive) {
    return { discountAmount: 0, finalAmount: amount };
  }

  // Check minimum amount requirement first
  if (promoCode.minimumamount && amount < promoCode.minimumamount) {
    return { discountAmount: 0, finalAmount: amount };
  }

  let discountAmount = 0;

  if (promoCode.discounttype === 'percentage' && promoCode.discountvalue) {
    // Calculate percentage discount
    discountAmount = (amount * promoCode.discountvalue) / 100;
    
    // Apply maximum discount limit if specified
    if (promoCode.maximumdiscount && discountAmount > promoCode.maximumdiscount) {
      discountAmount = promoCode.maximumdiscount;
    }
  } else if (promoCode.discounttype === 'fixed' && promoCode.discountvalue) {
    // Fixed amount discount
    discountAmount = promoCode.discountvalue;
    
    // Ensure discount doesn't exceed the order amount
    if (discountAmount > amount) {
      discountAmount = amount;
    }
  }

  const finalAmount = Math.max(0, amount - discountAmount);
  
  return { discountAmount, finalAmount };
};

export const checkMinimumAmountRequirement = (promoCode: PromoCode, amount: number): boolean => {
  if (!promoCode.minimumamount) return true;
  return amount >= promoCode.minimumamount;
};

export const formatDiscountDisplay = (promoCode: PromoCode): string => {
  if (promoCode.discounttype === 'percentage' && promoCode.discountvalue) {
    return `${promoCode.discountvalue}% off`;
  } else if (promoCode.discounttype === 'fixed' && promoCode.discountvalue) {
    return `$${promoCode.discountvalue} off`;
  }
  return 'Discount available';
};

export const getPromoCodeStatusColor = (promoCode: PromoCode): string => {
  if (promoCode.usageCount && promoCode.usageCount >= promoCode.maxusageperuser) {
    return 'text-red-500';
  }
  
  return 'text-green-500';
};
