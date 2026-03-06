/**
 * Example React Components for Cloudinary Image Uploads
 * 
 * These are example implementations showing how to use the new Cloudinary
 * integration in your ShareSphere React components.
 */

import React, { useState } from 'react';
import { authAPI, postsAPI } from '@/services/api';
import { 
  validateImage, 
  createProfileFormData, 
  createNIDFormData, 
  createPostFormData,
  getThumbnail,
  getResponsiveImage 
} from '@/utils/imageHelpers';

// ============================================
// EXAMPLE 1: Profile Picture Upload Component
// ============================================
export const ProfilePictureUpload = () => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    const validation = validateImage(file, 5); // 5MB limit for profile pictures
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.avatar.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Create FormData with avatar
      const formData = createProfileFormData({}, file);
      
      // Upload to server
      const response = await authAPI.updateProfile(formData);
      
      console.log('Profile picture updated:', response.data);
      // Handle success (e.g., update Redux store, show success message)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <div>
        <label htmlFor="avatar">Profile Picture</label>
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
        />
        {preview && (
          <img src={preview} alt="Preview" style={{ width: 100, height: 100 }} />
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Picture'}
        </button>
      </div>
    </form>
  );
};

// ============================================
// EXAMPLE 2: NID Verification Upload Component
// ============================================
export const NIDVerificationForm = () => {
  const [nidNumber, setNidNumber] = useState('');
  const [nidImage, setNidImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    const validation = validateImage(file, 10); // 10MB limit for NID
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setNidImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nidNumber || !nidImage) {
      setError('Please provide NID number and image');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create FormData
      const formData = createNIDFormData(nidNumber, nidImage);
      
      // Submit to server
      const response = await authAPI.submitNIDVerification(formData);
      
      console.log('NID submitted:', response.data);
      // Handle success (e.g., show success message, redirect)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit NID verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nidNumber">NID Number</label>
        <input
          type="text"
          id="nidNumber"
          value={nidNumber}
          onChange={(e) => setNidNumber(e.target.value)}
          placeholder="Enter your NID number"
        />
      </div>
      
      <div>
        <label htmlFor="nidImage">NID Image</label>
        <input
          type="file"
          id="nidImage"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
        />
        {preview && (
          <img src={preview} alt="NID Preview" style={{ maxWidth: 300 }} />
        )}
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit for Verification'}
      </button>
    </form>
  );
};

// ============================================
// EXAMPLE 3: Create Post with Multiple Images
// ============================================
export const CreatePostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate max 5 images
    if (files.length > 5) {
      setError('You can upload maximum 5 images');
      return;
    }

    // Validate each image
    for (const file of files) {
      const validation = validateImage(file, 10); // 10MB limit
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    setImages(files);
    
    // Create previews
    const previewPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then(setPreviews);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create FormData with post data and images
      const postFormData = createPostFormData(formData, images);
      
      // Create post
      const response = await postsAPI.createPost(postFormData);
      
      console.log('Post created:', response.data);
      // Handle success (e.g., redirect to post page, show success message)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter title"
        />
      </div>
      
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter description"
        />
      </div>
      
      <div>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
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
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Enter location"
        />
      </div>
      
      <div>
        <label htmlFor="images">Images (Max 5)</label>
        <input
          type="file"
          id="images"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
        />
        
        {previews.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {previews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Preview ${index + 1}`}
                style={{ width: 100, height: 100, objectFit: 'cover' }}
              />
            ))}
          </div>
        )}
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button type="submit" disabled={uploading}>
        {uploading ? 'Creating Post...' : 'Create Post'}
      </button>
    </form>
  );
};

// ============================================
// EXAMPLE 4: Display Optimized Images
// ============================================
export const OptimizedImageDisplay = ({ imageUrl, alt }) => {
  return (
    <div>
      {/* Thumbnail */}
      <img
        src={getThumbnail(imageUrl, 200)}
        alt={alt}
        loading="lazy"
        style={{ width: 200, height: 200 }}
      />
      
      {/* Responsive sizes */}
      <picture>
        <source
          media="(max-width: 400px)"
          srcSet={getResponsiveImage(imageUrl, 'small')}
        />
        <source
          media="(max-width: 800px)"
          srcSet={getResponsiveImage(imageUrl, 'medium')}
        />
        <img
          src={getResponsiveImage(imageUrl, 'large')}
          alt={alt}
          loading="lazy"
        />
      </picture>
    </div>
  );
};

// ============================================
// EXAMPLE 5: Profile Update with Optional Avatar
// ============================================
export const UpdateProfileForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAvatarFile(null);
      setPreview(null);
      return;
    }

    // Validate image
    const validation = validateImage(file, 5);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      // Create FormData
      const profileFormData = createProfileFormData(formData, avatarFile);
      
      // Update profile
      const response = await authAPI.updateProfile(profileFormData);
      
      console.log('Profile updated:', response.data);
      // Handle success
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label htmlFor="avatar">Profile Picture (Optional)</label>
        <input
          type="file"
          id="avatar"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleAvatarChange}
        />
        {preview && (
          <img src={preview} alt="Preview" style={{ width: 100, height: 100 }} />
        )}
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button type="submit" disabled={updating}>
        {updating ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};
