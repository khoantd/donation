import { getDonations } from './donationService';
import { getTotalImpactStats } from './impactStoryService';
import { DonationStatus } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface HomeStats {
    totalDonations: number;
    totalItems: number;
    deliveredItems: number;
    peopleHelped: number;
    totalDonors: number;
    activeDonors: number; // Donors who donated in last 30 days
    categoriesCovered: number;
}

/**
 * Get statistics for homepage display
 */
export const getHomeStats = async (): Promise<HomeStats> => {
    await delay(400);

    const donations = await getDonations();
    const impactStats = await getTotalImpactStats();

    const deliveredDonations = donations.filter(d => d.status === DonationStatus.DELIVERED);
    const uniqueDonors = new Set(donations.map(d => d.donorId));
    
    // Active donors (donated in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeDonorsSet = new Set(
        donations
            .filter(d => d.submittedAt >= thirtyDaysAgo)
            .map(d => d.donorId)
    );

    const uniqueCategories = new Set(donations.map(d => d.category));

    const totalItems = donations.reduce((sum, d) => sum + d.quantity, 0);
    const deliveredItems = deliveredDonations.reduce((sum, d) => sum + d.quantity, 0);

    return {
        totalDonations: donations.length,
        totalItems: totalItems,
        deliveredItems: deliveredItems,
        peopleHelped: impactStats.totalPeopleHelped || deliveredItems, // Use impact stories or fallback to delivered items
        totalDonors: uniqueDonors.size,
        activeDonors: activeDonorsSet.size,
        categoriesCovered: uniqueCategories.size,
    };
};

