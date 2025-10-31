import { DonationItem, DonationStatus, DonorProfile, DonationGoal, Achievement } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock donor profile storage
let mockDonorProfiles: { [userId: string]: DonorProfile } = {};

// Available achievements
export const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-donation',
        title: 'First Steps',
        description: 'Made your first donation',
        icon: '🎯',
        rarity: 'common',
    },
    {
        id: '10-items',
        title: 'Giving Hand',
        description: 'Donated 10 items',
        icon: '🤝',
        rarity: 'common',
    },
    {
        id: '50-items',
        title: 'Generous Soul',
        description: 'Donated 50 items',
        icon: '❤️',
        rarity: 'rare',
    },
    {
        id: '100-items',
        title: 'Philanthropist',
        description: 'Donated 100 items',
        icon: '🌟',
        rarity: 'epic',
    },
    {
        id: '5-donations',
        title: 'Regular Donor',
        description: 'Made 5 donations',
        icon: '⭐',
        rarity: 'common',
    },
    {
        id: '10-donations',
        title: 'Dedicated Donor',
        description: 'Made 10 donations',
        icon: '💫',
        rarity: 'rare',
    },
    {
        id: '5-categories',
        title: 'Versatile Donor',
        description: 'Donated items from 5 different categories',
        icon: '🌈',
        rarity: 'rare',
    },
    {
        id: 'all-delivered',
        title: 'Impact Maker',
        description: 'All donations delivered',
        icon: '🎖️',
        rarity: 'epic',
    },
    {
        id: 'monthly-champion',
        title: 'Monthly Champion',
        description: 'Donated every month for 3 months',
        icon: '🏆',
        rarity: 'legendary',
    },
];

/**
 * Get or create donor profile
 */
export const getDonorProfile = async (userId: string, donations: DonationItem[]): Promise<DonorProfile> => {
    await delay(300);
    
    // Calculate impact metrics
    const deliveredDonations = donations.filter(d => d.status === DonationStatus.DELIVERED);
    const totalItemsDelivered = deliveredDonations.reduce((sum, d) => sum + d.quantity, 0);
    const uniqueCategories = new Set(donations.map(d => d.category)).size;
    
    // Calculate people helped (estimated: 1 item per person)
    const peopleHelped = totalItemsDelivered;

    // Get or create profile
    let profile = mockDonorProfiles[userId];
    
    if (!profile) {
        profile = {
            userId,
            bio: '',
            favoriteCategories: [],
            donationGoals: [],
            achievements: [],
            totalImpact: {
                itemsDelivered: 0,
                peopleHelped: 0,
                categoriesCovered: 0,
            },
            preferences: {
                theme: 'light',
                notifications: true,
                showAchievements: true,
                showOnLeaderboard: true, // Default to showing on leaderboard
            },
        };
        mockDonorProfiles[userId] = profile;
    }

    // Update impact metrics
    profile.totalImpact = {
        itemsDelivered: totalItemsDelivered,
        peopleHelped: peopleHelped,
        categoriesCovered: uniqueCategories,
    };

    // Calculate favorite categories
    const categoryCounts: { [key: string]: number } = {};
    donations.forEach(d => {
        categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    });
    profile.favoriteCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

    // Check and unlock achievements
    profile.achievements = checkAndUnlockAchievements(donations, profile.achievements);

    return profile;
};

/**
 * Check donations against achievement criteria and unlock new achievements
 */
const checkAndUnlockAchievements = (
    donations: DonationItem[],
    existingAchievements: Achievement[]
): Achievement[] => {
    const unlockedIds = new Set(existingAchievements.map(a => a.id));
    const newlyUnlocked: Achievement[] = [];

    const totalItems = donations.reduce((sum, d) => sum + d.quantity, 0);
    const totalDonations = donations.length;
    const deliveredDonations = donations.filter(d => d.status === DonationStatus.DELIVERED);
    const uniqueCategories = new Set(donations.map(d => d.category)).size;

    // Check each achievement
    AVAILABLE_ACHIEVEMENTS.forEach(achievement => {
        if (unlockedIds.has(achievement.id)) return;

        let shouldUnlock = false;

        switch (achievement.id) {
            case 'first-donation':
                shouldUnlock = totalDonations >= 1;
                break;
            case '10-items':
                shouldUnlock = totalItems >= 10;
                break;
            case '50-items':
                shouldUnlock = totalItems >= 50;
                break;
            case '100-items':
                shouldUnlock = totalItems >= 100;
                break;
            case '5-donations':
                shouldUnlock = totalDonations >= 5;
                break;
            case '10-donations':
                shouldUnlock = totalDonations >= 10;
                break;
            case '5-categories':
                shouldUnlock = uniqueCategories >= 5;
                break;
            case 'all-delivered':
                shouldUnlock = totalDonations > 0 && deliveredDonations.length === totalDonations;
                break;
            case 'monthly-champion':
                // Check if donated for 3 consecutive months
                const monthlyGroups: { [key: string]: DonationItem[] } = {};
                donations.forEach(d => {
                    const monthKey = `${d.submittedAt.getFullYear()}-${String(d.submittedAt.getMonth() + 1).padStart(2, '0')}`;
                    if (!monthlyGroups[monthKey]) {
                        monthlyGroups[monthKey] = [];
                    }
                    monthlyGroups[monthKey].push(d);
                });
                const months = Object.keys(monthlyGroups).sort().reverse().slice(0, 3);
                shouldUnlock = months.length >= 3;
                break;
        }

        if (shouldUnlock) {
            newlyUnlocked.push({
                ...achievement,
                unlockedAt: new Date(),
            });
        }
    });

    return [...existingAchievements, ...newlyUnlocked];
};

/**
 * Update donor profile
 */
export const updateDonorProfile = async (userId: string, updates: Partial<DonorProfile>): Promise<DonorProfile> => {
    await delay(500);
    
    if (!mockDonorProfiles[userId]) {
        throw new Error('Profile not found');
    }

    mockDonorProfiles[userId] = {
        ...mockDonorProfiles[userId],
        ...updates,
    };

    return mockDonorProfiles[userId];
};

/**
 * Add or update donation goal
 */
export const updateDonationGoal = async (userId: string, goal: DonationGoal): Promise<DonorProfile> => {
    await delay(500);
    
    if (!mockDonorProfiles[userId]) {
        throw new Error('Profile not found');
    }

    const profile = mockDonorProfiles[userId];
    const existingIndex = profile.donationGoals.findIndex(g => g.id === goal.id);

    if (existingIndex >= 0) {
        profile.donationGoals[existingIndex] = goal;
    } else {
        profile.donationGoals.push(goal);
    }

    return profile;
};

/**
 * Delete donation goal
 */
export const deleteDonationGoal = async (userId: string, goalId: string): Promise<DonorProfile> => {
    await delay(300);
    
    if (!mockDonorProfiles[userId]) {
        throw new Error('Profile not found');
    }

    const profile = mockDonorProfiles[userId];
    profile.donationGoals = profile.donationGoals.filter(g => g.id !== goalId);

    return profile;
};

