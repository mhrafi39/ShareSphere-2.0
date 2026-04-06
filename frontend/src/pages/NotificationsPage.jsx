import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setNotifications, markAsRead, markAllAsRead as markAllReadAction, clearNotifications as clearNotificationsAction } from '../features/notificationSlice';
import NotificationItem from '../components/NotificationItem';
import Button from '../components/Button';
import { notificationsAPI } from '../services/api';
import SEO from '../components/common/SEO';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxNotifications = useSelector((state) => state.notifications.notifications);
  const [notifications, setNotificationsLocal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync with Redux notifications for real-time updates
  useEffect(() => {
    if (reduxNotifications && reduxNotifications.length >= 0) {
      setNotificationsLocal(reduxNotifications);
    }
  }, [reduxNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications();
      if (response.data.success) {
        // Dispatch to Redux to update unread count
        dispatch(setNotifications(response.data.data));
        setNotificationsLocal(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await notificationsAPI.markAsRead(notification._id);
        dispatch(markAsRead(notification._id));
      }

      // Navigate based on notification type
      if (notification.post) {
        navigate(`/posts/${notification.post._id || notification.post}`);
      } else if (notification.sender) {
        navigate(`/profile/${notification.sender._id || notification.sender}`);
      } else if (notification.type === 'verification') {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      // Update Redux state
      dispatch(markAllReadAction());
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationsAPI.clearAll();
      // Clear Redux state
      dispatch(clearNotificationsAction());
      setNotificationsLocal([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <SEO title="Notifications | ShareSphere" />
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with your activity
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're all caught up!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
