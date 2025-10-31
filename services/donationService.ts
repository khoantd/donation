import { DonationItem, DonationStatus, User, ActionHistory, AdminNote } from '../types';

let mockDonations: DonationItem[] = [
    {
        id: 'd1',
        itemName: 'Winter Coats',
        description: 'A collection of 10 gently used winter coats for adults.',
        quantity: 10,
        category: 'Clothing',
        imageUrl: 'https://picsum.photos/seed/coats/400/300',
        imageUrls: ['https://picsum.photos/seed/coats/400/300', 'https://picsum.photos/seed/coats2/400/300'],
        donorName: 'Jane Donor',
        donorId: 'user-123',
        donorPhoneNumber: '555-0101',
        donorAddress: '123 Charity Lane, Kindness City, KS 12345',
        status: DonationStatus.APPROVED,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        actionHistory: [
            {
                id: 'ah-d1-1',
                action: 'created',
                newValue: DonationStatus.PENDING,
                performedBy: 'Jane Donor',
                performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                notes: 'Donation submitted',
            },
            {
                id: 'ah-d1-2',
                action: 'status_change',
                previousValue: DonationStatus.PENDING,
                newValue: DonationStatus.APPROVED,
                performedBy: 'Admin',
                performedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
                notes: 'Approved for pickup',
            },
        ],
    },
    {
        id: 'd2',
        itemName: 'Canned Goods',
        description: 'A box of assorted canned vegetables and soups.',
        quantity: 24,
        category: 'Food',
        imageUrl: 'https://picsum.photos/seed/canned/400/300',
        imageUrls: ['https://picsum.photos/seed/canned/400/300'],
        donorName: 'John Smith',
        donorId: 'user-789',
        donorPhoneNumber: '555-0102',
        donorAddress: '456 Giving St, Hopeville, CA 98765',
        status: DonationStatus.PENDING,
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'd3',
        itemName: 'Children\'s Books',
        description: '50 books for ages 5-10.',
        quantity: 50,
        category: 'Education',
        imageUrl: 'https://picsum.photos/seed/books/400/300',
        imageUrls: ['https://picsum.photos/seed/books/400/300'],
        donorName: 'Jane Donor',
        donorId: 'user-123',
        donorPhoneNumber: '555-0101',
        donorAddress: '123 Charity Lane, Kindness City, KS 12345',
        status: DonationStatus.DELIVERED,
        submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'd4',
        itemName: 'First Aid Kits',
        description: '20 new first aid kits.',
        quantity: 20,
        category: 'Medical',
        imageUrl: 'https://picsum.photos/seed/aid/400/300',
        imageUrls: ['https://picsum.photos/seed/aid/400/300'],
        donorName: 'Helping Hands Org',
        donorId: 'org-111',
        donorPhoneNumber: '555-0103',
        donorAddress: '789 Support Ave, Compassion Town, TX 54321',
        status: DonationStatus.REJECTED,
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getDonations = async (): Promise<DonationItem[]> => {
    await delay(500);
    return [...mockDonations].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

export const getDonationsByUserId = async (userId: string): Promise<DonationItem[]> => {
    await delay(500);
    return mockDonations
        .filter(d => d.donorId === userId)
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

export const addDonation = async (item: Omit<DonationItem, 'id' | 'status' | 'submittedAt'>): Promise<DonationItem> => {
    await delay(1000);
    // Ensure imageUrls array exists for backward compatibility
    const imageUrls = item.imageUrls && item.imageUrls.length > 0
        ? item.imageUrls
        : [item.imageUrl];
    
    const submittedAt = new Date();
    const actionHistory: ActionHistory[] = [{
        id: `ah-${Date.now()}`,
        action: 'created',
        newValue: DonationStatus.PENDING,
        performedBy: item.donorName,
        performedAt: submittedAt,
        notes: 'Donation submitted',
    }];
    
    const newDonation: DonationItem = {
        ...item,
        imageUrl: item.imageUrl || imageUrls[0], // Ensure imageUrl exists for backward compatibility
        imageUrls: imageUrls,
        id: `d${Date.now()}`,
        status: DonationStatus.PENDING,
        submittedAt: submittedAt,
        actionHistory: actionHistory,
    };
    mockDonations.unshift(newDonation);
    return newDonation;
};

export const updateDonationStatus = async (id: string, status: DonationStatus, performedBy: string = 'Admin', notes?: string): Promise<DonationItem> => {
    await delay(500);
    const donationIndex = mockDonations.findIndex(d => d.id === id);
    if (donationIndex === -1) {
        throw new Error('Donation not found');
    }
    
    const donation = mockDonations[donationIndex];
    const previousStatus = donation.status;
    
    // Add action history
    const actionHistory: ActionHistory = {
        id: `ah-${Date.now()}`,
        action: 'status_change',
        previousValue: previousStatus,
        newValue: status,
        performedBy: performedBy,
        performedAt: new Date(),
        notes: notes,
    };
    
    donation.status = status;
    donation.actionHistory = donation.actionHistory || [];
    donation.actionHistory.push(actionHistory);
    
    return donation;
};

export const updateDonationQuantity = async (id: string, newQuantity: number, performedBy: string = 'Admin', notes?: string): Promise<DonationItem> => {
    await delay(500);
    const donationIndex = mockDonations.findIndex(d => d.id === id);
    if (donationIndex === -1) {
        throw new Error('Donation not found');
    }
    
    const donation = mockDonations[donationIndex];
    const previousQuantity = donation.quantity;
    
    // Add action history
    const actionHistory: ActionHistory = {
        id: `ah-${Date.now()}`,
        action: 'quantity_update',
        previousValue: previousQuantity,
        newValue: newQuantity,
        performedBy: performedBy,
        performedAt: new Date(),
        notes: notes,
    };
    
    donation.quantity = newQuantity;
    donation.actionHistory = donation.actionHistory || [];
    donation.actionHistory.push(actionHistory);
    
    return donation;
};

/**
 * Add an admin note to a donation
 */
export const addAdminNote = async (
    donationId: string,
    content: string,
    createdBy: string
): Promise<AdminNote> => {
    await delay(300);
    const donationIndex = mockDonations.findIndex(d => d.id === donationId);
    if (donationIndex === -1) {
        throw new Error('Donation not found');
    }
    
    const donation = mockDonations[donationIndex];
    const newNote: AdminNote = {
        id: `note-${Date.now()}`,
        content: content.trim(),
        createdBy: createdBy,
        createdAt: new Date(),
    };
    
    donation.adminNotes = donation.adminNotes || [];
    donation.adminNotes.push(newNote);
    
    return newNote;
};

/**
 * Update an existing admin note
 */
export const updateAdminNote = async (
    donationId: string,
    noteId: string,
    content: string,
    updatedBy: string
): Promise<AdminNote> => {
    await delay(300);
    const donationIndex = mockDonations.findIndex(d => d.id === donationId);
    if (donationIndex === -1) {
        throw new Error('Donation not found');
    }
    
    const donation = mockDonations[donationIndex];
    if (!donation.adminNotes) {
        throw new Error('Note not found');
    }
    
    const noteIndex = donation.adminNotes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
        throw new Error('Note not found');
    }
    
    const note = donation.adminNotes[noteIndex];
    note.content = content.trim();
    note.updatedAt = new Date();
    note.updatedBy = updatedBy;
    
    return note;
};

/**
 * Delete an admin note
 */
export const deleteAdminNote = async (
    donationId: string,
    noteId: string
): Promise<void> => {
    await delay(300);
    const donationIndex = mockDonations.findIndex(d => d.id === donationId);
    if (donationIndex === -1) {
        throw new Error('Donation not found');
    }
    
    const donation = mockDonations[donationIndex];
    if (!donation.adminNotes) {
        throw new Error('Note not found');
    }
    
    donation.adminNotes = donation.adminNotes.filter(n => n.id !== noteId);
};
