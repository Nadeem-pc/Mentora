import { useState, useEffect } from 'react';
import { Filter, Star, X } from 'lucide-react';
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
      setError(err.message || 'Failed to fetch therapists');
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
        <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading therapists...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchTherapists}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <FloatingChatButtonRedesigned />
      
      {/* Add pt-20 to account for fixed header */}
      <div className="min-h-screen w-screen bg-gray-50 px-4 md:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Therapists</h1>
            
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
              >
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <div className="space-y-2">
                    {languageOptions.map(lang => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.languages.includes(lang)}
                          onChange={() => toggleFilter('languages', lang)}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="space-y-2">
                    {genderOptions.map(gender => (
                      <label key={gender} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.gender.includes(gender)}
                          onChange={() => toggleFilter('gender', gender)}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹5000</span>
                  </div>
                </div>

                {/* Specialization Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {specializationOptions.map(spec => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.specializations.includes(spec)}
                          onChange={() => toggleFilter('specializations', spec)}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Therapist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {filteredTherapists.slice(0, visibleCount).map((therapist) => (
              <div key={therapist.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={imageUrls[therapist.id] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'}
                      alt={therapist.name}
                      className="w-24 h-24 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop';
                      }}
                    />
                    <button 
                      onClick={() => {
                        navigate(`/therapist/detail/${therapist.id}`)
                      }}
                      className="absolute -bottom-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm whitespace-nowrap"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Therapist Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg text-left font-semibold text-gray-900">{therapist.name}</h3>
                        <p className="text-sm text-left text-gray-600">{therapist.experience}+ years of experience</p>
                        <p className="text-sm text-left text-gray-700 mt-1">₹{therapist.price} for 50 mins</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        {/* <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> */}
                        {/* <span className="text-sm font-medium text-gray-900">{therapist.rating}</span> */}
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    {therapist.expertise.length > 0 && (
                      <div className="mb-3 flex gap-3">
                        <p className="text-xs text-gray-500 mt-1">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {therapist.expertise.map((exp, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded border border-teal-200">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-left text-gray-600">
                      Speaks: {therapist.languages.length > 0 ? therapist.languages.join(', ') : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Consultation Options */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-2">
                      {therapist.availableVia.map((type, idx) => (
                        <button
                          key={idx}
                          className="px-4 py-1.5 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    <button className="w-full sm:w-auto px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                      BOOK
                    </button>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-sm">
                    <div>
                      {/* <span className="text-gray-500">Next Available Slot: </span>
                      <span className="font-medium text-green-600">{therapist.nextSlot.date}, {therapist.nextSlot.time}</span> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredTherapists.length && (
            <div className="flex justify-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                LOAD MORE
              </button>
            </div>
          )}

          {/* No Results */}
          {filteredTherapists.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No therapists found matching your filters.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TherapistListing;