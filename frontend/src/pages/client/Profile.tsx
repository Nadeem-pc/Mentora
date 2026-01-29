import React, { useEffect, useRef, useState } from 'react';
import profile_avatar from '../../assets/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_5247852-removebg-preview.png';
import { User, Edit3, Camera, Mail, Phone, Calendar, LogOut, X, Clock, Video, CheckCircle, XCircle, CalendarDays, IndianRupee, AlertCircle, Ban, Wallet, ArrowUpRight, ArrowDownLeft, Star, CheckCircle as CheckCircleIcon, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [appointmentPagination, setAppointmentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 5,
    totalItems: 0
  });
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
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to cancel appointment';
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
      const error = validateField(field, String(formData[field] || ""));
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
      fetchAppointments({ page: 1 });
    }
  }, [activeSection]);

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

  const fetchAppointments = async (overrides?: {
    page?: number;
    status?: 'all' | 'upcoming' | 'past';
  }) => {
    try {
      setIsLoadingAppointments(true);
      const targetPage = overrides?.page ?? appointmentPagination.currentPage;
      const targetFilter = overrides?.status ?? appointmentFilter;
      
      const params: { status?: string; page?: number; limit?: number } = {
        page: targetPage,
        limit: appointmentPagination.limit
      };
      
      if (targetFilter !== 'all') {
        params.status = targetFilter;
      }
      
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
        
        // Update pagination - if backend doesn't return total, we'll estimate
        const totalItems = response.totalItems || appointmentsWithImages.length;
        const totalPages = Math.ceil(totalItems / appointmentPagination.limit) || 1;
        
        setAppointmentPagination(prev => ({
          ...prev,
          currentPage: response.page || targetPage,
          totalPages: response.totalPages || totalPages,
          totalItems: response.totalItems || totalItems
        }));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoadingAppointments(false);
    }
  };
  
  const handleAppointmentFilterChange = (filter: 'all' | 'upcoming' | 'past') => {
    setAppointmentFilter(filter);
    fetchAppointments({ page: 1, status: filter });
  };
  
  const handleAppointmentPageChange = (direction: 'prev' | 'next') => {
    const targetPage = direction === 'next' 
      ? appointmentPagination.currentPage + 1 
      : appointmentPagination.currentPage - 1;
    if (targetPage < 1 || targetPage > appointmentPagination.totalPages) return;
    fetchAppointments({ page: targetPage });
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
        (changedFields as any)[typedKey] = formData[typedKey];
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
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error?.response?.data?.message || "Failed to update profile";
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
    } catch (error: any) {
      console.error("Error during logout:", error);
      const errorMessage = error?.response?.data?.message || "Failed to logout";
      toast.error(errorMessage);
    }
  };

  const handleMenuItemClick = (item: { label: string; id: string }) => {
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
    } catch (error: any) {
      console.error("Error updating profile image:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update profile image";
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
            _id: client._id || "",
            firstName: client.firstName || "",
            lastName: client.lastName || "",
            gender: client.gender || "",
            dob: client.dob || "",
            email: client.email || "",
            phone: client.phone || "",
            profileImage: profileImgUrl,
            role: client.role || "",
            status: client.status || "",
            createdAt: client.createdAt ? new Date(client.createdAt) : undefined,
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
      scheduled: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      completed: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700',
      cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
    };
    const icons = {
      scheduled: Clock,
      completed: CheckCircle,
      cancelled: XCircle
    };
    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-4 h-4 mr-1.5" />
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <Header/>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
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

      {/* Enhanced Profile Header */}
      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <motion.div 
          className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <img
                    src={userProfile?.profileImage || profile_avatar}
                    alt=""
                    className="relative w-32 h-32 rounded-full border-4 border-white/90 object-cover shadow-2xl"
                  />
                  <motion.button 
                    className={`absolute bottom-0 right-0 text-white p-3 rounded-full shadow-xl transition-all duration-200 ${
                      isUploadingImage 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700'
                    }`}
                    onClick={handleButtonClick}
                    disabled={isUploadingImage}
                    title="Upload profile picture"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className={`w-5 h-5 ${isUploadingImage ? 'animate-pulse' : ''}`} />
                  </motion.button>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </motion.div>
              
              <div className="text-center md:text-left space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {userProfile?.firstName + ' ' + userProfile?.lastName}
                </h1>
                <div className="flex items-center justify-center md:justify-start space-x-4 text-blue-100">
                  <span className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" }) : ''}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 px-4 md:px-8 pb-12">
        {/* Enhanced Sidebar Navigation */}
        <motion.div 
          className="lg:w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-teal-100 dark:border-teal-900 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <nav className="py-6">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.label && item.label !== 'Logout';
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center px-6 py-4 text-left transition-all duration-300 group relative ${
                    isActive 
                      ? 'text-teal-700 dark:text-teal-400' 
                      : item.label === 'Logout'
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {isActive && (
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-teal-600 rounded-r-full"
                      layoutId="activeIndicator"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className={`p-2.5 rounded-xl mr-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/40 dark:to-teal-900/40 shadow-md' 
                      : item.label === 'Logout'
                      ? 'bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50'
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                  </div>
                  <span className="font-semibold text-base">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </motion.div>

        <div className="flex-1 lg:max-w-6xl">
          {activeSection === 'Personal Details' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-teal-100/50 dark:border-teal-900/50 overflow-hidden relative">
                {/* Decorative gradient background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 via-teal-100/30 to-cyan-100/30 dark:from-blue-900/10 dark:via-teal-900/10 dark:to-cyan-900/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative p-6 md:p-10">
                  {/* Header Section */}
                  <div className="relative flex flex-col md:flex-row justify-between items-center md:items-center gap-4 mb-8 pb-6">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        {activeSection}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2">
                        Manage your personal information and preferences
                      </p>
                    </div>
                    {/* Gradient border line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-200 via-teal-300 to-cyan-200 dark:from-blue-700 dark:via-teal-600 dark:to-cyan-700"></div>
                    {!isEditing && (
                      <motion.button 
                        onClick={() => setIsEditing(true)}
                        className="relative group flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-3.5 rounded-xl shadow-lg transition-all duration-300 overflow-hidden"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <Edit3 className="w-5 h-5 relative z-10" />
                        <span className="font-medium relative z-10">Edit Profile</span>
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {profileFields.map((field, index) => {
                      const IconComponent = field.icon;
                      const hasError = validationErrors[field.fieldKey as keyof ValidationErrors];
                      
                      return (
                        <motion.div 
                          key={index} 
                          className="group relative"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Label with icon and better styling */}
                          <label className="flex items-center gap-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 group-hover:from-teal-200 group-hover:to-cyan-200 dark:group-hover:from-teal-800/60 dark:group-hover:to-cyan-800/60 transition-all duration-300 shadow-sm">
                              <IconComponent className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            </div>
                            <span className="flex-1">{field.label}</span>
                            {field.required && <span className="text-red-500">*</span>}
                          </label>

                          {isEditing ? (
                            <div className="relative">
                              {field.type === 'select' ? (
                                <select
                                  value={(formData as any)?.[field.fieldKey] || ""}
                                  onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                                  onBlur={(e) => handleBlur(field.fieldKey, e.target.value)}
                                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/20 transition-all duration-300 bg-white dark:bg-gray-700 shadow-md hover:shadow-lg font-medium appearance-none cursor-pointer ${
                                    hasError 
                                      ? 'border-red-400 dark:border-red-600 focus:border-red-500' 
                                      : 'border-gray-200 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 hover:border-teal-300 dark:hover:border-teal-600'
                                  } text-gray-900 dark:text-gray-100`}
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
                                  value={String((formData as any)?.[field.fieldKey] || "")}
                                  onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                                  onBlur={(e) => handleBlur(field.fieldKey, e.target.value)}
                                  placeholder={field.placeholder}
                                  max={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/20 transition-all duration-300 shadow-md hover:shadow-lg font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                                    hasError 
                                      ? 'border-red-400 dark:border-red-600 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                                      : 'border-gray-200 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 hover:border-teal-300 dark:hover:border-teal-600 bg-white dark:bg-gray-700'
                                  } text-gray-900 dark:text-gray-100`}
                                />
                              )}
                              {hasError && (
                                <motion.div 
                                  className="flex items-center gap-2 mt-2.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium"
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>{hasError}</span>
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            <motion.div 
                              className="relative bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 border-2 border-teal-100 dark:border-teal-800 rounded-xl p-4 group-hover:border-teal-300 dark:group-hover:border-teal-600 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                              whileHover={{ scale: 1.01 }}
                            >
                              {/* Decorative shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                              
                              <div className="relative text-gray-900 dark:text-gray-100 text-base">
                                {field.value ? (
                                  <span>{field.value}</span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500 italic text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></span>
                                    Not provided yet
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {isEditing && (
                    <motion.div 
                      className="mt-10 pt-8 border-t-2 border-gradient-to-r from-blue-100 via-teal-100 to-cyan-100 dark:from-blue-900/50 dark:via-teal-900/50 dark:to-cyan-900/50 flex flex-col sm:flex-row justify-end gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                        <motion.button 
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="relative group px-8 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg overflow-hidden"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10">Cancel</span>
                        </motion.button>
                        <motion.button 
                          onClick={handleSave}
                          disabled={isSaving || Object.keys(validationErrors).length > 0}
                          className="relative group px-8 py-3.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                          
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent relative z-10"></div>
                              <span className="relative z-10">Saving...</span>
                            </>
                          ) : (
                            <span className="relative z-10 flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5" />
                              Save Changes
                            </span>
                          )}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'Sessions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-teal-100 dark:border-teal-900 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 mb-8">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        My Sessions
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">View all your therapy appointments and sessions</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        onClick={() => handleAppointmentFilterChange('all')}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                          appointmentFilter === 'all'
                            ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All
                      </motion.button>
                      <motion.button
                        onClick={() => handleAppointmentFilterChange('upcoming')}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                          appointmentFilter === 'upcoming'
                            ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Upcoming
                      </motion.button>
                      <motion.button
                        onClick={() => handleAppointmentFilterChange('past')}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                          appointmentFilter === 'past'
                            ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Past
                      </motion.button>
                    </div>
                  </div>

                  <div className="border-t border-teal-100 dark:border-teal-900 pt-8">
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {isLoadingAppointments ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                  </div>
                ) : appointments.length === 0 ? (
                  <motion.div 
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-teal-100 dark:border-teal-900 p-12 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CalendarDays className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No sessions found</h3>
                    <p className="text-gray-600 dark:text-gray-400">You don't have any {appointmentFilter !== 'all' ? appointmentFilter : ''} appointments yet.</p>
                  </motion.div>
                ) : (
                  appointments.map((appointment, index) => {
                    const joinCountdown = joinCountdowns[appointment._id] ?? 0;
                    const canJoinNow = joinCountdown <= 0;
                    const joinLabel = canJoinNow
                      ? endedAppointments[appointment._id]
                        ? 'Rejoin'
                        : 'Join Video Session'
                      : `Join in ${formatJoinCountdown(joinCountdown)}`;

                    return (
                    <motion.div 
                      key={appointment._id} 
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-xl border-2 border-teal-100 dark:border-teal-900 overflow-hidden relative group hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -6 }}
                    >
                      {/* Decorative gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 via-cyan-50/0 to-blue-50/0 group-hover:from-teal-50/40 group-hover:via-cyan-50/30 group-hover:to-blue-50/40 transition-all duration-500 pointer-events-none"></div>
                      
                      {/* Decorative corner accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                          {/* Header Section with Therapist Info */}
                          <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                              <img
                                src={appointment.therapistId.profileImg || profile_avatar}
                                alt={`${appointment.therapistId.firstName} ${appointment.therapistId.lastName}`}
                                className="relative w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    Dr. {appointment.therapistId.firstName} {appointment.therapistId.lastName}
                                  </h3>
                                </div>
                                {getStatusBadge(appointment.status)}
                              </div>
                              
                              {/* Appointment Details Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                                  <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg">
                                    <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(appointment.appointmentDate)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                                  <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg">
                                    <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Time</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {appointment.slotId?.time || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                    <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Mode</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {appointment.slotId?.consultationModes?.length > 0 
                                        ? appointment.slotId.consultationModes.join(', ')
                                        : 'Not specified'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                                  <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                    <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fee</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ₹{appointment.slotId?.fees || 0}
                                    </p>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          {selectedAppointmentIdForDetail !== appointment._id && (
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-teal-100 dark:border-teal-900">

                            {(appointment.status === 'scheduled' || appointment.status === 'completed') && (
                              <motion.button
                                onClick={() => navigate(`/client/chat/${appointment.therapistId._id}`)}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/50 dark:hover:to-cyan-900/50 text-teal-700 dark:text-teal-300 rounded-xl text-sm font-semibold transition-all border border-teal-200 dark:border-teal-700 shadow-sm"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Chat</span>
                              </motion.button>
                            )}

                            {appointment.status === 'scheduled' &&
                              (
                                appointment.consultationMode === 'video' ||
                                appointment.slotId?.consultationModes?.includes('video')
                              ) && (
                                <motion.button
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
                                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                                  whileHover={{ scale: canJoinNow ? 1.05 : 1, y: canJoinNow ? -2 : 0 }}
                                  whileTap={{ scale: canJoinNow ? 0.95 : 1 }}
                                >
                                  <Video className="w-4 h-4" />
                                  <span>{joinLabel}</span>
                                </motion.button>
                              )}

                            {appointment.status === 'scheduled' && (
                              <motion.button
                                onClick={() => handleCancelClick(appointment)}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold transition-all border border-red-200 dark:border-red-800 shadow-sm"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Ban className="w-4 h-4" />
                                <span>Cancel</span>
                              </motion.button>
                            )}

                            <motion.button
                              onClick={() => handleViewDetails(appointment._id)}
                              className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all border border-gray-200 dark:border-gray-600 shadow-sm"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>View Details</span>
                            </motion.button>
                          </div>
                          )}
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
                              <div className="mt-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-teal-100 dark:border-teal-900 rounded-xl p-4 shadow-sm space-y-4">
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
                                    <div className="flex flex-col items-center">
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Your Rating</p>
                                      {renderStars(selectedAppointmentDetail.feedback.rating, false)}
                                    </div>
                                  )}
                                </div>

                                {/* Notes and Cancel Reason - only in View Details */}
                                {appointment.notes && (
                                  <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      <span className="font-semibold text-teal-700 dark:text-teal-400">Notes:</span> {appointment.notes}
                                    </p>
                                  </div>
                                )}

                                {appointment.cancelReason && (
                                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-700 dark:text-red-400">
                                      <span className="font-semibold">Cancel Reason:</span> {appointment.cancelReason}
                                    </p>
                                  </div>
                                )}

                                    {appointment.status === 'completed' && !selectedAppointmentDetail.feedback && (
                                  <div className="pt-3 border-t border-teal-100 dark:border-teal-900 space-y-3">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                      <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rate Your Session</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">How was your experience with this session?</p>
                                      </div>
                                      {renderStars(rating, true)}
                                    </div>

                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Write a review (optional)</label>
                                      <textarea
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        placeholder="Share your experience with this session..."
                                        className="w-full min-h-[80px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                      />
                                    </div>

                                    <motion.button
                                      onClick={handleSubmitFeedback}
                                      disabled={isSubmittingFeedback || rating === 0}
                                      className="w-full md:w-auto px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transition-all"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      {isSubmittingFeedback ? 'Submitting...' : 'Submit Review'}
                                    </motion.button>
                                  </div>
                                )}

                                {appointment.status === 'completed' && selectedAppointmentDetail.feedback?.review && (
                                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Your Review</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">"{selectedAppointmentDetail.feedback.review}"</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                  })
                )}
                
                {/* Pagination Controls */}
                {appointments.length > 0 && appointmentPagination.totalPages > 1 && (
                  <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-teal-100 dark:border-teal-900 mt-6 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((appointmentPagination.currentPage - 1) * appointmentPagination.limit) + 1} to {Math.min(appointmentPagination.currentPage * appointmentPagination.limit, appointmentPagination.totalItems)} of {appointmentPagination.totalItems} sessions
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        disabled={appointmentPagination.currentPage <= 1}
                        onClick={() => handleAppointmentPageChange('prev')}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                        whileHover={{ scale: appointmentPagination.currentPage > 1 ? 1.05 : 1 }}
                        whileTap={{ scale: appointmentPagination.currentPage > 1 ? 0.95 : 1 }}
                      >
                        Previous
                      </motion.button>
                      <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl border border-teal-200 dark:border-teal-700">
                        Page {appointmentPagination.currentPage} of {appointmentPagination.totalPages}
                      </span>
                      <motion.button
                        disabled={appointmentPagination.currentPage >= appointmentPagination.totalPages}
                        onClick={() => handleAppointmentPageChange('next')}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                        whileHover={{ scale: appointmentPagination.currentPage < appointmentPagination.totalPages ? 1.05 : 1 }}
                        whileTap={{ scale: appointmentPagination.currentPage < appointmentPagination.totalPages ? 0.95 : 1 }}
                      >
                        Next
                      </motion.button>
                      </div>
                    </motion.div>
                  )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'Wallet' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-teal-100 dark:border-teal-900 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 mb-8">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        My Wallet
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">View your wallet balance and transaction history</p>
                    </div>
                  </div>

                  <div className="border-t border-teal-100 dark:border-teal-900 pt-8">
                    {isLoadingWallet ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                </div>
              ) : walletData ? (
                <div className="space-y-6">
                  {/* Enhanced Balance Card */}
                  <motion.div 
                    className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-2">Available Balance</p>
                        <h3 className="text-4xl md:text-5xl font-bold">₹{walletData.wallet?.balance?.toLocaleString('en-IN') || '0'}</h3>
                      </div>
                      <Wallet className="w-20 h-20 opacity-30" />
                    </div>
                  </motion.div>

                  {/* Enhanced Transactions Table */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-teal-100 dark:border-teal-900 overflow-hidden">
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
                        <motion.button
                          onClick={handleWalletApplyFilters}
                          className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg px-4 py-2 text-sm hover:from-blue-700 hover:to-teal-700 transition-colors shadow-md"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Apply Filters
                        </motion.button>
                        <motion.button
                          onClick={handleWalletClearFilters}
                          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Clear Filters
                        </motion.button>
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
                <motion.div 
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-teal-100 dark:border-teal-900 p-12 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Wallet</h3>
                      <p className="text-gray-600 dark:text-gray-400">Please try again later.</p>
                    </motion.div>
                  )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Session Video Call Modal */}
      {isVideoCallOpen && activeCallTherapistId && user && user.id && (
        <SessionVideoCall
          isOpen={isVideoCallOpen}
          clientId={user.id}
          therapistId={activeCallTherapistId as string}
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