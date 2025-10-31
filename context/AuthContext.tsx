
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { loginUser, getUserByEmail } from '../services/recipientRegistrationService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (role: 'donor' | 'admin' | 'recipient', email?: string) => void;
    loginWithCredentials: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_DONOR_USER: User = {
    id: 'user-123',
    name: 'Jane Donor',
    email: 'jane.donor@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=jane.donor@example.com',
    role: 'donor',
};

const MOCK_ADMIN_USER: User = {
    id: 'admin-456',
    name: 'Admin User',
    email: 'admin@charityconnect.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin@charityconnect.com',
    role: 'admin',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const login = async (role: 'donor' | 'admin' | 'recipient', email?: string) => {
        setLoading(true);
        // Simulate an API call for quick login (demo mode)
        setTimeout(async () => {
            if (role === 'admin') {
                setUser(MOCK_ADMIN_USER);
            } else if (role === 'recipient') {
                // If email is provided, try to get the actual user from sample data
                if (email) {
                    try {
                        const user = await getUserByEmail(email);
                        if (user && (user.role === 'recipient' || user.roles?.includes('recipient'))) {
                            setUser(user);
                        } else {
                            // Fallback to default recipient
                            setUser({
                                id: 'recipient-789',
                                name: 'Recipient User',
                                email: 'recipient@example.com',
                                avatarUrl: 'https://i.pravatar.cc/150?u=recipient@example.com',
                                role: 'recipient',
                                verified: true,
                            });
                        }
                    } catch {
                        // Fallback to default recipient
                        setUser({
                            id: 'recipient-789',
                            name: 'Recipient User',
                            email: 'recipient@example.com',
                            avatarUrl: 'https://i.pravatar.cc/150?u=recipient@example.com',
                            role: 'recipient',
                            verified: true,
                        });
                    }
                } else {
                    // Default recipient user (first sample recipient)
                    try {
                        const defaultUser = await getUserByEmail('maria.rodriguez@example.com');
                        setUser(defaultUser || {
                            id: 'recipient-789',
                            name: 'Recipient User',
                            email: 'recipient@example.com',
                            avatarUrl: 'https://i.pravatar.cc/150?u=recipient@example.com',
                            role: 'recipient',
                            verified: true,
                        });
                    } catch {
                        setUser({
                            id: 'recipient-789',
                            name: 'Recipient User',
                            email: 'recipient@example.com',
                            avatarUrl: 'https://i.pravatar.cc/150?u=recipient@example.com',
                            role: 'recipient',
                            verified: true,
                        });
                    }
                }
            } else {
                setUser(MOCK_DONOR_USER);
            }
            setLoading(false);
        }, 1000);
    };

    const loginWithCredentials = async (email: string, password: string) => {
        setLoading(true);
        try {
            const loggedInUser = await loginUser(email, password);
            setUser(loggedInUser);
        } catch (error) {
            throw error; // Let the component handle the error
        } finally {
            setLoading(false);
        }
    };

    const register = (newUser: User) => {
        setUser(newUser);
    };

    const logout = () => {
        setLoading(true);
        setTimeout(() => {
            setUser(null);
            setLoading(false);
        }, 500);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithCredentials, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
