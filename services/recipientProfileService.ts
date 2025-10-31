import { RecipientProfile, ItemRequest } from '../types';
import { getRecipientProfile, updateRecipientProfile } from './recipientRegistrationService';
import { getItemRequestsByRecipient as getItemRequestsFromService, getActiveItemRequests as getActiveItemRequestsFromService } from './requestService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Get recipient profile with statistics
 */
export const getRecipientProfileWithStats = async (userId: string): Promise<{
    profile: RecipientProfile;
    statistics: {
        totalRequests: number;
        pendingRequests: number;
        approvedRequests: number;
        fulfilledRequests: number;
        cancelledRequests: number;
        totalItemsReceived: number;
        totalItemsRequested: number;
        categoriesReceived: number;
        peopleServed: number; // Estimated based on family size
    };
}> => {
    await delay(400);
    
    let profile = await getRecipientProfile(userId);
    if (!profile) {
        // Create default profile if it doesn't exist
        profile = {
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
        // Note: In production, this would be saved to the database
    }
    
    // Get all requests for this recipient from requestService
    const requests = await getItemRequestsFromService(userId);
    
    // Calculate statistics
    const statistics = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        approvedRequests: requests.filter(r => r.status === 'approved' || r.status === 'matched').length,
        fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length,
        cancelledRequests: requests.filter(r => r.status === 'cancelled').length,
        totalItemsReceived: requests
            .filter(r => r.status === 'fulfilled' && r.quantityReceived)
            .reduce((sum, r) => sum + (r.quantityReceived || 0), 0),
        totalItemsRequested: requests.reduce((sum, r) => sum + r.quantityNeeded, 0),
        categoriesReceived: new Set(
            requests
                .filter(r => r.status === 'fulfilled')
                .map(r => r.category)
        ).size,
        peopleServed: requests
            .filter(r => r.status === 'fulfilled')
            .reduce((sum, r) => sum + (r.familySize || 1), 0),
    };
    
    return { profile, statistics };
};

/**
 * Get item requests for a recipient
 */
export const getItemRequests = async (recipientId: string): Promise<ItemRequest[]> => {
    return await getItemRequestsFromService(recipientId);
};

/**
 * Get active item requests (pending, approved, matched)
 */
export const getActiveItemRequests = async (recipientId: string): Promise<ItemRequest[]> => {
    return await getActiveItemRequestsFromService(recipientId);
};

/**
 * Update recipient profile
 */
export const updateRecipientProfileData = async (
    userId: string,
    updates: Partial<RecipientProfile>
): Promise<RecipientProfile> => {
    return await updateRecipientProfile(userId, updates);
};

/**
 * Calculate profile completeness percentage
 */
export const calculateProfileCompleteness = (profile: RecipientProfile): number => {
    let completed = 0;
    let total = 0;
    
    // Bio
    total++;
    if (profile.bio && profile.bio.trim().length > 0) completed++;
    
    // Family size
    total++;
    if (profile.familySize > 0) completed++;
    
    // Family composition
    total++;
    if (profile.familyComposition && profile.familyComposition.trim().length > 0) completed++;
    
    // Needs
    total++;
    if (profile.needs && profile.needs.trim().length > 0) completed++;
    
    // Preferences - preferred categories
    total++;
    if (profile.preferences?.preferredCategories && profile.preferences.preferredCategories.length > 0) completed++;
    
    // Preferences - delivery preference
    total++;
    if (profile.preferences?.deliveryPreference) completed++;
    
    // Preferences - contact method
    total++;
    if (profile.preferences?.preferredContactMethod) completed++;
    
    return Math.round((completed / total) * 100);
};

/**
 * Get request history timeline
 */
export const getRequestHistoryTimeline = async (recipientId: string): Promise<Array<{
    date: Date;
    event: string;
    requestId?: string;
    requestName?: string;
    status?: ItemRequest['status'];
}>> => {
    await delay(300);
    
    const requests = await getItemRequests(recipientId);
    const timeline: Array<{
        date: Date;
        event: string;
        requestId?: string;
        requestName?: string;
        status?: ItemRequest['status'];
    }> = [];
    
    requests.forEach(request => {
        timeline.push({
            date: request.submittedAt,
            event: 'Request submitted',
            requestId: request.id,
            requestName: request.itemName,
            status: 'pending',
        });
        
        if (request.approvedAt) {
            timeline.push({
                date: request.approvedAt,
                event: 'Request approved',
                requestId: request.id,
                requestName: request.itemName,
                status: 'approved',
            });
        }
        
        if (request.fulfilledAt) {
            timeline.push({
                date: request.fulfilledAt,
                event: 'Request fulfilled',
                requestId: request.id,
                requestName: request.itemName,
                status: 'fulfilled',
            });
        }
        
        if (request.cancelledAt) {
            timeline.push({
                date: request.cancelledAt,
                event: 'Request cancelled',
                requestId: request.id,
                requestName: request.itemName,
                status: 'cancelled',
            });
        }
    });
    
    // Sort by date (newest first)
    return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
};


