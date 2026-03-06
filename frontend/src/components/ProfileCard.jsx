import { motion } from 'framer-motion';

const ProfileCard = ({ user, postsCount = 0 }) => {
  // Default profile picture
  const DEFAULT_PROFILE_PIC = 'https://ui-avatars.com/api/?name=' + 
    encodeURIComponent(user?.name || 'User') + '&background=random&size=200';
  
  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
            src={user.avatar || DEFAULT_PROFILE_PIC}
            alt={user.name || 'User'}
            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
          />
        </div>

        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
          {user.name || 'Unknown User'}
          {(user.verificationStatus === 'verified' || user.nidVerified) && (
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" title="Verified with NID">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{user.email || ''}</p>

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
              {postsCount}
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
