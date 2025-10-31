export enum DonationStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    DELIVERED = 'Delivered',
}

export interface ActionHistory {
    id: string;
    action: 'status_change' | 'quantity_update' | 'created';
    previousValue?: string | number;
    newValue: string | number;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

export interface AdminNote {
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
    updatedBy?: string;
}

export interface DonationItem {
    id: string;
    itemName: string;
    description: string;
    quantity: number;
    category: string;
    imageUrl: string; // Kept for backward compatibility, will use first image from imageUrls if available
    imageUrls: string[]; // Array of image URLs (supports multiple images)
    donorName: string;
    donorId: string;
    donorPhoneNumber: string;
    donorAddress: string;
    status: DonationStatus;
    submittedAt: Date;
    actionHistory?: ActionHistory[]; // Optional array of action history
    adminNotes?: AdminNote[]; // Private notes visible only to admins
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: 'donor' | 'admin' | 'recipient';
    phoneNumber?: string;
    address?: string;
    verified?: boolean; // Account verification status
    roles?: ('donor' | 'recipient')[]; // Support multiple roles (can be both donor and recipient)
}

export interface RecipientProfile {
    userId: string;
    bio?: string;
    familySize: number;
    familyComposition?: string; // e.g., "2 adults, 3 children"
    needs?: string;
    preferences?: {
        preferredCategories: string[];
        deliveryPreference: 'delivery' | 'pickup' | 'either';
        preferredContactMethod: 'email' | 'phone' | 'sms' | 'in-app';
    };
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationDate?: Date;
    verifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegistrationData {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    password: string;
    role: 'donor' | 'recipient' | 'both';
    acceptTerms: boolean;
    acceptPrivacy: boolean;
}

export interface ItemRequest {
    id: string;
    recipientId: string;
    recipientName: string;
    category: string;
    itemName: string;
    quantityNeeded: number;
    quantityReceived?: number; // Amount received so far
    description: string;
    urgency: 'high' | 'medium' | 'low';
    status: 'pending' | 'approved' | 'matched' | 'fulfilled' | 'cancelled' | 'expired';
    estimatedNeedDate?: Date;
    deadline?: Date;
    familySize?: number;
    familyComposition?: string;
    imageUrls?: string[];
    visibility: 'public' | 'private'; // Public = visible to donors, private = admin only
    matchingStatus?: 'waiting' | 'matched' | 'partially_matched';
    relatedDonationIds?: string[]; // Links to matched donations
    submittedAt: Date;
    approvedAt?: Date;
    approvedBy?: string;
    fulfilledAt?: Date;
    cancelledAt?: Date;
    cancelledBy?: string;
    notes?: string;
}

export interface DonationMatch {
    id: string;
    donationId: string;
    requestId: string;
    recipientId: string;
    quantityAllocated: number; // Amount allocated from donation to this request
    matchingScore: number; // 0-100 score based on algorithm
    status: 'pending' | 'confirmed' | 'rejected' | 'fulfilled' | 'cancelled';
    matchedBy: string; // Admin who created the match
    matchedAt: Date;
    confirmedAt?: Date;
    confirmedBy?: string;
    rejectedAt?: Date;
    rejectedBy?: string;
    fulfilledAt?: Date;
    notes?: string;
}

export interface MatchingSuggestion {
    donationId: string;
    requestId: string;
    matchingScore: number;
    reasons: string[]; // Reasons for the match (category match, quantity fit, etc.)
    categoryMatch: boolean;
    quantityFit: 'exact' | 'excess' | 'partial' | 'insufficient';
    locationProximity?: number; // Distance in miles (if location data available)
    urgencyLevel: 'high' | 'medium' | 'low';
}

export interface DonationGoal {
    id: string;
    type: 'items' | 'donations' | 'categories';
    target: number;
    current: number;
    description: string;
    deadline?: Date;
    completed: boolean;
    completedAt?: Date;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DonorProfile {
    userId: string;
    bio?: string;
    favoriteCategories: string[];
    donationGoals: DonationGoal[];
    achievements: Achievement[];
    totalImpact: {
        itemsDelivered: number;
        peopleHelped: number; // Estimated
        categoriesCovered: number;
    };
    preferences: {
        theme: 'light' | 'dark' | 'auto';
        notifications: boolean;
        showAchievements: boolean;
        showOnLeaderboard: boolean; // Privacy control for leaderboard
    };
}

export interface LeaderboardEntry {
    donorId: string;
    donorName: string;
    donorAvatar?: string;
    totalItems: number;
    totalDonations: number;
    deliveredItems: number;
    deliveredDonations: number;
    rank: number;
}

export interface ImpactStory {
    id: string;
    title: string;
    description: string;
    category: string;
    beforeImageUrl: string;
    afterImageUrl: string;
    beneficiaryName?: string; // Optional for privacy
    beneficiaryTestimonial?: string;
    location?: string;
    impactMetrics: {
        itemsReceived: number;
        peopleHelped: number;
        dateDelivered: Date;
    };
    relatedDonationIds?: string[]; // Links to specific donations
    publishedAt: Date;
    featured: boolean;
}

export interface DonorTag {
    id: string;
    name: string;
    color: string; // Tailwind color class (e.g., 'bg-blue-500')
    createdAt: Date;
    createdBy: string;
}

export interface CommunicationRecord {
    id: string;
    donorId: string;
    type: 'email' | 'phone' | 'meeting' | 'note' | 'other';
    subject?: string;
    content: string;
    date: Date;
    performedBy: string;
    relatedDonationId?: string; // Link to specific donation if applicable
}

export interface ManagedDonor {
    donorId: string;
    donorName: string;
    donorEmail?: string;
    donorPhoneNumber: string;
    donorAddress: string;
    avatarUrl?: string;
    tags: DonorTag[];
    communicationHistory: CommunicationRecord[];
    statistics: {
        totalDonations: number;
        totalItems: number;
        deliveredItems: number;
        deliveredDonations: number;
        pendingDonations: number;
        approvedDonations: number;
        rejectedDonations: number;
        lastDonationDate: Date | null;
        firstDonationDate: Date | null;
        favoriteCategories: string[];
        totalImpact: {
            itemsDelivered: number;
            peopleHelped: number;
            categoriesCovered: number;
        };
    };
}
