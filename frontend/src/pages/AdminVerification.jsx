import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Modal from '../components/Modal';

// Dummy pending verification users
const dummyPendingUsers = [
  {
    _id: 'u5',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    verificationStatus: 'pending',
    nid: '9876543210',
    nidImage: 'https://via.placeholder.com/600x400?text=NID+Card+Sample+1',
    submittedAt: '2024-01-16T10:30:00Z',
  },
  {
    _id: 'u6',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://i.pravatar.cc/150?img=6',
    verificationStatus: 'pending',
    nid: '1122334455',
    nidImage: 'https://via.placeholder.com/600x400?text=NID+Card+Sample+2',
    submittedAt: '2024-01-16T09:15:00Z',
  },
  {
    _id: 'u7',
    name: 'Carol White',
    email: 'carol@example.com',
    avatar: 'https://i.pravatar.cc/150?img=7',
    verificationStatus: 'pending',
    nid: '6677889900',
    nidImage: 'https://via.placeholder.com/600x400?text=NID+Card+Sample+3',
    submittedAt: '2024-01-15T16:45:00Z',
  },
];

const AdminVerification = () => {
  const [users, setUsers] = useState(dummyPendingUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleApprove = (userId) => {
    // TODO: Call API - PATCH /api/admin/verify/:userId with status: 'verified'
    setUsers(users.filter(u => u._id !== userId));
    alert('User verified successfully!');
  };

  const handleReject = (userId) => {
    // TODO: Call API - PATCH /api/admin/verify/:userId with status: 'rejected'
    setUsers(users.filter(u => u._id !== userId));
    alert('User verification rejected.');
  };

  const openImageModal = (user) => {
    setSelectedUser(user);
    setIsImageModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              NID Verification Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve user verification requests
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {users.length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Today</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rejected Today</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">0</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      NID Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      NID Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            No pending verification requests
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm">
                            All verification requests have been processed
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                {user.name}
                                {user.verificationStatus === 'verified' && (
                                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" title="Verified">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {user.nid}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openImageModal(user)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                          >
                            View Image
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(user.submittedAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(user._id)}
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(user._id)}
                            >
                              ✕ Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* NID Image Modal */}
        <Modal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          title={`NID Verification - ${selectedUser?.name}`}
        >
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
              <img
                src={selectedUser?.nidImage}
                alt="NID Card"
                className="w-full rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">NID Number</p>
                <p className="font-mono text-gray-900 dark:text-gray-100">
                  {selectedUser?.nid}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-gray-100">{selectedUser?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedUser && formatDate(selectedUser.submittedAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  handleApprove(selectedUser._id);
                  setIsImageModalOpen(false);
                }}
              >
                ✓ Approve Verification
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  handleReject(selectedUser._id);
                  setIsImageModalOpen(false);
                }}
              >
                ✕ Reject
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminVerification;
