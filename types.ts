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

export type UserAccountStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending_verification';

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: 'donor' | 'admin' | 'recipient';
    phoneNumber?: string;
    address?: string;
    verified?: boolean; // Account verification status (legacy - use verificationStatus for recipients)
    verificationStatus?: 'pending' | 'verified' | 'rejected'; // Recipient verification status
    roles?: ('donor' | 'recipient')[]; // Support multiple roles (can be both donor and recipient)
    roleId?: string; // Reference to Role ID from master data system (e.g., 'role-1' for Administrator)
    accountStatus?: UserAccountStatus; // Account status (active, inactive, suspended, banned, pending_verification)
    statusReason?: string; // Reason for suspension/ban
    statusChangedAt?: Date; // When status was last changed
    statusChangedBy?: string; // Who changed the status
    createdAt: Date; // Registration/creation date
    createdBy?: string; // Who created the account (admin or 'system' for self-registration)
    lastLoginAt?: Date; // Last login timestamp
    loginCount?: number; // Total login count
    lastActivityAt?: Date; // Last activity timestamp
    forcePasswordChange?: boolean; // Force password change on next login
    isLocked?: boolean; // Account lockout status
    failedLoginAttempts?: number; // Failed login attempts count
    lockedUntil?: Date; // Lockout expiry date
    twoFactorEnabled?: boolean; // 2FA status
    bio?: string; // User bio/profile description
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

export interface UserTag {
    id: string;
    name: string;
    color: string; // Tailwind color class (e.g., 'bg-blue-500')
    description?: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy?: string;
}

export interface CommunicationRecord {
    id: string;
    donorId?: string; // Legacy support
    userId?: string; // Unified user ID (replaces donorId)
    type: 'email' | 'phone' | 'sms' | 'in-app' | 'meeting' | 'note' | 'other';
    subject?: string;
    content: string;
    date: Date;
    performedBy: string;
    relatedDonationId?: string; // Link to specific donation if applicable
    updatedAt?: Date;
    updatedBy?: string;
}

// User Management Types
export interface UserChangeHistory {
    id: string;
    userId: string;
    action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'role_assigned' | 'role_removed' | 'verified' | 'rejected' | 'suspended' | 'banned' | 'reactivated' | 'password_reset' | 'profile_updated';
    performedBy: string;
    performedAt: Date;
    changes?: {
        field: string;
        oldValue?: any;
        newValue?: any;
    }[];
    notes?: string;
}

export interface UserActivity {
    id: string;
    userId: string;
    type: 'login' | 'donation' | 'request' | 'match' | 'profile_update' | 'status_change' | 'verification';
    description: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface UserLoginHistory {
    id: string;
    userId: string;
    loginAt: Date;
    logoutAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    failureReason?: string;
}

export interface UserSecurityEvent {
    id: string;
    userId: string;
    type: 'password_change' | 'password_reset' | 'failed_login' | 'account_locked' | 'account_unlocked' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity';
    description: string;
    timestamp: Date;
    ipAddress?: string;
    metadata?: Record<string, any>;
}

export interface UserDependency {
    donations: number;
    requests: number;
    matches: number;
    communications: number;
    hasActiveItems: boolean;
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

// Master Data Management Types
export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string; // Icon identifier or URL
    color?: string; // Tailwind color class (e.g., 'bg-teal-500')
    parentId?: string; // For category hierarchy (parent/child categories)
    isActive: boolean; // Category visibility (active/inactive)
    displayOrder: number; // Display priority/ordering
    customFields?: Record<string, any>; // Category-specific fields
    guidelines?: string; // Category-specific guidelines
    usageStatistics: {
        donationCount: number;
        requestCount: number;
        lastUsed?: Date;
    };
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}

export interface CategoryChangeHistory {
    id: string;
    categoryId: string;
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
    previousValue?: Partial<Category>;
    newValue?: Partial<Category>;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

export type StatusTypeCategory = 'donation' | 'request' | 'delivery' | 'verification' | 'matching';

export interface StatusType {
    id: string;
    name: string;
    category: StatusTypeCategory; // Which entity type this status belongs to
    description?: string;
    color?: string; // Tailwind color class (e.g., 'bg-teal-500')
    icon?: string; // Icon identifier or emoji
    displayOrder: number; // Display priority/ordering
    isActive: boolean; // Status visibility (active/inactive)
    isDefault: boolean; // Whether this is a default system status
    isTerminal: boolean; // Whether this is a terminal/final status (cannot transition from)
    allowedTransitions: string[]; // Array of status IDs that can transition to this status
    guidelines?: string; // Guidelines for when/why to use this status
    usageStatistics: {
        count: number;
        lastUsed?: Date;
    };
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}

export interface StatusChangeHistory {
    id: string;
    statusId: string;
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
    previousValue?: Partial<StatusType>;
    newValue?: Partial<StatusType>;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

export interface UrgencyLevel {
    id: string;
    name: string;
    key: string; // Unique key identifier (e.g., 'high', 'medium', 'low')
    description?: string;
    color?: string; // Tailwind color class (e.g., 'bg-red-500')
    icon?: string; // Icon identifier or emoji
    displayOrder: number; // Display priority/ordering
    isActive: boolean; // Urgency level visibility (active/inactive)
    isDefault: boolean; // Whether this is a default system urgency level
    scoringWeight: number; // Scoring weight for matching algorithm (0-100)
    expirationDays?: number; // Optional: Auto-expiration days for requests with this urgency
    notificationRules?: {
        immediate?: boolean; // Send immediate notification
        notifyAdmins?: boolean; // Notify admins when request with this urgency is created
        notifyDonors?: boolean; // Notify donors about urgent requests
        escalationDelay?: number; // Hours before escalation
    };
    guidelines?: string; // Guidelines for when/why to use this urgency level
    usageStatistics: {
        requestCount: number;
        lastUsed?: Date;
    };
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}

export interface UrgencyLevelChangeHistory {
    id: string;
    urgencyLevelId: string;
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
    previousValue?: Partial<UrgencyLevel>;
    newValue?: Partial<UrgencyLevel>;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

// Permission Types
export type PermissionAction = 'read' | 'write' | 'delete' | 'approve' | 'manage' | 'view' | 'export';
export type PermissionResource = 
    | 'donations' 
    | 'requests' 
    | 'users' 
    | 'categories' 
    | 'status_types' 
    | 'urgency_levels' 
    | 'master_data' 
    | 'matching' 
    | 'analytics' 
    | 'settings'
    | 'notifications'
    | 'delivery';

export interface Permission {
    id: string;
    resource: PermissionResource;
    action: PermissionAction;
    name: string; // Human-readable name (e.g., "Read Donations", "Approve Requests")
    description?: string;
    category: 'data' | 'admin' | 'system' | 'reporting'; // Permission category
    isSystemPermission: boolean; // Whether this is a default system permission
}

export interface Role {
    id: string;
    name: string;
    key: string; // Unique key identifier (e.g., 'admin', 'donor', 'recipient', 'moderator')
    description?: string;
    color?: string; // Tailwind color class for visual identification
    icon?: string; // Icon identifier or emoji
    displayOrder: number;
    isActive: boolean;
    isDefault: boolean; // Whether this is a default system role
    isSystemRole: boolean; // Whether this role is a built-in system role (cannot be deleted)
    permissions: string[]; // Array of permission IDs
    parentRoleId?: string; // For role inheritance (optional parent role)
    featureAccess: {
        dashboard: boolean;
        donations: boolean;
        requests: boolean;
        matching: boolean;
        analytics: boolean;
        masterData: boolean;
        donorManagement: boolean;
        recipientManagement: boolean;
        settings: boolean;
    };
    restrictions?: {
        maxDonationsPerDay?: number;
        maxRequestsPerDay?: number;
        allowedCategories?: string[]; // Category IDs that can be accessed
        allowedStatuses?: string[]; // Status IDs that can be used
    };
    guidelines?: string; // Guidelines for when/why to use this role
    usageStatistics: {
        userCount: number;
        lastAssigned?: Date;
    };
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}

export interface RoleChangeHistory {
    id: string;
    roleId: string;
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'permissions_updated';
    previousValue?: Partial<Role>;
    newValue?: Partial<Role>;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

// Matching Algorithm Configuration Types
export interface MatchingScoreWeights {
    categoryMatch: number; // Weight for category match (default: 40)
    quantityFit: number; // Weight for quantity fit (default: 30)
    locationProximity: number; // Weight for location proximity (default: 0, will be used when location data is available)
    urgency: number; // Weight for urgency level (default: 20)
    requestAge: number; // Weight for request age factor (default: 0, older requests may get priority boost)
}

export interface MatchingThresholds {
    minimumScore: number; // Minimum score for suggestions (default: 50)
    highScoreThreshold: number; // Score threshold for high-quality matches (default: 80)
    autoMatchThreshold: number; // Score threshold for automatic matching (default: 95)
}

export interface MatchingPreferenceRules {
    preferExactQuantity: boolean; // Prefer exact quantity matches over excess/partial
    preferNearbyLocations: boolean; // Prefer matches with closer locations (when available)
    prioritizeUrgency: boolean; // Prioritize high urgency requests
    prioritizeRecentRequests: boolean; // Prioritize more recent requests
    considerRequestAge: boolean; // Consider how long request has been waiting
    maxRequestsPerDonation: number; // Maximum number of requests one donation can match to (default: unlimited)
    maxDonationsPerRequest: number; // Maximum number of donations one request can match to (default: unlimited)
}

export interface AutoMatchingRules {
    enabled: boolean; // Enable automatic matching
    autoMatchOnThreshold: boolean; // Auto-match when score exceeds autoMatchThreshold
    requireAdminApproval: boolean; // Require admin approval for auto-matched items
    notifyOnAutoMatch: boolean; // Send notifications when auto-match occurs
    excludeCategories: string[]; // Category IDs to exclude from auto-matching
    excludeUrgencyLevels: ('high' | 'medium' | 'low')[]; // Urgency levels to exclude from auto-matching
}

export interface MatchingAlgorithmVersion {
    version: string; // Algorithm version (e.g., "1.0", "1.1", "2.0")
    description: string; // Description of what changed in this version
    weights: MatchingScoreWeights;
    thresholds: MatchingThresholds;
    preferences: MatchingPreferenceRules;
    autoMatching: AutoMatchingRules;
    isActive: boolean; // Whether this version is currently active
    createdAt: Date;
    createdBy: string;
    activatedAt?: Date;
    activatedBy?: string;
}

export interface MatchingStatistics {
    totalMatches: number;
    confirmedMatches: number;
    fulfilledMatches: number;
    rejectedMatches: number;
    autoMatched: number;
    manualMatched: number;
    averageScore: number;
    highScoreMatches: number; // Matches with score >= highScoreThreshold
    lowScoreMatches: number; // Matches with score < minimumScore
    byCategory: Record<string, number>; // Match count by category
    byUrgency: {
        high: number;
        medium: number;
        low: number;
    };
    byStatus: {
        pending: number;
        confirmed: number;
        rejected: number;
        fulfilled: number;
        cancelled: number;
    };
    matchingPerformance: {
        averageTimeToMatch: number; // Average time from request creation to match (in hours)
        averageScoreTrend: number[]; // Average scores over time
        matchSuccessRate: number; // Percentage of matches that get confirmed
    };
    recentMatches: MatchingSuggestion[]; // Recent matching suggestions
    lastUpdated: Date;
}

export interface MatchingAlgorithmConfig {
    id: string;
    version: string;
    description: string;
    weights: MatchingScoreWeights;
    thresholds: MatchingThresholds;
    preferences: MatchingPreferenceRules;
    autoMatching: AutoMatchingRules;
    isActive: boolean;
    statistics: MatchingStatistics;
    versions: MatchingAlgorithmVersion[];
    usageStatistics: {
        totalSuggestions: number;
        suggestionsAccepted: number;
        suggestionsRejected: number;
        averageScoreGenerated: number;
        lastUsed?: Date;
    };
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}

export interface MatchingAlgorithmChangeHistory {
    id: string;
    configId: string;
    action: 'created' | 'updated' | 'version_created' | 'activated' | 'deactivated' | 'weights_updated' | 'thresholds_updated' | 'preferences_updated' | 'auto_matching_updated';
    previousValue?: Partial<MatchingAlgorithmConfig>;
    newValue?: Partial<MatchingAlgorithmConfig>;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

// System Configuration Settings Types
export interface GeneralAppSettings {
    appName: string;
    logo?: string; // URL or base64 string
    primaryColor: string; // Hex color code
    secondaryColor: string; // Hex color code
    accentColor: string; // Hex color code
    themeMode: 'light' | 'dark' | 'auto';
    footerText?: string;
    supportEmail?: string;
    supportPhone?: string;
    supportAddress?: string;
}

export interface DonationLimits {
    globalMinQuantity: number;
    globalMaxQuantity: number;
    categoryLimits: Record<string, { min?: number; max?: number }>; // Category ID -> limits
}

export interface RequestLimits {
    maxActiveRequestsPerRecipient: number;
    maxRequestsPerDay: number;
    maxRequestsPerMonth: number;
}

export interface RequestExpiryRules {
    defaultExpirationDays: number;
    urgencyExpirationDays: {
        high: number;
        medium: number;
        low: number;
    };
    autoExpiryEnabled: boolean;
    notificationBeforeExpiry: number; // Days before expiry to send notification
}

export interface AccountVerificationRules {
    requireVerificationForRecipients: boolean;
    requireVerificationForDonors: boolean;
    autoApproveVerified: boolean; // Auto-approve donations/requests from verified accounts
    verificationRequiredDocuments: string[]; // List of required document types
    verificationTimeframe: number; // Days to verify after registration
    manualReviewRequired: boolean;
    verificationExpiryDays?: number; // Days before verification expires
}

export interface ImageUploadSettings {
    maxFileSize: number; // Max file size in bytes (default: 5MB)
    maxFileSizeMB: number; // Max file size in MB (for display)
    allowedFormats: string[]; // e.g., ['image/jpeg', 'image/png', 'image/webp']
    maxImagesPerItem: number; // Max images per donation/request (default: 5)
    compressionLevel: number; // 0-100, higher = better quality but larger file (default: 80)
    maxWidth: number; // Max image width in pixels (default: 1920)
    maxHeight: number; // Max image height in pixels (default: 1080)
    generateThumbnails: boolean;
    thumbnailSizes: number[]; // Array of thumbnail sizes in pixels
}

export interface ExportSettings {
    defaultFormat: 'csv' | 'json' | 'excel' | 'pdf';
    availableFormats: ('csv' | 'json' | 'excel' | 'pdf')[];
    scheduledReports: {
        enabled: boolean;
        frequency: 'daily' | 'weekly' | 'monthly';
        recipients: string[]; // Email addresses
        format: 'csv' | 'json' | 'excel' | 'pdf';
        reportTypes: string[]; // Types of reports to include
    };
    includeMetadata: boolean; // Include timestamps, user info, etc.
}

export interface PaginationSettings {
    defaultItemsPerPage: number;
    itemsPerPageOptions: number[]; // e.g., [10, 25, 50, 100]
    maxItemsPerPage: number;
}

export interface FeatureFlags {
    donations: boolean;
    requests: boolean;
    matching: boolean;
    leaderboard: boolean;
    achievements: boolean;
    impactStories: boolean;
    recipientRegistration: boolean;
    donorRegistration: boolean;
    notifications: boolean;
    analytics: boolean;
    export: boolean;
    [key: string]: boolean; // Allow custom feature flags
}

export interface SystemAnnouncement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    priority: 'low' | 'medium' | 'high';
    startDate: Date;
    endDate?: Date; // Optional end date for time-limited announcements
    isActive: boolean;
    targetAudience: 'all' | 'donors' | 'recipients' | 'admins';
    showOnLogin: boolean;
    showOnDashboard: boolean;
    dismissible: boolean; // Can users dismiss this announcement
    createdAt: Date;
    createdBy: string;
    updatedAt?: Date;
    updatedBy?: string;
}

export interface BusinessRules {
    allowPartialMatching: boolean; // Allow partial quantity matches
    requireAdminApprovalForDonations: boolean;
    requireAdminApprovalForRequests: boolean;
    allowDonationEditing: boolean;
    allowRequestEditing: boolean;
    autoAssignCategories: boolean; // Auto-assign categories based on item name
    enableQuantityTracking: boolean; // Track partial quantities
    enableLocationTracking: boolean; // Enable location-based matching
    enableNotifications: boolean;
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;
    enableInAppNotifications: boolean;
    donationCooldownHours?: number; // Hours between donations (if applicable)
    requestCooldownHours?: number; // Hours between requests (if applicable)
}

export interface SystemConfiguration {
    id: string;
    version: string;
    generalSettings: GeneralAppSettings;
    donationLimits: DonationLimits;
    requestLimits: RequestLimits;
    requestExpiryRules: RequestExpiryRules;
    accountVerificationRules: AccountVerificationRules;
    imageUploadSettings: ImageUploadSettings;
    exportSettings: ExportSettings;
    paginationSettings: PaginationSettings;
    featureFlags: FeatureFlags;
    businessRules: BusinessRules;
    announcements: SystemAnnouncement[];
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}

export interface SystemConfigurationChangeHistory {
    id: string;
    configId: string;
    action: 'created' | 'updated' | 'settings_updated' | 'limits_updated' | 'rules_updated' | 'feature_flag_updated' | 'announcement_created' | 'announcement_updated' | 'announcement_deleted';
    section?: string; // Which section was updated (e.g., 'generalSettings', 'donationLimits')
    previousValue?: Partial<SystemConfiguration>;
    newValue?: Partial<SystemConfiguration>;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}
