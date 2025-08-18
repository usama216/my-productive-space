// HitPay API Types

export interface HitPayPaymentRequest {
  amount: number;
  currency: string;
  reference_number: string;
  redirect_url?: string;
  webhook?: string;
  name?: string;
  email?: string;
  phone?: string;
  purpose?: string;
  expiry?: string;
  send_sms?: boolean;
  send_email?: boolean;
}

export interface HitPayPaymentResponse {
  id: string;
  payment_request_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: string;
  payment_method: string;
  reference_number: string;
  redirect_url: string;
  webhook: string;
  created_at: string;
  updated_at: string;
  name?: string;
  email?: string;
  phone?: string;
  purpose?: string;
  expiry?: string;
  send_sms: boolean;
  send_email: boolean;
}

export interface HitPayTransaction {
  id: string;
  payment_request_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: string;
  payment_method: string;
  reference_number: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  failure_reason?: string;
}

export interface HitPayUserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface HitPayWebhookData {
  payment_request_id: string;
  payment_id: string;
  status: string;
  amount: number;
  currency: string;
  reference_number: string;
  payment_type: string;
  payment_method: string;
  signature: string;
}

export interface HitPayApiError {
  message: string;
  code?: string;
  details?: any;
}

// Response wrapper types
export interface HitPayApiResponse<T> {
  success: boolean;
  data?: T;
  error?: HitPayApiError;
}

// Query parameters
export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}
