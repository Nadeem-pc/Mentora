import { blockUser, getUsers, unblockUser } from '@/services/admin/clientServices';
import React, { useState, useEffect } from 'react';
import { Ban, UserCheck, Eye, Search, Filter, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { S3BucketUtil } from '@/utils/S3Bucket.util';
import type { User } from '@/types/dtos/user.dto';
import ConfirmationModal from '../shared/Modal';
import { toast } from 'sonner';

interface FilterState {
  role: 'all' | 'therapist' | 'client';
  status: 'all' | 'active' | 'blocked';
}

const UserManagementTable: React.FC = () => {
  const navigate = useNavigate();
  const rowsPerPage = 10;
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    role: 'all',
    status: 'all'
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    user: null as User | null,
    action: 'block' as 'block' | 'unblock',
    isLoading: false
  });

  const getActiveFilter = () => {
    if (filters.role !== 'all' && filters.status !== 'all') {
      return `${filters.role}_${filters.status}`;
    } else if (filters.role !== 'all') {
      return filters.role;
    } else if (filters.status !== 'all') {
      return filters.status;
    }
    return 'all';
  };

  const loadUsers = async () => {
    const activeFilter = getActiveFilter();
    const res = await getUsers(searchQuery, currentPage, rowsPerPage, activeFilter);
    
    const usersWithSignedUrls = await Promise.all(
      res.data.map(async (user: User) => {
        if (user.profileImg) {
          try {
            user.profileImg = await S3BucketUtil.getPreSignedURL(user.profileImg);
          } catch (error) {
            console.error(`Failed to get signed URL for user ${user._id}:`, error);
          }
        }
        return user;
      })
    );
    
    setUsers(usersWithSignedUrls);
    setTotalUsers(res.total);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentPage, filters]);

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const openConfirmationModal = (action: 'block' | 'unblock', user: User) => {
    setModalState({
      isOpen: true,
      user,
      action,
      isLoading: false
    });
  };

  const closeConfirmationModal = () => {
    if (modalState.isLoading) return; 
    setModalState({
      isOpen: false,
      user: null,
      action: 'block',
      isLoading: false
    });
  };

  const handleConfirmAction = async () => {
    if (!modalState.user) return;

    setModalState(prev => ({ ...prev, isLoading: true }));

    try {
      let success = false;
      
      if (modalState.action === 'block') {
        success = await blockUser(modalState.user._id);
        toast.success("User blocked successfully")
      } else {
        success = await unblockUser(modalState.user._id);
        toast.success("User unblocked succesfully")
      }

      if (success) {
        await loadUsers();
        closeConfirmationModal();
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setModalState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getProfileImageUrl = (user: User) => {
    if (user.profileImg) {
      return user.profileImg;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=6366f1&color=fff&size=40`;
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      role: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.role !== 'all' || filters.status !== 'all';

  const getActiveFiltersText = () => {
    const activeFilters = [];
    if (filters.role !== 'all') {
      activeFilters.push(`${filters.role}s`);
    }
    if (filters.status !== 'all') {
      activeFilters.push(filters.status);
    }
    return activeFilters.join(' & ');
  };

  const isBlocking = modalState.action === 'block';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with Search Bar (Left) and Filter (Right) */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar - Left Side */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-100"
              />
            </div>

            {/* Advanced Filter - Right Side */}
            <div className="relative">
              <button
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                  hasActiveFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <Filter size={16} />
                {hasActiveFilters ? getActiveFiltersText() : 'Filter'}
                {hasActiveFilters && (
                  <span className="ml-1 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {(filters.role !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Advanced Filter Dropdown */}
              {showAdvancedFilter && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Filter Options</h3>
                      <button
                        onClick={() => setShowAdvancedFilter(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Role Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          User Role
                        </label>
                        <select
                          value={filters.role}
                          onChange={(e) => handleFilterChange('role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="all">All Roles</option>
                          <option value="therapist">Therapists</option>
                          <option value="client">Clients</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          User Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={clearAllFilters}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        disabled={!hasActiveFilters}
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowAdvancedFilter(false)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <div className="flex items-center justify-center">
                        <img
                          src={getProfileImageUrl(user)}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <a 
                        href={`mailto:${user.email}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {user.email || 'N/A'}
                      </a>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center inline-block ${
                          user.role === 'therapist' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {user.role === 'therapist' ? 'Therapist' : 'Client'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center inline-block ${
                          user.status?.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfirmationModal(
                              user.status?.toLowerCase() === 'active' ? 'block' : 'unblock',
                              user
                            );
                          }}
                          className={`p-2 rounded-md transition-all duration-200 hover:scale-105 ${
                            user.status?.toLowerCase() === 'active'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                          }`}
                          title={user.status?.toLowerCase() === 'active' ? 'Block User' : 'Unblock User'}
                        >
                          {user.status?.toLowerCase() === 'active' ? (
                            <Ban size={16} />
                          ) : (
                            <UserCheck size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-all duration-200 hover:scale-105 border border-blue-200"
                          title="View User Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalUsers)} of{' '}
                {totalUsers} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        title={isBlocking ? 'Block User' : 'Unblock User'}
        description={
          isBlocking ? (
            <>
              Are you sure you want to <strong>block</strong> this user?
            </>
          ) : (
            <>
              Are you sure you want to <strong>unblock</strong> this user?
            </>
          )
        }
        icon={isBlocking ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
        variant={isBlocking ? 'danger' : 'success'}
        size="md"
        details={
          isBlocking
            ? [
                'Prevent them from accessing their account',
                'Suspend all their active sessions',
                'Block them from making new appointments'
              ]
            : [
                'Restore their account access',
                'Allow them to login again',
                'Enable them to make appointments'
              ]
        }
        confirmButton={{
          label: isBlocking ? 'Block User' : 'Unblock User',
          variant: isBlocking ? 'danger' : 'success',
          onClick: handleConfirmAction,
          loading: modalState.isLoading
        }}
        cancelButton={{
          label: 'Cancel',
          variant: 'secondary',
          onClick: closeConfirmationModal,
          disabled: modalState.isLoading
        }}
        closeOnOutsideClick={!modalState.isLoading}
        preventCloseWhileLoading={true}
      >
        {modalState.user && (
          <div className="flex items-center space-x-4">
            <img
              src={modalState.user.profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(modalState.user.firstName + ' ' + modalState.user.lastName)}&background=6366f1&color=fff&size=48`}
              alt={`${modalState.user.firstName} ${modalState.user.lastName}`}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <p className="font-medium text-gray-900">
                {modalState.user.firstName} {modalState.user.lastName}
              </p>
              <p className="text-xs text-left text-gray-400 capitalize">{modalState.user.role}</p>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default UserManagementTable;