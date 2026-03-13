import { motion } from 'framer-motion';

const NotificationItem = ({ notification, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'request':
        return '📨';
      case 'verification':
        return '✅';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
        notification.read
          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
          : 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
      }`}
    >
      {/* Avatar or Icon */}
      {notification.sender?.avatar || notification.sender?.name ? (
        <img
          src={notification.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender.name || 'User')}&background=random&size=200`}
          alt={notification.sender.name}
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0 text-xl">
          {getIcon(notification.type)}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${
          notification.read
            ? 'text-gray-700 dark:text-gray-300'
            : 'text-gray-900 dark:text-gray-100 font-medium'
        }`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread Indicator */}
      {!notification.read && (
        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
      )}
    </motion.div>
  );
};

export default NotificationItem;
