import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Bell,
  Clock,
  Heart,
  Video,
  AlertCircle,
  Sparkles,
  Send,
  Link2,
  CheckCircle2,
  Mail,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
import { clientProfileService, type Appointment } from '@/services/client/profileServices';
import { notificationService } from '@/services/shared/notificationService';
import type { INotification } from '@/types/dtos/notification.dto';
import { getSocket } from '@/config/socket.config';
import { toast } from 'sonner';
import Header from '@/components/client/Header';

const affirmations = [
  'Small steps still move you forward.',
  'You are doing better than you think.',
  'Taking care of yourself is progress.',
  'Your feelings are valid, and so is your pace.',
  'Growth happens one day at a time.',
  'You have the strength to overcome challenges.',
];

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const MentalHealthPlatform = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await clientProfileService.getProfileDetails();
        if (response?.success && response?.data?.firstName) {
          setUserFirstName(response.data.firstName);
        }
      } catch (error) {
        console.error('Error loading user profile', error);
      }
    };

    const loadUpcoming = async () => {
      try {
        setLoadingAppointment(true);
        const response = await clientProfileService.getAppointments({ status: 'scheduled', limit: 5 });
        if (response?.success && Array.isArray(response.data)) {
          const sorted = [...response.data].sort((a: Appointment, b: Appointment) => {
            const dateA = new Date(a.appointmentDate).getTime();
            const dateB = new Date(b.appointmentDate).getTime();
            return dateA - dateB;
          });
          setUpcomingAppointment(sorted[0] || null);
          setAppointmentStats(prev => ({ ...prev, upcoming: response.data.length }));
        }
      } catch (error) {
        console.error('Error loading upcoming appointment', error);
        toast.error('Could not load your next session');
      } finally {
        setLoadingAppointment(false);
      }
    };

    const loadAppointmentStats = async () => {
      try {
        const [allResponse, completedResponse] = await Promise.all([
          clientProfileService.getAppointments({ limit: 100 }),
          clientProfileService.getAppointments({ status: 'completed', limit: 100 }),
        ]);
        
        if (allResponse?.success && Array.isArray(allResponse.data)) {
          setAppointmentStats(prev => ({ ...prev, total: allResponse.data.length }));
        }
        if (completedResponse?.success && Array.isArray(completedResponse.data)) {
          setAppointmentStats(prev => ({ ...prev, completed: completedResponse.data.length }));
        }
      } catch (error) {
        console.error('Error loading appointment stats', error);
      }
    };

    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const data = await notificationService.getNotifications(8);
        setNotifications(data || []);
      } catch (error) {
        console.error('Error loading notifications', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadUserProfile();
    loadUpcoming();
    loadAppointmentStats();
    loadNotifications();
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  const userDisplayName = useMemo(() => {
    if (userFirstName) return userFirstName;
    if (!user?.email) return 'Guest';
    const [name] = user.email.split('@');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [userFirstName, user]);

  const affirmation = useMemo(
    () => affirmations[Math.floor(Math.random() * affirmations.length)],
    []
  );

  const handleCancel = async () => {
    if (!upcomingAppointment) return;
    const confirmCancel = window.confirm('Cancel this appointment?');
    if (!confirmCancel) return;

    try {
      setCancelling(true);
      const response = await clientProfileService.cancelAppointment(
        upcomingAppointment._id,
        'Cancelled from dashboard'
      );
      if (response?.success) {
        toast.success('Appointment cancelled');
        setUpcomingAppointment(null);
        setAppointmentStats(prev => ({ ...prev, upcoming: Math.max(0, prev.upcoming - 1) }));
      }
    } catch (error: unknown) {
      console.error('Cancel error', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to cancel appointment';
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const handleSendQuickMessage = () => {
    if (!quickMessage.trim() || !upcomingAppointment?.therapistId?._id || !user?.id) {
      toast.error('Add a message and ensure a therapist is selected.');
      return;
    }
    setSending(true);
    try {
      const socket = getSocket();
      socket.emit('send_message', {
        clientId: user.id,
        therapistId: upcomingAppointment.therapistId._id,
        content: quickMessage.trim(),
      });
      setQuickMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Send message error', error);
      toast.error('Unable to send message right now');
    } finally {
      setSending(false);
    }
  };

  const quickActions = [
    {
      icon: Users,
      label: 'Find Therapist',
      description: 'Browse therapists',
      action: () => navigate('/therapists'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      label: 'AI Assistant',
      description: 'Get recommendations',
      action: () => {
        const chatbotButton = document.querySelector('[data-chatbot-button]');
        if (chatbotButton) (chatbotButton as HTMLElement).click();
      },
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: User,
      label: 'My Profile',
      description: 'View profile',
      action: () => navigate('/profile'),
      gradient: 'from-cyan-500 to-teal-500',
    },
  ];

  const renderAppointmentCard = () => {
    if (loadingAppointment) {
      return (
        <div className="rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <div className="h-4 w-24 bg-blue-50 rounded animate-pulse mb-3" />
          <div className="h-5 w-32 bg-blue-50 rounded animate-pulse mb-2" />
          <div className="h-3 w-20 bg-blue-50 rounded animate-pulse" />
        </div>
      );
    }

    if (!upcomingAppointment) {
      return (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-white/80 backdrop-blur-sm p-8 shadow-sm flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-2">No sessions scheduled</p>
            <p className="text-sm text-gray-600 mb-4">
              You don't have an upcoming appointment. Book a session to stay on track.
            </p>
          </div>
          <button
            onClick={() => navigate('/therapists')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Find a therapist
            <Link2 className="w-4 h-4" />
          </button>
        </div>
      );
    }

    const { therapistId, appointmentDate, slotId } = upcomingAppointment;
    const therapistName = `${therapistId?.firstName || ''} ${therapistId?.lastName || ''}`.trim() || 'Therapist';
    const sessionTime = slotId?.time || 'Scheduled';
    const sessionMode = slotId?.consultationModes?.[0] || 'Session';

    return (
      <div className="rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-semibold">Next appointment</p>
              <h3 className="text-xl font-bold text-gray-900">{therapistName}</h3>
            </div>
          </div>
          <span className="rounded-full bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 px-4 py-2 text-xs font-semibold border border-blue-200">
            {sessionMode}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-4 p-4 bg-gradient-to-br from-blue-50/50 to-teal-50/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(appointmentDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-semibold text-gray-900">{sessionTime}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              // Handle join session - you may need to implement this
              toast.info('Join session feature coming soon');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300"
          >
            Join session
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-semibold hover:bg-red-100 transition disabled:opacity-60"
          >
            Cancel
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99] as const,
      },
    },
  };

  return (
    <div className="min-h-screen w-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Header />
      <div className="relative pt-20 pb-12">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50/30 to-teal-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="absolute inset-0 opacity-30 dark:opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                               radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.12) 0%, transparent 50%)`
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 shadow-lg p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Daily wellness
                      </p>
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">{userDisplayName}</span> 👋
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">{affirmation}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 border border-blue-200 dark:border-blue-900/50 px-6 py-4 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2 shadow-md">
                  <CheckCircle2 className="w-5 h-5" />
                  Keep showing up for yourself
                </div>
              </div>
            </div>
          </motion.section>

          {/* Stats and Quick Actions - Integrated Layout */}
          <motion.section
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 shadow-lg p-6 sm:p-8">
              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                {[
                  { label: 'Total Sessions', value: appointmentStats.total, icon: Calendar, color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Upcoming', value: appointmentStats.upcoming, icon: Clock, color: 'text-teal-600 dark:text-teal-400' },
                  { label: 'Completed', value: appointmentStats.completed, icon: CheckCircle2, color: 'text-cyan-600 dark:text-cyan-400' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      index === 0 ? 'from-blue-500 to-blue-600' :
                      index === 1 ? 'from-teal-500 to-teal-600' :
                      'from-cyan-500 to-cyan-600'
                    } flex items-center justify-center shadow-md`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                      <p className={`text-xs font-medium ${stat.color} mt-1`}>{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions Row */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Quick Actions</h3>
                <div className="flex flex-wrap items-center gap-3">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      variants={itemVariants}
                      onClick={action.action}
                      className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Appointment */}
              <motion.section
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-6 sm:px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 font-semibold">Upcoming appointment</p>
                      <h2 className="text-xl font-bold text-white">Your next session</h2>
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  {renderAppointmentCard()}
                </div>
              </motion.section>

              {/* Therapist Messaging */}
              {upcomingAppointment && (
                <motion.section
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 sm:px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Send a message</h3>
                        <p className="text-sm text-teal-100">
                          Share a quick update with your therapist
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="relative">
                      <textarea
                        value={quickMessage}
                        onChange={(e) => setQuickMessage(e.target.value)}
                        rows={3}
                        placeholder="Type a quick update or question..."
                        className="w-full rounded-xl border border-blue-200 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition p-4 text-sm outline-none resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Messages go to your current therapist.
                      </p>
                      <button
                        onClick={handleSendQuickMessage}
                        disabled={sending || !quickMessage.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send message
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}
            </div>

            {/* Sidebar */}
            <aside>
              {/* Notifications */}
              <motion.section
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 shadow-lg overflow-hidden flex flex-col max-h-[600px]"
              >
                <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Notifications</h3>
                      <p className="text-sm text-cyan-100">Stay updated</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {loadingNotifications && (
                    <div className="space-y-3">
                      {[1, 2, 3].map((idx) => (
                        <div key={idx} className="h-16 rounded-xl bg-blue-50 dark:bg-gray-700 animate-pulse" />
                      ))}
                    </div>
                  )}
                  {!loadingNotifications && notifications.length === 0 && (
                    <div className="rounded-xl border border-dashed border-blue-200 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-700/50 p-6 text-center">
                      <Bell className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">No notifications right now. You're all caught up!</p>
                    </div>
                  )}
                  {!loadingNotifications &&
                    notifications.map((notif) => (
                      <motion.div
                        key={notif._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-blue-50/50 to-teal-50/30 dark:from-gray-700/50 dark:to-gray-700/30 border border-blue-100/50 dark:border-gray-700/50 p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 leading-snug">{notif.content}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(notif.timestamp)}</p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthPlatform;
