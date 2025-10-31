import { ItemRequest } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock storage for item requests
let mockItemRequests: ItemRequest[] = [];

// Available categories matching donation categories
export const REQUEST_CATEGORIES = ['Clothing', 'Food', 'Electronics', 'Books', 'Furniture', 'Medical', 'Toys', 'Other'];

// Request expiration days (default: 90 days)
const REQUEST_EXPIRATION_DAYS = 90;

/**
 * Create a new item request
 */
export const createItemRequest = async (request: Omit<ItemRequest, 'id' | 'submittedAt' | 'status'>): Promise<ItemRequest> => {
    await delay(600);
    
    // Validate required fields
    if (!request.recipientId || !request.category || !request.itemName || !request.quantityNeeded || !request.description) {
        throw new Error('Missing required fields');
    }
    
    // Validate category
    if (!REQUEST_CATEGORIES.includes(request.category)) {
        throw new Error('Invalid category');
    }
    
    // Validate urgency
    if (!['high', 'medium', 'low'].includes(request.urgency)) {
        throw new Error('Invalid urgency level');
    }
    
    // Validate visibility
    if (!['public', 'private'].includes(request.visibility)) {
        throw new Error('Invalid visibility setting');
    }
    
    const newRequest: ItemRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...request,
        status: 'pending',
        matchingStatus: 'waiting',
        submittedAt: new Date(),
    };
    
    mockItemRequests.push(newRequest);
    return newRequest;
};

/**
 * Get all item requests for a recipient
 */
export const getItemRequestsByRecipient = async (recipientId: string): Promise<ItemRequest[]> => {
    await delay(300);
    return mockItemRequests
        .filter(r => r.recipientId === recipientId)
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

/**
 * Get active item requests (pending, approved, matched)
 */
export const getActiveItemRequests = async (recipientId: string): Promise<ItemRequest[]> => {
    await delay(300);
    return mockItemRequests
        .filter(r => 
            r.recipientId === recipientId &&
            (r.status === 'pending' || r.status === 'approved' || r.status === 'matched' || r.status === 'partially_matched')
        )
        .sort((a, b) => {
            // Sort by urgency first, then by date
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
            if (urgencyDiff !== 0) return urgencyDiff;
            return b.submittedAt.getTime() - a.submittedAt.getTime();
        });
};

/**
 * Get a single item request by ID
 */
export const getItemRequestById = async (requestId: string): Promise<ItemRequest | null> => {
    await delay(300);
    return mockItemRequests.find(r => r.id === requestId) || null;
};

/**
 * Update an item request
 */
export const updateItemRequest = async (
    requestId: string,
    updates: Partial<ItemRequest>
): Promise<ItemRequest> => {
    await delay(400);
    
    const requestIndex = mockItemRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
        throw new Error('Request not found');
    }
    
    const existingRequest = mockItemRequests[requestIndex];
    
    // Validate category if being updated
    if (updates.category && !REQUEST_CATEGORIES.includes(updates.category)) {
        throw new Error('Invalid category');
    }
    
    // Validate urgency if being updated
    if (updates.urgency && !['high', 'medium', 'low'].includes(updates.urgency)) {
        throw new Error('Invalid urgency level');
    }
    
    // Update status-specific fields
    if (updates.status === 'approved' && !existingRequest.approvedAt) {
        updates.approvedAt = new Date();
    }
    
    if (updates.status === 'fulfilled' && !existingRequest.fulfilledAt) {
        updates.fulfilledAt = new Date();
    }
    
    if (updates.status === 'cancelled' && !existingRequest.cancelledAt) {
        updates.cancelledAt = new Date();
    }
    
    const updatedRequest: ItemRequest = {
        ...existingRequest,
        ...updates,
    };
    
    mockItemRequests[requestIndex] = updatedRequest;
    return updatedRequest;
};

/**
 * Cancel an item request
 */
export const cancelItemRequest = async (requestId: string, cancelledBy?: string): Promise<ItemRequest> => {
    await delay(400);
    
    const request = await getItemRequestById(requestId);
    if (!request) {
        throw new Error('Request not found');
    }
    
    if (request.status === 'fulfilled') {
        throw new Error('Cannot cancel a fulfilled request');
    }
    
    if (request.status === 'cancelled') {
        throw new Error('Request is already cancelled');
    }
    
    return await updateItemRequest(requestId, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: cancelledBy || request.recipientName,
    });
};

/**
 * Delete an item request (only if pending or cancelled)
 */
export const deleteItemRequest = async (requestId: string): Promise<void> => {
    await delay(400);
    
    const request = await getItemRequestById(requestId);
    if (!request) {
        throw new Error('Request not found');
    }
    
    // Only allow deletion of pending or cancelled requests
    if (request.status !== 'pending' && request.status !== 'cancelled') {
        throw new Error('Can only delete pending or cancelled requests');
    }
    
    mockItemRequests = mockItemRequests.filter(r => r.id !== requestId);
};

/**
 * Check and expire old requests
 */
export const expireOldRequests = async (): Promise<number> => {
    await delay(200);
    
    const now = new Date();
    const expirationDate = new Date(now.getTime() - REQUEST_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    
    let expiredCount = 0;
    
    mockItemRequests.forEach(request => {
        // Only expire pending or approved requests that are older than expiration date
        if (
            (request.status === 'pending' || request.status === 'approved' || request.status === 'matched') &&
            request.submittedAt < expirationDate
        ) {
            request.status = 'expired';
            expiredCount++;
        }
    });
    
    return expiredCount;
};

/**
 * Get all public item requests (for donors to view)
 */
export const getPublicItemRequests = async (): Promise<ItemRequest[]> => {
    await delay(300);
    
    // Expire old requests first
    await expireOldRequests();
    
    return mockItemRequests
        .filter(r => r.visibility === 'public' && r.status !== 'cancelled' && r.status !== 'expired')
        .sort((a, b) => {
            // Sort by urgency, then by date
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
            if (urgencyDiff !== 0) return urgencyDiff;
            return b.submittedAt.getTime() - a.submittedAt.getTime();
        });
};

/**
 * Get item requests by category
 */
export const getItemRequestsByCategory = async (category: string): Promise<ItemRequest[]> => {
    await delay(300);
    return mockItemRequests
        .filter(r => r.category === category && r.status !== 'cancelled' && r.status !== 'expired')
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

/**
 * Search item requests
 */
export const searchItemRequests = async (
    query: string,
    recipientId?: string
): Promise<ItemRequest[]> => {
    await delay(300);
    
    const searchTerm = query.toLowerCase();
    
    let filtered = mockItemRequests;
    
    if (recipientId) {
        filtered = filtered.filter(r => r.recipientId === recipientId);
    }
    
    return filtered
        .filter(r => 
            r.itemName.toLowerCase().includes(searchTerm) ||
            r.description.toLowerCase().includes(searchTerm) ||
            r.category.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

/**
 * Initialize sample item requests
 */
const initializeSampleRequests = () => {
    const now = new Date();
    
    // Sample requests for Maria Rodriguez (recipient-maria-001)
    const mariaId = 'recipient-maria-001';
    mockItemRequests.push(
        {
            id: 'req-maria-001',
            recipientId: mariaId,
            recipientName: 'Maria Rodriguez',
            category: 'Clothing',
            itemName: 'Winter Jackets for Children',
            quantityNeeded: 2,
            quantityReceived: 2,
            description: 'Need warm winter jackets for my 7 and 10-year-old children. They outgrew last year\'s jackets.',
            urgency: 'high',
            status: 'fulfilled',
            estimatedNeedDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            familySize: 3,
            familyComposition: '1 adult, 2 children (ages 7 and 10)',
            imageUrls: ['https://picsum.photos/seed/winter-jackets/400/300'],
            visibility: 'public',
            matchingStatus: 'matched',
            submittedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
            fulfilledAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'req-maria-002',
            recipientId: mariaId,
            recipientName: 'Maria Rodriguez',
            category: 'Education',
            itemName: 'Children\'s Books',
            quantityNeeded: 20,
            quantityReceived: 15,
            description: 'Educational books for children aged 7-10. Reading is important for their development.',
            urgency: 'medium',
            status: 'matched',
            estimatedNeedDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
            familySize: 3,
            familyComposition: '1 adult, 2 children (ages 7 and 10)',
            imageUrls: ['https://picsum.photos/seed/books/400/300'],
            visibility: 'public',
            matchingStatus: 'partially_matched',
            submittedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
        },
        {
            id: 'req-maria-003',
            recipientId: mariaId,
            recipientName: 'Maria Rodriguez',
            category: 'Toys',
            itemName: 'Educational Toys',
            quantityNeeded: 5,
            description: 'Age-appropriate educational toys for my children. Prefer puzzles and building blocks.',
            urgency: 'low',
            status: 'pending',
            familySize: 3,
            familyComposition: '1 adult, 2 children (ages 7 and 10)',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        }
    );
    
    // Sample requests for James Thompson (recipient-james-002)
    const jamesId = 'recipient-james-002';
    mockItemRequests.push(
        {
            id: 'req-james-001',
            recipientId: jamesId,
            recipientName: 'James Thompson',
            category: 'Medical',
            itemName: 'Blood Pressure Monitor',
            quantityNeeded: 1,
            quantityReceived: 1,
            description: 'Need a reliable blood pressure monitor for home use. Doctor recommended regular monitoring.',
            urgency: 'high',
            status: 'fulfilled',
            familySize: 2,
            familyComposition: '2 adults (seniors)',
            imageUrls: ['https://picsum.photos/seed/medical/400/300'],
            visibility: 'public',
            matchingStatus: 'matched',
            submittedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
            fulfilledAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'req-james-002',
            recipientId: jamesId,
            recipientName: 'James Thompson',
            category: 'Clothing',
            itemName: 'Winter Coats',
            quantityNeeded: 2,
            description: 'Warm winter coats for elderly couple. Size Large for both.',
            urgency: 'high',
            status: 'approved',
            estimatedNeedDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            familySize: 2,
            familyComposition: '2 adults (seniors)',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
        },
        {
            id: 'req-james-003',
            recipientId: jamesId,
            recipientName: 'James Thompson',
            category: 'Food',
            itemName: 'Canned Goods',
            quantityNeeded: 30,
            description: 'Non-perishable food items for monthly supply. Especially need canned vegetables and soups.',
            urgency: 'medium',
            status: 'pending',
            familySize: 2,
            familyComposition: '2 adults (seniors)',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        }
    );
    
    // Sample requests for Sarah Williams (recipient-sarah-003)
    const sarahId = 'recipient-sarah-003';
    mockItemRequests.push(
        {
            id: 'req-sarah-001',
            recipientId: sarahId,
            recipientName: 'Sarah Williams',
            category: 'Clothing',
            itemName: 'Children\'s Clothing',
            quantityNeeded: 15,
            quantityReceived: 15,
            description: 'Clothing for children ages 2, 5, 8, and 12. Need various sizes and seasonal items.',
            urgency: 'high',
            status: 'fulfilled',
            familySize: 6,
            familyComposition: '2 adults, 4 children (ages 2, 5, 8, 12)',
            imageUrls: ['https://picsum.photos/seed/children-clothing/400/300'],
            visibility: 'public',
            matchingStatus: 'matched',
            submittedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
            fulfilledAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'req-sarah-002',
            recipientId: sarahId,
            recipientName: 'Sarah Williams',
            category: 'Food',
            itemName: 'Grocery Items',
            quantityNeeded: 50,
            quantityReceived: 50,
            description: 'Monthly grocery supply for family of 6. Need staple foods, vegetables, and snacks for children.',
            urgency: 'medium',
            status: 'fulfilled',
            familySize: 6,
            familyComposition: '2 adults, 4 children (ages 2, 5, 8, 12)',
            visibility: 'public',
            matchingStatus: 'matched',
            submittedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
            fulfilledAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'req-sarah-003',
            recipientId: sarahId,
            recipientName: 'Sarah Williams',
            category: 'Education',
            itemName: 'School Supplies',
            quantityNeeded: 25,
            description: 'Backpacks, notebooks, pencils, and other school supplies for children. School year starting soon.',
            urgency: 'high',
            status: 'approved',
            estimatedNeedDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
            deadline: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
            familySize: 6,
            familyComposition: '2 adults, 4 children (ages 2, 5, 8, 12)',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
        },
        {
            id: 'req-sarah-004',
            recipientId: sarahId,
            recipientName: 'Sarah Williams',
            category: 'Toys',
            itemName: 'Children\'s Toys',
            quantityNeeded: 8,
            description: 'Age-appropriate toys for children. Prefer educational and outdoor toys.',
            urgency: 'low',
            status: 'pending',
            familySize: 6,
            familyComposition: '2 adults, 4 children (ages 2, 5, 8, 12)',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        }
    );
    
    // Sample requests for David Chen (recipient-david-004)
    const davidId = 'recipient-david-004';
    mockItemRequests.push(
        {
            id: 'req-david-001',
            recipientId: davidId,
            recipientName: 'David Chen',
            category: 'Furniture',
            itemName: 'Dining Table',
            quantityNeeded: 1,
            quantityReceived: 1,
            description: 'Need a dining table for family of 4. Starting fresh in a new home.',
            urgency: 'medium',
            status: 'fulfilled',
            familySize: 4,
            familyComposition: '2 adults, 2 children (ages 6 and 9)',
            imageUrls: ['https://picsum.photos/seed/furniture/400/300'],
            visibility: 'public',
            matchingStatus: 'matched',
            submittedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
            fulfilledAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'req-david-002',
            recipientId: davidId,
            recipientName: 'David Chen',
            category: 'Electronics',
            itemName: 'Laptop for Children',
            quantityNeeded: 1,
            description: 'Need a laptop for children\'s online learning. Used or refurbished is fine.',
            urgency: 'high',
            status: 'approved',
            estimatedNeedDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            familySize: 4,
            familyComposition: '2 adults, 2 children (ages 6 and 9)',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            approvedBy: 'Admin',
        },
        {
            id: 'req-david-003',
            recipientId: davidId,
            recipientName: 'David Chen',
            category: 'Education',
            itemName: 'English Learning Materials',
            quantityNeeded: 10,
            description: 'Books and materials to help family learn English. Especially for children.',
            urgency: 'medium',
            status: 'pending',
            familySize: 4,
            familyComposition: '2 adults, 2 children (ages 6 and 9)',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        }
    );
    
    // Sample requests for Lisa Martinez (recipient-lisa-005)
    const lisaId = 'recipient-lisa-005';
    mockItemRequests.push(
        {
            id: 'req-lisa-001',
            recipientId: lisaId,
            recipientName: 'Lisa Martinez',
            category: 'Furniture',
            itemName: 'Bed Frame',
            quantityNeeded: 1,
            description: 'Starting fresh after a move. Need a bed frame for queen-sized mattress.',
            urgency: 'medium',
            status: 'pending',
            familySize: 1,
            familyComposition: '1 adult',
            visibility: 'public',
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'req-lisa-002',
            recipientId: lisaId,
            recipientName: 'Lisa Martinez',
            category: 'Clothing',
            itemName: 'Professional Clothing',
            quantityNeeded: 5,
            description: 'Business casual clothing for job interviews and work. Size Medium.',
            urgency: 'high',
            status: 'pending',
            estimatedNeedDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            familySize: 1,
            familyComposition: '1 adult',
            visibility: 'private', // Private request
            matchingStatus: 'waiting',
            submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        }
    );
};

// Initialize sample data on module load
initializeSampleRequests();

