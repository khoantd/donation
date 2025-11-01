import { User, UserAccountStatus, UserTag, CommunicationRecord, UserChangeHistory, UserActivity, UserLoginHistory, UserSecurityEvent, UserDependency } from '../types';
import { getDonations } from './donationService';
import { getAllItemRequests } from './requestService';
import { getAllMatches } from './matchingService';

const delayPromise = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock storage for all users (donors, recipients, admins)
let mockUsers: User[] = [];

// Mock storage for user tags
let userTags: { [tagId: string]: UserTag } = {};

// Mock storage for user tags assignment (userId -> tagIds[])
let userTagAssignments: { [userId: string]: string[] } = {};

// Mock storage for communication history
let userCommunications: CommunicationRecord[] = [];

// Mock storage for user change history
let userChangeHistory: UserChangeHistory[] = [];

// Mock storage for user activities
let userActivities: UserActivity[] = [];

// Mock storage for login history
let loginHistory: UserLoginHistory[] = [];

// Mock storage for security events
let securityEvents: UserSecurityEvent[] = [];


// Initialize sample users - call synchronously since it doesn't actually need to be async for initialization
const initializeUsersSync = () => {
    // Admin users
    const adminUser: User = {
        id: 'admin-456',
        name: 'Admin User',
        email: 'admin@charityconnect.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin@charityconnect.com',
        role: 'admin',
        roleId: 'role-1',
        verified: true,
        accountStatus: 'active',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        loginCount: 245,
        lastActivityAt: new Date(Date.now() - 30 * 60 * 1000),
        bio: 'System Administrator',
    };
    
    // Donor users
    const donorUser1: User = {
        id: 'user-123',
        name: 'Jane Donor',
        email: 'jane.donor@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=jane.donor@example.com',
        role: 'donor',
        roles: ['donor'],
        phoneNumber: '+1-555-0101',
        address: '123 Main St, City, State 12345',
        verified: true,
        accountStatus: 'active',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        loginCount: 42,
        lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };
    
    const donorUser2: User = {
        id: 'user-456',
        name: 'John Smith',
        email: 'john.smith@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=john.smith@example.com',
        role: 'donor',
        roles: ['donor'],
        phoneNumber: '+1-555-0102',
        address: '456 Oak Ave, City, State 12345',
        verified: true,
        accountStatus: 'active',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        loginCount: 28,
        lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    };
    
    // Recipient users
    const recipientUser1: User = {
        id: 'user-789',
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=maria.rodriguez@example.com',
        role: 'recipient',
        roles: ['recipient'],
        phoneNumber: '+1-555-0103',
        address: '789 Elm St, City, State 12345',
        verified: false,
        verificationStatus: 'verified',
        accountStatus: 'active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        loginCount: 15,
        lastActivityAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    };
    
    const recipientUser2: User = {
        id: 'user-101',
        name: 'Michael Johnson',
        email: 'michael.johnson@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=michael.johnson@example.com',
        role: 'recipient',
        roles: ['recipient'],
        phoneNumber: '+1-555-0104',
        address: '101 Pine Rd, City, State 12345',
        verified: false,
        verificationStatus: 'pending',
        accountStatus: 'pending_verification',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        loginCount: 3,
        lastActivityAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };
    
    // Dual role user (both donor and recipient)
    const dualRoleUser: User = {
        id: 'user-202',
        name: 'Sarah Williams',
        email: 'sarah.williams@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=sarah.williams@example.com',
        role: 'donor',
        roles: ['donor', 'recipient'],
        phoneNumber: '+1-555-0105',
        address: '202 Maple Dr, City, State 12345',
        verified: true,
        verificationStatus: 'verified',
        accountStatus: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        loginCount: 35,
        lastActivityAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    };
    
    // Additional dual role user (both donor and recipient) - active community member
    const dualRoleUser2: User = {
        id: 'user-303',
        name: 'David Martinez',
        email: 'david.martinez@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=david.martinez@example.com',
        role: 'recipient',
        roles: ['donor', 'recipient'],
        phoneNumber: '+1-555-0106',
        address: '303 Cedar Blvd, City, State 12345',
        verified: true,
        verificationStatus: 'verified',
        accountStatus: 'active',
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        loginCount: 52,
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        bio: 'Community member who both gives and receives. Passionate about helping others and building a stronger community.',
    };
    
    mockUsers = [adminUser, donorUser1, donorUser2, recipientUser1, recipientUser2, dualRoleUser, dualRoleUser2];
    
    // Initialize default user tags
    const defaultTags: UserTag[] = [
        { id: 'utag-1', name: 'VIP Donor', color: 'bg-purple-500', description: 'High-value donor', createdAt: new Date(), createdBy: 'System', updatedAt: new Date() },
        { id: 'utag-2', name: 'Regular Donor', color: 'bg-blue-500', description: 'Regular contributor', createdAt: new Date(), createdBy: 'System', updatedAt: new Date() },
        { id: 'utag-3', name: 'Active Recipient', color: 'bg-green-500', description: 'Active recipient user', createdAt: new Date(), createdBy: 'System', updatedAt: new Date() },
        { id: 'utag-4', name: 'Needs Follow-up', color: 'bg-yellow-500', description: 'Requires admin attention', createdAt: new Date(), createdBy: 'System', updatedAt: new Date() },
        { id: 'utag-5', name: 'Inactive', color: 'bg-gray-500', description: 'Inactive user', createdAt: new Date(), createdBy: 'System', updatedAt: new Date() },
        { id: 'utag-6', name: 'Volunteer', color: 'bg-teal-500', description: 'Volunteer user', createdAt: new Date(), createdBy: 'System', updatedAt: new Date() },
    ];
    
    defaultTags.forEach(tag => {
        userTags[tag.id] = tag;
    });
    
    // Assign some tags
    userTagAssignments['user-123'] = ['utag-2', 'utag-6'];
    userTagAssignments['user-456'] = ['utag-1'];
    userTagAssignments['user-789'] = ['utag-3'];
    userTagAssignments['user-202'] = ['utag-2', 'utag-3']; // Dual role user - Regular Donor and Active Recipient
    userTagAssignments['user-303'] = ['utag-2', 'utag-3', 'utag-6']; // Dual role user - Regular Donor, Active Recipient, and Volunteer
    
    // Initialize change history
    mockUsers.forEach(user => {
        userChangeHistory.push({
            id: `history-${user.id}-1`,
            userId: user.id,
            action: 'created',
            performedBy: user.createdBy || 'System',
            performedAt: user.createdAt,
            notes: 'User account created',
        });
    });
};

// Initialize on module load
initializeUsersSync();

/**
 * Get all users with filtering and pagination
 */
export const getAllUsers = async (filters?: {
    search?: string;
    role?: 'donor' | 'admin' | 'recipient';
    accountStatus?: UserAccountStatus;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    roleId?: string;
    tags?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
    lastActivityAfter?: Date;
    lastActivityBefore?: Date;
}, sortBy?: 'name' | 'email' | 'createdAt' | 'lastActivityAt' | 'loginCount', sortOrder?: 'asc' | 'desc'): Promise<User[]> => {
    await delayPromise(500);
    
    let filtered = [...mockUsers];
    
    if (filters) {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower) ||
                u.phoneNumber?.toLowerCase().includes(searchLower) ||
                u.address?.toLowerCase().includes(searchLower)
            );
        }
        
        if (filters.role) {
            filtered = filtered.filter(u => u.role === filters.role || u.roles?.includes(filters.role as 'donor' | 'recipient'));
        }
        
        if (filters.accountStatus) {
            filtered = filtered.filter(u => u.accountStatus === filters.accountStatus || (!u.accountStatus && filters.accountStatus === 'active'));
        }
        
        if (filters.verificationStatus) {
            filtered = filtered.filter(u => u.verificationStatus === filters.verificationStatus);
        }
        
        if (filters.roleId) {
            filtered = filtered.filter(u => u.roleId === filters.roleId);
        }
        
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(u => {
                const userTags = userTagAssignments[u.id] || [];
                return filters.tags!.some(tagId => userTags.includes(tagId));
            });
        }
        
        if (filters.createdAfter) {
            filtered = filtered.filter(u => u.createdAt >= filters.createdAfter!);
        }
        
        if (filters.createdBefore) {
            filtered = filtered.filter(u => u.createdAt <= filters.createdBefore!);
        }
        
        if (filters.lastActivityAfter) {
            filtered = filtered.filter(u => u.lastActivityAt && u.lastActivityAt >= filters.lastActivityAfter!);
        }
        
        if (filters.lastActivityBefore) {
            filtered = filtered.filter(u => u.lastActivityAt && u.lastActivityAt <= filters.lastActivityBefore!);
        }
    }
    
    // Sort
    if (sortBy) {
        filtered.sort((a, b) => {
            let aVal: any;
            let bVal: any;
            
            switch (sortBy) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'email':
                    aVal = a.email.toLowerCase();
                    bVal = b.email.toLowerCase();
                    break;
                case 'createdAt':
                    aVal = a.createdAt.getTime();
                    bVal = b.createdAt.getTime();
                    break;
                case 'lastActivityAt':
                    aVal = a.lastActivityAt?.getTime() || 0;
                    bVal = b.lastActivityAt?.getTime() || 0;
                    break;
                case 'loginCount':
                    aVal = a.loginCount || 0;
                    bVal = b.loginCount || 0;
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    return filtered;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
    await delayPromise(300);
    return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
    await delayPromise(300);
    return mockUsers.find(u => u.id === userId) || null;
};

/**
 * Create a new user (admin-created)
 */
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'createdBy' | 'loginCount'>, createdBy: string): Promise<User> => {
    await delayPromise(800);
    
    // Validate email is unique
    if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('Email already registered');
    }
    
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        createdBy,
        loginCount: 0,
        accountStatus: userData.accountStatus || 'active',
        avatarUrl: userData.avatarUrl || `https://i.pravatar.cc/150?u=${userData.email.toLowerCase()}`,
    };
    
    mockUsers.push(newUser);
    
    // Record change history
    userChangeHistory.push({
        id: `history-${newUser.id}-${Date.now()}`,
        userId: newUser.id,
        action: 'created',
        performedBy: createdBy,
        performedAt: new Date(),
        notes: `User account created by ${createdBy}`,
    });
    
    return newUser;
};

/**
 * Update user information
 */
export const updateUser = async (userId: string, updates: Partial<User>, updatedBy: string): Promise<User> => {
    await delayPromise(500);
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error('User not found');
    }
    
    const oldUser = { ...mockUsers[userIndex] };
    const updatedUser = { ...mockUsers[userIndex], ...updates };
    
    mockUsers[userIndex] = updatedUser;
    
    // Record changes
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    Object.keys(updates).forEach(key => {
        if (key !== 'id' && (oldUser as any)[key] !== (updatedUser as any)[key]) {
            changes.push({
                field: key,
                oldValue: (oldUser as any)[key],
                newValue: (updatedUser as any)[key],
            });
        }
    });
    
    if (changes.length > 0) {
        userChangeHistory.push({
            id: `history-${userId}-${Date.now()}`,
            userId,
            action: 'updated',
            performedBy: updatedBy,
            performedAt: new Date(),
            changes,
            notes: `User profile updated by ${updatedBy}`,
        });
    }
    
    return updatedUser;
};

/**
 * Delete user (soft delete - mark as inactive or actually remove)
 */
export const deleteUser = async (userId: string, deletedBy: string, hardDelete: boolean = false): Promise<void> => {
    await delayPromise(500);
    
    // Check dependencies
    const dependencies = await getUserDependencies(userId);
    if (dependencies.hasActiveItems && !hardDelete) {
        throw new Error('Cannot delete user with active donations or requests. Please transfer or complete items first.');
    }
    
    if (hardDelete) {
        mockUsers = mockUsers.filter(u => u.id !== userId);
        // Remove related data
        delete userTagAssignments[userId];
        userCommunications = userCommunications.filter(c => c.userId !== userId && c.donorId !== userId);
    } else {
        // Soft delete - mark as inactive
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            mockUsers[userIndex].accountStatus = 'inactive';
        }
    }
    
    // Record change history
    userChangeHistory.push({
        id: `history-${userId}-${Date.now()}`,
        userId,
        action: 'deleted',
        performedBy: deletedBy,
        performedAt: new Date(),
        notes: hardDelete ? 'User account permanently deleted' : 'User account deactivated',
    });
};

/**
 * Update user account status
 */
export const updateUserStatus = async (userId: string, status: UserAccountStatus, reason?: string, updatedBy: string): Promise<User> => {
    await delayPromise(500);
    
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const oldStatus = user.accountStatus || 'active';
    const updatedUser = await updateUser(userId, {
        accountStatus: status,
        statusReason: reason,
        statusChangedAt: new Date(),
        statusChangedBy: updatedBy,
    }, updatedBy);
    
    // Record status change history
    userChangeHistory.push({
        id: `history-${userId}-${Date.now()}`,
        userId,
        action: 'status_changed',
        performedBy: updatedBy,
        performedAt: new Date(),
        changes: [{
            field: 'accountStatus',
            oldValue: oldStatus,
            newValue: status,
        }],
        notes: reason || `Status changed from ${oldStatus} to ${status}`,
    });
    
    return updatedUser;
};

/**
 * Bulk update user status
 */
export const bulkUpdateUserStatus = async (userIds: string[], status: UserAccountStatus, reason?: string, updatedBy: string): Promise<void> => {
    await delayPromise(800);
    
    for (const userId of userIds) {
        try {
            await updateUserStatus(userId, status, reason, updatedBy);
        } catch (error) {
            console.error(`Failed to update user ${userId}:`, error);
        }
    }
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (userId: string, roleId: string, assignedBy: string): Promise<User> => {
    await delayPromise(500);
    
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const updatedUser = await updateUser(userId, { roleId }, assignedBy);
    
    // Record role assignment history
    userChangeHistory.push({
        id: `history-${userId}-${Date.now()}`,
        userId,
        action: 'role_assigned',
        performedBy: assignedBy,
        performedAt: new Date(),
        changes: [{
            field: 'roleId',
            oldValue: user.roleId,
            newValue: roleId,
        }],
        notes: `Role assigned by ${assignedBy}`,
    });
    
    return updatedUser;
};

/**
 * Bulk assign role to users
 */
export const bulkAssignRole = async (userIds: string[], roleId: string, assignedBy: string): Promise<void> => {
    await delayPromise(800);
    
    for (const userId of userIds) {
        try {
            await assignRoleToUser(userId, roleId, assignedBy);
        } catch (error) {
            console.error(`Failed to assign role to user ${userId}:`, error);
        }
    }
};

/**
 * Verify user account
 */
export const verifyUser = async (userId: string, verifiedBy: string): Promise<User> => {
    await delayPromise(500);
    
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const updatedUser = await updateUser(userId, {
        verified: true,
        verificationStatus: 'verified',
        accountStatus: 'active',
    }, verifiedBy);
    
    // Record verification history
    userChangeHistory.push({
        id: `history-${userId}-${Date.now()}`,
        userId,
        action: 'verified',
        performedBy: verifiedBy,
        performedAt: new Date(),
        notes: `User account verified by ${verifiedBy}`,
    });
    
    return updatedUser;
};

/**
 * Reject user verification
 */
export const rejectUserVerification = async (userId: string, reason: string, rejectedBy: string): Promise<User> => {
    await delayPromise(500);
    
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const updatedUser = await updateUser(userId, {
        verificationStatus: 'rejected',
        accountStatus: 'inactive',
    }, rejectedBy);
    
    // Record rejection history
    userChangeHistory.push({
        id: `history-${userId}-${Date.now()}`,
        userId,
        action: 'rejected',
        performedBy: rejectedBy,
        performedAt: new Date(),
        notes: reason || `Verification rejected by ${rejectedBy}`,
    });
    
    return updatedUser;
};

/**
 * Bulk verify/reject users
 */
export const bulkVerifyUsers = async (userIds: string[], action: 'verify' | 'reject', reason?: string, performedBy: string): Promise<void> => {
    await delayPromise(800);
    
    for (const userId of userIds) {
        try {
            if (action === 'verify') {
                await verifyUser(userId, performedBy);
            } else {
                await rejectUserVerification(userId, reason || 'Bulk rejection', performedBy);
            }
        } catch (error) {
            console.error(`Failed to ${action} user ${userId}:`, error);
        }
    }
};

/**
 * Get user dependencies (donations, requests, matches)
 */
export const getUserDependencies = async (userId: string): Promise<UserDependency> => {
    await delayPromise(300);
    
    const donations = await getDonations();
    const requests = await getAllItemRequests();
    const matches = await getAllMatches();
    
    const userDonations = donations.filter(d => d.donorId === userId);
    const userRequests = requests.filter(r => r.recipientId === userId);
    const userMatches = matches.filter(m => m.recipientId === userId || userDonations.some(d => d.id === m.donationId));
    const userComms = userCommunications.filter(c => (c.userId === userId || c.donorId === userId));
    
    // Check for active items
    const hasActiveDonations = userDonations.some(d => d.status !== 'delivered' && d.status !== 'rejected' && d.status !== 'cancelled');
    const hasActiveRequests = userRequests.some(r => r.status !== 'fulfilled' && r.status !== 'cancelled' && r.status !== 'expired');
    const hasActiveMatches = userMatches.some(m => m.status !== 'fulfilled' && m.status !== 'cancelled' && m.status !== 'rejected');
    
    return {
        donations: userDonations.length,
        requests: userRequests.length,
        matches: userMatches.length,
        communications: userComms.length,
        hasActiveItems: hasActiveDonations || hasActiveRequests || hasActiveMatches,
    };
};

/**
 * Get user change history
 */
export const getUserChangeHistory = async (userId: string): Promise<UserChangeHistory[]> => {
    await delayPromise(300);
    return userChangeHistory
        .filter(h => h.userId === userId)
        .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: { role: string; count: number }[];
    verifiedUsers: number;
    unverifiedUsers: number;
    pendingVerification: number;
    recentRegistrations: number;
}> => {
    await delayPromise(300);
    
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => (u.accountStatus || 'active') === 'active').length;
    
    const roleCounts: { [key: string]: number } = {};
    mockUsers.forEach(u => {
        const roles = u.roles || [u.role];
        roles.forEach(role => {
            roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
    });
    
    const usersByRole = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
    
    const verifiedUsers = mockUsers.filter(u => u.verified || u.verificationStatus === 'verified').length;
    const unverifiedUsers = mockUsers.filter(u => !u.verified && u.verificationStatus !== 'verified' && u.verificationStatus !== 'pending').length;
    const pendingVerification = mockUsers.filter(u => u.verificationStatus === 'pending').length;
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = mockUsers.filter(u => u.createdAt >= sevenDaysAgo).length;
    
    return {
        totalUsers,
        activeUsers,
        usersByRole,
        verifiedUsers,
        unverifiedUsers,
        pendingVerification,
        recentRegistrations,
    };
};

/**
 * Get all user tags
 */
export const getAllUserTags = async (): Promise<UserTag[]> => {
    await delayPromise(200);
    return Object.values(userTags).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Create user tag
 */
export const createUserTag = async (tag: Omit<UserTag, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<UserTag> => {
    await delayPromise(300);
    
    const newTag: UserTag = {
        ...tag,
        id: `utag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
    };
    
    userTags[newTag.id] = newTag;
    return newTag;
};

/**
 * Update user tag
 */
export const updateUserTag = async (tagId: string, updates: Partial<UserTag>, updatedBy: string): Promise<UserTag> => {
    await delayPromise(300);
    
    const tag = userTags[tagId];
    if (!tag) {
        throw new Error('Tag not found');
    }
    
    const updatedTag: UserTag = {
        ...tag,
        ...updates,
        updatedAt: new Date(),
        updatedBy,
    };
    
    userTags[tagId] = updatedTag;
    return updatedTag;
};

/**
 * Delete user tag
 */
export const deleteUserTag = async (tagId: string): Promise<void> => {
    await delayPromise(300);
    
    delete userTags[tagId];
    
    // Remove tag from all users
    Object.keys(userTagAssignments).forEach(userId => {
        userTagAssignments[userId] = userTagAssignments[userId].filter(id => id !== tagId);
    });
};

/**
 * Assign tags to user
 */
export const assignTagsToUser = async (userId: string, tagIds: string[]): Promise<void> => {
    await delayPromise(300);
    
    if (!mockUsers.some(u => u.id === userId)) {
        throw new Error('User not found');
    }
    
    userTagAssignments[userId] = tagIds;
};

/**
 * Get user tags
 */
export const getUserTags = async (userId: string): Promise<UserTag[]> => {
    await delayPromise(200);
    
    const tagIds = userTagAssignments[userId] || [];
    return tagIds.map(id => userTags[id]).filter(Boolean);
};

/**
 * Bulk assign tags to users
 */
export const bulkAssignTags = async (userIds: string[], tagIds: string[]): Promise<void> => {
    await delayPromise(800);
    
    for (const userId of userIds) {
        try {
            await assignTagsToUser(userId, tagIds);
        } catch (error) {
            console.error(`Failed to assign tags to user ${userId}:`, error);
        }
    }
};

/**
 * Add communication record
 */
export const addCommunicationRecord = async (communication: Omit<CommunicationRecord, 'id' | 'date'>, createdBy: string): Promise<CommunicationRecord> => {
    await delayPromise(300);
    
    const newComm: CommunicationRecord = {
        ...communication,
        id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(),
        createdBy,
    };
    
    userCommunications.push(newComm);
    return newComm;
};

/**
 * Get user communications
 */
export const getUserCommunications = async (userId: string): Promise<CommunicationRecord[]> => {
    await delayPromise(200);
    
    return userCommunications
        .filter(c => c.userId === userId || c.donorId === userId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
};

/**
 * Delete communication record
 */
export const deleteCommunicationRecord = async (commId: string): Promise<void> => {
    await delayPromise(200);
    
    const index = userCommunications.findIndex(c => c.id === commId);
    if (index !== -1) {
        userCommunications.splice(index, 1);
    }
};

