import { axiosInstance } from '@/config/axios.config';
import { API } from '@/constants/api.constant';

interface CreateCheckoutSessionPayload {
  therapistId: string;
  consultationMode: string;
  selectedDate: string;
  selectedTime: string;
  price: number;
}

interface WalletPaymentPayload {
  therapistId: string;
  consultationMode: string;
  selectedDate: string;
  selectedTime: string;
  price: number;
}

interface CheckoutSessionResponse {
  success: boolean;
  data?: {
    url?: string;
  };
  url?: string;
}

interface WalletPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    appointmentId: string;
    transactionId: string;
  };
}

export const paymentService = {
  createCheckoutSession: async (payload: CreateCheckoutSessionPayload): Promise<CheckoutSessionResponse> => {
    try {
      const response = await axiosInstance.post<CheckoutSessionResponse>(
        API.CLIENT.CREATE_CHECKOUT_SESSION,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  payWithWallet: async (payload: WalletPaymentPayload): Promise<WalletPaymentResponse> => {
    try {
      const response = await axiosInstance.post<WalletPaymentResponse>(
        '/api/v1/payment/wallet-payment',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error processing wallet payment:', error);
      throw error;
    }
  },
};
