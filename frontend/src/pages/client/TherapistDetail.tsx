import { useEffect, useState } from 'react';
import { ChevronLeft, MessageSquare, Video, Phone, Calendar, Briefcase, GraduationCap, Loader2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '@/config/axios.config';
import { clientTherapistService } from '@/services/client/clientTherapistService';
import { env } from '@/config/env.config';
import { toast } from 'sonner';
import { API } from '@/constants/api.constant';

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
    } catch (err: any) {
      console.error('Error fetching therapist details:', err);
      setError(err.message || 'Failed to load therapist details');
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

      if (!env.STRIPE_PUBLISHABLE_KEY) {
        toast.error('Payment configuration error. Please contact support.');
        return;
      }

      const response = await axiosInstance.post(API.CLIENT.CREATE_CHECKOUT_SESSION, {
        therapistId: therapistId,
        consultationMode: selectedMode === 'video' ? 'Video' : 'Audio',
        selectedDate: date,
        selectedTime: time,
        price: slotObj.price
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else if (response.data?.data?.url) {
        window.location.href = response.data.data.url;
      } else if (response.data?.success && response.data?.data?.url) {
        window.location.href = response.data.data.url;
      } else {
        console.error('Unexpected response structure:', response.data);
        toast.error('Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment. Please try again.';
      toast.error(errorMessage);
    }
  };

  const showDefaultDates = !selectedDate || availableDates.some(d => d.date === selectedDate);

  // Loading state
if (isLoadingTherapist) {
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading therapist details...</p>
      </div>
    </div>
  );
}

// Error state
if (error || !therapist) {
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{error || 'Therapist not found'}</p>
        <button 
          onClick={() => navigate('/therapists')}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Back to Therapists
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen w-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-8">
        <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
          Back to Therapists
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Therapist Profile Card */}
            <div className="bg-white text-left rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <img
                    src={profileImageUrl || '/placeholder-avatar.png'}
                    alt={therapist.name}
                    className="w-32 h-32 rounded-2xl object-cover"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {therapist.name}
                  </h1>
                  <p className="text-lg text-teal-600 font-medium mb-2">
                    {therapist.title}
                  </p>
                  <p className="text-gray-600 mb-3">
                    {therapist.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Briefcase size={16} />
                      <span>{therapist.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap size={16} />
                      <span>{therapist.qualification}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      <span>Languages: {therapist.languages.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'about'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  About Me
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'about' && (
                  <div>
                    <h2 className="text-xl text-left font-bold text-gray-900 mb-4">About Me</h2>
                    <p className="text-gray-600 text-left leading-relaxed mb-6">
                      {therapist.about}
                    </p>

                    <h3 className="text-lg text-left font-bold text-gray-900 mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {therapist?.expertise?.map((spec, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-8 text-gray-500">
                    Reviews content goes here
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              {/* Available Modes */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  What type of session would you like?
                </h3>
                {isLoadingSchedule ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                ) : availableModes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No consultation modes available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableModes.includes('video') && (
                      <button
                        onClick={() => {
                          setSelectedMode('video');
                          setSelectedSlot('');
                          setSelectedDate('');
                        }}
                        className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedMode === 'video'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Video size={20} />
                        <span className="text-sm font-medium">Video</span>
                      </button>
                    )}
                    {availableModes.includes('audio') && (
                      <button
                        onClick={() => {
                          setSelectedMode('audio');
                          setSelectedSlot('');
                          setSelectedDate('');
                        }}
                        className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedMode === 'audio'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Phone size={20} />
                        <span className="text-sm font-medium">Audio</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Available Slots */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Available slots
                  </h3>
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <Calendar size={20} />
                  </button>
                </div>

                {/* Date Picker Modal */}
                {showDatePicker && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Select Date</h3>
                        <button onClick={() => setShowDatePicker(false)}>
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded">
                            <ChevronLeft size={20} />
                          </button>
                          <span className="font-semibold">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded">
                            <ChevronLeft size={20} className="rotate-180" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
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
                                <button
                                  key={day}
                                  onClick={() => !disabled && handleDateSelect(day)}
                                  disabled={disabled}
                                  className={`p-2 text-sm rounded ${
                                    disabled
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'hover:bg-teal-50 hover:text-teal-700'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            
                            return days;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isLoadingSchedule || isLoadingDates ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                ) : !weeklySchedule || !weeklySchedule.hasSchedule ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No weekly schedule available</p>
                  </div>
                ) : availableDates.length === 0 && showDefaultDates ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No available slots for the selected consultation mode</p>
                  </div>
                ) : (
                  <>
                    {showDefaultDates ? (
                      <>
                        {/* Show next available dates with slots */}
                        {availableDates.map((availDate, index) => (
                          <div key={index} className={index > 0 ? 'mt-4' : ''}>
                            <p className="text-sm text-gray-600 font-medium mb-2">
                              {availDate.displayLabel}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {availDate.slots.map((slot, idx) => {
                                const slotKey = `${availDate.date}-${slot.startTime}`;
                                return (
                                  <button
                                    key={`${availDate.date}-${idx}`}
                                    onClick={() => setSelectedSlot(slotKey)}
                                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                                      selectedSlot === slotKey
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                    }`}
                                  >
                                    {formatTime(slot.startTime)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      /* Custom Date Slots */
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                          {formatDateDisplay(selectedDate)} ({getDayOfWeek(selectedDate)})
                        </p>
                        {customDateSlots.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-2">No available slots for this day</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {customDateSlots.map((slot, idx) => {
                              const slotKey = `${selectedDate}-${slot.startTime}`;
                              return (
                                <button
                                  key={`custom-${idx}`}
                                  onClick={() => setSelectedSlot(slotKey)}
                                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                                    selectedSlot === slotKey
                                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                  }`}
                                >
                                  {formatTime(slot.startTime)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-700">Session Fee:</span>
                  <span className="text-2xl font-bold text-teal-600">
                    ₹{getSessionPrice()}/session
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  disabled={!selectedSlot || isLoadingSchedule || isLoadingDates}
                  className={`w-full font-medium py-3 rounded-lg transition-colors ${
                    selectedSlot && !isLoadingSchedule && !isLoadingDates
                      ? 'bg-teal-500 hover:bg-teal-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={makePayment}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}