import { Calendar, Users, DollarSign, Clock, User, Star, Phone, Video, ChevronRight, Edit2 } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'confirmed' | 'pending' | 'completed';
}

interface Client {
  id: string;
  name: string;
  lastSession: string;
  status: 'active' | 'inactive';
  sessionsCount: number;
}

const TherapistDashboard: React.FC = () => {

  // Sample data
  const todayAppointments: Appointment[] = [
    { id: '1', clientName: 'Sarah Johnson', time: '10:00 AM', type: 'video', status: 'confirmed' },
    { id: '2', clientName: 'Michael Chen', time: '2:00 PM', type: 'phone', status: 'confirmed' },
    { id: '3', clientName: 'Emma Wilson', time: '4:30 PM', type: 'video', status: 'pending' },
  ];

  const recentClients: Client[] = [
    { id: '1', name: 'Sarah Johnson', lastSession: '2 days ago', status: 'active', sessionsCount: 8 },
    { id: '2', name: 'Michael Chen', lastSession: '1 week ago', status: 'active', sessionsCount: 5 },
    { id: '3', name: 'Emma Wilson', lastSession: '3 days ago', status: 'active', sessionsCount: 12 },
    { id: '4', name: 'David Brown', lastSession: '2 weeks ago', status: 'inactive', sessionsCount: 3 },
  ];

  const stats = [
    { label: 'Total Clients', value: '127', change: '+12%', icon: Users, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { label: 'Total Revenue', value: '$8,450', change: '+18%', icon: DollarSign, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { label: 'Sessions This Week', value: '24', change: '+5%', icon: Calendar, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { label: 'Average Rating', value: '4.9', change: '+0.2', icon: Star, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <main className="p-4 lg:p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last period
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Appointments */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                          appointment.type === 'video' ? 'bg-blue-100 text-blue-600' :
                          appointment.type === 'phone' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {getTypeIcon(appointment.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.clientName}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Clients */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Calendar className="w-4 h-4 mr-2" />
                    New Appointment
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="w-4 h-4 mr-2" />
                    Add Client
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Recent Clients */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Clients</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {recentClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                            <p className="text-xs text-gray-600">{client.lastSession}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            client.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                          }`}></span>
                          <p className="text-xs text-gray-600 mt-1">{client.sessionsCount} sessions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
};

export default TherapistDashboard;