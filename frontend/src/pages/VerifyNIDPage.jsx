import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { authAPI } from '../services/api';
import { updateUser } from '../features/authSlice';
import SEO from '../components/common/SEO';

const VerifyNIDPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [formData, setFormData] = useState({
    nid: '',
    nidImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, nidImage: 'Please upload a JPG or PNG image' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, nidImage: 'Image size should be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, nidImage: file }));
      setErrors(prev => ({ ...prev, nidImage: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, nidImage: null }));
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nid.trim()) {
      newErrors.nid = 'NID number is required';
    } else if (!/^\d{10,17}$/.test(formData.nid.trim())) {
      newErrors.nid = 'NID must be between 10-17 digits';
    }

    if (!formData.nidImage) {
      newErrors.nidImage = 'NID image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Starting NID submission...');
      console.log('NID Number:', formData.nid);
      console.log('NID Image:', formData.nidImage ? 'File present' : 'No file');
      
      // Create FormData for NID submission
      const formDataToSend = new FormData();
      formDataToSend.append('nidNumber', formData.nid);
      formDataToSend.append('nidImage', formData.nidImage);

      console.log('FormData created, sending to API...');
      
      // Submit to backend
      const response = await authAPI.submitNIDVerification(formDataToSend);

      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Update user state in Redux
        dispatch(updateUser({ 
          verificationStatus: 'pending',
          nidNumber: formData.nid 
        }));
        
        alert('NID verification submitted successfully! We will review it shortly.');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit verification';
      alert('Failed to submit verification. Please try again.\n\nError: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If already verified
  if (currentUser.verificationStatus === 'verified') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <SEO title="ID Verified | ShareSphere" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Already Verified!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your account is already verified. You can share resources with the community.
          </p>
          <Button onClick={() => navigate('/profile')} className="w-full">
            Go to Profile
          </Button>
        </motion.div>
      </div>
    );
  }

  // If pending verification
  if (currentUser.verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <SEO title="Verification Pending | ShareSphere" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Verification Pending
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your NID verification is under review. This usually takes 24-48 hours. We'll notify you once it's approved.
          </p>
          <Button onClick={() => navigate('/profile')} variant="secondary" className="w-full">
            Go to Profile
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <SEO title="ID Verification | ShareSphere" />
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Verify Your Identity
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              To ensure the safety and security of our sharing community, we require all users to verify their identity using their National ID Card.
            </p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Why do we need this?
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Protect users from fraud and impersonation</li>
                  <li>• Build trust in the sharing community</li>
                  <li>• Ensure accountability for borrowed items</li>
                  <li>• Enable secure peer-to-peer transactions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Verification Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NID Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  National ID Number *
                </label>
                <Input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleInputChange}
                  placeholder="Enter your 10-17 digit NID number"
                  className={errors.nid ? 'border-red-500' : ''}
                />
                {errors.nid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nid}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the number exactly as it appears on your NID card
                </p>
              </div>

              {/* NID Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload NID Card Image *
                </label>
                
                {!imagePreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                      id="nid-image"
                    />
                    <label
                      htmlFor="nid-image"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        errors.nidImage
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG or JPG (MAX. 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={imagePreview}
                      alt="NID Preview"
                      className="w-full h-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {errors.nidImage && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nidImage}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Make sure the image is clear and all details are visible
                </p>
              </div>

              {/* Guidelines */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Photo Guidelines
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ Take a clear photo of the front of your NID card</li>
                  <li>✓ Ensure all text and details are readable</li>
                  <li>✓ Avoid glare or shadows on the card</li>
                  <li>✓ Use a plain background</li>
                  <li>✓ Make sure the image is not blurry</li>
                </ul>
              </div>

              {/* Privacy Notice */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Your privacy is protected.</strong> Your NID information is encrypted and only used for verification purposes. It will never be shared publicly or with third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit for Verification'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  How long does verification take?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verification typically takes 24-48 hours. You'll receive a notification once your account is verified.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  What if my verification is rejected?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If rejected, you'll be notified with the reason. You can resubmit with correct information.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Is my data secure?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes! All data is encrypted and stored securely. We follow industry best practices for data protection.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyNIDPage;
