import React, { useState, useEffect } from 'react';
import { Video, Phone, Calendar, Clock, X, FileText, Plus, Edit2, Check, ArrowLeft, AlertCircle, IndianRupee } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '@/services/therapist/appointmentService';
import { axiosInstance } from '@/config/axios.config';
import ConfirmationModal from '@/components/shared/Modal';
import { useAuth } from '@/contexts/auth.context';
import SessionVideoCall from '@/components/client/SessionVideoCall';
import { getSocket } from '@/config/socket.config';

interface AppointmentData {
  sessionFee: number;
  clientName: string;
  profileImage: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  date: string;
  time: string;
  mode: 'video' | 'phone';
  appointmentDateTime: Date;
  appointmentId?: string;
  clientId?: string;
}

interface FollowUpSession {
  date: string;
  time: string;
  mode: 'video' | 'audio';
}

const AppointmentDetailPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [followUpSession, setFollowUpSession] = useState<FollowUpSession | null>(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpMode, setFollowUpMode] = useState<'video' | 'audio'>('video');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [joinCountdownMs, setJoinCountdownMs] = useState<number | null>(null);

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      if (!appointmentId) {
        setError('Appointment ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await appointmentService.getAppointmentDetail(appointmentId);
        const data = response.data || response;

        const appointmentData: AppointmentData = {
          clientName: data.clientId?.firstName && data.clientId?.lastName 
            ? `${data.clientId.firstName} ${data.clientId.lastName}`
            : data.clientId?.firstName || 'Client',
          profileImage: data.clientId?.profileImg || '',
          status: data.status === 'scheduled' ? 'scheduled' : data.status,
          date: new Date(data.appointmentDate).toISOString().split('T')[0],
          time: data.appointmentTime || '00:00',
          mode: (data.slotId?.consultationModes?.[0] || 'video') as 'video' | 'phone',
          appointmentDateTime: new Date(data.appointmentDate),
          appointmentId: data._id,
          sessionFee: data.sessionFee,
          clientId: data.clientId?._id,
        };

        setAppointment(appointmentData);
        setSavedNotes(data.notes || '');

        if (data.clientId?.profileImg && !data.clientId.profileImg.startsWith('http')) {
          try {
            const urlResponse = await axiosInstance.get('/therapist/s3-getPresigned-url', {
              params: { key: data.clientId.profileImg }
            });
            setProfileImageUrl(urlResponse.data.get_fileURL);
          } catch (err) {
            console.error('Error fetching profile image URL:', err);
          }
        } else {
          setProfileImageUrl(data.clientId?.profileImg || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch appointment details');
        console.error('Error fetching appointment detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetail();
  }, [appointmentId]);

  const parseAppointmentDateTime = (dateStr: string, timeStr: string | undefined): Date | null => {
    const baseDate = new Date(dateStr);
    if (isNaN(baseDate.getTime())) return null;

    if (!timeStr) return baseDate;

    const trimmed = timeStr.trim();
    if (!trimmed) return baseDate;

    let hours = 0;
    let minutes = 0;
    let isPM = false;
    let hasAmPm = false;

    const amPmMatch = trimmed.match(/(am|pm)$/i);
    if (amPmMatch) {
      hasAmPm = true;
      isPM = amPmMatch[1].toLowerCase() === 'pm';
    }

    const cleaned = trimmed.replace(/(am|pm)/i, '').trim();
    const [hStr, mStr] = cleaned.split(':');
    hours = parseInt(hStr || '0', 10) || 0;
    minutes = parseInt(mStr || '0', 10) || 0;

    if (hasAmPm) {
      if (hours === 12) {
        hours = isPM ? 12 : 0;
      } else if (isPM) {
        hours += 12;
      }
    }

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  };

  const formatJoinCountdown = (ms: number): string => {
    if (ms <= 0) return 'Starting soon';

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
    }

    return `${hours}h ${minutes}m ${seconds}s left`;
  };

  useEffect(() => {
    if (!appointment) return;

    const start = parseAppointmentDateTime(appointment.date, appointment.time);
    if (!start) return;

    const update = () => {
      const now = Date.now();
      const joinOpenTime = start.getTime() - 10 * 60 * 1000;
      setJoinCountdownMs(joinOpenTime - now);
    };

    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, [appointment]);

  const handleCancelAppointment = async () => {
    if (appointment) {
      setIsSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointment({ ...appointment, status: 'cancelled' });
      setShowCancelModal(false);
      setIsSaving(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!appointment?.appointmentId) return;

    try {
      setIsSaving(true);
      await appointmentService.updateStatus(appointment.appointmentId, 'completed');
      setAppointment(prev => (prev ? { ...prev, status: 'completed' } : prev));
      setShowCompleteModal(false);
    } catch (err) {
      console.error('Error marking appointment as completed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!appointment?.appointmentId) return;

    try {
      setIsSaving(true);
      await appointmentService.saveNotes(appointment.appointmentId, notes.trim());
      setSavedNotes(notes);
      setIsEditingNotes(false);
      setShowNotesModal(false);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditNotes = () => {
    setNotes(savedNotes);
    setIsEditingNotes(true);
    setShowNotesModal(true);
  };

  const handleScheduleFollowUp = async () => {
    if (followUpDate && followUpTime) {
      setIsSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFollowUpSession({
        date: followUpDate,
        time: followUpTime,
        mode: followUpMode
      });
      setShowFollowUpModal(false);
      setFollowUpDate('');
      setFollowUpTime('');
      setFollowUpMode('video');
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canMarkCompleted =
    appointment?.status === 'scheduled' &&
    joinCountdownMs !== null &&
    joinCountdownMs <= -60 * 60 * 1000; // 50 minutes after start (10 min before + 60 min total)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/therapist/appointments')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || 'Failed to load appointment details'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/therapist/appointments')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={profileImageUrl || appointment.profileImage}
              alt={appointment.clientName}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.clientName)}`;
              }}
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {appointment.clientName}
              </h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-left text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(appointment.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{appointment.time}</p>
              </div>
            </div>
         
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {appointment.mode === 'video' ? (
                <Video className="w-5 h-5 text-blue-600" />
              ) : (
                <Phone className="w-5 h-5 text-blue-600" />
              )}
              <div>
                <p className="text-sm text-gray-500">Session Mode</p>
                <p className="font-medium text-gray-900 capitalize">{appointment.mode} Call</p>
              </div>
            </div>
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <IndianRupee className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Session Fee</p>
                <p className="font-medium text-gray-900">{appointment.sessionFee}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Counseling Notes Section */}
        {appointment.status === 'completed' && savedNotes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Counseling Notes
              </h2>
              <button
                onClick={handleEditNotes}
                disabled={appointment.status !== 'completed'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{savedNotes}</p>
            </div>
          </div>
        )}

        {/* Follow-up Session Details */}
        {followUpSession && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Check className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Follow-up Session Scheduled</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(followUpSession.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{followUpSession.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg md:col-span-2">
                {followUpSession.mode === 'video' ? (
                  <Video className="w-5 h-5 text-purple-600" />
                ) : (
                  <Phone className="w-5 h-5 text-purple-600" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Session Mode</p>
                  <p className="font-medium text-gray-900 capitalize">{followUpSession.mode} Call</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {appointment.status === 'scheduled' && (
            <>
              {appointment.mode === 'video' && appointment.clientId && user && (
                <button
                  disabled={joinCountdownMs !== null && joinCountdownMs > 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (joinCountdownMs !== null && joinCountdownMs > 0) return;
                    setIsVideoCallOpen(true);

                    const socket = getSocket();
                    const scheduledTime = appointment.time;

                    socket.emit('meeting_joined', {
                      clientId: appointment.clientId,
                      therapistId: user.id,
                      appointmentId: appointment.appointmentId,
                      joinedRole: 'therapist',
                      joinedUserName: 'Your therapist',
                      scheduledTime,
                    });
                  }}
                >
                  <Video className="w-5 h-5" />
                  {joinCountdownMs !== null && joinCountdownMs > 0
                    ? `Join in ${formatJoinCountdown(joinCountdownMs)}`
                    : 'Join Video Session'}
                </button>
              )}
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-4 px-6 rounded-lg border-2 border-red-600 transition duration-200 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel Appointment
              </button>
              {appointment.appointmentId && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  disabled={!canMarkCompleted || isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  Mark Session as Completed
                </button>
              )}
            </>
          )}

          {(appointment.status === 'completed') && !savedNotes && (
            <button
              onClick={() => setShowNotesModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Add Counseling Notes
            </button>
          )}

          {appointment.status === 'completed' && !followUpSession && (
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule Follow-up Session
            </button>
          )}
        </div>

        {/* Cancel Appointment Modal */}
        <ConfirmationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Appointment"
          description={`Are you sure you want to cancel this appointment with ${appointment.clientName}? This action cannot be undone.`}
          icon={<AlertCircle className="w-6 h-6" />}
          variant="danger"
          size="md"
          confirmButton={{
            label: 'Yes, Cancel',
            variant: 'danger',
            onClick: handleCancelAppointment,
            loading: isSaving
          }}
          cancelButton={{
            label: 'Keep Appointment',
            variant: 'secondary',
            onClick: () => setShowCancelModal(false)
          }}
        />

        {/* Mark as Completed Modal */}
        <ConfirmationModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          title="Mark Session as Completed"
          description={`Are you sure you want to mark this session with ${appointment.clientName} as completed?`}
          icon={<Check className="w-6 h-6" />}
          variant="info"
          size="md"
          confirmButton={{
            label: 'Yes, Mark as Completed',
            variant: 'primary',
            onClick: handleMarkCompleted,
            loading: isSaving,
          }}
          cancelButton={{
            label: 'Back',
            variant: 'secondary',
            onClick: () => setShowCompleteModal(false),
          }}
        />

        {/* Notes Modal */}
        <ConfirmationModal
          isOpen={showNotesModal}
          onClose={() => {
            setShowNotesModal(false);
            setIsEditingNotes(false);
            setNotes(savedNotes);
          }}
          title={isEditingNotes ? 'Edit Counseling Notes' : 'Add Counseling Notes'}
          icon={<FileText className="w-6 h-6" />}
          variant="info"
          size="lg"
          confirmButton={{
            label: 'Save Notes',
            variant: 'primary',
            onClick: handleSaveNotes,
            loading: isSaving,
            disabled: !notes.trim()
          }}
          cancelButton={{
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => {
              setShowNotesModal(false);
              setIsEditingNotes(false);
              setNotes(savedNotes);
            }
          }}
        >
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your session notes here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-2">
            {notes.length}/1000 characters
          </p>
        </ConfirmationModal>

        {/* Follow-up Session Modal */}
        <ConfirmationModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          title="Schedule Follow-up Session"
          icon={<Plus className="w-6 h-6" />}
          variant="info"
          size="md"
          confirmButton={{
            label: 'Schedule',
            variant: 'primary',
            onClick: handleScheduleFollowUp,
            loading: isSaving,
            disabled: !followUpDate || !followUpTime
          }}
          cancelButton={{
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setShowFollowUpModal(false)
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select 
                value={followUpMode}
                onChange={(e) => setFollowUpMode(e.target.value as 'video' | 'audio')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="video">Video Call</option>
                <option value="audio">Audio Call</option>
              </select>
            </div>
          </div>
        </ConfirmationModal>

        {/* Session Video Call Modal */}
        {isVideoCallOpen && appointment?.clientId && user && (
          <SessionVideoCall
            isOpen={isVideoCallOpen}
            clientId={appointment.clientId}
            therapistId={user.id}
            localRole="therapist"
            onClose={() => setIsVideoCallOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailPage;