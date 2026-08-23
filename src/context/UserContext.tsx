import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NotificationItem } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';

interface UserProfile { name: string; avatar: string; role: string; settlement: string; isVerified: boolean; email: string; phone: string; }
interface UserContextType {
  user: UserProfile;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'isRead'>) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  updateAvatar: (avatar: string) => void;
}

const defaultUser: UserProfile = {
  name: 'Олександр Дмитрук', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  role: 'Мешканець Рокитного', settlement: 'смт Рокитне', isVerified: true,
  email: 'alex.dmytruk@gromada.gov.ua', phone: '+380 97 123 4567'
};
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try { const saved = localStorage.getItem('hromada-user-profile'); return saved ? { ...defaultUser, ...JSON.parse(saved) } : defaultUser; } catch { return defaultUser; }
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [bookmarks, setBookmarks] = useState<string[]>(['post-1', 'prob-101']);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const markNotificationAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const addNotification = (item: Omit<NotificationItem, 'id' | 'isRead'>) => setNotifications(prev => [{ ...item, id: `notif-${Date.now()}`, isRead: false }, ...prev]);
  const toggleBookmark = (id: string) => setBookmarks(prev => prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]);
  const updateAvatar = (avatar: string) => setUser(prev => { const next = { ...prev, avatar }; try { localStorage.setItem('hromada-user-profile', JSON.stringify(next)); } catch {} return next; });
  return <UserContext.Provider value={{ user, notifications, unreadCount, markNotificationAsRead, addNotification, bookmarks, toggleBookmark, updateAvatar }}>{children}</UserContext.Provider>;
};
export const useUser = () => { const context = useContext(UserContext); if (!context) throw new Error('useUser must be used within a UserProvider'); return context; };
