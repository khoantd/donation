import { DonationItem, ItemRequest, DonationMatch, MatchingSuggestion, DonationStatus } from '../types';
import { getDonations } from './donationService';
import { getPublicItemRequests, getItemRequestById, updateItemRequest } from './requestService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock storage for donation matches
let mockMatches: DonationMatch[] = [];

/**
 * Calculate matching score between a donation and a request
 * Score is 0-100 based on various factors
 */
export const calculateMatchingScore = (
    donation: DonationItem,
    request: ItemRequest
): MatchingSuggestion => {
    let score = 0;
    const reasons: string[] = [];
    
    // Category match (40 points)
    const categoryMatch = donation.category === request.category;
    if (categoryMatch) {
        score += 40;
        reasons.push('Category match');
    }
    
    // Quantity fit (30 points)
    const quantityNeeded = request.quantityNeeded;
    const quantityAvailable = donation.quantity;
    const quantityReceived = request.quantityReceived || 0;
    const remainingNeeded = Math.max(0, quantityNeeded - quantityReceived);
    
    let quantityFit: 'exact' | 'excess' | 'partial' | 'insufficient';
    if (remainingNeeded === 0) {
        quantityFit = 'insufficient'; // Already fulfilled
    } else if (quantityAvailable === remainingNeeded) {
        score += 30;
        quantityFit = 'exact';
        reasons.push('Exact quantity match');
    } else if (quantityAvailable > remainingNeeded) {
        score += 25; // Excess is good but not perfect
        quantityFit = 'excess';
        reasons.push('Sufficient quantity available');
    } else if (quantityAvailable >= remainingNeeded * 0.5) {
        score += 15; // Partial match
        quantityFit = 'partial';
        reasons.push('Partial quantity match');
    } else {
        quantityFit = 'insufficient';
        reasons.push('Insufficient quantity');
    }
    
    // Urgency level (20 points)
    const urgencyScores = { high: 20, medium: 10, low: 5 };
    score += urgencyScores[request.urgency];
    reasons.push(`${request.urgency} urgency request`);
    
    // Status of donation (10 points)
    if (donation.status === DonationStatus.APPROVED) {
        score += 10;
        reasons.push('Donation approved');
    } else if (donation.status === DonationStatus.PENDING) {
        score += 5;
        reasons.push('Donation pending approval');
    }
    
    // Request status (10 points)
    if (request.status === 'approved') {
        score += 10;
        reasons.push('Request approved');
    } else if (request.status === 'pending') {
        score += 5;
        reasons.push('Request pending approval');
    }
    
    // Deduct points for already matched items
    const donationMatches = mockMatches.filter(m => 
        m.donationId === donation.id && 
        (m.status === 'confirmed' || m.status === 'fulfilled')
    );
    const allocatedQuantity = donationMatches.reduce((sum, m) => sum + m.quantityAllocated, 0);
    const remainingQuantity = donation.quantity - allocatedQuantity;
    
    if (remainingQuantity <= 0) {
        score = 0;
        reasons.push('Donation fully allocated');
    } else if (remainingQuantity < remainingNeeded) {
        score *= 0.7; // Penalty for partially allocated donation
        reasons.push('Donation partially allocated');
    }
    
    // Location proximity (future enhancement - mock for now)
    // In production, this would use geocoding to calculate actual distance
    const locationProximity = undefined; // Will be calculated when location data is available
    
    return {
        donationId: donation.id,
        requestId: request.id,
        matchingScore: Math.min(100, Math.max(0, Math.round(score))),
        reasons,
        categoryMatch,
        quantityFit,
        locationProximity,
        urgencyLevel: request.urgency,
    };
};

/**
 * Get automatic matching suggestions
 */
export const getMatchingSuggestions = async (
    donationId?: string,
    requestId?: string,
    minScore?: number
): Promise<MatchingSuggestion[]> => {
    await delay(500);
    
    const donations = await getDonations();
    const requests = await getPublicItemRequests();
    
    // Filter donations and requests
    let filteredDonations = donations.filter(d => 
        d.status === DonationStatus.APPROVED || d.status === DonationStatus.PENDING
    );
    let filteredRequests = requests.filter(r => 
        (r.status === 'approved' || r.status === 'pending') && 
        r.matchingStatus !== 'matched'
    );
    
    if (donationId) {
        filteredDonations = filteredDonations.filter(d => d.id === donationId);
    }
    
    if (requestId) {
        filteredRequests = filteredRequests.filter(r => r.id === requestId);
    }
    
    // Calculate suggestions
    const suggestions: MatchingSuggestion[] = [];
    
    for (const donation of filteredDonations) {
        for (const request of filteredRequests) {
            const suggestion = calculateMatchingScore(donation, request);
            
            // Filter by minimum score if provided
            if (!minScore || suggestion.matchingScore >= minScore) {
                suggestions.push(suggestion);
            }
        }
    }
    
    // Sort by score (highest first)
    return suggestions.sort((a, b) => b.matchingScore - a.matchingScore);
};

/**
 * Create a donation match
 */
export const createDonationMatch = async (
    donationId: string,
    requestId: string,
    quantityAllocated: number,
    matchedBy: string,
    notes?: string
): Promise<DonationMatch> => {
    await delay(600);
    
    const donation = (await getDonations()).find(d => d.id === donationId);
    const request = await getItemRequestById(requestId);
    
    if (!donation) {
        throw new Error('Donation not found');
    }
    
    if (!request) {
        throw new Error('Request not found');
    }
    
    // Check if donation is approved
    if (donation.status !== DonationStatus.APPROVED) {
        throw new Error('Donation must be approved before matching');
    }
    
    // Check if request is approved or pending
    if (request.status !== 'approved' && request.status !== 'pending') {
        throw new Error('Request must be approved or pending');
    }
    
    // Calculate available quantity (subtract already allocated)
    const existingMatches = mockMatches.filter(m => 
        m.donationId === donationId && 
        (m.status === 'confirmed' || m.status === 'fulfilled')
    );
    const allocatedQuantity = existingMatches.reduce((sum, m) => sum + m.quantityAllocated, 0);
    const availableQuantity = donation.quantity - allocatedQuantity;
    
    if (quantityAllocated > availableQuantity) {
        throw new Error(`Insufficient quantity. Only ${availableQuantity} items available.`);
    }
    
    // Calculate matching score
    const suggestion = calculateMatchingScore(donation, request);
    
    const match: DonationMatch = {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        donationId,
        requestId,
        recipientId: request.recipientId,
        quantityAllocated,
        matchingScore: suggestion.matchingScore,
        status: 'pending',
        matchedBy,
        matchedAt: new Date(),
        notes,
    };
    
    mockMatches.push(match);
    
    // Update request matching status
    await updateRequestMatchingStatus(requestId, donationId);
    
    return match;
};

/**
 * Update request matching status
 */
const updateRequestMatchingStatus = async (requestId: string, donationId: string) => {
    try {
        const request = await getItemRequestById(requestId);
        if (request) {
            const relatedDonationIds = request.relatedDonationIds || [];
            if (!relatedDonationIds.includes(donationId)) {
                relatedDonationIds.push(donationId);
            }
            
            // Update request status and matching status
            let newStatus = request.status;
            let matchingStatus: 'waiting' | 'matched' | 'partially_matched' = 'matched';
            
            const quantityReceived = request.quantityReceived || 0;
            const totalAllocated = quantityReceived; // Will be updated when match is confirmed
            const remainingNeeded = request.quantityNeeded - totalAllocated;
            
            if (remainingNeeded <= 0) {
                newStatus = 'matched';
                matchingStatus = 'matched';
            } else {
                matchingStatus = 'partially_matched';
            }
            
            await updateItemRequest(requestId, {
                status: newStatus,
                matchingStatus,
                relatedDonationIds,
            });
        }
    } catch (err) {
        // Error updating request - log but don't fail the match creation
        console.error('Failed to update request matching status:', err);
    }
};

/**
 * Confirm a donation match
 */
export const confirmMatch = async (matchId: string, confirmedBy: string): Promise<DonationMatch> => {
    await delay(400);
    
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) {
        throw new Error('Match not found');
    }
    
    if (match.status !== 'pending') {
        throw new Error(`Cannot confirm match with status: ${match.status}`);
    }
    
    match.status = 'confirmed';
    match.confirmedAt = new Date();
    match.confirmedBy = confirmedBy;
    
    // Update request status and quantity received
    const request = await getItemRequestById(match.requestId);
    if (request) {
        const newQuantityReceived = (request.quantityReceived || 0) + match.quantityAllocated;
        const isFulfilled = newQuantityReceived >= request.quantityNeeded;
        
        await updateItemRequest(match.requestId, {
            quantityReceived: newQuantityReceived,
            status: isFulfilled ? 'fulfilled' : 'matched',
            matchingStatus: isFulfilled ? 'matched' : 'matched',
            fulfilledAt: isFulfilled ? new Date() : undefined,
        });
    }
    
    return match;
};

/**
 * Reject a donation match
 */
export const rejectMatch = async (matchId: string, rejectedBy: string, reason?: string): Promise<DonationMatch> => {
    await delay(400);
    
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) {
        throw new Error('Match not found');
    }
    
    if (match.status !== 'pending') {
        throw new Error(`Cannot reject match with status: ${match.status}`);
    }
    
    match.status = 'rejected';
    match.rejectedAt = new Date();
    match.rejectedBy = rejectedBy;
    if (reason) {
        match.notes = reason;
    }
    
    return match;
};

/**
 * Fulfill a donation match (mark as delivered)
 */
export const fulfillMatch = async (matchId: string, fulfilledBy: string): Promise<DonationMatch> => {
    await delay(400);
    
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) {
        throw new Error('Match not found');
    }
    
    if (match.status !== 'confirmed') {
        throw new Error('Match must be confirmed before fulfillment');
    }
    
    match.status = 'fulfilled';
    match.fulfilledAt = new Date();
    
    return match;
};

/**
 * Cancel a donation match
 */
export const cancelMatch = async (matchId: string, cancelledBy: string): Promise<DonationMatch> => {
    await delay(400);
    
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) {
        throw new Error('Match not found');
    }
    
    if (match.status === 'fulfilled') {
        throw new Error('Cannot cancel a fulfilled match');
    }
    
    match.status = 'cancelled';
    
    return match;
};

/**
 * Get all matches
 */
export const getAllMatches = async (): Promise<DonationMatch[]> => {
    await delay(300);
    return [...mockMatches].sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime());
};

/**
 * Get matches for a specific donation
 */
export const getMatchesByDonation = async (donationId: string): Promise<DonationMatch[]> => {
    await delay(300);
    return mockMatches
        .filter(m => m.donationId === donationId)
        .sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime());
};

/**
 * Get matches for a specific request
 */
export const getMatchesByRequest = async (requestId: string): Promise<DonationMatch[]> => {
    await delay(300);
    return mockMatches
        .filter(m => m.requestId === requestId)
        .sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime());
};

/**
 * Get matches by status
 */
export const getMatchesByStatus = async (status: DonationMatch['status']): Promise<DonationMatch[]> => {
    await delay(300);
    return mockMatches
        .filter(m => m.status === status)
        .sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime());
};

/**
 * Get unmatched donations
 */
export const getUnmatchedDonations = async (): Promise<DonationItem[]> => {
    await delay(400);
    
    const donations = await getDonations();
    const confirmedMatches = mockMatches.filter(m => 
        m.status === 'confirmed' || m.status === 'fulfilled'
    );
    
    const matchedDonationIds = new Set(confirmedMatches.map(m => m.donationId));
    
    return donations.filter(d => 
        (d.status === DonationStatus.APPROVED || d.status === DonationStatus.PENDING) &&
        !matchedDonationIds.has(d.id)
    );
};

/**
 * Get unmatched requests
 */
export const getUnmatchedRequests = async (): Promise<ItemRequest[]> => {
    await delay(400);
    
    const requests = await getPublicItemRequests();
    const confirmedMatches = mockMatches.filter(m => 
        m.status === 'confirmed' || m.status === 'fulfilled'
    );
    
    const matchedRequestIds = new Set(confirmedMatches.map(m => m.requestId));
    
    return requests.filter(r => 
        (r.status === 'approved' || r.status === 'pending') &&
        !matchedRequestIds.has(r.id) &&
        (r.quantityReceived || 0) < r.quantityNeeded
    );
};

/**
 * Batch match - match one donation to multiple requests
 */
export const batchMatchDonationToRequests = async (
    donationId: string,
    matches: Array<{ requestId: string; quantityAllocated: number }>,
    matchedBy: string,
    notes?: string
): Promise<DonationMatch[]> => {
    await delay(800);
    
    const donation = (await getDonations()).find(d => d.id === donationId);
    if (!donation) {
        throw new Error('Donation not found');
    }
    
    if (donation.status !== DonationStatus.APPROVED) {
        throw new Error('Donation must be approved before matching');
    }
    
    // Calculate total allocation
    const totalAllocated = matches.reduce((sum, m) => sum + m.quantityAllocated, 0);
    
    // Check available quantity
    const existingMatches = mockMatches.filter(m => 
        m.donationId === donationId && 
        (m.status === 'confirmed' || m.status === 'fulfilled')
    );
    const allocatedQuantity = existingMatches.reduce((sum, m) => sum + m.quantityAllocated, 0);
    const availableQuantity = donation.quantity - allocatedQuantity;
    
    if (totalAllocated > availableQuantity) {
        throw new Error(`Insufficient quantity. Only ${availableQuantity} items available.`);
    }
    
    // Create matches
    const createdMatches: DonationMatch[] = [];
    
    for (const match of matches) {
        const request = await getItemRequestById(match.requestId);
        if (!request) {
            throw new Error(`Request ${match.requestId} not found`);
        }
        
        const remainingNeeded = request.quantityNeeded - (request.quantityReceived || 0);
        if (match.quantityAllocated > remainingNeeded) {
            throw new Error(`Cannot allocate more than needed for request ${request.itemName}`);
        }
        
        const suggestion = calculateMatchingScore(donation, request);
        
        const newMatch: DonationMatch = {
            id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            donationId,
            requestId: match.requestId,
            recipientId: request.recipientId,
            quantityAllocated: match.quantityAllocated,
            matchingScore: suggestion.matchingScore,
            status: 'pending',
            matchedBy,
            matchedAt: new Date(),
            notes,
        };
        
        mockMatches.push(newMatch);
        createdMatches.push(newMatch);
    }
    
    return createdMatches;
};

/**
 * Batch match - match one request to multiple donations
 */
export const batchMatchRequestToDonations = async (
    requestId: string,
    matches: Array<{ donationId: string; quantityAllocated: number }>,
    matchedBy: string,
    notes?: string
): Promise<DonationMatch[]> => {
    await delay(800);
    
    const request = await getItemRequestById(requestId);
    if (!request) {
        throw new Error('Request not found');
    }
    
    if (request.status !== 'approved' && request.status !== 'pending') {
        throw new Error('Request must be approved or pending');
    }
    
    const quantityNeeded = request.quantityNeeded;
    const quantityReceived = request.quantityReceived || 0;
    const remainingNeeded = quantityNeeded - quantityReceived;
    
    // Calculate total allocation
    const totalAllocated = matches.reduce((sum, m) => sum + m.quantityAllocated, 0);
    
    if (totalAllocated > remainingNeeded) {
        throw new Error(`Cannot allocate more than ${remainingNeeded} items needed for this request`);
    }
    
    // Create matches
    const createdMatches: DonationMatch[] = [];
    const donations = await getDonations();
    
    for (const match of matches) {
        const donation = donations.find(d => d.id === match.donationId);
        if (!donation) {
            throw new Error(`Donation ${match.donationId} not found`);
        }
        
        if (donation.status !== DonationStatus.APPROVED) {
            throw new Error(`Donation ${donation.itemName} must be approved`);
        }
        
        // Check available quantity
        const existingMatches = mockMatches.filter(m => 
            m.donationId === match.donationId && 
            (m.status === 'confirmed' || m.status === 'fulfilled')
        );
        const allocatedQuantity = existingMatches.reduce((sum, m) => sum + m.quantityAllocated, 0);
        const availableQuantity = donation.quantity - allocatedQuantity;
        
        if (match.quantityAllocated > availableQuantity) {
            throw new Error(`Insufficient quantity in donation ${donation.itemName}. Only ${availableQuantity} available.`);
        }
        
        const suggestion = calculateMatchingScore(donation, request);
        
        const newMatch: DonationMatch = {
            id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            donationId: match.donationId,
            requestId,
            recipientId: request.recipientId,
            quantityAllocated: match.quantityAllocated,
            matchingScore: suggestion.matchingScore,
            status: 'pending',
            matchedBy,
            matchedAt: new Date(),
            notes,
        };
        
        mockMatches.push(newMatch);
        createdMatches.push(newMatch);
    }
    
    return createdMatches;
};

/**
 * Update match notes
 */
export const updateMatchNotes = async (matchId: string, notes: string): Promise<DonationMatch> => {
    await delay(300);
    
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) {
        throw new Error('Match not found');
    }
    
    match.notes = notes;
    return match;
};

