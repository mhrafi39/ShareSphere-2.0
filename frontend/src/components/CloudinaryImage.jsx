/**
 * Cloudinary React Components
 * Ready-to-use React components using @cloudinary/react SDK
 */

import React, { useState } from 'react';
import { AdvancedImage, lazyload, responsive, placeholder } from '@cloudinary/react';
import { getCloudinaryImage, getBlurredPlaceholder } from '@/utils/cloudinary';

/**
 * Avatar Component - Displays user profile picture with Cloudinary optimizations
 * 
 * @param {string} src - Avatar image URL or public ID
 * @param {number} size - Size in pixels (default: 40)
 * @param {string} alt - Alt text
 * @param {string} className - Additional CSS classes
 */
export const CloudinaryAvatar = ({ src, size = 40, alt = 'Avatar', className = '' }) => {
  if (!src) {
    return (
      <div
        className={`bg-gray-300 rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-600 text-sm">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  const image = getCloudinaryImage(src);
  
  if (!image) {
    // Fallback for non-Cloudinary images
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Apply transformations
  const transformedImage = image
    .resize(`c_fill,w_${size},h_${size},g_face`)
    .delivery('q_auto')
    .delivery('f_auto')
    .roundCorners('max');

  return (
    <AdvancedImage
      cldImg={transformedImage}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      plugins={[lazyload()]}
    />
  );
};

/**
 * Post Image Component - Displays post images with lazy loading and responsive sizing
 * 
 * @param {string} src - Image URL or public ID
 * @param {string} alt - Alt text
 * @param {string} className - Additional CSS classes
 * @param {boolean} isFullWidth - Use full width responsive sizing
 */
export const CloudinaryPostImage = ({ 
  src, 
  alt = 'Post image', 
  className = '', 
  isFullWidth = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No image</span>
      </div>
    );
  }

  const image = getCloudinaryImage(src);
  
  if (!image) {
    // Fallback for non-Cloudinary images
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    );
  }

  // Apply transformations based on size
  const transformedImage = isFullWidth
    ? image.resize('c_limit,w_1200').delivery('q_auto').delivery('f_auto')
    : image.resize('c_limit,w_800').delivery('q_auto').delivery('f_auto');

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <AdvancedImage
        cldImg={transformedImage}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        plugins={[
          lazyload(),
          responsive({ steps: [400, 800, 1200] }),
          placeholder({ mode: 'blur' }),
        ]}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

/**
 * Thumbnail Component - Small preview images
 * 
 * @param {string} src - Image URL or public ID
 * @param {number} size - Size in pixels (default: 100)
 * @param {string} alt - Alt text
 * @param {string} className - Additional CSS classes
 * @param {Function} onClick - Click handler
 */
export const CloudinaryThumbnail = ({ 
  src, 
  size = 100, 
  alt = 'Thumbnail', 
  className = '',
  onClick 
}) => {
  if (!src) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-xs">No image</span>
      </div>
    );
  }

  const image = getCloudinaryImage(src);
  
  if (!image) {
    return (
      <img
        src={src}
        alt={alt}
        className={`object-cover cursor-pointer ${className}`}
        style={{ width: size, height: size }}
        onClick={onClick}
      />
    );
  }

  const transformedImage = image
    .resize(`c_fill,w_${size},h_${size},g_auto`)
    .delivery('q_auto')
    .delivery('f_auto');

  return (
    <AdvancedImage
      cldImg={transformedImage}
      alt={alt}
      className={`object-cover cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      plugins={[lazyload()]}
      onClick={onClick}
    />
  );
};

/**
 * Image Gallery Component - Display multiple images in a grid
 * 
 * @param {string[]} images - Array of image URLs or public IDs
 * @param {string} className - Additional CSS classes
 * @param {Function} onImageClick - Click handler with image index
 */
export const CloudinaryImageGallery = ({ images = [], className = '', onImageClick }) => {
  if (!images || images.length === 0) {
    return null;
  }

  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3';
  };

  return (
    <div className={`grid ${getGridClass(images.length)} gap-2 ${className}`}>
      {images.map((src, index) => (
        <CloudinaryThumbnail
          key={index}
          src={src}
          size={200}
          alt={`Image ${index + 1}`}
          className="rounded-lg hover:opacity-90 transition-opacity"
          onClick={() => onImageClick && onImageClick(index)}
        />
      ))}
    </div>
  );
};

/**
 * NID Image Viewer - Display NID verification image
 * 
 * @param {string} src - NID image URL or public ID
 * @param {string} alt - Alt text
 * @param {string} className - Additional CSS classes
 */
export const CloudinaryNIDImage = ({ src, alt = 'NID Document', className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!src) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center p-8 ${className}`}>
        <span className="text-gray-500">No NID image uploaded</span>
      </div>
    );
  }

  const image = getCloudinaryImage(src);
  
  if (!image) {
    return <img src={src} alt={alt} className={className} />;
  }

  const transformedImage = image
    .resize('c_limit,w_1000')
    .delivery('q_auto')
    .delivery('f_auto');

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <AdvancedImage
        cldImg={transformedImage}
        alt={alt}
        className={`rounded shadow-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        plugins={[lazyload()]}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

/**
 * Responsive Background Image - Uses Cloudinary image as background
 * 
 * @param {string} src - Image URL or public ID
 * @param {React.ReactNode} children - Child components
 * @param {string} className - Additional CSS classes
 */
export const CloudinaryBackgroundImage = ({ src, children, className = '' }) => {
  if (!src) {
    return <div className={className}>{children}</div>;
  }

  const image = getCloudinaryImage(src);
  const imageUrl = image
    ? image.resize('c_fill,w_1920,h_1080,g_auto').delivery('q_auto').delivery('f_auto').toURL()
    : src;

  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {children}
    </div>
  );
};

/**
 * Lazy Image - Simple lazy-loaded image with loading state
 * 
 * @param {string} src - Image URL or public ID
 * @param {string} alt - Alt text
 * @param {string} className - Additional CSS classes
 * @param {number} width - Max width
 */
export const CloudinaryLazyImage = ({ src, alt, className = '', width = 800 }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!src) return null;

  const image = getCloudinaryImage(src);
  
  if (!image) {
    return <img src={src} alt={alt} className={className} />;
  }

  const transformedImage = image
    .resize(`c_limit,w_${width}`)
    .delivery('q_auto')
    .delivery('f_auto');

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <AdvancedImage
        cldImg={transformedImage}
        alt={alt}
        className={className}
        plugins={[
          lazyload(),
          placeholder({ mode: 'predominant-color' }),
        ]}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default {
  CloudinaryAvatar,
  CloudinaryPostImage,
  CloudinaryThumbnail,
  CloudinaryImageGallery,
  CloudinaryNIDImage,
  CloudinaryBackgroundImage,
  CloudinaryLazyImage,
};
