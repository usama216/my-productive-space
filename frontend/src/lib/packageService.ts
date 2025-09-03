// Package Service - Based on Backend API Documentation
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000/api';

// Types based on backend API documentation
export interface Package {
  id: string;
  name: string;
  type: string;
  price: number;
  originalPrice?: number;
  description: string;
  bonus?: string;
  validity: number;
  outletFee: number;
  passes: PackagePass[];
}

export interface PackagePass {
  type: string;
  hours: number;
  count: number;
}

export interface UserPackage {
  id: string;
  packageId: string;
  packageName: string;
  packageType: string;
  description: string;
  bonusDescription?: string;
  totalPasses: number;
  usedPasses: number;
  remainingPasses: number;
  expiredPasses: number;
  purchasedAt: string;
  activatedAt: string;
  expiresAt: string;
  isExpired: boolean;
  totalAmount: number;
  paymentStatus: string;
}

export interface UserPass {
  id: string;
  passType: string;
  hours: number;
  status: string;
  packageName: string;
  packageType: string;
  createdAt: string;
  canUse: boolean;
}

export interface PurchaseHistory {
  id: string;
  orderId: string;
  packageName: string;
  packageType: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  hitpayReference?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

export interface PurchaseRequest {
  userId: string;
  packageId: string;
  quantity: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    userPackageId: string;
    packageName: string;
    quantity: number;
    totalAmount: number;
    paymentStatus: string;
  };
}

export interface PaymentRequest {
  userPackageId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  redirectUrl: string;
  webhookUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl: string;
  referenceNumber: string;
  orderId: string;
}

export interface ConfirmPurchaseRequest {
  userPackageId: string;
  hitpayReference: string;
  paymentStatus: string;
}

export interface UsePassRequest {
  userId: string;
  passId: string;
  bookingId: string;
  locationId: string;
  startTime: string;
  endTime: string;
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
        message: data.message || data.error || `HTTP ${response.status}`
      };
    }
    
    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('API Response Error:', error);
    return {
      success: false,
      error: 'Failed to parse response',
      message: 'Failed to parse response'
    };
  }
};

// Package APIs
export const getAllPackages = async (): Promise<{ success: boolean; packages?: Package[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get All Packages Error:', error);
    return {
      success: false,
      error: 'Failed to fetch packages'
    };
  }
};

export const getPackageById = async (id: string): Promise<{ success: boolean; package?: Package; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get Package by ID Error:', error);
    return {
      success: false,
      error: 'Failed to fetch package'
    };
  }
};

export const purchasePackage = async (purchaseData: PurchaseRequest): Promise<PurchaseResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Purchase Package Error:', error);
    return {
      success: false,
      message: 'Failed to purchase package',
      data: {
        orderId: '',
        userPackageId: '',
        packageName: '',
        quantity: 0,
        totalAmount: 0,
        paymentStatus: 'failed'
      }
    };
  }
};

export const createPackagePayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Create Package Payment Error:', error);
    return {
      success: false,
      paymentUrl: '',
      referenceNumber: '',
      orderId: ''
    };
  }
};

export const confirmPackagePurchase = async (confirmData: ConfirmPurchaseRequest): Promise<{ success: boolean; message: string; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Confirm Package Purchase Error:', error);
    return {
      success: false,
      message: 'Failed to confirm package purchase'
    };
  }
};

export const getUserPackages = async (userId: string): Promise<{ success: boolean; activePackages?: UserPackage[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/user/${userId}/packages`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get User Packages Error:', error);
    return {
      success: false,
      error: 'Failed to fetch user packages'
    };
  }
};

export const getUserPasses = async (userId: string, page: number = 1, limit: number = 10, status: string = 'active'): Promise<{ success: boolean; data?: { passes: UserPass[]; pagination: any }; error?: string }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: status
    });
    
    const response = await fetch(`${API_BASE_URL}/packages/user/${userId}/passes?${params}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get User Passes Error:', error);
    return {
      success: false,
      error: 'Failed to fetch user passes'
    };
  }
};

export const usePassForBooking = async (usePassData: UsePassRequest): Promise<{ success: boolean; message: string; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/passes/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usePassData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Use Pass for Booking Error:', error);
    return {
      success: false,
      message: 'Failed to use pass for booking'
    };
  }
};

export const getUserPurchaseHistory = async (userId: string): Promise<{ success: boolean; purchaseHistory?: PurchaseHistory[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/user/${userId}/history`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get User Purchase History Error:', error);
    return {
      success: false,
      error: 'Failed to fetch purchase history'
    };
  }
};

export const initiatePackagePurchase = async (purchaseData: PurchaseRequest & { redirectUrl: string; webhookUrl: string }): Promise<{ success: boolean; message: string; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Initiate Package Purchase Error:', error);
    return {
      success: false,
      message: 'Failed to initiate package purchase'
    };
  }
};

export const getPurchaseStatus = async (orderId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/status/${orderId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Get Purchase Status Error:', error);
    return {
      success: false,
      error: 'Failed to fetch purchase status'
    };
  }
};

// Utility functions
export const formatPackagePrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const formatPackageDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatPackageDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getPackageStatusColor = (userPackage: UserPackage): string => {
  if (userPackage.isExpired) return 'text-red-500';
  if (userPackage.remainingPasses === 0) return 'text-orange-500';
  return 'text-green-500';
};

export const getPackageStatusText = (userPackage: UserPackage): string => {
  if (userPackage.isExpired) return 'Expired';
  if (userPackage.remainingPasses === 0) return 'Fully Used';
  return 'Active';
};

export const getPackageProgressPercentage = (userPackage: UserPackage): number => {
  if (userPackage.totalPasses === 0) return 0;
  return Math.round((userPackage.usedPasses / userPackage.totalPasses) * 100);
};
