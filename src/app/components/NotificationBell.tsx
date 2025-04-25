'use client';

import { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setUnread(data.filter((n: any) => !n.read).length);
      });
  }, [userId, open]);

  function markAsRead(id: string) {
    fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      .then(() => setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x)));
    setUnread(u => Math.max(0, u - 1));
  }

  return (
    <div className="relative">
      <button className="relative" onClick={() => setOpen(o => !o)}>
        <FaBell className="text-2xl" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 font-bold border-b dark:border-gray-700">Notifications</div>
          {notifications.length === 0 && <div className="p-4 text-gray-500">No notifications</div>}
          {notifications.map(n => (
            <div key={n._id} className={`p-4 border-b dark:border-gray-700 ${n.read ? 'bg-gray-50 dark:bg-gray-900' : 'bg-yellow-50 dark:bg-yellow-900'}`}
              onClick={() => !n.read && markAsRead(n._id)}
            >
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
