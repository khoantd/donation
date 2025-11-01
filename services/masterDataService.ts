import { Category, CategoryChangeHistory, StatusType, StatusChangeHistory, StatusTypeCategory, UrgencyLevel, UrgencyLevelChangeHistory, Role, Permission, PermissionAction, PermissionResource, RoleChangeHistory, MatchingAlgorithmConfig, MatchingAlgorithmChangeHistory, MatchingScoreWeights, MatchingThresholds, MatchingPreferenceRules, AutoMatchingRules, MatchingStatistics, MatchingAlgorithmVersion, MatchingSuggestion, SystemConfiguration, SystemConfigurationChangeHistory, GeneralAppSettings, DonationLimits, RequestLimits, RequestExpiryRules, AccountVerificationRules, ImageUploadSettings, ExportSettings, PaginationSettings, FeatureFlags, BusinessRules, SystemAnnouncement } from '../types';

// Mock categories data
let mockCategories: Category[] = [
    {
        id: 'cat-1',
        name: 'Clothing',
        description: 'Clothing items including shirts, pants, jackets, shoes, and accessories',
        icon: '👕',
        color: 'bg-blue-500',
        isActive: true,
        displayOrder: 1,
        guidelines: 'Please ensure clothing is clean and in good condition. Include size information when possible.',
        usageStatistics: {
            donationCount: 25,
            requestCount: 18,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'cat-2',
        name: 'Food',
        description: 'Non-perishable food items, canned goods, dry goods',
        icon: '🍞',
        color: 'bg-orange-500',
        isActive: true,
        displayOrder: 2,
        guidelines: 'Food items must be non-perishable and within expiration date. Please check expiration dates carefully.',
        usageStatistics: {
            donationCount: 42,
            requestCount: 35,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'cat-3',
        name: 'Electronics',
        description: 'Electronic devices including phones, tablets, computers, and accessories',
        icon: '📱',
        color: 'bg-purple-500',
        isActive: true,
        displayOrder: 3,
        guidelines: 'Electronics should be in working condition. Include charging cables and accessories when available.',
        usageStatistics: {
            donationCount: 15,
            requestCount: 12,
            lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'cat-4',
        name: 'Books',
        description: 'Books including textbooks, novels, children\'s books, and educational materials',
        icon: '📚',
        color: 'bg-yellow-500',
        isActive: true,
        displayOrder: 4,
        guidelines: 'Books should be in readable condition. Please include genre or age-appropriate information for children\'s books.',
        usageStatistics: {
            donationCount: 38,
            requestCount: 22,
            lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'cat-5',
        name: 'Furniture',
        description: 'Furniture items including tables, chairs, beds, and household furniture',
        icon: '🪑',
        color: 'bg-amber-500',
        isActive: true,
        displayOrder: 5,
        guidelines: 'Furniture should be in usable condition. Include dimensions and condition notes. Large items may require special handling.',
        usageStatistics: {
            donationCount: 12,
            requestCount: 8,
            lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'cat-6',
        name: 'Medical',
        description: 'Medical supplies, first aid kits, health-related items',
        icon: '🏥',
        color: 'bg-red-500',
        isActive: true,
        displayOrder: 6,
        guidelines: 'Medical items must be unopened and within expiration date. Prescription medications require special handling.',
        usageStatistics: {
            donationCount: 20,
            requestCount: 15,
            lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'cat-7',
        name: 'Toys',
        description: 'Toys, games, and recreational items for children',
        icon: '🧸',
        color: 'bg-pink-500',
        isActive: true,
        displayOrder: 7,
        guidelines: 'Toys should be clean and in safe working condition. Include age-appropriate information.',
        usageStatistics: {
            donationCount: 28,
            requestCount: 19,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'cat-8',
        name: 'Other',
        description: 'Miscellaneous items that don\'t fit into other categories',
        icon: '📦',
        color: 'bg-gray-500',
        isActive: true,
        displayOrder: 8,
        guidelines: 'Please provide detailed descriptions for items in this category.',
        usageStatistics: {
            donationCount: 8,
            requestCount: 5,
            lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
];

let categoryChangeHistory: CategoryChangeHistory[] = [];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Get all categories
 */
export const getCategories = async (includeInactive: boolean = false): Promise<Category[]> => {
    await delay(300);
    let categories = [...mockCategories];
    
    if (!includeInactive) {
        categories = categories.filter(cat => cat.isActive);
    }
    
    return categories.sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (id: string): Promise<Category> => {
    await delay(200);
    const category = mockCategories.find(cat => cat.id === id);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
};

/**
 * Get categories organized in a hierarchy (tree structure)
 */
export const getCategoryHierarchy = async (includeInactive: boolean = false): Promise<Category[]> => {
    await delay(200);
    const allCategories = await getCategories(includeInactive);
    return allCategories;
};

/**
 * Get parent categories (categories that can be used as parents)
 * Excludes the specified category and all its descendants to prevent circular references
 */
export const getParentCategories = async (excludeCategoryId?: string, includeInactive: boolean = false): Promise<Category[]> => {
    await delay(200);
    let parentCategories = await getCategories(includeInactive);
    
    // Exclude the category being edited and any of its descendants to prevent circular references
    if (excludeCategoryId) {
        const excludeSet = new Set<string>([excludeCategoryId]);
        
        // Recursively find all descendants
        const findDescendants = (parentId: string) => {
            const children = parentCategories.filter(cat => cat.parentId === parentId);
            children.forEach(child => {
                excludeSet.add(child.id);
                findDescendants(child.id); // Recursively find children of children
            });
        };
        
        findDescendants(excludeCategoryId);
        parentCategories = parentCategories.filter(cat => !excludeSet.has(cat.id));
    }
    
    return parentCategories;
};

/**
 * Create a new category
 */
export const createCategory = async (
    categoryData: Omit<Category, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'usageStatistics'>,
    createdBy: string
): Promise<Category> => {
    await delay(500);
    
    // Check if category name already exists
    const existingCategory = mockCategories.find(
        cat => cat.name.toLowerCase() === categoryData.name.toLowerCase()
    );
    if (existingCategory) {
        throw new Error('Category with this name already exists');
    }
    
    // Validate parent category exists if specified
    if (categoryData.parentId) {
        const parentCategory = mockCategories.find(cat => cat.id === categoryData.parentId);
        if (!parentCategory) {
            throw new Error('Parent category not found');
        }
        if (!parentCategory.isActive) {
            throw new Error('Parent category must be active');
        }
    }
    
    const now = new Date();
    const newCategory: Category = {
        ...categoryData,
        id: `cat-${Date.now()}`,
        usageStatistics: {
            donationCount: 0,
            requestCount: 0,
        },
        createdAt: now,
        createdBy: createdBy,
        updatedAt: now,
        updatedBy: createdBy,
    };
    
    mockCategories.push(newCategory);
    
    // Add to change history
    categoryChangeHistory.push({
        id: `ch-${Date.now()}`,
        categoryId: newCategory.id,
        action: 'created',
        newValue: newCategory,
        performedBy: createdBy,
        performedAt: now,
    });
    
    return newCategory;
};

/**
 * Update an existing category
 */
export const updateCategory = async (
    id: string,
    updates: Partial<Omit<Category, 'id' | 'createdAt' | 'createdBy' | 'usageStatistics'>>,
    updatedBy: string
): Promise<Category> => {
    await delay(500);
    
    const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
        throw new Error('Category not found');
    }
    
    const existingCategory = mockCategories[categoryIndex];
    
    // Check if new name conflicts with another category
    if (updates.name && updates.name.toLowerCase() !== existingCategory.name.toLowerCase()) {
        const nameConflict = mockCategories.find(
            cat => cat.id !== id && cat.name.toLowerCase() === updates.name.toLowerCase()
        );
        if (nameConflict) {
            throw new Error('Category with this name already exists');
        }
    }
    
    // Validate parent category if changed
    if (updates.parentId !== undefined) {
        if (updates.parentId && updates.parentId === id) {
            throw new Error('Category cannot be its own parent');
        }
        if (updates.parentId) {
            const parentCategory = mockCategories.find(cat => cat.id === updates.parentId);
            if (!parentCategory) {
                throw new Error('Parent category not found');
            }
            if (!parentCategory.isActive) {
                throw new Error('Parent category must be active');
            }
            // Check for circular reference (parent's parent chain shouldn't include this category)
            let currentParentId = updates.parentId;
            const visitedIds = new Set<string>([id]);
            while (currentParentId) {
                if (visitedIds.has(currentParentId)) {
                    throw new Error('Circular reference detected in category hierarchy');
                }
                visitedIds.add(currentParentId);
                const currentParent = mockCategories.find(cat => cat.id === currentParentId);
                if (!currentParent || !currentParent.parentId) {
                    break;
                }
                currentParentId = currentParent.parentId;
            }
        }
    }
    
    const previousValue = { ...existingCategory };
    const updatedCategory: Category = {
        ...existingCategory,
        ...updates,
        updatedAt: new Date(),
        updatedBy: updatedBy,
    };
    
    mockCategories[categoryIndex] = updatedCategory;
    
    // Add to change history
    categoryChangeHistory.push({
        id: `ch-${Date.now()}`,
        categoryId: id,
        action: 'updated',
        previousValue: previousValue,
        newValue: updatedCategory,
        performedBy: updatedBy,
        performedAt: new Date(),
    });
    
    return updatedCategory;
};

/**
 * Delete a category (soft delete by setting isActive to false)
 */
export const deleteCategory = async (id: string, deletedBy: string): Promise<void> => {
    await delay(500);
    
    const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
        throw new Error('Category not found');
    }
    
    const category = mockCategories[categoryIndex];
    
    // Check if category is in use
    if (category.usageStatistics.donationCount > 0 || category.usageStatistics.requestCount > 0) {
        throw new Error('Cannot delete category that is in use. Deactivate it instead.');
    }
    
    // Remove from categories array
    mockCategories.splice(categoryIndex, 1);
    
    // Add to change history
    categoryChangeHistory.push({
        id: `ch-${Date.now()}`,
        categoryId: id,
        action: 'deleted',
        previousValue: category,
        performedBy: deletedBy,
        performedAt: new Date(),
    });
};

/**
 * Activate a category
 */
export const activateCategory = async (id: string, activatedBy: string): Promise<Category> => {
    await delay(300);
    return updateCategory(id, { isActive: true }, activatedBy);
};

/**
 * Deactivate a category
 */
export const deactivateCategory = async (id: string, deactivatedBy: string): Promise<Category> => {
    await delay(300);
    return updateCategory(id, { isActive: false }, deactivatedBy);
};

/**
 * Bulk activate/deactivate categories
 */
export const bulkUpdateCategoryStatus = async (
    categoryIds: string[],
    isActive: boolean,
    updatedBy: string
): Promise<Category[]> => {
    await delay(500);
    
    const updatedCategories: Category[] = [];
    
    for (const id of categoryIds) {
        try {
            const updated = await updateCategory(id, { isActive }, updatedBy);
            updatedCategories.push(updated);
        } catch (err) {
            // Continue with other categories even if one fails
            console.error(`Failed to update category ${id}:`, err);
        }
    }
    
    return updatedCategories;
};

/**
 * Reorder categories (update displayOrder)
 */
export const reorderCategories = async (
    categoryOrders: { id: string; displayOrder: number }[],
    updatedBy: string
): Promise<Category[]> => {
    await delay(500);
    
    const updatedCategories: Category[] = [];
    
    for (const order of categoryOrders) {
        try {
            const updated = await updateCategory(order.id, { displayOrder: order.displayOrder }, updatedBy);
            updatedCategories.push(updated);
        } catch (err) {
            console.error(`Failed to reorder category ${order.id}:`, err);
        }
    }
    
    return updatedCategories;
};

/**
 * Get category change history
 */
export const getCategoryChangeHistory = async (categoryId?: string): Promise<CategoryChangeHistory[]> => {
    await delay(200);
    
    let history = [...categoryChangeHistory];
    
    if (categoryId) {
        history = history.filter(ch => ch.categoryId === categoryId);
    }
    
    return history.sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
};

/**
 * Get categories statistics
 */
export const getCategoryStatistics = async (): Promise<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    totalDonations: number;
    totalRequests: number;
    mostUsedCategory: Category | null;
}> => {
    await delay(200);
    
    const activeCategories = mockCategories.filter(cat => cat.isActive);
    const inactiveCategories = mockCategories.filter(cat => !cat.isActive);
    
    const totalDonations = mockCategories.reduce((sum, cat) => sum + cat.usageStatistics.donationCount, 0);
    const totalRequests = mockCategories.reduce((sum, cat) => sum + cat.usageStatistics.requestCount, 0);
    
    const mostUsedCategory = mockCategories.length > 0
        ? mockCategories.reduce((prev, curr) => {
            const prevTotal = prev.usageStatistics.donationCount + prev.usageStatistics.requestCount;
            const currTotal = curr.usageStatistics.donationCount + curr.usageStatistics.requestCount;
            return currTotal > prevTotal ? curr : prev;
        })
        : null;
    
    return {
        totalCategories: mockCategories.length,
        activeCategories: activeCategories.length,
        inactiveCategories: inactiveCategories.length,
        totalDonations,
        totalRequests,
        mostUsedCategory,
    };
};

/**
 * Search categories
 */
export const searchCategories = async (
    query: string,
    includeInactive: boolean = false
): Promise<Category[]> => {
    await delay(300);
    
    const lowerQuery = query.toLowerCase();
    let categories = [...mockCategories];
    
    if (!includeInactive) {
        categories = categories.filter(cat => cat.isActive);
    }
    
    return categories.filter(cat =>
        cat.name.toLowerCase().includes(lowerQuery) ||
        cat.description?.toLowerCase().includes(lowerQuery) ||
        cat.guidelines?.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => a.displayOrder - b.displayOrder);
};

// ============================================
// STATUS TYPES MANAGEMENT
// ============================================

// Mock status types data
let mockStatusTypes: StatusType[] = [
    // Donation Statuses
    {
        id: 'status-donation-1',
        name: 'Pending',
        category: 'donation',
        description: 'Donation submitted and awaiting admin review',
        color: 'bg-yellow-500',
        icon: '⏳',
        displayOrder: 1,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: [],
        guidelines: 'Initial status when a donation is first submitted',
        usageStatistics: {
            count: 45,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-donation-2',
        name: 'Approved',
        category: 'donation',
        description: 'Donation has been approved and is ready for pickup/delivery',
        color: 'bg-green-500',
        icon: '✅',
        displayOrder: 2,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-donation-1'],
        guidelines: 'Use when donation meets requirements and is ready for processing',
        usageStatistics: {
            count: 120,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-donation-3',
        name: 'Rejected',
        category: 'donation',
        description: 'Donation was rejected by admin',
        color: 'bg-red-500',
        icon: '❌',
        displayOrder: 3,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-donation-1'],
        guidelines: 'Use when donation does not meet requirements or cannot be accepted',
        usageStatistics: {
            count: 8,
            lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-donation-4',
        name: 'Delivered',
        category: 'donation',
        description: 'Donation has been successfully delivered to recipient',
        color: 'bg-teal-500',
        icon: '📦',
        displayOrder: 4,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-donation-2'],
        guidelines: 'Final status indicating successful delivery to recipient',
        usageStatistics: {
            count: 98,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    // Request Statuses
    {
        id: 'status-request-1',
        name: 'Pending Approval',
        category: 'request',
        description: 'Request submitted and awaiting admin approval',
        color: 'bg-yellow-500',
        icon: '⏳',
        displayOrder: 1,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: [],
        guidelines: 'Initial status when a request is first submitted',
        usageStatistics: {
            count: 35,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-request-2',
        name: 'Approved',
        category: 'request',
        description: 'Request has been approved and is ready for matching',
        color: 'bg-green-500',
        icon: '✅',
        displayOrder: 2,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-request-1'],
        guidelines: 'Use when request is valid and can proceed to matching',
        usageStatistics: {
            count: 65,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-request-3',
        name: 'Matched',
        category: 'request',
        description: 'Request has been matched with a donation',
        color: 'bg-blue-500',
        icon: '🔗',
        displayOrder: 3,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-request-2'],
        guidelines: 'Use when request is matched with an available donation',
        usageStatistics: {
            count: 42,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-request-4',
        name: 'Fulfilled',
        category: 'request',
        description: 'Request has been fulfilled and items delivered',
        color: 'bg-teal-500',
        icon: '🎉',
        displayOrder: 4,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-request-3'],
        guidelines: 'Final status indicating request has been completely fulfilled',
        usageStatistics: {
            count: 38,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-request-5',
        name: 'Cancelled',
        category: 'request',
        description: 'Request has been cancelled',
        color: 'bg-gray-500',
        icon: '🚫',
        displayOrder: 5,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-request-1', 'status-request-2'],
        guidelines: 'Use when request is cancelled by recipient or admin',
        usageStatistics: {
            count: 5,
            lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-request-6',
        name: 'Expired',
        category: 'request',
        description: 'Request has expired (no longer needed or past deadline)',
        color: 'bg-red-500',
        icon: '⏰',
        displayOrder: 6,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-request-1', 'status-request-2'],
        guidelines: 'Use when request deadline has passed or item is no longer needed',
        usageStatistics: {
            count: 3,
            lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    // Delivery Statuses
    {
        id: 'status-delivery-1',
        name: 'Scheduled',
        category: 'delivery',
        description: 'Delivery has been scheduled',
        color: 'bg-blue-500',
        icon: '📅',
        displayOrder: 1,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: [],
        guidelines: 'Initial status when delivery is scheduled',
        usageStatistics: {
            count: 25,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-delivery-2',
        name: 'Preparing',
        category: 'delivery',
        description: 'Items are being prepared for delivery',
        color: 'bg-purple-500',
        icon: '📦',
        displayOrder: 2,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-delivery-1'],
        guidelines: 'Use when items are being packaged and prepared',
        usageStatistics: {
            count: 18,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-delivery-3',
        name: 'In-Transit',
        category: 'delivery',
        description: 'Items are in transit to recipient',
        color: 'bg-orange-500',
        icon: '🚚',
        displayOrder: 3,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-delivery-2'],
        guidelines: 'Use when items are on the way to recipient',
        usageStatistics: {
            count: 12,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-delivery-4',
        name: 'Delivered',
        category: 'delivery',
        description: 'Items have been successfully delivered',
        color: 'bg-green-500',
        icon: '✅',
        displayOrder: 4,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-delivery-3'],
        guidelines: 'Final status indicating successful delivery',
        usageStatistics: {
            count: 98,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-delivery-5',
        name: 'Failed',
        category: 'delivery',
        description: 'Delivery attempt failed',
        color: 'bg-red-500',
        icon: '❌',
        displayOrder: 5,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-delivery-3'],
        guidelines: 'Use when delivery attempt failed (can reschedule)',
        usageStatistics: {
            count: 3,
            lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-delivery-6',
        name: 'Rescheduled',
        category: 'delivery',
        description: 'Delivery has been rescheduled',
        color: 'bg-yellow-500',
        icon: '🔄',
        displayOrder: 6,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-delivery-1', 'status-delivery-5'],
        guidelines: 'Use when delivery needs to be rescheduled',
        usageStatistics: {
            count: 7,
            lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    // Verification Statuses
    {
        id: 'status-verification-1',
        name: 'Pending',
        category: 'verification',
        description: 'Account verification is pending',
        color: 'bg-yellow-500',
        icon: '⏳',
        displayOrder: 1,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: [],
        guidelines: 'Initial status for new account verification',
        usageStatistics: {
            count: 15,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-verification-2',
        name: 'Verified',
        category: 'verification',
        description: 'Account has been verified',
        color: 'bg-green-500',
        icon: '✅',
        displayOrder: 2,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-verification-1'],
        guidelines: 'Use when account verification is complete',
        usageStatistics: {
            count: 125,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-verification-3',
        name: 'Rejected',
        category: 'verification',
        description: 'Account verification was rejected',
        color: 'bg-red-500',
        icon: '❌',
        displayOrder: 3,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-verification-1'],
        guidelines: 'Use when account verification is rejected',
        usageStatistics: {
            count: 2,
            lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    // Matching Statuses
    {
        id: 'status-matching-1',
        name: 'Pending',
        category: 'matching',
        description: 'Match is pending confirmation',
        color: 'bg-yellow-500',
        icon: '⏳',
        displayOrder: 1,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: [],
        guidelines: 'Initial status when match is created',
        usageStatistics: {
            count: 18,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-matching-2',
        name: 'Confirmed',
        category: 'matching',
        description: 'Match has been confirmed',
        color: 'bg-green-500',
        icon: '✅',
        displayOrder: 2,
        isActive: true,
        isDefault: true,
        isTerminal: false,
        allowedTransitions: ['status-matching-1'],
        guidelines: 'Use when match is confirmed and can proceed',
        usageStatistics: {
            count: 42,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-matching-3',
        name: 'Rejected',
        category: 'matching',
        description: 'Match has been rejected',
        color: 'bg-red-500',
        icon: '❌',
        displayOrder: 3,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-matching-1'],
        guidelines: 'Use when match is rejected',
        usageStatistics: {
            count: 5,
            lastUsed: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-matching-4',
        name: 'Fulfilled',
        category: 'matching',
        description: 'Match has been fulfilled',
        color: 'bg-teal-500',
        icon: '🎉',
        displayOrder: 4,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-matching-2'],
        guidelines: 'Final status when match is completed',
        usageStatistics: {
            count: 38,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'status-matching-5',
        name: 'Cancelled',
        category: 'matching',
        description: 'Match has been cancelled',
        color: 'bg-gray-500',
        icon: '🚫',
        displayOrder: 5,
        isActive: true,
        isDefault: true,
        isTerminal: true,
        allowedTransitions: ['status-matching-1', 'status-matching-2'],
        guidelines: 'Use when match is cancelled',
        usageStatistics: {
            count: 2,
            lastUsed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
];

let statusChangeHistory: StatusChangeHistory[] = [];

/**
 * Get all status types
 */
export const getStatusTypes = async (
    category?: StatusTypeCategory,
    includeInactive: boolean = false
): Promise<StatusType[]> => {
    await delay(300);
    let statuses = [...mockStatusTypes];
    
    if (category) {
        statuses = statuses.filter(status => status.category === category);
    }
    
    if (!includeInactive) {
        statuses = statuses.filter(status => status.isActive);
    }
    
    return statuses.sort((a, b) => {
        // Sort by category first, then display order
        if (a.category !== b.category) {
            const categoryOrder: StatusTypeCategory[] = ['donation', 'request', 'delivery', 'verification', 'matching'];
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        }
        return a.displayOrder - b.displayOrder;
    });
};

/**
 * Get a single status type by ID
 */
export const getStatusTypeById = async (id: string): Promise<StatusType> => {
    await delay(200);
    const status = mockStatusTypes.find(s => s.id === id);
    if (!status) {
        throw new Error('Status type not found');
    }
    return status;
};

/**
 * Get status types by category
 */
export const getStatusTypesByCategory = async (
    category: StatusTypeCategory,
    includeInactive: boolean = false
): Promise<StatusType[]> => {
    return getStatusTypes(category, includeInactive);
};

/**
 * Create a new status type
 */
export const createStatusType = async (
    statusData: Omit<StatusType, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'usageStatistics'>,
    createdBy: string
): Promise<StatusType> => {
    await delay(500);
    
    // Check if status name already exists in the same category
    const existingStatus = mockStatusTypes.find(
        s => s.name.toLowerCase() === statusData.name.toLowerCase() &&
             s.category === statusData.category
    );
    if (existingStatus) {
        throw new Error(`Status "${statusData.name}" already exists in ${statusData.category} category`);
    }
    
    const now = new Date();
    const newStatus: StatusType = {
        ...statusData,
        id: `status-${Date.now()}`,
        usageStatistics: {
            count: 0,
        },
        createdAt: now,
        createdBy: createdBy,
        updatedAt: now,
        updatedBy: createdBy,
    };
    
    mockStatusTypes.push(newStatus);
    
    // Add to change history
    statusChangeHistory.push({
        id: `sh-${Date.now()}`,
        statusId: newStatus.id,
        action: 'created',
        newValue: newStatus,
        performedBy: createdBy,
        performedAt: now,
    });
    
    return newStatus;
};

/**
 * Update an existing status type
 */
export const updateStatusType = async (
    id: string,
    updates: Partial<Omit<StatusType, 'id' | 'createdAt' | 'createdBy' | 'usageStatistics'>>,
    updatedBy: string
): Promise<StatusType> => {
    await delay(500);
    
    const statusIndex = mockStatusTypes.findIndex(s => s.id === id);
    if (statusIndex === -1) {
        throw new Error('Status type not found');
    }
    
    const existingStatus = mockStatusTypes[statusIndex];
    
    // Check if new name conflicts with another status in the same category
    if (updates.name && updates.name.toLowerCase() !== existingStatus.name.toLowerCase()) {
        const nameConflict = mockStatusTypes.find(
            s => s.id !== id &&
                 s.name.toLowerCase() === updates.name.toLowerCase() &&
                 s.category === existingStatus.category
        );
        if (nameConflict) {
            throw new Error(`Status "${updates.name}" already exists in ${existingStatus.category} category`);
        }
    }
    
    // Prevent modifying default statuses' isDefault flag
    if (updates.isDefault !== undefined && existingStatus.isDefault && !updates.isDefault) {
        throw new Error('Cannot remove default flag from system default status');
    }
    
    const previousValue = { ...existingStatus };
    const updatedStatus: StatusType = {
        ...existingStatus,
        ...updates,
        updatedAt: new Date(),
        updatedBy: updatedBy,
    };
    
    mockStatusTypes[statusIndex] = updatedStatus;
    
    // Add to change history
    statusChangeHistory.push({
        id: `sh-${Date.now()}`,
        statusId: id,
        action: 'updated',
        previousValue: previousValue,
        newValue: updatedStatus,
        performedBy: updatedBy,
        performedAt: new Date(),
    });
    
    return updatedStatus;
};

/**
 * Delete a status type (soft delete by setting isActive to false)
 */
export const deleteStatusType = async (id: string, deletedBy: string): Promise<void> => {
    await delay(500);
    
    const statusIndex = mockStatusTypes.findIndex(s => s.id === id);
    if (statusIndex === -1) {
        throw new Error('Status type not found');
    }
    
    const status = mockStatusTypes[statusIndex];
    
    // Prevent deleting default statuses
    if (status.isDefault) {
        throw new Error('Cannot delete default system status. Deactivate it instead.');
    }
    
    // Check if status is in use
    if (status.usageStatistics.count > 0) {
        throw new Error('Cannot delete status that is in use. Deactivate it instead.');
    }
    
    // Remove from statuses array
    mockStatusTypes.splice(statusIndex, 1);
    
    // Add to change history
    statusChangeHistory.push({
        id: `sh-${Date.now()}`,
        statusId: id,
        action: 'deleted',
        previousValue: status,
        performedBy: deletedBy,
        performedAt: new Date(),
    });
};

/**
 * Activate a status type
 */
export const activateStatusType = async (id: string, activatedBy: string): Promise<StatusType> => {
    await delay(300);
    return updateStatusType(id, { isActive: true }, activatedBy);
};

/**
 * Deactivate a status type
 */
export const deactivateStatusType = async (id: string, deactivatedBy: string): Promise<StatusType> => {
    await delay(300);
    return updateStatusType(id, { isActive: false }, deactivatedBy);
};

/**
 * Bulk activate/deactivate status types
 */
export const bulkUpdateStatusTypeStatus = async (
    statusIds: string[],
    isActive: boolean,
    updatedBy: string
): Promise<StatusType[]> => {
    await delay(500);
    
    const updatedStatuses: StatusType[] = [];
    
    for (const id of statusIds) {
        try {
            const updated = await updateStatusType(id, { isActive }, updatedBy);
            updatedStatuses.push(updated);
        } catch (err) {
            console.error(`Failed to update status ${id}:`, err);
        }
    }
    
    return updatedStatuses;
};

/**
 * Update status workflow (allowed transitions)
 */
export const updateStatusWorkflow = async (
    id: string,
    allowedTransitions: string[],
    updatedBy: string
): Promise<StatusType> => {
    await delay(500);
    
    // Validate that transition statuses exist and are in the same category
    const status = await getStatusTypeById(id);
    for (const transitionId of allowedTransitions) {
        const transitionStatus = await getStatusTypeById(transitionId);
        if (transitionStatus.category !== status.category) {
            throw new Error(`Cannot transition to status from different category (${transitionStatus.category} vs ${status.category})`);
        }
    }
    
    return updateStatusType(id, { allowedTransitions }, updatedBy);
};

/**
 * Get status change history
 */
export const getStatusChangeHistory = async (statusId?: string): Promise<StatusChangeHistory[]> => {
    await delay(200);
    
    let history = [...statusChangeHistory];
    
    if (statusId) {
        history = history.filter(sh => sh.statusId === statusId);
    }
    
    return history.sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
};

/**
 * Get status types statistics
 */
export const getStatusTypeStatistics = async (): Promise<{
    totalStatuses: number;
    activeStatuses: number;
    inactiveStatuses: number;
    byCategory: Record<StatusTypeCategory, number>;
    mostUsedStatus: StatusType | null;
}> => {
    await delay(200);
    
    const activeStatuses = mockStatusTypes.filter(s => s.isActive);
    const inactiveStatuses = mockStatusTypes.filter(s => !s.isActive);
    
    const byCategory: Record<StatusTypeCategory, number> = {
        donation: 0,
        request: 0,
        delivery: 0,
        verification: 0,
        matching: 0,
    };
    
    mockStatusTypes.forEach(status => {
        byCategory[status.category]++;
    });
    
    const mostUsedStatus = mockStatusTypes.length > 0
        ? mockStatusTypes.reduce((prev, curr) =>
            curr.usageStatistics.count > prev.usageStatistics.count ? curr : prev
        )
        : null;
    
    return {
        totalStatuses: mockStatusTypes.length,
        activeStatuses: activeStatuses.length,
        inactiveStatuses: inactiveStatuses.length,
        byCategory,
        mostUsedStatus,
    };
};

/**
 * Search status types
 */
export const searchStatusTypes = async (
    query: string,
    category?: StatusTypeCategory,
    includeInactive: boolean = false
): Promise<StatusType[]> => {
    await delay(300);
    
    const lowerQuery = query.toLowerCase();
    let statuses = [...mockStatusTypes];
    
    if (category) {
        statuses = statuses.filter(s => s.category === category);
    }
    
    if (!includeInactive) {
        statuses = statuses.filter(s => s.isActive);
    }
    
    return statuses.filter(s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery) ||
        s.guidelines?.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => {
        if (a.category !== b.category) {
            const categoryOrder: StatusTypeCategory[] = ['donation', 'request', 'delivery', 'verification', 'matching'];
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        }
        return a.displayOrder - b.displayOrder;
    });
};

// ============================================
// URGENCY LEVELS MANAGEMENT
// ============================================

// Mock urgency levels data
let mockUrgencyLevels: UrgencyLevel[] = [
    {
        id: 'urgency-1',
        name: 'High',
        key: 'high',
        description: 'Urgent requests requiring immediate attention',
        color: 'bg-red-500',
        icon: '🔥',
        displayOrder: 1,
        isActive: true,
        isDefault: true,
        scoringWeight: 20,
        expirationDays: 7, // High urgency requests expire after 7 days if not fulfilled
        notificationRules: {
            immediate: true,
            notifyAdmins: true,
            notifyDonors: true,
            escalationDelay: 24, // Escalate after 24 hours
        },
        guidelines: 'Use for requests that are critical and time-sensitive (e.g., medical supplies, emergency food, immediate shelter needs)',
        usageStatistics: {
            requestCount: 28,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'urgency-2',
        name: 'Medium',
        key: 'medium',
        description: 'Moderate priority requests with reasonable timeframe',
        color: 'bg-orange-500',
        icon: '⚠️',
        displayOrder: 2,
        isActive: true,
        isDefault: true,
        scoringWeight: 10,
        expirationDays: 30, // Medium urgency requests expire after 30 days
        notificationRules: {
            immediate: false,
            notifyAdmins: true,
            notifyDonors: false,
            escalationDelay: 72, // Escalate after 72 hours (3 days)
        },
        guidelines: 'Use for requests that are important but not immediately critical (e.g., clothing, school supplies, non-urgent furniture)',
        usageStatistics: {
            requestCount: 65,
            lastUsed: new Date(),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'urgency-3',
        name: 'Low',
        key: 'low',
        description: 'Lower priority requests with flexible timeline',
        color: 'bg-yellow-500',
        icon: '📋',
        displayOrder: 3,
        isActive: true,
        isDefault: true,
        scoringWeight: 5,
        expirationDays: 90, // Low urgency requests expire after 90 days
        notificationRules: {
            immediate: false,
            notifyAdmins: false,
            notifyDonors: false,
            escalationDelay: 168, // Escalate after 168 hours (7 days)
        },
        guidelines: 'Use for requests that are nice-to-have or can wait (e.g., books for library, decorative items, non-essential toys)',
        usageStatistics: {
            requestCount: 42,
            lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
];

let urgencyLevelChangeHistory: UrgencyLevelChangeHistory[] = [];

/**
 * Get all urgency levels
 */
export const getUrgencyLevels = async (includeInactive: boolean = false): Promise<UrgencyLevel[]> => {
    await delay(300);
    let urgencyLevels = [...mockUrgencyLevels];
    
    if (!includeInactive) {
        urgencyLevels = urgencyLevels.filter(ul => ul.isActive);
    }
    
    return urgencyLevels.sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Get a single urgency level by ID
 */
export const getUrgencyLevelById = async (id: string): Promise<UrgencyLevel> => {
    await delay(200);
    const urgencyLevel = mockUrgencyLevels.find(ul => ul.id === id);
    if (!urgencyLevel) {
        throw new Error('Urgency level not found');
    }
    return urgencyLevel;
};

/**
 * Get urgency level by key
 */
export const getUrgencyLevelByKey = async (key: string): Promise<UrgencyLevel | null> => {
    await delay(200);
    const urgencyLevel = mockUrgencyLevels.find(ul => ul.key === key && ul.isActive);
    return urgencyLevel || null;
};

/**
 * Create a new urgency level
 */
export const createUrgencyLevel = async (
    urgencyData: Omit<UrgencyLevel, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'usageStatistics'>,
    createdBy: string
): Promise<UrgencyLevel> => {
    await delay(500);
    
    // Check if urgency key already exists
    const existingUrgency = mockUrgencyLevels.find(
        ul => ul.key.toLowerCase() === urgencyData.key.toLowerCase()
    );
    if (existingUrgency) {
        throw new Error(`Urgency level with key "${urgencyData.key}" already exists`);
    }
    
    // Check if urgency name already exists
    const existingName = mockUrgencyLevels.find(
        ul => ul.name.toLowerCase() === urgencyData.name.toLowerCase()
    );
    if (existingName) {
        throw new Error(`Urgency level with name "${urgencyData.name}" already exists`);
    }
    
    // Validate scoring weight (0-100)
    if (urgencyData.scoringWeight < 0 || urgencyData.scoringWeight > 100) {
        throw new Error('Scoring weight must be between 0 and 100');
    }
    
    const now = new Date();
    const newUrgencyLevel: UrgencyLevel = {
        ...urgencyData,
        id: `urgency-${Date.now()}`,
        usageStatistics: {
            requestCount: 0,
        },
        createdAt: now,
        createdBy: createdBy,
        updatedAt: now,
        updatedBy: createdBy,
    };
    
    mockUrgencyLevels.push(newUrgencyLevel);
    
    // Add to change history
    urgencyLevelChangeHistory.push({
        id: `uh-${Date.now()}`,
        urgencyLevelId: newUrgencyLevel.id,
        action: 'created',
        newValue: newUrgencyLevel,
        performedBy: createdBy,
        performedAt: now,
    });
    
    return newUrgencyLevel;
};

/**
 * Update an existing urgency level
 */
export const updateUrgencyLevel = async (
    id: string,
    updates: Partial<Omit<UrgencyLevel, 'id' | 'createdAt' | 'createdBy' | 'usageStatistics'>>,
    updatedBy: string
): Promise<UrgencyLevel> => {
    await delay(500);
    
    const urgencyIndex = mockUrgencyLevels.findIndex(ul => ul.id === id);
    if (urgencyIndex === -1) {
        throw new Error('Urgency level not found');
    }
    
    const existingUrgency = mockUrgencyLevels[urgencyIndex];
    
    // Check if new key conflicts with another urgency level
    if (updates.key && updates.key.toLowerCase() !== existingUrgency.key.toLowerCase()) {
        const keyConflict = mockUrgencyLevels.find(
            ul => ul.id !== id && ul.key.toLowerCase() === updates.key.toLowerCase()
        );
        if (keyConflict) {
            throw new Error(`Urgency level with key "${updates.key}" already exists`);
        }
    }
    
    // Check if new name conflicts with another urgency level
    if (updates.name && updates.name.toLowerCase() !== existingUrgency.name.toLowerCase()) {
        const nameConflict = mockUrgencyLevels.find(
            ul => ul.id !== id && ul.name.toLowerCase() === updates.name.toLowerCase()
        );
        if (nameConflict) {
            throw new Error(`Urgency level with name "${updates.name}" already exists`);
        }
    }
    
    // Validate scoring weight (0-100)
    if (updates.scoringWeight !== undefined && (updates.scoringWeight < 0 || updates.scoringWeight > 100)) {
        throw new Error('Scoring weight must be between 0 and 100');
    }
    
    // Prevent modifying default urgency levels' isDefault flag
    if (updates.isDefault !== undefined && existingUrgency.isDefault && !updates.isDefault) {
        throw new Error('Cannot remove default flag from system default urgency level');
    }
    
    const previousValue = { ...existingUrgency };
    const updatedUrgencyLevel: UrgencyLevel = {
        ...existingUrgency,
        ...updates,
        updatedAt: new Date(),
        updatedBy: updatedBy,
    };
    
    mockUrgencyLevels[urgencyIndex] = updatedUrgencyLevel;
    
    // Add to change history
    urgencyLevelChangeHistory.push({
        id: `uh-${Date.now()}`,
        urgencyLevelId: id,
        action: 'updated',
        previousValue: previousValue,
        newValue: updatedUrgencyLevel,
        performedBy: updatedBy,
        performedAt: new Date(),
    });
    
    return updatedUrgencyLevel;
};

/**
 * Delete an urgency level (soft delete by setting isActive to false)
 */
export const deleteUrgencyLevel = async (id: string, deletedBy: string): Promise<void> => {
    await delay(500);
    
    const urgencyIndex = mockUrgencyLevels.findIndex(ul => ul.id === id);
    if (urgencyIndex === -1) {
        throw new Error('Urgency level not found');
    }
    
    const urgencyLevel = mockUrgencyLevels[urgencyIndex];
    
    // Prevent deleting default urgency levels
    if (urgencyLevel.isDefault) {
        throw new Error('Cannot delete default system urgency level. Deactivate it instead.');
    }
    
    // Check if urgency level is in use
    if (urgencyLevel.usageStatistics.requestCount > 0) {
        throw new Error('Cannot delete urgency level that is in use. Deactivate it instead.');
    }
    
    // Remove from urgency levels array
    mockUrgencyLevels.splice(urgencyIndex, 1);
    
    // Add to change history
    urgencyLevelChangeHistory.push({
        id: `uh-${Date.now()}`,
        urgencyLevelId: id,
        action: 'deleted',
        previousValue: urgencyLevel,
        performedBy: deletedBy,
        performedAt: new Date(),
    });
};

/**
 * Activate an urgency level
 */
export const activateUrgencyLevel = async (id: string, activatedBy: string): Promise<UrgencyLevel> => {
    await delay(300);
    return updateUrgencyLevel(id, { isActive: true }, activatedBy);
};

/**
 * Deactivate an urgency level
 */
export const deactivateUrgencyLevel = async (id: string, deactivatedBy: string): Promise<UrgencyLevel> => {
    await delay(300);
    return updateUrgencyLevel(id, { isActive: false }, deactivatedBy);
};

/**
 * Bulk activate/deactivate urgency levels
 */
export const bulkUpdateUrgencyLevelStatus = async (
    urgencyIds: string[],
    isActive: boolean,
    updatedBy: string
): Promise<UrgencyLevel[]> => {
    await delay(500);
    
    const updatedUrgencyLevels: UrgencyLevel[] = [];
    
    for (const id of urgencyIds) {
        try {
            const updated = await updateUrgencyLevel(id, { isActive }, updatedBy);
            updatedUrgencyLevels.push(updated);
        } catch (err) {
            console.error(`Failed to update urgency level ${id}:`, err);
        }
    }
    
    return updatedUrgencyLevels;
};

/**
 * Update urgency level scoring weights
 */
export const updateUrgencyScoringWeights = async (
    weights: { id: string; scoringWeight: number }[],
    updatedBy: string
): Promise<UrgencyLevel[]> => {
    await delay(500);
    
    const updatedUrgencyLevels: UrgencyLevel[] = [];
    
    for (const weight of weights) {
        try {
            // Validate scoring weight (0-100)
            if (weight.scoringWeight < 0 || weight.scoringWeight > 100) {
                throw new Error(`Scoring weight for urgency level ${weight.id} must be between 0 and 100`);
            }
            const updated = await updateUrgencyLevel(weight.id, { scoringWeight: weight.scoringWeight }, updatedBy);
            updatedUrgencyLevels.push(updated);
        } catch (err) {
            console.error(`Failed to update urgency level ${weight.id}:`, err);
        }
    }
    
    return updatedUrgencyLevels;
};

/**
 * Reorder urgency levels (update displayOrder)
 */
export const reorderUrgencyLevels = async (
    urgencyOrders: { id: string; displayOrder: number }[],
    updatedBy: string
): Promise<UrgencyLevel[]> => {
    await delay(500);
    
    const updatedUrgencyLevels: UrgencyLevel[] = [];
    
    for (const order of urgencyOrders) {
        try {
            const updated = await updateUrgencyLevel(order.id, { displayOrder: order.displayOrder }, updatedBy);
            updatedUrgencyLevels.push(updated);
        } catch (err) {
            console.error(`Failed to reorder urgency level ${order.id}:`, err);
        }
    }
    
    return updatedUrgencyLevels;
};

/**
 * Get urgency level change history
 */
export const getUrgencyLevelChangeHistory = async (urgencyLevelId?: string): Promise<UrgencyLevelChangeHistory[]> => {
    await delay(200);
    
    let history = [...urgencyLevelChangeHistory];
    
    if (urgencyLevelId) {
        history = history.filter(uh => uh.urgencyLevelId === urgencyLevelId);
    }
    
    return history.sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
};

/**
 * Get urgency levels statistics
 */
export const getUrgencyLevelStatistics = async (): Promise<{
    totalUrgencyLevels: number;
    activeUrgencyLevels: number;
    inactiveUrgencyLevels: number;
    totalRequests: number;
    mostUsedUrgencyLevel: UrgencyLevel | null;
    averageScoringWeight: number;
}> => {
    await delay(200);
    
    const activeUrgencyLevels = mockUrgencyLevels.filter(ul => ul.isActive);
    const inactiveUrgencyLevels = mockUrgencyLevels.filter(ul => !ul.isActive);
    
    const totalRequests = mockUrgencyLevels.reduce((sum, ul) => sum + ul.usageStatistics.requestCount, 0);
    
    const mostUsedUrgencyLevel = mockUrgencyLevels.length > 0
        ? mockUrgencyLevels.reduce((prev, curr) =>
            curr.usageStatistics.requestCount > prev.usageStatistics.requestCount ? curr : prev
        )
        : null;
    
    const totalScoringWeight = mockUrgencyLevels.reduce((sum, ul) => sum + ul.scoringWeight, 0);
    const averageScoringWeight = mockUrgencyLevels.length > 0 ? totalScoringWeight / mockUrgencyLevels.length : 0;
    
    return {
        totalUrgencyLevels: mockUrgencyLevels.length,
        activeUrgencyLevels: activeUrgencyLevels.length,
        inactiveUrgencyLevels: inactiveUrgencyLevels.length,
        totalRequests,
        mostUsedUrgencyLevel,
        averageScoringWeight: Math.round(averageScoringWeight * 10) / 10, // Round to 1 decimal place
    };
};

/**
 * Search urgency levels
 */
export const searchUrgencyLevels = async (
    query: string,
    includeInactive: boolean = false
): Promise<UrgencyLevel[]> => {
    await delay(300);
    
    const lowerQuery = query.toLowerCase();
    let urgencyLevels = [...mockUrgencyLevels];
    
    if (!includeInactive) {
        urgencyLevels = urgencyLevels.filter(ul => ul.isActive);
    }
    
    return urgencyLevels.filter(ul =>
        ul.name.toLowerCase().includes(lowerQuery) ||
        ul.key.toLowerCase().includes(lowerQuery) ||
        ul.description?.toLowerCase().includes(lowerQuery) ||
        ul.guidelines?.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => a.displayOrder - b.displayOrder);
};

// ============================================
// ROLES & PERMISSIONS MANAGEMENT
// ============================================

// System permissions (read-only)
const systemPermissions: Permission[] = [
    // Donations permissions
    { id: 'perm-1', resource: 'donations', action: 'read', name: 'Read Donations', description: 'View donations list and details', category: 'data', isSystemPermission: true },
    { id: 'perm-2', resource: 'donations', action: 'write', name: 'Create Donations', description: 'Create new donations', category: 'data', isSystemPermission: true },
    { id: 'perm-3', resource: 'donations', action: 'delete', name: 'Delete Donations', description: 'Delete donations', category: 'data', isSystemPermission: true },
    { id: 'perm-4', resource: 'donations', action: 'approve', name: 'Approve Donations', description: 'Approve or reject donations', category: 'admin', isSystemPermission: true },
    { id: 'perm-5', resource: 'donations', action: 'manage', name: 'Manage Donations', description: 'Full donation management (all actions)', category: 'admin', isSystemPermission: true },
    
    // Requests permissions
    { id: 'perm-6', resource: 'requests', action: 'read', name: 'Read Requests', description: 'View item requests list and details', category: 'data', isSystemPermission: true },
    { id: 'perm-7', resource: 'requests', action: 'write', name: 'Create Requests', description: 'Create new item requests', category: 'data', isSystemPermission: true },
    { id: 'perm-8', resource: 'requests', action: 'delete', name: 'Delete Requests', description: 'Delete item requests', category: 'data', isSystemPermission: true },
    { id: 'perm-9', resource: 'requests', action: 'approve', name: 'Approve Requests', description: 'Approve or reject requests', category: 'admin', isSystemPermission: true },
    { id: 'perm-10', resource: 'requests', action: 'manage', name: 'Manage Requests', description: 'Full request management (all actions)', category: 'admin', isSystemPermission: true },
    
    // Users permissions
    { id: 'perm-11', resource: 'users', action: 'read', name: 'Read Users', description: 'View users list and profiles', category: 'admin', isSystemPermission: true },
    { id: 'perm-12', resource: 'users', action: 'write', name: 'Create Users', description: 'Create new user accounts', category: 'admin', isSystemPermission: true },
    { id: 'perm-13', resource: 'users', action: 'delete', name: 'Delete Users', description: 'Delete user accounts', category: 'admin', isSystemPermission: true },
    { id: 'perm-14', resource: 'users', action: 'manage', name: 'Manage Users', description: 'Full user management (all actions)', category: 'admin', isSystemPermission: true },
    
    // Master Data permissions
    { id: 'perm-15', resource: 'categories', action: 'read', name: 'Read Categories', description: 'View categories list', category: 'admin', isSystemPermission: true },
    { id: 'perm-16', resource: 'categories', action: 'manage', name: 'Manage Categories', description: 'Full category management', category: 'admin', isSystemPermission: true },
    { id: 'perm-17', resource: 'status_types', action: 'read', name: 'Read Status Types', description: 'View status types list', category: 'admin', isSystemPermission: true },
    { id: 'perm-18', resource: 'status_types', action: 'manage', name: 'Manage Status Types', description: 'Full status type management', category: 'admin', isSystemPermission: true },
    { id: 'perm-19', resource: 'urgency_levels', action: 'read', name: 'Read Urgency Levels', description: 'View urgency levels list', category: 'admin', isSystemPermission: true },
    { id: 'perm-20', resource: 'urgency_levels', action: 'manage', name: 'Manage Urgency Levels', description: 'Full urgency level management', category: 'admin', isSystemPermission: true },
    { id: 'perm-21', resource: 'master_data', action: 'manage', name: 'Manage Master Data', description: 'Full master data management (all types)', category: 'admin', isSystemPermission: true },
    
    // Matching permissions
    { id: 'perm-22', resource: 'matching', action: 'read', name: 'Read Matches', description: 'View donation-request matches', category: 'data', isSystemPermission: true },
    { id: 'perm-23', resource: 'matching', action: 'approve', name: 'Approve Matches', description: 'Approve or reject matches', category: 'admin', isSystemPermission: true },
    { id: 'perm-24', resource: 'matching', action: 'manage', name: 'Manage Matching', description: 'Full matching management', category: 'admin', isSystemPermission: true },
    
    // Analytics permissions
    { id: 'perm-25', resource: 'analytics', action: 'view', name: 'View Analytics', description: 'View analytics and reports', category: 'reporting', isSystemPermission: true },
    { id: 'perm-26', resource: 'analytics', action: 'export', name: 'Export Analytics', description: 'Export analytics data', category: 'reporting', isSystemPermission: true },
    
    // Settings permissions
    { id: 'perm-27', resource: 'settings', action: 'read', name: 'Read Settings', description: 'View system settings', category: 'system', isSystemPermission: true },
    { id: 'perm-28', resource: 'settings', action: 'manage', name: 'Manage Settings', description: 'Modify system settings', category: 'system', isSystemPermission: true },
    
    // Delivery permissions
    { id: 'perm-29', resource: 'delivery', action: 'read', name: 'Read Deliveries', description: 'View delivery schedules', category: 'data', isSystemPermission: true },
    { id: 'perm-30', resource: 'delivery', action: 'manage', name: 'Manage Deliveries', description: 'Full delivery management', category: 'admin', isSystemPermission: true },
    
    // Notifications permissions
    { id: 'perm-31', resource: 'notifications', action: 'read', name: 'Read Notifications', description: 'View notifications', category: 'data', isSystemPermission: true },
    { id: 'perm-32', resource: 'notifications', action: 'manage', name: 'Manage Notifications', description: 'Manage notification settings', category: 'system', isSystemPermission: true },
];

// Mock roles data
let mockRoles: Role[] = [
    {
        id: 'role-1',
        name: 'Administrator',
        key: 'admin',
        description: 'Full system access with all permissions',
        color: 'bg-red-500',
        icon: '👑',
        displayOrder: 1,
        isActive: true,
        isDefault: true,
        isSystemRole: true,
        permissions: systemPermissions.map(p => p.id), // All permissions
        featureAccess: {
            dashboard: true,
            donations: true,
            requests: true,
            matching: true,
            analytics: true,
            masterData: true,
            donorManagement: true,
            recipientManagement: true,
            settings: true,
        },
        guidelines: 'Full system administrator with complete access to all features and data',
        usageStatistics: {
            userCount: 3,
            lastAssigned: new Date(),
        },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'role-2',
        name: 'Donor',
        key: 'donor',
        description: 'Can create and manage donations',
        color: 'bg-teal-500',
        icon: '💝',
        displayOrder: 2,
        isActive: true,
        isDefault: true,
        isSystemRole: true,
        permissions: ['perm-1', 'perm-2', 'perm-6', 'perm-22', 'perm-25', 'perm-29', 'perm-31'], // Read donations, create donations, read requests, view matches, view analytics, read deliveries, read notifications
        featureAccess: {
            dashboard: true,
            donations: true,
            requests: false,
            matching: false,
            analytics: true,
            masterData: false,
            donorManagement: false,
            recipientManagement: false,
            settings: false,
        },
        restrictions: {
            maxDonationsPerDay: 10,
        },
        guidelines: 'Standard donor role for users who want to donate items',
        usageStatistics: {
            userCount: 127,
            lastAssigned: new Date(),
        },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'role-3',
        name: 'Recipient',
        key: 'recipient',
        description: 'Can create and manage item requests',
        color: 'bg-blue-500',
        icon: '🙋',
        displayOrder: 3,
        isActive: true,
        isDefault: true,
        isSystemRole: true,
        permissions: ['perm-1', 'perm-6', 'perm-7', 'perm-22', 'perm-29', 'perm-31'], // Read donations, read/create requests, view matches, read deliveries, read notifications
        featureAccess: {
            dashboard: true,
            donations: false,
            requests: true,
            matching: false,
            analytics: true,
            masterData: false,
            donorManagement: false,
            recipientManagement: false,
            settings: false,
        },
        restrictions: {
            maxRequestsPerDay: 5,
        },
        guidelines: 'Standard recipient role for users who need items',
        usageStatistics: {
            userCount: 89,
            lastAssigned: new Date(),
        },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        createdBy: 'System',
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
    {
        id: 'role-4',
        name: 'Moderator',
        key: 'moderator',
        description: 'Can approve donations and requests, manage matches',
        color: 'bg-purple-500',
        icon: '🛡️',
        displayOrder: 4,
        isActive: true,
        isDefault: false,
        isSystemRole: false,
        permissions: ['perm-1', 'perm-4', 'perm-6', 'perm-9', 'perm-11', 'perm-22', 'perm-23', 'perm-25', 'perm-29', 'perm-31'], // Read donations, approve donations, read requests, approve requests, read users, read/approve matches, view analytics, read deliveries, read notifications
        parentRoleId: 'role-2', // Inherits from Donor
        featureAccess: {
            dashboard: true,
            donations: true,
            requests: true,
            matching: true,
            analytics: true,
            masterData: false,
            donorManagement: false,
            recipientManagement: false,
            settings: false,
        },
        guidelines: 'Moderator role for trusted users who can approve content',
        usageStatistics: {
            userCount: 5,
            lastAssigned: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        createdBy: 'Admin',
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedBy: 'Admin',
    },
];

let roleChangeHistory: RoleChangeHistory[] = [];

/**
 * Get all system permissions
 */
export const getPermissions = async (): Promise<Permission[]> => {
    await delay(200);
    return [...systemPermissions];
};

/**
 * Get permissions by resource
 */
export const getPermissionsByResource = async (resource: PermissionResource): Promise<Permission[]> => {
    await delay(200);
    return systemPermissions.filter(p => p.resource === resource);
};

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = async (category: 'data' | 'admin' | 'system' | 'reporting'): Promise<Permission[]> => {
    await delay(200);
    return systemPermissions.filter(p => p.category === category);
};

/**
 * Get all roles
 */
export const getRoles = async (includeInactive: boolean = false): Promise<Role[]> => {
    await delay(300);
    let roles = [...mockRoles];
    
    if (!includeInactive) {
        roles = roles.filter(r => r.isActive);
    }
    
    return roles.sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Get a single role by ID
 */
export const getRoleById = async (id: string): Promise<Role> => {
    await delay(200);
    const role = mockRoles.find(r => r.id === id);
    if (!role) {
        throw new Error('Role not found');
    }
    return role;
};

/**
 * Get role by key
 */
export const getRoleByKey = async (key: string): Promise<Role | null> => {
    await delay(200);
    const role = mockRoles.find(r => r.key === key && r.isActive);
    return role || null;
};

/**
 * Get all permissions for a role (including inherited permissions)
 */
export const getRolePermissions = async (roleId: string, includeInherited: boolean = true): Promise<Permission[]> => {
    await delay(300);
    const role = mockRoles.find(r => r.id === roleId);
    if (!role) {
        throw new Error('Role not found');
    }
    
    let permissionIds = [...role.permissions];
    
    // If include inherited and role has parent, add parent permissions
    if (includeInherited && role.parentRoleId) {
        const parentRole = mockRoles.find(r => r.id === role.parentRoleId);
        if (parentRole) {
            permissionIds = [...new Set([...permissionIds, ...parentRole.permissions])];
        }
    }
    
    return systemPermissions.filter(p => permissionIds.includes(p.id));
};

/**
 * Create a new role
 */
export const createRole = async (
    roleData: Omit<Role, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'usageStatistics'>,
    createdBy: string
): Promise<Role> => {
    await delay(500);
    
    // Check if role key already exists
    const existingRole = mockRoles.find(r => r.key.toLowerCase() === roleData.key.toLowerCase());
    if (existingRole) {
        throw new Error(`Role with key "${roleData.key}" already exists`);
    }
    
    // Check if role name already exists
    const existingName = mockRoles.find(r => r.name.toLowerCase() === roleData.name.toLowerCase());
    if (existingName) {
        throw new Error(`Role with name "${roleData.name}" already exists`);
    }
    
    // Validate parent role exists if specified
    if (roleData.parentRoleId) {
        const parentRole = mockRoles.find(r => r.id === roleData.parentRoleId);
        if (!parentRole) {
            throw new Error('Parent role not found');
        }
    }
    
    // Validate permissions exist
    const invalidPermissions = roleData.permissions.filter(permId => 
        !systemPermissions.find(p => p.id === permId)
    );
    if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permission IDs: ${invalidPermissions.join(', ')}`);
    }
    
    const now = new Date();
    const newRole: Role = {
        ...roleData,
        id: `role-${Date.now()}`,
        usageStatistics: {
            userCount: 0,
        },
        createdAt: now,
        createdBy: createdBy,
        updatedAt: now,
        updatedBy: createdBy,
    };
    
    mockRoles.push(newRole);
    
    // Add to change history
    roleChangeHistory.push({
        id: `rh-${Date.now()}`,
        roleId: newRole.id,
        action: 'created',
        newValue: newRole,
        performedBy: createdBy,
        performedAt: now,
    });
    
    return newRole;
};

/**
 * Update an existing role
 */
export const updateRole = async (
    id: string,
    updates: Partial<Omit<Role, 'id' | 'createdAt' | 'createdBy' | 'usageStatistics'>>,
    updatedBy: string
): Promise<Role> => {
    await delay(500);
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
        throw new Error('Role not found');
    }
    
    const existingRole = mockRoles[roleIndex];
    
    // Prevent modifying system roles' isSystemRole flag or key
    if (existingRole.isSystemRole) {
        if (updates.isSystemRole !== undefined && !updates.isSystemRole) {
            throw new Error('Cannot remove system role flag from system role');
        }
        if (updates.key && updates.key !== existingRole.key) {
            throw new Error('Cannot change key of system role');
        }
    }
    
    // Check if new key conflicts with another role
    if (updates.key && updates.key.toLowerCase() !== existingRole.key.toLowerCase()) {
        const keyConflict = mockRoles.find(r => r.id !== id && r.key.toLowerCase() === updates.key.toLowerCase());
        if (keyConflict) {
            throw new Error(`Role with key "${updates.key}" already exists`);
        }
    }
    
    // Check if new name conflicts with another role
    if (updates.name && updates.name.toLowerCase() !== existingRole.name.toLowerCase()) {
        const nameConflict = mockRoles.find(r => r.id !== id && r.name.toLowerCase() === updates.name.toLowerCase());
        if (nameConflict) {
            throw new Error(`Role with name "${updates.name}" already exists`);
        }
    }
    
    // Validate parent role if changed
    if (updates.parentRoleId !== undefined) {
        if (updates.parentRoleId && updates.parentRoleId === id) {
            throw new Error('Role cannot be its own parent');
        }
        if (updates.parentRoleId) {
            const parentRole = mockRoles.find(r => r.id === updates.parentRoleId);
            if (!parentRole) {
                throw new Error('Parent role not found');
            }
        }
    }
    
    // Validate permissions if updated
    if (updates.permissions) {
        const invalidPermissions = updates.permissions.filter(permId => 
            !systemPermissions.find(p => p.id === permId)
        );
        if (invalidPermissions.length > 0) {
            throw new Error(`Invalid permission IDs: ${invalidPermissions.join(', ')}`);
        }
    }
    
    const previousValue = { ...existingRole };
    const updatedRole: Role = {
        ...existingRole,
        ...updates,
        updatedAt: new Date(),
        updatedBy: updatedBy,
    };
    
    mockRoles[roleIndex] = updatedRole;
    
    // Add to change history
    const action = updates.permissions ? 'permissions_updated' : 'updated';
    roleChangeHistory.push({
        id: `rh-${Date.now()}`,
        roleId: id,
        action,
        previousValue: previousValue,
        newValue: updatedRole,
        performedBy: updatedBy,
        performedAt: new Date(),
    });
    
    return updatedRole;
};

/**
 * Delete a role
 */
export const deleteRole = async (id: string, deletedBy: string): Promise<void> => {
    await delay(500);
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
        throw new Error('Role not found');
    }
    
    const role = mockRoles[roleIndex];
    
    // Prevent deleting system roles
    if (role.isSystemRole) {
        throw new Error('Cannot delete system role. Deactivate it instead.');
    }
    
    // Prevent deleting default roles
    if (role.isDefault) {
        throw new Error('Cannot delete default system role. Deactivate it instead.');
    }
    
    // Check if role is in use
    if (role.usageStatistics.userCount > 0) {
        throw new Error('Cannot delete role that is in use. Deactivate it instead.');
    }
    
    // Check if any roles inherit from this role
    const inheritingRoles = mockRoles.filter(r => r.parentRoleId === id);
    if (inheritingRoles.length > 0) {
        throw new Error(`Cannot delete role. ${inheritingRoles.length} role(s) inherit from this role.`);
    }
    
    // Remove from roles array
    mockRoles.splice(roleIndex, 1);
    
    // Add to change history
    roleChangeHistory.push({
        id: `rh-${Date.now()}`,
        roleId: id,
        action: 'deleted',
        previousValue: role,
        performedBy: deletedBy,
        performedAt: new Date(),
    });
};

/**
 * Activate a role
 */
export const activateRole = async (id: string, activatedBy: string): Promise<Role> => {
    await delay(300);
    return updateRole(id, { isActive: true }, activatedBy);
};

/**
 * Deactivate a role
 */
export const deactivateRole = async (id: string, deactivatedBy: string): Promise<Role> => {
    await delay(300);
    return updateRole(id, { isActive: false }, deactivatedBy);
};

/**
 * Update role permissions
 */
export const updateRolePermissions = async (
    roleId: string,
    permissionIds: string[],
    updatedBy: string
): Promise<Role> => {
    await delay(500);
    
    // Validate permissions exist
    const invalidPermissions = permissionIds.filter(permId => 
        !systemPermissions.find(p => p.id === permId)
    );
    if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permission IDs: ${invalidPermissions.join(', ')}`);
    }
    
    return updateRole(roleId, { permissions: permissionIds }, updatedBy);
};

/**
 * Get role change history
 */
export const getRoleChangeHistory = async (roleId?: string): Promise<RoleChangeHistory[]> => {
    await delay(200);
    
    let history = [...roleChangeHistory];
    
    if (roleId) {
        history = history.filter(rh => rh.roleId === roleId);
    }
    
    return history.sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
};

/**
 * Get roles statistics
 */
export const getRoleStatistics = async (): Promise<{
    totalRoles: number;
    activeRoles: number;
    inactiveRoles: number;
    systemRoles: number;
    customRoles: number;
    totalUsers: number;
    mostUsedRole: Role | null;
    averagePermissionsPerRole: number;
}> => {
    await delay(200);
    
    const activeRoles = mockRoles.filter(r => r.isActive);
    const inactiveRoles = mockRoles.filter(r => !r.isActive);
    const systemRoles = mockRoles.filter(r => r.isSystemRole);
    const customRoles = mockRoles.filter(r => !r.isSystemRole);
    
    const totalUsers = mockRoles.reduce((sum, r) => sum + r.usageStatistics.userCount, 0);
    
    const mostUsedRole = mockRoles.length > 0
        ? mockRoles.reduce((prev, curr) =>
            curr.usageStatistics.userCount > prev.usageStatistics.userCount ? curr : prev
        )
        : null;
    
    const totalPermissions = mockRoles.reduce((sum, r) => sum + r.permissions.length, 0);
    const averagePermissionsPerRole = mockRoles.length > 0 ? totalPermissions / mockRoles.length : 0;
    
    return {
        totalRoles: mockRoles.length,
        activeRoles: activeRoles.length,
        inactiveRoles: inactiveRoles.length,
        systemRoles: systemRoles.length,
        customRoles: customRoles.length,
        totalUsers,
        mostUsedRole,
        averagePermissionsPerRole: Math.round(averagePermissionsPerRole * 10) / 10,
    };
};

/**
 * Search roles
 */
export const searchRoles = async (
    query: string,
    includeInactive: boolean = false
): Promise<Role[]> => {
    await delay(300);
    
    const lowerQuery = query.toLowerCase();
    let roles = [...mockRoles];
    
    if (!includeInactive) {
        roles = roles.filter(r => r.isActive);
    }
    
    return roles.filter(r =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.key.toLowerCase().includes(lowerQuery) ||
        r.description?.toLowerCase().includes(lowerQuery) ||
        r.guidelines?.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Get role for user (returns role ID based on user's primary role)
 */
export const getRoleForUser = async (userRole: 'donor' | 'admin' | 'recipient'): Promise<string | null> => {
    await delay(200);
    
    // Map user roles to system roles
    const roleMapping: Record<'donor' | 'admin' | 'recipient', string> = {
        'admin': 'role-1',      // Administrator
        'donor': 'role-2',      // Donor
        'recipient': 'role-3',  // Recipient
    };
    
    const roleId = roleMapping[userRole];
    const role = mockRoles.find(r => r.id === roleId && r.isActive);
    
    return role ? roleId : null;
};

/**
 * Assign role to user (updates role usage statistics)
 */
export const assignRoleToUser = async (roleId: string, userId: string, assignedBy: string): Promise<void> => {
    await delay(300);
    
    const role = mockRoles.find(r => r.id === roleId);
    if (!role) {
        throw new Error('Role not found');
    }
    
    if (!role.isActive) {
        throw new Error('Cannot assign inactive role');
    }
    
    // Update role usage statistics
    role.usageStatistics.userCount = (role.usageStatistics.userCount || 0) + 1;
    role.usageStatistics.lastAssigned = new Date();
    role.updatedAt = new Date();
    role.updatedBy = assignedBy;
    
    // Add to change history
    roleChangeHistory.push({
        id: `rh-${Date.now()}`,
        roleId: roleId,
        action: 'activated',
        newValue: { usageStatistics: role.usageStatistics },
        performedBy: assignedBy,
        performedAt: new Date(),
        notes: `Role assigned to user ${userId}`,
    });
};

// ==================== MATCHING ALGORITHM CONFIGURATION ====================

// Mock matching algorithm configuration data
let mockMatchingConfig: MatchingAlgorithmConfig = {
    id: 'matching-config-1',
    version: '1.0',
    description: 'Default matching algorithm configuration',
    weights: {
        categoryMatch: 40,
        quantityFit: 30,
        locationProximity: 0,
        urgency: 20,
        requestAge: 0,
    },
    thresholds: {
        minimumScore: 50,
        highScoreThreshold: 80,
        autoMatchThreshold: 95,
    },
    preferences: {
        preferExactQuantity: true,
        preferNearbyLocations: true,
        prioritizeUrgency: true,
        prioritizeRecentRequests: false,
        considerRequestAge: false,
        maxRequestsPerDonation: 0, // 0 = unlimited
        maxDonationsPerRequest: 0, // 0 = unlimited
    },
    autoMatching: {
        enabled: false,
        autoMatchOnThreshold: false,
        requireAdminApproval: true,
        notifyOnAutoMatch: true,
        excludeCategories: [],
        excludeUrgencyLevels: [],
    },
    isActive: true,
    statistics: {
        totalMatches: 0,
        confirmedMatches: 0,
        fulfilledMatches: 0,
        rejectedMatches: 0,
        autoMatched: 0,
        manualMatched: 0,
        averageScore: 0,
        highScoreMatches: 0,
        lowScoreMatches: 0,
        byCategory: {},
        byUrgency: {
            high: 0,
            medium: 0,
            low: 0,
        },
        byStatus: {
            pending: 0,
            confirmed: 0,
            rejected: 0,
            fulfilled: 0,
            cancelled: 0,
        },
        matchingPerformance: {
            averageTimeToMatch: 0,
            averageScoreTrend: [],
            matchSuccessRate: 0,
        },
        recentMatches: [],
        lastUpdated: new Date(),
    },
    versions: [],
    usageStatistics: {
        totalSuggestions: 0,
        suggestionsAccepted: 0,
        suggestionsRejected: 0,
        averageScoreGenerated: 0,
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    createdBy: 'System',
    updatedAt: new Date(),
    updatedBy: 'Admin',
};

let matchingConfigChangeHistory: MatchingAlgorithmChangeHistory[] = [];

/**
 * Get matching algorithm configuration
 */
export const getMatchingAlgorithmConfig = async (): Promise<MatchingAlgorithmConfig> => {
    await delay(300);
    return { ...mockMatchingConfig };
};

/**
 * Update matching score weights
 */
export const updateMatchingWeights = async (
    weights: Partial<MatchingScoreWeights>,
    updatedBy: string
): Promise<MatchingAlgorithmConfig> => {
    await delay(400);
    
    const previousWeights = { ...mockMatchingConfig.weights };
    mockMatchingConfig.weights = {
        ...mockMatchingConfig.weights,
        ...weights,
    };
    mockMatchingConfig.updatedAt = new Date();
    mockMatchingConfig.updatedBy = updatedBy;
    
    // Add to change history
    matchingConfigChangeHistory.push({
        id: `mh-${Date.now()}`,
        configId: mockMatchingConfig.id,
        action: 'weights_updated',
        previousValue: { weights: previousWeights },
        newValue: { weights: mockMatchingConfig.weights },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Matching score weights updated',
    });
    
    return { ...mockMatchingConfig };
};

/**
 * Update matching thresholds
 */
export const updateMatchingThresholds = async (
    thresholds: Partial<MatchingThresholds>,
    updatedBy: string
): Promise<MatchingAlgorithmConfig> => {
    await delay(400);
    
    const previousThresholds = { ...mockMatchingConfig.thresholds };
    mockMatchingConfig.thresholds = {
        ...mockMatchingConfig.thresholds,
        ...thresholds,
    };
    mockMatchingConfig.updatedAt = new Date();
    mockMatchingConfig.updatedBy = updatedBy;
    
    // Add to change history
    matchingConfigChangeHistory.push({
        id: `mh-${Date.now()}`,
        configId: mockMatchingConfig.id,
        action: 'thresholds_updated',
        previousValue: { thresholds: previousThresholds },
        newValue: { thresholds: mockMatchingConfig.thresholds },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Matching thresholds updated',
    });
    
    return { ...mockMatchingConfig };
};

/**
 * Update matching preference rules
 */
export const updateMatchingPreferences = async (
    preferences: Partial<MatchingPreferenceRules>,
    updatedBy: string
): Promise<MatchingAlgorithmConfig> => {
    await delay(400);
    
    const previousPreferences = { ...mockMatchingConfig.preferences };
    mockMatchingConfig.preferences = {
        ...mockMatchingConfig.preferences,
        ...preferences,
    };
    mockMatchingConfig.updatedAt = new Date();
    mockMatchingConfig.updatedBy = updatedBy;
    
    // Add to change history
    matchingConfigChangeHistory.push({
        id: `mh-${Date.now()}`,
        configId: mockMatchingConfig.id,
        action: 'preferences_updated',
        previousValue: { preferences: previousPreferences },
        newValue: { preferences: mockMatchingConfig.preferences },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Matching preference rules updated',
    });
    
    return { ...mockMatchingConfig };
};

/**
 * Update auto-matching rules
 */
export const updateAutoMatchingRules = async (
    autoMatching: Partial<AutoMatchingRules>,
    updatedBy: string
): Promise<MatchingAlgorithmConfig> => {
    await delay(400);
    
    const previousAutoMatching = { ...mockMatchingConfig.autoMatching };
    mockMatchingConfig.autoMatching = {
        ...mockMatchingConfig.autoMatching,
        ...autoMatching,
    };
    mockMatchingConfig.updatedAt = new Date();
    mockMatchingConfig.updatedBy = updatedBy;
    
    // Add to change history
    matchingConfigChangeHistory.push({
        id: `mh-${Date.now()}`,
        configId: mockMatchingConfig.id,
        action: 'auto_matching_updated',
        previousValue: { autoMatching: previousAutoMatching },
        newValue: { autoMatching: mockMatchingConfig.autoMatching },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Auto-matching rules updated',
    });
    
    return { ...mockMatchingConfig };
};

/**
 * Create a new algorithm version
 */
export const createMatchingAlgorithmVersion = async (
    description: string,
    createdBy: string
): Promise<MatchingAlgorithmVersion> => {
    await delay(500);
    
    // Get current version number and increment
    const currentVersion = mockMatchingConfig.version;
    const versionParts = currentVersion.split('.');
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;
    
    const newVersionConfig: MatchingAlgorithmVersion = {
        version: newVersion,
        description,
        weights: { ...mockMatchingConfig.weights },
        thresholds: { ...mockMatchingConfig.thresholds },
        preferences: { ...mockMatchingConfig.preferences },
        autoMatching: { ...mockMatchingConfig.autoMatching },
        isActive: false,
        createdAt: new Date(),
        createdBy,
    };
    
    mockMatchingConfig.versions.push(newVersionConfig);
    mockMatchingConfig.version = newVersion;
    mockMatchingConfig.description = description;
    mockMatchingConfig.updatedAt = new Date();
    mockMatchingConfig.updatedBy = createdBy;
    
    // Add to change history
    matchingConfigChangeHistory.push({
        id: `mh-${Date.now()}`,
        configId: mockMatchingConfig.id,
        action: 'version_created',
        newValue: { version: newVersion, description },
        performedBy: createdBy,
        performedAt: new Date(),
        notes: `New algorithm version ${newVersion} created: ${description}`,
    });
    
    return { ...newVersionConfig };
};

/**
 * Activate a specific algorithm version
 */
export const activateMatchingAlgorithmVersion = async (
    version: string,
    activatedBy: string
): Promise<MatchingAlgorithmConfig> => {
    await delay(400);
    
    const versionConfig = mockMatchingConfig.versions.find(v => v.version === version);
    if (!versionConfig) {
        throw new Error(`Algorithm version ${version} not found`);
    }
    
    // Deactivate all versions
    mockMatchingConfig.versions.forEach(v => {
        v.isActive = false;
    });
    
    // Activate selected version
    versionConfig.isActive = true;
    versionConfig.activatedAt = new Date();
    versionConfig.activatedBy = activatedBy;
    
    // Apply version settings to main config
    mockMatchingConfig.weights = { ...versionConfig.weights };
    mockMatchingConfig.thresholds = { ...versionConfig.thresholds };
    mockMatchingConfig.preferences = { ...versionConfig.preferences };
    mockMatchingConfig.autoMatching = { ...versionConfig.autoMatching };
    mockMatchingConfig.version = version;
    mockMatchingConfig.isActive = true;
    mockMatchingConfig.updatedAt = new Date();
    mockMatchingConfig.updatedBy = activatedBy;
    
    // Add to change history
    matchingConfigChangeHistory.push({
        id: `mh-${Date.now()}`,
        configId: mockMatchingConfig.id,
        action: 'activated',
        newValue: { version, weights: versionConfig.weights, thresholds: versionConfig.thresholds },
        performedBy: activatedBy,
        performedAt: new Date(),
        notes: `Algorithm version ${version} activated`,
    });
    
    return { ...mockMatchingConfig };
};

/**
 * Get matching statistics
 */
export const getMatchingStatistics = async (): Promise<MatchingStatistics> => {
    await delay(300);
    
    // Update statistics (in production, this would query real data)
    const stats = mockMatchingConfig.statistics;
    
    // Simulate some statistics updates
    stats.lastUpdated = new Date();
    
    return { ...stats };
};

/**
 * Update matching statistics (called by matching service when matches occur)
 */
export const updateMatchingStatistics = async (
    updates: Partial<MatchingStatistics>
): Promise<void> => {
    await delay(200);
    
    mockMatchingConfig.statistics = {
        ...mockMatchingConfig.statistics,
        ...updates,
        lastUpdated: new Date(),
    };
};

/**
 * Get matching algorithm change history
 */
export const getMatchingAlgorithmChangeHistory = async (): Promise<MatchingAlgorithmChangeHistory[]> => {
    await delay(300);
    return [...matchingConfigChangeHistory].sort((a, b) => 
        b.performedAt.getTime() - a.performedAt.getTime()
    );
};

/**
 * Reset matching algorithm configuration to defaults
 */
export const resetMatchingAlgorithmConfig = async (
    resetBy: string
): Promise<MatchingAlgorithmConfig> => {
    await delay(500);
    
    const previousConfig = { ...mockMatchingConfig };
    
    // Reset to defaults
    mockMatchingConfig.weights = {
        categoryMatch: 40,
        quantityFit: 30,
        locationProximity: 0,
        urgency: 20,
        requestAge: 0,
    };
    mockMatchingConfig.thresholds = {
        minimumScore: 50,
        highScoreThreshold: 80,
        autoMatchThreshold: 95,
    };
    mockMatchingConfig.preferences = {
        preferExactQuantity: true,
        preferNearbyLocations: true,
        prioritizeUrgency: true,
        prioritizeRecentRequests: false,
        considerRequestAge: false,
        maxRequestsPerDonation: 0,
        maxDonationsPerRequest: 0,
    };
    mockMatchingConfig.autoMatching = {
        enabled: false,
        autoMatchOnThreshold: false,
        requireAdminApproval: true,
        notifyOnAutoMatch: true,
        excludeCategories: [],
        excludeUrgencyLevels: [],
    };
    mockMatchingConfig.updatedAt = new Date();
    mockMatchingConfig.updatedBy = resetBy;
    
    // Add to change history
    matchingConfigChangeHistory.push({
        id: `mh-${Date.now()}`,
        configId: mockMatchingConfig.id,
        action: 'updated',
        previousValue: previousConfig,
        newValue: { ...mockMatchingConfig },
        performedBy: resetBy,
        performedAt: new Date(),
        notes: 'Matching algorithm configuration reset to defaults',
    });
    
    return { ...mockMatchingConfig };
};

// ============================================
// System Configuration Settings
// ============================================

// Mock system configuration data
let mockSystemConfig: SystemConfiguration = {
    id: 'sys-config-1',
    version: '1.0.0',
    generalSettings: {
        appName: 'Charity Connect',
        logo: undefined,
        primaryColor: '#14b8a6', // teal-500
        secondaryColor: '#0d9488', // teal-600
        accentColor: '#0f766e', // teal-700
        themeMode: 'light',
        footerText: 'Connecting hearts through charity',
        supportEmail: 'support@charityconnect.org',
        supportPhone: '+1-555-0123',
        supportAddress: '123 Charity Street, City, State 12345',
    },
    donationLimits: {
        globalMinQuantity: 1,
        globalMaxQuantity: 1000,
        categoryLimits: {},
    },
    requestLimits: {
        maxActiveRequestsPerRecipient: 5,
        maxRequestsPerDay: 3,
        maxRequestsPerMonth: 20,
    },
    requestExpiryRules: {
        defaultExpirationDays: 90,
        urgencyExpirationDays: {
            high: 30,
            medium: 60,
            low: 90,
        },
        autoExpiryEnabled: true,
        notificationBeforeExpiry: 7,
    },
    accountVerificationRules: {
        requireVerificationForRecipients: true,
        requireVerificationForDonors: false,
        autoApproveVerified: false,
        verificationRequiredDocuments: ['id', 'address_proof'],
        verificationTimeframe: 7,
        manualReviewRequired: true,
        verificationExpiryDays: 365,
    },
    imageUploadSettings: {
        maxFileSize: 5242880, // 5MB in bytes
        maxFileSizeMB: 5,
        allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        maxImagesPerItem: 5,
        compressionLevel: 80,
        maxWidth: 1920,
        maxHeight: 1080,
        generateThumbnails: true,
        thumbnailSizes: [150, 300, 600],
    },
    exportSettings: {
        defaultFormat: 'csv',
        availableFormats: ['csv', 'json', 'excel', 'pdf'],
        scheduledReports: {
            enabled: false,
            frequency: 'weekly',
            recipients: [],
            format: 'csv',
            reportTypes: ['donations', 'requests'],
        },
        includeMetadata: true,
    },
    paginationSettings: {
        defaultItemsPerPage: 25,
        itemsPerPageOptions: [10, 25, 50, 100],
        maxItemsPerPage: 100,
    },
    featureFlags: {
        donations: true,
        requests: true,
        matching: true,
        leaderboard: true,
        achievements: true,
        impactStories: true,
        recipientRegistration: true,
        donorRegistration: true,
        notifications: true,
        analytics: true,
        export: true,
    },
    businessRules: {
        allowPartialMatching: true,
        requireAdminApprovalForDonations: true,
        requireAdminApprovalForRequests: true,
        allowDonationEditing: true,
        allowRequestEditing: true,
        autoAssignCategories: false,
        enableQuantityTracking: true,
        enableLocationTracking: false,
        enableNotifications: true,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        enableInAppNotifications: true,
        donationCooldownHours: undefined,
        requestCooldownHours: undefined,
    },
    announcements: [],
    createdAt: new Date(),
    createdBy: 'System',
    updatedAt: new Date(),
    updatedBy: 'System',
};

let systemConfigChangeHistory: SystemConfigurationChangeHistory[] = [];

/**
 * Get current system configuration
 */
export const getSystemConfiguration = async (): Promise<SystemConfiguration> => {
    await delay(300);
    return { ...mockSystemConfig };
};

/**
 * Update general app settings
 */
export const updateGeneralAppSettings = async (
    settings: Partial<GeneralAppSettings>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.generalSettings = {
        ...mockSystemConfig.generalSettings,
        ...settings,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'settings_updated',
        section: 'generalSettings',
        previousValue: { generalSettings: previousConfig.generalSettings },
        newValue: { generalSettings: mockSystemConfig.generalSettings },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'General app settings updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update donation limits
 */
export const updateDonationLimits = async (
    limits: Partial<DonationLimits>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.donationLimits = {
        ...mockSystemConfig.donationLimits,
        ...limits,
        categoryLimits: limits.categoryLimits || mockSystemConfig.donationLimits.categoryLimits,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'limits_updated',
        section: 'donationLimits',
        previousValue: { donationLimits: previousConfig.donationLimits },
        newValue: { donationLimits: mockSystemConfig.donationLimits },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Donation limits updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update request limits
 */
export const updateRequestLimits = async (
    limits: Partial<RequestLimits>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.requestLimits = {
        ...mockSystemConfig.requestLimits,
        ...limits,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'limits_updated',
        section: 'requestLimits',
        previousValue: { requestLimits: previousConfig.requestLimits },
        newValue: { requestLimits: mockSystemConfig.requestLimits },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Request limits updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update request expiry rules
 */
export const updateRequestExpiryRules = async (
    rules: Partial<RequestExpiryRules>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.requestExpiryRules = {
        ...mockSystemConfig.requestExpiryRules,
        ...rules,
        urgencyExpirationDays: rules.urgencyExpirationDays || mockSystemConfig.requestExpiryRules.urgencyExpirationDays,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'rules_updated',
        section: 'requestExpiryRules',
        previousValue: { requestExpiryRules: previousConfig.requestExpiryRules },
        newValue: { requestExpiryRules: mockSystemConfig.requestExpiryRules },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Request expiry rules updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update account verification rules
 */
export const updateAccountVerificationRules = async (
    rules: Partial<AccountVerificationRules>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.accountVerificationRules = {
        ...mockSystemConfig.accountVerificationRules,
        ...rules,
        verificationRequiredDocuments: rules.verificationRequiredDocuments || mockSystemConfig.accountVerificationRules.verificationRequiredDocuments,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'rules_updated',
        section: 'accountVerificationRules',
        previousValue: { accountVerificationRules: previousConfig.accountVerificationRules },
        newValue: { accountVerificationRules: mockSystemConfig.accountVerificationRules },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Account verification rules updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update image upload settings
 */
export const updateImageUploadSettings = async (
    settings: Partial<ImageUploadSettings>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    
    // Auto-calculate maxFileSize from maxFileSizeMB if provided
    if (settings.maxFileSizeMB !== undefined && !settings.maxFileSize) {
        settings.maxFileSize = settings.maxFileSizeMB * 1024 * 1024;
    }
    
    mockSystemConfig.imageUploadSettings = {
        ...mockSystemConfig.imageUploadSettings,
        ...settings,
        allowedFormats: settings.allowedFormats || mockSystemConfig.imageUploadSettings.allowedFormats,
        thumbnailSizes: settings.thumbnailSizes || mockSystemConfig.imageUploadSettings.thumbnailSizes,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'settings_updated',
        section: 'imageUploadSettings',
        previousValue: { imageUploadSettings: previousConfig.imageUploadSettings },
        newValue: { imageUploadSettings: mockSystemConfig.imageUploadSettings },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Image upload settings updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update export settings
 */
export const updateExportSettings = async (
    settings: Partial<ExportSettings>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.exportSettings = {
        ...mockSystemConfig.exportSettings,
        ...settings,
        availableFormats: settings.availableFormats || mockSystemConfig.exportSettings.availableFormats,
        scheduledReports: settings.scheduledReports || mockSystemConfig.exportSettings.scheduledReports,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'settings_updated',
        section: 'exportSettings',
        previousValue: { exportSettings: previousConfig.exportSettings },
        newValue: { exportSettings: mockSystemConfig.exportSettings },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Export settings updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update pagination settings
 */
export const updatePaginationSettings = async (
    settings: Partial<PaginationSettings>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.paginationSettings = {
        ...mockSystemConfig.paginationSettings,
        ...settings,
        itemsPerPageOptions: settings.itemsPerPageOptions || mockSystemConfig.paginationSettings.itemsPerPageOptions,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'settings_updated',
        section: 'paginationSettings',
        previousValue: { paginationSettings: previousConfig.paginationSettings },
        newValue: { paginationSettings: mockSystemConfig.paginationSettings },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Pagination settings updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update feature flags
 */
export const updateFeatureFlags = async (
    flags: Partial<FeatureFlags>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.featureFlags = {
        ...mockSystemConfig.featureFlags,
        ...flags,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'feature_flag_updated',
        section: 'featureFlags',
        previousValue: { featureFlags: previousConfig.featureFlags },
        newValue: { featureFlags: mockSystemConfig.featureFlags },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Feature flags updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update business rules
 */
export const updateBusinessRules = async (
    rules: Partial<BusinessRules>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const previousConfig = { ...mockSystemConfig };
    mockSystemConfig.businessRules = {
        ...mockSystemConfig.businessRules,
        ...rules,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'rules_updated',
        section: 'businessRules',
        previousValue: { businessRules: previousConfig.businessRules },
        newValue: { businessRules: mockSystemConfig.businessRules },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: 'Business rules updated',
    });
    
    return { ...mockSystemConfig };
};

/**
 * Create system announcement
 */
export const createSystemAnnouncement = async (
    announcement: Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const newAnnouncement: SystemAnnouncement = {
        ...announcement,
        id: `ann-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy: createdBy,
    };
    
    mockSystemConfig.announcements = [...mockSystemConfig.announcements, newAnnouncement];
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = createdBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'announcement_created',
        section: 'announcements',
        previousValue: { announcements: mockSystemConfig.announcements.filter(a => a.id !== newAnnouncement.id) },
        newValue: { announcements: mockSystemConfig.announcements },
        performedBy: createdBy,
        performedAt: new Date(),
        notes: `Announcement created: ${newAnnouncement.title}`,
    });
    
    return { ...mockSystemConfig };
};

/**
 * Update system announcement
 */
export const updateSystemAnnouncement = async (
    announcementId: string,
    announcement: Partial<SystemAnnouncement>,
    updatedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const announcementIndex = mockSystemConfig.announcements.findIndex(a => a.id === announcementId);
    if (announcementIndex === -1) {
        throw new Error('Announcement not found');
    }
    
    const previousAnnouncement = { ...mockSystemConfig.announcements[announcementIndex] };
    
    mockSystemConfig.announcements[announcementIndex] = {
        ...mockSystemConfig.announcements[announcementIndex],
        ...announcement,
        updatedAt: new Date(),
        updatedBy,
    };
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = updatedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'announcement_updated',
        section: 'announcements',
        previousValue: { announcements: [previousAnnouncement] },
        newValue: { announcements: [mockSystemConfig.announcements[announcementIndex]] },
        performedBy: updatedBy,
        performedAt: new Date(),
        notes: `Announcement updated: ${mockSystemConfig.announcements[announcementIndex].title}`,
    });
    
    return { ...mockSystemConfig };
};

/**
 * Delete system announcement
 */
export const deleteSystemAnnouncement = async (
    announcementId: string,
    deletedBy: string
): Promise<SystemConfiguration> => {
    await delay(400);
    
    const announcementIndex = mockSystemConfig.announcements.findIndex(a => a.id === announcementId);
    if (announcementIndex === -1) {
        throw new Error('Announcement not found');
    }
    
    const deletedAnnouncement = mockSystemConfig.announcements[announcementIndex];
    mockSystemConfig.announcements = mockSystemConfig.announcements.filter(a => a.id !== announcementId);
    mockSystemConfig.updatedAt = new Date();
    mockSystemConfig.updatedBy = deletedBy;
    
    systemConfigChangeHistory.push({
        id: `sch-${Date.now()}`,
        configId: mockSystemConfig.id,
        action: 'announcement_deleted',
        section: 'announcements',
        previousValue: { announcements: [deletedAnnouncement] },
        newValue: { announcements: mockSystemConfig.announcements },
        performedBy: deletedBy,
        performedAt: new Date(),
        notes: `Announcement deleted: ${deletedAnnouncement.title}`,
    });
    
    return { ...mockSystemConfig };
};

/**
 * Get system configuration change history
 */
export const getSystemConfigurationChangeHistory = async (
    limit: number = 100
): Promise<SystemConfigurationChangeHistory[]> => {
    await delay(300);
    return [...systemConfigChangeHistory]
        .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime())
        .slice(0, limit);
};

