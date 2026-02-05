import { motion } from 'framer-motion';

const ProfileCard = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
    >
      {/* Avatar and Basic Info */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
          />
        </div>

        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
          {user.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>

        {user.bio && (
          <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm">
            {user.bio}
          </p>
        )}

        {user.location && (
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{user.location}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.postsCount || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.rating || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.verified ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
          </div>
        </div>
      </div>

      {user.joinedDate && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      )}
    </motion.div>
  );
};

export default ProfileCard;
