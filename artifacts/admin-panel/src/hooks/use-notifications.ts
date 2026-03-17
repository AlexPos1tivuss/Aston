import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { useListFeedbacks, useListCallbacks } from "@workspace/api-client-react";

interface NotificationItem {
  id: string;
  type: "feedback" | "callback";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "admin_notifications_state";
const POLL_INTERVAL = 15000;

function loadState(): { lastFeedbackId: number; lastCallbackId: number; readIds: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lastFeedbackId: 0, lastCallbackId: 0, readIds: [] };
}

function saveState(state: { lastFeedbackId: number; lastCallbackId: number; readIds: string[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return "***";
  return phone.substring(0, 4) + " *** ***-**-" + phone.substring(phone.length - 2);
}

function requestBrowserNotification(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/admin/favicon.ico" });
  }
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export { NotificationsContext };

export function useNotificationsProvider(): NotificationsContextValue {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const stateRef = useRef(loadState());
  const initializedRef = useRef(false);

  const feedbacksQuery = useListFeedbacks(
    { page: 1, limit: 20 },
    { query: { refetchInterval: POLL_INTERVAL } }
  );

  const callbacksQuery = useListCallbacks(
    { page: 1, limit: 20 },
    { query: { refetchInterval: POLL_INTERVAL } }
  );

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!feedbacksQuery.data || !callbacksQuery.data) return;

    const state = stateRef.current;
    const newNotifs: NotificationItem[] = [];

    const feedbacks = feedbacksQuery.data.data || [];
    const callbacks = callbacksQuery.data.data || [];

    if (!initializedRef.current) {
      const maxFeedbackId = feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id)) : 0;
      const maxCallbackId = callbacks.length > 0 ? Math.max(...callbacks.map(c => c.id)) : 0;
      
      if (state.lastFeedbackId === 0 && state.lastCallbackId === 0) {
        state.lastFeedbackId = maxFeedbackId;
        state.lastCallbackId = maxCallbackId;
        saveState(state);
      }
      initializedRef.current = true;
    }

    for (const fb of feedbacks) {
      if (fb.id > state.lastFeedbackId) {
        const notifId = `feedback-${fb.id}`;
        newNotifs.push({
          id: notifId,
          type: "feedback",
          title: "Новое обращение",
          description: `${fb.name || "Аноним"}: ${fb.message.substring(0, 60)}...`,
          timestamp: new Date(fb.createdAt),
          read: state.readIds.includes(notifId),
        });
        requestBrowserNotification(
          "Новое обращение",
          `${fb.name || "Аноним"}: ${fb.message.substring(0, 80)}`
        );
      }
    }

    for (const cb of callbacks) {
      if (cb.id > state.lastCallbackId) {
        const notifId = `callback-${cb.id}`;
        newNotifs.push({
          id: notifId,
          type: "callback",
          title: "Новая заявка на звонок",
          description: `${cb.name} — ${cb.phoneNumber}`,
          timestamp: new Date(cb.createdAt),
          read: state.readIds.includes(notifId),
        });
        requestBrowserNotification(
          "Новая заявка на звонок",
          `${cb.name} — ${maskPhone(cb.phoneNumber)}`
        );
      }
    }

    if (newNotifs.length > 0) {
      const maxNewFeedbackId = feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id)) : state.lastFeedbackId;
      const maxNewCallbackId = callbacks.length > 0 ? Math.max(...callbacks.map(c => c.id)) : state.lastCallbackId;
      state.lastFeedbackId = Math.max(state.lastFeedbackId, maxNewFeedbackId);
      state.lastCallbackId = Math.max(state.lastCallbackId, maxNewCallbackId);
      saveState(state);

      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const unique = newNotifs.filter(n => !existingIds.has(n.id));
        return [...unique, ...prev].slice(0, 50);
      });
    }
  }, [feedbacksQuery.data, callbacksQuery.data]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const state = stateRef.current;
    state.readIds = notifications.map(n => n.id);
    saveState(state);
  }, [notifications]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const state = stateRef.current;
    if (!state.readIds.includes(id)) {
      state.readIds.push(id);
      saveState(state);
    }
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    const state = stateRef.current;
    state.readIds = [];
    saveState(state);
  }, []);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    notifications,
    unreadCount,
    isOpen,
    toggle,
    close,
    markAllRead,
    markRead,
    clearAll,
  };
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
