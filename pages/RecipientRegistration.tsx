import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser, sendVerificationCode, verifyEmail, checkEmailAvailability } from '../services/recipientRegistrationService';
import { RegistrationData } from '../types';

type Page = 'home' | 'donate' | 'history' | 'admin' | 'login' | 'profile' | 'impact' | 'donor-management' | 'recipient-registration';

interface RecipientRegistrationProps {
    onNavigate: (page: Page) => void;
}

const RecipientRegistration: React.FC<RecipientRegistrationProps> = ({ onNavigate }) => {
    const { register } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    
    const [formData, setFormData] = useState<RegistrationData>({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
        role: 'recipient',
        acceptTerms: false,
        acceptPrivacy: false,
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    // Check password strength
    useEffect(() => {
        const password = formData.password;
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        setPasswordStrength(strength);
    }, [formData.password]);

    // Check email availability when email changes
    useEffect(() => {
        const checkEmail = async () => {
            if (formData.email && formData.email.includes('@')) {
                setEmailChecked(false);
                try {
                    const available = await checkEmailAvailability(formData.email);
                    if (!available) {
                        setEmailError('This email is already registered');
                    } else {
                        setEmailError(null);
                    }
                    setEmailChecked(true);
                } catch (err) {
                    setEmailError(null);
                    setEmailChecked(true);
                }
            } else {
                setEmailError(null);
                setEmailChecked(false);
            }
        };

        const timeoutId = setTimeout(checkEmail, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        if (emailError) {
            setError('Please fix the email error before continuing');
            return;
        }
        if (!formData.phoneNumber.trim()) {
            setError('Please enter your phone number');
            return;
        }
        if (!formData.address.trim()) {
            setError('Please enter your address');
            return;
        }

        setStep(2);
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (!formData.acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }
        if (!formData.acceptPrivacy) {
            setError('Please accept the privacy policy');
            return;
        }

        // Send verification code
        try {
            setLoading(true);
            await sendVerificationCode(formData.email);
            setVerificationSent(true);
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!verificationCode.trim() || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit verification code');
            return;
        }

        try {
            setLoading(true);
            
            // Verify email
            await verifyEmail(formData.email, verificationCode);
            
            // Register user
            const newUser = await registerUser(formData);
            
            // Set user in auth context
            register(newUser);
            
            // Navigate based on role
            if (newUser.role === 'recipient' || newUser.roles?.includes('recipient')) {
                onNavigate('home'); // Will show recipient-specific content
            } else {
                onNavigate('home');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-gray-600">
                        Join Charity Connect to receive donations and make a difference
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((stepNum) => (
                        <React.Fragment key={stepNum}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                                        step >= stepNum
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {stepNum}
                                </div>
                                <span className="text-xs text-gray-600 mt-2">
                                    {stepNum === 1 ? 'Basic Info' : stepNum === 2 ? 'Security' : 'Verify'}
                                </span>
                            </div>
                            {stepNum < 3 && (
                                <div
                                    className={`w-20 h-1 mx-2 transition-colors ${
                                        step > stepNum ? 'bg-teal-500' : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md" role="alert">
                        {error}
                    </div>
                )}

                {/* Step 1: Basic Information */}
                {step === 1 && (
                    <form onSubmit={handleStep1Submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500 ${
                                        emailError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your email address"
                                    required
                                />
                                {emailChecked && !emailError && formData.email && (
                                    <svg className="absolute right-3 top-2.5 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            {emailError && (
                                <p className="mt-1 text-sm text-red-600">{emailError}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                rows={3}
                                placeholder="Enter your full address"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Type <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="recipient"
                                        checked={formData.role === 'recipient'}
                                        onChange={() => handleInputChange('role', 'recipient')}
                                        className="mr-3 text-teal-500 focus:ring-teal-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-800">Recipient</div>
                                        <div className="text-sm text-gray-600">I want to receive donations</div>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="donor"
                                        checked={formData.role === 'donor'}
                                        onChange={() => handleInputChange('role', 'donor')}
                                        className="mr-3 text-teal-500 focus:ring-teal-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-800">Donor</div>
                                        <div className="text-sm text-gray-600">I want to donate items</div>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="both"
                                        checked={formData.role === 'both'}
                                        onChange={() => handleInputChange('role', 'both')}
                                        className="mr-3 text-teal-500 focus:ring-teal-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-800">Both</div>
                                        <div className="text-sm text-gray-600">I want to donate and receive items</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-teal-500 text-white py-3 px-4 rounded-md hover:bg-teal-600 transition font-medium"
                        >
                            Continue
                        </button>
                    </form>
                )}

                {/* Step 2: Password & Terms */}
                {step === 2 && (
                    <form onSubmit={handleStep2Submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 pr-10"
                                    placeholder="Create a password (min. 6 characters)"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength <= 2 ? 'text-red-600' :
                                            passwordStrength <= 3 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                                    className="mt-1 mr-3 text-teal-500 focus:ring-teal-500"
                                    required
                                />
                                <span className="text-sm text-gray-700">
                                    I accept the{' '}
                                    <a href="#" className="text-teal-600 hover:text-teal-800 underline">
                                        Terms and Conditions
                                    </a>
                                    <span className="text-red-500"> *</span>
                                </span>
                            </label>

                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    checked={formData.acceptPrivacy}
                                    onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                                    className="mt-1 mr-3 text-teal-500 focus:ring-teal-500"
                                    required
                                />
                                <span className="text-sm text-gray-700">
                                    I accept the{' '}
                                    <a href="#" className="text-teal-600 hover:text-teal-800 underline">
                                        Privacy Policy
                                    </a>
                                    <span className="text-red-500"> *</span>
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-teal-500 text-white py-3 px-4 rounded-md hover:bg-teal-600 transition font-medium disabled:bg-teal-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Email Verification */}
                {step === 3 && (
                    <form onSubmit={handleStep3Submit} className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
                            <p className="text-gray-600 mb-1">
                                We've sent a verification code to
                            </p>
                            <p className="text-teal-600 font-medium">{formData.email}</p>
                            {verificationSent && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Check your email and enter the 6-digit code below
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verification Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setVerificationCode(value);
                                    setError(null);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-center text-2xl font-mono tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                Note: In demo mode, check the browser console for the verification code
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(2);
                                    setVerificationCode('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        await sendVerificationCode(formData.email);
                                        setError(null);
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : 'Failed to resend code');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="px-4 py-3 text-teal-600 hover:text-teal-800 font-medium text-sm disabled:text-gray-400"
                            >
                                Resend Code
                            </button>
                            <button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="flex-1 bg-teal-500 text-white py-3 px-4 rounded-md hover:bg-teal-600 transition font-medium disabled:bg-teal-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-teal-600 hover:text-teal-800 font-medium underline"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RecipientRegistration;

