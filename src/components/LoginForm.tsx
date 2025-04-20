import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import api, { ApiError } from '@/services/api';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { handleApiError, showSuccess } from '@/services/errorHandler';

interface LoginFormProps {
  isLogin: boolean;
}

// This will be used when the backend is ready
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const LoginForm: React.FC<LoginFormProps> = ({ isLogin }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [isGoogleEmail, setIsGoogleEmail] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [isValidatingGoogleEmail, setIsValidatingGoogleEmail] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameExists, setUsernameExists] = useState<boolean | null>(null);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [validationResult, setValidationResult] = useState<{
    success?: boolean;
    exists?: boolean;
    inDatabase?: boolean;
    message?: string;
  } | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<
    'none' | 'weak' | 'medium' | 'strong'
  >('none');

  // Add global style to fix background color issues
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    
    // Add CSS rules to fix input background color
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
        box-shadow: 0 0 0px 1000px transparent inset !important;
        -webkit-text-fill-color: white !important;
        transition: background-color 5000s ease-in-out 0s;
        background: transparent !important;
        background-color: transparent !important;
        caret-color: white;
      }
      
      .form-input {
        background: transparent !important;
        background-color: transparent !important;
      }
    `;
    
    // Append the style to the document head
    document.head.appendChild(style);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Show a toast notification when Gmail is detected in signup mode
  useEffect(() => {
    if (isGoogleEmail && !isLogin && formData.email && validateEmail(formData.email)) {
      // Only show this once per email to avoid spamming
      const lastEmail = localStorage.getItem('lastGmailNotification');
      if (lastEmail !== formData.email) {
        localStorage.setItem('lastGmailNotification', formData.email);
        
        // Short delay to ensure the UI is updated first
        setTimeout(() => {
          toast.custom((t) => (
            <div className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-blue-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <FcGoogle className="h-10 w-10 rounded-full" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">Gmail Detected!</p>
                    <p className="mt-1 text-sm text-blue-200">
                      We recommend using Google Sign-up for Gmail addresses
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-blue-700">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    handleGoogleSignIn();
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-300 hover:text-white hover:bg-blue-800 focus:outline-none"
                >
                  Use Google
                </button>
              </div>
            </div>
          ));
        }, 500);
      }
    }
  }, [isGoogleEmail, formData.email, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Hard block form submission for Gmail addresses in signup mode
    if (!isLogin && isGmailAddress(formData.email) && validateEmail(formData.email)) {
      setLoading(false);
      toast.error('Please use Google Sign-up for Gmail addresses', {
        duration: 4000,
        icon: <FcGoogle className="h-5 w-5" />,
      });
      
      // Highlight the Google button
      const googleButton = document.querySelector('.mt-2.p-3.bg-blue-900\\/40.border-2.border-blue-500\\/70 button');
      if (googleButton) {
        googleButton.classList.add('animate-pulse');
        setTimeout(() => {
          if (googleButton.classList) googleButton.classList.remove('animate-pulse');
        }, 2000);
      }
      
      return;
    }
    
    try {
      // For demo purposes while backend connection is still in progress
      const useMockData = false; // Set to false to use the real API
      
      let userData;
      
      if (useMockData) {
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate email existence check for login
        if (isLogin) {
          // For demo purposes, let's say any email with "new" in it doesn't exist
          const emailExists = !formData.email.includes('new');
          const isGoogleEmail = formData.email.endsWith('@gmail.com');
          
          if (!emailExists) {
            if (isGoogleEmail) {
              throw new ApiError('This email is not registered. Would you like to sign up or continue with Google?', 404);
            } else {
              throw new ApiError('This email is not registered. Please sign up first.', 404);
            }
          }
        }
        
        // Basic validation
        if (!isLogin && formData.password !== formData.confirmPassword) {
          throw new ApiError('Passwords do not match', 400);
        }
        
        if (!isLogin && (!formData.fullName || !formData.username)) {
          throw new ApiError('Please fill out all required fields', 400);
        }
        
        // Mock user data
        userData = {
          data: {
            fullName: formData.fullName || 'Demo User',
            _id: 'user_' + Math.random().toString(36).substr(2, 9),
            username: formData.username || 'demo_user',
            email: formData.email,
            gender: '',
            sports: [],
            achievements: [],
            profilePhoto: null,
            isProfileComplete: false,
            token: 'mock_token_' + Date.now()
          }
        };
      } else {
        try {
          // Use real API endpoints
          userData = isLogin 
            ? await api.auth.login({ 
                email: formData.email, 
                password: formData.password 
              })
            : await api.auth.register({
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                password: formData.password
              });
        } catch (error) {
          // Use our new error handler
          if (isGmailAddress(formData.email) && !isLogin) {
            toast.error('Please use Google Sign-up for Gmail addresses');
          } else {
            handleApiError(error, isLogin ? 'Login failed' : 'Registration failed');
          }
          setLoading(false);
          return;
        }
      }
      
      // Save token if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('authToken', userData.data.token);
      }
      
      // Format user data for the auth context
      const userProfile = {
        fullName: userData.data.fullName,
        userId: userData.data._id,
        username: userData.data.username,
        email: userData.data.email,
        gender: userData.data.gender || '',
        sports: userData.data.sports || [],
        achievements: userData.data.achievements || [],
        profilePhoto: userData.data.profilePhoto || null,
        isProfileComplete: userData.data.isProfileComplete
      };
      
      // Log user in
      login(userProfile);
      setShowSuccess(true);
      
      // Show success message
      showSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
      
      // Redirect to home page after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      // Handle errors
      if (error instanceof ApiError) {
        setError(error.message);
        // Special handling for non-existent email error
        if (error.status === 404 && isLogin) {
          setEmailExists(false);
          setIsGoogleEmail(formData.email.endsWith('@gmail.com'));
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
        console.error('Login error:', error);
      }
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Use specialized handlers for password fields
    if (name === 'password') {
      handlePasswordChange(e);
      return;
    }
    
    if (name === 'confirmPassword') {
      handleConfirmPasswordChange(e);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear email error when typing
    if (name === 'email') {
      setEmailError('');
      setEmailExists(null);
      setIsGoogleEmail(false);
      setAuthProvider(null);
    }
    
    // Clear username error when typing
    if (name === 'username') {
      setUsernameError('');
      setUsernameExists(null);
      setUsernameValid(null);
      
      // Debounce the username check
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
      
      if (value.length > 2) { // Only check if username is at least 3 characters
        usernameCheckTimeoutRef.current = setTimeout(() => {
          checkUsername(value);
        }, 500);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, password: value }));
    
    // Check password strength
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    
    // Check if passwords match when confirm password has a value
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.confirmPassword === value);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    
    // Check if passwords match
    if (formData.password) {
      setPasswordsMatch(formData.password === value);
    }
  };

  const validateEmail = (email: string) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if the email is a Gmail address
  const isGmailAddress = (email: string) => {
    return email.toLowerCase().endsWith('@gmail.com');
  };

  // Updated email validation on blur
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    
    if (!email) return;
    
    // First run the basic email format validation
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Clear any previous error
    setEmailError('');
    
    // Detect Gmail address
    const isGmail = isGmailAddress(email);
    setIsGoogleEmail(isGmail);
    
    try {
      // Check if email exists in our database
      setEmailCheckLoading(true);
      const response = await api.auth.checkEmail(email);
      
      if (response.success) {
        const { exists, isGoogleEmail, provider } = response.data;
        
        setEmailExists(exists);
        setIsGoogleEmail(isGoogleEmail || isGmail); // Make sure Gmail is detected
        setAuthProvider(provider);
        
        // If in login mode and email doesn't exist
        if (isLogin && !exists) {
          setEmailError('This email is not registered yet');
        } 
        // If in signup mode and email already exists
        else if (!isLogin && exists) {
          if (provider === 'google') {
            setEmailError('This email is already registered with Google. Please use Google Sign-in.');
          } else {
            setEmailError('This email is already registered');
          }
        }
        // If email is associated with Google but trying to use password login
        else if (isLogin && exists && provider === 'google') {
          setEmailError('This account uses Google Sign-in. Please use the Google Sign-in option below.');
        }
        // If it's a Gmail address (not registered) in signup mode, clear any error
        else if (!exists && isGmail && !isLogin) {
          // Don't show any error for Gmail addresses
          setEmailError('');
        }
      }
      
      // Now check Gmail validation if it's a Gmail address and we're registering
      if (!isLogin && isGmail) {
        await validateGmail(email);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // Don't show error toast for Gmail addresses
      if (!isGmailAddress(email)) {
        toast.error('Error checking email. Please try again.');
      }
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!API_URL) {
      setError('API URL is not configured');
      return;
    }
    
    try {
      // Show appropriate message based on login/signup mode
      if (!isLogin) {
        // Track that the user is using Google Sign-up
        if (isGoogleEmail) {
          toast.success('Great choice! Continuing with Google Sign-up for your Gmail account...');
        } else {
          toast.success('Continuing with Google Sign-up...');
        }
      } else {
        toast.success('Redirecting to Google Sign-in...');
      }
      
      // Redirect to Google OAuth endpoint
      window.location.href = `${API_URL}/auth/google`;
    } catch (error) {
      handleApiError(error, 'Failed to connect to Google authentication');
    }
  };

  const handleSignupRedirect = () => {
    // Save the email in the form and navigate to signup page
    localStorage.setItem('pendingSignupEmail', formData.email);
    navigate('/signup');
  };

  // Within the formik configuration
  const loginValidationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const registerValidationSchema = Yup.object({
    fullName: Yup.string().required('Full Name is required'),
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .matches(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, underscores and dots')
      .test(
        'username-unique',
        'This username is already taken',
        function() {
          // Skip validation if username check is in progress
          if (usernameCheckLoading) return true;
          // Validate if we have a result and it's valid
          return usernameValid === true;
        }
      ),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .test(
        'gmail-validation',
        'Gmail addresses require verification',
        function(value) {
          // Skip validation if email check is in progress
          if (isValidating) return true;
          
          // If it's a Gmail address, make sure it's been validated
          if (value && value.toLowerCase().endsWith('@gmail.com')) {
            // If we have validation results and they're positive, or the email is in our database, it's valid
            return !!(validationResult && validationResult.isValid) || emailExists === true;
          }
          
          // Non-Gmail addresses don't need this validation
          return true;
        }
      ),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const validateEmailWithGoogle = async (email: string) => {
    try {
      setEmailValidating(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate-google-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        // Redirect to Google auth - this process will return to register with validation results
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        setEmailValid(false);
        toast.error('Failed to validate email. Please try again.');
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailValid(false);
      toast.error('Failed to validate email. Please try again.');
    } finally {
      setEmailValidating(false);
    }
  };
  
  // Check URL parameters on component mount for email validation results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailValidParam = params.get('emailValid');
    const email = params.get('email');
    
    if (emailValidParam === 'true' && email) {
      setEmailValid(true);
      // Auto-fill the email field
      if (formData.email === '') {
        setFormData(prev => ({ ...prev, email }));
      }
      toast.success('Email verified successfully!');
    } else if (emailValidParam === 'false') {
      setEmailValid(false);
      toast.error('This email could not be verified with Google.');
    }
  }, []);

  // Function to validate Google email existence
  const validateGoogleEmail = async (email: string) => {
    if (!email.endsWith('@gmail.com')) {
      return false;
    }
    
    setIsValidatingGoogleEmail(true);
    try {
      const response = await api.auth.checkGoogleEmail(email);
      if (response.success && response.data.authUrl) {
        // Open a new window to authenticate with Google
        window.open(response.data.authUrl, 'googleAuth', 'width=500,height=600');
        // The redirect will be handled in the callback
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating Google email:', error);
      return false;
    } finally {
      setIsValidatingGoogleEmail(false);
    }
  };

  // Enhance the isGmailVerificationMessage function to be more comprehensive
  const isGmailVerificationMessage = (message: string) => {
    if (!message) return false;
    
    const lowerMsg = message.toLowerCase();
    return lowerMsg.includes('cannot definitively verify') || 
           lowerMsg.includes('without user consent') ||
           lowerMsg.includes('gmail validation') ||
           lowerMsg.includes('verify existence') ||
           lowerMsg.includes('gmail address') ||
           lowerMsg.includes('email format is valid');
  };

  // Add a function to process API responses for Gmail addresses
  const processGmailResponse = (response: any) => {
    if (!response) return response;
    
    // Deep copy to avoid modifying the original
    const processedResponse = JSON.parse(JSON.stringify(response));
    
    // Check main message
    if (processedResponse.message && isGmailVerificationMessage(processedResponse.message)) {
      processedResponse.message = '';
      processedResponse.isValid = true;
    }
    
    // Check nested data
    if (processedResponse.data?.message && isGmailVerificationMessage(processedResponse.data.message)) {
      processedResponse.data.message = '';
      processedResponse.data.isValid = true;
    }
    
    return processedResponse;
  };

  // Update the API call in validateGmail to process response
  const validateGmail = async (email: string) => {
    if (!email || !isGmailAddress(email)) {
      return;
    }
    
    setIsValidating(true);
    try {
      // Use our validateGmailExists API endpoint to validate Gmail
      let response = await api.auth.validateGmailExists(email);
      
      // Process the response to remove any verification messages
      response = processGmailResponse(response);
      
      setValidationResult(response);
      
      // Handle the various response cases
      if (!response.success) {
        // Don't show verification error for Gmail addresses
        return;
      }
      
      // If email exists in database, set the appropriate state
      if (response.inDatabase) {
        setEmailExists(true);
        setAuthProvider(response.provider || 'local');
        if (response.provider === 'google') {
          setEmailError('This account uses Google Sign-in. Please use that option.');
        } else {
          setEmailError('This email is already registered. Please login instead.');
        }
      } else if (response.isValid) {
        // Valid Gmail format that's not in our database
        setIsGoogleEmail(true);
        setEmailExists(false);
        
        // Clear any error message for valid Gmail addresses
        setEmailError('');
        
        // For Gmail addresses, especially in signup mode, emphasize Google sign-up
        if (!isLogin) {
          // Already showing the prominent UI suggestion in the component
        }
        
        // If we have an authUrl and need explicit verification, we can use it
        if (response.authUrl && response.requiresVerification) {
          toast.info('We need to verify this Gmail address. You will be redirected to Google.');
          setTimeout(() => {
            window.location.href = response.authUrl;
          }, 1500);
        }
      } else {
        // Invalid Gmail format - but don't show the verification error
      }
    } catch (error) {
      console.error('Gmail validation error:', error);
      setValidationResult(null);
      // Don't show the error message for Gmail addresses
    } finally {
      setIsValidating(false);
    }
  };

  // Update the handleEmailChange function
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData(prev => ({ ...prev, email: newEmail }));
    setIsEmailValid(false);
    setIsEmailChecking(false);
    setIsGoogleEmail(false);
    setEmailError('');
    setEmailExists(null);
    setAuthProvider(null);
    
    // Simple check for Gmail addresses to set state early
    if (isGmailAddress(newEmail)) {
      setIsGoogleEmail(true);
    }
    
    if (newEmail === '') {
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Don't check if we're in login mode until blur
    if (isLogin) return;
    
    // Debounce the API call
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }
    
    emailCheckTimeoutRef.current = setTimeout(async () => {
      setIsEmailChecking(true);
      
      try {
        // Check if it's a Gmail address for additional validation
        if (isGmailAddress(newEmail)) {
          // Update UI state immediately while we wait for backend validation
          setIsGoogleEmail(true);
          
          // Validate Gmail using our utility function
          await validateGmail(newEmail);
        } else {
          // Regular email check in our database
          const result = await api.auth.checkEmail(newEmail);
          setIsEmailValid(!result.exists);
          
          if (result.exists) {
            setEmailExists(true);
            setEmailError('This email is already registered');
            setAuthProvider(result.provider || 'local');
          } else {
            setEmailExists(false);
            setEmailError('');
          }
        }
      } catch (error) {
        console.error('Email check error:', error);
        setEmailError('Error checking email');
      } finally {
        setIsEmailChecking(false);
      }
    }, 500);
  };

  // New function to validate username format
  const validateUsername = (username: string) => {
    // Username validation rules:
    // 1. Only letters, numbers, underscores and dots
    // 2. Between 3-30 characters
    const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
    return usernameRegex.test(username);
  };
  
  // New function to check if username exists in the database
  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) return;
    
    // First check if username format is valid
    if (!validateUsername(username)) {
      setUsernameError('Username can only contain letters, numbers, underscores and dots (3-30 characters)');
      setUsernameValid(false);
      return;
    }
    
    setUsernameCheckLoading(true);
    try {
      const response = await api.auth.checkUsername(username);
      
      if (response.success) {
        setUsernameExists(response.exists);
        setUsernameValid(!response.exists);
        
        if (response.exists) {
          setUsernameError('This username is already taken');
        } else {
          setUsernameError('');
        }
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error validating username');
    } finally {
      setUsernameCheckLoading(false);
    }
  };
  
  // Add username blur handler
  const handleBlurUsername = async () => {
    if (!formData.username) return;
    
    if (formData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameValid(false);
      return;
    }
    
    if (!validateUsername(formData.username)) {
      setUsernameError('Username can only contain letters, numbers, underscores and dots');
      setUsernameValid(false);
      return;
    }
    
    await checkUsername(formData.username);
  };

  // Password strength checker
  const checkPasswordStrength = (password: string): 'none' | 'weak' | 'medium' | 'strong' => {
    if (!password) return 'none';
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // special characters
    
    // Determine strength based on score
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  if (showSuccess) {
    return (
      <div className="text-center py-8 backdrop-blur-sm bg-transparent rounded-2xl border border-white/20 p-6 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Login Successful!</h3>
        <p className="text-gray-400">Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
          {error}
          {emailExists === false && isLogin && (
            <div className="mt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSignupRedirect}
                className="text-amber-400 hover:text-amber-300 underline text-sm"
              >
                Sign up with this email instead
              </button>
              {isGoogleEmail && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="text-amber-400 hover:text-amber-300 underline text-sm"
                >
                  Continue with Google
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!isLogin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input bg-transparent border border-white/30 text-white placeholder:text-white/40 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10 transition-shadow duration-300 focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white/90">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlurUsername}
              className={`form-input bg-transparent border ${
                usernameError ? 'border-red-500' : 
                (usernameExists === true ? 'border-green-500' : 
                 usernameExists === false && !usernameError && usernameValid ? 'border-green-500' : 
                 'border-white/30')
              } text-white placeholder:text-white/40 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10 transition-shadow duration-300 focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/50`}
              required
            />
            <div className="relative">
              {usernameCheckLoading ? (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                usernameValid === true && (
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-green-500">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                )
              )}
            </div>
            {usernameError && (
              <p className="mt-1 text-sm text-red-500">
                {usernameError}
              </p>
            )}
            {!usernameError && usernameValid === true && (
              <p className="mt-1 text-sm text-green-500">
                Username is available
              </p>
            )}
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/90">Email</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={`form-input bg-transparent border ${
              emailError ? 'border-red-500' : 
              (emailExists === true ? (authProvider === 'google' ? 'border-yellow-500' : 'border-green-500') : 
               emailExists === false && !emailError && isGoogleEmail ? 'border-blue-500' : 
               'border-white/30')
            } text-white placeholder:text-white/40 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10 transition-shadow duration-300 focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/50`}
            required
          />
          {/* Loading indicator during validation */}
          {emailCheckLoading || isValidating || isEmailChecking ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
            </div>
          ) : (
            /* Show appropriate icon based on validation result */
            emailExists === false && isGoogleEmail && !emailError ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            ) : emailExists === true ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            ) : null
          )}
        </div>

        {/* Gmail validation states and messages */}
        {(isValidating || emailCheckLoading) && formData.email && !isLogin && (
          <div className="mt-1 text-sm text-blue-500 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isValidating ? 'Validating Gmail address...' : 'Checking email...'}
          </div>
        )}

        {/* Validation result message - hide all validation messages for Gmail */}
        {!isLogin && validationResult && !isValidating && formData.email && !emailError && !isGoogleEmail && (
          <div className={`mt-1 text-sm ${validationResult.isValid ? 'text-green-500' : 'text-red-500'}`}>
            {validationResult.isValid 
              ? (validationResult.inDatabase 
                  ? 'Email is registered in our system.' 
                  : 'Email address is valid!') 
              : validationResult.message}
          </div>
        )}

        {/* Email error message */}
        {emailError && (
          <div className="mt-1 text-sm text-red-500">
            {emailError}
          </div>
        )}

        {/* Google account detection */}
        {emailExists && authProvider === 'google' && (
          <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/50 rounded-md">
            <div className="flex items-center gap-2 text-white text-sm">
              <FcGoogle className="w-5 h-5" /> 
              <span>This account uses Google Sign-in</span>
            </div>
            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              className="mt-2 w-full bg-white text-gray-800 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <FcGoogle className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        )}

        {/* Gmail detected - recommend Google Sign-in */}
        {isGoogleEmail && !emailExists && !emailError && formData.email && isLogin && (
          <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/50 rounded-md">
            <div className="flex items-center gap-2 text-white text-sm">
              <FcGoogle className="w-5 h-5" /> 
              <span>Gmail detected! We recommend using Google Sign-in.</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-2 w-full bg-white text-gray-800 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <FcGoogle className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        )}

        {/* Gmail detected in SIGNUP mode - enhanced recommendation */}
        {isGoogleEmail && !emailExists && !emailError && formData.email && !isLogin && (
          <div className="mt-2 p-3 bg-blue-900/40 border-2 border-blue-500/70 rounded-md animate-pulse">
            <div className="flex items-center gap-2 text-white text-sm mb-2">
              <FcGoogle className="w-6 h-6" /> 
              <span className="font-medium">Gmail detected! We strongly recommend signing up with Google.</span>
            </div>
            <div className="text-xs text-blue-200 mb-3">
              Using Google Sign-up creates a secure account linked to your Gmail, giving you:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Simpler login (no password to remember)</li>
                <li>Enhanced security with Google's protection</li>
                <li>Faster account creation</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-gray-800 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors font-medium"
            >
              <FcGoogle className="w-5 h-5" />
              Sign up with Google
            </button>
            <div className="mt-2 text-xs text-center text-blue-300">
              Registration with email/password is disabled for Gmail addresses
            </div>
          </div>
        )}

        {/* Email exists with local account */}
        {emailExists && authProvider === 'local' && !emailError && (
          <div className="flex items-center gap-2 text-green-400 text-xs mt-1">
            <span>✓</span> Email recognized. Enter your password to continue.
          </div>
        )}

        {/* Email available for registration */}
        {!isValidating && !isEmailChecking && !isGoogleEmail && validationResult?.inDatabase === false && emailExists === false && !emailError && formData.email && (
          <p className="text-xs text-blue-400 mt-1">
            This email is available for registration.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/90">{isLogin ? 'Password' : 'Create Password'}</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className={`form-input bg-transparent border ${
              !isLogin && formData.password
                ? (
                    passwordStrength === 'strong' ? 'border-green-500' :
                    passwordStrength === 'medium' ? 'border-yellow-500' :
                    passwordStrength === 'weak' ? 'border-red-500' :
                    'border-white/30'
                  )
                : 'border-white/30'
            } text-white placeholder:text-white/40 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10 transition-shadow duration-300 focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/50 pr-10`}
            required
          />
          <button 
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {/* Password strength indicator (only show in registration mode) */}
        {!isLogin && formData.password && (
          <div className="mt-1">
            <div className="flex gap-1 mb-1">
              <div className={`h-1 flex-1 rounded-full ${
                passwordStrength === 'weak' || passwordStrength === 'medium' || passwordStrength === 'strong'
                  ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              <div className={`h-1 flex-1 rounded-full ${
                passwordStrength === 'medium' || passwordStrength === 'strong'
                  ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>
              <div className={`h-1 flex-1 rounded-full ${
                passwordStrength === 'strong'
                  ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>
            <p className={`text-xs ${
              passwordStrength === 'strong' ? 'text-green-500' :
              passwordStrength === 'medium' ? 'text-yellow-500' :
              'text-red-500'
            }`}>
              {passwordStrength === 'strong' && 'Strong password'}
              {passwordStrength === 'medium' && 'Medium password - consider adding more variety'}
              {passwordStrength === 'weak' && 'Weak password - add length and variety'}
            </p>
          </div>
        )}
      </div>
      
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input bg-transparent border ${
                formData.confirmPassword 
                  ? (passwordsMatch ? 'border-green-500' : 'border-red-500') 
                  : 'border-white/30'
              } text-white placeholder:text-white/40 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10 transition-shadow duration-300 focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/50 pr-10`}
              required
            />
            <button 
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            {/* Password match indicator */}
            {formData.confirmPassword && (
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                {passwordsMatch ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          
          {/* Password match message */}
          {formData.confirmPassword && (
            <div className={`text-xs ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          name="rememberMe"
          checked={formData.rememberMe}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))}
          className="shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-shadow duration-300"
        />
        <Label htmlFor="rememberMe" className="text-white/90">
          Remember me
        </Label>
      </div>
      
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg"
        >
          <FcGoogle className="w-5 h-5" />
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>
        
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-white/20"></div>
          <p className="mx-4 text-sm text-white/60">or</p>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={loading || (!isLogin && isGoogleEmail && formData.email && validateEmail(formData.email))}
        className={`w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 ${
          (!isLogin && isGoogleEmail && formData.email && validateEmail(formData.email)) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
      </Button>

      {/* Add an explanatory message when signup button is disabled */}
      {!isLogin && isGoogleEmail && formData.email && validateEmail(formData.email) && (
        <div className="text-center text-amber-500 text-sm mt-2">
          Please use the Google Sign-up option above for Gmail addresses
        </div>
      )}
    </form>
  );
};

export default LoginForm;
