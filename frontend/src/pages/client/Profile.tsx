import React, { useEffect, useRef, useState } from 'react';
import profile_avatar from '../../assets/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_5247852-removebg-preview.png';
import { User, Edit3, Camera, Mail, Phone, Calendar } from 'lucide-react';
import { clientProfileService } from '@/services/client/profileServices';
import { toast } from 'sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  joinDate: string;
}

const UserProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState('Personal Details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [originalData, setOriginalData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
      setOriginalData(userProfile); 
    }
  }, [userProfile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
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
      if (!formData) return;
      
      const changedFields = getChangedFields();
      
      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        return;
      }
      
      const response = await clientProfileService.updateProfile(changedFields);
      if (response.success) {
        toast.success(response.message);
        setUserProfile(formData);
        setOriginalData(formData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click(); 
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
    //  ddf
    }
  };
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await clientProfileService.getProfileDetails();
        if(response.success) {
          const client = response.data;
          setUserProfile({
            firstName: client.firstName,
            lastName: client.lastName,
            gender: client.gender || "",
            dob: client.dob || "",
            email: client.email,
            phone: client.phone || "",
            joinDate: client.createdAt
              ? new Date(client.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" })
              : "",
          });
        }
      } catch (error) {
        console.error("Failed to load client profile: ", error);
      }
    };
    fetchProfile();
  }, []) 

  const menuItems = [
    { icon: User, label: 'Personal Details', id: 'basic', active: true },
    // { icon: MoreHorizontal, label: 'Sessions', id: 'points' },
  ];

  const profileFields = [
    { 
      label: 'First Name', 
      value: userProfile?.firstName, 
      placeholder: 'Enter your first name',
      icon: User,
      type: 'text',
      fieldKey: 'firstName'
    },
    { 
      label: 'Last Name', 
      value: userProfile?.lastName, 
      placeholder: 'Enter your last name',
      icon: User,
      type: 'text',
      fieldKey: 'lastName'
    },
    { 
      label: 'Email Address', 
      value: userProfile?.email, 
      placeholder: 'Enter your email',
      icon: Mail,
      type: 'email',
      fieldKey: 'email'
    },
    { 
      label: 'Phone Number', 
      value: userProfile?.phone, 
      placeholder: 'Enter phone number',
      icon: Phone,
      type: 'tel',
      fieldKey: 'phone'
    },
    { 
      label: 'Gender', 
      value: userProfile?.gender, 
      placeholder: 'Select gender',
      icon: User,
      type: 'select',
      options: ['Male', 'Female', 'Other'],
      fieldKey: 'gender'
    },
    { 
      label: 'Birthday', 
      value: userProfile?.dob, 
      placeholder: 'Select date',
      icon: Calendar,
      type: 'date',
      fieldKey: 'dob'
    },
  ];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 to-green-50">
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
                  src={profile_avatar}
                  alt=""
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-xl"
                />
                <button className="absolute bottom-2 right-2 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  onClick={handleButtonClick}
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white drop-shadow-md">{userProfile?.firstName + ' ' + userProfile?.lastName}</h1>
              <div className="flex items-center space-x-4 text-emerald-200">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {userProfile?.joinDate}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-80 bg-white shadow-xl border-r border-gray-200">
          <nav className="py-8">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.label;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.label)}
                  className={`w-full flex items-center px-8 py-4 text-left transition-all duration-200 group ${
                    isActive 
                      ? 'text-green-700 border-r-4 border-teal-500 bg-gradient-to-r from-green-50 to-transparent shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-4 transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-100 shadow-md' 
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
                    return (
                      <div key={index} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-5 h-5 text-green-600" />
                            <span>{field.label}</span>
                          </div>
                        </label>
                        
                        {isEditing ? (
                          <div className="relative">
                            {field.type === 'select' ? (
                              <select
                                value={(formData as any)?.[field.fieldKey] || ""}
                                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all duration-200 bg-white shadow-sm"
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
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all duration-200 shadow-sm"
                              />

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
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-xl hover:from-teal-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;