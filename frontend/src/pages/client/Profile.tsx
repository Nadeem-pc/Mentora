import React, { useEffect, useRef, useState } from 'react';
import profile_avatar from '../../assets/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_5247852-removebg-preview.png';
import { User, Edit3, Camera, Mail, Phone, Calendar, LogOut, X, Clock, Video, CheckCircle, XCircle, CalendarDays, IndianRupee, AlertCircle, Ban, Wallet, ArrowUpRight, ArrowDownLeft, Star } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropper from '@/components/shared/ImageCropper';
import { S3BucketUtil } from '@/utils/S3Bucket.util';
import { AuthService } from '@/services/shared/authServices';
import { useNavigate } from 'react-router-dom';
import { clientProfileService, type Appointment } from '@/services/client/profileServices';
import type { UserProfile } from '@/types/dtos/user.dto';
import ConfirmationModal from '@/components/shared/Modal';
import { walletService } from '@/services/shared/walletService';
import Header from '@/components/client/Header';
import { useAuth } from '@/contexts/auth.context';
import SessionVideoCall from '@/components/client/SessionVideoCall';
import { getSocket } from '@/config/socket.config';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: string;
  date: string;
  metadata?: unknown;
}

interface WalletData {
  wallet: {
    id: string;
    balance: number;
    ownerId: string;
    ownerType: string;
  };
  statistics: {
    totalRevenue: number;
    thisMonthRevenue: number;
    platformFee: number;
    balance: number;
  };
  transactions: WalletTransaction[];
  pagination: {
    currentPage: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface AppointmentDetail {
  _id: string;
  therapistId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImg?: string | null;
  };
  slotId: {
    _id: string;
    time: string;
    fees: number;
    consultationModes: string[];
  };
  appointmentDate: string;
  appointmentTime: string;
  consultationMode: "video" | "audio";
  status: "scheduled" | "completed" | "cancelled";
  issue?: string;
  notes?: string;
  sessionFee?: number;
  paymentMethod: "wallet" | "stripe" | "unknown";
  feedback?: {
    rating: number;
    review: string;
    createdAt: string;
  } | null;
}

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState('Personal Details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [originalData, setOriginalData] = useState<UserProfile | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState<AppointmentDetail | null>(null);
  const [selectedAppointmentIdForDetail, setSelectedAppointmentIdForDetail] = useState<string | null>(null);
  const [isLoadingAppointmentDetail, setIsLoadingAppointmentDetail] = useState(false);
  const [appointmentDetailError, setAppointmentDetailError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletPagination, setWalletPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0
  });
  const [walletTypeFilter, setWalletTypeFilter] = useState<'credit' | 'debit' | ''>('');
  const [walletStartDate, setWalletStartDate] = useState('');
  const [walletEndDate, setWalletEndDate] = useState('');

  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [activeCallTherapistId, setActiveCallTherapistId] = useState<string | null>(null);
  const [activeCallAppointmentId, setActiveCallAppointmentId] = useState<string | null>(null);
  const [endedAppointments, setEndedAppointments] = useState<Record<string, boolean>>({});
  const [joinCountdowns, setJoinCountdowns] = useState<Record<string, number>>({});

  const navigate = useNavigate();

  const cancelReasons = [
    'Personal emergency',
    'Feeling better / No longer needed',
    'Financial reasons',
    'Found another therapist',
    'Other'
  ];

  const parseAppointmentDateTime = (dateStr: string, timeStr: string | undefined): Date | null => {
    const baseDate = new Date(dateStr);
    if (isNaN(baseDate.getTime())) return null;

    if (!timeStr) return baseDate;

    const trimmed = timeStr.trim();
    if (!trimmed) return baseDate;

    let hours = 0;
    let minutes = 0;
    let isPM = false;
    let hasAmPm = false;

    const amPmMatch = trimmed.match(/(am|pm)$/i);
    if (amPmMatch) {
      hasAmPm = true;
      isPM = amPmMatch[1].toLowerCase() === 'pm';
    }

    const cleaned = trimmed.replace(/(am|pm)/i, '').trim();
    const [hStr, mStr] = cleaned.split(':');
    hours = parseInt(hStr || '0', 10) || 0;
    minutes = parseInt(mStr || '0', 10) || 0;

    if (hasAmPm) {
      if (hours === 12) {
        hours = isPM ? 12 : 0;
      } else if (isPM) {
        hours += 12;
      }
    }

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  };

  const formatJoinCountdown = (ms: number): string => {
    if (ms <= 0) return 'Starting soon';

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
    }

    return `${hours}h ${minutes}m ${seconds}s left`;
  };

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const updateCountdowns = () => {
      const now = Date.now();
      const next: Record<string, number> = {};

      appointments.forEach((apt) => {
        const start = parseAppointmentDateTime(apt.appointmentDate, apt.slotId?.time);
        if (!start) return;
        const joinOpenTime = start.getTime() - 10 * 60 * 1000;
        next[apt._id] = joinOpenTime - now;
      });

      setJoinCountdowns(next);
    };

    updateCountdowns();
    const intervalId = window.setInterval(updateCountdowns, 1000);
    return () => window.clearInterval(intervalId);
  }, [appointments]);

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedCancelReason('');
    setCustomCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelModalClose = () => {
    if (!isCancelling) {
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setSelectedCancelReason('');
      setCustomCancelReason('');
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedCancelReason) {
      toast.error('Please select a reason for cancellation');
      return;
    }

    if (!selectedAppointment) return;

    try {
      setIsCancelling(true);
      
      const finalReason = customCancelReason.trim() 
        ? `${selectedCancelReason}: ${customCancelReason.trim()}`
        : selectedCancelReason;

      const response = await clientProfileService.cancelAppointment(
        selectedAppointment._id, 
        finalReason
      );
      
      if (response.success) {
        // Update the appointments list
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === selectedAppointment._id 
              ? { ...apt, status: 'cancelled', cancelReason: finalReason }
              : apt
          )
        );

        // Show success message with refund info if available
        const message = response.refundAmount 
          ? `Appointment cancelled successfully. ₹${response.refundAmount} has been refunded to your wallet.`
          : 'Appointment cancelled successfully';
        
        toast.success(message);
        handleCancelModalClose();
      }
    } catch (error: unknown) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel appointment';
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    if (email.length > 254) {
      return 'Email is too long';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return 'Please enter a valid 10-digit phone number starting with 6-9';
    }
    return undefined;
  };

  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name || name.trim() === '') {
      return `${fieldName} is required`;
    }
    
    if (name.includes(' ')) {
      return `${fieldName} cannot contain spaces`;
    }
    
    if (name.trim().length < 3) {
      return `${fieldName} must be at least 3 characters`;
    }
    
    if (name.trim().length > 20) {
      return `${fieldName} must be less than 20 characters`;
    }
    
    const isRepeatingChars = /^(.)\1+$/.test(name.trim());
    if (isRepeatingChars) {
      return `${fieldName} cannot contain only repeating characters`;
    }
    
    const nameRegex = /^[a-zA-Z'-]+$/;
    if (!nameRegex.test(name)) {
      return `${fieldName} can only contain letters, hyphens, and apostrophes`;
    }
    
    return undefined;
  };

  const validateDOB = (dob: string): string | undefined => {
    if (!dob || dob.trim() === '') {
      return 'Date of birth is required';
    }
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      return 'Please enter a valid date';
    }
    
    if (birthDate >= today) {
      return 'Date of birth must be in the past';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      return 'You must be at least 13 years old';
    }
    
    if (age > 120) {
      return 'Please enter a valid date of birth';
    }
    
    return undefined;
  };

  const validateGender = (gender: string): string | undefined => {
    if (!gender || gender.trim() === '') {
      return 'Gender is required';
    }
    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(gender)) {
      return 'Please select a valid gender';
    }
    return undefined;
  };

  const validateField = (fieldKey: string, value: string): string | undefined => {
    switch (fieldKey) {
      case 'firstName':
        return validateName(value, 'First name');
      case 'lastName':
        return validateName(value, 'Last name');
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'dob':
        return validateDOB(value);
      case 'gender':
        return validateGender(value);
      default:
        return undefined;
    }
  };

  const validateAllFields = (): boolean => {
    if (!formData) return false;
    
    const errors: ValidationErrors = {};
    let isValid = true;

    const fieldsToValidate: (keyof ValidationErrors)[] = ['firstName', 'lastName', 'email', 'phone', 'gender', 'dob'];
    
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please select a valid image file (JPEG, PNG, or WebP)' };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    const minSize = 1024;
    if (file.size < minSize) {
      return { valid: false, error: 'Image file is too small' };
    }

    return { valid: true };
  };

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
      setOriginalData(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeSection === 'Sessions') {
      fetchAppointments();
    }
  }, [activeSection, appointmentFilter]);

  useEffect(() => {
    if (activeSection === 'Wallet') {
      fetchWallet({ page: 1 });
    }
  }, [activeSection]);

  const fetchWallet = async (overrides?: {
    page?: number;
    type?: 'credit' | 'debit' | '';
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsLoadingWallet(true);
      const targetPage = overrides?.page ?? walletPagination.currentPage;
      const resolvedType = overrides?.type ?? walletTypeFilter;
      const resolvedStartDate = overrides?.startDate ?? walletStartDate;
      const resolvedEndDate = overrides?.endDate ?? walletEndDate;

      const data = await walletService.getUserWallet({
        page: targetPage,
        limit: walletPagination.limit,
        type: resolvedType || undefined,
        startDate: resolvedStartDate || undefined,
        endDate: resolvedEndDate || undefined,
      });

      setWalletData(data);
      setWalletPagination(prev => ({
        ...prev,
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
      }));
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleWalletApplyFilters = () => {
    fetchWallet({ page: 1 });
  };

  const handleWalletClearFilters = () => {
    setWalletTypeFilter('');
    setWalletStartDate('');
    setWalletEndDate('');
    fetchWallet({ page: 1, type: '', startDate: '', endDate: '' });
  };

  const handleWalletPageChange = (direction: 'prev' | 'next') => {
    const targetPage = direction === 'next' ? walletPagination.currentPage + 1 : walletPagination.currentPage - 1;
    if (targetPage < 1 || targetPage > walletPagination.totalPages) return;
    fetchWallet({ page: targetPage });
  };

  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const params = appointmentFilter !== 'all' ? { status: appointmentFilter } : {};
      const response = await clientProfileService.getAppointments(params);
      
      if (response.success) {
        const appointmentsWithImages = await Promise.all(
          response.data.map(async (apt: Appointment) => {
            if (apt.therapistId.profileImg) {
              const imageUrl = await S3BucketUtil.getPreSignedURL(apt.therapistId.profileImg);
              return {
                ...apt,
                therapistId: {
                  ...apt.therapistId,
                  profileImg: imageUrl
                }
              };
            }
            return apt;
          })
        );
        setAppointments(appointmentsWithImages);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const handleViewDetails = async (appointmentId: string) => {
    try {
      setSelectedAppointmentIdForDetail(appointmentId);
      setIsLoadingAppointmentDetail(true);
      setAppointmentDetailError(null);
      setSelectedAppointmentDetail(null);

      const response = await clientProfileService.getAppointmentDetail(appointmentId);
      const rawDetail = (response as { data?: AppointmentDetail }).data ?? (response as AppointmentDetail);

      const detail: AppointmentDetail = {
        ...rawDetail,
        paymentMethod: (rawDetail.paymentMethod ?? "unknown") as AppointmentDetail["paymentMethod"],
      };

      setSelectedAppointmentDetail(detail);

      if (detail.feedback) {
        setRating(detail.feedback.rating);
        setReview(detail.feedback.review);
      } else {
        setRating(0);
        setReview('');
      }
      setHoverRating(0);
    } catch (error) {
      console.error("Error loading appointment detail:", error);
      setAppointmentDetailError("Failed to load appointment details");
    } finally {
      setIsLoadingAppointmentDetail(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedAppointmentDetail || !selectedAppointmentIdForDetail) return;

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      const response = await clientProfileService.submitAppointmentFeedback(
        selectedAppointmentIdForDetail,
        rating,
        review.trim()
      );

      if (response.success) {
        toast.success(response.message || 'Feedback submitted');
        const newFeedback = {
          rating,
          review: review.trim(),
          createdAt: new Date().toISOString(),
        };
        setSelectedAppointmentDetail(prev => prev ? { ...prev, feedback: newFeedback } : prev);
      }
    } catch (err: unknown) {
      let msg = 'Failed to submit feedback';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        msg = response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
    
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    if (error) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const getChangedFields = (): Partial<UserProfile> => {
    if (!formData || !originalData) return {};
    
    const changedFields: Partial<UserProfile> = {};
    
    Object.keys(formData).forEach((key) => {
      const typedKey = key as keyof UserProfile;
      if (formData[typedKey] !== originalData[typedKey]) {
        changedFields[typedKey] = formData[typedKey];
      }
    });
    
    return changedFields;
  };

  const handleSave = async () => {
    try {
      if (!formData || isSaving) return;
      
      if (!validateAllFields()) {
        toast.error("Please fix all validation errors before saving");
        return;
      }
      
      const changedFields = getChangedFields();
      
      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes to save");
        setIsEditing(false);
        return;
      }
      
      setIsSaving(true);
      const response = await clientProfileService.updateProfile(changedFields);
      
      if (response.success) {
        toast.success(response.message || "Profile updated successfully");
        setUserProfile(formData);
        setOriginalData(formData);
        setIsEditing(false);
        setValidationErrors({});
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleLogout = async () => {
    try {
      const response = await AuthService.logout();
      localStorage.removeItem("accessToken");
      setShowLogoutModal(false);
      navigate("/auth/form", { replace: true });
      toast.success(response.data.message);
    } catch (error: unknown) {
      console.error("Error during logout:", error);
      const errorMessage = error.response?.data?.message || "Failed to logout";
      toast.error(errorMessage);
    }
  };

  const handleMenuItemClick = (item: unknown) => {
    if (item.label === 'Logout') {
      setShowLogoutModal(true);
    } else {
      setActiveSection(item.label);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (isUploadingImage) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperImage(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      setIsUploadingImage(true);
      setCropperImage(null);
      
      const validation = validateImageFile(croppedFile);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      const response = await clientProfileService.updateProfileImg(croppedFile);

      if (response.success && response.imageUrl) {
        toast.success(response.message || "Profile image updated successfully!");
        
        setUserProfile(prev => prev ? { 
          ...prev, 
          profileImage: response.imageUrl 
        } : null);
        
        setFormData(prev => prev ? { 
          ...prev, 
          profileImage: response.imageUrl 
        } : null);
        
        setOriginalData(prev => prev ? { 
          ...prev, 
          profileImage: response.imageUrl 
        } : null);
      } else {
        toast.error("Failed to get image URL from server");
      }
    } catch (error: unknown) {
      console.error("Error updating profile image:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile image";
      toast.error(errorMessage);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropCancel = () => {
    setCropperImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await clientProfileService.getProfileDetails();
        if(response.success) {
          const client = response.data;
          
          let profileImgUrl = "";
          if(client.profileImg){
            profileImgUrl = await S3BucketUtil.getPreSignedURL(client.profileImg);
          }

          setUserProfile({
            firstName: client.firstName || "",
            lastName: client.lastName || "",
            gender: client.gender || "",
            dob: client.dob || "",
            email: client.email || "",
            phone: client.phone || "",
            profileImage: profileImgUrl,
            createdAt: client.createdAt
              ? new Date(client.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" })
              : "",
          });
        }
      } catch (error) {
        console.error("Failed to load client profile: ", error);
        toast.error("Failed to load profile data");
      }
    };
    fetchProfile();
  }, []);

  const menuItems = [
    { icon: User, label: 'Personal Details', id: 'basic', active: true },
    { icon: CalendarDays, label: 'Sessions', id: 'sessions' },
    { icon: Wallet, label: 'Wallet', id: 'wallet' },
    { icon: LogOut, label: 'Logout', id: 'logout', active: false},
  ];

  const profileFields = [
    { 
      label: 'First Name', 
      value: userProfile?.firstName, 
      placeholder: 'Enter your first name',
      icon: User,
      type: 'text',
      fieldKey: 'firstName',
      required: true
    },
    { 
      label: 'Last Name', 
      value: userProfile?.lastName, 
      placeholder: 'Enter your last name',
      icon: User,
      type: 'text',
      fieldKey: 'lastName',
      required: true
    },
    { 
      label: 'Email Address', 
      value: userProfile?.email, 
      placeholder: 'Enter your email',
      icon: Mail,
      type: 'email',
      fieldKey: 'email',
      required: true
    },
    { 
      label: 'Phone Number', 
      value: userProfile?.phone, 
      placeholder: 'Enter 10-digit phone number',
      icon: Phone,
      type: 'tel',
      fieldKey: 'phone',
      required: true
    },
    { 
      label: 'Gender', 
      value: userProfile?.gender, 
      placeholder: 'Select gender',
      icon: User,
      type: 'select',
      options: ['Male', 'Female', 'Other'],
      fieldKey: 'gender',
      required: true
    },
    { 
      label: 'Birthday', 
      value: userProfile?.dob, 
      placeholder: 'Select date',
      icon: Calendar,
      type: 'date',
      fieldKey: 'dob',
      required: true
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    const icons = {
      scheduled: Clock,
      completed: CheckCircle,
      cancelled: XCircle
    };
    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderStars = (value: number, editable: boolean) => {
    const current = editable ? hoverRating || value : value;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={editable ? () => setRating(star) : undefined}
            onMouseEnter={editable ? () => setHoverRating(star) : undefined}
            onMouseLeave={editable ? () => setHoverRating(0) : undefined}
            className={`p-1 ${editable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= current ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen absolute top-15 w-screen bg-gradient-to-br from-gray-50 to-green-50">
      <Header/>
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirm Logout</h3>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-700 text-lg">
                    Are you sure you want to logout?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-primary px-8 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-20"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <div className="relative group">
              <div className="relative">
                <img
                  src={userProfile?.profileImage || profile_avatar}
                  alt=""
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-xl"
                />
                <button 
                  className={`absolute bottom-2 right-2 text-white p-2 rounded-full shadow-lg transition-all duration-200 ${
                    isUploadingImage 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-teal-600 hover:bg-teal-700 hover:scale-110'
                  }`}
                  onClick={handleButtonClick}
                  disabled={isUploadingImage}
                  title="Upload profile picture"
                >
                  <Camera className={`w-4 h-4 ${isUploadingImage ? 'animate-pulse' : ''}`} />
                </button>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white drop-shadow-md">
                {userProfile?.firstName + ' ' + userProfile?.lastName}
              </h1>
              <div className="flex items-center space-x-4 text-emerald-200">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {userProfile?.createdAt}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-80 bg-white shadow-xl border-r border-gray-200">
          <nav className="py-8 min-h-screen">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.label && item.label !== 'Logout';
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center px-8 py-4 text-left transition-all duration-200 group ${
                    isActive 
                      ? 'text-green-700 border-r-4 border-teal-500 bg-gradient-to-r from-green-50 to-transparent shadow-lg' 
                      : item.label === 'Logout'
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-4 transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-100 shadow-md' 
                      : item.label === 'Logout'
                      ? 'bg-red-100 group-hover:bg-red-200'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-lg">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-6xl">
            {activeSection === 'Personal Details' && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl text-start font-bold text-gray-900">{activeSection}</h2>
                    <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
                  </div>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                    >
                      <Edit3 className="w-5 h-5" />
                      <span className="font-semibold">Edit Profile</span>
                    </button>
                  )}
                </div>
              
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {profileFields.map((field, index) => {
                        const IconComponent = field.icon;
                        const hasError = validationErrors[field.fieldKey as keyof ValidationErrors];
                        
                        return (
                          <div key={index} className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              <div className="flex items-center space-x-2">
                                <IconComponent className="w-5 h-5 text-green-600" />
                                <span>{field.label}</span>
                                {field.required && <span className="text-red-500">*</span>}
                              </div>
                            </label>
                            
                            {isEditing ? (
                              <div className="relative">
                                {field.type === 'select' ? (
                                  <select
                                    value={(formData as unknown)?.[field.fieldKey] || ""}
                                    onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                                    onBlur={(e) => handleBlur(field.fieldKey, e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all duration-200 bg-white shadow-sm ${
                                      hasError 
                                        ? 'border-red-300 focus:border-red-400' 
                                        : 'border-gray-200 focus:border-teal-400'
                                    }`}
                                  >
                                    <option value="">{field.placeholder}</option>
                                    {field.options?.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type={field.type}
                                    value={(formData as unknown)?.[field.fieldKey] || ""}
                                    onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                                    onBlur={(e) => handleBlur(field.fieldKey, e.target.value)}
                                    placeholder={field.placeholder}
                                    max={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-sm ${
                                      hasError 
                                        ? 'border-red-300 focus:border-red-400' 
                                        : 'border-gray-200 focus:border-teal-400'
                                    }`}
                                  />
                                )}
                                {hasError && (
                                  <div className="flex items-center mt-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    <span>{hasError}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-green-50 border-2 border-green-100 rounded-xl p-4 group-hover:bg-green-100 transition-all duration-200">
                                <div className="text-gray-800 font-medium">
                                  {field.value || (
                                    <span className="text-gray-400 italic">Add your details</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {isEditing && (
                      <div className="mt-8 flex justify-end space-x-4">
                        <button 
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={isSaving || Object.keys(validationErrors).length > 0}
                          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-xl hover:from-teal-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save Changes</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

          {activeSection === 'Sessions' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl text-start font-bold text-gray-900">My Sessions</h2>
                  <p className="text-gray-600 mt-1">View all your therapy appointments and sessions</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAppointmentFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      appointmentFilter === 'all'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      appointmentFilter === 'upcoming'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('past')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      appointmentFilter === 'past'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {isLoadingAppointments ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                    <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
                    <p className="text-gray-600">You don't have any {appointmentFilter !== 'all' ? appointmentFilter : ''} appointments yet.</p>
                  </div>
                ) : (
                  appointments.map((appointment) => {
                    const joinCountdown = joinCountdowns[appointment._id] ?? 0;
                    const canJoinNow = joinCountdown <= 0;
                    const joinLabel = canJoinNow
                      ? endedAppointments[appointment._id]
                        ? 'Rejoin'
                        : 'Join Video Session'
                      : `Join in ${formatJoinCountdown(joinCountdown)}`;

                    return (
                    <div key={appointment._id} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-200">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <img
                              src={appointment.therapistId.profileImg || profile_avatar}
                              alt={`${appointment.therapistId.firstName} ${appointment.therapistId.lastName}`}
                              className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                            />
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Dr. {appointment.therapistId.firstName} {appointment.therapistId.lastName}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3">{appointment.therapistId.email}</p>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 text-gray-700">
                                  <Calendar className="w-5 h-5 text-green-600" />
                                  <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2 text-gray-700">
                                  <Clock className="w-5 h-5 text-green-600" />
                                  <span className="font-medium">
                                    {appointment.slotId?.time || 'Time not available'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2 text-gray-700">
                                  <Video className="w-5 h-5 text-green-600" />
                                  <span className="font-medium">
                                    {appointment.slotId?.consultationModes?.length > 0 
                                      ? appointment.slotId.consultationModes.join(', ')
                                      : 'Mode not specified'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2 text-gray-700">
                                  <IndianRupee className="w-5 h-5 text-green-600" />
                                  <span className="font-medium">
                                    ₹{appointment.slotId?.fees || 0}
                                  </span>
                                </div>
                              </div>

                              {appointment.notes && (
                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Notes:</span> {appointment.notes}
                                  </p>
                                </div>
                              )}

                              {appointment.cancelReason && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                                  <p className="text-sm text-red-700">
                                    <span className="font-semibold">Cancel Reason:</span> {appointment.cancelReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-4 flex flex-col space-y-2 items-end">
                            {getStatusBadge(appointment.status)}

                            {(appointment.status === 'scheduled' || appointment.status === 'completed') && (
                              <button
                                onClick={() => navigate(`/client/chat/${appointment.therapistId._id}`)}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition-all border border-green-200"
                              >
                                <span>Chat</span>
                              </button>
                            )}

                            {appointment.status === 'scheduled' &&
                              (
                                appointment.consultationMode === 'video' ||
                                appointment.slotId?.consultationModes?.includes('video')
                              ) && (
                                <button
                                  disabled={!canJoinNow}
                                  onClick={() => {
                                    if (!canJoinNow) return;
                                    setActiveCallTherapistId(appointment.therapistId._id);
                                    setActiveCallAppointmentId(appointment._id);
                                    setIsVideoCallOpen(true);

                                    if (user) {
                                      const socket = getSocket();
                                      const displayName = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Client';
                                      const scheduledTime = appointment.slotId?.time || '';

                                      socket.emit('meeting_joined', {
                                        clientId: user.id,
                                        therapistId: appointment.therapistId._id,
                                        appointmentId: appointment._id,
                                        joinedRole: 'client',
                                        joinedUserName: displayName,
                                        scheduledTime,
                                      });
                                    }
                                  }}
                                  className="flex items-center space-x-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-all border border-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>{joinLabel}</span>
                                </button>
                              )}

                            {appointment.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancelClick(appointment)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-all border border-red-200"
                              >
                                <Ban className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleViewDetails(appointment._id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-all border border-gray-200"
                            >
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>

                        {selectedAppointmentIdForDetail === appointment._id && (
                          <div className="mt-4 w-full">
                            {isLoadingAppointmentDetail && (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                              </div>
                            )}

                            {!isLoadingAppointmentDetail && appointmentDetailError && (
                              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mt-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>{appointmentDetailError}</span>
                              </div>
                            )}

                            {!isLoadingAppointmentDetail && selectedAppointmentDetail && (
                              <div className="mt-4 bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                    <p className="font-medium">
                                      {selectedAppointmentDetail.paymentMethod === "wallet"
                                        ? "Wallet"
                                        : selectedAppointmentDetail.paymentMethod === "stripe"
                                        ? "Card / Stripe"
                                        : "Unknown"}
                                    </p>
                                  </div>

                                  {selectedAppointmentDetail.feedback && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Your Rating</p>
                                      <p className="font-medium">
                                        {selectedAppointmentDetail.feedback.rating}/5
                                      </p>
                                      {selectedAppointmentDetail.feedback.review && (
                                        <p className="mt-1 text-xs text-gray-600">
                                          "{selectedAppointmentDetail.feedback.review}"
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {appointment.status === 'completed' && (
                                  <div className="pt-3 border-t border-emerald-100 space-y-3">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                      <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Rate Your Session</h3>
                                        <p className="text-xs text-gray-600">How was your experience with this session?</p>
                                      </div>
                                      {renderStars(
                                        selectedAppointmentDetail.feedback ? selectedAppointmentDetail.feedback.rating : rating,
                                        !selectedAppointmentDetail.feedback
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-gray-700">Write a review (optional)</label>
                                      <textarea
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        disabled={Boolean(selectedAppointmentDetail.feedback)}
                                        placeholder="Share your experience with this session..."
                                        className="w-full min-h-[80px] p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                    </div>

                                    {!selectedAppointmentDetail.feedback && (
                                      <button
                                        onClick={handleSubmitFeedback}
                                        disabled={isSubmittingFeedback}
                                        className="w-full md:w-auto px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transition-all"
                                      >
                                        {isSubmittingFeedback ? 'Submitting...' : 'Submit Review'}
                                      </button>
                                    )}

                                    {selectedAppointmentDetail.feedback && (
                                      <p className="text-xs text-gray-500">Thank you for sharing your feedback.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </>
          )}

          {activeSection === 'Wallet' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl text-start font-bold text-gray-900">My Wallet</h2>
                  <p className="text-gray-600 mt-1">View your wallet balance and transaction history</p>
                </div>
              </div>

              {isLoadingWallet ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : walletData ? (
                <div className="space-y-6">
                  {/* Balance Card */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-2">Available Balance</p>
                        <h3 className="text-4xl font-bold">₹{walletData.wallet?.balance?.toLocaleString('en-IN') || '0'}</h3>
                      </div>
                      <Wallet className="w-16 h-16 opacity-20" />
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Transaction History</h3>
                        <p className="text-gray-600 text-sm mt-1">Filter and browse your wallet activity</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <select
                          value={walletTypeFilter}
                          onChange={(e) => setWalletTypeFilter(e.target.value as 'credit' | 'debit' | '')}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">All Types</option>
                          <option value="credit">Credit</option>
                          <option value="debit">Debit</option>
                        </select>
                        <input
                          type="date"
                          value={walletStartDate}
                          onChange={(e) => setWalletStartDate(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          type="date"
                          value={walletEndDate}
                          onChange={(e) => setWalletEndDate(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                          onClick={handleWalletApplyFilters}
                          className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-blue-700 transition-colors"
                        >
                          Apply Filters
                        </button>
                        <button
                          onClick={handleWalletClearFilters}
                          className="bg-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm hover:bg-gray-300 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>

                    {walletData.transactions && walletData.transactions.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {walletData.transactions.map((transaction: WalletTransaction, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                      {transaction.type === 'credit' ? (
                                        <>
                                          <div className="p-2 bg-green-100 rounded-lg">
                                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                                          </div>
                                          <span className="text-sm font-semibold text-green-600">Credit</span>
                                        </>
                                      ) : (
                                        <>
                                          <div className="p-2 bg-red-100 rounded-lg">
                                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                                          </div>
                                          <span className="text-sm font-semibold text-red-600">Debit</span>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm text-gray-700">{transaction.description}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className={`text-sm font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount?.toLocaleString('en-IN') || '0'}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      transaction.status === 'completed' 
                                        ? 'bg-green-100 text-green-700' 
                                        : transaction.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">
                                      {new Date(transaction.date).toLocaleDateString('en-IN', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </p>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                          <span>
                            Showing {((walletData.pagination.currentPage - 1) * walletData.pagination.limit) + 1} to {Math.min(walletData.pagination.currentPage * walletData.pagination.limit, walletData.pagination.totalItems)} of {walletData.pagination.totalItems} transactions
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={walletData.pagination.currentPage <= 1}
                              onClick={() => handleWalletPageChange('prev')}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-2 text-sm font-medium">
                              Page {walletData.pagination.currentPage} of {walletData.pagination.totalPages}
                            </span>
                            <button
                              disabled={walletData.pagination.currentPage >= walletData.pagination.totalPages}
                              onClick={() => handleWalletPageChange('next')}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions</h3>
                        <p className="text-gray-600">You don't have any transactions yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Wallet</h3>
                  <p className="text-gray-600">Please try again later.</p>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Session Video Call Modal */}
      {isVideoCallOpen && activeCallTherapistId && user && (
        <SessionVideoCall
          isOpen={isVideoCallOpen}
          clientId={user.id}
          therapistId={activeCallTherapistId}
          localRole="client"
          onClose={() => {
            setIsVideoCallOpen(false);
            setActiveCallTherapistId(null);
            setActiveCallAppointmentId(null);
          }}
          onClientEnd={() => {
            if (activeCallAppointmentId) {
              setEndedAppointments((prev) => ({
                ...prev,
                [activeCallAppointmentId]: true,
              }));
            }
          }}
        />
      )}

      {/* Cancel Appointment Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCancelModalClose}
        title="Cancel Appointment"
        icon={<Ban className="w-6 h-6" />}
        variant="danger"
        size="lg"
        confirmButton={{
          label: 'Confirm Cancellation',
          variant: 'danger',
          onClick: handleConfirmCancel,
          disabled: !selectedCancelReason,
          loading: isCancelling
        }}
        cancelButton={{
          label: 'Keep Appointment',
          variant: 'secondary',
          onClick: handleCancelModalClose
        }}
        closeOnOutsideClick={!isCancelling}
        preventCloseWhileLoading={true}
      >
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            Please select a reason for cancellation:
          </p>
          
          <div className="space-y-2">
            {cancelReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCancelReason === reason
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedCancelReason === reason}
                  onChange={(e) => setSelectedCancelReason(e.target.value)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                  disabled={isCancelling}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {reason}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={customCancelReason}
              onChange={(e) => setCustomCancelReason(e.target.value)}
              placeholder="Please provide more details about your cancellation..."
              rows={3}
              maxLength={200}
              disabled={isCancelling}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {customCancelReason.length}/200 characters
            </p>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default UserProfilePage;