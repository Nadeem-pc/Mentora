import React from 'react';
import { Ban, UserCheck, Eye, Search } from 'lucide-react';

// Define the column configuration type
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

// Define the table props
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// Generic reusable table component
function Table<T extends Record<string, any>>({
  data,
  columns,
  className = '',
  headerClassName = '',
  rowClassName = '',
  onRowClick,
  loading = false,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Handle sorting
  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data based on current sort config
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className={`bg-gray-50 ${headerClassName}`}>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)} 
                className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                } ${column.className || ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span className=''>{column.header}</span>
                  {column.sortable && (
                    <span className="text-gray-400">
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${rowClassName}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 text-center text-sm text-gray-900 ${
                      column.className || ''
                    }`}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Example usage with sample data
interface User {
  id: number;
  profilePic: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'blocked';
  userType: 'user' | 'therapist';
}

const sampleUsers: User[] = [
  {
    id: 1,
    profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: '2023-01-15',
    status: 'active',
    userType: 'user'
  },
];

export default function TableDemo() {
  const [users, setUsers] = React.useState<User[]>(sampleUsers);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'clients' | 'therapists' | 'active' | 'blocked'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(5);



  // Filter and search logic
  const filteredUsers = React.useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      switch (activeTab) {
        case 'clients':
          matchesFilter = user.userType === 'user';
          break;
        case 'therapists':
          matchesFilter = user.userType === 'therapist';
          break;
        case 'active':
          matchesFilter = user.status === 'active';
          break;
        case 'blocked':
          matchesFilter = user.status === 'blocked';
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });
    
    return filtered;
  }, [users, searchTerm, activeTab]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const handleBlockUnblock = (userId: number) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
          : user
      )
    );
  };

  const handleViewDetails = (userId: number) => {
    alert(`Redirecting to user details page for user ID: ${userId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const userColumns: Column<User>[] = [
    {
      key: 'profilePic',
      header: 'Profile',
      className: 'w-20',
      render: (value, row) => (
        <div className="flex items-center">
          <img
            src={value}
            alt={`${row.name}'s profile`}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=6366f1&color=fff&size=40`;
            }}
          />
        </div>
      )
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      className: 'whitespace-nowrap',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      className: 'whitespace-nowrap',
      render: (value) => (
        <a 
          href={`mailto:${value}`} 
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value}
        </a>
      )
    },
{
  key: 'userType',
  header: 'Role',
  sortable: true,
  className: 'w-24',
  render: (value) => (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center inline-block ${
        value === 'therapist' 
          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      }`}
    >
      {value === 'therapist' ? 'Therapist' : 'Client'}
    </span>
  )
},

{
  key: 'status',
  header: 'Status',
  sortable: true,
  className: 'w-24',
  render: (value) => (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center inline-block ${
        value === 'active' 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}
    >
      {value === 'active' ? 'Active' : 'Blocked'}
    </span>
  )
},

    {
      key: 'id',
      header: 'Actions',
      className: 'w-32',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBlockUnblock(value);
            }}
            className={`p-2 rounded-md transition-all duration-200 hover:scale-105 ${
              row.status === 'active'
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
            }`}
            title={row.status === 'active' ? 'Block User' : 'Unblock User'}
          >
            {row.status === 'active' ? (
              <Ban size={16} />
            ) : (
              <UserCheck size={16} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(value);
            }}
            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-all duration-200 hover:scale-105 border border-blue-200"
            title="View User Details"
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with Search Bar (Left) and Tabs (Right) */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar - Left Side */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-210"
              />
            </div>

            {/* Filter Select - Right Side */}
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-8 py-2 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 transition-colors duration-200"
              >
                <option value="all">All Users</option>
                <option value="clients">Clients</option>
                <option value="therapists">Therapists</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          data={currentUsers}
          columns={userColumns}
          className=""
          emptyMessage="No users found"
        />

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{' '}
                {filteredUsers.length} results
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
    </div>
  );
}