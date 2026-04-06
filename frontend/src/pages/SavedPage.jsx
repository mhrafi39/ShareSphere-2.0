import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import PostCard from '../components/PostCard';
import { SkeletonPostCard } from '../components/Skeleton';
import { postsAPI } from '../services/api';
import SEO from '../components/common/SEO';

const SavedPage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getSavedPosts();
      if (response.data.success) {
        setSavedPosts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <SEO title="Saved Resources | ShareSphere" />
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Saved Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Posts you've saved for later
          </p>
        </div>

        {/* Saved Posts */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <SkeletonPostCard key={i} />
            ))}
          </div>
        ) : savedPosts.length > 0 ? (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={fetchSavedPosts} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-soft"
          >
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No saved posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Save posts you're interested in to view them later
            </p>
            <motion.a
              href="/home"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Posts
            </motion.a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
