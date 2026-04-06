import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { updateVerificationStatus } from '../features/authSlice';
import ProfileCard from '../components/ProfileCard';
import PostCard from '../components/PostCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { usersAPI, postsAPI, authAPI } from '../services/api';
import SEO from '../components/common/SEO';

const ProfilePage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'posts');
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  
  // NID Verification Form
  const [nidNumber, setNidNumber] = useState('');
  const [nidImage, setNidImage] = useState(null);
  const [nidPreview, setNidPreview] = useState(null);
  
  // Review Form
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLabel, setReviewLabel] = useState('Excellent');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // If userId is provided, find that user's data, otherwise use current user
  const isOwnProfile = !userId || userId === currentUser?._id;

  // Wait for current user to load on own profile
  useEffect(() => {
    if (isOwnProfile && isAuthenticated) {
      // Wait for currentUser to be loaded
      if (currentUser) {
        setUserLoading(false);
      }
    } else {
      setUserLoading(false);
    }
  }, [currentUser, isOwnProfile, isAuthenticated]);

  // Fetch user profile and posts
  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const targetId = userId || currentUser?._id;
      if (!targetId) {
        setLoading(false);
        return;
      }

      // Fetch full user profile, including posts and reviews
      const response = await usersAPI.getUserProfile(targetId);
      if (response.data.success) {
        const { user, posts, reviews, averageRating } = response.data.data;
        setProfileUser(user);
        setUserPosts(posts || []);
        setUserReviews(reviews || []);
        setAverageRating(averageRating || 0);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setUserPosts([]);
      setUserReviews([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Don't fetch if still loading current user
    if (userLoading) {
      return;
    }

    fetchProfileData();
  }, [userId, currentUser, isOwnProfile, userLoading]);

  // Show alert if redirected from create page
  useEffect(() => {
    if (location.state?.needsVerification) {
      setShowVerificationAlert(true);
      setTimeout(() => setShowVerificationAlert(false), 5000);
    }
    
    // Set active tab if passed in state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  // Show loading state
  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if user not found or not logged in
  if (!loading && !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isOwnProfile ? 'Please log in' : 'User not found'}
          </h2>
          <Link to={isOwnProfile ? '/login' : '/home'} className="text-primary-600 hover:underline">
            {isOwnProfile ? 'Go to login' : 'Go back to home'}
          </Link>
        </div>
      </div>
    );
  }

  const handleNidImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNidImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNidPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = () => {
    if (!nidNumber || !nidImage) {
      alert('Please provide both NID number and NID image');
      return;
    }

    // TODO: Call API - POST /api/verification/submit
    dispatch(updateVerificationStatus({
      status: 'pending',
      nid: nidNumber,
      nidImage: nidPreview,
    }));

    setIsVerificationModalOpen(false);
    alert('NID submitted successfully! Your verification is pending admin approval.');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (isOwnProfile) return;
    setIsSubmittingReview(true);
    try {
      const response = await usersAPI.addReview(profileUser._id, {
        rating: reviewRating,
        label: reviewLabel,
        comment: reviewComment,
      });
      if (response.data.success) {
        setIsReviewModalOpen(false);
        setReviewRating(5);
        setReviewLabel('Excellent');
        setReviewComment('');
        fetchProfileData(); // Refresh reviews
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getVerificationBadge = () => {
    if (!profileUser) return null;
    
    const status = profileUser.verificationStatus || (profileUser.nidVerified ? 'verified' : 'unverified');
    
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            <span className="text-lg">🟢</span>
            <span className="text-sm font-medium">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg">
            <span className="text-lg">🟡</span>
            <span className="text-sm font-medium">Pending Verification</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            <span className="text-lg">🔴</span>
            <span className="text-sm font-medium">Verification Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
            <span className="text-lg">⚪</span>
            <span className="text-sm font-medium">Unverified</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <SEO title={`${profileUser?.name || 'Profile'} | ShareSphere`} />
      <div className="container-custom">
        {/* Verification Alert */}
        {showVerificationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  You must verify your NID to create posts.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card - Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {profileUser && (
              <ProfileCard 
                user={{
                  ...profileUser,
                  averageRating,
                  reviewsCount: userReviews.length
                }} 
                postsCount={userPosts.length} 
              />
            )}
            
            {/* Verification Badge */}
            {isOwnProfile && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Verification Status
                </h3>
                {getVerificationBadge()}
                
                {currentUser && !currentUser.nidVerified && currentUser.verificationStatus !== 'verified' && currentUser.verificationStatus !== 'pending' && (
                  <Link to="/verify-nid">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Apply for Verification
                    </Button>
                  </Link>
                )}
                
                {currentUser.verificationStatus === 'rejected' && (
                  <Link to="/verify-nid">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reapply for Verification
                    </Button>
                  </Link>
                )}
                
                {currentUser.verificationStatus === 'pending' && (
                  <>
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Your verification is under review. We'll notify you within 24-48 hours.
                      </p>
                    </div>
                  </>
                )}
                
                {currentUser.verificationStatus === 'verified' && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-800 dark:text-green-200 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Your account is verified! You can now share resources.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {isOwnProfile ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate(`/chat?user=${profileUser._id}`)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send Message
              </Button>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-1 flex gap-1 overflow-x-auto scroolbar-hide">
              <TabButton
                active={activeTab === 'posts'}
                onClick={() => setActiveTab('posts')}
              >
                {isOwnProfile ? 'My Posts' : 'Posts'} ({userPosts.length})
              </TabButton>
              {isOwnProfile && (
                <TabButton
                  active={activeTab === 'saved'}
                  onClick={() => setActiveTab('saved')}
                >
                  Saved (0)
                </TabButton>
              )}
              <TabButton
                active={activeTab === 'reviews'}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({userReviews.length})
              </TabButton>
              <TabButton
                active={activeTab === 'activity'}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </TabButton>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {userPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userPosts.map((post) => (
                        <PostCard key={post._id} post={post} onUpdate={fetchProfileData} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="📝"
                      title="No posts yet"
                      description="Start sharing resources with your community"
                    />
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <EmptyState
                  icon="🔖"
                  title="No saved resources"
                  description="Resources you save will appear here"
                />
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        User Reviews
                      </h3>
                      {userReviews.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{averageRating}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">out of 5</span>
                        </div>
                      )}
                    </div>
                    {!isOwnProfile && isAuthenticated && (
                      <Button variant="primary" size="sm" onClick={() => setIsReviewModalOpen(true)}>
                        Write a Review
                      </Button>
                    )}
                  </div>
                  
                  {userReviews.length > 0 ? (
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <div key={review._id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <img src={review.reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.name || 'U')}&background=random`} alt="Reviewer" className="w-10 h-10 rounded-full" />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{review.reviewer?.name}</h4>
                                <div className="flex items-center text-xs mt-0.5 text-yellow-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={i < review.rating ? '' : 'text-gray-300 dark:text-gray-600'}>★</span>
                                  ))}
                                  <span className="ml-2 text-gray-500 dark:text-gray-400">{review.label}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="⭐"
                      title="No reviews yet"
                      description={isOwnProfile ? "You don't have any reviews." : "Be the first to review this person!"}
                    />
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {[
                      { action: 'Posted a resource', item: 'Laptop for Coding Projects', time: '2 hours ago' },
                      { action: 'Saved', item: 'Programming Books Collection', time: '5 hours ago' },
                      { action: 'Liked', item: 'DSLR Camera Kit', time: '1 day ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">{activity.action}</span>{' '}
                            <span className="text-primary-600 dark:text-primary-400">{activity.item}</span>
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To edit your profile picture and other information, please visit the Settings page.
          </p>
          
          <div className="flex gap-3 pt-4">
            <Link to="/settings" className="flex-1">
              <Button variant="primary" className="w-full">
                Go to Settings
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* NID Verification Modal */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Submit NID for Verification"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To create posts, you need to verify your identity with your National ID (NID).
          </p>

          <div>
            <Input
              label="NID Number"
              type="text"
              placeholder="Enter your NID number"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NID Card Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
              {nidPreview ? (
                <div className="relative">
                  <img
                    src={nidPreview}
                    alt="NID Preview"
                    className="w-full rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNidImage(null);
                      setNidPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label
                      htmlFor="nid-upload"
                      className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-block"
                    >
                      Upload NID Image
                    </label>
                    <input
                      id="nid-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleNidImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Your NID information will be reviewed by our admin team. 
              This process usually takes 24-48 hours.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmitVerification}
            >
              Submit for Verification
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsVerificationModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review ${profileUser?.name}`}
      >
        <form onSubmit={submitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex gap-2 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => {
                    setReviewRating(star);
                    const labels = ['Very Bad', 'Bad', 'Average', 'Good', 'Excellent'];
                    setReviewLabel(labels[star - 1]);
                  }}
                  className={`focus:outline-none transition-colors ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-primary-600 mt-1">{reviewLabel}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comment (Optional)
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              placeholder="Describe your experience with this person..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right mt-1">{reviewComment.length}/500</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              className="flex-1"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
      active
        ? 'bg-primary-600 text-white shadow-md'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

const EmptyState = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-12 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default ProfilePage;
