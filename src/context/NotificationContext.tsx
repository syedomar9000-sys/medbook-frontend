'use client';

import React, { createContext, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/auth';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      let wsUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      wsUrl = wsUrl.replace('/api', '') + '/ws/notifications/?token=' + token;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("🟢 WebSocket Connected:", wsUrl);
      };

      ws.current.onclose = (e) => {
        console.log("🔴 WebSocket Disconnected:", e.code, e.reason);
      };

      ws.current.onerror = (err) => {
        console.error("🔴 WebSocket Error:", err);
      };

      ws.current.onmessage = (event) => {
        try {
          console.log("📩 Received WebSocket message:", event.data);
          const data = JSON.parse(event.data);
          if (data.message) {
            toast.success(data.message, {
              duration: 6000,
              position: 'bottom-right',
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
              },
            });
          }
        } catch (e) {
          console.error("Error parsing notification:", e);
        }
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={null}>
      <Toaster />
      {children}
    </NotificationContext.Provider>
  );
}
