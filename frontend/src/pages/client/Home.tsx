import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Bell,
  MessageCircle,
  Clock,
  Heart,
  Video,
  AlertCircle,
  Sparkles,
  Send,
  Link2,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
import { clientProfileService, type Appointment } from '@/services/client/profileServices';
import { notificationService } from '@/services/shared/notificationService';
import type { INotification } from '@/types/dtos/notification.dto';
import { getSocket } from '@/config/socket.config';
import { toast } from 'sonner';

const affirmations = [
  'Small steps still move you forward.',
  'You are doing better than you think.',
  'Taking care of yourself is progress.',
  'Your feelings are valid, and so is your pace.',
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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
        }
      } catch (error) {
        console.error('Error loading upcoming appointment', error);
        toast.error('Could not load your next session');
      } finally {
        setLoadingAppointment(false);
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

    loadUpcoming();
    loadNotifications();
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  const userDisplayName = useMemo(() => {
    if (!user?.email) return 'Guest';
    const [name] = user.email.split('@');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  const affirmation = useMemo(
    () => affirmations[Math.floor(currentTime.getMinutes() % affirmations.length)],
    [currentTime]
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
      }
    } catch (error: unknown) {
      console.error('Cancel error', error);
      const errorMessage = error?.response?.data?.message || 'Failed to cancel appointment';
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

  const renderAppointmentCard = () => {
    if (loadingAppointment) {
      return (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="h-4 w-24 bg-emerald-50 rounded animate-pulse mb-3" />
          <div className="h-5 w-32 bg-emerald-50 rounded animate-pulse mb-2" />
          <div className="h-3 w-20 bg-emerald-50 rounded animate-pulse" />
        </div>
      );
    }

    if (!upcomingAppointment) {
      return (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-6 shadow-sm flex flex-col items-start gap-3">
          <div className="flex items-center gap-3 text-emerald-600">
            <Calendar className="w-5 h-5" />
            <p className="font-semibold">No sessions scheduled</p>
          </div>
          <p className="text-sm text-gray-600">
            You don’t have an upcoming appointment. Book a session to stay on track.
          </p>
          <a
            className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800"
            href="/therapists"
          >
            Find a therapist <Link2 className="w-4 h-4" />
          </a>
        </div>
      );
    }

    const { therapistId, appointmentDate, slotId } = upcomingAppointment;
    const therapistName = `${therapistId?.firstName || ''} ${therapistId?.lastName || ''}`.trim() || 'Therapist';
    const sessionTime = slotId?.time || 'Scheduled';
    const sessionMode = slotId?.consultationModes?.[0] || 'Session';

    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-emerald-600 font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Next appointment
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-1">{therapistName}</h3>
            <p className="text-sm text-gray-600">{sessionMode}</p>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
            {sessionMode}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>{formatDate(appointmentDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>{sessionTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-white font-semibold shadow hover:shadow-md transition">
            Join session
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700 font-semibold hover:bg-red-100 transition disabled:opacity-60"
          >
            Cancel
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#f5f8f4] via-white to-[#eef7f3] text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome */}
        <section className="rounded-3xl bg-white/80 backdrop-blur border border-emerald-100 shadow-sm p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-emerald-600 font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Heart className="w-5 h-5" />
            </span>
            <p className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Daily wellness
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                {greeting}, {userDisplayName} 👋
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">{affirmation}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Keep showing up for yourself
            </div>
          </div>
        </section>

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Upcoming */}
            <section className="rounded-3xl bg-gradient-to-br from-white to-emerald-50/60 border border-emerald-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">Upcoming appointment</p>
                  <h2 className="text-xl font-semibold text-gray-900">Stay prepared for your next session</h2>
                </div>
              </div>
              {renderAppointmentCard()}
            </section>

            {/* Therapist interaction */}
            <section className="rounded-3xl bg-white border border-emerald-100 shadow-sm p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">Therapist messaging</p>
                  <h3 className="text-lg font-semibold text-gray-900">Have something to share?</h3>
                  <p className="text-sm text-gray-600">
                    Send a quick note to your therapist. Keep it brief and focused.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    rows={3}
                    placeholder="Type a quick update or question..."
                    className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition p-3 text-sm outline-none"
                  />
                  <Mail className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-gray-500">
                    Messages go to your current therapist. New to sessions? Book one to start messaging.
                  </p>
                  <button
                    onClick={handleSendQuickMessage}
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-white font-semibold shadow hover:shadow-md transition disabled:opacity-60"
                  >
                    Send message
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Notifications */}
          <aside className="space-y-6">
            <section className="rounded-3xl max-h-[90vh] overflow-x-hidden bg-white border border-emerald-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">Notifications & reminders</p>
                  <h3 className="text-lg font-semibold text-gray-900">Stay on track</h3>
                </div>
                <Bell className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-3">
                {loadingNotifications && (
                  <div className="space-y-2">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="h-14 rounded-2xl bg-emerald-50 animate-pulse" />
                    ))}
                  </div>
                )}
                {!loadingNotifications && notifications.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-gray-600">
                    No notifications right now. You’re all caught up!
                  </div>
                )}
                {!loadingNotifications &&
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 hover:shadow-sm transition"
                    >
                      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-inner">
                        <AlertCircle className="w-4 h-4" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{notif.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(notif.timestamp)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthPlatform;