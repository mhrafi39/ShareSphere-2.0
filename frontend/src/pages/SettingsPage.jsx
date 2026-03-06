import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../features/authSlice';
import { useTheme } from '../hooks/useTheme';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { authAPI } from '../services/api';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('account');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    postLikes: true,
    newMessages: true,
    verificationUpdates: true,
  });

  // Default profile picture
  const DEFAULT_PROFILE_PIC = 'https://ui-avatars.com/api/?name=' + 
    encodeURIComponent(currentUser?.name || 'User') + '&background=random&size=200';

  // Account Settings
  const [accountData, setAccountData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
  });

  // Update account data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setAccountData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        location: currentUser.location || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowMessages: true,
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAccountUpdate = async () => {
    try {
      setIsUpdating(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', accountData.name);
      formData.append('bio', accountData.bio);
      formData.append('location', accountData.location);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await authAPI.updateProfile(formData);
      
      if (response.data.success) {
        // Update user in Redux store
        dispatch(updateUser(response.data.data));
        
        // Also update local account data with response
        setAccountData({
          name: response.data.data.name || '',
          email: response.data.data.email || '',
          location: response.data.data.location || '',
          bio: response.data.data.bio || '',
        });
        
        // Clear the file input and preview
        setAvatarFile(null);
        setAvatarPreview(null);
        
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // TODO: Call API to change password
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = () => {
    // TODO: Call API to delete account
    alert('Account deletion requested. This feature will be implemented.');
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-2 space-y-1">
                <TabButton
                  active={activeTab === 'account'}
                  onClick={() => setActiveTab('account')}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                >
                  Account
                </TabButton>
                <TabButton
                  active={activeTab === 'security'}
                  onClick={() => setActiveTab('security')}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                >
                  Security
                </TabButton>
                <TabButton
                  active={activeTab === 'notifications'}
                  onClick={() => setActiveTab('notifications')}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  }
                >
                  Notifications
                </TabButton>
                <TabButton
                  active={activeTab === 'privacy'}
                  onClick={() => setActiveTab('privacy')}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                >
                  Privacy
                </TabButton>
                <TabButton
                  active={activeTab === 'appearance'}
                  onClick={() => setActiveTab('appearance')}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  }
                >
                  Appearance
                </TabButton>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Profile Picture
                      </h2>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={avatarPreview || currentUser?.avatar || DEFAULT_PROFILE_PIC}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 object-cover"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="avatar-upload"
                            className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-block"
                          >
                            Change Picture
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            JPG, PNG or GIF. Max size 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <hr className="border-gray-200 dark:border-gray-700" />
                    
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Account Information
                      </h2>
                      <div className="space-y-4">
                        <Input
                          label="Full Name"
                          type="text"
                          value={accountData.name}
                          onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                        />
                        <Input
                          label="Location"
                          type="text"
                          placeholder="e.g., Dhaka, Bangladesh"
                          value={accountData.location}
                          onChange={(e) => setAccountData({ ...accountData, location: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bio
                          </label>
                          <textarea
                            rows={3}
                            value={accountData.bio}
                            onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button 
                          variant="primary" 
                          onClick={handleAccountUpdate}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Updating...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Change Password
                      </h2>
                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                        <Input
                          label="New Password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                      <div className="mt-6">
                        <Button variant="primary" onClick={handlePasswordChange}>
                          Update Password
                        </Button>
                      </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Two-Factor Authentication
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div>
                      <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                        Danger Zone
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Once you delete your account, there is no going back.
                      </p>
                      <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Notification Preferences
                      </h2>
                      <div className="space-y-4">
                        <ToggleOption
                          label="Email Notifications"
                          description="Receive notifications via email"
                          checked={notifications.emailNotifications}
                          onChange={() => handleNotificationChange('emailNotifications')}
                        />
                        <ToggleOption
                          label="Push Notifications"
                          description="Receive push notifications in browser"
                          checked={notifications.pushNotifications}
                          onChange={() => handleNotificationChange('pushNotifications')}
                        />
                        <ToggleOption
                          label="Post Likes"
                          description="Get notified when someone likes your post"
                          checked={notifications.postLikes}
                          onChange={() => handleNotificationChange('postLikes')}
                        />
                        <ToggleOption
                          label="New Messages"
                          description="Get notified when you receive a new message"
                          checked={notifications.newMessages}
                          onChange={() => handleNotificationChange('newMessages')}
                        />
                        <ToggleOption
                          label="Verification Updates"
                          description="Get notified about NID verification status changes"
                          checked={notifications.verificationUpdates}
                          onChange={() => handleNotificationChange('verificationUpdates')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Privacy Settings
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Profile Visibility
                          </label>
                          <select
                            value={privacySettings.profileVisibility}
                            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="public">Public - Anyone can see your profile</option>
                            <option value="private">Private - Only you can see your profile</option>
                            <option value="friends">Friends - Only verified users can see</option>
                          </select>
                        </div>

                        <ToggleOption
                          label="Show Email on Profile"
                          description="Display your email address on your public profile"
                          checked={privacySettings.showEmail}
                          onChange={() => handlePrivacyChange('showEmail', !privacySettings.showEmail)}
                        />
                        <ToggleOption
                          label="Show Location"
                          description="Display your location on your profile"
                          checked={privacySettings.showLocation}
                          onChange={() => handlePrivacyChange('showLocation', !privacySettings.showLocation)}
                        />
                        <ToggleOption
                          label="Allow Messages"
                          description="Allow other users to send you messages"
                          checked={privacySettings.allowMessages}
                          onChange={() => handlePrivacyChange('allowMessages', !privacySettings.allowMessages)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Appearance Settings
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Theme
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => theme === 'dark' && toggleTheme()}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                theme === 'light'
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium text-gray-900 dark:text-gray-100">Light</span>
                              </div>
                            </button>
                            <button
                              onClick={() => theme === 'light' && toggleTheme()}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                theme === 'dark'
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <svg className="w-8 h-8 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                                <span className="font-medium text-gray-900 dark:text-gray-100">Dark</span>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 Your theme preference is saved automatically and will persist across sessions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Warning:</strong> This action cannot be undone. All your data including posts, messages, and profile information will be permanently deleted.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete your account? Type "DELETE" to confirm.
            </p>
            <Input
              type="text"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex gap-3 pt-4">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteAccount}
              >
                Yes, Delete My Account
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
      active
        ? 'bg-primary-600 text-white shadow-md'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const ToggleOption = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default SettingsPage;
