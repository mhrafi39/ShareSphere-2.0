import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';
import { categories } from '../utils/dummyData';
import { postsAPI } from '../services/api';
import SEO from '../components/common/SEO';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      images: [],
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .required('Title is required'),
      description: Yup.string()
        .min(20, 'Description must be at least 20 characters')
        .required('Description is required'),
      category: Yup.string().required('Category is required'),
      location: Yup.string().required('Location is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('category', values.category);
        formData.append('location', values.location);
        
        // Append all images
        values.images.forEach((image) => {
          formData.append('images', image);
        });
        
        const response = await postsAPI.createPost(formData);
        
        if (response.data.success) {
          alert('Post created successfully!');
          // Navigate to home page or profile page
          navigate('/home');
        }
      } catch (error) {
        console.error('Post creation error:', error);
        alert(error.response?.data?.message || 'Failed to create post');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = [...formik.values.images, ...files];
      formik.setFieldValue('images', newImages);
      
      // Create previews for all new images
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    const newImages = formik.values.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    formik.setFieldValue('images', newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <SEO title="Create Post | ShareSphere" />
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Share a Resource
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Post something you want to share with the community
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resource Images {imagePreviews.length > 0 && `(${imagePreviews.length})`}
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
                  {imagePreviews.length > 0 ? (
                    <div className="space-y-4">
                      {/* Image Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Add More Button */}
                      <div className="text-center">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-block text-sm"
                        >
                          + Add More Images
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-4">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-block"
                        >
                          Upload Images
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        PNG, JPG, GIF up to 10MB each. You can upload multiple images.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <Input
                label="Title"
                type="text"
                name="title"
                placeholder="E.g., Laptop for Coding Projects"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.title}
                touched={formik.touched.title}
                required
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Describe your resource in detail..."
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    formik.errors.description && formik.touched.description
                      ? 'border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                {formik.errors.description && formik.touched.description && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {formik.errors.description}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    formik.errors.category && formik.touched.category
                      ? 'border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.filter(cat => cat !== 'All').map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formik.errors.category && formik.touched.category && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {formik.errors.category}
                  </p>
                )}
              </div>

              {/* Location */}
              <Input
                label="Location"
                type="text"
                name="location"
                placeholder="E.g., Dhaka, Bangladesh"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.location}
                touched={formik.touched.location}
                required
              />

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Post'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => formik.resetForm()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePostPage;
