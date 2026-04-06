import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import { adminAPI } from '../services/api';
import SEO from '../components/common/SEO';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [adminStats, setAdminStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
    fetchRecentPosts();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setAdminStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await adminAPI.getRecentUsers(5);
      if (response.data.success) {
        setRecentUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent users:', error);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await adminAPI.getRecentPosts(5);
      if (response.data.success) {
        setRecentPosts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent posts:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return 'Just now';
  };

  const DEFAULT_PROFILE_PIC = 'https://ui-avatars.com/api/?name=User&background=random&size=200';

  const stats = adminStats ? [
    { label: 'Total Users', value: adminStats.totalUsers || 0, icon: '👥', color: 'blue', change: '+12%' },
    { label: 'Verified Users', value: adminStats.verifiedUsers || 0, icon: '✅', color: 'green', change: '+8%' },
    { label: 'Pending Verification', value: adminStats.pendingVerifications || 0, icon: '⏳', color: 'yellow', link: '/admin/verify', change: '-5%' },
    { label: 'Total Posts', value: adminStats.totalPosts || 0, icon: '📝', color: 'purple', change: '+15%' },
    { label: 'New Users', value: adminStats.newUsers || 0, icon: '🔥', color: 'orange', change: '+10%' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO title="Admin Dashboard | ShareSphere" />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 w-full lg:w-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden lg:block">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
              Overview of platform statistics and activities
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'year'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const StatCard = (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6 ${stat.link ? 'cursor-pointer hover:shadow-soft-lg transition-shadow' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    stat.change?.startsWith('+') 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {stat.value.toLocaleString()}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                  {stat.link && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </motion.div>
            );
            
            return stat.link ? <Link key={stat.label} to={stat.link}>{StatCard}</Link> : StatCard;
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Registrations
            </h2>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent users</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=200`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(user.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Posts
            </h2>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent posts</p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post._id} className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      {post.category === 'Electronics' ? '💻' :
                       post.category === 'Books' ? '📚' :
                       post.category === 'Vehicles' ? '🚗' :
                       post.category === 'Furniture' ? '🪑' :
                       post.category === 'Sports' ? '⚽' :
                       post.category === 'Fashion' ? '👔' :
                       post.category === 'Services' ? '🔧' :
                       post.category === 'Housing' ? '🏠' : '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{post.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{post.category}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{getTimeAgo(post.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
