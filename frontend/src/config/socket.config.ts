import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("accessToken");
    socket = io(import.meta.env.VITE_BASE_URL , {
      auth: {
        token,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}` 
      },
      withCredentials: true,
      transports: ['websocket', 'polling'] 
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};