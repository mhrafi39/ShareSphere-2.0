import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import { adminStats } from '../utils/dummyData';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');

  const stats = [
    { label: 'Total Users', value: adminStats.totalUsers, icon: '👥', color: 'blue', change: '+12%' },
    { label: 'Verified Users', value: adminStats.verifiedUsers, icon: '✅', color: 'green', change: '+8%' },
    { label: 'Pending Verification', value: adminStats.pendingVerification, icon: '⏳', color: 'yellow', link: '/admin/verify', change: '-5%' },
    { label: 'Total Posts', value: adminStats.totalPosts, icon: '📝', color: 'purple', change: '+15%' },
    { label: 'Active Posts', value: adminStats.activePosts, icon: '🔥', color: 'orange', change: '+10%' },
    { label: 'Reported Posts', value: adminStats.reportedPosts, icon: '⚠️', color: 'red', change: '+3%' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const StatCard = (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 ${stat.link ? 'cursor-pointer hover:shadow-soft-lg transition-shadow' : ''}`}
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
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Registrations
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <img
                    src={`https://i.pravatar.cc/150?img=${i + 5}`}
                    alt="User"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">User {i}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">user{i}@example.com</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{i}h ago</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Posts
            </h2>
            <div className="space-y-4">
              {[
                'Laptop for Coding',
                'Programming Books',
                'DSLR Camera',
                'Gaming Console',
                'Study Table',
              ].map((title, i) => (
                <div key={i} className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-xl">
                    📦
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Electronics</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{i + 1}h ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
