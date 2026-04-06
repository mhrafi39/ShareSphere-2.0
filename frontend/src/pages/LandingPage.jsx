import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';
import { postsAPI } from '../services/api';
import SEO from '../components/common/SEO';

const LandingPage = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        const response = await postsAPI.getPosts({ limit: 3 });
        if (response.data.success) {
          setFeaturedPosts(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch featured posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Resources Shared', value: '25,000+' },
    { label: 'Communities', value: '150+' },
    { label: 'Cities Covered', value: '50+' },
  ];

  return (
    <div className="min-h-screen">
      <SEO title="Welcome to ShareSphere" />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Share Resources,
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Build Community
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
                Join ShareSphere - a platform where communities come together to share resources, 
                reduce waste, and help each other thrive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-xl shadow-lg transition-colors"
                  >
                    Get Started Free
                  </motion.button>
                </Link>
                <Link to="/home">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-primary-600 text-primary-600 dark:text-primary-400 text-lg font-semibold rounded-xl shadow-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    Browse Resources
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                  alt="Community sharing"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured Resources
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Discover what others are sharing in your community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/home">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
              >
                View All Resources
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create an Account',
                description: 'Sign up for free and get verified to join our trusted community',
                icon: '👤',
              },
              {
                step: '2',
                title: 'Share or Browse',
                description: 'Post resources you want to share or browse what others are offering',
                icon: '🔍',
              },
              {
                step: '3',
                title: 'Connect & Share',
                description: 'Message owners, arrange pickups, and start building connections',
                icon: '🤝',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are building a sustainable sharing economy
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
              >
                Join ShareSphere Today
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
