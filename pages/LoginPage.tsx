import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { loginUser, getUserByEmail } from '../services/recipientRegistrationService';

type Page = 'home' | 'donate' | 'history' | 'admin' | 'login' | 'recipient-registration';
interface LoginPageProps {
    onNavigate: (page: Page) => void;
}

const MOCK_ACCOUNTS: { donor: User; admin: User } = {
    donor: {
        id: 'user-123',
        name: 'Jane Donor',
        email: 'jane.donor@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=jane.donor@example.com',
        role: 'donor',
    },
    admin: {
        id: 'admin-456',
        name: 'Admin User',
        email: 'admin@charityconnect.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin@charityconnect.com',
        role: 'admin',
    },
};

// Sample recipient accounts available for login
const SAMPLE_RECIPIENTS = [
    { email: 'maria.rodriguez@example.com', name: 'Maria Rodriguez' },
    { email: 'james.thompson@example.com', name: 'James Thompson' },
    { email: 'sarah.williams@example.com', name: 'Sarah Williams', label: 'Dual Role (Donor & Recipient)' },
    { email: 'david.martinez@example.com', name: 'David Martinez', label: 'Dual Role (Donor & Recipient)' },
    { email: 'david.chen@example.com', name: 'David Chen' },
    { email: 'lisa.martinez@example.com', name: 'Lisa Martinez' },
];

const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#34A853" d="M43.611 20.083L42 20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" clipPath="url(#g)"/>
        <path fill="#FBBC05" d="M24 4v8h-7.961C14.158 8.154 18.941 4 24 4z"/>
        <path fill="#EA4335" d="M24 36c5.223 0 9.651-3.343 11.303-8H24v-8H4.389C6.034 30.657 12.7 36 24 36z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
);


const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const { login, loginWithCredentials, loading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loginMode, setLoginMode] = useState<'quick' | 'credentials'>('quick');
    const [showAllRecipients, setShowAllRecipients] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [recipientUsers, setRecipientUsers] = useState<User[]>([]);

    // Load sample recipient users
    useEffect(() => {
        const loadRecipients = async () => {
            const users: User[] = [];
            for (const recipient of SAMPLE_RECIPIENTS) {
                try {
                    const user = await getUserByEmail(recipient.email);
                    if (user) {
                        users.push(user);
                    }
                } catch {
                    // Skip if user not found
                }
            }
            setRecipientUsers(users);
        };
        loadRecipients();
    }, []);

    const handleLogin = async (role: 'donor' | 'admin' | 'recipient', recipientEmail?: string) => {
        await login(role, recipientEmail);
        setIsModalOpen(false);
        if (role === 'admin') {
            onNavigate('admin');
        } else {
            onNavigate('home');
        }
    };

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            await loginWithCredentials(email, password);
            setIsModalOpen(false);
            onNavigate('home');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid email or password');
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-[calc(100vh-128px)] sm:min-h-[calc(100vh-144px)]">
                <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center mx-2 sm:mx-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Sign in to continue your journey of giving.</p>
                    <div className="space-y-3 sm:space-y-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={loading}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-base sm:text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50 min-h-[44px]"
                        >
                            <GoogleIcon />
                            {loading ? 'Signing in...' : 'Sign in with Google'}
                        </button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setLoginMode('credentials');
                                setIsModalOpen(true);
                            }}
                            disabled={loading}
                            className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50 min-h-[44px]"
                        >
                            Sign in with Email
                        </button>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-4">Don't have an account?</p>
                        <button
                            onClick={() => onNavigate('recipient-registration')}
                            className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition font-medium min-h-[44px]"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4">
                    <div className="bg-white rounded-none sm:rounded-lg shadow-xl p-4 sm:p-6 w-full h-full sm:h-auto sm:max-w-sm sm:max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg sm:text-xl font-bold">
                                {loginMode === 'quick' ? 'Choose an account' : 'Sign in with Email'}
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setLoginMode('quick');
                                    setEmail('');
                                    setPassword('');
                                    setError(null);
                                }} 
                                className="text-gray-500 hover:text-gray-800 text-2xl sm:text-3xl font-light leading-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Close modal"
                            >
                                &times;
                            </button>
                        </div>

                        {loginMode === 'quick' ? (
                            <>
                                <div className="space-y-2 sm:space-y-3 max-h-[60vh] sm:max-h-96 overflow-y-auto flex-1">
                                    <div
                                        onClick={() => handleLogin('donor')}
                                        className="flex items-center p-3 sm:p-4 rounded-lg hover:bg-gray-100 cursor-pointer border min-h-[60px] sm:min-h-[auto]"
                                    >
                                        <img src={MOCK_ACCOUNTS.donor.avatarUrl} alt="Donor" className="w-12 h-12 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                                        <div className="ml-3 flex-1 min-w-0">
                                            <p className="font-semibold text-sm sm:text-base text-gray-800 truncate">{MOCK_ACCOUNTS.donor.name}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">{MOCK_ACCOUNTS.donor.email}</p>
                                            <p className="text-xs text-teal-600 mt-0.5">Donor</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => handleLogin('admin')}
                                        className="flex items-center p-3 sm:p-4 rounded-lg hover:bg-gray-100 cursor-pointer border min-h-[60px] sm:min-h-[auto]"
                                    >
                                        <img src={MOCK_ACCOUNTS.admin.avatarUrl} alt="Admin" className="w-12 h-12 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                                        <div className="ml-3 flex-1 min-w-0">
                                            <p className="font-semibold text-sm sm:text-base text-gray-800 truncate">{MOCK_ACCOUNTS.admin.name}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">{MOCK_ACCOUNTS.admin.email}</p>
                                            <p className="text-xs text-red-600 mt-0.5">Admin</p>
                                        </div>
                                    </div>
                                    
                                    {/* Recipient Accounts */}
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Recipient Accounts:</p>
                                        {(showAllRecipients ? recipientUsers : recipientUsers.slice(0, 2)).map((recipient) => {
                                            const isDualRole = recipient.roles?.includes('donor') && recipient.roles?.includes('recipient');
                                            const sampleRecipient = SAMPLE_RECIPIENTS.find(r => r.email === recipient.email);
                                            return (
                                                <div
                                                    key={recipient.id}
                                                    onClick={() => handleLogin('recipient', recipient.email)}
                                                    className="flex items-center p-3 sm:p-4 rounded-lg hover:bg-gray-100 cursor-pointer border mb-2 min-h-[60px] sm:min-h-[auto]"
                                                >
                                                    <img src={recipient.avatarUrl} alt={recipient.name} className="w-12 h-12 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                                                    <div className="ml-3 flex-1 min-w-0">
                                                        <p className="font-semibold text-sm sm:text-base text-gray-800 truncate">{recipient.name}</p>
                                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{recipient.email}</p>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            {isDualRole && (
                                                                <p className="text-xs text-purple-600 font-medium">
                                                                    👥 Dual Role
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-teal-600">
                                                                {recipient.verified || recipient.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {recipientUsers.length > 2 && (
                                            <button
                                                onClick={() => setShowAllRecipients(!showAllRecipients)}
                                                className="text-sm text-teal-600 hover:text-teal-800 font-medium w-full text-left py-2 min-h-[44px]"
                                            >
                                                {showAllRecipients ? 'Show Less' : `Show ${recipientUsers.length - 2} More Recipients`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-auto pt-4">
                                    <p className="text-xs text-gray-400 text-center">This is a simulated sign-in. Click an account to proceed.</p>
                                    <p className="text-xs text-gray-400 mt-2 text-center">
                                        <strong>Tip:</strong> Sample recipients can also login with email/password. Use any password.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleCredentialsLogin} className="space-y-4 flex-1 flex flex-col">
                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md text-sm" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                                    <p className="text-xs text-blue-800">
                                        <strong>Demo Mode:</strong> Sample recipient accounts (maria.rodriguez@example.com, james.thompson@example.com, etc.) accept any password.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError(null);
                                        }}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(null);
                                        }}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                                        placeholder="Enter your password (any password for demo)"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        For sample accounts, use any password (e.g., "password123")
                                    </p>
                                </div>
                                <div className="mt-auto pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-teal-500 text-white py-3 px-4 rounded-md hover:bg-teal-600 transition font-medium disabled:bg-teal-300 disabled:cursor-not-allowed min-h-[44px]"
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </button>
                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                onNavigate('recipient-registration');
                                            }}
                                            className="text-teal-600 hover:text-teal-800 underline min-h-[44px]"
                                        >
                                            Register here
                                        </button>
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginPage;