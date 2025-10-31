import { DonationItem, DonationStatus, LeaderboardEntry } from '../types';
import { getDonorProfile } from './donorProfileService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Get leaderboard data (top donors by items delivered)
 */
export const getLeaderboard = async (
    donations: DonationItem[],
    period: 'all-time' | 'monthly' = 'all-time',
    limit: number = 10
): Promise<LeaderboardEntry[]> => {
    await delay(300);

    // Filter donations by period
    let filteredDonations = donations;
    if (period === 'monthly') {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredDonations = donations.filter(d => d.submittedAt >= firstDayOfMonth);
    }

    // Only include delivered donations for leaderboard
    const deliveredDonations = filteredDonations.filter(
        d => d.status === DonationStatus.DELIVERED
    );

    // Group by donor
    const donorMap = new Map<string, {
        donorId: string;
        donorName: string;
        totalItems: number;
        totalDonations: number;
        deliveredItems: number;
        deliveredDonations: number;
    }>();

    deliveredDonations.forEach(donation => {
        if (!donorMap.has(donation.donorId)) {
            donorMap.set(donation.donorId, {
                donorId: donation.donorId,
                donorName: donation.donorName,
                totalItems: 0,
                totalDonations: 0,
                deliveredItems: 0,
                deliveredDonations: 0,
            });
        }

        const donor = donorMap.get(donation.donorId)!;
        donor.deliveredItems += donation.quantity;
        donor.deliveredDonations += 1;
    });

    // Calculate total (all donations, not just delivered)
    const allDonationsByDonor = new Map<string, { totalItems: number; totalDonations: number }>();
    filteredDonations.forEach(donation => {
        if (!allDonationsByDonor.has(donation.donorId)) {
            allDonationsByDonor.set(donation.donorId, { totalItems: 0, totalDonations: 0 });
        }
        const donor = allDonationsByDonor.get(donation.donorId)!;
        donor.totalItems += donation.quantity;
        donor.totalDonations += 1;
    });

    // Merge data
    const leaderboardEntries: LeaderboardEntry[] = [];
    
    for (const [donorId, donor] of donorMap.entries()) {
        const allStats = allDonationsByDonor.get(donorId) || { totalItems: 0, totalDonations: 0 };
        leaderboardEntries.push({
            ...donor,
            totalItems: allStats.totalItems,
            totalDonations: allStats.totalDonations,
        });
    }

    // Sort by delivered items (primary) and delivered donations (secondary)
    const sortedEntries = leaderboardEntries.sort((a, b) => {
        if (b.deliveredItems !== a.deliveredItems) {
            return b.deliveredItems - a.deliveredItems;
        }
        return b.deliveredDonations - a.deliveredDonations;
    });

    // Filter by privacy preferences (check showOnLeaderboard)
    const filteredEntries: LeaderboardEntry[] = [];
    
    for (const entry of sortedEntries) {
        try {
            const userDonations = donations.filter(d => d.donorId === entry.donorId);
            const profile = await getDonorProfile(entry.donorId, userDonations);
            
            // Only include if user opted in to leaderboard
            if (profile.preferences.showOnLeaderboard) {
                filteredEntries.push(entry);
                
                // Stop once we have enough entries
                if (filteredEntries.length >= limit) {
                    break;
                }
            }
        } catch (err) {
            // If profile doesn't exist or error, default to showing (opt-in by default)
            // This maintains backward compatibility
            filteredEntries.push(entry);
            
            if (filteredEntries.length >= limit) {
                break;
            }
        }
    }

    // Add ranks
    const entriesWithRanks: LeaderboardEntry[] = filteredEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));

    return entriesWithRanks;
};

/**
 * Get user's position in leaderboard
 */
export const getUserLeaderboardPosition = async (
    userId: string,
    donations: DonationItem[],
    period: 'all-time' | 'monthly' = 'all-time'
): Promise<{ rank: number; entry: LeaderboardEntry | null } | null> => {
    await delay(200);

    const leaderboard = await getLeaderboard(donations, period, 1000); // Get large list to find user
    const userEntry = leaderboard.find(entry => entry.donorId === userId);

    if (!userEntry) {
        return null;
    }

    return {
        rank: userEntry.rank,
        entry: userEntry,
    };
};

