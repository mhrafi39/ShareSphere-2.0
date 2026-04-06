import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../services/api';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import SEO from '../components/common/SEO';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isNidModalOpen, setIsNidModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await adminAPI.getReports('pending');
      if (response.data.success) setReports(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const fetchVerifications = async () => {
    try {
      const response = await adminAPI.getPendingVerifications();
      if (response.data.success) setVerifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers({ limit: 100 });
      if (response.data.success) setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchReports(), fetchVerifications(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResolveReport = async (reportId, status) => {
    try {
      const response = await adminAPI.resolveReport(reportId, status);
      if (response.data.success) {
        setToast({ show: true, message: `Report ${status} successfully`, type: 'success' });
        fetchReports();
      }
    } catch (error) {
      setToast({ show: true, message: 'Failed to update report', type: 'error' });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently remove this post?')) return;
    try {
      const response = await adminAPI.deletePostByAdmin(postId);
      if (response.data.success) {
        setToast({ show: true, message: 'Post removed and reports resolved', type: 'success' });
        fetchReports();
        fetchStats();
      }
    } catch (error) {
      setToast({ show: true, message: 'Failed to delete post', type: 'error' });
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const response = await adminAPI.toggleUserBan(userId);
      if (response.data.success) {
        const isBanned = response.data.data.isBanned;
        setToast({ show: true, message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`, type: 'success' });
        fetchUsers();
        fetchReports(); 
      }
    } catch (error) {
      setToast({ show: true, message: 'Failed to update user status', type: 'error' });
    }
  };

  const handleApproveVerification = async (userId) => {
    try {
      const response = await adminAPI.approveVerification(userId);
      if (response.data.success) {
        setToast({ show: true, message: 'Verification approved', type: 'success' });
        fetchVerifications();
      }
    } catch (error) {
      setToast({ show: true, message: 'Failed to approve', type: 'error' });
    }
  };

  const openNidModal = (user) => {
    setSelectedVerification(user);
    setIsNidModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <SEO title="Admin Dashboard | ShareSphere" />
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your community and platform health.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm mb-6 max-w-full overflow-x-auto no-scrollbar">
          {['stats', 'reports', 'verifications', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'reports' && reports.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {reports.length}
                </span>
              )}
              {tab === 'verifications' && verifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-[10px] rounded-full">
                  {verifications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Resources</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalPosts}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft">
                  <p className="text-sm text-gray-500 dark:text-gray-400">New Users (7d)</p>
                  <p className="text-3xl font-bold text-primary-600">{stats?.newUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Safety Reviews</p>
                  <p className="text-3xl font-bold text-red-500">{reports.length}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Info</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Content</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No pending reports. All quiet!</td>
                        </tr>
                      ) : (
                        reports.map((report) => (
                          <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-red-600">{report.reason}</div>
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{report.details}</div>
                              <div className="text-[10px] text-gray-400 mt-2">By {report.reportedBy?.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              {report.post ? (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium dark:text-white">{report.post.title}</div>
                                  <div className="text-xs text-primary-600">Category: {report.post.category}</div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 italic">Content already removed</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {report.post?.author ? (
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${report.post.author.isBanned ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                  <span className="text-xs">{report.post.author.isBanned ? 'Banned' : 'Active'}</span>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {report.post && (
                                  <Button size="xs" variant="secondary" onClick={() => handleDeletePost(report.post._id)}>Remove Post</Button>
                                )}
                                {report.post?.author && !report.post.author.isBanned && (
                                  <Button size="xs" variant="danger" onClick={() => handleToggleBan(report.post.author._id)}>Ban User</Button>
                                )}
                                <Button size="xs" variant="primary" onClick={() => handleResolveReport(report._id, 'dismissed')}>Dismiss</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'verifications' && (
              <motion.div
                key="verifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NID Info</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {verifications.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center text-gray-500">No pending verifications.</td>
                        </tr>
                      ) : (
                        verifications.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full" alt="" />
                                <div>
                                  <div className="text-sm font-medium dark:text-white">{user.name}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => openNidModal(user)}
                                className="text-xs text-primary-600 font-medium hover:underline"
                              >
                                View NID
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="xs" variant="primary" onClick={() => handleApproveVerification(user._id)}>Approve</Button>
                                <Button size="xs" variant="danger" onClick={() => {}}>Reject</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full" alt="" />
                              <div>
                                <div className="text-sm font-medium dark:text-white">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {user.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {user.role !== 'admin' && (
                              <Button size="xs" variant={user.isBanned ? 'primary' : 'danger'} onClick={() => handleToggleBan(user._id)}>
                                {user.isBanned ? 'Unban' : 'Ban'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NID Selection Modal */}
      <Modal
        isOpen={isNidModalOpen}
        onClose={() => setIsNidModalOpen(false)}
        title={`NID Verification - ${selectedVerification?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-2 overflow-hidden">
            <img
              src={selectedVerification?.nidImage}
              alt="NID Card"
              className="w-full rounded-lg shadow-sm"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=NID+Image+Not+Found'; }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">NID Number</p>
              <p className="font-mono font-bold">{selectedVerification?.nidNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p>{selectedVerification?.email}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <Button
              className="flex-1"
              variant="primary"
              onClick={() => {
                handleApproveVerification(selectedVerification._id);
                setIsNidModalOpen(false);
              }}
            >
              Approve
            </Button>
            <Button
              className="flex-1"
              variant="danger"
              onClick={() => {
                // Potential for handleReject later
                setToast({ show: true, message: 'Rejection reason required (Not implemented in quick view)', type: 'warning' });
                setIsNidModalOpen(false);
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
