import { useState, useEffect } from 'react';
import { Filter, X, Clock, Video, Phone, MessageSquare, Award, Languages, IndianRupee, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientTherapistService } from '@/services/client/clientTherapistService';
import { axiosInstance } from '@/config/axios.config';
import { useNavigate } from 'react-router-dom';
import FloatingChatButtonRedesigned from '@/components/client/ChatbotRedesigned';
import Header from '@/components/client/Header';

interface Therapist {
  id: string;
  name: string;
  image: string;
  rating: number;
  experience: string;
  price: number;
  expertise: string[];
  languages: string[];
  availableVia: string[];
  nextSlot: {
    date: string;
    time: string;
  };
  gender: string;
}

const TherapistListing = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    languages: [] as string[],
    gender: [] as string[],
    priceRange: [0, 5000],
    specializations: [] as string[]
  });
  const [visibleCount, setVisibleCount] = useState(6);

  const navigate = useNavigate();

  const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Bengali'];
  const genderOptions = ['Male', 'Female', 'Other'];
  const specializationOptions = ['OCD', 'Anxiety disorders', 'Depressive disorders', 'Overthinking', 'Negative thinking', 'PTSD', 'Stress management'];

  const getPreSignedURL = async (fileName: string) => {
    try {
      const response = await axiosInstance.get('/therapist/s3-getPresigned-url', {
        params: { key: fileName },
      });
      return response.data.get_fileURL;
    } catch (error) {
      console.error('Error getting pre-signed URL:', error);
      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop';
    }
  };

  useEffect(() => {
    fetchTherapists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientTherapistService.getTherapists();
      
      if (response.success) {
        setTherapists(response.data);
        
        const urlPromises = response.data.map(async (therapist: Therapist) => {
          if (therapist.image) {
            const url = await getPreSignedURL(therapist.image);
            return { id: therapist.id, url };
          }
          return { 
            id: therapist.id, 
            url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' 
          };
        });
        
        const urls = await Promise.all(urlPromises);
        const urlMap = urls.reduce((acc, { id, url }) => {
          acc[id] = url;
          return acc;
        }, {} as Record<string, string>);
        
        setImageUrls(urlMap);
      } else {
        setError('Failed to fetch therapists');
      }
    } catch (err: unknown) {
      console.error('Error fetching therapists:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch therapists';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (category === 'languages' || category === 'gender' || category === 'specializations') {
      const current = filters[category] as string[];
      setFilters({
        ...filters,
        [category]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      languages: [],
      gender: [],
      priceRange: [0, 5000],
      specializations: []
    });
  };

  const filteredTherapists = therapists.filter(therapist => {
    if (filters.languages.length > 0 && !filters.languages.some(lang => therapist.languages.includes(lang))) {
      return false;
    }
    if (filters.gender.length > 0 && !filters.gender.includes(therapist.gender)) {
      return false;
    }
    if (therapist.price < filters.priceRange[0] || therapist.price > filters.priceRange[1]) {
      return false;
    }
    if (filters.specializations.length > 0 && !filters.specializations.some(spec => therapist.expertise.includes(spec))) {
      return false;
    }
    return true;
  });

  const activeFilterCount = filters.languages.length + filters.gender.length + filters.specializations.length;

  if (loading) {
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
              Finding the best therapists for you...
            </motion.p>
          </motion.div>
        </div>
      </>
    );
  }

  if (error) {
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
            <p className="text-red-600 dark:text-red-400 text-lg mb-6 font-medium">{error}</p>
            <button 
              onClick={fetchTherapists}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <FloatingChatButtonRedesigned />
      
      {/* Main container with gradient background */}
      <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-24 pb-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Centered Header with Responsive Filter */}
          <motion.div 
            className="my-8 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Filter Button - Top Right on Desktop */}
            <div className="hidden sm:block absolute top-0 right-0">
              <motion.button 
                onClick={() => setShowFilters(!showFilters)}
                className="relative flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-800 rounded-xl hover:border-teal-400 transition-all duration-300 shadow-md hover:shadow-lg group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Filters</span>
                {activeFilterCount > 0 && (
                  <motion.span 
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {activeFilterCount}
                  </motion.span>
                )}
              </motion.button>
            </div>

            {/* Centered Headline */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Find Your <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Perfect Therapist</span>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
                {filteredTherapists.length} expert{filteredTherapists.length !== 1 ? 's' : ''} available
              </p>
          </div>

            {/* Filter Button - Centered on Mobile */}
            <div className="flex justify-center sm:hidden mt-4">
              <motion.button 
                onClick={() => setShowFilters(!showFilters)}
                className="relative flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-800 rounded-xl hover:border-teal-400 transition-all duration-300 shadow-md hover:shadow-lg group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Filters</span>
                {activeFilterCount > 0 && (
                  <motion.span 
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {activeFilterCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Compact Filters Panel */}
          <AnimatePresence>
          {showFilters && (
              <motion.div 
                className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Filters
                  </h3>
                <button 
                  onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg font-semibold transition-colors"
                >
                    <X className="w-3 h-3" />
                  Clear All
                </button>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Language Filter */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
                    <div className="space-y-1.5">
                    {languageOptions.map(lang => (
                        <label 
                          key={lang} 
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-600/50 px-2 py-1 rounded transition-colors"
                        >
                        <input
                          type="checkbox"
                          checked={filters.languages.includes(lang)}
                          onChange={() => toggleFilter('languages', lang)}
                            className="w-3.5 h-3.5 text-teal-600 rounded focus:ring-1 focus:ring-teal-500"
                        />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                    <div className="space-y-1.5">
                    {genderOptions.map(gender => (
                        <label 
                          key={gender} 
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-600/50 px-2 py-1 rounded transition-colors"
                        >
                        <input
                          type="checkbox"
                          checked={filters.gender.includes(gender)}
                          onChange={() => toggleFilter('gender', gender)}
                            className="w-3.5 h-3.5 text-teal-600 rounded focus:ring-1 focus:ring-teal-500"
                        />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Price Range
                  </label>
                    <div className="mb-2 text-center bg-teal-50 dark:bg-teal-900/30 rounded-lg py-1.5">
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                      </span>
                    </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      style={{
                        background: `linear-gradient(to right, rgb(45 212 191) 0%, rgb(45 212 191) ${(filters.priceRange[1] / 5000) * 100}%, rgb(209 213 219) ${(filters.priceRange[1] / 5000) * 100}%, rgb(209 213 219) 100%)`
                      }}
                  />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>₹0</span>
                    <span>₹5000</span>
                  </div>
                </div>

                {/* Specialization Filter */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {specializationOptions.map(spec => (
                        <label 
                          key={spec} 
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-600/50 px-2 py-1 rounded transition-colors"
                        >
                        <input
                          type="checkbox"
                          checked={filters.specializations.includes(spec)}
                          onChange={() => toggleFilter('specializations', spec)}
                            className="w-3.5 h-3.5 text-teal-600 rounded focus:ring-1 focus:ring-teal-500"
                        />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Therapist Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredTherapists.slice(0, visibleCount).map((therapist) => (
              <motion.div 
                key={therapist.id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-teal-100 dark:border-teal-900 overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 via-cyan-50/0 to-blue-50/0 group-hover:from-teal-50/30 group-hover:via-cyan-50/20 group-hover:to-blue-50/30 transition-all duration-500 pointer-events-none"></div>
                
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Rating Badge - Top Right */}
                <div className="absolute top-4 right-4 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{therapist.rating.toFixed(1)}</span>
                </div>
                
                <div className="relative p-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Enhanced Profile Image */}
                    <div className="relative flex-shrink-0 w-full sm:w-auto">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <img 
                      src={imageUrls[therapist.id] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'}
                      alt={therapist.name}
                          className="relative w-full h-64 sm:w-32 sm:h-40 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop';
                      }}
                    />
                      </div>
                  </div>

                  {/* Therapist Info */}
                  <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h3 className="text-xl text-left font-bold text-gray-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {therapist.name}
                        </h3>
                        
                        {/* Experience */}
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">Experience:</span>
                          <span className="font-semibold">{therapist.experience}+ years</span>
                      </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <IndianRupee className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">Price:</span>
                          <span className="font-bold text-teal-600 dark:text-teal-400">₹{therapist.price}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">for 50 mins</span>
                      </div>
                    </div>

                      {/* Expertise Tags - Auto-scrolling Carousel */}
                    {therapist.expertise.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 whitespace-nowrap">Expertise:</span>
                            <div className="relative overflow-hidden flex-1 min-w-0">
                              <motion.div 
                                className="flex items-center gap-2"
                                animate={{
                                  x: therapist.expertise.length > 3 ? [0, -((therapist.expertise.length * 100) + (therapist.expertise.length * 8))] : 0
                                }}
                                transition={{
                                  x: {
                                    repeat: therapist.expertise.length > 3 ? Infinity : 0,
                                    repeatType: "loop",
                                    duration: therapist.expertise.length * 3,
                                    ease: "linear"
                                  }
                                }}
                              >
                                {[...therapist.expertise, ...(therapist.expertise.length > 3 ? therapist.expertise : [])].map((exp, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-xs px-2.5 py-1 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-700 font-medium whitespace-nowrap flex-shrink-0"
                                  >
                              {exp}
                            </span>
                          ))}
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">Languages:</span>
                        <span className="font-medium truncate">
                          {therapist.languages.length > 0 ? therapist.languages.join(', ') : 'Not specified'}
                        </span>
                      </div>
                  </div>
                </div>

                {/* Consultation Options */}
                  <div className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-900">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex gap-2 flex-wrap">
                        {therapist.availableVia.map((type, idx) => {
                          const getIcon = (type: string) => {
                            if (type.toLowerCase().includes('video')) return <Video className="w-3.5 h-3.5" />;
                            if (type.toLowerCase().includes('phone')) return <Phone className="w-3.5 h-3.5" />;
                            return <MessageSquare className="w-3.5 h-3.5" />;
                          };
                          
                          return (
                            <motion.button
                          key={idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500 transition-all font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                        >
                              {getIcon(type)}
                          {type}
                            </motion.button>
                          );
                        })}
                    </div>
                    
                      <motion.button 
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all font-bold shadow-lg hover:shadow-xl text-sm"
                        onClick={() => navigate(`/therapist/detail/${therapist.id}`)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Profile
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Load More Button */}
          {visibleCount < filteredTherapists.length && (
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  LOAD MORE THERAPISTS
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </motion.div>
          )}

          {/* Enhanced No Results */}
          {filteredTherapists.length === 0 && (
            <motion.div 
              className="text-center py-20 px-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-12 h-12 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No Therapists Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  We couldn't find any therapists matching your current filters. Try adjusting your criteria.
                </p>
                <motion.button 
                onClick={clearFilters}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                  Clear All Filters
                </motion.button>
            </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default TherapistListing;