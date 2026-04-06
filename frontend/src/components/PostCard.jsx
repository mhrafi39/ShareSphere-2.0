import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import ShareMenu from './ShareMenu';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { postsAPI } from '../services/api';

const PostCard = ({ post, onUpdate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const optionsMenuRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [saves, setSaves] = useState(post.saves || 0);
  const [localPost, setLocalPost] = useState(post);
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    title: post.title,
    description: post.description,
    category: post.category,
    location: post.location,
    status: post.status
  });
  const [editLoading, setEditLoading] = useState(false);
  
  const isOwner = currentUser && post.author && (currentUser._id === post.author._id || currentUser._id === post.author);
  
  // Check if post is already liked by current user
  useEffect(() => {
    if (currentUser && post.likes) {
      const isLiked = Array.isArray(post.likes) 
        ? post.likes.some(likeId => likeId === currentUser._id || likeId._id === currentUser._id)
        : false;
      setLiked(isLiked);
      setLikes(Array.isArray(post.likes) ? post.likes.length : 0);
    }
  }, [post.likes, currentUser]);
  
  // Check if post is already saved by current user
  useEffect(() => {
    if (currentUser && post.saves) {
      const isSaved = Array.isArray(post.saves) 
        ? post.saves.some(saveId => saveId === currentUser._id || saveId._id === currentUser._id)
        : false;
      setSaved(isSaved);
      setSaves(Array.isArray(post.saves) ? post.saves.length : 0);
    }
  }, [post.saves, currentUser]);
  
  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };
    
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptionsMenu]);

  // Default profile picture
  const DEFAULT_PROFILE_PIC = 'https://ui-avatars.com/api/?name=' + 
    encodeURIComponent(post.author?.name || 'User') + '&background=random&size=200';

  const handleLike = async () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    try {
      // Optimistic UI update
      const newLiked = !liked;
      const newLikes = newLiked ? likes + 1 : likes - 1;
      setLiked(newLiked);
      setLikes(newLikes);
      
      // Call API
      const response = await postsAPI.toggleLike(post._id);
      if (response.data.success) {
        // Update with actual values from server
        setLikes(response.data.data.likes);
        setLiked(response.data.data.liked);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert optimistic update on error
      setLiked(!liked);
      setLikes(liked ? likes + 1 : likes - 1);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    try {
      const response = await postsAPI.toggleSave(post._id);
      if (response.data.success) {
        setSaved(response.data.data.saved);
        setSaves(response.data.data.saves);
        if (onUpdate) onUpdate(); // Refresh the list if on saved page
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const response = await postsAPI.updatePost(post._id, editForm);
      if (response.data.success) {
        setLocalPost({ ...localPost, ...editForm });
        setShowEditModal(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleToggleStatus = async () => {
    try {
      const newStatus = localPost.status === 'available' ? 'unavailable' : 'available';
      const response = await postsAPI.updatePost(post._id, { status: newStatus });
      if (response.data.success) {
        setLocalPost({ ...localPost, status: newStatus });
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };
  
  const handleMessageAuthor = () => {
    navigate(`/chat?user=${post.author?._id || post.author}`);
  };
  
  const handleMessageAboutPost = () => {
    // Navigate to chat with author and pass post context
    navigate(`/chat?user=${post.author?._id || post.author}&post=${post._id}&title=${encodeURIComponent(post.title)}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'borrowed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Author Info */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.author?._id || post.author}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=random&size=200`}
            alt={post.author?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 inline-flex items-center gap-1.5">
              <span>{post.author?.name || 'Unknown User'}</span>
              {(post.author?.verificationStatus === 'verified' || post.author?.nidVerified) && (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Verified with NID">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              {post.author?.averageRating > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <span>★</span>
                  <span className="font-medium">{post.author.averageRating}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(localPost.status)}`}>
            {localPost.status.charAt(0).toUpperCase() + localPost.status.slice(1)}
          </span>
          <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-xs font-medium">
            {post.category}
          </span>
          {/* Options Menu */}
          {currentUser && (
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => {
                          setShowEditModal(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Post
                      </button>
                      <button
                        onClick={() => {
                          handleToggleStatus();
                          setShowOptionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        {localPost.status === 'available' ? 'Mark as Unavailable' : 'Mark as Available'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleMessageAuthor();
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message about this post
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Image */}
      {(post.image || post.images?.[0]) && (
        <Link to={`/post/${post._id}`}>
          <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700" style={{ paddingBottom: '56.25%' }}>
            <img
              src={post.image || post.images?.[0]}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}

      {/* Post Content */}
      <div className="p-4">
        <Link to={`/post/${post._id}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{post.location}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-y-3">
        <div className="flex items-center gap-1 sm:gap-4 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 py-1 rounded-lg"
          >
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 ${liked ? 'fill-current text-primary-600' : 'fill-none stroke-current'}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium text-sm sm:text-base">{likes}</span>
          </motion.button>
          
          {/* Message Button - Only show if not the owner */}
          {!isOwner && currentUser && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMessageAboutPost}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors px-2 py-1 rounded-lg"
              title="Message about this post"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium text-sm sm:text-base hidden xs:inline">Message</span>
            </motion.button>
          )}

          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 py-1 rounded-lg"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="font-medium text-sm sm:text-base hidden xs:inline">Share</span>
            </motion.button>
            <ShareMenu
              url={`${window.location.origin}/post/${post._id}`}
              title={post.title}
              isOpen={showShareMenu}
              onClose={() => setShowShareMenu(false)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/post/${post._id}`)}
            className="flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg"
            title="Report this post"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3.L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium text-sm sm:text-base hidden xs:inline">Report</span>
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          className={`p-2 rounded-full transition-colors ${
            saved
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
          }`}
        >
          <svg
            className={`w-6 h-6 ${saved ? 'fill-current' : 'fill-none stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </motion.button>
      </div>
      
      {/* Edit Post Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Post"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            required
            minLength={5}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              required
              minLength={20}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
                <option value="Sports">Sports</option>
                <option value="Gaming">Gaming</option>
                <option value="Tools">Tools</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Location"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            required
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={editLoading}
            >
              {editLoading ? 'Updating...' : 'Update Post'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default PostCard;
