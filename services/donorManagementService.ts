import { DonationItem, DonationStatus, DonorTag, CommunicationRecord, ManagedDonor } from '../types';
import { getDonations } from './donationService';
import { getDonorProfile } from './donorProfileService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock storage for donor tags (donorId -> tagIds)
let donorTags: { [donorId: string]: string[] } = {};

// Mock storage for tags
let tags: { [tagId: string]: DonorTag } = {};

// Mock storage for communication history
let communicationHistory: CommunicationRecord[] = [];

// Initialize some default tags
const defaultTags: DonorTag[] = [
    { id: 'tag-1', name: 'Regular Donor', color: 'bg-blue-500', createdAt: new Date(), createdBy: 'System' },
    { id: 'tag-2', name: 'VIP Donor', color: 'bg-purple-500', createdAt: new Date(), createdBy: 'System' },
    { id: 'tag-3', name: 'Corporate', color: 'bg-green-500', createdAt: new Date(), createdBy: 'System' },
    { id: 'tag-4', name: 'Needs Follow-up', color: 'bg-yellow-500', createdAt: new Date(), createdBy: 'System' },
    { id: 'tag-5', name: 'Inactive', color: 'bg-gray-500', createdAt: new Date(), createdBy: 'System' },
];

defaultTags.forEach(tag => {
    tags[tag.id] = tag;
});

/**
 * Get all managed donors with their statistics and history
 */
export const getAllManagedDonors = async (): Promise<ManagedDonor[]> => {
    await delay(500);
    
    const donations = await getDonations();
    const donorMap = new Map<string, {
        donorId: string;
        donorName: string;
        donorEmail?: string;
        donorPhoneNumber: string;
        donorAddress: string;
        avatarUrl?: string;
        donations: DonationItem[];
    }>();

    // Group donations by donor
    donations.forEach(donation => {
        if (!donorMap.has(donation.donorId)) {
            donorMap.set(donation.donorId, {
                donorId: donation.donorId,
                donorName: donation.donorName,
                donorPhoneNumber: donation.donorPhoneNumber,
                donorAddress: donation.donorAddress,
                donations: [],
            });
        }
        const donor = donorMap.get(donation.donorId)!;
        donor.donations.push(donation);
    });

    // Build managed donors with statistics
    const managedDonors: ManagedDonor[] = [];

    for (const [donorId, donorData] of donorMap.entries()) {
        const donations = donorData.donations;
        const deliveredDonations = donations.filter(d => d.status === DonationStatus.DELIVERED);
        const pendingDonations = donations.filter(d => d.status === DonationStatus.PENDING);
        const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
        const rejectedDonations = donations.filter(d => d.status === DonationStatus.REJECTED);

        // Calculate favorite categories
        const categoryCounts: { [key: string]: number } = {};
        donations.forEach(d => {
            categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
        });
        const favoriteCategories = Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        // Get profile for impact metrics
        let totalImpact = {
            itemsDelivered: 0,
            peopleHelped: 0,
            categoriesCovered: 0,
        };
        try {
            const profile = await getDonorProfile(donorId, donations);
            totalImpact = profile.totalImpact;
        } catch (err) {
            // If profile doesn't exist, calculate from donations
            totalImpact = {
                itemsDelivered: deliveredDonations.reduce((sum, d) => sum + d.quantity, 0),
                peopleHelped: deliveredDonations.reduce((sum, d) => sum + d.quantity, 0),
                categoriesCovered: new Set(donations.map(d => d.category)).size,
            };
        }

        const managedDonor: ManagedDonor = {
            donorId: donorData.donorId,
            donorName: donorData.donorName,
            donorPhoneNumber: donorData.donorPhoneNumber,
            donorAddress: donorData.donorAddress,
            avatarUrl: donorData.avatarUrl,
            tags: (donorTags[donorId] || []).map(tagId => tags[tagId]).filter(Boolean),
            communicationHistory: communicationHistory
                .filter(c => c.donorId === donorId)
                .sort((a, b) => b.date.getTime() - a.date.getTime()),
            statistics: {
                totalDonations: donations.length,
                totalItems: donations.reduce((sum, d) => sum + d.quantity, 0),
                deliveredItems: deliveredDonations.reduce((sum, d) => sum + d.quantity, 0),
                deliveredDonations: deliveredDonations.length,
                pendingDonations: pendingDonations.length,
                approvedDonations: approvedDonations.length,
                rejectedDonations: rejectedDonations.length,
                lastDonationDate: donations.length > 0 
                    ? new Date(Math.max(...donations.map(d => d.submittedAt.getTime())))
                    : null,
                firstDonationDate: donations.length > 0
                    ? new Date(Math.min(...donations.map(d => d.submittedAt.getTime())))
                    : null,
                favoriteCategories: favoriteCategories,
                totalImpact: totalImpact,
            },
        };

        managedDonors.push(managedDonor);
    }

    // Sort by total items delivered (descending)
    return managedDonors.sort((a, b) => 
        b.statistics.deliveredItems - a.statistics.deliveredItems
    );
};

/**
 * Get a single managed donor by ID
 */
export const getManagedDonor = async (donorId: string): Promise<ManagedDonor | null> => {
    await delay(300);
    
    const allDonors = await getAllManagedDonors();
    return allDonors.find(d => d.donorId === donorId) || null;
};

/**
 * Get all available tags
 */
export const getAllTags = async (): Promise<DonorTag[]> => {
    await delay(200);
    return Object.values(tags);
};

/**
 * Create a new tag
 */
export const createTag = async (
    name: string,
    color: string,
    createdBy: string
): Promise<DonorTag> => {
    await delay(300);
    
    const newTag: DonorTag = {
        id: `tag-${Date.now()}`,
        name: name.trim(),
        color: color,
        createdAt: new Date(),
        createdBy: createdBy,
    };
    
    tags[newTag.id] = newTag;
    return newTag;
};

/**
 * Add tag to donor
 */
export const addTagToDonor = async (
    donorId: string,
    tagId: string
): Promise<void> => {
    await delay(200);
    
    if (!donorTags[donorId]) {
        donorTags[donorId] = [];
    }
    
    if (!donorTags[donorId].includes(tagId)) {
        donorTags[donorId].push(tagId);
    }
};

/**
 * Remove tag from donor
 */
export const removeTagFromDonor = async (
    donorId: string,
    tagId: string
): Promise<void> => {
    await delay(200);
    
    if (donorTags[donorId]) {
        donorTags[donorId] = donorTags[donorId].filter(id => id !== tagId);
    }
};

/**
 * Delete a tag (removes from all donors)
 */
export const deleteTag = async (tagId: string): Promise<void> => {
    await delay(300);
    
    delete tags[tagId];
    
    // Remove tag from all donors
    Object.keys(donorTags).forEach(donorId => {
        donorTags[donorId] = donorTags[donorId].filter(id => id !== tagId);
    });
};

/**
 * Add communication record
 */
export const addCommunicationRecord = async (
    record: Omit<CommunicationRecord, 'id' | 'date'>
): Promise<CommunicationRecord> => {
    await delay(300);
    
    const newRecord: CommunicationRecord = {
        id: `comm-${Date.now()}`,
        ...record,
        date: new Date(),
    };
    
    communicationHistory.push(newRecord);
    return newRecord;
};

/**
 * Get communication history for a donor
 */
export const getCommunicationHistory = async (
    donorId: string
): Promise<CommunicationRecord[]> => {
    await delay(200);
    
    return communicationHistory
        .filter(c => c.donorId === donorId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
};

/**
 * Delete communication record
 */
export const deleteCommunicationRecord = async (
    recordId: string
): Promise<void> => {
    await delay(200);
    
    communicationHistory = communicationHistory.filter(c => c.id !== recordId);
};

