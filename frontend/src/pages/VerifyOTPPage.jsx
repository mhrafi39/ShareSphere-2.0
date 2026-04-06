import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { authAPI } from '../services/api';
import { setCredentials } from '../features/authSlice';
import SEO from '../components/common/SEO';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const registrationData = location.state || {};
  const { email, name, password } = registrationData;

  useEffect(() => {
    // Redirect if no registration data
    if (!email || !name || !password) {
      navigate('/register');
      return;
    }

    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, name, password, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setToast({
        show: true,
        message: 'Please enter a valid 6-digit OTP',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        email,
        otp: otpValue,
        name,
        password,
      });

      if (response.data.success) {
        const { token, ...user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(setCredentials({ user, token }));

        setToast({
          show: true,
          message: 'Account created successfully!',
          type: 'success',
        });

        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Invalid or expired OTP',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    try {
      const response = await authAPI.resendOTP({ email, name });
      if (response.data.success) {
        setToast({
          show: true,
          message: 'OTP resent successfully!',
          type: 'success',
        });
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        // Restart timer
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to resend OTP',
        type: 'error',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <SEO title="Verify OTP | ShareSphere" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a 6-digit code to your email
            </p>
            <p className="text-primary-600 dark:text-primary-400 font-medium mt-1">
              {email}
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary-600 dark:text-primary-400 font-medium hover:underline disabled:opacity-50"
                >
                  {resending ? 'Resending...' : 'Resend OTP'}
                </button>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Resend code in{' '}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {timer}s
                  </span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || otp.some(d => !d)}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              <span className="text-primary-600 dark:text-primary-400">
                Check your spam folder
              </span>
            </p>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default VerifyOTPPage;
