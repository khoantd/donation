import { User, RecipientProfile, RegistrationData } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock storage for registered users
let registeredUsers: { [email: string]: User } = {};
let recipientProfiles: { [userId: string]: RecipientProfile } = {};
let emailVerificationCodes: { [email: string]: { code: string; expiresAt: Date } } = {};

/**
 * Initialize sample recipient data
 */
const initializeSampleRecipients = () => {
    const now = new Date();
    
    // Sample Recipient 1: Maria Rodriguez - Single mother with 2 children
    const recipient1Id = 'recipient-maria-001';
    const recipient1: User = {
        id: recipient1Id,
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=maria.rodriguez@example.com',
        role: 'recipient',
        phoneNumber: '555-1001',
        address: '123 Oak Street, Springfield, IL 62701',
        verified: true,
        roles: ['recipient'],
    };
    registeredUsers['maria.rodriguez@example.com'] = recipient1;
    recipientProfiles[recipient1Id] = {
        userId: recipient1Id,
        bio: 'Single mother of two wonderful children. We are working hard to provide a better life for our family.',
        familySize: 3,
        familyComposition: '1 adult, 2 children (ages 7 and 10)',
        needs: 'We need clothing for growing children, educational materials, and household essentials.',
        verificationStatus: 'verified',
        verificationDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Admin',
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        preferences: {
            preferredCategories: ['Clothing', 'Education', 'Toys'],
            deliveryPreference: 'delivery',
            preferredContactMethod: 'phone',
        },
    };
    
    // Sample Recipient 2: James Thompson - Elderly couple
    const recipient2Id = 'recipient-james-002';
    const recipient2: User = {
        id: recipient2Id,
        name: 'James Thompson',
        email: 'james.thompson@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=james.thompson@example.com',
        role: 'recipient',
        phoneNumber: '555-1002',
        address: '456 Maple Avenue, Springfield, IL 62702',
        verified: true,
        roles: ['recipient'],
    };
    registeredUsers['james.thompson@example.com'] = recipient2;
    recipientProfiles[recipient2Id] = {
        userId: recipient2Id,
        bio: 'Retired couple living on a fixed income. We appreciate any help with household items and medical supplies.',
        familySize: 2,
        familyComposition: '2 adults (seniors)',
        needs: 'Medical supplies, warm clothing for winter, and household essentials.',
        verificationStatus: 'verified',
        verificationDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Admin',
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        preferences: {
            preferredCategories: ['Medical', 'Clothing', 'Food'],
            deliveryPreference: 'pickup',
            preferredContactMethod: 'email',
        },
    };
    
    // Sample Recipient 3: Sarah Williams - Large family
    const recipient3Id = 'recipient-sarah-003';
    const recipient3: User = {
        id: recipient3Id,
        name: 'Sarah Williams',
        email: 'sarah.williams@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=sarah.williams@example.com',
        role: 'recipient',
        phoneNumber: '555-1003',
        address: '789 Elm Street, Springfield, IL 62703',
        verified: true,
        roles: ['recipient'],
    };
    registeredUsers['sarah.williams@example.com'] = recipient3;
    recipientProfiles[recipient3Id] = {
        userId: recipient3Id,
        bio: 'Large family with 4 children. We are grateful for any donations that can help us make ends meet.',
        familySize: 6,
        familyComposition: '2 adults, 4 children (ages 2, 5, 8, 12)',
        needs: 'Clothing for all ages, food items, school supplies, and toys for the children.',
        verificationStatus: 'verified',
        verificationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Admin',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        preferences: {
            preferredCategories: ['Clothing', 'Food', 'Education', 'Toys'],
            deliveryPreference: 'delivery',
            preferredContactMethod: 'in-app',
        },
    };
    
    // Sample Recipient 4: David Chen - Recent immigrant family
    const recipient4Id = 'recipient-david-004';
    const recipient4: User = {
        id: recipient4Id,
        name: 'David Chen',
        email: 'david.chen@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=david.chen@example.com',
        role: 'recipient',
        phoneNumber: '555-1004',
        address: '321 Pine Road, Springfield, IL 62704',
        verified: true,
        roles: ['recipient'],
    };
    registeredUsers['david.chen@example.com'] = recipient4;
    recipientProfiles[recipient4Id] = {
        userId: recipient4Id,
        bio: 'New immigrant family settling into the community. Learning English and adapting to a new country.',
        familySize: 4,
        familyComposition: '2 adults, 2 children (ages 6 and 9)',
        needs: 'Household furniture, clothing, educational materials, and electronics for school.',
        verificationStatus: 'verified',
        verificationDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Admin',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        preferences: {
            preferredCategories: ['Furniture', 'Clothing', 'Education', 'Electronics'],
            deliveryPreference: 'either',
            preferredContactMethod: 'sms',
        },
    };
    
    // Sample Recipient 5: Lisa Martinez - Single person (pending verification)
    const recipient5Id = 'recipient-lisa-005';
    const recipient5: User = {
        id: recipient5Id,
        name: 'Lisa Martinez',
        email: 'lisa.martinez@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=lisa.martinez@example.com',
        role: 'recipient',
        phoneNumber: '555-1005',
        address: '654 Cedar Lane, Springfield, IL 62705',
        verified: false,
        roles: ['recipient'],
    };
    registeredUsers['lisa.martinez@example.com'] = recipient5;
    recipientProfiles[recipient5Id] = {
        userId: recipient5Id,
        bio: 'Working professional starting over. Grateful for any support during this transition.',
        familySize: 1,
        familyComposition: '1 adult',
        needs: 'Basic household items, clothing, and furniture.',
        verificationStatus: 'pending',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        preferences: {
            preferredCategories: ['Furniture', 'Clothing', 'Other'],
            deliveryPreference: 'pickup',
            preferredContactMethod: 'email',
        },
    };
};

// Initialize sample data on module load
initializeSampleRecipients();

/**
 * Register a new recipient or donor user
 */
export const registerUser = async (data: RegistrationData): Promise<User> => {
    await delay(800);
    
    // Validate email is unique
    if (registeredUsers[data.email.toLowerCase()]) {
        throw new Error('Email already registered');
    }
    
    // Validate password (basic validation)
    if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }
    
    // Validate terms acceptance
    if (!data.acceptTerms || !data.acceptPrivacy) {
        throw new Error('Please accept terms and conditions and privacy policy');
    }
    
    // Generate user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine roles
    let roles: ('donor' | 'recipient')[] = [];
    if (data.role === 'both') {
        roles = ['donor', 'recipient'];
    } else {
        roles = [data.role];
    }
    
    // Create user
    const newUser: User = {
        id: userId,
        name: data.name,
        email: data.email.toLowerCase(),
        avatarUrl: `https://i.pravatar.cc/150?u=${data.email.toLowerCase()}`,
        role: data.role === 'both' ? 'donor' : data.role, // Primary role
        phoneNumber: data.phoneNumber,
        address: data.address,
        verified: false,
        roles: roles,
    };
    
    // Store user
    registeredUsers[data.email.toLowerCase()] = newUser;
    
    // Create recipient profile if user is recipient
    if (data.role === 'recipient' || data.role === 'both') {
        const recipientProfile: RecipientProfile = {
            userId: userId,
            bio: '',
            familySize: 1,
            verificationStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
                preferredCategories: [],
                deliveryPreference: 'delivery',
                preferredContactMethod: 'email',
            },
        };
        
        recipientProfiles[userId] = recipientProfile;
    }
    
    return newUser;
};

/**
 * Send email verification code
 */
export const sendVerificationCode = async (email: string): Promise<void> => {
    await delay(500);
    
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    emailVerificationCodes[email.toLowerCase()] = {
        code,
        expiresAt,
    };
    
    // In a real app, this would send an email
    // For now, we'll log it (in production, this would be sent via email service)
    console.log(`Verification code for ${email}: ${code}`);
};

/**
 * Verify email with code
 */
export const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    await delay(500);
    
    const verification = emailVerificationCodes[email.toLowerCase()];
    
    if (!verification) {
        throw new Error('No verification code found. Please request a new one.');
    }
    
    if (new Date() > verification.expiresAt) {
        delete emailVerificationCodes[email.toLowerCase()];
        throw new Error('Verification code expired. Please request a new one.');
    }
    
    if (verification.code !== code) {
        throw new Error('Invalid verification code');
    }
    
    // Mark user as verified
    const user = registeredUsers[email.toLowerCase()];
    if (user) {
        user.verified = true;
    }
    
    // Update recipient profile if exists
    if (recipientProfiles[user.id]) {
        recipientProfiles[user.id].verificationStatus = 'verified';
        recipientProfiles[user.id].verificationDate = new Date();
    }
    
    // Clean up verification code
    delete emailVerificationCodes[email.toLowerCase()];
    
    return true;
};

/**
 * Get recipient profile by user ID
 */
export const getRecipientProfile = async (userId: string): Promise<RecipientProfile | null> => {
    await delay(300);
    return recipientProfiles[userId] || null;
};

/**
 * Update recipient profile
 */
export const updateRecipientProfile = async (
    userId: string,
    updates: Partial<RecipientProfile>
): Promise<RecipientProfile> => {
    await delay(400);
    
    // Create profile if it doesn't exist
    if (!recipientProfiles[userId]) {
        recipientProfiles[userId] = {
            userId: userId,
            bio: '',
            familySize: 1,
            verificationStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
                preferredCategories: [],
                deliveryPreference: 'delivery',
                preferredContactMethod: 'email',
            },
        };
    }
    
    recipientProfiles[userId] = {
        ...recipientProfiles[userId],
        ...updates,
        updatedAt: new Date(),
    };
    
    return recipientProfiles[userId];
};

/**
 * Check if email is already registered
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
    await delay(300);
    return !registeredUsers[email.toLowerCase()];
};

/**
 * Get registered user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
    await delay(300);
    return registeredUsers[email.toLowerCase()] || null;
};

/**
 * Login user (validate credentials)
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
    await delay(800);
    
    const user = registeredUsers[email.toLowerCase()];
    
    if (!user) {
        throw new Error('Invalid email or password');
    }
    
    // In a real app, password would be hashed and validated
    // For mock purposes, we'll assume password is correct if user exists
    // In production, use bcrypt or similar for password hashing
    
    return user;
};

