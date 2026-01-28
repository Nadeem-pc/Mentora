import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, X } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { getSocket } from '@/config/socket.config';

interface SessionVideoCallProps {
  isOpen: boolean;
  clientId: string;
  therapistId: string;
  localRole: 'client' | 'therapist';
  onClose: () => void;
  onClientEnd?: () => void;
}

const SessionVideoCall: React.FC<SessionVideoCallProps> = ({ isOpen, clientId, therapistId, localRole, onClose, onClientEnd }) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasLocallyEnded, setHasLocallyEnded] = useState(false);

  const {
    localStream,
    remoteStream,
    callState,
    endInfo,
    isMuted,
    isVideoOff,
    startCall,
    endCall,
    leaveCallLocal,
    toggleMute,
    toggleVideo,
  } = useWebRTC({ clientId, therapistId });

  useEffect(() => {
    if (!clientId || !therapistId || !isOpen) return;
    const socket = getSocket();
    socket.emit('join_room', { clientId, therapistId });
  }, [clientId, therapistId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => undefined);
    }
  }, [localStream, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => undefined);
    }
  }, [remoteStream, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (localRole !== 'client') return;
    if (callState !== 'idle' && callState !== 'ended') return;
    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, localRole, callState]);

  useEffect(() => {
    if (!isOpen) return;
    if (localRole !== 'client') return;
    const socket = getSocket();

    const handlePeerJoined = (payload: { room: string; clientId: string; therapistId: string }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      if (callState === 'connected') return;
      startCall();
    };

    socket.on('peer_joined_room', handlePeerJoined);

    return () => {
      socket.off('peer_joined_room', handlePeerJoined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, localRole, callState, clientId, therapistId]);

  const handleClose = () => {
    endCall('closed_by_user');
    onClose();
  };

  const handleEndClick = () => {
    if (localRole === 'therapist') {
      endCall('ended_by_therapist');
      onClose();
    } else {
      // client ends only locally and can later rejoin
      leaveCallLocal();
      setHasLocallyEnded(true);
      if (onClientEnd) {
        onClientEnd();
      }
      onClose();
    }
  };

  const handleRejoin = () => {
    setHasLocallyEnded(false);
    startCall();
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!endInfo) return;

    // Only auto-close on the client side when therapist explicitly ends the call
    if (localRole === 'client' && endInfo.byRole === 'therapist' && !hasLocallyEnded) {
      onClose();
    }
  }, [isOpen, endInfo, localRole, hasLocallyEnded, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between bg-emerald-600 text-white">
          <h3 className="font-semibold text-sm sm:text-base">Video call</h3>
          <button onClick={handleClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row bg-black text-white h-[60vh]">
            <div className="flex-1 relative flex items-center justify-center">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover bg-black"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-sm text-gray-300">
                  <VideoIcon className="w-10 h-10" />
                  <span>
                    {callState === 'calling' && 'Calling therapist...'}
                    {callState === 'connecting' && 'Connecting...'}
                    {callState === 'connected' && 'Connected'}
                    {callState !== 'calling' && callState !== 'connecting' && callState !== 'connected' && 'Waiting for participant'}
                  </span>
                </div>
              )}

              {localStream && (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute bottom-4 right-4 w-32 h-24 rounded-lg object-cover border-2 border-white/40 shadow-lg bg-black"
                />
              )}
            </div>

            <div className="w-full sm:w-48 bg-gray-900 flex flex-col justify-between p-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-sm font-medium">
                  {callState === 'calling' && 'Calling'}
                  {callState === 'ringing' && 'Ringing'}
                  {callState === 'connecting' && 'Connecting'}
                  {callState === 'connected' && 'Connected'}
                  {callState === 'ended' && 'Call ended'}
                </p>
              </div>

              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full ${isMuted ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-700`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${isVideoOff ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-700`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                </button>
                {localRole === 'client' && hasLocallyEnded ? (
                  <button
                    onClick={handleRejoin}
                    className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2"
                  >
                    <VideoIcon className="w-5 h-5" />
                    Rejoin
                  </button>
                ) : (
                  <button
                    onClick={handleEndClick}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default SessionVideoCall;
