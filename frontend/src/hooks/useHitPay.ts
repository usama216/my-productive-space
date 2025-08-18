import {
  useCreatePaymentMutation,
  useGetPaymentStatusQuery,
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useVerifyWebhookMutation,
} from '@/store/api/hitpayApi';
import type {
  HitPayPaymentRequest,
  HitPayPaymentResponse,
  HitPayUserProfile,
  HitPayWebhookData,
  TransactionQueryParams,
} from '@/types/hitpay';

export const useHitPay = () => {
  // Payment hooks
  const [createPayment, createPaymentResult] = useCreatePaymentMutation();
  const getPaymentStatus = useGetPaymentStatusQuery;
  
  // Transaction hooks
  const getTransactions = useGetTransactionsQuery;
  const getTransactionById = useGetTransactionByIdQuery;
  
  // User hooks
  const getUserProfile = useGetUserProfileQuery;
  const [updateUserProfile, updateUserProfileResult] = useUpdateUserProfileMutation();
  
  // Webhook hook
  const [verifyWebhook, verifyWebhookResult] = useVerifyWebhookMutation();

  return {
    // Payment functions
    createPayment: async (paymentData: HitPayPaymentRequest) => {
      try {
        const result = await createPayment(paymentData).unwrap();
        return { success: true, data: result };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.data?.message || error.message || 'Payment creation failed' 
        };
      }
    },
    
    getPaymentStatus: (paymentId: string) => {
      return getPaymentStatus(paymentId);
    },
    
    // Transaction functions
    getTransactions: (params?: TransactionQueryParams) => {
      return getTransactions(params || {});
    },
    
    getTransactionById: (transactionId: string) => {
      return getTransactionById(transactionId);
    },
    
    // User functions
    getUserProfile: () => {
      return getUserProfile();
    },
    
    updateUserProfile: async (profileData: Partial<HitPayUserProfile>) => {
      try {
        const result = await updateUserProfile(profileData).unwrap();
        return { success: true, data: result };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.data?.message || error.message || 'Profile update failed' 
        };
      }
    },
    
    // Webhook function
    verifyWebhook: async (webhookData: HitPayWebhookData) => {
      try {
        const result = await verifyWebhook(webhookData).unwrap();
        return { success: true, data: result };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.data?.message || error.message || 'Webhook verification failed' 
        };
      }
    },
    
    // Loading states
    isLoading: createPaymentResult.isLoading || updateUserProfileResult.isLoading || verifyWebhookResult.isLoading,
    
    // Error states
    error: createPaymentResult.error || updateUserProfileResult.error || verifyWebhookResult.error,
  };
};
