import { useEffect, useState } from 'react';
import { ChevronLeft, MessageSquare, Video, Phone, Calendar, Briefcase, GraduationCap, Loader2, X, Languages, Award, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '@/config/axios.config';
import { clientTherapistService } from '@/services/client/clientTherapistService';
import { env } from '@/config/env.config';
import { toast } from 'sonner';
import { PaymentMethodModal } from '@/components/client/PaymentMethodModal';
import { paymentService } from '@/services/client/paymentService';
import Header from '@/components/client/Header';

interface WeeklySlot {
  _id?: string;
  startTime: string;
  modes: string[];
  price: number;
}

interface DaySchedule {
  day: string;
  slots: WeeklySlot[];
}

interface WeeklyScheduleData {
  hasSchedule: boolean;
  schedule: DaySchedule[];
}

interface AvailableDate {
  date: string;
  displayLabel: string;
  slots: WeeklySlot[];
}

interface Therapist {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  image: string;
  rating: number;
  experience: string;
  qualification: string;
  languages: string[];
  about: string;
  expertise: string[];
  price: number;
  gender: string;
  email: string;
  phone: string;
}

interface TherapistReview {
  id: string;
  rating: number;
  review: string;
  createdAt: string | Date;
  client: {
    fullName: string;
    profileImg?: string | null;
  };
}

export default function TherapistDetailPage() {
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoadingTherapist, setIsLoadingTherapist] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedMode, setSelectedMode] = useState<'video' | 'audio'>('video');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleData | null>(null);
  const [availableModes, setAvailableModes] = useState<string[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [customDateSlots, setCustomDateSlots] = useState<WeeklySlot[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sessionPrice, setSessionPrice] = useState(0);

  const [reviews, setReviews] = useState<TherapistReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewImageUrls, setReviewImageUrls] = useState<Record<string, string>>({});
  const [totalRatingsCount, setTotalRatingsCount] = useState(0);

  const navigate = useNavigate();
  const { therapistId } = useParams<{ therapistId: string }>();

  const getPreSignedURL = async (fileName: string) => {
    try {
      const response = await axiosInstance.get('/therapist/s3-getPresigned-url', {
        params: { key: fileName },
      });
      return response.data.get_fileURL;
    } catch (error) {
      console.error('Error getting pre-signed URL:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const getClientImageURL = async (fileName: string) => {
    try {
      const response = await axiosInstance.get('/client/s3-getPresigned-url', {
        params: { key: fileName },
      });
      return response.data.get_fileURL || response.data.getURL || '';
    } catch (error) {
      console.error('Error getting client image pre-signed URL:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchWeeklySchedule = async () => {
      if (!therapistId) return;
      
      try {
        setIsLoadingSchedule(true);
        const response = await clientTherapistService.getTherapistWeeklySchedule(therapistId);
        
        if (response.success && response.data) {
          setWeeklySchedule(response.data);
          
          // Extract unique consultation modes
          const modes = new Set<string>();
          if (response.data.hasSchedule && response.data.schedule) {
            response.data.schedule.forEach((day: DaySchedule) => {
              day.slots.forEach(slot => {
                slot.modes.forEach(mode => {
                  const normalizedMode = mode.toLowerCase();
                  modes.add(normalizedMode);
                });
              });
            });
          }
          
          const modesArray = Array.from(modes);
          setAvailableModes(modesArray);
          
          // Set default mode
          if (modesArray.includes('video')) {
            setSelectedMode('video');
          } else if (modesArray.includes('audio')) {
            setSelectedMode('audio');
          }
        }
      } catch (error) {
        console.error('Error fetching therapist weekly schedule:', error);
        toast.error('Failed to load weekly schedule');
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchWeeklySchedule();
  }, [therapistId]);

  // Fetch therapist details using path param
useEffect(() => {
  const fetchTherapistDetails = async () => {
    if (!therapistId) {
      setError('No therapist ID provided');
      setIsLoadingTherapist(false);
      return;
    }

    try {
      setIsLoadingTherapist(true);
      setError(null);
      
      const response = await clientTherapistService.getTherapistDetails(therapistId);
      
      if (response.success && response.data) {
        setTherapist(response.data);
      } else {
        setError('Failed to load therapist details');
      }
    } catch (err: unknown) {
      console.error('Error fetching therapist details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load therapist details';
      setError(errorMessage);
    } finally {
      setIsLoadingTherapist(false);
    }
  };

  fetchTherapistDetails();
}, [therapistId]);

  useEffect(() => {
    const getProfileImg = async () => {
      try {
        if (therapist?.image) {
          const imgUrl = await getPreSignedURL(therapist.image);
          setProfileImageUrl(imgUrl);
        } 
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    if (therapist) {
      getProfileImg();
    }
  }, [therapist]);

  // Fetch therapist reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!therapistId) return;

      try {
        setIsLoadingReviews(true);
        setReviewsError(null);

        const response = await clientTherapistService.getTherapistReviews(therapistId);

        if (response.success && Array.isArray(response.data)) {
          const rawReviews = response.data as TherapistReview[];

          // Only keep reviews that actually have feedback text
          const filteredReviews = rawReviews.filter((review) =>
            typeof review.review === 'string' && review.review.trim().length > 0
          );

          // Total count based only on reviews with feedback
          setTotalRatingsCount(filteredReviews.length);

          setReviews(filteredReviews);

          // Load client profile images when keys are available
          const urlPromises = filteredReviews.map(async (review) => {
            if (review.client?.profileImg) {
              const url = await getClientImageURL(review.client.profileImg);
              return { id: review.id, url };
            }
            return { id: review.id, url: '' };
          });

          const urls = await Promise.all(urlPromises);
          const urlMap = urls.reduce((acc, { id, url }) => {
            if (url) acc[id] = url;
            return acc;
          }, {} as Record<string, string>);
          setReviewImageUrls(urlMap);
        } else {
          setReviews([]);
          setReviewImageUrls({});
          setTotalRatingsCount(0);
        }
      } catch (error) {
        console.error('Error fetching therapist reviews:', error);
        setReviewsError('Failed to load reviews');
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [therapistId]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!weeklySchedule || !therapistId) return;
      
      setIsLoadingDates(true);
      const dates: AvailableDate[] = [];
      const today = new Date();
      
      try {
        // Check next 14 days
        for (let i = 0; i < 14 && dates.length < 2; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          
          const year = checkDate.getFullYear();
          const month = String(checkDate.getMonth() + 1).padStart(2, '0');
          const day = String(checkDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          const response = await clientTherapistService.getAvailableSlotsForDate(
            therapistId,
            dateStr
          );
          
          if (response.success && response.data.hasSlots) {
            // Filter by selected mode
            const filteredSlots = response.data.slots.filter((slot: WeeklySlot) =>
              slot.modes.includes(selectedMode.toLowerCase())
            );
            
            if (filteredSlots.length > 0) {
              let displayLabel = '';
              if (i === 0) {
                displayLabel = 'Today';
              } else if (i === 1) {
                displayLabel = 'Tomorrow';
              } else {
                displayLabel = formatDateDisplay(dateStr);
              }
              
              dates.push({
                date: dateStr,
                displayLabel: `${displayLabel} (${getDayOfWeek(dateStr)})`,
                slots: filteredSlots
              });
            }
          }
        }
        
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error fetching available dates:', error);
        toast.error('Failed to load available slots');
      } finally {
        setIsLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, [weeklySchedule, selectedMode, therapistId]);

  const getDayOfWeek = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const handleDateSelect = async (day: number) => {
    if (!therapistId) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setSelectedDate(dateStr);
    setSelectedSlot('');
    setShowDatePicker(false);
    
    // Fetch available slots for the selected date
    try {
      const response = await clientTherapistService.getAvailableSlotsForDate(
        therapistId,
        dateStr
      );
      
      if (response.success && response.data.hasSlots) {
        const filteredSlots = response.data.slots.filter((slot: WeeklySlot) =>
          slot.modes.includes(selectedMode.toLowerCase())
        );
        setCustomDateSlots(filteredSlots);
      } else {
        setCustomDateSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots for date:', error);
      toast.error('Failed to load slots for selected date');
      setCustomDateSlots([]);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateToCheck = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const getSessionPrice = () => {
    if (!therapist) return 0;
    if (!weeklySchedule || !weeklySchedule.hasSchedule) return therapist.price;
    
    let allSlots: WeeklySlot[] = [];
    weeklySchedule.schedule.forEach(day => {
      allSlots = allSlots.concat(day.slots);
    });
    
    const filteredSlots = allSlots.filter(slot => 
      slot.modes.map(m => m.toLowerCase()).includes(selectedMode.toLowerCase())
    );
    
    return filteredSlots.length > 0 ? filteredSlots[0].price : therapist.price;
  };

  const makePayment = async () => {
    try {
      if (!selectedSlot) {
        toast.error('Please select a slot');
        return;
      }

      const lastDashIndex = selectedSlot.lastIndexOf('-');
      const date = selectedSlot.substring(0, lastDashIndex);
      const time = selectedSlot.substring(lastDashIndex + 1);
      
      // Get the selected slot from available dates or custom date slots
      const showDefaultDates = !selectedDate || availableDates.some(d => d.date === selectedDate);
      let slotObj: WeeklySlot | undefined;
      
      if (showDefaultDates) {
        const dateSlots = availableDates.find(d => d.date === date);
        slotObj = dateSlots?.slots.find(slot => slot.startTime === time);
      } else {
        slotObj = customDateSlots.find(slot => slot.startTime === time);
      }

      if (!slotObj) {
        toast.error('Invalid slot selected. Please try again.');
        return;
      }

      // Set session price and show payment modal
      setSessionPrice(slotObj.price);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  const handleWalletPayment = async () => {
    try {
      if (!selectedSlot || !therapistId) {
        toast.error('Invalid selection. Please try again.');
        return;
      }

      const lastDashIndex = selectedSlot.lastIndexOf('-');
      const date = selectedSlot.substring(0, lastDashIndex);
      const time = selectedSlot.substring(lastDashIndex + 1);

      const response = await paymentService.payWithWallet({
        therapistId,
        consultationMode: selectedMode === 'video' ? 'Video' : 'Audio',
        selectedDate: date,
        selectedTime: time,
        price: sessionPrice
      });

      if (response.success) {
        toast.success('Appointment booked successfully!');
        setShowPaymentModal(false);
        // Reset form
        setSelectedSlot('');
        setSelectedDate('');
        setSelectedMode('video');
        // Navigate to appointments or dashboard
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        toast.error(response.message || 'Payment failed. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Wallet payment error:', error);
      let errorMessage = 'Wallet payment failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const errResponse = error as { response?: { data?: { message?: string } } };
        errorMessage = errResponse.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const handleStripePayment = async () => {
    try {
      if (!selectedSlot || !therapistId) {
        toast.error('Invalid selection. Please try again.');
        return;
      }

      const lastDashIndex = selectedSlot.lastIndexOf('-');
      const date = selectedSlot.substring(0, lastDashIndex);
      const time = selectedSlot.substring(lastDashIndex + 1);

      if (!env.STRIPE_PUBLISHABLE_KEY) {
        toast.error('Payment configuration error. Please contact support.');
        return;
      }

      const response = await paymentService.createCheckoutSession({
        therapistId,
        consultationMode: selectedMode === 'video' ? 'Video' : 'Audio',
        selectedDate: date,
        selectedTime: time,
        price: sessionPrice
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else if (response.url) {
        window.location.href = response.url;
      } else {
        toast.error('Failed to create payment session');
      }
    } catch (error: unknown) {
      console.error('Stripe payment error:', error);
      let errorMessage = 'Failed to initiate payment. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const errResponse = error as { response?: { data?: { message?: string } } };
        errorMessage = errResponse.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const showDefaultDates = !selectedDate || availableDates.some(d => d.date === selectedDate);

  // Loading state
if (isLoadingTherapist) {
  return (
    <>
      <Header />
      <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center pt-16">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-teal-400/20 blur-xl animate-pulse"></div>
          </div>
          <motion.p 
            className="mt-6 text-gray-700 dark:text-gray-300 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading therapist details...
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}

// Error state
if (error || !therapist) {
  return (
    <>
      <Header />
      <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center pt-16">
        <motion.div 
          className="text-center max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 text-lg mb-6 font-medium">{error || 'Therapist not found'}</p>
          <button 
            onClick={() => navigate('/therapists')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
          >
            Back to Therapists
          </button>
        </motion.div>
      </div>
    </>
  );
}

  return (
    <>
      <Header />
      <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        
        {/* Back Button */}
        <div className="relative z-10 px-4 pt-24 pb-4 md:px-8">
          {/* <motion.button 
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors group"
            onClick={() => navigate(-1)}
            whileHover={{ x: -4 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Therapists
          </motion.button> */}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Enhanced Therapist Profile Card */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-teal-100 dark:border-teal-900 overflow-hidden relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-200/10 to-cyan-200/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0 w-full md:w-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <img
                      src={profileImageUrl || '/placeholder-avatar.png'}
                      alt={therapist.name}
                      className="relative w-full h-80 md:w-40 md:h-40 rounded-3xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-xl"
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl text-center md:text-left md:text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {therapist.name}
                  </h1>
                  <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 font-semibold mb-2">
                    {therapist.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {therapist.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{therapist.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{therapist.qualification}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {therapist.languages.join(', ')}
                    </span>
                  </div>

                  {/* Overall Rating */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-md font-semibold text-gray-900 dark:text-white">
                        {therapist.rating > 0 ? therapist.rating.toFixed(1) : 'New • Be the first to review'}
                      </span>
                      {therapist.rating > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">overall rating</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Tabs */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-teal-100 dark:border-teal-900 overflow-hidden mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-teal-50/50 dark:from-gray-700/50 dark:to-gray-800/50">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === 'about'
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  About Me
                  {activeTab === 'about' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-600"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === 'reviews'
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Reviews</span>
                    {totalRatingsCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                        {totalRatingsCount}
                      </span>
                    )}
                  </span>
                  {activeTab === 'reviews' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-600"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-gray-600 text-left dark:text-gray-400 leading-relaxed mb-8 text-lg">
                        {therapist.about}
                      </p>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        Specializations
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {therapist?.expertise?.map((spec, index) => (
                          <motion.span
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 rounded-xl text-sm font-semibold border border-teal-200 dark:border-teal-700 shadow-sm"
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {spec}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="py-4"
                    >
                      {isLoadingReviews && (
                        <div className="flex justify-center py-8">
                          <div className="relative">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                            <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl"></div>
                          </div>
                        </div>
                      )}

                      {!isLoadingReviews && reviewsError && (
                        <div className="text-center py-8 text-red-500 dark:text-red-400">
                          {reviewsError}
                        </div>
                      )}

                      {!isLoadingReviews && !reviewsError && reviews.length === 0 && (
                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No reviews yet. 
                            {/* No reviews yet. Be the first to share your experience. */}
                          </p>
                        </div>
                      )}

                      {!isLoadingReviews && !reviewsError && reviews.length > 0 && (
                        <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-hide text-left">
                          {reviews.map((review) => {
                            const created = new Date(review.createdAt);
                            const formattedDate = created.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            });
                            const avatarUrl = reviewImageUrls[review.id];
                            const initials = review.client.fullName
                              .split(' ')
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase();

                            return (
                              <div
                                key={review.id}
                                className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4"
                              >
                                <div className="flex-shrink-0">
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={review.client.fullName}
                                      className="w-10 h-10 rounded-full object-cover border border-teal-200 dark:border-teal-700"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                                      {initials}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {review.client.fullName}
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        className={
                                          star <= review.rating
                                            ? 'text-amber-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                        }
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {review.review}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Enhanced Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 sticky top-6 border border-teal-100 dark:border-teal-900"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Available Modes */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Consultation Mode
                </h3>
                {isLoadingSchedule ? (
                  <div className="flex justify-center py-8">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl"></div>
                    </div>
                  </div>
                ) : availableModes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No consultation modes available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availableModes.includes('video') && (
                      <motion.button
                        onClick={() => {
                          setSelectedMode('video');
                          setSelectedSlot('');
                          setSelectedDate('');
                        }}
                        className={`flex flex-col items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                          selectedMode === 'video'
                            ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-gray-700/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Video className={`w-6 h-6 ${selectedMode === 'video' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        <span className={`text-sm font-semibold ${selectedMode === 'video' ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>Video</span>
                      </motion.button>
                    )}
                    {availableModes.includes('audio') && (
                      <motion.button
                        onClick={() => {
                          setSelectedMode('audio');
                          setSelectedSlot('');
                          setSelectedDate('');
                        }}
                        className={`flex flex-col items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                          selectedMode === 'audio'
                            ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-gray-700/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Phone className={`w-6 h-6 ${selectedMode === 'audio' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        <span className={`text-sm font-semibold ${selectedMode === 'audio' ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>Audio</span>
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Available Slots */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Available Slots
                  </h3>
                  <motion.button 
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Calendar size={20} />
                  </motion.button>
                </div>

                {/* Enhanced Date Picker Modal */}
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div 
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowDatePicker(false)}
                    >
                      <motion.div 
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Date</h3>
                          <motion.button 
                            onClick={() => setShowDatePicker(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            whileHover={{ rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X size={20} className="text-gray-600 dark:text-gray-400" />
                          </motion.button>
                        </div>
                      
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-4">
                            <motion.button 
                              onClick={goToPreviousMonth} 
                              className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              whileHover={{ x: -2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ChevronLeft size={20} />
                            </motion.button>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <motion.button 
                              onClick={goToNextMonth} 
                              className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ChevronLeft size={20} className="rotate-180" />
                            </motion.button>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                              <div key={day} className="text-center text-xs font-bold text-gray-600 dark:text-gray-400 py-2">
                                {day}
                              </div>
                            ))}
                            
                            {(() => {
                              const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                              const days = [];
                              
                              for (let i = 0; i < startingDayOfWeek; i++) {
                                days.push(<div key={`empty-${i}`} />);
                              }
                              
                              for (let day = 1; day <= daysInMonth; day++) {
                                const disabled = isDateDisabled(day);
                                days.push(
                                  <motion.button
                                    key={day}
                                    onClick={() => !disabled && handleDateSelect(day)}
                                    disabled={disabled}
                                    className={`p-2 text-sm rounded-lg font-medium ${
                                      disabled
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400'
                                    }`}
                                    whileHover={disabled ? {} : { scale: 1.1 }}
                                    whileTap={disabled ? {} : { scale: 0.9 }}
                                  >
                                    {day}
                                  </motion.button>
                                );
                              }
                              
                              return days;
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLoadingSchedule || isLoadingDates ? (
                  <div className="flex justify-center py-8">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl"></div>
                    </div>
                  </div>
                ) : !weeklySchedule || !weeklySchedule.hasSchedule ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No weekly schedule available</p>
                  </div>
                ) : availableDates.length === 0 && showDefaultDates ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No available slots for the selected consultation mode</p>
                  </div>
                ) : (
                  <>
                    {showDefaultDates ? (
                      <>
                        {/* Show next available dates with slots */}
                        {availableDates.map((availDate, index) => (
                          <div key={index} className={index > 0 ? 'mt-6' : ''}>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-3">
                              {availDate.displayLabel}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {availDate.slots.map((slot, idx) => {
                                const slotKey = `${availDate.date}-${slot.startTime}`;
                                return (
                                  <motion.button
                                    key={`${availDate.date}-${idx}`}
                                    onClick={() => setSelectedSlot(slotKey)}
                                    className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                                      selectedSlot === slotKey
                                        ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 shadow-md'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-gray-700/50'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {formatTime(slot.startTime)}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      /* Custom Date Slots */
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-3">
                          {formatDateDisplay(selectedDate)} ({getDayOfWeek(selectedDate)})
                        </p>
                        {customDateSlots.length === 0 ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">No available slots for this day</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {customDateSlots.map((slot, idx) => {
                              const slotKey = `${selectedDate}-${slot.startTime}`;
                              return (
                                <motion.button
                                  key={`custom-${idx}`}
                                  onClick={() => setSelectedSlot(slotKey)}
                                  className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                                    selectedSlot === slotKey
                                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 shadow-md'
                                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-gray-700/50'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {formatTime(slot.startTime)}
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Enhanced Pricing */}
              <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl border border-teal-200 dark:border-teal-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Session Fee:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                      ₹{getSessionPrice()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">/session</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Button */}
              <motion.button 
                disabled={!selectedSlot || isLoadingSchedule || isLoadingDates}
                className={`w-full font-bold py-4 rounded-xl transition-all text-base ${
                  selectedSlot && !isLoadingSchedule && !isLoadingDates
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                onClick={makePayment}
                whileHover={selectedSlot && !isLoadingSchedule && !isLoadingDates ? { scale: 1.02 } : {}}
                whileTap={selectedSlot && !isLoadingSchedule && !isLoadingDates ? { scale: 0.98 } : {}}
              >
                Proceed to Payment
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={sessionPrice}
        onWalletPayment={handleWalletPayment}
        onStripePayment={handleStripePayment}
      />
    </div>
    </>
  );
}