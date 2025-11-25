import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { axiosInstance } from '@/config/axios.config';
import { toast } from 'sonner';

interface PaymentDetails {
  sessionId: string;
  amount: number;
  platformFee: number;
  therapistAmount: number;
  consultationMode: string;
  selectedDate: string;
  selectedTime: string;
  therapistName: string;
  status: string;
  createdAt: string;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!sessionId) {
        toast.error('Invalid payment session');
        navigate('/payment/cancel');
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/v1/payment/receipt/${sessionId}`);
        if (response.data.success) {
          setPaymentDetails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        toast.error('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [sessionId, navigate]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Payment details not found</p>
          <button
            onClick={() => navigate('/therapists')}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Return to Therapists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your therapy session has been booked</p>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
            <p className="text-sm text-gray-500 mt-1">
              {/* Transaction ID: {paymentDetails.sessionId} */}
            </p>
          </div>

          {/* Session Details */}
          <div className="space-y-4 mb-6">
            {/* <div className="flex justify-between">
              <span className="text-gray-600">Therapist:</span>
              <span className="font-medium text-gray-900">{paymentDetails.therapistName}</span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Type:</span>
              <span className="font-medium text-gray-900">{paymentDetails.consultationMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">
                {formatDate(paymentDetails.selectedDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium text-gray-900">
                {formatTime(paymentDetails.selectedTime)}
              </span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Session Fee:</span>
              <span>₹{paymentDetails.amount.toFixed(2)}</span>
            </div>
            {/* <div className="flex justify-between text-gray-600">
              <span>Platform Fee (10%):</span>
              <span>₹{paymentDetails.platformFee.toFixed(2)}</span>
            </div> */}
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total Paid:</span>
              <span>₹{paymentDetails.amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Payment Status:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                {paymentDetails.status}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/client/sessions')}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            View My Sessions
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Receipt
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/therapists')}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Therapists
          </button>
        </div>
      </div>
    </div>
  );
}