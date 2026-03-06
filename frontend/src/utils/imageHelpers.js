/**
 * Utility functions for image handling and Cloudinary integration
 */

/**
 * Convert File object to base64 for preview
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validate image file
 * @param {File} file - Image file
 * @param {number} maxSize - Maximum file size in MB (default: 10)
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateImage = (file, maxSize = 10) => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)',
    };
  }

  // Check file size
  const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image size must be less than ${maxSize}MB`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Create FormData for profile update with avatar
 * @param {Object} profileData - Profile data { name, bio, location }
 * @param {File} avatarFile - Avatar image file (optional)
 * @returns {FormData} FormData object
 */
export const createProfileFormData = (profileData, avatarFile = null) => {
  const formData = new FormData();
  
  if (profileData.name) formData.append('name', profileData.name);
  if (profileData.bio !== undefined) formData.append('bio', profileData.bio);
  if (profileData.location !== undefined) formData.append('location', profileData.location);
  
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  return formData;
};

/**
 * Create FormData for NID verification
 * @param {string} nidNumber - NID number
 * @param {File} nidImageFile - NID image file
 * @returns {FormData} FormData object
 */
export const createNIDFormData = (nidNumber, nidImageFile) => {
  const formData = new FormData();
  formData.append('nidNumber', nidNumber);
  formData.append('nidImage', nidImageFile);
  return formData;
};

/**
 * Create FormData for post creation/update with images
 * @param {Object} postData - Post data { title, description, category, location, status }
 * @param {FileList|Array} imageFiles - Array of image files
 * @returns {FormData} FormData object
 */
export const createPostFormData = (postData, imageFiles = []) => {
  const formData = new FormData();
  
  if (postData.title) formData.append('title', postData.title);
  if (postData.description) formData.append('description', postData.description);
  if (postData.category) formData.append('category', postData.category);
  if (postData.location) formData.append('location', postData.location);
  if (postData.status) formData.append('status', postData.status);
  
  // Append multiple images
  if (imageFiles && imageFiles.length > 0) {
    Array.from(imageFiles).forEach((file) => {
      formData.append('images', file);
    });
  }
  
  return formData;
};

/**
 * Compress image before upload
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width (default: 1200)
 * @param {number} quality - Image quality 0-1 (default: 0.8)
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get Cloudinary image with transformation
 * @param {string} url - Cloudinary image URL
 * @param {Object} transformations - Transformation options
 * @returns {string} Transformed image URL
 */
export const getCloudinaryImage = (url, transformations = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const { width, height, crop = 'fill', quality = 'auto' } = transformations;
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  let transform = [];
  if (width) transform.push(`w_${width}`);
  if (height) transform.push(`h_${height}`);
  if (crop) transform.push(`c_${crop}`);
  if (quality) transform.push(`q_${quality}`);
  
  const transformString = transform.join(',');
  return `${parts[0]}/upload/${transformString}/${parts[1]}`;
};

/**
 * Get optimized thumbnail URL
 * @param {string} url - Original image URL
 * @param {number} size - Thumbnail size (default: 200)
 * @returns {string} Thumbnail URL
 */
export const getThumbnail = (url, size = 200) => {
  return getCloudinaryImage(url, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
  });
};

/**
 * Get responsive image URL
 * @param {string} url - Original image URL
 * @param {string} size - Size ('small', 'medium', 'large')
 * @returns {string} Responsive image URL
 */
export const getResponsiveImage = (url, size = 'medium') => {
  const sizes = {
    small: { width: 400 },
    medium: { width: 800 },
    large: { width: 1200 },
  };
  
  return getCloudinaryImage(url, {
    ...sizes[size],
    quality: 'auto',
    crop: 'limit',
  });
};
