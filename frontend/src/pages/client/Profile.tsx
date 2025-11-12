import React, { useEffect, useRef, useState } from 'react';
import profile_avatar from '../../assets/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_5247852-removebg-preview.png';
import { User, Edit3, Camera, Mail, Phone, Calendar, LogOut, Clock, Video, CheckCircle, XCircle, CalendarDays, IndianRupee, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropper from '@/components/shared/ImageCropper';
import { S3BucketUtil } from '@/utils/S3Bucket.util';
import { AuthService } from '@/services/shared/authServices';
import { useNavigate } from 'react-router-dom';
import { clientProfileService, type Appointment } from '@/services/client/profileServices';
import type { UserProfile } from '@/types/dtos/user.dto';
import ConfirmationModal from '@/components/shared/Modal';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

const UserProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState('Personal Details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [originalData, setOriginalData] = useState<UserProfile | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const navigate = useNavigate();

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
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
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

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    // Check minimum size (to avoid tiny images)
    const minSize = 1024; // 1KB
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
    
    // Clear validation error for this field when user starts typing
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
    } catch (error: any) {
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

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      const response = await AuthService.logout();
      localStorage.removeItem("accessToken");
      navigate("/auth/form", { replace: true });
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error during logout:", error);
      const errorMessage = error.response?.data?.message || "Failed to logout";
      toast.error(errorMessage);
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const handleMenuItemClick = (item) => {
    if (item.label === 'Logout') {
      setIsLogoutModalOpen(true)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 to-green-50">
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
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
                                    value={(formData as any)?.[field.fieldKey] || ""}
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
                                    value={(formData as any)?.[field.fieldKey] || ""}
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
                  appointments.map((appointment) => (
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
                          
                          <div className="ml-4">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        title="Confirm Logout"
        description="Are you sure you want to logout? You will need to sign in again to access your account."
        icon={<LogOut className="w-6 h-6" />}
        variant="warning"
        size="md"
        confirmButton={{
          label: "Logout",
          variant: "danger",
          onClick: handleLogoutConfirm,
          loading: isLoggingOut
        }}
        cancelButton={{
          label: "Cancel",
          variant: "secondary",
          onClick: handleLogoutCancel,
          disabled: isLoggingOut
        }}
        closeOnOutsideClick={!isLoggingOut}
        preventCloseWhileLoading={true}
      />
    </div>
  );
};

export default UserProfilePage;