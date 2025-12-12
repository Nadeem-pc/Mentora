import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { appointmentService } from '@/services/therapist/appointmentService';
import { axiosInstance } from '@/config/axios.config';

interface Appointment {
  id: string;
  clientName: string;
  profileImg: string;
  sessionDate: string;
  sessionTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  sessionMode: 'video' | 'phone';
}

export default function TherapistAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

const getPreSignedURL = async (fileName: string) => {
  try {
    const response = await axiosInstance.get('/therapist/s3-getPresigned-url', {
      params: { key: fileName },
    });
    return response.data.get_fileURL;
  } catch (error) {
    console.error('Error getting pre-signed URL:', error);
    return null;
  }
};

useEffect(() => {
  const fetchImageUrls = async () => {
    if (appointments.length === 0) return;
    
    const urlPromises = appointments.map(async (appointment) => {
      if (appointment.profileImg && !appointment.profileImg.startsWith('http')) {
        const url = await getPreSignedURL(appointment.profileImg);
        return { id: appointment.id, url: url || appointment.profileImg };
      }
      return { id: appointment.id, url: appointment.profileImg };
    });
    
    const urls = await Promise.all(urlPromises);
    const urlMap = urls.reduce((acc, { id, url }) => {
      acc[id] = url;
      return acc;
    }, {} as Record<string, string>);
    
    setImageUrls(urlMap);
  };

  fetchImageUrls();
}, [appointments]);


const fetchAppointments = async (page: number, status: string) => {
    setLoading(true);
    setError(null);
    
    try {
        const data = await appointmentService.getAppointments(page, 12, status);
        setAppointments(data.appointments);
        setPagination(data.pagination);
        setStatusCounts(data.statusCounts); 
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching appointments:', err);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    fetchAppointments(currentPage, filterStatus);
  }, [currentPage, filterStatus]);


  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1); 
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'video':
        return 'text-purple-600 bg-purple-50';

      case 'phone':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">Manage and track your therapy sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => handleFilterChange('all')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              filterStatus === 'all' 
                ? 'bg-blue-50 border-blue-300 shadow-md' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div 
            onClick={() => handleFilterChange('scheduled')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              filterStatus === 'scheduled' 
                ? 'bg-green-50 border-green-300 shadow-md' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-green-700">{statusCounts.scheduled}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div 
            onClick={() => handleFilterChange('completed')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              filterStatus === 'completed' 
                ? 'bg-blue-50 border-blue-300 shadow-md' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-blue-700">{statusCounts.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div 
            onClick={() => handleFilterChange('cancelled')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              filterStatus === 'cancelled' 
                ? 'bg-red-50 border-red-300 shadow-md' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-red-700">{statusCounts.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filter Info */}
        {filterStatus !== 'all' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filterStatus} appointments</span>
            <button 
              onClick={() => handleFilterChange('all')}
              className="text-blue-600 hover:underline ml-2"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Appointments Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Client Info */}
                    <div className="flex items-start gap-4 mb-4">
                        <img
                          src={imageUrls[appointment.id] || appointment.profileImg}
                          alt={appointment.clientName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.clientName)}`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {appointment.clientName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{formatDate(appointment.sessionDate)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{appointment.sessionTime}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getModeColor(appointment.sessionMode)}`}>
                          {getModeIcon(appointment.sessionMode)}
                        </div>
                        <span className="text-sm text-gray-700 capitalize">
                          {appointment.sessionMode.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((currentPage - 1) * 12) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 12, pagination.totalItems)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.totalItems}</span> appointments
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      pagination.hasPrevPage
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return page === 1 || 
                               page === pagination.totalPages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg transition-all ${
                              currentPage === page
                                ? 'bg-blue-600 text-white font-medium'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      pagination.hasNextPage
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">There are no {filterStatus} appointments to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}