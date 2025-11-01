import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    activateCategory,
    deactivateCategory,
    bulkUpdateCategoryStatus,
    reorderCategories,
    getCategoryChangeHistory,
    getCategoryStatistics,
    searchCategories,
    getStatusTypes,
    getStatusTypeById,
    createStatusType,
    updateStatusType,
    deleteStatusType,
    activateStatusType,
    deactivateStatusType,
    bulkUpdateStatusTypeStatus,
    updateStatusWorkflow,
    getStatusChangeHistory,
    getStatusTypeStatistics,
    searchStatusTypes,
    getStatusTypesByCategory,
    getUrgencyLevels,
    getUrgencyLevelById,
    createUrgencyLevel,
    updateUrgencyLevel,
    deleteUrgencyLevel,
    activateUrgencyLevel,
    deactivateUrgencyLevel,
    bulkUpdateUrgencyLevelStatus,
    updateUrgencyScoringWeights,
    reorderUrgencyLevels,
    getUrgencyLevelChangeHistory,
    getUrgencyLevelStatistics,
    searchUrgencyLevels,
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    activateRole,
    deactivateRole,
    updateRolePermissions,
    getRoleChangeHistory,
    getRoleStatistics,
    searchRoles,
    getPermissions,
    getPermissionsByResource,
    getPermissionsByCategory,
    getRolePermissions,
    getParentCategories,
    getCategoryHierarchy,
    getMatchingAlgorithmConfig,
    updateMatchingWeights,
    updateMatchingThresholds,
    updateMatchingPreferences,
    updateAutoMatchingRules,
    createMatchingAlgorithmVersion,
    activateMatchingAlgorithmVersion,
    getMatchingStatistics,
    getMatchingAlgorithmChangeHistory,
    resetMatchingAlgorithmConfig,
    getSystemConfiguration,
    updateGeneralAppSettings,
    updateDonationLimits,
    updateRequestLimits,
    updateRequestExpiryRules,
    updateAccountVerificationRules,
    updateImageUploadSettings,
    updateExportSettings,
    updatePaginationSettings,
    updateFeatureFlags,
    updateBusinessRules,
    createSystemAnnouncement,
    updateSystemAnnouncement,
    deleteSystemAnnouncement,
    getSystemConfigurationChangeHistory,
} from '../services/masterDataService';
import { Category, CategoryChangeHistory, StatusType, StatusChangeHistory, StatusTypeCategory, UrgencyLevel, UrgencyLevelChangeHistory, Role, Permission, RoleChangeHistory, PermissionResource, CustomFieldDefinition, CustomFieldType, MatchingAlgorithmConfig, MatchingAlgorithmChangeHistory, MatchingScoreWeights, MatchingThresholds, MatchingPreferenceRules, AutoMatchingRules, MatchingStatistics, MatchingAlgorithmVersion, SystemConfiguration, SystemConfigurationChangeHistory, SystemAnnouncement, GeneralAppSettings, DonationLimits, RequestLimits, RequestExpiryRules, AccountVerificationRules, ImageUploadSettings, ExportSettings, PaginationSettings, FeatureFlags, BusinessRules } from '../types';

type Tab = 'categories' | 'status-types' | 'urgency-levels' | 'roles-permissions' | 'matching-algorithm' | 'system-config';

const MasterDataManagement: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('categories');
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Status Types management states
    const [statusTypes, setStatusTypes] = useState<StatusType[]>([]);
    const [filteredStatusTypes, setFilteredStatusTypes] = useState<StatusType[]>([]);
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusSearchTerm, setStatusSearchTerm] = useState('');
    const [statusFilterCategory, setStatusFilterCategory] = useState<StatusTypeCategory | 'all'>('all');
    const [showInactiveStatuses, setShowInactiveStatuses] = useState(false);
    const [selectedStatusTypes, setSelectedStatusTypes] = useState<Set<string>>(new Set());
    const [editingStatusType, setEditingStatusType] = useState<StatusType | null>(null);
    const [isCreatingStatusType, setIsCreatingStatusType] = useState(false);
    const [showStatusHistory, setShowStatusHistory] = useState(false);
    const [historyStatusId, setHistoryStatusId] = useState<string | null>(null);
    const [statusHistory, setStatusHistory] = useState<StatusChangeHistory[]>([]);
    const [statusStatistics, setStatusStatistics] = useState<{
        totalStatuses: number;
        activeStatuses: number;
        inactiveStatuses: number;
        byCategory: Record<StatusTypeCategory, number>;
        mostUsedStatus: StatusType | null;
    } | null>(null);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [workflowStatusId, setWorkflowStatusId] = useState<string | null>(null);
    
    // Urgency Levels management states
    const [urgencyLevels, setUrgencyLevels] = useState<UrgencyLevel[]>([]);
    const [filteredUrgencyLevels, setFilteredUrgencyLevels] = useState<UrgencyLevel[]>([]);
    const [urgencyLoading, setUrgencyLoading] = useState(true);
    const [urgencySearchTerm, setUrgencySearchTerm] = useState('');
    const [showInactiveUrgencyLevels, setShowInactiveUrgencyLevels] = useState(false);
    const [selectedUrgencyLevels, setSelectedUrgencyLevels] = useState<Set<string>>(new Set());
    const [editingUrgencyLevel, setEditingUrgencyLevel] = useState<UrgencyLevel | null>(null);
    const [isCreatingUrgencyLevel, setIsCreatingUrgencyLevel] = useState(false);
    const [showUrgencyHistory, setShowUrgencyHistory] = useState(false);
    const [historyUrgencyId, setHistoryUrgencyId] = useState<string | null>(null);
    const [urgencyHistory, setUrgencyHistory] = useState<UrgencyLevelChangeHistory[]>([]);
    const [urgencyStatistics, setUrgencyStatistics] = useState<{
        totalUrgencyLevels: number;
        activeUrgencyLevels: number;
        inactiveUrgencyLevels: number;
        totalRequests: number;
        mostUsedUrgencyLevel: UrgencyLevel | null;
        averageScoringWeight: number;
    } | null>(null);
    
    // Roles & Permissions management states
    const [roles, setRoles] = useState<Role[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [rolesSearchTerm, setRolesSearchTerm] = useState('');
    const [showInactiveRoles, setShowInactiveRoles] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [showRoleHistory, setShowRoleHistory] = useState(false);
    const [historyRoleId, setHistoryRoleId] = useState<string | null>(null);
    const [roleHistory, setRoleHistory] = useState<RoleChangeHistory[]>([]);
    const [roleStatistics, setRoleStatistics] = useState<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        systemRoles: number;
        customRoles: number;
        totalUsers: number;
        mostUsedRole: Role | null;
        averagePermissionsPerRole: number;
    } | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
    const [matrixRoleId, setMatrixRoleId] = useState<string | null>(null);
    const [matrixPermissions, setMatrixPermissions] = useState<string[]>([]);
    const [permissionFilterCategory, setPermissionFilterCategory] = useState<'all' | 'data' | 'admin' | 'system' | 'reporting'>('all');
    
    // Matching Algorithm Configuration states
    const [matchingConfig, setMatchingConfig] = useState<MatchingAlgorithmConfig | null>(null);
    const [matchingLoading, setMatchingLoading] = useState(true);
    const [matchingHistory, setMatchingHistory] = useState<MatchingAlgorithmChangeHistory[]>([]);
    const [showMatchingHistory, setShowMatchingHistory] = useState(false);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [versionDescription, setVersionDescription] = useState('');
    const [editingWeights, setEditingWeights] = useState<MatchingScoreWeights | null>(null);
    const [editingThresholds, setEditingThresholds] = useState<MatchingThresholds | null>(null);
    const [editingPreferences, setEditingPreferences] = useState<MatchingPreferenceRules | null>(null);
    const [editingAutoMatching, setEditingAutoMatching] = useState<AutoMatchingRules | null>(null);
    const [activeConfigSection, setActiveConfigSection] = useState<'weights' | 'thresholds' | 'preferences' | 'auto-matching' | 'versions' | 'statistics'>('weights');
    
    // System Configuration states
    const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(null);
    const [systemConfigLoading, setSystemConfigLoading] = useState(true);
    const [systemConfigHistory, setSystemConfigHistory] = useState<SystemConfigurationChangeHistory[]>([]);
    const [showSystemConfigHistory, setShowSystemConfigHistory] = useState(false);
    const [activeSystemConfigSection, setActiveSystemConfigSection] = useState<'general' | 'limits' | 'expiry' | 'verification' | 'images' | 'export' | 'pagination' | 'features' | 'business' | 'announcements'>('general');
    const [editingAnnouncement, setEditingAnnouncement] = useState<SystemAnnouncement | null>(null);
    const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
    const [announcementFormData, setAnnouncementFormData] = useState<Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>>({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        startDate: new Date(),
        endDate: undefined,
        isActive: true,
        targetAudience: 'all',
        showOnLogin: false,
        showOnDashboard: true,
        dismissible: true,
    });
    
    // System Configuration form states (moved from nested functions to fix hooks violation)
    const [generalSettingsForm, setGeneralSettingsForm] = useState<GeneralAppSettings | null>(null);
    const [donationLimitsForm, setDonationLimitsForm] = useState<DonationLimits | null>(null);
    const [requestLimitsForm, setRequestLimitsForm] = useState<RequestLimits | null>(null);
    const [expiryRulesForm, setExpiryRulesForm] = useState<RequestExpiryRules | null>(null);
    const [verificationRulesForm, setVerificationRulesForm] = useState<AccountVerificationRules | null>(null);
    const [imageSettingsForm, setImageSettingsForm] = useState<ImageUploadSettings | null>(null);
    const [exportSettingsForm, setExportSettingsForm] = useState<ExportSettings | null>(null);
    const [paginationSettingsForm, setPaginationSettingsForm] = useState<PaginationSettings | null>(null);
    const [featureFlagsForm, setFeatureFlagsForm] = useState<FeatureFlags | null>(null);
    const [businessRulesForm, setBusinessRulesForm] = useState<BusinessRules | null>(null);
    
    // Category management states
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [historyCategoryId, setHistoryCategoryId] = useState<string | null>(null);
    const [categoryHistory, setCategoryHistory] = useState<CategoryChangeHistory[]>([]);
    const [availableParentCategories, setAvailableParentCategories] = useState<Category[]>([]);
    const [showHierarchyView, setShowHierarchyView] = useState(false);
    const [statistics, setStatistics] = useState<{
        totalCategories: number;
        activeCategories: number;
        inactiveCategories: number;
        totalDonations: number;
        totalRequests: number;
        mostUsedCategory: Category | null;
    } | null>(null);
    
    // Form state for creating/editing categories
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        icon: string;
        color: string;
        parentId?: string;
        isActive: boolean;
        displayOrder: number;
        guidelines: string;
        customFields?: CustomFieldDefinition[];
    }>({
        name: '',
        description: '',
        icon: '📦',
        color: 'bg-teal-500',
        isActive: true,
        displayOrder: 0,
        guidelines: '',
        customFields: [],
    });
    
    // Custom fields editor state
    const [showCustomFieldsEditor, setShowCustomFieldsEditor] = useState(false);
    const [editingCustomField, setEditingCustomField] = useState<CustomFieldDefinition | null>(null);
    const [customFieldFormData, setCustomFieldFormData] = useState<Partial<CustomFieldDefinition>>({
        id: '',
        label: '',
        type: 'text',
        required: false,
        displayOrder: 0,
        visibleForDonations: true,
        visibleForRequests: true,
    });
    
    // Form state for creating/editing status types
    const [statusFormData, setStatusFormData] = useState<{
        name: string;
        category: StatusTypeCategory;
        description: string;
        icon: string;
        color: string;
        isActive: boolean;
        isTerminal: boolean;
        displayOrder: number;
        guidelines: string;
        allowedTransitions: string[];
    }>({
        name: '',
        category: 'donation',
        description: '',
        icon: '⏳',
        color: 'bg-yellow-500',
        isActive: true,
        isTerminal: false,
        displayOrder: 0,
        guidelines: '',
        allowedTransitions: [],
    });
    
    // Form state for creating/editing urgency levels
    const [urgencyFormData, setUrgencyFormData] = useState<{
        name: string;
        key: string;
        description: string;
        icon: string;
        color: string;
        isActive: boolean;
        displayOrder: number;
        scoringWeight: number;
        expirationDays?: number;
        notificationRules: {
            immediate?: boolean;
            notifyAdmins?: boolean;
            notifyDonors?: boolean;
            escalationDelay?: number;
        };
        guidelines: string;
    }>({
        name: '',
        key: '',
        description: '',
        icon: '⚠️',
        color: 'bg-orange-500',
        isActive: true,
        displayOrder: 0,
        scoringWeight: 10,
        expirationDays: undefined,
        notificationRules: {
            immediate: false,
            notifyAdmins: true,
            notifyDonors: false,
            escalationDelay: 72,
        },
        guidelines: '',
    });
    
    // Form state for creating/editing roles
    const [roleFormData, setRoleFormData] = useState<{
        name: string;
        key: string;
        description: string;
        icon: string;
        color: string;
        isActive: boolean;
        displayOrder: number;
        permissions: string[];
        parentRoleId?: string;
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
        restrictions: {
            maxDonationsPerDay?: number;
            maxRequestsPerDay?: number;
            allowedCategories?: string[];
            allowedStatuses?: string[];
        };
        guidelines: string;
    }>({
        name: '',
        key: '',
        description: '',
        icon: '👤',
        color: 'bg-gray-500',
        isActive: true,
        displayOrder: (roles.length || 0) + 1,
        permissions: [],
        parentRoleId: undefined,
        featureAccess: {
            dashboard: true,
            donations: false,
            requests: false,
            matching: false,
            analytics: false,
            masterData: false,
            donorManagement: false,
            recipientManagement: false,
            settings: false,
        },
        restrictions: {},
        guidelines: '',
    });
    
    const categoryColors = [
        { name: 'Teal', value: 'bg-teal-500' },
        { name: 'Blue', value: 'bg-blue-500' },
        { name: 'Purple', value: 'bg-purple-500' },
        { name: 'Green', value: 'bg-green-500' },
        { name: 'Orange', value: 'bg-orange-500' },
        { name: 'Red', value: 'bg-red-500' },
        { name: 'Yellow', value: 'bg-yellow-500' },
        { name: 'Pink', value: 'bg-pink-500' },
        { name: 'Amber', value: 'bg-amber-500' },
        { name: 'Gray', value: 'bg-gray-500' },
    ];
    
    const categoryIcons = ['📦', '👕', '🍞', '📱', '📚', '🪑', '🏥', '🧸', '🎮', '⚽', '🎨', '💻'];
    
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [categoriesData, stats] = await Promise.all([
                getCategories(showInactive),
                getCategoryStatistics(),
            ]);
            setCategories(categoriesData);
            setFilteredCategories(categoriesData);
            setStatistics(stats);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [showInactive]);
    
    const fetchParentCategories = useCallback(async (excludeId?: string) => {
        try {
            const parents = await getParentCategories(excludeId, showInactive);
            setAvailableParentCategories(parents);
        } catch (err) {
            // Silently fail - parent categories are not critical for form
            console.error('Failed to fetch parent categories:', err);
        }
    }, [showInactive]);
    
    const fetchStatusTypes = useCallback(async () => {
        try {
            setStatusLoading(true);
            setError(null);
            const category = statusFilterCategory === 'all' ? undefined : statusFilterCategory;
            const [statusesData, stats] = await Promise.all([
                getStatusTypes(category, showInactiveStatuses),
                getStatusTypeStatistics(),
            ]);
            setStatusTypes(statusesData);
            setFilteredStatusTypes(statusesData);
            setStatusStatistics(stats);
        } catch (err) {
            console.error('Failed to fetch status types:', err);
            setError('Failed to load status types. Please try again.');
        } finally {
            setStatusLoading(false);
        }
    }, [statusFilterCategory, showInactiveStatuses]);
    
    const fetchUrgencyLevels = useCallback(async () => {
        try {
            setUrgencyLoading(true);
            setError(null);
            const [urgencyData, stats] = await Promise.all([
                getUrgencyLevels(showInactiveUrgencyLevels),
                getUrgencyLevelStatistics(),
            ]);
            setUrgencyLevels(urgencyData);
            setFilteredUrgencyLevels(urgencyData);
            setUrgencyStatistics(stats);
        } catch (err) {
            console.error('Failed to fetch urgency levels:', err);
            setError('Failed to load urgency levels. Please try again.');
        } finally {
            setUrgencyLoading(false);
        }
    }, [showInactiveUrgencyLevels]);
    
    const fetchRoles = useCallback(async () => {
        try {
            setRolesLoading(true);
            setError(null);
            const [rolesData, stats, permissionsData] = await Promise.all([
                getRoles(showInactiveRoles),
                getRoleStatistics(),
                getPermissions(),
            ]);
            setRoles(rolesData);
            setFilteredRoles(rolesData);
            setRoleStatistics(stats);
            setPermissions(permissionsData);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
            setError('Failed to load roles. Please try again.');
        } finally {
            setRolesLoading(false);
        }
    }, [showInactiveRoles]);
    
    useEffect(() => {
        if (user?.role === 'admin') {
            if (activeTab === 'categories') {
                fetchCategories();
            } else if (activeTab === 'status-types') {
                fetchStatusTypes();
            } else if (activeTab === 'urgency-levels') {
                fetchUrgencyLevels();
            } else if (activeTab === 'roles-permissions') {
                fetchRoles();
            }
        }
    }, [user, activeTab, fetchCategories, fetchStatusTypes, fetchUrgencyLevels, fetchRoles]);
    
    // Helper function to build category tree structure
    const buildCategoryTree = (categories: Category[]): (Category & { children?: Category[] })[] => {
        const categoryMap = new Map<string, Category & { children?: Category[] }>();
        const rootCategories: (Category & { children?: Category[] })[] = [];
        
        // First pass: create map of all categories
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat });
        });
        
        // Second pass: build tree structure
        categories.forEach(cat => {
            const categoryNode = categoryMap.get(cat.id)!;
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(categoryNode);
                } else {
                    // Parent not found or not in filtered list, treat as root
                    rootCategories.push(categoryNode);
                }
            } else {
                rootCategories.push(categoryNode);
            }
        });
        
        // Sort each level by displayOrder
        const sortCategoryTree = (cats: (Category & { children?: Category[] })[]): (Category & { children?: Category[] })[] => {
            return cats
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(cat => {
                    if (cat.children && cat.children.length > 0) {
                        return {
                            ...cat,
                            children: sortCategoryTree(cat.children),
                        };
                    }
                    return cat;
                });
        };
        
        return sortCategoryTree(rootCategories);
    };
    
    // Render category tree recursively
    const renderCategoryTree = (categories: Category[], level: number = 0): React.ReactElement => {
        const tree = buildCategoryTree(categories);
        
        return (
            <div className="space-y-2">
                {tree.map((category: Category & { children?: Category[] }) => {
                    const indent = level * 24;
                    const hasChildren = category.children && category.children.length > 0;
                    
                    return (
                        <div key={category.id} className="border-l-2 border-gray-200 pl-4 py-2">
                            <div 
                                className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-md px-2"
                                style={{ marginLeft: `${indent}px` }}
                            >
                                {hasChildren && (
                                    <span className="text-gray-400 text-sm">▼</span>
                                )}
                                {!hasChildren && category.parentId && (
                                    <span className="text-gray-400 text-sm">└</span>
                                )}
                                <span className="text-2xl">{category.icon}</span>
                                <div className="flex-1 flex items-center gap-2">
                                    <span className={`inline-block w-3 h-3 rounded-full ${category.color}`}></span>
                                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        category.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        (Donations: {category.usageStatistics.donationCount}, 
                                        Requests: {category.usageStatistics.requestCount})
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="text-teal-600 hover:text-teal-900"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleViewHistory(category.id)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="View History"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                            {hasChildren && (
                                <div className="ml-4">
                                    {renderCategoryTree(category.children!, level + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };
    
    // Filter categories based on search term
    useEffect(() => {
        const filterCategories = async () => {
            if (!searchTerm) {
                setFilteredCategories(categories);
            } else {
                try {
                    const filtered = await searchCategories(searchTerm, showInactive);
                    setFilteredCategories(filtered);
                } catch (err) {
                    // Fallback to client-side filtering if search fails
                    const filtered = categories.filter(cat =>
                        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cat.guidelines?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    setFilteredCategories(filtered);
                }
            }
        };
        filterCategories();
    }, [searchTerm, categories, showInactive]);
    
    // Load parent categories when form is opened
    useEffect(() => {
        if (isCreatingCategory || editingCategory) {
            fetchParentCategories(editingCategory?.id);
        }
    }, [isCreatingCategory, editingCategory, fetchParentCategories]);
    
    // Filter status types based on search term and category filter
    useEffect(() => {
        const filterStatusTypes = async () => {
            if (!statusSearchTerm && statusFilterCategory === 'all') {
                setFilteredStatusTypes(statusTypes);
            } else {
                try {
                    let filtered = statusTypes;
                    if (statusFilterCategory !== 'all') {
                        filtered = await getStatusTypesByCategory(statusFilterCategory, showInactiveStatuses);
                    }
                    if (statusSearchTerm) {
                        filtered = await searchStatusTypes(statusSearchTerm, showInactiveStatuses);
                        if (statusFilterCategory !== 'all') {
                            filtered = filtered.filter(s => s.category === statusFilterCategory);
                        }
                    }
                    setFilteredStatusTypes(filtered);
                } catch (err) {
                    // Fallback to client-side filtering if search fails
                    let filtered = statusTypes;
                    if (statusFilterCategory !== 'all') {
                        filtered = filtered.filter(s => s.category === statusFilterCategory);
                    }
                    if (statusSearchTerm) {
                        filtered = filtered.filter(s =>
                            s.name.toLowerCase().includes(statusSearchTerm.toLowerCase()) ||
                            s.description?.toLowerCase().includes(statusSearchTerm.toLowerCase()) ||
                            s.guidelines?.toLowerCase().includes(statusSearchTerm.toLowerCase())
                        );
                    }
                    setFilteredStatusTypes(filtered);
                }
            }
        };
        filterStatusTypes();
    }, [statusSearchTerm, statusFilterCategory, statusTypes, showInactiveStatuses]);
    
    // Filter urgency levels based on search term
    useEffect(() => {
        const filterUrgencyLevels = async () => {
            if (!urgencySearchTerm) {
                setFilteredUrgencyLevels(urgencyLevels);
            } else {
                try {
                    const filtered = await searchUrgencyLevels(urgencySearchTerm, showInactiveUrgencyLevels);
                    setFilteredUrgencyLevels(filtered);
                } catch (err) {
                    // Fallback to client-side filtering if search fails
                    const filtered = urgencyLevels.filter(ul =>
                        ul.name.toLowerCase().includes(urgencySearchTerm.toLowerCase()) ||
                        ul.key.toLowerCase().includes(urgencySearchTerm.toLowerCase()) ||
                        ul.description?.toLowerCase().includes(urgencySearchTerm.toLowerCase()) ||
                        ul.guidelines?.toLowerCase().includes(urgencySearchTerm.toLowerCase())
                    );
                    setFilteredUrgencyLevels(filtered);
                }
            }
        };
        filterUrgencyLevels();
    }, [urgencySearchTerm, urgencyLevels, showInactiveUrgencyLevels]);
    
    // Filter roles based on search term
    useEffect(() => {
        const filterRoles = async () => {
            if (!rolesSearchTerm) {
                setFilteredRoles(roles);
            } else {
                try {
                    const filtered = await searchRoles(rolesSearchTerm, showInactiveRoles);
                    setFilteredRoles(filtered);
                } catch (err) {
                    // Fallback to client-side filtering if search fails
                    const filtered = roles.filter(r =>
                        r.name.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
                        r.key.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
                        r.description?.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
                        r.guidelines?.toLowerCase().includes(rolesSearchTerm.toLowerCase())
                    );
                    setFilteredRoles(filtered);
                }
            }
        };
        filterRoles();
    }, [rolesSearchTerm, roles, showInactiveRoles]);
    
    // Load matching algorithm configuration when tab is active
    useEffect(() => {
        if (activeTab === 'matching-algorithm') {
            const fetchMatchingConfig = async () => {
                try {
                    setMatchingLoading(true);
                    setError(null);
                    const config = await getMatchingAlgorithmConfig();
                    setMatchingConfig(config);
                    setEditingWeights({ ...config.weights });
                    setEditingThresholds({ ...config.thresholds });
                    setEditingPreferences({ ...config.preferences });
                    setEditingAutoMatching({ ...config.autoMatching });
                    const history = await getMatchingAlgorithmChangeHistory();
                    setMatchingHistory(history);
                } catch (err: any) {
                    setError(err.message || 'Failed to load matching algorithm configuration');
                } finally {
                    setMatchingLoading(false);
                }
            };
            fetchMatchingConfig();
        }
    }, [activeTab]);
    
    // Load system configuration when tab is active
    useEffect(() => {
        if (activeTab === 'system-config') {
            const fetchSystemConfig = async () => {
                try {
                    setSystemConfigLoading(true);
                    setError(null);
                    const config = await getSystemConfiguration();
                    setSystemConfig(config);
                    const history = await getSystemConfigurationChangeHistory();
                    setSystemConfigHistory(history);
                } catch (err: any) {
                    setError(err.message || 'Failed to load system configuration');
                } finally {
                    setSystemConfigLoading(false);
                }
            };
            fetchSystemConfig();
        }
    }, [activeTab]);
    
    // Initialize form states when systemConfig loads
    useEffect(() => {
        if (systemConfig) {
            setGeneralSettingsForm(systemConfig.generalSettings);
            setDonationLimitsForm(systemConfig.donationLimits);
            setRequestLimitsForm(systemConfig.requestLimits);
            setExpiryRulesForm(systemConfig.requestExpiryRules);
            setVerificationRulesForm(systemConfig.accountVerificationRules);
            setImageSettingsForm(systemConfig.imageUploadSettings);
            setExportSettingsForm(systemConfig.exportSettings);
            setPaginationSettingsForm(systemConfig.paginationSettings);
            setFeatureFlagsForm(systemConfig.featureFlags);
            setBusinessRulesForm(systemConfig.businessRules);
        }
    }, [systemConfig]);
    
    // Redirect non-admin users
    if (user?.role !== 'admin') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 text-red-800 p-4 rounded-md">
                    <p className="font-semibold">Access Denied</p>
                    <p>You must be an admin to access Master Data Management.</p>
                </div>
            </div>
        );
    }
    
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            const newCategory = await createCategory(formData, user.name);
            setSuccess(`Category "${newCategory.name}" created successfully!`);
            setIsCreatingCategory(false);
            resetForm();
            fetchCategories();
            // Auto-dismiss success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to create category. Please try again.');
            // Auto-dismiss error message after 7 seconds
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !editingCategory) return;
        
        try {
            setError(null);
            setSuccess(null);
            const updates = {
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                color: formData.color,
                parentId: formData.parentId,
                isActive: formData.isActive,
                displayOrder: formData.displayOrder,
                guidelines: formData.guidelines,
                customFields: formData.customFields,
            };
            await updateCategory(editingCategory.id, updates, user.name);
            setSuccess(`Category "${formData.name}" updated successfully!`);
            setEditingCategory(null);
            resetForm();
            fetchCategories();
            // Auto-dismiss success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update category. Please try again.');
            // Auto-dismiss error message after 7 seconds
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleDeleteCategory = async (id: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await deleteCategory(id, user.name);
            setSuccess('Category deleted successfully!');
            fetchCategories();
            // Auto-dismiss success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete category. Please try again.');
            // Auto-dismiss error message after 7 seconds
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleToggleCategoryStatus = async (id: string, isActive: boolean) => {
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            if (isActive) {
                await deactivateCategory(id, user.name);
                setSuccess('Category deactivated successfully!');
            } else {
                await activateCategory(id, user.name);
                setSuccess('Category activated successfully!');
            }
            fetchCategories();
            // Auto-dismiss success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update category status. Please try again.');
            // Auto-dismiss error message after 7 seconds
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleBulkToggleStatus = async (isActive: boolean) => {
        if (!user || selectedCategories.size === 0) return;
        
        if (!confirm(`Are you sure you want to ${isActive ? 'activate' : 'deactivate'} ${selectedCategories.size} categories?`)) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await bulkUpdateCategoryStatus(Array.from(selectedCategories), isActive, user.name);
            setSuccess(`${selectedCategories.size} categories ${isActive ? 'activated' : 'deactivated'} successfully!`);
            setSelectedCategories(new Set());
            fetchCategories();
            // Auto-dismiss success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update categories. Please try again.');
            // Auto-dismiss error message after 7 seconds
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleEditCategory = async (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '📦',
            color: category.color || 'bg-teal-500',
            parentId: category.parentId,
            isActive: category.isActive,
            displayOrder: category.displayOrder,
            guidelines: category.guidelines || '',
        });
        setIsCreatingCategory(false);
        
        // Fetch available parent categories (excluding current category and its descendants)
        await fetchParentCategories(category.id);
    };
    
    const handleViewHistory = async (categoryId: string) => {
        try {
            const history = await getCategoryChangeHistory(categoryId);
            setCategoryHistory(history);
            setHistoryCategoryId(categoryId);
            setShowHistory(true);
        } catch (err) {
            setError('Failed to load category history.');
        }
    };
    
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            icon: '📦',
            color: 'bg-teal-500',
            parentId: undefined,
            isActive: true,
            displayOrder: (categories.length || 0) + 1,
            guidelines: '',
            customFields: [],
        });
        setEditingCategory(null);
    };
    
    const resetCustomFieldForm = () => {
        setCustomFieldFormData({
            id: '',
            label: '',
            type: 'text',
            required: false,
            displayOrder: formData.customFields?.length || 0,
            visibleForDonations: true,
            visibleForRequests: true,
        });
        setEditingCustomField(null);
    };
    
    const generateFieldId = (label: string): string => {
        return label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };
    
    const handleAddCustomField = () => {
        resetCustomFieldForm();
        setShowCustomFieldsEditor(true);
    };
    
    const handleEditCustomField = (field: CustomFieldDefinition) => {
        setEditingCustomField(field);
        setCustomFieldFormData({ ...field });
        setShowCustomFieldsEditor(true);
    };
    
    const handleSaveCustomField = () => {
        if (!customFieldFormData.label || !customFieldFormData.type) {
            setError('Field label and type are required.');
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        const fieldId = customFieldFormData.id || generateFieldId(customFieldFormData.label);
        
        // Check if field ID already exists (excluding current editing field)
        const existingField = formData.customFields?.find(f => f.id === fieldId && f.id !== editingCustomField?.id);
        if (existingField) {
            setError(`Field with ID "${fieldId}" already exists. Please use a different label.`);
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        const newField: CustomFieldDefinition = {
            id: fieldId,
            label: customFieldFormData.label,
            type: customFieldFormData.type as CustomFieldType,
            required: customFieldFormData.required || false,
            placeholder: customFieldFormData.placeholder,
            helpText: customFieldFormData.helpText,
            defaultValue: customFieldFormData.defaultValue,
            validation: customFieldFormData.validation,
            options: customFieldFormData.options,
            displayOrder: customFieldFormData.displayOrder || (formData.customFields?.length || 0),
            visibleForDonations: customFieldFormData.visibleForDonations !== false,
            visibleForRequests: customFieldFormData.visibleForRequests !== false,
        };
        
        const updatedFields = [...(formData.customFields || [])];
        
        if (editingCustomField) {
            const index = updatedFields.findIndex(f => f.id === editingCustomField.id);
            if (index !== -1) {
                updatedFields[index] = newField;
            }
        } else {
            updatedFields.push(newField);
        }
        
        // Sort by display order
        updatedFields.sort((a, b) => a.displayOrder - b.displayOrder);
        
        setFormData({ ...formData, customFields: updatedFields });
        setShowCustomFieldsEditor(false);
        resetCustomFieldForm();
    };
    
    const handleDeleteCustomField = (fieldId: string) => {
        if (window.confirm('Are you sure you want to delete this custom field?')) {
            const updatedFields = (formData.customFields || []).filter(f => f.id !== fieldId);
            setFormData({ ...formData, customFields: updatedFields });
        }
    };
    
    const handleMoveCustomField = (fieldId: string, direction: 'up' | 'down') => {
        const fields = [...(formData.customFields || [])];
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fields.length) return;
        
        [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
        fields[index].displayOrder = index;
        fields[newIndex].displayOrder = newIndex;
        
        setFormData({ ...formData, customFields: fields });
    };
    
    const handleSelectCategory = (id: string) => {
        const newSelected = new Set(selectedCategories);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedCategories(newSelected);
    };
    
    const handleSelectAll = () => {
        if (selectedCategories.size === filteredCategories.length) {
            setSelectedCategories(new Set());
        } else {
            setSelectedCategories(new Set(filteredCategories.map(cat => cat.id)));
        }
    };
    
    // Status Types Handlers
    const handleCreateStatusType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            const newStatus = await createStatusType(statusFormData, user.name);
            setSuccess(`Status "${newStatus.name}" created successfully!`);
            setIsCreatingStatusType(false);
            resetStatusForm();
            fetchStatusTypes();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to create status type. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleUpdateStatusType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !editingStatusType) return;
        
        try {
            setError(null);
            setSuccess(null);
            const updates = {
                name: statusFormData.name,
                description: statusFormData.description,
                icon: statusFormData.icon,
                color: statusFormData.color,
                isActive: statusFormData.isActive,
                isTerminal: statusFormData.isTerminal,
                displayOrder: statusFormData.displayOrder,
                guidelines: statusFormData.guidelines,
            };
            await updateStatusType(editingStatusType.id, updates, user.name);
            setSuccess(`Status "${statusFormData.name}" updated successfully!`);
            setEditingStatusType(null);
            resetStatusForm();
            fetchStatusTypes();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update status type. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleDeleteStatusType = async (id: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete this status type? This action cannot be undone.')) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await deleteStatusType(id, user.name);
            setSuccess('Status type deleted successfully!');
            fetchStatusTypes();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete status type. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleToggleStatusTypeStatus = async (id: string, isActive: boolean) => {
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            if (isActive) {
                await deactivateStatusType(id, user.name);
                setSuccess('Status type deactivated successfully!');
            } else {
                await activateStatusType(id, user.name);
                setSuccess('Status type activated successfully!');
            }
            fetchStatusTypes();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update status type status. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleBulkToggleStatusTypeStatus = async (isActive: boolean) => {
        if (!user || selectedStatusTypes.size === 0) return;
        
        if (!confirm(`Are you sure you want to ${isActive ? 'activate' : 'deactivate'} ${selectedStatusTypes.size} status types?`)) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await bulkUpdateStatusTypeStatus(Array.from(selectedStatusTypes), isActive, user.name);
            setSuccess(`${selectedStatusTypes.size} status types ${isActive ? 'activated' : 'deactivated'} successfully!`);
            setSelectedStatusTypes(new Set());
            fetchStatusTypes();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update status types. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleEditStatusType = (status: StatusType) => {
        setEditingStatusType(status);
        setStatusFormData({
            name: status.name,
            description: status.description || '',
            category: status.category,
            icon: status.icon || '⏳',
            color: status.color || 'bg-yellow-500',
            isActive: status.isActive,
            isTerminal: status.isTerminal,
            displayOrder: status.displayOrder,
            guidelines: status.guidelines || '',
            allowedTransitions: status.allowedTransitions || [],
        });
        setIsCreatingStatusType(false);
    };
    
    const handleViewStatusHistory = async (statusId: string) => {
        try {
            const history = await getStatusChangeHistory(statusId);
            setStatusHistory(history);
            setHistoryStatusId(statusId);
            setShowStatusHistory(true);
        } catch (err) {
            setError('Failed to load status history.');
        }
    };
    
    const handleViewWorkflow = async (statusId: string) => {
        try {
            const status = await getStatusTypeById(statusId);
            setEditingStatusType(status);
            setStatusFormData({
                name: status.name,
                description: status.description || '',
                category: status.category,
                icon: status.icon || '⏳',
                color: status.color || 'bg-yellow-500',
                isActive: status.isActive,
                isTerminal: status.isTerminal,
                displayOrder: status.displayOrder,
                guidelines: status.guidelines || '',
                allowedTransitions: status.allowedTransitions || [],
            });
            setWorkflowStatusId(statusId);
            setShowWorkflowModal(true);
        } catch (err) {
            setError('Failed to load status workflow.');
        }
    };
    
    const handleUpdateWorkflow = async () => {
        if (!user || !workflowStatusId) return;
        
        try {
            setError(null);
            setSuccess(null);
            await updateStatusWorkflow(workflowStatusId, statusFormData.allowedTransitions, user.name);
            setSuccess('Status workflow updated successfully!');
            setShowWorkflowModal(false);
            setWorkflowStatusId(null);
            fetchStatusTypes();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update status workflow. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const resetStatusForm = () => {
        const defaultCategory = 'donation';
        setStatusFormData({
            name: '',
            category: defaultCategory,
            description: '',
            icon: '⏳',
            color: 'bg-yellow-500',
            isActive: true,
            isTerminal: false,
            displayOrder: (statusTypes.filter(s => s.category === defaultCategory).length || 0) + 1,
            guidelines: '',
            allowedTransitions: [],
        });
        setEditingStatusType(null);
    };
    
    // Bulk update urgency scoring weights
    const handleBulkUpdateScoringWeights = async () => {
        if (!user || filteredUrgencyLevels.length === 0) return;
        
        if (!confirm('This will update scoring weights for all urgency levels. Continue?')) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            const weights = filteredUrgencyLevels.map(ul => ({
                id: ul.id,
                scoringWeight: ul.scoringWeight,
            }));
            await updateUrgencyScoringWeights(weights, user.name);
            setSuccess('Scoring weights updated successfully!');
            fetchUrgencyLevels();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update scoring weights. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    // Reorder categories
    const handleReorderCategories = async (categoryIds: string[]) => {
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            const orders = categoryIds.map((id, index) => ({
                id,
                displayOrder: index + 1,
            }));
            await reorderCategories(orders, user.name);
            setSuccess('Categories reordered successfully!');
            fetchCategories();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to reorder categories. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    // Reorder urgency levels
    const handleReorderUrgencyLevels = async (urgencyIds: string[]) => {
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            const orders = urgencyIds.map((id, index) => ({
                id,
                displayOrder: index + 1,
            }));
            await reorderUrgencyLevels(orders, user.name);
            setSuccess('Urgency levels reordered successfully!');
            fetchUrgencyLevels();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to reorder urgency levels. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    // Move category up/down
    const handleMoveCategory = (categoryId: string, direction: 'up' | 'down') => {
        const sortedCategories = [...filteredCategories].sort((a, b) => a.displayOrder - b.displayOrder);
        const currentIndex = sortedCategories.findIndex(c => c.id === categoryId);
        
        if (direction === 'up' && currentIndex > 0) {
            const newOrder = [...sortedCategories];
            [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
            handleReorderCategories(newOrder.map(c => c.id));
        } else if (direction === 'down' && currentIndex < sortedCategories.length - 1) {
            const newOrder = [...sortedCategories];
            [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
            handleReorderCategories(newOrder.map(c => c.id));
        }
    };
    
    // Move urgency level up/down
    const handleMoveUrgencyLevel = (urgencyId: string, direction: 'up' | 'down') => {
        const sortedUrgencyLevels = [...filteredUrgencyLevels].sort((a, b) => a.displayOrder - b.displayOrder);
        const currentIndex = sortedUrgencyLevels.findIndex(ul => ul.id === urgencyId);
        
        if (direction === 'up' && currentIndex > 0) {
            const newOrder = [...sortedUrgencyLevels];
            [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
            handleReorderUrgencyLevels(newOrder.map(ul => ul.id));
        } else if (direction === 'down' && currentIndex < sortedUrgencyLevels.length - 1) {
            const newOrder = [...sortedUrgencyLevels];
            [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
            handleReorderUrgencyLevels(newOrder.map(ul => ul.id));
        }
    };
    
    const handleSelectStatusType = (id: string) => {
        const newSelected = new Set(selectedStatusTypes);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStatusTypes(newSelected);
    };
    
    const handleSelectAllStatusTypes = () => {
        if (selectedStatusTypes.size === filteredStatusTypes.length) {
            setSelectedStatusTypes(new Set());
        } else {
            setSelectedStatusTypes(new Set(filteredStatusTypes.map(s => s.id)));
        }
    };
    
    // Urgency Levels Handlers
    const handleCreateUrgencyLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            const newUrgency = await createUrgencyLevel(urgencyFormData, user.name);
            setSuccess(`Urgency level "${newUrgency.name}" created successfully!`);
            setIsCreatingUrgencyLevel(false);
            resetUrgencyForm();
            fetchUrgencyLevels();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to create urgency level. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleUpdateUrgencyLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !editingUrgencyLevel) return;
        
        try {
            setError(null);
            setSuccess(null);
            const updates = {
                name: urgencyFormData.name,
                key: urgencyFormData.key,
                description: urgencyFormData.description,
                icon: urgencyFormData.icon,
                color: urgencyFormData.color,
                isActive: urgencyFormData.isActive,
                displayOrder: urgencyFormData.displayOrder,
                scoringWeight: urgencyFormData.scoringWeight,
                expirationDays: urgencyFormData.expirationDays,
                notificationRules: urgencyFormData.notificationRules,
                guidelines: urgencyFormData.guidelines,
            };
            await updateUrgencyLevel(editingUrgencyLevel.id, updates, user.name);
            setSuccess(`Urgency level "${urgencyFormData.name}" updated successfully!`);
            setEditingUrgencyLevel(null);
            resetUrgencyForm();
            fetchUrgencyLevels();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update urgency level. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleDeleteUrgencyLevel = async (id: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete this urgency level? This action cannot be undone.')) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await deleteUrgencyLevel(id, user.name);
            setSuccess('Urgency level deleted successfully!');
            fetchUrgencyLevels();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete urgency level. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleToggleUrgencyLevelStatus = async (id: string, isActive: boolean) => {
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            if (isActive) {
                await deactivateUrgencyLevel(id, user.name);
                setSuccess('Urgency level deactivated successfully!');
            } else {
                await activateUrgencyLevel(id, user.name);
                setSuccess('Urgency level activated successfully!');
            }
            fetchUrgencyLevels();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update urgency level status. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleBulkToggleUrgencyLevelStatus = async (isActive: boolean) => {
        if (!user || selectedUrgencyLevels.size === 0) return;
        
        if (!confirm(`Are you sure you want to ${isActive ? 'activate' : 'deactivate'} ${selectedUrgencyLevels.size} urgency levels?`)) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await bulkUpdateUrgencyLevelStatus(Array.from(selectedUrgencyLevels), isActive, user.name);
            setSuccess(`${selectedUrgencyLevels.size} urgency levels ${isActive ? 'activated' : 'deactivated'} successfully!`);
            setSelectedUrgencyLevels(new Set());
            fetchUrgencyLevels();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update urgency levels. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleEditUrgencyLevel = (urgency: UrgencyLevel) => {
        setEditingUrgencyLevel(urgency);
        setUrgencyFormData({
            name: urgency.name,
            key: urgency.key,
            description: urgency.description || '',
            icon: urgency.icon || '⚠️',
            color: urgency.color || 'bg-orange-500',
            isActive: urgency.isActive,
            displayOrder: urgency.displayOrder,
            scoringWeight: urgency.scoringWeight,
            expirationDays: urgency.expirationDays,
            notificationRules: urgency.notificationRules || {
                immediate: false,
                notifyAdmins: true,
                notifyDonors: false,
                escalationDelay: 72,
            },
            guidelines: urgency.guidelines || '',
        });
        setIsCreatingUrgencyLevel(false);
    };
    
    const handleViewUrgencyHistory = async (urgencyId: string) => {
        try {
            const history = await getUrgencyLevelChangeHistory(urgencyId);
            setUrgencyHistory(history);
            setHistoryUrgencyId(urgencyId);
            setShowUrgencyHistory(true);
        } catch (err) {
            setError('Failed to load urgency level history.');
        }
    };
    
    const resetUrgencyForm = () => {
        setUrgencyFormData({
            name: '',
            key: '',
            description: '',
            icon: '⚠️',
            color: 'bg-orange-500',
            isActive: true,
            displayOrder: (urgencyLevels.length || 0) + 1,
            scoringWeight: 10,
            expirationDays: undefined,
            notificationRules: {
                immediate: false,
                notifyAdmins: true,
                notifyDonors: false,
                escalationDelay: 72,
            },
            guidelines: '',
        });
        setEditingUrgencyLevel(null);
    };
    
    const handleSelectUrgencyLevel = (id: string) => {
        const newSelected = new Set(selectedUrgencyLevels);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedUrgencyLevels(newSelected);
    };
    
    const handleSelectAllUrgencyLevels = () => {
        if (selectedUrgencyLevels.size === filteredUrgencyLevels.length) {
            setSelectedUrgencyLevels(new Set());
        } else {
            setSelectedUrgencyLevels(new Set(filteredUrgencyLevels.map(ul => ul.id)));
        }
    };
    
    // Roles & Permissions Handlers
    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            const newRole = await createRole(roleFormData, user.name);
            setSuccess(`Role "${newRole.name}" created successfully!`);
            setIsCreatingRole(false);
            resetRoleForm();
            fetchRoles();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to create role. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !editingRole) return;
        
        // Prevent editing default system roles completely
        if (editingRole.isSystemRole && editingRole.isDefault) {
            setError('Default system roles cannot be edited. Use the Permission Matrix button to modify permissions only.');
            setTimeout(() => setError(null), 7000);
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            const updates: Partial<Role> = {
                name: roleFormData.name,
                description: roleFormData.description,
                icon: roleFormData.icon,
                color: roleFormData.color,
                isActive: roleFormData.isActive,
                displayOrder: roleFormData.displayOrder,
                permissions: roleFormData.permissions,
                parentRoleId: roleFormData.parentRoleId,
                featureAccess: roleFormData.featureAccess,
                restrictions: roleFormData.restrictions,
                guidelines: roleFormData.guidelines,
            };
            
            // Only update key if it's not a system role or if it hasn't changed
            if (!editingRole.isSystemRole || roleFormData.key === editingRole.key) {
                updates.key = roleFormData.key;
            }
            
            await updateRole(editingRole.id, updates, user.name);
            setSuccess(`Role "${roleFormData.name}" updated successfully!`);
            setEditingRole(null);
            resetRoleForm();
            fetchRoles();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update role. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleDeleteRole = async (id: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await deleteRole(id, user.name);
            setSuccess('Role deleted successfully!');
            fetchRoles();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete role. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleToggleRoleStatus = async (id: string, isActive: boolean) => {
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            if (isActive) {
                await deactivateRole(id, user.name);
                setSuccess('Role deactivated successfully!');
            } else {
                await activateRole(id, user.name);
                setSuccess('Role activated successfully!');
            }
            fetchRoles();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update role status. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleBulkToggleRoleStatus = async (isActive: boolean) => {
        if (!user || selectedRoles.size === 0) return;
        
        if (!confirm(`Are you sure you want to ${isActive ? 'activate' : 'deactivate'} ${selectedRoles.size} roles?`)) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            const updates = Array.from(selectedRoles).map(async (roleId: string) => {
                if (isActive) {
                    await activateRole(roleId, user.name);
                } else {
                    await deactivateRole(roleId, user.name);
                }
            });
            await Promise.all(updates);
            setSuccess(`${selectedRoles.size} roles ${isActive ? 'activated' : 'deactivated'} successfully!`);
            setSelectedRoles(new Set());
            fetchRoles();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update roles. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleEditRole = (role: Role) => {
        // Prevent editing system roles (they should use permission matrix instead for permission changes)
        if (role.isSystemRole && role.isDefault) {
            setError('System roles cannot be edited. You can modify permissions via the Permission Matrix button.');
            setTimeout(() => setError(null), 7000);
            return;
        }
        
        setEditingRole(role);
        setIsCreatingRole(false);
        setRoleFormData({
            name: role.name,
            key: role.key,
            description: role.description || '',
            icon: role.icon || '👤',
            color: role.color || 'bg-gray-500',
            isActive: role.isActive,
            displayOrder: role.displayOrder,
            permissions: role.permissions || [],
            parentRoleId: role.parentRoleId,
            featureAccess: role.featureAccess,
            restrictions: role.restrictions || {},
            guidelines: role.guidelines || '',
        });
        
        // Scroll to form
        setTimeout(() => {
            const formElement = document.querySelector('[data-role-form]');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };
    
    const handleViewRoleHistory = async (roleId: string) => {
        try {
            const history = await getRoleChangeHistory(roleId);
            setRoleHistory(history);
            setHistoryRoleId(roleId);
            setShowRoleHistory(true);
        } catch (err) {
            setError('Failed to load role history.');
        }
    };
    
    const handleViewPermissionMatrix = async (roleId: string) => {
        try {
            // Ensure permissions are loaded before opening matrix
            if (permissions.length === 0) {
                try {
                    const permissionsData = await getPermissions();
                    setPermissions(permissionsData);
                } catch (permErr) {
                    setError('Failed to load permissions. Please try again.');
                    setTimeout(() => setError(null), 7000);
                    return;
                }
            }
            
            // If it's a new role (not saved), use form data
            if (roleId === 'new-role') {
                setMatrixRoleId(roleId);
                setMatrixPermissions([...roleFormData.permissions]);
                setShowPermissionMatrix(true);
                return;
            }
            
            // Load existing role
            const role = await getRoleById(roleId);
            setMatrixRoleId(roleId);
            setMatrixPermissions([...role.permissions]);
            setShowPermissionMatrix(true);
        } catch (err) {
            setError('Failed to load permission matrix.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleSavePermissionMatrix = async () => {
        if (!user || !matrixRoleId) return;
        
        try {
            setError(null);
            setSuccess(null);
            
            // If editing a new role (not saved yet), update the form data instead
            if (matrixRoleId === 'new-role') {
                setRoleFormData({ ...roleFormData, permissions: matrixPermissions });
                setSuccess('Permissions updated in form. Save the role to apply changes.');
                setShowPermissionMatrix(false);
                setMatrixRoleId(null);
                setMatrixPermissions([]);
                setTimeout(() => setSuccess(null), 5000);
                return;
            }
            
            // Update existing role permissions
            await updateRolePermissions(matrixRoleId, matrixPermissions, user.name);
            setSuccess('Role permissions updated successfully!');
            setShowPermissionMatrix(false);
            setMatrixRoleId(null);
            setMatrixPermissions([]);
            
            // If editing in the form, update the form data too
            if (editingRole && matrixRoleId === editingRole.id) {
                setRoleFormData({ ...roleFormData, permissions: matrixPermissions });
            }
            
            fetchRoles();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update role permissions. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleToggleMatrixPermission = (permissionId: string) => {
        if (matrixPermissions.includes(permissionId)) {
            setMatrixPermissions(matrixPermissions.filter(id => id !== permissionId));
        } else {
            setMatrixPermissions([...matrixPermissions, permissionId]);
        }
    };
    
    // Select all permissions for a resource in permission matrix
    const handleSelectAllResourcePermissions = (resource: PermissionResource) => {
        const resourcePermissions = permissions
            .filter(p => p.resource === resource)
            .map(p => p.id);
        const allSelected = resourcePermissions.every(id => matrixPermissions.includes(id));
        
        if (allSelected) {
            // Deselect all permissions for this resource
            setMatrixPermissions(matrixPermissions.filter(id => !resourcePermissions.includes(id)));
        } else {
            // Select all permissions for this resource
            const newPermissions = [...new Set([...matrixPermissions, ...resourcePermissions])];
            setMatrixPermissions(newPermissions);
        }
    };
    
    // Select permissions by category in permission matrix
    const handleSelectCategoryPermissions = (category: 'data' | 'admin' | 'system' | 'reporting') => {
        const categoryPermissions = permissions
            .filter(p => p.category === category)
            .map(p => p.id);
        const allSelected = categoryPermissions.every(id => matrixPermissions.includes(id));
        
        if (allSelected) {
            // Deselect all permissions for this category
            setMatrixPermissions(matrixPermissions.filter(id => !categoryPermissions.includes(id)));
        } else {
            // Select all permissions for this category
            const newPermissions = [...new Set([...matrixPermissions, ...categoryPermissions])];
            setMatrixPermissions(newPermissions);
        }
    };
    
    const resetRoleForm = () => {
        setRoleFormData({
            name: '',
            key: '',
            description: '',
            icon: '👤',
            color: 'bg-gray-500',
            isActive: true,
            displayOrder: (roles.length || 0) + 1,
            permissions: [],
            parentRoleId: undefined,
            featureAccess: {
                dashboard: true,
                donations: false,
                requests: false,
                matching: false,
                analytics: false,
                masterData: false,
                donorManagement: false,
                recipientManagement: false,
                settings: false,
            },
            restrictions: {},
            guidelines: '',
        });
        setEditingRole(null);
    };
    
    const handleSelectRole = (id: string) => {
        const newSelected = new Set(selectedRoles);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRoles(newSelected);
    };
    
    const handleSelectAllRoles = () => {
        if (selectedRoles.size === filteredRoles.length) {
            setSelectedRoles(new Set());
        } else {
            setSelectedRoles(new Set(filteredRoles.map(r => r.id)));
        }
    };
    
    const roleIcons = ['👑', '💝', '🙋', '🛡️', '👤', '👮', '📊', '⚙️', '🎯', '🔐'];
    
    const renderCategoriesTab = () => (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-500">Total Categories</p>
                        <p className="text-2xl font-bold text-gray-900">{statistics.totalCategories}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-500">Active Categories</p>
                        <p className="text-2xl font-bold text-green-600">{statistics.activeCategories}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-500">Total Donations</p>
                        <p className="text-2xl font-bold text-teal-600">{statistics.totalDonations}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-500">Total Requests</p>
                        <p className="text-2xl font-bold text-blue-600">{statistics.totalRequests}</p>
                    </div>
                </div>
            )}
            
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search categories by name, description, or guidelines..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => {
                                    setShowInactive(e.target.checked);
                                    fetchCategories();
                                }}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">Show Inactive</span>
                        </label>
                        <button
                            onClick={() => {
                                setIsCreatingCategory(true);
                                setEditingCategory(null);
                                resetForm();
                                fetchParentCategories();
                            }}
                            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                        >
                            + Create Category
                        </button>
                        <button
                            onClick={() => setShowHierarchyView(!showHierarchyView)}
                            className={`px-4 py-2 rounded-md transition ${
                                showHierarchyView
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="Toggle hierarchical view"
                        >
                            {showHierarchyView ? '📊 List View' : '🌳 Hierarchy View'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedCategories.size > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
                    <p className="text-sm text-teal-800">
                        {selectedCategories.size} categor{selectedCategories.size === 1 ? 'y' : 'ies'} selected
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkToggleStatus(true)}
                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm"
                        >
                            Activate
                        </button>
                        <button
                            onClick={() => handleBulkToggleStatus(false)}
                            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm"
                        >
                            Deactivate
                        </button>
                        <button
                            onClick={() => setSelectedCategories(new Set())}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition text-sm"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}
            
            {/* Create/Edit Category Form */}
            {(isCreatingCategory || editingCategory) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h3>
                    <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    min="0"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Icon
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categoryIcons.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`p-2 rounded-md text-2xl ${
                                                formData.icon === icon
                                                    ? 'ring-2 ring-teal-500 bg-teal-50'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categoryColors.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`w-10 h-10 rounded-md ${color.value} ${
                                                formData.color === color.value
                                                    ? 'ring-2 ring-teal-500 ring-offset-2'
                                                    : ''
                                            }`}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Guidelines
                            </label>
                            <textarea
                                value={formData.guidelines}
                                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                                rows={4}
                                placeholder="Guidelines for donations/requests in this category..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        
                        {/* Custom Fields Section */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Custom Fields & Requirements</h4>
                                <button
                                    type="button"
                                    onClick={handleAddCustomField}
                                    className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm"
                                >
                                    + Add Custom Field
                                </button>
                            </div>
                            
                            {formData.customFields && formData.customFields.length > 0 ? (
                                <div className="space-y-2 mb-4">
                                    {formData.customFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{field.label}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        field.required
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {field.required ? 'Required' : 'Optional'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">({field.type})</span>
                                                    {field.visibleForDonations && (
                                                        <span className="text-xs text-blue-600">Donations</span>
                                                    )}
                                                    {field.visibleForRequests && (
                                                        <span className="text-xs text-green-600">Requests</span>
                                                    )}
                                                </div>
                                                {field.helpText && (
                                                    <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveCustomField(field.id, 'up')}
                                                    className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                                                    title="Move Up"
                                                    disabled={index === 0}
                                                >
                                                    ⬆️
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveCustomField(field.id, 'down')}
                                                    className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                                                    title="Move Down"
                                                    disabled={index === (formData.customFields?.length || 0) - 1}
                                                >
                                                    ⬇️
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditCustomField(field)}
                                                    className="text-teal-600 hover:text-teal-900"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCustomField(field.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4">No custom fields defined. Add custom fields to collect additional information for donations/requests in this category.</p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                            >
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingCategory(false);
                                    setEditingCategory(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Categories List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No categories found.</p>
                </div>
            ) : showHierarchyView ? (
                // Hierarchical Tree View
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 sm:p-6">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Category Hierarchy</h4>
                        {renderCategoryTree(filteredCategories)}
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.size === filteredCategories.length && filteredCategories.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parent Category
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage Statistics
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Display Order
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reorder
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.has(category.id)}
                                                onChange={() => handleSelectCategory(category.id)}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {category.parentId && (
                                                    <span className="text-gray-400 text-sm" title="Child category">└</span>
                                                )}
                                                <span className="text-2xl">{category.icon}</span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-block w-3 h-3 rounded-full ${category.color}`}></span>
                                                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                                        {category.parentId && (
                                                            <span className="text-xs text-gray-500">(Child)</span>
                                                        )}
                                                    </div>
                                                    {category.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {category.parentId ? (
                                                (() => {
                                                    const parent = categories.find(c => c.id === category.parentId);
                                                    return parent ? (
                                                        <div className="flex items-center gap-2">
                                                            <span>{parent.icon}</span>
                                                            <span>{parent.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Unknown</span>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-gray-400 italic">None (Top-level)</span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div>Donations: <span className="font-medium">{category.usageStatistics.donationCount}</span></div>
                                                <div>Requests: <span className="font-medium">{category.usageStatistics.requestCount}</span></div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                category.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {category.displayOrder}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleMoveCategory(category.id, 'up')}
                                                    className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="Move Up"
                                                    disabled={
                                                        filteredCategories
                                                            .sort((a, b) => a.displayOrder - b.displayOrder)
                                                            .findIndex(c => c.id === category.id) === 0
                                                    }
                                                >
                                                    ⬆️
                                                </button>
                                                <button
                                                    onClick={() => handleMoveCategory(category.id, 'down')}
                                                    className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="Move Down"
                                                    disabled={
                                                        filteredCategories
                                                            .sort((a, b) => a.displayOrder - b.displayOrder)
                                                            .findIndex(c => c.id === category.id) === filteredCategories.length - 1
                                                    }
                                                >
                                                    ⬇️
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="text-teal-600 hover:text-teal-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleToggleCategoryStatus(category.id, category.isActive)}
                                                    className={`${category.isActive ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'} min-w-[44px] min-h-[44px] flex items-center justify-center`}
                                                    title={category.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {category.isActive ? '👁️' : '✅'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewHistory(category.id)}
                                                    className="text-blue-600 hover:text-blue-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="View History"
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="text-red-600 hover:text-red-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredCategories.map((category) => {
                            const parent = category.parentId ? categories.find(c => c.id === category.parentId) : null;
                            return (
                                <div key={category.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.has(category.id)}
                                                onChange={() => handleSelectCategory(category.id)}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1 flex-shrink-0"
                                            />
                                            {category.parentId && (
                                                <span className="text-gray-400 text-sm flex-shrink-0" title="Child category">└</span>
                                            )}
                                            <span className="text-xl sm:text-2xl flex-shrink-0">{category.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${category.color} flex-shrink-0`}></span>
                                                    <span className="text-sm font-semibold text-gray-900 truncate">{category.name}</span>
                                                    {category.parentId && (
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">(Child)</span>
                                                    )}
                                                </div>
                                                {category.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Parent Category</span>
                                            {parent ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-base">{parent.icon}</span>
                                                    <span className="text-gray-900 text-xs truncate">{parent.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">None (Top-level)</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Status</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                category.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Display Order</span>
                                            <span className="text-gray-900 text-xs font-medium">{category.displayOrder}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Usage</span>
                                            <div className="text-xs text-gray-900">
                                                <div>Donations: <span className="font-medium">{category.usageStatistics.donationCount}</span></div>
                                                <div>Requests: <span className="font-medium">{category.usageStatistics.requestCount}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <button
                                                onClick={() => handleEditCategory(category)}
                                                className="px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-md text-sm font-medium min-h-[44px]"
                                                title="Edit"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleCategoryStatus(category.id, category.isActive)}
                                                className={`px-3 py-2 rounded-md text-sm font-medium min-h-[44px] ${
                                                    category.isActive 
                                                        ? 'text-gray-600 hover:bg-gray-50' 
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={category.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {category.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleViewHistory(category.id)}
                                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium min-h-[44px]"
                                                title="View History"
                                            >
                                                History
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium min-h-[44px]"
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleMoveCategory(category.id, 'up')}
                                                className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium disabled:text-gray-300 disabled:cursor-not-allowed min-h-[44px]"
                                                title="Move Up"
                                                disabled={
                                                    filteredCategories
                                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                                        .findIndex(c => c.id === category.id) === 0
                                                }
                                            >
                                                ⬆️ Move Up
                                            </button>
                                            <button
                                                onClick={() => handleMoveCategory(category.id, 'down')}
                                                className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium disabled:text-gray-300 disabled:cursor-not-allowed min-h-[44px]"
                                                title="Move Down"
                                                disabled={
                                                    filteredCategories
                                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                                        .findIndex(c => c.id === category.id) === filteredCategories.length - 1
                                                }
                                            >
                                                ⬇️ Move Down
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            
            {/* Custom Fields Editor Modal */}
            {showCustomFieldsEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingCustomField ? 'Edit Custom Field' : 'Add Custom Field'}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Field Label *
                                    </label>
                                    <input
                                        type="text"
                                        value={customFieldFormData.label || ''}
                                        onChange={(e) => {
                                            const label = e.target.value;
                                            setCustomFieldFormData({
                                                ...customFieldFormData,
                                                label,
                                                id: editingCustomField?.id || generateFieldId(label),
                                            });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="e.g., Size, Expiration Date"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Field ID: {customFieldFormData.id || 'auto-generated'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Field Type *
                                    </label>
                                    <select
                                        value={customFieldFormData.type || 'text'}
                                        onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, type: e.target.value as CustomFieldType })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="textarea">Textarea</option>
                                        <option value="select">Select (Single)</option>
                                        <option value="multiselect">Multi-Select</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="date">Date</option>
                                        <option value="email">Email</option>
                                        <option value="url">URL</option>
                                        <option value="tel">Phone</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Placeholder
                                    </label>
                                    <input
                                        type="text"
                                        value={customFieldFormData.placeholder || ''}
                                        onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, placeholder: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Enter placeholder text..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={customFieldFormData.displayOrder || 0}
                                        onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Help Text / Description
                                </label>
                                <textarea
                                    value={customFieldFormData.helpText || ''}
                                    onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, helpText: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Help text shown to users..."
                                />
                            </div>
                            
                            {/* Options for select/multiselect */}
                            {(customFieldFormData.type === 'select' || customFieldFormData.type === 'multiselect') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Options (one per line or comma-separated)
                                    </label>
                                    <textarea
                                        value={customFieldFormData.options?.map(opt => `${opt.value}:${opt.label}`).join('\n') || ''}
                                        onChange={(e) => {
                                            const lines = e.target.value.split('\n').filter(l => l.trim());
                                            const options = lines.map(line => {
                                                if (line.includes(':')) {
                                                    const [value, ...labelParts] = line.split(':');
                                                    return { value: value.trim(), label: labelParts.join(':').trim() };
                                                }
                                                return { value: line.trim(), label: line.trim() };
                                            });
                                            setCustomFieldFormData({ ...customFieldFormData, options: options.length > 0 ? options : undefined });
                                        }}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="small:Small\nmedium:Medium\nlarge:Large\nor\nSmall, Medium, Large"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format: value:label (one per line) or just value (one per line)
                                    </p>
                                </div>
                            )}
                            
                            {/* Validation Rules */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Validation Rules</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(customFieldFormData.type === 'text' || customFieldFormData.type === 'textarea' || customFieldFormData.type === 'number') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Min {customFieldFormData.type === 'number' ? 'Value' : 'Length'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={customFieldFormData.validation?.min || ''}
                                                    onChange={(e) => setCustomFieldFormData({
                                                        ...customFieldFormData,
                                                        validation: {
                                                            ...customFieldFormData.validation,
                                                            min: e.target.value ? parseFloat(e.target.value) : undefined,
                                                        },
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Max {customFieldFormData.type === 'number' ? 'Value' : 'Length'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={customFieldFormData.validation?.max || ''}
                                                    onChange={(e) => setCustomFieldFormData({
                                                        ...customFieldFormData,
                                                        validation: {
                                                            ...customFieldFormData.validation,
                                                            max: e.target.value ? parseFloat(e.target.value) : undefined,
                                                        },
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {customFieldFormData.type === 'date' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Min Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={customFieldFormData.validation?.minDate ? new Date(customFieldFormData.validation.minDate).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => setCustomFieldFormData({
                                                        ...customFieldFormData,
                                                        validation: {
                                                            ...customFieldFormData.validation,
                                                            minDate: e.target.value ? new Date(e.target.value) : undefined,
                                                        },
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Max Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={customFieldFormData.validation?.maxDate ? new Date(customFieldFormData.validation.maxDate).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => setCustomFieldFormData({
                                                        ...customFieldFormData,
                                                        validation: {
                                                            ...customFieldFormData.validation,
                                                            maxDate: e.target.value ? new Date(e.target.value) : undefined,
                                                        },
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {(customFieldFormData.type === 'text' || customFieldFormData.type === 'email' || customFieldFormData.type === 'url' || customFieldFormData.type === 'tel') && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pattern (Regex)
                                            </label>
                                            <input
                                                type="text"
                                                value={customFieldFormData.validation?.pattern || ''}
                                                onChange={(e) => setCustomFieldFormData({
                                                    ...customFieldFormData,
                                                    validation: {
                                                        ...customFieldFormData.validation,
                                                        pattern: e.target.value || undefined,
                                                    },
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="e.g., ^[A-Z0-9]+$"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Optional: Regular expression pattern for validation</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Default Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Default Value
                                </label>
                                {customFieldFormData.type === 'checkbox' ? (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={customFieldFormData.defaultValue === true}
                                            onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, defaultValue: e.target.checked })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">Checked by default</span>
                                    </label>
                                ) : (
                                    <input
                                        type={customFieldFormData.type === 'number' ? 'number' : 'text'}
                                        value={customFieldFormData.defaultValue?.toString() || ''}
                                        onChange={(e) => {
                                            let value: string | number = e.target.value;
                                            if (customFieldFormData.type === 'number') {
                                                value = e.target.value ? parseFloat(e.target.value) : undefined;
                                            }
                                            setCustomFieldFormData({ ...customFieldFormData, defaultValue: value || undefined });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Default value for this field..."
                                    />
                                )}
                            </div>
                            
                            {/* Visibility Settings */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Visibility Settings</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={customFieldFormData.visibleForDonations !== false}
                                            onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, visibleForDonations: e.target.checked })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">Show in Donation Forms</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={customFieldFormData.visibleForRequests !== false}
                                            onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, visibleForRequests: e.target.checked })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">Show in Request Forms</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Required Field */}
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={customFieldFormData.required || false}
                                        onChange={(e) => setCustomFieldFormData({ ...customFieldFormData, required: e.target.checked })}
                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Required Field</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Required fields must be filled in by users</p>
                            </div>
                            
                            <div className="flex gap-2 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleSaveCustomField}
                                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                                >
                                    {editingCustomField ? 'Update Field' : 'Add Field'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomFieldsEditor(false);
                                        resetCustomFieldForm();
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Category Change History</h3>
                            <button
                                onClick={() => {
                                    setShowHistory(false);
                                    setHistoryCategoryId(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            {categoryHistory.length === 0 ? (
                                <p className="text-gray-500">No change history available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {categoryHistory.map((history) => (
                                        <div key={history.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900 capitalize">{history.action}</p>
                                                    <p className="text-sm text-gray-500">
                                                        By {history.performedBy} on {new Date(history.performedAt).toLocaleString()}
                                                    </p>
                                                    {history.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
    const statusIcons = ['⏳', '✅', '❌', '📦', '🚚', '🎉', '🚫', '⏰', '📅', '🔄', '🔗', '🎯'];
    const statusTypeCategories: { value: StatusTypeCategory; label: string }[] = [
        { value: 'donation', label: 'Donation' },
        { value: 'request', label: 'Request' },
        { value: 'delivery', label: 'Delivery' },
        { value: 'verification', label: 'Verification' },
        { value: 'matching', label: 'Matching' },
    ];
    
    const urgencyIcons = ['🔥', '⚠️', '📋', '🚨', '⚡', '⏰', '📢', '🎯', '💡', '🔔'];
    
    const renderStatusTypesTab = () => {
        const currentWorkflowStatus = workflowStatusId ? statusTypes.find(s => s.id === workflowStatusId) : null;
        const availableStatusesForTransitions = currentWorkflowStatus
            ? statusTypes.filter(
                s => s.category === currentWorkflowStatus.category && 
                     s.id !== workflowStatusId && 
                     s.isActive
              )
            : [];
        
        return (
            <div className="space-y-6">
                {/* Statistics Cards */}
                {statusStatistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Total Statuses</p>
                            <p className="text-2xl font-bold text-gray-900">{statusStatistics.totalStatuses}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Active Statuses</p>
                            <p className="text-2xl font-bold text-green-600">{statusStatistics.activeStatuses}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Donation</p>
                            <p className="text-2xl font-bold text-blue-600">{statusStatistics.byCategory.donation}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Request</p>
                            <p className="text-2xl font-bold text-purple-600">{statusStatistics.byCategory.request}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Delivery</p>
                            <p className="text-2xl font-bold text-orange-600">{statusStatistics.byCategory.delivery}</p>
                        </div>
                    </div>
                )}
                
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search status types by name, description, or guidelines..."
                                value={statusSearchTerm}
                                onChange={(e) => setStatusSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={statusFilterCategory}
                                onChange={(e) => {
                                    setStatusFilterCategory(e.target.value as StatusTypeCategory | 'all');
                                    fetchStatusTypes();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="all">All Categories</option>
                                {statusTypeCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showInactiveStatuses}
                                    onChange={(e) => {
                                        setShowInactiveStatuses(e.target.checked);
                                        fetchStatusTypes();
                                    }}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Show Inactive</span>
                            </label>
                            <button
                                onClick={() => {
                                    setIsCreatingStatusType(true);
                                    setEditingStatusType(null);
                                    resetStatusForm();
                                }}
                                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                            >
                                + Create Status
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Bulk Actions */}
                {selectedStatusTypes.size > 0 && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-teal-800">
                            {selectedStatusTypes.size} status{selectedStatusTypes.size === 1 ? '' : 'es'} selected
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkToggleStatusTypeStatus(true)}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm"
                            >
                                Activate
                            </button>
                            <button
                                onClick={() => handleBulkToggleStatusTypeStatus(false)}
                                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm"
                            >
                                Deactivate
                            </button>
                            <button
                                onClick={() => setSelectedStatusTypes(new Set())}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition text-sm"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Create/Edit Status Type Form */}
                {(isCreatingStatusType || editingStatusType) && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingStatusType ? 'Edit Status Type' : 'Create New Status Type'}
                        </h3>
                        <form onSubmit={editingStatusType ? handleUpdateStatusType : handleCreateStatusType} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={statusFormData.name}
                                        onChange={(e) => setStatusFormData({ ...statusFormData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={statusFormData.category}
                                        onChange={(e) => {
                                            const category = e.target.value as StatusTypeCategory;
                                            setStatusFormData({
                                                ...statusFormData,
                                                category,
                                                displayOrder: (statusTypes.filter(s => s.category === category).length || 0) + 1,
                                            });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        required
                                        disabled={!!editingStatusType}
                                    >
                                        {statusTypeCategories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={statusFormData.description}
                                    onChange={(e) => setStatusFormData({ ...statusFormData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Icon
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {statusIcons.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setStatusFormData({ ...statusFormData, icon })}
                                                className={`p-2 rounded-md text-2xl ${
                                                    statusFormData.icon === icon
                                                        ? 'ring-2 ring-teal-500 bg-teal-50'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryColors.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setStatusFormData({ ...statusFormData, color: color.value })}
                                                className={`w-10 h-10 rounded-md ${color.value} ${
                                                    statusFormData.color === color.value
                                                        ? 'ring-2 ring-teal-500 ring-offset-2'
                                                        : ''
                                                }`}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guidelines
                                </label>
                                <textarea
                                    value={statusFormData.guidelines}
                                    onChange={(e) => setStatusFormData({ ...statusFormData, guidelines: e.target.value })}
                                    rows={4}
                                    placeholder="Guidelines for when/why to use this status..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={statusFormData.displayOrder}
                                        onChange={(e) => setStatusFormData({ ...statusFormData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={statusFormData.isActive}
                                            onChange={(e) => setStatusFormData({ ...statusFormData, isActive: e.target.checked })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={statusFormData.isTerminal}
                                            onChange={(e) => setStatusFormData({ ...statusFormData, isTerminal: e.target.checked })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            disabled={editingStatusType?.isDefault}
                                        />
                                        <span className="text-sm text-gray-700">Terminal Status</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                                >
                                    {editingStatusType ? 'Update Status' : 'Create Status'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingStatusType(false);
                                        setEditingStatusType(null);
                                        resetStatusForm();
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* Status Types List */}
                {statusLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    </div>
                ) : filteredStatusTypes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500">No status types found.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedStatusTypes.size === filteredStatusTypes.length && filteredStatusTypes.length > 0}
                                                onChange={handleSelectAllStatusTypes}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            />
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usage
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status Type
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStatusTypes.map((status) => (
                                        <tr key={status.id} className="hover:bg-gray-50">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStatusTypes.has(status.id)}
                                                    onChange={() => handleSelectStatusType(status.id)}
                                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                />
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{status.icon}</span>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-block w-3 h-3 rounded-full ${status.color}`}></span>
                                                            <span className="text-sm font-medium text-gray-900">{status.name}</span>
                                                            {status.isDefault && (
                                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">Default</span>
                                                            )}
                                                            {status.isTerminal && (
                                                                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">Terminal</span>
                                                            )}
                                                        </div>
                                                        {status.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                                                    {status.category}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {status.usageStatistics.count}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    status.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {status.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditStatusType(status)}
                                                        className="text-teal-600 hover:text-teal-900 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Edit"
                                                        disabled={status.isDefault}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewWorkflow(status.id)}
                                                        className="text-blue-600 hover:text-blue-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Workflow"
                                                    >
                                                        🔄
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatusTypeStatus(status.id, status.isActive)}
                                                        className={`${status.isActive ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'} min-w-[44px] min-h-[44px] flex items-center justify-center`}
                                                        title={status.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {status.isActive ? '👁️' : '✅'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewStatusHistory(status.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="View History"
                                                    >
                                                        📋
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStatusType(status.id)}
                                                        className="text-red-600 hover:text-red-900 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete"
                                                        disabled={status.isDefault}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredStatusTypes.map((status) => (
                                <div key={status.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedStatusTypes.has(status.id)}
                                                onChange={() => handleSelectStatusType(status.id)}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1 flex-shrink-0"
                                            />
                                            <span className="text-xl sm:text-2xl flex-shrink-0">{status.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${status.color} flex-shrink-0`}></span>
                                                    <span className="text-sm font-semibold text-gray-900 truncate">{status.name}</span>
                                                    {status.isDefault && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap">Default</span>
                                                    )}
                                                    {status.isTerminal && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded whitespace-nowrap">Terminal</span>
                                                    )}
                                                </div>
                                                {status.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2">{status.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Category</span>
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                                                {status.category}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Status</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                status.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {status.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Usage</span>
                                            <span className="text-gray-900 text-xs font-medium">{status.usageStatistics.count}</span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleEditStatusType(status)}
                                                className="px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-md text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Edit"
                                                disabled={status.isDefault}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleViewWorkflow(status.id)}
                                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium min-h-[44px]"
                                                title="Workflow"
                                            >
                                                Workflow
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatusTypeStatus(status.id, status.isActive)}
                                                className={`px-3 py-2 rounded-md text-sm font-medium min-h-[44px] ${
                                                    status.isActive 
                                                        ? 'text-gray-600 hover:bg-gray-50' 
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={status.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {status.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleViewStatusHistory(status.id)}
                                                className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium min-h-[44px]"
                                                title="View History"
                                            >
                                                History
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStatusType(status.id)}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete"
                                                disabled={status.isDefault}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                {/* History Modal */}
                {showStatusHistory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Status Change History</h3>
                                <button
                                    onClick={() => {
                                        setShowStatusHistory(false);
                                        setHistoryStatusId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                {statusHistory.length === 0 ? (
                                    <p className="text-gray-500">No change history available.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {statusHistory.map((history) => (
                                            <div key={history.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">{history.action}</p>
                                                        <p className="text-sm text-gray-500">
                                                            By {history.performedBy} on {new Date(history.performedAt).toLocaleString()}
                                                        </p>
                                                        {history.notes && (
                                                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Workflow Modal */}
                {showWorkflowModal && workflowStatusId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Configure Status Workflow</h3>
                                <button
                                    onClick={() => {
                                        setShowWorkflowModal(false);
                                        setWorkflowStatusId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Status: <span className="font-bold">{statusFormData.name}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Select which statuses can transition to this status. Only statuses from the same category are available.
                                    </p>
                                </div>
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {availableStatusesForTransitions.length === 0 ? (
                                        <p className="text-gray-500">No other statuses available in this category.</p>
                                    ) : (
                                        availableStatusesForTransitions.map((status) => (
                                            <label key={status.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={statusFormData.allowedTransitions.includes(status.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setStatusFormData({
                                                                ...statusFormData,
                                                                allowedTransitions: [...statusFormData.allowedTransitions, status.id],
                                                            });
                                                        } else {
                                                            setStatusFormData({
                                                                ...statusFormData,
                                                                allowedTransitions: statusFormData.allowedTransitions.filter(id => id !== status.id),
                                                            });
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <span className={`text-xs inline-block w-2 h-2 rounded-full ${status.color}`}></span>
                                                <span className="text-sm text-gray-900">{status.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={handleUpdateWorkflow}
                                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                                    >
                                        Save Workflow
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowWorkflowModal(false);
                                            setWorkflowStatusId(null);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const renderUrgencyLevelsTab = () => {
        return (
            <div className="space-y-6">
                {/* Statistics Cards */}
                {urgencyStatistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Total Urgency Levels</p>
                            <p className="text-2xl font-bold text-gray-900">{urgencyStatistics.totalUrgencyLevels}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Active Levels</p>
                            <p className="text-2xl font-bold text-green-600">{urgencyStatistics.activeUrgencyLevels}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Total Requests</p>
                            <p className="text-2xl font-bold text-teal-600">{urgencyStatistics.totalRequests}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Most Used</p>
                            <p className="text-lg font-bold text-blue-600 truncate">
                                {urgencyStatistics.mostUsedUrgencyLevel?.name || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Avg Scoring Weight</p>
                            <p className="text-2xl font-bold text-purple-600">{urgencyStatistics.averageScoringWeight}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Inactive Levels</p>
                            <p className="text-2xl font-bold text-gray-600">{urgencyStatistics.inactiveUrgencyLevels}</p>
                        </div>
                    </div>
                )}
                
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search urgency levels by name, key, description, or guidelines..."
                                value={urgencySearchTerm}
                                onChange={(e) => setUrgencySearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showInactiveUrgencyLevels}
                                    onChange={(e) => {
                                        setShowInactiveUrgencyLevels(e.target.checked);
                                        fetchUrgencyLevels();
                                    }}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Show Inactive</span>
                            </label>
                            <button
                                onClick={handleBulkUpdateScoringWeights}
                                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-sm"
                                title="Update scoring weights for all urgency levels"
                            >
                                📊 Update Scoring Weights
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreatingUrgencyLevel(true);
                                    setEditingUrgencyLevel(null);
                                    resetUrgencyForm();
                                }}
                                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                            >
                                + Create Urgency Level
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Bulk Actions */}
                {selectedUrgencyLevels.size > 0 && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-teal-800">
                            {selectedUrgencyLevels.size} urgency level{selectedUrgencyLevels.size === 1 ? '' : 's'} selected
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkToggleUrgencyLevelStatus(true)}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm"
                            >
                                Activate
                            </button>
                            <button
                                onClick={() => handleBulkToggleUrgencyLevelStatus(false)}
                                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm"
                            >
                                Deactivate
                            </button>
                            <button
                                onClick={() => setSelectedUrgencyLevels(new Set())}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition text-sm"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Create/Edit Urgency Level Form */}
                {(isCreatingUrgencyLevel || editingUrgencyLevel) && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingUrgencyLevel ? 'Edit Urgency Level' : 'Create New Urgency Level'}
                        </h3>
                        <form onSubmit={editingUrgencyLevel ? handleUpdateUrgencyLevel : handleCreateUrgencyLevel} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Urgency Level Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={urgencyFormData.name}
                                        onChange={(e) => setUrgencyFormData({ ...urgencyFormData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Key (unique identifier) *
                                    </label>
                                    <input
                                        type="text"
                                        value={urgencyFormData.key}
                                        onChange={(e) => setUrgencyFormData({ ...urgencyFormData, key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="e.g., high, medium, low"
                                        required
                                        disabled={!!editingUrgencyLevel}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lowercase, no spaces (e.g., "high", "medium", "low")</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={urgencyFormData.description}
                                    onChange={(e) => setUrgencyFormData({ ...urgencyFormData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Icon
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {urgencyIcons.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setUrgencyFormData({ ...urgencyFormData, icon })}
                                                className={`p-2 rounded-md text-2xl ${
                                                    urgencyFormData.icon === icon
                                                        ? 'ring-2 ring-teal-500 bg-teal-50'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryColors.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setUrgencyFormData({ ...urgencyFormData, color: color.value })}
                                                className={`w-10 h-10 rounded-md ${color.value} ${
                                                    urgencyFormData.color === color.value
                                                        ? 'ring-2 ring-teal-500 ring-offset-2'
                                                        : ''
                                                }`}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scoring Weight (0-100) *
                                    </label>
                                    <input
                                        type="number"
                                        value={urgencyFormData.scoringWeight}
                                        onChange={(e) => {
                                            const weight = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                            setUrgencyFormData({ ...urgencyFormData, scoringWeight: weight });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        min="0"
                                        max="100"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used in matching algorithm scoring (0-100)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiration Days
                                    </label>
                                    <input
                                        type="number"
                                        value={urgencyFormData.expirationDays || ''}
                                        onChange={(e) => setUrgencyFormData({ ...urgencyFormData, expirationDays: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        min="0"
                                        placeholder="Optional"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Days before auto-expiration (optional)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={urgencyFormData.displayOrder}
                                        onChange={(e) => setUrgencyFormData({ ...urgencyFormData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            {/* Notification Rules */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Rules</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={urgencyFormData.notificationRules?.immediate || false}
                                            onChange={(e) => setUrgencyFormData({
                                                ...urgencyFormData,
                                                notificationRules: {
                                                    ...urgencyFormData.notificationRules,
                                                    immediate: e.target.checked,
                                                },
                                            })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">Send Immediate Notification</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={urgencyFormData.notificationRules?.notifyAdmins || false}
                                            onChange={(e) => setUrgencyFormData({
                                                ...urgencyFormData,
                                                notificationRules: {
                                                    ...urgencyFormData.notificationRules,
                                                    notifyAdmins: e.target.checked,
                                                },
                                            })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">Notify Admins</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={urgencyFormData.notificationRules?.notifyDonors || false}
                                            onChange={(e) => setUrgencyFormData({
                                                ...urgencyFormData,
                                                notificationRules: {
                                                    ...urgencyFormData.notificationRules,
                                                    notifyDonors: e.target.checked,
                                                },
                                            })}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-700">Notify Donors</span>
                                    </label>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Escalation Delay (hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={urgencyFormData.notificationRules?.escalationDelay || ''}
                                            onChange={(e) => setUrgencyFormData({
                                                ...urgencyFormData,
                                                notificationRules: {
                                                    ...urgencyFormData.notificationRules,
                                                    escalationDelay: e.target.value ? parseInt(e.target.value) : undefined,
                                                },
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            min="0"
                                            placeholder="Hours"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Hours before escalation notification</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guidelines
                                </label>
                                <textarea
                                    value={urgencyFormData.guidelines}
                                    onChange={(e) => setUrgencyFormData({ ...urgencyFormData, guidelines: e.target.value })}
                                    rows={4}
                                    placeholder="Guidelines for when/why to use this urgency level..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={urgencyFormData.isActive}
                                        onChange={(e) => setUrgencyFormData({ ...urgencyFormData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                                >
                                    {editingUrgencyLevel ? 'Update Urgency Level' : 'Create Urgency Level'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingUrgencyLevel(false);
                                        setEditingUrgencyLevel(null);
                                        resetUrgencyForm();
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* Urgency Levels List */}
                {urgencyLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    </div>
                ) : filteredUrgencyLevels.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500">No urgency levels found.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedUrgencyLevels.size === filteredUrgencyLevels.length && filteredUrgencyLevels.length > 0}
                                                onChange={handleSelectAllUrgencyLevels}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            />
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Urgency Level
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Scoring Weight
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expiration
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usage
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reorder
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUrgencyLevels.map((urgency) => (
                                        <tr key={urgency.id} className="hover:bg-gray-50">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUrgencyLevels.has(urgency.id)}
                                                    onChange={() => handleSelectUrgencyLevel(urgency.id)}
                                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                />
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{urgency.icon}</span>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-block w-3 h-3 rounded-full ${urgency.color}`}></span>
                                                            <span className="text-sm font-medium text-gray-900">{urgency.name}</span>
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                                                {urgency.key}
                                                            </span>
                                                            {urgency.isDefault && (
                                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">Default</span>
                                                            )}
                                                        </div>
                                                        {urgency.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{urgency.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{urgency.scoringWeight}</span>
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                                                        <div
                                                            className="bg-teal-500 h-2 rounded-full"
                                                            style={{ width: `${urgency.scoringWeight}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {urgency.expirationDays ? `${urgency.expirationDays} days` : 'No expiration'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {urgency.usageStatistics.requestCount} request{urgency.usageStatistics.requestCount !== 1 ? 's' : ''}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    urgency.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {urgency.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleMoveUrgencyLevel(urgency.id, 'up')}
                                                        className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Move Up"
                                                        disabled={
                                                            filteredUrgencyLevels
                                                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                                                .findIndex(ul => ul.id === urgency.id) === 0
                                                        }
                                                    >
                                                        ⬆️
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveUrgencyLevel(urgency.id, 'down')}
                                                        className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Move Down"
                                                        disabled={
                                                            filteredUrgencyLevels
                                                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                                                .findIndex(ul => ul.id === urgency.id) === filteredUrgencyLevels.length - 1
                                                        }
                                                    >
                                                        ⬇️
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditUrgencyLevel(urgency)}
                                                        className="text-teal-600 hover:text-teal-900 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Edit"
                                                        disabled={urgency.isDefault}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleUrgencyLevelStatus(urgency.id, urgency.isActive)}
                                                        className={`${urgency.isActive ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'} min-w-[44px] min-h-[44px] flex items-center justify-center`}
                                                        title={urgency.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {urgency.isActive ? '👁️' : '✅'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewUrgencyHistory(urgency.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="View History"
                                                    >
                                                        📋
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUrgencyLevel(urgency.id)}
                                                        className="text-red-600 hover:text-red-900 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete"
                                                        disabled={urgency.isDefault}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredUrgencyLevels.map((urgency) => (
                                <div key={urgency.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedUrgencyLevels.has(urgency.id)}
                                                onChange={() => handleSelectUrgencyLevel(urgency.id)}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1 flex-shrink-0"
                                            />
                                            <span className="text-xl sm:text-2xl flex-shrink-0">{urgency.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${urgency.color} flex-shrink-0`}></span>
                                                    <span className="text-sm font-semibold text-gray-900 truncate">{urgency.name}</span>
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                                                        {urgency.key}
                                                    </span>
                                                    {urgency.isDefault && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap">Default</span>
                                                    )}
                                                </div>
                                                {urgency.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2">{urgency.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Scoring Weight</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900 text-xs font-medium">{urgency.scoringWeight}</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                                                    <div
                                                        className="bg-teal-500 h-2 rounded-full"
                                                        style={{ width: `${urgency.scoringWeight}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Status</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                urgency.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {urgency.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Expiration</span>
                                            <span className="text-gray-900 text-xs">
                                                {urgency.expirationDays ? `${urgency.expirationDays} days` : 'No expiration'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Usage</span>
                                            <span className="text-gray-900 text-xs font-medium">
                                                {urgency.usageStatistics.requestCount} request{urgency.usageStatistics.requestCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <button
                                                onClick={() => handleEditUrgencyLevel(urgency)}
                                                className="px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-md text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Edit"
                                                disabled={urgency.isDefault}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleUrgencyLevelStatus(urgency.id, urgency.isActive)}
                                                className={`px-3 py-2 rounded-md text-sm font-medium min-h-[44px] ${
                                                    urgency.isActive 
                                                        ? 'text-gray-600 hover:bg-gray-50' 
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={urgency.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {urgency.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleViewUrgencyHistory(urgency.id)}
                                                className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium min-h-[44px]"
                                                title="View History"
                                            >
                                                History
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUrgencyLevel(urgency.id)}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete"
                                                disabled={urgency.isDefault}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleMoveUrgencyLevel(urgency.id, 'up')}
                                                className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium disabled:text-gray-300 disabled:cursor-not-allowed min-h-[44px]"
                                                title="Move Up"
                                                disabled={
                                                    filteredUrgencyLevels
                                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                                        .findIndex(ul => ul.id === urgency.id) === 0
                                                }
                                            >
                                                ⬆️ Move Up
                                            </button>
                                            <button
                                                onClick={() => handleMoveUrgencyLevel(urgency.id, 'down')}
                                                className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium disabled:text-gray-300 disabled:cursor-not-allowed min-h-[44px]"
                                                title="Move Down"
                                                disabled={
                                                    filteredUrgencyLevels
                                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                                        .findIndex(ul => ul.id === urgency.id) === filteredUrgencyLevels.length - 1
                                                }
                                            >
                                                ⬇️ Move Down
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                {/* History Modal */}
                {showUrgencyHistory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Urgency Level Change History</h3>
                                <button
                                    onClick={() => {
                                        setShowUrgencyHistory(false);
                                        setHistoryUrgencyId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                {urgencyHistory.length === 0 ? (
                                    <p className="text-gray-500">No change history available.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {urgencyHistory.map((history) => (
                                            <div key={history.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">{history.action}</p>
                                                        <p className="text-sm text-gray-500">
                                                            By {history.performedBy} on {new Date(history.performedAt).toLocaleString()}
                                                        </p>
                                                        {history.notes && (
                                                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const renderRolesPermissionsTab = () => {
        const currentMatrixRole = matrixRoleId && matrixRoleId !== 'new-role' ? roles.find(r => r.id === matrixRoleId) : null;
        
        const permissionsByResource = permissions.reduce((acc, perm) => {
            // Filter by category if selected
            if (permissionFilterCategory !== 'all' && perm.category !== permissionFilterCategory) {
                return acc;
            }
            if (!acc[perm.resource]) {
                acc[perm.resource] = [];
            }
            acc[perm.resource].push(perm);
            return acc;
        }, {} as Record<PermissionResource, Permission[]>);
        
        // Check if permissions are loaded
        const hasPermissions = permissions.length > 0;
        const hasFilteredPermissions = Object.keys(permissionsByResource).length > 0;
        
        return (
            <div className="space-y-6">
                {/* Statistics Cards */}
                {roleStatistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Total Roles</p>
                            <p className="text-2xl font-bold text-gray-900">{roleStatistics.totalRoles}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Active Roles</p>
                            <p className="text-2xl font-bold text-green-600">{roleStatistics.activeRoles}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">System Roles</p>
                            <p className="text-2xl font-bold text-blue-600">{roleStatistics.systemRoles}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Custom Roles</p>
                            <p className="text-2xl font-bold text-purple-600">{roleStatistics.customRoles}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-teal-600">{roleStatistics.totalUsers}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Most Used</p>
                            <p className="text-lg font-bold text-orange-600 truncate">
                                {roleStatistics.mostUsedRole?.name || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-500">Avg Permissions</p>
                            <p className="text-2xl font-bold text-indigo-600">{roleStatistics.averagePermissionsPerRole}</p>
                        </div>
                    </div>
                )}
                
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search roles by name, key, description, or guidelines..."
                                value={rolesSearchTerm}
                                onChange={(e) => setRolesSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showInactiveRoles}
                                    onChange={(e) => {
                                        setShowInactiveRoles(e.target.checked);
                                        fetchRoles();
                                    }}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Show Inactive</span>
                            </label>
                            <button
                                onClick={() => {
                                    setIsCreatingRole(true);
                                    setEditingRole(null);
                                    resetRoleForm();
                                }}
                                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                            >
                                + Create Role
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Bulk Actions */}
                {selectedRoles.size > 0 && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-teal-800">
                            {selectedRoles.size} role{selectedRoles.size === 1 ? '' : 's'} selected
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkToggleRoleStatus(true)}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm"
                            >
                                Activate
                            </button>
                            <button
                                onClick={() => handleBulkToggleRoleStatus(false)}
                                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm"
                            >
                                Deactivate
                            </button>
                            <button
                                onClick={() => setSelectedRoles(new Set())}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition text-sm"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Create/Edit Role Form */}
                {(isCreatingRole || editingRole) && (
                    <div className="bg-white rounded-lg shadow-md p-6" data-role-form>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingRole ? 'Edit Role' : 'Create New Role'}
                        </h3>
                        <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={roleFormData.name}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        required
                                        disabled={editingRole?.isSystemRole && editingRole?.isDefault}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Key (unique identifier) *
                                    </label>
                                    <input
                                        type="text"
                                        value={roleFormData.key}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="e.g., admin, donor, recipient"
                                        required
                                        disabled={!!editingRole && editingRole.isSystemRole && editingRole.isDefault}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lowercase, no spaces (e.g., "admin", "donor")</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={roleFormData.description}
                                    onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Icon
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {roleIcons.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setRoleFormData({ ...roleFormData, icon })}
                                                className={`p-2 rounded-md text-2xl ${
                                                    roleFormData.icon === icon
                                                        ? 'ring-2 ring-teal-500 bg-teal-50'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryColors.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setRoleFormData({ ...roleFormData, color: color.value })}
                                                className={`w-10 h-10 rounded-md ${color.value} ${
                                                    roleFormData.color === color.value
                                                        ? 'ring-2 ring-teal-500 ring-offset-2'
                                                        : ''
                                                }`}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parent Role (for inheritance)
                                    </label>
                                    <select
                                        value={roleFormData.parentRoleId || ''}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, parentRoleId: e.target.value || undefined })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">None (No parent)</option>
                                        {roles.filter(r => r.id !== editingRole?.id && r.isActive).map(role => (
                                            <option key={role.id} value={role.id}>{role.name} ({role.key})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Select a parent role to inherit permissions</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={roleFormData.displayOrder}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            {/* Feature Access */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Feature Access</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(roleFormData.featureAccess).map(([feature, enabled]) => (
                                        <label key={feature} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={enabled}
                                                onChange={(e) => setRoleFormData({
                                                    ...roleFormData,
                                                    featureAccess: {
                                                        ...roleFormData.featureAccess,
                                                        [feature]: e.target.checked,
                                                    },
                                                })}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Restrictions */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Restrictions (Optional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Donations Per Day
                                        </label>
                                        <input
                                            type="number"
                                            value={roleFormData.restrictions?.maxDonationsPerDay || ''}
                                            onChange={(e) => setRoleFormData({
                                                ...roleFormData,
                                                restrictions: {
                                                    ...roleFormData.restrictions,
                                                    maxDonationsPerDay: e.target.value ? parseInt(e.target.value) : undefined,
                                                },
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            min="0"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Requests Per Day
                                        </label>
                                        <input
                                            type="number"
                                            value={roleFormData.restrictions?.maxRequestsPerDay || ''}
                                            onChange={(e) => setRoleFormData({
                                                ...roleFormData,
                                                restrictions: {
                                                    ...roleFormData.restrictions,
                                                    maxRequestsPerDay: e.target.value ? parseInt(e.target.value) : undefined,
                                                },
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            min="0"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Permissions Section */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {roleFormData.permissions.length} permission{roleFormData.permissions.length !== 1 ? 's' : ''} selected
                                            {editingRole?.parentRoleId && (
                                                <span className="text-green-600 ml-2">
                                                    (Parent role: {roles.find(r => r.id === editingRole.parentRoleId)?.name || 'Unknown'})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (editingRole) {
                                                handleViewPermissionMatrix(editingRole.id);
                                            } else {
                                                // For new roles, create a temporary ID and open matrix
                                                setMatrixRoleId('new-role');
                                                setMatrixPermissions([...roleFormData.permissions]);
                                                setShowPermissionMatrix(true);
                                            }
                                        }}
                                        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-1"
                                    >
                                        🔐 Manage Permissions
                                    </button>
                                </div>
                                
                                {/* Show selected permissions grouped by resource */}
                                {permissions.length === 0 ? (
                                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                                        <p className="text-sm text-yellow-800 font-medium mb-1">⚠️ Permissions Not Loaded</p>
                                        <p className="text-xs text-yellow-700 mb-2">Permissions are being loaded. Please wait or reload.</p>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const permissionsData = await getPermissions();
                                                    setPermissions(permissionsData);
                                                } catch (err) {
                                                    setError('Failed to load permissions. Please try again.');
                                                }
                                            }}
                                            className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                                        >
                                            🔄 Reload Permissions
                                        </button>
                                    </div>
                                ) : roleFormData.permissions.length > 0 ? (
                                    <div className="mt-3 space-y-2">
                                        {Object.entries(
                                            permissions
                                                .filter(p => roleFormData.permissions.includes(p.id))
                                                .reduce((acc, perm) => {
                                                    if (!acc[perm.resource]) {
                                                        acc[perm.resource] = [];
                                                    }
                                                    acc[perm.resource].push(perm);
                                                    return acc;
                                                }, {} as Record<PermissionResource, Permission[]>)
                                        ).map(([resource, perms]: [string, Permission[]]) => (
                                            <div key={resource} className="bg-gray-50 rounded p-2">
                                                <p className="text-xs font-medium text-gray-700 mb-1 capitalize">{resource.replace('_', ' ')}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {perms.map(perm => (
                                                        <span
                                                            key={perm.id}
                                                            className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded text-gray-700"
                                                            title={perm.description}
                                                        >
                                                            {perm.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic mt-3">No permissions selected. Click "Manage Permissions" to add permissions.</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guidelines
                                </label>
                                <textarea
                                    value={roleFormData.guidelines}
                                    onChange={(e) => setRoleFormData({ ...roleFormData, guidelines: e.target.value })}
                                    rows={4}
                                    placeholder="Guidelines for when/why to use this role..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={roleFormData.isActive}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                                >
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingRole(false);
                                        setEditingRole(null);
                                        resetRoleForm();
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* Roles List */}
                {rolesLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    </div>
                ) : filteredRoles.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500">No roles found.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.size === filteredRoles.length && filteredRoles.length > 0}
                                                onChange={handleSelectAllRoles}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            />
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Permissions
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usage
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRoles.map((role) => {
                                        const inheritedPermissions = role.parentRoleId 
                                            ? roles.find(r => r.id === role.parentRoleId)?.permissions.length || 0
                                            : 0;
                                        const totalPermissions = role.permissions.length + (inheritedPermissions > 0 ? inheritedPermissions : 0);
                                        return (
                                            <tr key={role.id} className="hover:bg-gray-50">
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRoles.has(role.id)}
                                                        onChange={() => handleSelectRole(role.id)}
                                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{role.icon}</span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`inline-block w-3 h-3 rounded-full ${role.color}`}></span>
                                                                <span className="text-sm font-medium text-gray-900">{role.name}</span>
                                                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                                                    {role.key}
                                                                </span>
                                                                {role.isDefault && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">Default</span>
                                                                )}
                                                                {role.isSystemRole && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">System</span>
                                                                )}
                                                                {role.parentRoleId && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded" title={`Inherits from ${roles.find(r => r.id === role.parentRoleId)?.name || 'Unknown'}`}>
                                                                        Inherits
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {role.description && (
                                                                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="font-medium">{role.permissions.length} direct</div>
                                                        {inheritedPermissions > 0 && (
                                                            <div className="text-xs text-green-600">+{inheritedPermissions} inherited</div>
                                                        )}
                                                        <div className="text-xs text-gray-500">({totalPermissions} total)</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {role.usageStatistics.userCount} user{role.usageStatistics.userCount !== 1 ? 's' : ''}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        role.isSystemRole
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {role.isSystemRole ? 'System' : 'Custom'}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        role.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {role.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditRole(role)}
                                                            className={`min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                role.isSystemRole && role.isDefault
                                                                    ? 'text-gray-400'
                                                                    : 'text-teal-600 hover:text-teal-900'
                                                            }`}
                                                            title={
                                                                role.isSystemRole && role.isDefault
                                                                    ? 'System roles cannot be edited. Use Permission Matrix to modify permissions.'
                                                                    : 'Edit Role'
                                                            }
                                                            disabled={role.isSystemRole && role.isDefault}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewPermissionMatrix(role.id)}
                                                            className="text-blue-600 hover:text-blue-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                            title="Permission Matrix"
                                                        >
                                                            🔐
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleRoleStatus(role.id, role.isActive)}
                                                            className={`${role.isActive ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'} min-w-[44px] min-h-[44px] flex items-center justify-center`}
                                                            title={role.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {role.isActive ? '👁️' : '✅'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewRoleHistory(role.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                            title="View History"
                                                        >
                                                            📋
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRole(role.id)}
                                                            className="text-red-600 hover:text-red-900 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete"
                                                            disabled={role.isSystemRole || role.isDefault}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredRoles.map((role) => {
                                const inheritedPermissions = role.parentRoleId 
                                    ? roles.find(r => r.id === role.parentRoleId)?.permissions.length || 0
                                    : 0;
                                const totalPermissions = role.permissions.length + (inheritedPermissions > 0 ? inheritedPermissions : 0);
                                const parentRole = role.parentRoleId ? roles.find(r => r.id === role.parentRoleId) : null;
                                return (
                                    <div key={role.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.has(role.id)}
                                                    onChange={() => handleSelectRole(role.id)}
                                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1 flex-shrink-0"
                                                />
                                                <span className="text-xl sm:text-2xl flex-shrink-0">{role.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${role.color} flex-shrink-0`}></span>
                                                        <span className="text-sm font-semibold text-gray-900 truncate">{role.name}</span>
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                                                            {role.key}
                                                        </span>
                                                        {role.isDefault && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap">Default</span>
                                                        )}
                                                        {role.isSystemRole && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded whitespace-nowrap">System</span>
                                                        )}
                                                        {role.parentRoleId && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded whitespace-nowrap" title={`Inherits from ${parentRole?.name || 'Unknown'}`}>
                                                                Inherits
                                                            </span>
                                                        )}
                                                    </div>
                                                    {role.description && (
                                                        <p className="text-xs text-gray-500 line-clamp-2">{role.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                            <div>
                                                <span className="text-gray-600 text-xs block mb-1">Permissions</span>
                                                <div className="text-xs text-gray-900">
                                                    <div className="font-medium">{role.permissions.length} direct</div>
                                                    {inheritedPermissions > 0 && (
                                                        <div className="text-green-600">+{inheritedPermissions} inherited</div>
                                                    )}
                                                    <div className="text-gray-500">({totalPermissions} total)</div>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 text-xs block mb-1">Status</span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    role.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {role.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 text-xs block mb-1">Type</span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    role.isSystemRole
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {role.isSystemRole ? 'System' : 'Custom'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 text-xs block mb-1">Usage</span>
                                                <span className="text-gray-900 text-xs font-medium">
                                                    {role.usageStatistics.userCount} user{role.usageStatistics.userCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-gray-200">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleEditRole(role)}
                                                    className="px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-md text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={
                                                        role.isSystemRole && role.isDefault
                                                            ? 'System roles cannot be edited. Use Permission Matrix to modify permissions.'
                                                            : 'Edit Role'
                                                    }
                                                    disabled={role.isSystemRole && role.isDefault}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleViewPermissionMatrix(role.id)}
                                                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium min-h-[44px]"
                                                    title="Permission Matrix"
                                                >
                                                    Permissions
                                                </button>
                                                <button
                                                    onClick={() => handleToggleRoleStatus(role.id, role.isActive)}
                                                    className={`px-3 py-2 rounded-md text-sm font-medium min-h-[44px] ${
                                                        role.isActive 
                                                            ? 'text-gray-600 hover:bg-gray-50' 
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={role.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {role.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewRoleHistory(role.id)}
                                                    className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium min-h-[44px]"
                                                    title="View History"
                                                >
                                                    History
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete"
                                                    disabled={role.isSystemRole || role.isDefault}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
                
                {/* Permission Matrix Modal */}
                {showPermissionMatrix && (matrixRoleId === 'new-role' || currentMatrixRole) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Permission Matrix</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Role: <span className="font-medium">
                                            {matrixRoleId === 'new-role' 
                                                ? (isCreatingRole ? 'New Role (Not Saved)' : editingRole?.name || 'New Role')
                                                : currentMatrixRole?.name || roles.find(r => r.id === matrixRoleId)?.name || 'Unknown'}
                                        </span>
                                    </p>
                                    {currentMatrixRole?.parentRoleId && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Inherits from: {roles.find(r => r.id === currentMatrixRole.parentRoleId)?.name || 'Unknown'}
                                        </p>
                                    )}
                                    {matrixRoleId === 'new-role' && editingRole?.parentRoleId && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Will inherit from: {roles.find(r => r.id === editingRole.parentRoleId)?.name || 'Unknown'}
                                        </p>
                                    )}
                                    {permissions.length === 0 && (
                                        <p className="text-xs text-yellow-600 mt-1 font-medium">⚠️ Loading permissions...</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPermissionMatrix(false);
                                        setMatrixRoleId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                {/* Permission Filter */}
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Filter by Permission Category
                                            </label>
                                            <select
                                                value={permissionFilterCategory}
                                                onChange={(e) => setPermissionFilterCategory(e.target.value as 'all' | 'data' | 'admin' | 'system' | 'reporting')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            >
                                                <option value="all">All Categories</option>
                                                <option value="data">Data</option>
                                                <option value="admin">Admin</option>
                                                <option value="system">System</option>
                                                <option value="reporting">Reporting</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <div className="flex flex-wrap gap-2">
                                                {(['data', 'admin', 'system', 'reporting'] as const).map((category) => (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        onClick={() => handleSelectCategoryPermissions(category)}
                                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition capitalize"
                                                        disabled={
                                                            (currentMatrixRole?.isSystemRole && currentMatrixRole?.isDefault && matrixRoleId !== 'new-role') ||
                                                            permissions.length === 0
                                                        }
                                                    >
                                                        {category === 'data' ? 'Select All Data' :
                                                         category === 'admin' ? 'Select All Admin' :
                                                         category === 'system' ? 'Select All System' :
                                                         'Select All Reporting'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {!hasPermissions ? (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                            <p className="text-yellow-800 font-medium mb-2">⚠️ Permissions Not Loaded</p>
                                            <p className="text-sm text-yellow-700 mb-4">Permissions are being loaded. Please wait...</p>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const permissionsData = await getPermissions();
                                                        setPermissions(permissionsData);
                                                    } catch (err) {
                                                        setError('Failed to load permissions. Please try again.');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-sm"
                                            >
                                                🔄 Reload Permissions
                                            </button>
                                        </div>
                                    ) : !hasFilteredPermissions ? (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                            <p className="text-gray-700 font-medium mb-2">No Permissions Found</p>
                                            <p className="text-sm text-gray-600">
                                                {permissionFilterCategory !== 'all' 
                                                    ? `No permissions found for category "${permissionFilterCategory}". Try selecting "All Categories".`
                                                    : 'No permissions available. Please contact system administrator.'}
                                            </p>
                                            {permissionFilterCategory !== 'all' && (
                                                <button
                                                    onClick={() => setPermissionFilterCategory('all')}
                                                    className="mt-3 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm"
                                                >
                                                    Show All Categories
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        Object.entries(permissionsByResource).map(([resource, perms]: [string, Permission[]]) => {
                                            const resourcePermissions = perms.map(p => p.id);
                                            const allResourceSelected = resourcePermissions.length > 0 && resourcePermissions.every(id => matrixPermissions.includes(id));
                                            return (
                                            <div key={resource} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900 capitalize">{resource.replace('_', ' ')}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectAllResourcePermissions(resource as PermissionResource)}
                                                        className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition"
                                                        disabled={
                                                        (currentMatrixRole?.isSystemRole && currentMatrixRole?.isDefault && matrixRoleId !== 'new-role') ||
                                                        permissions.length === 0
                                                    }
                                                    >
                                                        {allResourceSelected ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {perms.map((perm) => {
                                                        // Check if permission is inherited from parent role
                                                        const parentRoleId = currentMatrixRole?.parentRoleId || 
                                                            (matrixRoleId === 'new-role' && editingRole?.parentRoleId) || 
                                                            null;
                                                        const hasInherited = parentRoleId
                                                            ? roles.find(r => r.id === parentRoleId)?.permissions.includes(perm.id)
                                                            : false;
                                                        const isSystemDefault = currentMatrixRole?.isSystemRole && currentMatrixRole?.isDefault && matrixRoleId !== 'new-role';
                                                        return (
                                                            <label key={perm.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={matrixPermissions.includes(perm.id)}
                                                                    disabled={isSystemDefault || permissions.length === 0}
                                                                    onChange={() => handleToggleMatrixPermission(perm.id)}
                                                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                                />
                                                                <div className="flex-1">
                                                                    <span className={`text-sm ${matrixPermissions.includes(perm.id) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                                        {perm.name}
                                                                    </span>
                                                                    {perm.description && (
                                                                        <p className="text-xs text-gray-500">{perm.description}</p>
                                                                    )}
                                                                </div>
                                                                {hasInherited && !matrixPermissions.includes(perm.id) && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded" title="Inherited from parent role">
                                                                        Inherited
                                                                    </span>
                                                                )}
                                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                                                    perm.category === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                                    perm.category === 'system' ? 'bg-red-100 text-red-800' :
                                                                    perm.category === 'reporting' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {perm.category}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="flex gap-2 pt-4 border-t mt-6">
                                    <button
                                        onClick={handleSavePermissionMatrix}
                                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                                        disabled={
                                            (currentMatrixRole?.isSystemRole && currentMatrixRole?.isDefault && matrixRoleId !== 'new-role') ||
                                            permissions.length === 0
                                        }
                                    >
                                        {matrixRoleId === 'new-role' ? 'Update Form Permissions' : 'Save Permissions'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowPermissionMatrix(false);
                                            // If it was a new role, restore form permissions
                                            if (matrixRoleId === 'new-role') {
                                                // Don't change form data, just close
                                            }
                                            setMatrixRoleId(null);
                                            setMatrixPermissions([]);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                                    >
                                        {matrixRoleId === 'new-role' ? 'Cancel' : 'Close'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* History Modal */}
                {showRoleHistory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Role Change History</h3>
                                <button
                                    onClick={() => {
                                        setShowRoleHistory(false);
                                        setHistoryRoleId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                {roleHistory.length === 0 ? (
                                    <p className="text-gray-500">No change history available.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {roleHistory.map((history) => (
                                            <div key={history.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">{history.action.replace('_', ' ')}</p>
                                                        <p className="text-sm text-gray-500">
                                                            By {history.performedBy} on {new Date(history.performedAt).toLocaleString()}
                                                        </p>
                                                        {history.notes && (
                                                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    // Matching Algorithm Configuration Tab
    const renderMatchingAlgorithmTab = () => {
        if (matchingLoading) {
            return (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading matching algorithm configuration...</p>
                        </div>
                    </div>
                </div>
            );
        }
        
        if (!matchingConfig) {
            return (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center py-12">
                        <p className="text-gray-600">Failed to load matching algorithm configuration.</p>
                    </div>
                </div>
            );
        }
        
        const handleSaveWeights = async () => {
            if (!user || !editingWeights) return;
            try {
                setError(null);
                const updated = await updateMatchingWeights(editingWeights, user.name);
                setMatchingConfig(updated);
                setSuccess('Matching score weights updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update matching weights');
            }
        };
        
        const handleSaveThresholds = async () => {
            if (!user || !editingThresholds) return;
            try {
                setError(null);
                const updated = await updateMatchingThresholds(editingThresholds, user.name);
                setMatchingConfig(updated);
                setSuccess('Matching thresholds updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update matching thresholds');
            }
        };
        
        const handleSavePreferences = async () => {
            if (!user || !editingPreferences) return;
            try {
                setError(null);
                const updated = await updateMatchingPreferences(editingPreferences, user.name);
                setMatchingConfig(updated);
                setSuccess('Matching preferences updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update matching preferences');
            }
        };
        
        const handleSaveAutoMatching = async () => {
            if (!user || !editingAutoMatching) return;
            try {
                setError(null);
                const updated = await updateAutoMatchingRules(editingAutoMatching, user.name);
                setMatchingConfig(updated);
                setSuccess('Auto-matching rules updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update auto-matching rules');
            }
        };
        
        const handleCreateVersion = async () => {
            if (!user || !versionDescription.trim()) return;
            try {
                setError(null);
                await createMatchingAlgorithmVersion(versionDescription, user.name);
                const config = await getMatchingAlgorithmConfig();
                setMatchingConfig(config);
                setVersionDescription('');
                setShowVersionModal(false);
                setSuccess('New algorithm version created successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to create algorithm version');
            }
        };
        
        const handleActivateVersion = async (version: string) => {
            if (!user) return;
            if (!confirm(`Are you sure you want to activate algorithm version ${version}? This will change the matching behavior immediately.`)) {
                return;
            }
            try {
                setError(null);
                const updated = await activateMatchingAlgorithmVersion(version, user.name);
                setMatchingConfig(updated);
                setEditingWeights({ ...updated.weights });
                setEditingThresholds({ ...updated.thresholds });
                setEditingPreferences({ ...updated.preferences });
                setEditingAutoMatching({ ...updated.autoMatching });
                setSuccess(`Algorithm version ${version} activated successfully!`);
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to activate algorithm version');
            }
        };
        
        const handleResetConfig = async () => {
            if (!user) return;
            if (!confirm('Are you sure you want to reset the matching algorithm configuration to defaults? This action cannot be undone.')) {
                return;
            }
            try {
                setError(null);
                const reset = await resetMatchingAlgorithmConfig(user.name);
                setMatchingConfig(reset);
                setEditingWeights({ ...reset.weights });
                setEditingThresholds({ ...reset.thresholds });
                setEditingPreferences({ ...reset.preferences });
                setEditingAutoMatching({ ...reset.autoMatching });
                setSuccess('Matching algorithm configuration reset to defaults!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to reset configuration');
            }
        };
        
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Matching Algorithm Configuration</h2>
                            <p className="text-gray-600 mt-1">Configure the matching algorithm weights, thresholds, and rules</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowMatchingHistory(true)}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                            >
                                View History
                            </button>
                            <button
                                onClick={handleResetConfig}
                                className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-200 transition"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Current Version</p>
                            <p className="text-lg font-bold text-gray-900">{matchingConfig.version}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-lg font-bold text-teal-600">{matchingConfig.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Last Updated</p>
                            <p className="text-lg font-bold text-gray-900">{new Date(matchingConfig.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                
                {/* Section Tabs */}
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {(['weights', 'thresholds', 'preferences', 'auto-matching', 'versions', 'statistics'] as const).map((section) => (
                                <button
                                    key={section}
                                    onClick={() => setActiveConfigSection(section)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeConfigSection === section
                                            ? 'border-teal-500 text-teal-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                                </button>
                            ))}
                        </nav>
                    </div>
                    
                    <div className="p-6">
                        {/* Matching Score Weights */}
                        {activeConfigSection === 'weights' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Matching Score Weights</h3>
                                    <p className="text-gray-600 mb-4">Configure the weights for different matching factors. Total weight should ideally sum to 100.</p>
                                </div>
                                {editingWeights && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category Match Weight
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingWeights.categoryMatch}
                                                onChange={(e) => setEditingWeights({ ...editingWeights, categoryMatch: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Weight for category match (default: 40)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quantity Fit Weight
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingWeights.quantityFit}
                                                onChange={(e) => setEditingWeights({ ...editingWeights, quantityFit: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Weight for quantity fit (default: 30)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location Proximity Weight
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingWeights.locationProximity}
                                                onChange={(e) => setEditingWeights({ ...editingWeights, locationProximity: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Weight for location proximity (default: 0, will be used when location data is available)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Urgency Weight
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingWeights.urgency}
                                                onChange={(e) => setEditingWeights({ ...editingWeights, urgency: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Weight for urgency level (default: 20)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Request Age Weight
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingWeights.requestAge}
                                                onChange={(e) => setEditingWeights({ ...editingWeights, requestAge: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Weight for request age factor (default: 0, older requests may get priority boost)</p>
                                        </div>
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <button
                                                onClick={handleSaveWeights}
                                                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition"
                                            >
                                                Save Weights
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Matching Thresholds */}
                        {activeConfigSection === 'thresholds' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Matching Thresholds</h3>
                                    <p className="text-gray-600 mb-4">Configure score thresholds for matching suggestions and automatic matching.</p>
                                </div>
                                {editingThresholds && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Minimum Score for Suggestions
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingThresholds.minimumScore}
                                                onChange={(e) => setEditingThresholds({ ...editingThresholds, minimumScore: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Minimum score required for suggestions to appear (default: 50)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                High Score Threshold
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingThresholds.highScoreThreshold}
                                                onChange={(e) => setEditingThresholds({ ...editingThresholds, highScoreThreshold: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Score threshold for high-quality matches (default: 80)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Auto-Match Threshold
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingThresholds.autoMatchThreshold}
                                                onChange={(e) => setEditingThresholds({ ...editingThresholds, autoMatchThreshold: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Score threshold for automatic matching (default: 95)</p>
                                        </div>
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <button
                                                onClick={handleSaveThresholds}
                                                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition"
                                            >
                                                Save Thresholds
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Matching Preferences */}
                        {activeConfigSection === 'preferences' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Matching Preference Rules</h3>
                                    <p className="text-gray-600 mb-4">Configure preference rules that influence matching behavior.</p>
                                </div>
                                {editingPreferences && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Prefer Exact Quantity</label>
                                                <p className="text-xs text-gray-500 mt-1">Prefer exact quantity matches over excess/partial matches</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingPreferences.preferExactQuantity}
                                                onChange={(e) => setEditingPreferences({ ...editingPreferences, preferExactQuantity: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Prefer Nearby Locations</label>
                                                <p className="text-xs text-gray-500 mt-1">Prefer matches with closer locations (when available)</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingPreferences.preferNearbyLocations}
                                                onChange={(e) => setEditingPreferences({ ...editingPreferences, preferNearbyLocations: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Prioritize Urgency</label>
                                                <p className="text-xs text-gray-500 mt-1">Prioritize high urgency requests</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingPreferences.prioritizeUrgency}
                                                onChange={(e) => setEditingPreferences({ ...editingPreferences, prioritizeUrgency: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Prioritize Recent Requests</label>
                                                <p className="text-xs text-gray-500 mt-1">Prioritize more recent requests</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingPreferences.prioritizeRecentRequests}
                                                onChange={(e) => setEditingPreferences({ ...editingPreferences, prioritizeRecentRequests: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Consider Request Age</label>
                                                <p className="text-xs text-gray-500 mt-1">Consider how long request has been waiting</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingPreferences.considerRequestAge}
                                                onChange={(e) => setEditingPreferences({ ...editingPreferences, considerRequestAge: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Requests Per Donation (0 = unlimited)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editingPreferences.maxRequestsPerDonation}
                                                onChange={(e) => setEditingPreferences({ ...editingPreferences, maxRequestsPerDonation: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Donations Per Request (0 = unlimited)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editingPreferences.maxDonationsPerRequest}
                                                onChange={(e) => setEditingPreferences({ ...editingPreferences, maxDonationsPerRequest: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <button
                                                onClick={handleSavePreferences}
                                                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition"
                                            >
                                                Save Preferences
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Auto-Matching Rules */}
                        {activeConfigSection === 'auto-matching' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Matching Rules</h3>
                                    <p className="text-gray-600 mb-4">Configure automatic matching behavior.</p>
                                </div>
                                {editingAutoMatching && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Enable Auto-Matching</label>
                                                <p className="text-xs text-gray-500 mt-1">Enable automatic matching functionality</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingAutoMatching.enabled}
                                                onChange={(e) => setEditingAutoMatching({ ...editingAutoMatching, enabled: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Auto-Match on Threshold</label>
                                                <p className="text-xs text-gray-500 mt-1">Auto-match when score exceeds auto-match threshold</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingAutoMatching.autoMatchOnThreshold}
                                                onChange={(e) => setEditingAutoMatching({ ...editingAutoMatching, autoMatchOnThreshold: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Require Admin Approval</label>
                                                <p className="text-xs text-gray-500 mt-1">Require admin approval for auto-matched items</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingAutoMatching.requireAdminApproval}
                                                onChange={(e) => setEditingAutoMatching({ ...editingAutoMatching, requireAdminApproval: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Notify on Auto-Match</label>
                                                <p className="text-xs text-gray-500 mt-1">Send notifications when auto-match occurs</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingAutoMatching.notifyOnAutoMatch}
                                                onChange={(e) => setEditingAutoMatching({ ...editingAutoMatching, notifyOnAutoMatch: e.target.checked })}
                                                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <button
                                                onClick={handleSaveAutoMatching}
                                                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition"
                                            >
                                                Save Auto-Matching Rules
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Algorithm Versions */}
                        {activeConfigSection === 'versions' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Algorithm Versions</h3>
                                        <p className="text-gray-600 mb-4">Manage algorithm versions and version history.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowVersionModal(true)}
                                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                                    >
                                        Create New Version
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">Version {matchingConfig.version}</p>
                                                <p className="text-sm text-gray-600">{matchingConfig.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {matchingConfig.isActive && (
                                                        <span className="text-teal-600 font-medium">Active</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {matchingConfig.versions.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700">Previous Versions:</p>
                                            {matchingConfig.versions.map((version) => (
                                                <div key={version.version} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Version {version.version}</p>
                                                        <p className="text-sm text-gray-600">{version.description}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Created {new Date(version.createdAt).toLocaleDateString()} by {version.createdBy}
                                                        </p>
                                                    </div>
                                                    {!version.isActive && (
                                                        <button
                                                            onClick={() => handleActivateVersion(version.version)}
                                                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition text-sm"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    {version.isActive && (
                                                        <span className="text-teal-600 font-medium text-sm">Active</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Statistics */}
                        {activeConfigSection === 'statistics' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Matching Statistics</h3>
                                    <p className="text-gray-600 mb-4">View matching performance metrics and statistics.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Total Matches</p>
                                        <p className="text-2xl font-bold text-gray-900">{matchingConfig.statistics.totalMatches}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Confirmed Matches</p>
                                        <p className="text-2xl font-bold text-teal-600">{matchingConfig.statistics.confirmedMatches}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Fulfilled Matches</p>
                                        <p className="text-2xl font-bold text-green-600">{matchingConfig.statistics.fulfilledMatches}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Average Score</p>
                                        <p className="text-2xl font-bold text-gray-900">{matchingConfig.statistics.averageScore.toFixed(1)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Auto-Matched</p>
                                        <p className="text-2xl font-bold text-blue-600">{matchingConfig.statistics.autoMatched}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Manual Matched</p>
                                        <p className="text-2xl font-bold text-purple-600">{matchingConfig.statistics.manualMatched}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Match Success Rate</p>
                                    <p className="text-2xl font-bold text-teal-600">
                                        {matchingConfig.statistics.matchingPerformance.matchSuccessRate.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Version Creation Modal */}
                {showVersionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900">Create New Algorithm Version</h3>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Version Description</label>
                                    <textarea
                                        value={versionDescription}
                                        onChange={(e) => setVersionDescription(e.target.value)}
                                        placeholder="Describe the changes in this version..."
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setShowVersionModal(false);
                                        setVersionDescription('');
                                    }}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateVersion}
                                    disabled={!versionDescription.trim()}
                                    className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Create Version
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* History Modal */}
                {showMatchingHistory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Matching Algorithm Change History</h3>
                                <button
                                    onClick={() => setShowMatchingHistory(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                {matchingHistory.length === 0 ? (
                                    <p className="text-gray-500">No change history available.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {matchingHistory.map((history) => (
                                            <div key={history.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">{history.action.replace('_', ' ')}</p>
                                                        <p className="text-sm text-gray-500">
                                                            By {history.performedBy} on {new Date(history.performedAt).toLocaleString()}
                                                        </p>
                                                        {history.notes && (
                                                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    // System Configuration Tab
    const renderSystemConfigTab = () => {
        if (systemConfigLoading) {
            return (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading system configuration...</p>
                        </div>
                    </div>
                </div>
            );
        }
        
        if (!systemConfig) {
            return (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center py-12">
                        <p className="text-gray-600">Failed to load system configuration.</p>
                    </div>
                </div>
            );
        }
        
        // Handlers for each section
        const handleSaveGeneralSettings = async (settings: Partial<typeof systemConfig.generalSettings>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateGeneralAppSettings(settings, user.name);
                setSystemConfig(updated);
                setSuccess('General settings updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update general settings');
            }
        };
        
        const handleSaveDonationLimits = async (limits: Partial<typeof systemConfig.donationLimits>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateDonationLimits(limits, user.name);
                setSystemConfig(updated);
                setSuccess('Donation limits updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update donation limits');
            }
        };
        
        const handleSaveRequestLimits = async (limits: Partial<typeof systemConfig.requestLimits>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateRequestLimits(limits, user.name);
                setSystemConfig(updated);
                setSuccess('Request limits updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update request limits');
            }
        };
        
        const handleSaveExpiryRules = async (rules: Partial<typeof systemConfig.requestExpiryRules>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateRequestExpiryRules(rules, user.name);
                setSystemConfig(updated);
                setSuccess('Request expiry rules updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update expiry rules');
            }
        };
        
        const handleSaveVerificationRules = async (rules: Partial<typeof systemConfig.accountVerificationRules>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateAccountVerificationRules(rules, user.name);
                setSystemConfig(updated);
                setSuccess('Verification rules updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update verification rules');
            }
        };
        
        const handleSaveImageSettings = async (settings: Partial<typeof systemConfig.imageUploadSettings>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateImageUploadSettings(settings, user.name);
                setSystemConfig(updated);
                setSuccess('Image upload settings updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update image settings');
            }
        };
        
        const handleSaveExportSettings = async (settings: Partial<typeof systemConfig.exportSettings>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateExportSettings(settings, user.name);
                setSystemConfig(updated);
                setSuccess('Export settings updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update export settings');
            }
        };
        
        const handleSavePaginationSettings = async (settings: Partial<typeof systemConfig.paginationSettings>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updatePaginationSettings(settings, user.name);
                setSystemConfig(updated);
                setSuccess('Pagination settings updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update pagination settings');
            }
        };
        
        const handleSaveFeatureFlags = async (flags: Partial<typeof systemConfig.featureFlags>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateFeatureFlags(flags, user.name);
                setSystemConfig(updated);
                setSuccess('Feature flags updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update feature flags');
            }
        };
        
        const handleSaveBusinessRules = async (rules: Partial<typeof systemConfig.businessRules>) => {
            if (!user) return;
            try {
                setError(null);
                const updated = await updateBusinessRules(rules, user.name);
                setSystemConfig(updated);
                setSuccess('Business rules updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update business rules');
            }
        };
        
        const handleCreateAnnouncement = async () => {
            if (!user) return;
            if (!announcementFormData.title.trim() || !announcementFormData.message.trim()) {
                setError('Title and message are required');
                return;
            }
            try {
                setError(null);
                const updated = await createSystemAnnouncement(announcementFormData, user.name);
                setSystemConfig(updated);
                setAnnouncementFormData({
                    title: '',
                    message: '',
                    type: 'info',
                    priority: 'medium',
                    startDate: new Date(),
                    endDate: undefined,
                    isActive: true,
                    targetAudience: 'all',
                    showOnLogin: false,
                    showOnDashboard: true,
                    dismissible: true,
                });
                setIsCreatingAnnouncement(false);
                setSuccess('Announcement created successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to create announcement');
            }
        };
        
        const handleUpdateAnnouncement = async () => {
            if (!user || !editingAnnouncement) return;
            try {
                setError(null);
                const updated = await updateSystemAnnouncement(editingAnnouncement.id, {
                    ...announcementFormData,
                }, user.name);
                setSystemConfig(updated);
                setEditingAnnouncement(null);
                setIsCreatingAnnouncement(false);
                setSuccess('Announcement updated successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to update announcement');
            }
        };
        
        const handleDeleteAnnouncement = async (announcementId: string) => {
            if (!user) return;
            if (!confirm('Are you sure you want to delete this announcement?')) return;
            try {
                setError(null);
                const updated = await deleteSystemAnnouncement(announcementId, user.name);
                setSystemConfig(updated);
                setSuccess('Announcement deleted successfully!');
                setTimeout(() => setSuccess(null), 5000);
            } catch (err: any) {
                setError(err.message || 'Failed to delete announcement');
            }
        };
        
        const handleLoadHistory = async () => {
            try {
                const history = await getSystemConfigurationChangeHistory();
                setSystemConfigHistory(history);
                setShowSystemConfigHistory(true);
            } catch (err: any) {
                setError(err.message || 'Failed to load change history');
            }
        };
        
        // Render function for each section
        const renderGeneralSettings = () => {
            if (!generalSettingsForm) return null;
            
            return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">General App Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                                <input
                                    type="text"
                                    value={generalSettingsForm.appName}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, appName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Mode</label>
                                <select
                                    value={generalSettingsForm.themeMode}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, themeMode: e.target.value as any })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color (Hex)</label>
                                <input
                                    type="text"
                                    value={generalSettingsForm.primaryColor}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, primaryColor: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="#14b8a6"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color (Hex)</label>
                                <input
                                    type="text"
                                    value={generalSettingsForm.secondaryColor}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, secondaryColor: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="#0d9488"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                <input
                                    type="email"
                                    value={generalSettingsForm.supportEmail || ''}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, supportEmail: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                                <input
                                    type="tel"
                                    value={generalSettingsForm.supportPhone || ''}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, supportPhone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                            <input
                                type="text"
                                    value={generalSettingsForm.footerText || ''}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, footerText: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Address</label>
                            <textarea
                                    value={generalSettingsForm.supportAddress || ''}
                                    onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, supportAddress: e.target.value })}
                                rows={2}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => handleSaveGeneralSettings(generalSettingsForm)}
                                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                            >
                                Save General Settings
                            </button>
                        </div>
                    </div>
                </div>
            );
        };
        
        const renderLimitsSection = () => {
            if (!donationLimitsForm || !requestLimitsForm) return null;
            
            return (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Limits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Global Min Quantity</label>
                                <input
                                    type="number"
                                    value={donationLimitsForm.globalMinQuantity}
                                    onChange={(e) => setDonationLimitsForm({ ...donationLimitsForm, globalMinQuantity: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Global Max Quantity</label>
                                <input
                                    type="number"
                                    value={donationLimitsForm.globalMaxQuantity}
                                    onChange={(e) => setDonationLimitsForm({ ...donationLimitsForm, globalMaxQuantity: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => handleSaveDonationLimits(donationLimitsForm)}
                                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                            >
                                Save Donation Limits
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Limits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Active Requests per Recipient</label>
                                <input
                                    type="number"
                                    value={requestLimitsForm.maxActiveRequestsPerRecipient}
                                    onChange={(e) => setRequestLimitsForm({ ...requestLimitsForm, maxActiveRequestsPerRecipient: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Requests per Day</label>
                                <input
                                    type="number"
                                    value={requestLimitsForm.maxRequestsPerDay}
                                    onChange={(e) => setRequestLimitsForm({ ...requestLimitsForm, maxRequestsPerDay: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Requests per Month</label>
                                <input
                                    type="number"
                                    value={requestLimitsForm.maxRequestsPerMonth}
                                    onChange={(e) => setRequestLimitsForm({ ...requestLimitsForm, maxRequestsPerMonth: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => handleSaveRequestLimits(requestLimitsForm)}
                                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                            >
                                Save Request Limits
                            </button>
                        </div>
                    </div>
                </div>
            );
        };
        
        const renderExpiryRules = () => {
            if (!expiryRulesForm) return null;
            
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Expiry Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Expiration Days</label>
                            <input
                                type="number"
                                value={expiryRulesForm.defaultExpirationDays}
                                onChange={(e) => setExpiryRulesForm({ ...expiryRulesForm, defaultExpirationDays: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Before Expiry (Days)</label>
                            <input
                                type="number"
                                value={expiryRulesForm.notificationBeforeExpiry}
                                onChange={(e) => setExpiryRulesForm({ ...expiryRulesForm, notificationBeforeExpiry: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">High Urgency Expiration Days</label>
                            <input
                                type="number"
                                value={expiryRulesForm.urgencyExpirationDays.high}
                                onChange={(e) => setExpiryRulesForm({ 
                                    ...expiryRulesForm, 
                                    urgencyExpirationDays: { ...expiryRulesForm.urgencyExpirationDays, high: parseInt(e.target.value) || 0 }
                                })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medium Urgency Expiration Days</label>
                            <input
                                type="number"
                                value={expiryRulesForm.urgencyExpirationDays.medium}
                                onChange={(e) => setExpiryRulesForm({ 
                                    ...expiryRulesForm, 
                                    urgencyExpirationDays: { ...expiryRulesForm.urgencyExpirationDays, medium: parseInt(e.target.value) || 0 }
                                })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Low Urgency Expiration Days</label>
                            <input
                                type="number"
                                value={expiryRulesForm.urgencyExpirationDays.low}
                                onChange={(e) => setExpiryRulesForm({ 
                                    ...expiryRulesForm, 
                                    urgencyExpirationDays: { ...expiryRulesForm.urgencyExpirationDays, low: parseInt(e.target.value) || 0 }
                                })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={expiryRulesForm.autoExpiryEnabled}
                                onChange={(e) => setExpiryRulesForm({ ...expiryRulesForm, autoExpiryEnabled: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Auto-expiry enabled</span>
                        </label>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => handleSaveExpiryRules(expiryRulesForm)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                        >
                            Save Expiry Rules
                        </button>
                    </div>
                </div>
            );
        };
        
        const renderVerificationRules = () => {
            if (!verificationRulesForm) return null;
            
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Verification Rules</h3>
                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={verificationRulesForm.requireVerificationForRecipients}
                                onChange={(e) => setVerificationRulesForm({ ...verificationRulesForm, requireVerificationForRecipients: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Require verification for recipients</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={verificationRulesForm.requireVerificationForDonors}
                                onChange={(e) => setVerificationRulesForm({ ...verificationRulesForm, requireVerificationForDonors: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Require verification for donors</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={verificationRulesForm.autoApproveVerified}
                                onChange={(e) => setVerificationRulesForm({ ...verificationRulesForm, autoApproveVerified: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Auto-approve verified accounts</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={verificationRulesForm.manualReviewRequired}
                                onChange={(e) => setVerificationRulesForm({ ...verificationRulesForm, manualReviewRequired: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Manual review required</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Timeframe (Days)</label>
                                <input
                                    type="number"
                                    value={verificationRulesForm.verificationTimeframe}
                                    onChange={(e) => setVerificationRulesForm({ ...verificationRulesForm, verificationTimeframe: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Expiry Days (Optional)</label>
                                <input
                                    type="number"
                                    value={verificationRulesForm.verificationExpiryDays || ''}
                                    onChange={(e) => setVerificationRulesForm({ ...verificationRulesForm, verificationExpiryDays: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                    placeholder="Never expires if empty"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
                            <div className="space-y-2">
                                {['id', 'address_proof', 'income_proof', 'other'].map((doc) => (
                                    <label key={doc} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={verificationRulesForm.verificationRequiredDocuments.includes(doc)}
                                            onChange={(e) => {
                                                const docs = e.target.checked
                                                    ? [...verificationRulesForm.verificationRequiredDocuments, doc]
                                                    : verificationRulesForm.verificationRequiredDocuments.filter(d => d !== doc);
                                                setVerificationRulesForm({ ...verificationRulesForm, verificationRequiredDocuments: docs });
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{doc.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => handleSaveVerificationRules(verificationRulesForm)}
                                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                            >
                                Save Verification Rules
                            </button>
                        </div>
                    </div>
                </div>
            );
        };
        
        const renderImageSettings = () => {
            if (!imageSettingsForm) return null;
            
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Upload Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                            <input
                                type="number"
                                value={imageSettingsForm.maxFileSizeMB}
                                onChange={(e) => setImageSettingsForm({ ...imageSettingsForm, maxFileSizeMB: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                                max="50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Images per Item</label>
                            <input
                                type="number"
                                value={imageSettingsForm.maxImagesPerItem}
                                onChange={(e) => setImageSettingsForm({ ...imageSettings, maxImagesPerItem: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                                max="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Compression Level (0-100)</label>
                            <input
                                type="number"
                                value={imageSettingsForm.compressionLevel}
                                onChange={(e) => setImageSettingsForm({ ...imageSettings, compressionLevel: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Width (pixels)</label>
                            <input
                                type="number"
                                value={imageSettingsForm.maxWidth}
                                onChange={(e) => setImageSettingsForm({ ...imageSettings, maxWidth: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="100"
                                max="5000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Height (pixels)</label>
                            <input
                                type="number"
                                value={imageSettingsForm.maxHeight}
                                onChange={(e) => setImageSettingsForm({ ...imageSettings, maxHeight: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="100"
                                max="5000"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={imageSettingsForm.generateThumbnails}
                                onChange={(e) => setImageSettingsForm({ ...imageSettings, generateThumbnails: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Generate thumbnails</span>
                        </label>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Formats</label>
                        <div className="space-y-2">
                            {['image/jpeg', 'image/png', 'image/webp', 'image/gif'].map((format) => (
                                <label key={format} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={imageSettingsForm.allowedFormats.includes(format)}
                                        onChange={(e) => {
                                            const formats = e.target.checked
                                                ? [...imageSettingsForm.allowedFormats, format]
                                                : imageSettingsForm.allowedFormats.filter(f => f !== format);
                                            setImageSettingsForm({ ...imageSettings, allowedFormats: formats });
                                        }}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">{format}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => handleSaveImageSettings(imageSettingsForm)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                        >
                            Save Image Settings
                        </button>
                    </div>
                </div>
            );
        };
        
        const renderExportSettings = () => {
            if (!exportSettingsForm) return null;
            
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Format</label>
                            <select
                                value={exportSettingsForm.defaultFormat}
                                onChange={(e) => setExportSettingsForm({ ...exportSettingsForm, defaultFormat: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="csv">CSV</option>
                                <option value="json">JSON</option>
                                <option value="excel">Excel</option>
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Formats</label>
                        <div className="space-y-2">
                            {['csv', 'json', 'excel', 'pdf'].map((format) => (
                                <label key={format} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={exportSettingsForm.availableFormats.includes(format as any)}
                                        onChange={(e) => {
                                            const formats = e.target.checked
                                                ? [...exportSettingsForm.availableFormats, format as any]
                                                : exportSettingsForm.availableFormats.filter(f => f !== format);
                                            setExportSettingsForm({ ...exportSettings, availableFormats: formats });
                                        }}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700 uppercase">{format}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={exportSettingsForm.includeMetadata}
                                onChange={(e) => setExportSettingsForm({ ...exportSettings, includeMetadata: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Include metadata in exports</span>
                        </label>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => handleSaveExportSettings(exportSettingsForm)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                        >
                            Save Export Settings
                        </button>
                    </div>
                </div>
            );
        };
        
        const renderPaginationSettings = () => {
            if (!paginationSettingsForm) return null;
            
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagination Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Items per Page</label>
                            <input
                                type="number"
                                value={paginationSettingsForm.defaultItemsPerPage}
                                onChange={(e) => setPaginationSettingsForm({ ...paginationSettingsForm, defaultItemsPerPage: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Items per Page</label>
                            <input
                                type="number"
                                value={paginationSettingsForm.maxItemsPerPage}
                                onChange={(e) => setPaginationSettingsForm({ ...paginationSettings, maxItemsPerPage: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                min="1"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Items per Page Options (comma-separated)</label>
                        <input
                            type="text"
                            value={paginationSettingsForm.itemsPerPageOptions.join(', ')}
                            onChange={(e) => {
                                const options = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                                setPaginationSettingsForm({ ...paginationSettings, itemsPerPageOptions: options });
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="10, 25, 50, 100"
                        />
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => handleSavePaginationSettings(paginationSettingsForm)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                        >
                            Save Pagination Settings
                        </button>
                    </div>
                </div>
            );
        };
        
        const renderFeatureFlags = () => {
            if (!featureFlagsForm) return null;
            
            const features = [
                { key: 'donations', label: 'Donations' },
                { key: 'requests', label: 'Requests' },
                { key: 'matching', label: 'Matching' },
                { key: 'leaderboard', label: 'Leaderboard' },
                { key: 'achievements', label: 'Achievements' },
                { key: 'impactStories', label: 'Impact Stories' },
                { key: 'recipientRegistration', label: 'Recipient Registration' },
                { key: 'donorRegistration', label: 'Donor Registration' },
                { key: 'notifications', label: 'Notifications' },
                { key: 'analytics', label: 'Analytics' },
                { key: 'export', label: 'Export' },
            ];
            
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature) => (
                            <label key={feature.key} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={featureFlagsForm[feature.key as keyof typeof featureFlagsForm] || false}
                                    onChange={(e) => setFeatureFlagsForm({ ...featureFlagsForm, [feature.key]: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">{feature.label}</span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => handleSaveFeatureFlags(featureFlagsForm)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                        >
                            Save Feature Flags
                        </button>
                    </div>
                </div>
            );
        };
        
        const renderBusinessRules = () => {
            if (!businessRulesForm) return null;
            
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Rules</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.allowPartialMatching}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRulesForm, allowPartialMatching: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Allow Partial Matching</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.requireAdminApprovalForDonations}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, requireAdminApprovalForDonations: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Require Admin Approval for Donations</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.requireAdminApprovalForRequests}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, requireAdminApprovalForRequests: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Require Admin Approval for Requests</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.allowDonationEditing}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, allowDonationEditing: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Allow Donation Editing</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.allowRequestEditing}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, allowRequestEditing: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Allow Request Editing</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.enableQuantityTracking}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, enableQuantityTracking: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Enable Quantity Tracking</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.enableLocationTracking}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, enableLocationTracking: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Enable Location Tracking</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.enableNotifications}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, enableNotifications: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Enable Notifications</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.enableEmailNotifications}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, enableEmailNotifications: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Enable Email Notifications</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.enableSMSNotifications}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, enableSMSNotifications: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Enable SMS Notifications</span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={businessRulesForm.enableInAppNotifications}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, enableInAppNotifications: e.target.checked })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700">Enable In-App Notifications</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Donation Cooldown Hours (Optional)</label>
                                <input
                                    type="number"
                                    value={businessRulesForm.donationCooldownHours || ''}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, donationCooldownHours: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="0"
                                    placeholder="No cooldown if empty"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Request Cooldown Hours (Optional)</label>
                                <input
                                    type="number"
                                    value={businessRulesForm.requestCooldownHours || ''}
                                    onChange={(e) => setBusinessRulesForm({ ...businessRules, requestCooldownHours: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    min="0"
                                    placeholder="No cooldown if empty"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => handleSaveBusinessRules(businessRulesForm)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                        >
                            Save Business Rules
                        </button>
                    </div>
                </div>
            );
        };
        
        const renderAnnouncements = () => {
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">System Announcements</h3>
                        <button
                            onClick={() => {
                                setEditingAnnouncement(null);
                                setIsCreatingAnnouncement(true);
                            }}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                        >
                            Create Announcement
                        </button>
                    </div>
                    
                    {(isCreatingAnnouncement || editingAnnouncement) && (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4">
                                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={announcementFormData.title}
                                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        value={announcementFormData.message}
                                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, message: e.target.value })}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={announcementFormData.type}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, type: e.target.value as any })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                        >
                                            <option value="info">Info</option>
                                            <option value="warning">Warning</option>
                                            <option value="success">Success</option>
                                            <option value="error">Error</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select
                                            value={announcementFormData.priority}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, priority: e.target.value as any })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                        <select
                                            value={announcementFormData.targetAudience}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, targetAudience: e.target.value as any })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                        >
                                            <option value="all">All</option>
                                            <option value="donors">Donors</option>
                                            <option value="recipients">Recipients</option>
                                            <option value="admins">Admins</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={announcementFormData.startDate.toISOString().split('T')[0]}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, startDate: new Date(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={announcementFormData.endDate ? announcementFormData.endDate.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={announcementFormData.isActive}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, isActive: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={announcementFormData.showOnLogin}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, showOnLogin: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Show on Login</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={announcementFormData.showOnDashboard}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, showOnDashboard: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Show on Dashboard</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={announcementFormData.dismissible}
                                            onChange={(e) => setAnnouncementFormData({ ...announcementFormData, dismissible: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Dismissible</span>
                                    </label>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                                    >
                                        {editingAnnouncement ? 'Update' : 'Create'} Announcement
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCreatingAnnouncement(false);
                                            setEditingAnnouncement(null);
                                        }}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {systemConfig.announcements.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No announcements created yet.</p>
                        ) : (
                            systemConfig.announcements.map((announcement) => (
                                <div key={announcement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                                                    announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {announcement.type}
                                                </span>
                                                {announcement.isActive && (
                                                    <span className="px-2 py-1 rounded text-xs bg-teal-100 text-teal-800">Active</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                                            <div className="text-xs text-gray-500">
                                                Target: {announcement.targetAudience} | 
                                                Start: {new Date(announcement.startDate).toLocaleDateString()} |
                                                {announcement.endDate && ` End: ${new Date(announcement.endDate).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingAnnouncement(announcement);
                                                    setAnnouncementFormData({
                                                        title: announcement.title,
                                                        message: announcement.message,
                                                        type: announcement.type,
                                                        priority: announcement.priority,
                                                        startDate: announcement.startDate,
                                                        endDate: announcement.endDate,
                                                        isActive: announcement.isActive,
                                                        targetAudience: announcement.targetAudience,
                                                        showOnLogin: announcement.showOnLogin,
                                                        showOnDashboard: announcement.showOnDashboard,
                                                        dismissible: announcement.dismissible,
                                                    });
                                                    setIsCreatingAnnouncement(false);
                                                }}
                                                className="text-teal-600 hover:text-teal-800 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        };
        
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">System Configuration Settings</h2>
                            <p className="text-gray-600 mt-1">Manage system-wide settings and configuration</p>
                        </div>
                        <button
                            onClick={handleLoadHistory}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                        >
                            View Change History
                        </button>
                    </div>
                    
                    {/* Section Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto">
                            {[
                                { id: 'general', label: 'General Settings' },
                                { id: 'limits', label: 'Limits' },
                                { id: 'expiry', label: 'Expiry Rules' },
                                { id: 'verification', label: 'Verification' },
                                { id: 'images', label: 'Image Upload' },
                                { id: 'export', label: 'Export' },
                                { id: 'pagination', label: 'Pagination' },
                                { id: 'features', label: 'Feature Flags' },
                                { id: 'business', label: 'Business Rules' },
                                { id: 'announcements', label: 'Announcements' },
                            ].map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSystemConfigSection(section.id as any)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                        activeSystemConfigSection === section.id
                                            ? 'border-teal-500 text-teal-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                
                {/* Section Content */}
                <div>
                    {activeSystemConfigSection === 'general' && renderGeneralSettings()}
                    {activeSystemConfigSection === 'limits' && renderLimitsSection()}
                    {activeSystemConfigSection === 'expiry' && renderExpiryRules()}
                    {activeSystemConfigSection === 'verification' && renderVerificationRules()}
                    {activeSystemConfigSection === 'images' && renderImageSettings()}
                    {activeSystemConfigSection === 'export' && renderExportSettings()}
                    {activeSystemConfigSection === 'pagination' && renderPaginationSettings()}
                    {activeSystemConfigSection === 'features' && renderFeatureFlags()}
                    {activeSystemConfigSection === 'business' && renderBusinessRules()}
                    {activeSystemConfigSection === 'announcements' && renderAnnouncements()}
                </div>
                
                {/* History Modal */}
                {showSystemConfigHistory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">System Configuration Change History</h3>
                                <button
                                    onClick={() => setShowSystemConfigHistory(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                {systemConfigHistory.length === 0 ? (
                                    <p className="text-gray-500">No change history available.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {systemConfigHistory.map((history) => (
                                            <div key={history.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">{history.action.replace('_', ' ')}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {history.section && <span className="capitalize">{history.section.replace(/([A-Z])/g, ' $1').trim()} - </span>}
                                                            By {history.performedBy} on {new Date(history.performedAt).toLocaleString()}
                                                        </p>
                                                        {history.notes && (
                                                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Master Data Management</h1>
                <p className="text-gray-600 mt-2">Manage core reference data and system configuration</p>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`py-4 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                            activeTab === 'categories'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => setActiveTab('status-types')}
                        className={`py-4 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                            activeTab === 'status-types'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Status Types
                    </button>
                    <button
                        onClick={() => setActiveTab('urgency-levels')}
                        className={`py-4 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                            activeTab === 'urgency-levels'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Urgency Levels
                    </button>
                    <button
                        onClick={() => setActiveTab('roles-permissions')}
                        className={`py-4 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                            activeTab === 'roles-permissions'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Roles & Permissions
                    </button>
                    <button
                        onClick={() => setActiveTab('matching-algorithm')}
                        className={`py-4 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                            activeTab === 'matching-algorithm'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Matching Algorithm
                    </button>
                    <button
                        onClick={() => setActiveTab('system-config')}
                        className={`py-4 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                            activeTab === 'system-config'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        System Config
                    </button>
                </nav>
            </div>
            
            {/* Error and Success Messages */}
            {error && (
                <div className="mb-4 bg-red-100 text-red-800 p-4 rounded-md flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-800 hover:text-red-600">✕</button>
                </div>
            )}
            {success && (
                <div className="mb-4 bg-green-100 text-green-800 p-4 rounded-md flex justify-between items-center">
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="text-green-800 hover:text-green-600">✕</button>
                </div>
            )}
            
            {/* Tab Content */}
            {activeTab === 'categories' && renderCategoriesTab()}
            {activeTab === 'status-types' && renderStatusTypesTab()}
            {activeTab === 'urgency-levels' && renderUrgencyLevelsTab()}
            {activeTab === 'roles-permissions' && renderRolesPermissionsTab()}
            {activeTab === 'matching-algorithm' && renderMatchingAlgorithmTab()}
            {activeTab === 'system-config' && renderSystemConfigTab()}
        </div>
    );
};

export default MasterDataManagement;

