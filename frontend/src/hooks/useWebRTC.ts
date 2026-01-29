import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/config/socket.config";

export type CallState = "idle" | "calling" | "ringing" | "connecting" | "connected" | "ended";

interface UseWebRTCOptions {
  clientId?: string;
  therapistId?: string;
}

interface IncomingCallInfo {
  fromUserId: string;
  fromRole: "client" | "therapist";
}

export const useWebRTC = ({ clientId, therapistId }: UseWebRTCOptions) => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [endInfo, setEndInfo] = useState<{
    byRole: "client" | "therapist" | "unknown";
    reason?: string;
  } | null>(null);

  const cleanup = () => {
    pcRef.current?.getSenders().forEach((sender) => {
      try {
        sender.track?.stop();
      } catch {
        // ignore
      }
    });
    pcRef.current?.close();
    pcRef.current = null;

    localStream?.getTracks().forEach((t) => t.stop());
    remoteStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const ensurePeerConnection = () => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(stream);
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "disconnected" || state === "failed" || state === "closed") {
        setCallState("ended");
        cleanup();
      }
    };

    const socket = getSocket();
    pc.onicecandidate = (event) => {
      if (!event.candidate || !clientId || !therapistId) return;
      socket.emit("webrtc_ice_candidate", {
        clientId,
        therapistId,
        candidate: event.candidate,
      });
    };

    pcRef.current = pc;
    return pc;
  };

  const getLocalMedia = async () => {
    if (localStream) return localStream;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    const pc = ensurePeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    return stream;
  };

  const startCall = async () => {
    if (!clientId || !therapistId) return;
    const socket = getSocket();

    try {
      setEndInfo(null);
      setCallState("calling");
      await getLocalMedia();
      const pc = ensurePeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { clientId, therapistId, sdp: offer });
    } catch (error) {
      console.error("Error starting call:", error);
      setCallState("idle");
      cleanup();
    }
  };

  const acceptCall = async () => {
    if (!clientId || !therapistId) return;
    const socket = getSocket();

    try {
      setCallState("connecting");
      await getLocalMedia();
      ensurePeerConnection();
      socket.emit("accept_call", { clientId, therapistId });
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
      setCallState("idle");
      cleanup();
    }
  };

  const rejectCall = () => {
    if (!clientId || !therapistId) return;
    const socket = getSocket();
    socket.emit("reject_call", { clientId, therapistId });
    setIncomingCall(null);
    setCallState("idle");
    cleanup();
  };

  const endCall = (reason?: string) => {
    if (clientId && therapistId) {
      const socket = getSocket();
      socket.emit("end_call", { clientId, therapistId, reason });
    }
    setEndInfo({ byRole: "unknown", reason });
    setCallState("ended");
    cleanup();
  };

  const leaveCallLocal = () => {
    setEndInfo({ byRole: "client", reason: "local_leave" });
    setCallState("ended");
    cleanup();
  };

  const toggleMute = () => {
    if (!localStream) return;
    const newMuted = !isMuted;
    localStream.getAudioTracks().forEach((t) => {
      t.enabled = !newMuted;
    });
    setIsMuted(newMuted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const newVideoOff = !isVideoOff;
    localStream.getVideoTracks().forEach((t) => {
      t.enabled = !newVideoOff;
    });
    setIsVideoOff(newVideoOff);
  };

  useEffect(() => {
    if (!clientId || !therapistId) return;
    const socket = getSocket();

    const handleIncomingCall = (payload: {
      clientId: string;
      therapistId: string;
      fromUserId: string;
      fromRole: "client" | "therapist";
    }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      setIncomingCall({ fromUserId: payload.fromUserId, fromRole: payload.fromRole });
      setCallState("ringing");
    };

    const handleCallAccepted = (payload: { clientId: string; therapistId: string }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      // Caller moves from calling -> connecting; callee already in connecting
      setCallState("connecting");
    };

    const handleCallRejected = (payload: { clientId: string; therapistId: string }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      setCallState("idle");
      setIncomingCall(null);
      cleanup();
    };

    const handleCallCancelled = (payload: { clientId: string; therapistId: string }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      setCallState("idle");
      setIncomingCall(null);
      cleanup();
    };

    const handleCallEnded = (payload: {
      clientId: string;
      therapistId: string;
      byRole?: "client" | "therapist" | "admin";
      reason?: string;
    }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      const byRole = payload.byRole === "client" || payload.byRole === "therapist" ? payload.byRole : "unknown";
      setEndInfo({ byRole, reason: payload.reason });
      setCallState("ended");
      cleanup();
    };

    const handleOffer = async (payload: { clientId: string; therapistId: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      try {
        const pc = ensurePeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        await getLocalMedia();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc_answer", { clientId, therapistId, sdp: answer });
        setCallState("connected");
      } catch (error) {
        console.error("Error handling WebRTC offer:", error);
        setCallState("idle");
        cleanup();
      }
    };

    const handleAnswer = async (payload: { clientId: string; therapistId: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      try {
        const pc = ensurePeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        setCallState("connected");
      } catch (error) {
        console.error("Error handling WebRTC answer:", error);
        setCallState("idle");
        cleanup();
      }
    };

    const handleCandidate = async (payload: { clientId: string; therapistId: string; candidate: RTCIceCandidateInit }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;
      try {
        const pc = ensurePeerConnection();
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_cancelled", handleCallCancelled);
    socket.on("call_ended", handleCallEnded);
    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice_candidate", handleCandidate);

    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_cancelled", handleCallCancelled);
      socket.off("call_ended", handleCallEnded);
      socket.off("webrtc_offer", handleOffer);
      socket.off("webrtc_answer", handleAnswer);
      socket.off("webrtc_ice_candidate", handleCandidate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, therapistId]);

  return {
    localStream,
    remoteStream,
    callState,
    incomingCall,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    leaveCallLocal,
    endInfo,
    toggleMute,
    toggleVideo,
  };
};
