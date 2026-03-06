const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} buffer - Image buffer
 * @param {String} folder - Cloudinary folder path
 * @param {Object} options - Additional upload options
 * @returns {Promise} Upload result with URL
 */
const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise} Delete result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload profile picture
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise} Upload result
 */
const uploadProfilePicture = async (buffer) => {
  return uploadToCloudinary(buffer, 'sharesphere/profiles', {
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
    ],
  });
};

/**
 * Upload post image
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise} Upload result
 */
const uploadPostImage = async (buffer) => {
  return uploadToCloudinary(buffer, 'sharesphere/posts', {
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto' },
    ],
  });
};

/**
 * Upload NID verification image
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise} Upload result
 */
const uploadNIDImage = async (buffer) => {
  return uploadToCloudinary(buffer, 'sharesphere/nid-verifications', {
    transformation: [
      { width: 1500, height: 1500, crop: 'limit' },
      { quality: 'auto' },
    ],
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} Public ID
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  
  // Get everything after 'upload' and version (if exists)
  const pathParts = parts.slice(uploadIndex + 1);
  // Skip version if it exists (starts with 'v')
  const startIndex = pathParts[0].startsWith('v') ? 1 : 0;
  const publicIdWithExt = pathParts.slice(startIndex).join('/');
  
  // Remove file extension
  return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')) || publicIdWithExt;
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadProfilePicture,
  uploadPostImage,
  uploadNIDImage,
  extractPublicId,
};
