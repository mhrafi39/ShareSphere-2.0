/**
 * Cloudinary React SDK Integration
 * Uses @cloudinary/react and @cloudinary/url-gen for optimized image delivery
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { fill, scale, crop, limit } from '@cloudinary/url-gen/actions/resize';
import { autoGravity, focusOn } from '@cloudinary/url-gen/qualifiers/gravity';
import { FocusOn } from '@cloudinary/url-gen/qualifiers/focusOn';
import { byRadius, max } from '@cloudinary/url-gen/actions/roundCorners';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';

// Initialize Cloudinary instance
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  console.warn('VITE_CLOUDINARY_CLOUD_NAME is not set in environment variables');
}

export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName || 'demo',
  },
  url: {
    secure: true,
  },
});

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string} Public ID
 */
export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // If it's already a public ID (no http/https), return as is
  if (!url.startsWith('http')) return url;
  
  // If it's not a Cloudinary URL, return empty string
  if (!url.includes('cloudinary.com')) return '';
  
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return '';
    
    // Get the part after /upload/
    let publicIdPart = parts[1];
    
    // Remove version if exists (v1234567890/)
    publicIdPart = publicIdPart.replace(/^v\d+\//, '');
    
    // Remove file extension
    const lastDotIndex = publicIdPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      publicIdPart = publicIdPart.substring(0, lastDotIndex);
    }
    
    return publicIdPart;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};

/**
 * Get Cloudinary image instance for further transformations
 * @param {string} publicIdOrUrl - Public ID or full Cloudinary URL
 * @returns {CloudinaryImage} Cloudinary image instance
 */
export const getCloudinaryImage = (publicIdOrUrl) => {
  if (!publicIdOrUrl) return null;
  
  const publicId = getPublicIdFromUrl(publicIdOrUrl);
  if (!publicId) return null;
  
  return cld.image(publicId);
};

/**
 * Get profile avatar URL with transformations
 * @param {string} avatarUrl - Avatar image URL or public ID
 * @param {number} size - Desired size in pixels (default: 200)
 * @param {boolean} rounded - Apply round corners (default: true)
 * @returns {string} Transformed image URL
 */
export const getAvatarUrl = (avatarUrl, size = 200, rounded = true) => {
  if (!avatarUrl) return '';
  
  const image = getCloudinaryImage(avatarUrl);
  if (!image) return avatarUrl; // Return original if not a Cloudinary image
  
  let transformation = image
    .resize(fill().width(size).height(size).gravity(focusOn(FocusOn.face())))
    .delivery(quality(auto()))
    .delivery(format(autoFormat()));
  
  if (rounded) {
    transformation = transformation.roundCorners(max());
  }
  
  return transformation.toURL();
};

/**
 * Get thumbnail URL
 * @param {string} imageUrl - Image URL or public ID
 * @param {number} size - Thumbnail size (default: 150)
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (imageUrl, size = 150) => {
  if (!imageUrl) return '';
  
  const image = getCloudinaryImage(imageUrl);
  if (!image) return imageUrl;
  
  return image
    .resize(fill().width(size).height(size).gravity(autoGravity()))
    .delivery(quality(auto()))
    .delivery(format(autoFormat()))
    .toURL();
};

/**
 * Get post image URL with responsive sizing
 * @param {string} imageUrl - Image URL or public ID
 * @param {string} size - Size variant ('small', 'medium', 'large', 'original')
 * @returns {string} Transformed image URL
 */
export const getPostImageUrl = (imageUrl, size = 'medium') => {
  if (!imageUrl) return '';
  
  const image = getCloudinaryImage(imageUrl);
  if (!image) return imageUrl;
  
  const sizes = {
    small: 400,
    medium: 800,
    large: 1200,
    original: 2000,
  };
  
  const width = sizes[size] || sizes.medium;
  
  return image
    .resize(limit().width(width))
    .delivery(quality(auto()))
    .delivery(format(autoFormat()))
    .toURL();
};

/**
 * Get NID verification image URL
 * @param {string} nidImageUrl - NID image URL or public ID
 * @param {number} maxWidth - Maximum width (default: 1000)
 * @returns {string} Transformed image URL
 */
export const getNIDImageUrl = (nidImageUrl, maxWidth = 1000) => {
  if (!nidImageUrl) return '';
  
  const image = getCloudinaryImage(nidImageUrl);
  if (!image) return nidImageUrl;
  
  return image
    .resize(limit().width(maxWidth))
    .delivery(quality(auto()))
    .delivery(format(autoFormat()))
    .toURL();
};

/**
 * Get responsive image srcset for different screen sizes
 * @param {string} imageUrl - Image URL or public ID
 * @param {number[]} widths - Array of widths (default: [400, 800, 1200])
 * @returns {string} srcset string
 */
export const getResponsiveSrcSet = (imageUrl, widths = [400, 800, 1200]) => {
  if (!imageUrl) return '';
  
  const image = getCloudinaryImage(imageUrl);
  if (!image) return '';
  
  return widths
    .map((width) => {
      const url = image
        .resize(limit().width(width))
        .delivery(quality(auto()))
        .delivery(format(autoFormat()))
        .toURL();
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Get blurred placeholder for lazy loading
 * @param {string} imageUrl - Image URL or public ID
 * @returns {string} Blurred placeholder URL
 */
export const getBlurredPlaceholder = (imageUrl) => {
  if (!imageUrl) return '';
  
  const image = getCloudinaryImage(imageUrl);
  if (!image) return '';
  
  return image
    .resize(scale().width(50))
    .delivery(quality(10))
    .delivery(format(autoFormat()))
    .toURL();
};

/**
 * Check if URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} True if Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && url.includes('cloudinary.com');
};

/**
 * Get optimized image URL with custom transformations
 * @param {string} imageUrl - Image URL or public ID
 * @param {Object} options - Transformation options
 * @returns {string} Transformed image URL
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return '';
  
  const image = getCloudinaryImage(imageUrl);
  if (!image) return imageUrl;
  
  const {
    width,
    height,
    resizeMode = 'limit', // limit, fill, scale, crop
    quality: qualityLevel = 'auto',
    format: formatType = 'auto',
    gravity = 'auto',
  } = options;
  
  let transformation = image;
  
  // Apply resize
  if (width || height) {
    const resizeAction = {
      limit: limit(),
      fill: fill(),
      scale: scale(),
      crop: crop(),
    }[resizeMode] || limit();
    
    if (width) resizeAction.width(width);
    if (height) resizeAction.height(height);
    if (gravity && resizeMode === 'fill') {
      resizeAction.gravity(autoGravity());
    }
    
    transformation = transformation.resize(resizeAction);
  }
  
  // Apply quality
  transformation = transformation.delivery(
    qualityLevel === 'auto' ? quality(auto()) : quality(qualityLevel)
  );
  
  // Apply format
  transformation = transformation.delivery(
    formatType === 'auto' ? format(autoFormat()) : format(formatType)
  );
  
  return transformation.toURL();
};

// Export default instance
export default {
  cld,
  getCloudinaryImage,
  getPublicIdFromUrl,
  getAvatarUrl,
  getThumbnailUrl,
  getPostImageUrl,
  getNIDImageUrl,
  getResponsiveSrcSet,
  getBlurredPlaceholder,
  isCloudinaryUrl,
  getOptimizedImageUrl,
};
