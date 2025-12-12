import React, { useState } from 'react';
import { Camera, Phone, GraduationCap, Globe, FileText, Upload, Save, ArrowRight, User, IndianRupee } from 'lucide-react';
import { therapistProfileService } from '@/services/therapist/profileService';
// import { S3BucketUtil } from '@/config/s3Bucket.config';
import { API } from '@/constants/api.constant';
import { axiosInstance } from '@/config/axios.config';

interface ProfileData {
  gender: string;
  profileImg: string;
  phone: string;
  experience: string;
  fee: string;
  qualification: string;
  specializations: string[];
  languages: string[];
  about: string;
  resume: File | null;
  certifications: File[];
}

// Custom S3 utility for therapist
const TherapistS3Util = {
  putPreSignedURL: async (file: File) => {
    const response = await axiosInstance.get(API.THERAPIST.PUT_PRESIGNED_URL, {
      params: {
        fileName: file.name,
        type: file.type,
      },
    });
    return response.data;
  },
  uploadToS3: async (uploadURL: string, file: File) => {
    await fetch(uploadURL, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
  },
};

const VerificationForm: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    profileImg: '',
    gender: '',
    phone: '',
    experience: '',
    fee: '',
    qualification: '',
    specializations: [],
    languages: [],
    about: '',
    resume: null,
    certifications: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [previewPhoto, setPreviewPhoto] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [profileImgFile, setProfilePhotoFile] = useState<File | null>(null);

  const specializations = [
    'Anxiety Disorders', 'Depression', 'Bipolar Disorder', 'OCD', 
    'PTSD', 'Relationship Counseling', 'Family Therapy','Trauma Therapy', 
    'Cognitive Behavioral Therapy', 'Addiction Counseling',
    'Child & Adolescent Therapy', 'Grief Counseling', 
  ];

  const languages = ['English', 'Hindi', 'Malayalam', 'kannada', 'Tamil', 'Teluge'];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpecializationToggle = (spec: string) => {
    setProfileData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'certifications') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'resume') {
      setProfileData(prev => ({ ...prev, resume: files[0] }));
    } else {
      setProfileData(prev => ({ 
        ...prev, 
        certifications: [...prev.certifications, ...Array.from(files)] 
      }));
    }
  };

  const steps = ['Basic Information', 'Professional Details', 'About & Documents'];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const uploadFileToS3 = async (file: File): Promise<string> => {
    const { uploadURL, fileURL } = await TherapistS3Util.putPreSignedURL(file);
    await TherapistS3Util.uploadToS3(uploadURL, file);
    return fileURL;
  };

const handleSubmit = async () => {
  try {
    setIsUploading(true);

    // Upload profile photo to S3
    let profileImg = '';
    if (profileImgFile) {
      profileImg = await uploadFileToS3(profileImgFile);
    }

    // Upload resume to S3
    let resume = '';
    if (profileData.resume) {
      resume = await uploadFileToS3(profileData.resume);
    }

    // Upload certifications to S3
    const certifications: string[] = [];
    for (const cert of profileData.certifications) {
      const certUrl = await uploadFileToS3(cert);
      certifications.push(certUrl);
    }

    // Prepare payload with correct field names matching backend schema
    const payload = {
      gender: profileData.gender,
      phone: profileData.phone,
      experience: profileData.experience,
      fee: profileData.fee,
      qualification: profileData.qualification,
      specializations: profileData.specializations,
      languages: profileData.languages,
      about: profileData.about,
      profileImg,      // Changed from profileImgUrl
      resume,          // Changed from resumeUrl
      certifications,  // Changed from certificationUrls
    };

    // Send to backend
    await therapistProfileService.updateProfile(payload);
    
    alert('Profile updated successfully!');
    setIsUploading(false);
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile. Please try again.');
    setIsUploading(false);
  }
};

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Help clients find you by providing detailed information</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {previewPhoto ? (
                        <img src={previewPhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Upload your profile photo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Gender
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={profileData.experience}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                      placeholder="Enter years of experience"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IndianRupee className="w-4 h-4 inline mr-2" />
                      Consultation Fee (starts at)
                    </label>
                    <input
                      type="number"
                      value={profileData.fee}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fee: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={profileData.qualification}
                    onChange={(e) => setProfileData(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ph.D. in Clinical Psychology"
                  />
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Specializations</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specializations.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleSpecializationToggle(spec)}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          profileData.specializations.includes(spec)
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Languages Spoken
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          profileData.languages.includes(lang)
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: About & Documents */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About & Documents</h2>
                
                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    About Yourself
                  </label>
                  <textarea
                    value={profileData.about}
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell clients about your approach to therapy, your experience, and what makes you unique..."
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Resume/CV
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Click to upload resume
                        </span>
                        <span className="text-gray-600"> or drag and drop</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'resume')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                      {profileData.resume && (
                        <p className="text-sm text-green-600 mt-2">✓ {profileData.resume.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Certifications Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Certifications & Licenses
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Upload certifications
                        </span>
                        <span className="text-gray-600"> (multiple files allowed)</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'certifications')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB each</p>
                      {profileData.certifications.length > 0 && (
                        <div className="mt-2">
                          {profileData.certifications.map((cert, index) => (
                            <p key={index} className="text-sm text-green-600">✓ {cert.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Complete Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;