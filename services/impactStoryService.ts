import { ImpactStory } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock impact stories
let mockImpactStories: ImpactStory[] = [
    {
        id: 'story-1',
        title: 'Winter Coats Bring Warmth to Families',
        description: 'Thanks to generous donations of winter coats, we were able to help 10 families stay warm during the harsh winter months. The coats were distributed to families in need at our community center, providing essential protection from the cold weather.',
        category: 'Clothing',
        beforeImageUrl: 'https://picsum.photos/seed/cold-families/800/600',
        afterImageUrl: 'https://picsum.photos/seed/warm-families/800/600',
        beneficiaryName: 'The Johnson Family',
        beneficiaryTestimonial: 'We are so grateful for these warm coats. Our children were able to walk to school comfortably, and we didn\'t have to worry about them getting sick from the cold. This donation truly made a difference in our lives.',
        location: 'Kindness City, KS',
        impactMetrics: {
            itemsReceived: 10,
            peopleHelped: 35,
            dateDelivered: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        relatedDonationIds: ['d1'],
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        featured: true,
    },
    {
        id: 'story-2',
        title: 'Food Drive Feeds 50+ Families',
        description: 'A massive food drive campaign helped stock our community pantry with essential canned goods and non-perishable items. Over 50 families received food assistance, ensuring no one went hungry during difficult times.',
        category: 'Food',
        beforeImageUrl: 'https://picsum.photos/seed/empty-pantry/800/600',
        afterImageUrl: 'https://picsum.photos/seed/full-pantry/800/600',
        beneficiaryName: 'Maria Rodriguez',
        beneficiaryTestimonial: 'As a single mother, providing for my family has been challenging. The food we received from this donation helped us through a difficult month. I\'m forever grateful for the kindness of strangers.',
        location: 'Hopeville, CA',
        impactMetrics: {
            itemsReceived: 24,
            peopleHelped: 50,
            dateDelivered: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        },
        relatedDonationIds: ['d2'],
        publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        featured: true,
    },
    {
        id: 'story-3',
        title: 'Books Open New Worlds for Students',
        description: 'Educational materials and books donated to our local school library have helped over 200 students access learning resources they didn\'t have before. The donations have enriched the educational experience for children in our community.',
        category: 'Education',
        beforeImageUrl: 'https://picsum.photos/seed/empty-library/800/600',
        afterImageUrl: 'https://picsum.photos/seed/full-library/800/600',
        beneficiaryName: 'Principal Smith',
        beneficiaryTestimonial: 'These book donations have transformed our library. Students are more engaged, reading more, and have access to diverse materials. The impact on their education has been remarkable.',
        location: 'Learning Town, TX',
        impactMetrics: {
            itemsReceived: 50,
            peopleHelped: 200,
            dateDelivered: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
        relatedDonationIds: [],
        publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        featured: false,
    },
    {
        id: 'story-4',
        title: 'Toys Bring Joy to Children in Need',
        description: 'A wonderful donation of toys brought smiles and happiness to children at our shelter. The toys provided entertainment, comfort, and a sense of normalcy during difficult times for families experiencing homelessness.',
        category: 'Toys',
        beforeImageUrl: 'https://picsum.photos/seed/sad-children/800/600',
        afterImageUrl: 'https://picsum.photos/seed/happy-children/800/600',
        beneficiaryName: 'Shelter Director',
        beneficiaryTestimonial: 'The joy on the children\'s faces when they received these toys was indescribable. In their situation, these simple gifts mean so much. Thank you to all the donors who made this possible.',
        location: 'Compassion Valley, NY',
        impactMetrics: {
            itemsReceived: 30,
            peopleHelped: 45,
            dateDelivered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        relatedDonationIds: [],
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        featured: true,
    },
    {
        id: 'story-5',
        title: 'Medical Supplies Support Health Clinic',
        description: 'Donated medical supplies and equipment helped our free health clinic serve more patients. The supplies ensured we could provide basic medical care to those who couldn\'t afford it, improving community health outcomes.',
        category: 'Medical Supplies',
        beforeImageUrl: 'https://picsum.photos/seed/empty-clinic/800/600',
        afterImageUrl: 'https://picsum.photos/seed/equipped-clinic/800/600',
        beneficiaryName: 'Dr. Sarah Chen',
        beneficiaryTestimonial: 'These medical supplies have been crucial in allowing us to serve more patients. We\'ve been able to treat conditions we couldn\'t before, and lives have been saved because of these generous donations.',
        location: 'Health City, FL',
        impactMetrics: {
            itemsReceived: 15,
            peopleHelped: 100,
            dateDelivered: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
        relatedDonationIds: [],
        publishedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        featured: false,
    },
];

/**
 * Get all impact stories
 */
export const getImpactStories = async (featuredOnly: boolean = false): Promise<ImpactStory[]> => {
    await delay(400);
    
    if (featuredOnly) {
        return mockImpactStories.filter(story => story.featured);
    }
    
    return [...mockImpactStories].sort((a, b) => {
        // Sort by featured first, then by published date (newest first)
        if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
        }
        return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
};

/**
 * Get a single impact story by ID
 */
export const getImpactStory = async (id: string): Promise<ImpactStory | null> => {
    await delay(300);
    
    const story = mockImpactStories.find(s => s.id === id);
    return story || null;
};

/**
 * Get impact stories by category
 */
export const getImpactStoriesByCategory = async (category: string): Promise<ImpactStory[]> => {
    await delay(400);
    
    return mockImpactStories.filter(story => story.category === category);
};

/**
 * Create a new impact story (admin only)
 */
export const createImpactStory = async (story: Omit<ImpactStory, 'id' | 'publishedAt'>): Promise<ImpactStory> => {
    await delay(500);
    
    const newStory: ImpactStory = {
        ...story,
        id: `story-${Date.now()}`,
        publishedAt: new Date(),
    };
    
    mockImpactStories.unshift(newStory);
    return newStory;
};

/**
 * Get total impact statistics
 */
export const getTotalImpactStats = async (): Promise<{
    totalStories: number;
    totalPeopleHelped: number;
    totalItemsReceived: number;
    categoriesCovered: number;
}> => {
    await delay(200);
    
    const totalPeopleHelped = mockImpactStories.reduce((sum, story) => sum + story.impactMetrics.peopleHelped, 0);
    const totalItemsReceived = mockImpactStories.reduce((sum, story) => sum + story.impactMetrics.itemsReceived, 0);
    const categoriesCovered = new Set(mockImpactStories.map(story => story.category)).size;
    
    return {
        totalStories: mockImpactStories.length,
        totalPeopleHelped,
        totalItemsReceived,
        categoriesCovered,
    };
};

