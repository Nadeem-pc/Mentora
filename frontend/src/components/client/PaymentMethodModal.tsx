import React, { useState, useEffect } from 'react';
import { X, Wallet, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { walletService } from '@/services/shared/walletService';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onWalletPayment: () => Promise<void>;
  onStripePayment: () => Promise<void>;
  isLoading?: boolean;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  amount,
  onWalletPayment,
  onStripePayment,
  isLoading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'stripe' | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWalletBalance();
    }
  }, [isOpen]);

  const fetchWalletBalance = async () => {
    try {
      setIsLoadingWallet(true);
      const data = await walletService.getUserWallet();
      setWalletBalance(data.wallet?.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance < amount) {
      toast.error(`Insufficient wallet balance. You need ₹${amount - walletBalance} more.`);
      return;
    }

    try {
      setIsProcessing(true);
      await onWalletPayment();
    } catch (error) {
      console.error('Wallet payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      await onStripePayment();
    } catch (error) {
      console.error('Stripe payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const hasInsufficientBalance = walletBalance < amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
          <button
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-blue-600">₹{amount}</p>
          </div>

          {/* Wallet Option */}
          <button
            onClick={() => setSelectedMethod('wallet')}
            disabled={isProcessing || isLoading || isLoadingWallet}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedMethod === 'wallet'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${selectedMethod === 'wallet' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Wallet className={`w-5 h-5 ${selectedMethod === 'wallet' ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold ${selectedMethod === 'wallet' ? 'text-green-700' : 'text-gray-900'}`}>
                  Pay with Wallet
                </p>
                {isLoadingWallet ? (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading balance...
                  </p>
                ) : (
                  <p className={`text-sm ${hasInsufficientBalance ? 'text-red-600' : 'text-gray-600'}`}>
                    Available: ₹{walletBalance}
                  </p>
                )}
              </div>
            </div>
          </button>

          {/* Insufficient Balance Warning */}
          {hasInsufficientBalance && selectedMethod === 'wallet' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Insufficient Balance</p>
                <p className="text-xs text-red-600 mt-1">
                  You need ₹{amount - walletBalance} more to complete this payment.
                </p>
              </div>
            </div>
          )}

          {/* Stripe Option */}
          <button
            onClick={() => setSelectedMethod('stripe')}
            disabled={isProcessing || isLoading}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedMethod === 'stripe'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${selectedMethod === 'stripe' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CreditCard className={`w-5 h-5 ${selectedMethod === 'stripe' ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold ${selectedMethod === 'stripe' ? 'text-blue-700' : 'text-gray-900'}`}>
                  Pay with Card (Stripe)
                </p>
                <p className="text-sm text-gray-600">Visa, Mastercard, and more</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedMethod === 'wallet') {
                handleWalletPayment();
              } else if (selectedMethod === 'stripe') {
                handleStripePayment();
              }
            }}
            disabled={!selectedMethod || isProcessing || isLoading || (selectedMethod === 'wallet' && hasInsufficientBalance)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedMethod && !hasInsufficientBalance
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
