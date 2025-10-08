import React, { useState, useEffect } from 'react';
import { Phone, Calendar, Award, FileText, Languages, Briefcase, User, Loader2, IndianRupee, CheckCircle2, Clock, XCircle, AlertCircle, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { therapistProfileService } from '@/services/therapist/profileService';
import { axiosInstance } from '@/config/axios.config';

interface TherapistProfile {
  profileImg: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  gender: string | null;
  experience: string | null;
  fee: string | null;
  qualification: string | null;
  specializations: string[];
  languages: string[];
  about: string | null;
  resume: string | null;
  certifications: string[];
  email: string;
  approvalStatus: 'Pending' | 'Requested' | 'Approved' | 'Rejected';
}

const TherapistProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [profileImgUrl, setProfileImgUrl] = useState<string>('');
  const [certificateUrls, setCertificateUrls] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await therapistProfileService.getProfile();
      const profileData = response.data;
      setProfile(profileData);
      setError(null);

      // Fetch pre-signed URL if profile image exists
      if (profileData?.profileImg) {
        const imageUrl = await getPreSignedURL(profileData.profileImg);
        setProfileImgUrl(imageUrl);
      }

      // Fetch pre-signed URLs for all certificates
      if (profileData?.certifications && profileData.certifications.length > 0) {
        const certUrls = await Promise.all(
          profileData.certifications.map(async (certPath: string) => {
            try {
              return await getPreSignedURL(certPath);
            } catch (err) {
              console.error(`Error fetching certificate URL for ${certPath}:`, err);
              return '';
            }
          })
        );
        setCertificateUrls(certUrls.filter(url => url !== ''));
      }

      // Fetch pre-signed URL for resume
      if (profileData?.resume) {
        const resumePreSignedUrl = await getPreSignedURL(profileData.resume);
        setResumeUrl(resumePreSignedUrl);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextCertificate = () => {
    setCurrentCertIndex((prev) => 
      prev === certificateUrls.length - 1 ? 0 : prev + 1
    );
  };

  const previousCertificate = () => {
    setCurrentCertIndex((prev) => 
      prev === 0 ? certificateUrls.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={fetchProfile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const defaultProfileImg = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop';

  const getApprovalStatusBadge = () => {
    switch (profile.approvalStatus) {
      case 'Approved':
        return (
          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Verified
          </div>
        );
      case 'Requested':
        return (
          <div className="inline-flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="w-5 h-5 mr-2" />
            Under Verification 
          </div>
        );
      case 'Rejected':
        return (
          <div className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
            <XCircle className="w-5 h-5 mr-2" />
            Rejected
          </div>
        );
      case 'Pending':
      default:
        return (
          <div className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
            <AlertCircle className="w-5 h-5 mr-2" />
            Pending
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 sm:h-40"></div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20">
              <img
                src={profileImgUrl || defaultProfileImg}
                alt={fullName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{fullName}</h1>
                  {profile.approvalStatus === 'Approved' && (
                    <CheckCircle2 className="w-7 h-7 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mt-1">
                  <p className="text-lg text-gray-600">
                    {profile.qualification || 'Professional Therapist'}
                  </p>
                  {getApprovalStatusBadge()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {profile.phone && (
            <div className="bg-white rounded-xl shadow p-5 flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}

          {profile.gender && (
            <div className="bg-white rounded-xl shadow p-5 flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-semibold text-gray-900">{profile.gender}</p>
              </div>
            </div>
          )}

          {profile.experience && (
            <div className="bg-white rounded-xl shadow p-5 flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-semibold text-gray-900">{profile.experience} years</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-5 flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <IndianRupee className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fee (starts at)</p>
              <p className="font-semibold text-gray-900">{profile.fee} /-</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {profile.about && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{profile.about}</p>
              </div>
            )}

            {/* Specializations */}
            {profile.specializations.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certificateUrls.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
                </div>
                <div className="relative">
                  {/* Certificate Display */}
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                    <a
                      href={certificateUrls[currentCertIndex]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={certificateUrls[currentCertIndex]}
                        alt={`Certificate ${currentCertIndex + 1}`}
                        className="w-full h-96 object-contain bg-gray-50"
                      />
                    </a>
                  </div>

                  {/* Navigation Arrows - Only show if more than 1 certificate */}
                  {certificateUrls.length > 1 && (
                    <>
                      <button
                        onClick={previousCertificate}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextCertificate}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Indicator Dots - Only show if more than 1 certificate */}
                  {certificateUrls.length > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      {certificateUrls.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentCertIndex(idx)}
                          className={`transition-all duration-200 rounded-full ${
                            idx === currentCertIndex
                              ? 'w-8 h-2 bg-indigo-600'
                              : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to certificate ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Certificate Counter */}
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Certificate {currentCertIndex + 1} of {certificateUrls.length}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Consultation Fee */}
            {profile.fee && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center mb-2">
                  <Mail className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold">Email</h3>
                </div>
                <p className="text-2xl">{profile.email}</p>
                {/* <p className="text-sm opacity-90 mt-2">per session</p> */}
              </div>
            )}

            {/* Languages */}
            {profile.languages.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <Languages className="w-6 h-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Languages</h3>
                </div>
                <div className="space-y-2">
                  {profile.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                      <span className="text-gray-700">{lang}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Download */}
            {resumeUrl && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Resume</h3>
                </div>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                >
                  View Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfilePage;