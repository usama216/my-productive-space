// Refund Credit System Service
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

export interface UserCredit {
  id: string;
  userid: string;
  amount: number;
  refundedfrombookingid: string;
  refundedat: string;
  expiresat: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
  createdat: string;
  updatedat: string;
  Booking?: {
    bookingRef: string;
    startAt: string;
    endAt: string;
    location: string;
  };
}

export interface RefundTransaction {
  id: string;
  userid: string;
  bookingid: string;
  refundamount: number;
  creditamount: number;
  refundreason: string;
  refundstatus: 'REQUESTED' | 'APPROVED' | 'REJECTED';
  requestedat: string;
  processedat?: string;
  processedby?: string;
  createdat: string;
  updatedat: string;
  Booking?: {
    bookingRef: string;
    startAt: string;
    endAt: string;
    location: string;
    totalAmount: number;
  };
  User?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreditUsage {
  id: string;
  userid: string;
  creditid: string;
  bookingid: string;
  amountused: number;
  usedat: string;
  createdat: string;
  Booking?: {
    bookingRef: string;
    startAt: string;
    endAt: string;
    location: string;
    totalAmount: number;
  };
}

export interface PaymentCalculation {
  bookingAmount: number;
  availableCredit: number;
  paymentRequired: number;
  canUseCredit: boolean;
}

// User Credit Functions
export const getUserCredits = async (userId: string): Promise<{ credits: UserCredit[]; totalCredit: number; count: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refund/credits?userid=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user credits');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};

export const getUserRefundRequests = async (userId: string): Promise<RefundTransaction[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refund/requests?userid=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch refund requests');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    throw error;
  }
};

export const getUserCreditUsage = async (userId: string): Promise<CreditUsage[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refund/credit-usage?userid=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch credit usage');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching credit usage:', error);
    throw error;
  }
};

export const requestRefund = async (bookingId: string, reason: string, userId: string): Promise<{ message: string; bookingId: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refund/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingid: bookingId,
        reason: reason,
        userid: userId
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to request refund');
    }
    return await response.json();
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
};

export const calculatePayment = async (bookingAmount: number, userId: string): Promise<PaymentCalculation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/credit/calculate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingAmount: bookingAmount,
        userid: userId
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to calculate payment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error calculating payment:', error);
    throw error;
  }
};

// Admin Functions
export const getAllRefundRequests = async (): Promise<RefundTransaction[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/refund/refunds`);
    if (!response.ok) {
      throw new Error('Failed to fetch refund requests');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    throw error;
  }
};

export const getAllUserCredits = async (): Promise<UserCredit[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/refund/credits`);
    if (!response.ok) {
      throw new Error('Failed to fetch user credits');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};

export const approveRefund = async (refundId: string): Promise<{ message: string; creditid: string; creditamount: number; expiresat: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/refund/refunds/${refundId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve refund');
    }
    return await response.json();
  } catch (error) {
    console.error('Error approving refund:', error);
    throw error;
  }
};

export const rejectRefund = async (refundId: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/refund/refunds/${refundId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject refund');
    }
    return await response.json();
  } catch (error) {
    console.error('Error rejecting refund:', error);
    throw error;
  }
};

export const getRefundStats = async (): Promise<{ totalRefunded: number; totalTransactions: number; averageRefund: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/refund/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch refund stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching refund stats:', error);
    throw error;
  }
};
