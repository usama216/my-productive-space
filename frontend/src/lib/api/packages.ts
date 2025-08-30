// src/lib/api/packages.ts
// Package management API service

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

export interface Package {
  id: string;
  name: string;
  type: 'cowork' | 'costudy' | 'colearn';
  price: number;
  originalPrice: number;
  description: string;
  bonus: string;
  validity: number;
  outletFee: number;
  passes: Array<{
    type: string;
    hours: number;
    count: number;
  }>;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  billingAddress?: string;
  postalCode?: string;
}

export interface PurchaseRequest {
  userId: string;
  packageId: string;
  quantity: number;
  customerInfo: CustomerInfo;
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
  amount: string; // Changed to string to match backend expectation
  paymentMethod: 'card' | 'paynow_online'; // Updated to match backend
  customerInfo: CustomerInfo;
  redirectUrl: string;
  webhookUrl: string; // Added webhook URL field
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    hitpayPaymentUrl: string;
    referenceNumber: string;
    paymentId: string;
  };
}

export interface ConfirmRequest {
  userPackageId: string;
  orderId: string;
  hitpayReference: string;
  paymentStatus: string;
}

export interface ConfirmResponse {
  success: boolean;
  message: string;
  data: {
    userPackageId: string;
    paymentStatus: string;
    activatedAt: string;
    expiresAt: string;
    package?: {
      id: string;
      name: string;
      type: string;
      price: number;
      originalPrice: number;
      description: string;
      bonus: string;
      validity: number;
      outletFee: number;
      passes: Array<{
        type: string;
        hours: number;
        count: number;
      }>;
    };
  };
}

export interface UserPackage {
  id: string;
  packageId: string;
  packageName: string;
  packageType: string;
  description: string;
  bonusDescription: string;
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
  hitpayReference: string;
  customerInfo: CustomerInfo;
  createdAt: string;
}

// API Functions
export const packagesApi = {
  // Get all available packages
  async getAllPackages(): Promise<Package[]> {
    try {
      console.log('Fetching packages from:', `${API_BASE_URL}/packages`);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/packages`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      // Handle both response formats: { packages: [...] } or direct array
      const packages = data.packages || data || [];
      console.log('Extracted packages:', packages);
      
      return packages;
    } catch (error) {
      console.error('Error fetching packages:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - Backend API not responding');
      }
      throw error;
    }
  },

  // Get package by ID
  async getPackageById(id: string): Promise<Package> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.package;
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  },

  // Step 1: Create package purchase record (data only, no payment)
  async createPackagePurchase(purchaseData: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      console.log('Creating package purchase:', purchaseData);
      
      const response = await fetch(`${API_BASE_URL}/packages/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Package purchase creation failed');
      }

      const result = await response.json();
      console.log('Package purchase created:', result);
      return result;
    } catch (error) {
      console.error('Error creating package purchase:', error);
      throw error;
    }
  },

  // Step 2: Create payment (same as booking system)
  async createPackagePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Creating package payment:', paymentData);
      
      const response = await fetch(`${API_BASE_URL}/packages/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Package payment creation failed');
      }

      const result = await response.json();
      console.log('Package payment created:', result);
      return result;
    } catch (error) {
      console.error('Error creating package payment:', error);
      throw error;
    }
  },

  // Step 3: Confirm package purchase after payment
  async confirmPackagePurchase(confirmData: ConfirmRequest): Promise<ConfirmResponse> {
    try {
      console.log('Confirming package purchase:', confirmData);
      
      const response = await fetch(`${API_BASE_URL}/packages/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Package purchase confirmation failed');
      }

      const result = await response.json();
      console.log('Package purchase confirmed:', result);
      return result;
    } catch (error) {
      console.error('Error confirming package purchase:', error);
      throw error;
    }
  },

  // Get purchase status
  async getPurchaseStatus(orderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/status/${orderId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching purchase status:', error);
      throw error;
    }
  },

  // Get user's active packages
  async getUserPackages(userId: string): Promise<UserPackage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/user/${userId}/packages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.activePackages || [];
    } catch (error) {
      console.error('Error fetching user packages:', error);
      throw error;
    }
  },

  // Get user's available passes
  async getUserPasses(userId: string): Promise<UserPass[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/user/${userId}/passes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.availablePasses || [];
    } catch (error) {
      console.error('Error fetching user passes:', error);
      throw error;
    }
  },

  // Use a pass for booking
  async usePass(userId: string, passId: string, bookingId: string, locationId: string, startTime: string, endTime: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/passes/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          passId,
          bookingId,
          locationId,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Pass usage failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error using pass:', error);
      throw error;
    }
  },

  // Get user's purchase history
  async getUserPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/user/${userId}/history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.purchaseHistory || [];
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }
  },
};
