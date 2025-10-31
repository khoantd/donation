import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    getAllManagedDonors, 
    getAllTags, 
    createTag, 
    addTagToDonor, 
    removeTagFromDonor, 
    deleteTag,
    addCommunicationRecord,
    deleteCommunicationRecord
} from '../services/donorManagementService';
import { getDonationsByUserId, updateDonationStatus, updateDonationQuantity } from '../services/donationService';
import { ManagedDonor, DonorTag, CommunicationRecord, DonationItem } from '../types';
import { DonationStatus } from '../types';
import DonationList from '../components/DonationList';
import DonationDetailsModal from '../components/DonationDetailsModal';

const DonorManagement: React.FC = () => {
    const { user } = useAuth();
    const [donors, setDonors] = useState<ManagedDonor[]>([]);
    const [filteredDonors, setFilteredDonors] = useState<ManagedDonor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDonor, setSelectedDonor] = useState<ManagedDonor | null>(null);
    const [donorDonations, setDonorDonations] = useState<DonationItem[]>([]);
    const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'totalDonations' | 'deliveredItems' | 'lastDonation'>('deliveredItems');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Tag management
    const [availableTags, setAvailableTags] = useState<DonorTag[]>([]);
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('bg-blue-500');
    const tagColors = [
        { name: 'Blue', value: 'bg-blue-500' },
        { name: 'Purple', value: 'bg-purple-500' },
        { name: 'Green', value: 'bg-green-500' },
        { name: 'Yellow', value: 'bg-yellow-500' },
        { name: 'Red', value: 'bg-red-500' },
        { name: 'Teal', value: 'bg-teal-500' },
        { name: 'Orange', value: 'bg-orange-500' },
        { name: 'Pink', value: 'bg-pink-500' },
        { name: 'Gray', value: 'bg-gray-500' },
    ];
    
    // Communication management
    const [showCommunicationModal, setShowCommunicationModal] = useState(false);
    const [newCommunication, setNewCommunication] = useState<{
        type: CommunicationRecord['type'];
        subject?: string;
        content: string;
        relatedDonationId?: string;
    }>({
        type: 'note',
        content: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [donorsData, tagsData] = await Promise.all([
                getAllManagedDonors(),
                getAllTags(),
            ]);
            setDonors(donorsData);
            setFilteredDonors(donorsData);
            setAvailableTags(tagsData);
        } catch (err) {
            console.error('Failed to fetch donors:', err);
            setError('Failed to load donor data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDonor) {
            fetchDonorDonations(selectedDonor.donorId);
        }
    }, [selectedDonor]);

    const fetchDonorDonations = async (donorId: string) => {
        try {
            const donations = await getDonationsByUserId(donorId);
            setDonorDonations(donations);
        } catch (err) {
            console.error('Failed to fetch donor donations:', err);
        }
    };

    // Filter and sort donors
    useEffect(() => {
        let filtered = [...donors];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(donor =>
                donor.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                donor.donorPhoneNumber.includes(searchTerm) ||
                donor.donorAddress.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Tag filter
        if (filterTag) {
            filtered = filtered.filter(donor =>
                donor.tags.some(tag => tag.id === filterTag)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.donorName.localeCompare(b.donorName);
                    break;
                case 'totalDonations':
                    comparison = a.statistics.totalDonations - b.statistics.totalDonations;
                    break;
                case 'deliveredItems':
                    comparison = a.statistics.deliveredItems - b.statistics.deliveredItems;
                    break;
                case 'lastDonation':
                    const aDate = a.statistics.lastDonationDate?.getTime() || 0;
                    const bDate = b.statistics.lastDonationDate?.getTime() || 0;
                    comparison = aDate - bDate;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredDonors(filtered);
    }, [donors, searchTerm, filterTag, sortBy, sortOrder]);

    const handleSelectDonor = async (donor: ManagedDonor) => {
        setSelectedDonor(donor);
        await fetchDonorDonations(donor.donorId);
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim() || !user) return;
        
        try {
            const tag = await createTag(newTagName, newTagColor, user.name);
            setAvailableTags([...availableTags, tag]);
            setNewTagName('');
            setNewTagColor('bg-blue-500');
            setIsCreatingTag(false);
            await fetchData(); // Refresh to get tags assigned
        } catch (err) {
            alert('Failed to create tag. Please try again.');
        }
    };

    const handleAddTagToDonor = async (donorId: string, tagId: string) => {
        try {
            await addTagToDonor(donorId, tagId);
            await fetchData();
        } catch (err) {
            alert('Failed to add tag. Please try again.');
        }
    };

    const handleRemoveTagFromDonor = async (donorId: string, tagId: string) => {
        try {
            await removeTagFromDonor(donorId, tagId);
            await fetchData();
        } catch (err) {
            alert('Failed to remove tag. Please try again.');
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        if (!confirm('Are you sure you want to delete this tag? It will be removed from all donors.')) return;
        
        try {
            await deleteTag(tagId);
            setAvailableTags(availableTags.filter(t => t.id !== tagId));
            await fetchData();
        } catch (err) {
            alert('Failed to delete tag. Please try again.');
        }
    };

    const handleAddCommunication = async () => {
        if (!selectedDonor || !newCommunication.content.trim() || !user) return;
        
        try {
            await addCommunicationRecord({
                donorId: selectedDonor.donorId,
                type: newCommunication.type,
                subject: newCommunication.subject,
                content: newCommunication.content,
                performedBy: user.name,
                relatedDonationId: newCommunication.relatedDonationId,
            });
            setShowCommunicationModal(false);
            setNewCommunication({ type: 'note', content: '' });
            await fetchData();
        } catch (err) {
            alert('Failed to add communication record. Please try again.');
        }
    };

    const handleDeleteCommunication = async (recordId: string) => {
        if (!confirm('Are you sure you want to delete this communication record?')) return;
        
        try {
            await deleteCommunicationRecord(recordId);
            await fetchData();
        } catch (err) {
            alert('Failed to delete communication record. Please try again.');
        }
    };

    const handleDonationUpdate = async () => {
        if (selectedDonor) {
            await fetchDonorDonations(selectedDonor.donorId);
            // Refresh donor data to update statistics
            const updatedDonors = await getAllManagedDonors();
            const updatedDonor = updatedDonors.find(d => d.donorId === selectedDonor.donorId);
            if (updatedDonor) {
                setSelectedDonor(updatedDonor);
            }
            await fetchData();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md max-w-6xl mx-auto">
                {error}
            </div>
        );
    }

    if (selectedDonor) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedDonor(null)}
                            className="text-teal-600 hover:text-teal-800 font-medium flex items-center gap-2"
                        >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Donors
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Donor Profile: {selectedDonor.donorName}</h1>
                    </div>
                </div>

                {/* Donor Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                            <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {selectedDonor.donorName}</p>
                                <p><strong>Phone:</strong> {selectedDonor.donorPhoneNumber}</p>
                                <p><strong>Address:</strong> {selectedDonor.donorAddress}</p>
                                {selectedDonor.donorEmail && (
                                    <p><strong>Email:</strong> {selectedDonor.donorEmail}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tags</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedDonor.tags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`${tag.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2`}
                                    >
                                        {tag.name}
                                        <button
                                            onClick={() => handleRemoveTagFromDonor(selectedDonor.donorId, tag.id)}
                                            className="hover:bg-black/20 rounded-full p-0.5"
                                            aria-label={`Remove ${tag.name} tag`}
                                        >
                                            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleAddTagToDonor(selectedDonor.donorId, e.target.value);
                                            // Reset select
                                            const select = e.target as HTMLSelectElement;
                                            select.value = '';
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                >
                                    <option value="">Select a tag to add...</option>
                                    {availableTags
                                        .filter(tag => !selectedDonor.tags.some(st => st.id === tag.id))
                                        .map(tag => (
                                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                                        ))}
                                </select>
                                {availableTags.filter(tag => !selectedDonor.tags.some(st => st.id === tag.id)).length === 0 && (
                                    <button
                                        onClick={() => setIsCreatingTag(true)}
                                        className="px-3 py-2 text-sm text-teal-600 hover:text-teal-800 font-medium border border-teal-300 rounded-md hover:bg-teal-50 transition"
                                    >
                                        Create New Tag
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Donations</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedDonor.statistics.totalDonations}</p>
                            </div>
                            <div className="bg-teal-100 rounded-full p-3">
                                <svg className="h-6 w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Items Delivered</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedDonor.statistics.deliveredItems}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">People Helped</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedDonor.statistics.totalImpact.peopleHelped}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedDonor.statistics.favoriteCategories.length}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Donation Status Breakdown</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-800">{selectedDonor.statistics.pendingDonations}</p>
                            <p className="text-sm text-yellow-600">Pending</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-800">{selectedDonor.statistics.approvedDonations}</p>
                            <p className="text-sm text-blue-600">Approved</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-800">{selectedDonor.statistics.deliveredDonations}</p>
                            <p className="text-sm text-green-600">Delivered</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-800">{selectedDonor.statistics.rejectedDonations}</p>
                            <p className="text-sm text-red-600">Rejected</p>
                        </div>
                    </div>
                </div>

                {/* Communication History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Communication History</h2>
                        <button
                            onClick={() => setShowCommunicationModal(true)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Communication
                        </button>
                    </div>
                    {selectedDonor.communicationHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 italic">No communication records yet.</p>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {selectedDonor.communicationHistory.map(record => (
                                <div key={record.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                record.type === 'email' ? 'bg-blue-100 text-blue-800' :
                                                record.type === 'phone' ? 'bg-green-100 text-green-800' :
                                                record.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                                                record.type === 'note' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                                            </span>
                                            {record.subject && (
                                                <span className="font-semibold text-gray-800">{record.subject}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCommunication(record.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                            aria-label="Delete communication record"
                                        >
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{record.content}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>by {record.performedBy}</span>
                                        <span>•</span>
                                        <span>{record.date.toLocaleDateString()} {record.date.toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Donation History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Donation History</h2>
                    {donorDonations.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 italic">No donations yet.</p>
                    ) : (
                        <DonationList
                            donations={donorDonations}
                            onManage={() => {}}
                            onViewDetails={(donation) => {
                                setSelectedDonation(donation);
                                setIsDetailsModalOpen(true);
                            }}
                        />
                    )}
                </div>

                {/* Communication Modal */}
                {showCommunicationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowCommunicationModal(false)}>
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">Add Communication Record</h3>
                                <button onClick={() => setShowCommunicationModal(false)} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={newCommunication.type}
                                        onChange={(e) => setNewCommunication({...newCommunication, type: e.target.value as CommunicationRecord['type']})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="note">Note</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {(newCommunication.type === 'email' || newCommunication.type === 'meeting') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <input
                                            type="text"
                                            value={newCommunication.subject || ''}
                                            onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            placeholder="Enter subject..."
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        value={newCommunication.content}
                                        onChange={(e) => setNewCommunication({...newCommunication, content: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                        rows={5}
                                        placeholder="Enter communication details..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Donation (Optional)</label>
                                    <select
                                        value={newCommunication.relatedDonationId || ''}
                                        onChange={(e) => setNewCommunication({...newCommunication, relatedDonationId: e.target.value || undefined})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">None</option>
                                        {donorDonations.map(donation => (
                                            <option key={donation.id} value={donation.id}>
                                                {donation.itemName} - {donation.submittedAt.toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowCommunicationModal(false);
                                            setNewCommunication({ type: 'note', content: '' });
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddCommunication}
                                        disabled={!newCommunication.content.trim()}
                                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                    >
                                        Add Communication
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Donation Details Modal */}
                <DonationDetailsModal
                    donation={selectedDonation}
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedDonation(null);
                    }}
                    onStatusUpdate={async (id, status) => {
                        try {
                            if (user) {
                                await updateDonationStatus(id, status, user.name);
                                await handleDonationUpdate();
                            }
                        } catch (err) {
                            alert('Failed to update status. Please try again.');
                        }
                    }}
                    onQuantityUpdate={async (id, quantity) => {
                        try {
                            if (quantity < 0) {
                                alert('Quantity cannot be negative.');
                                return;
                            }
                            if (user) {
                                await updateDonationQuantity(id, quantity, user.name);
                                await handleDonationUpdate();
                            }
                        } catch (err) {
                            alert('Failed to update quantity. Please try again.');
                        }
                    }}
                    onDonationUpdate={handleDonationUpdate}
                    isAdmin={true}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Donor Management</h1>
                <div className="flex items-center gap-3">
                    {isCreatingTag ? (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-md shadow-md">
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="Tag name"
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                autoFocus
                            />
                            <select
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                                {tagColors.map(color => (
                                    <option key={color.value} value={color.value}>{color.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleCreateTag}
                                disabled={!newTagName.trim()}
                                className="px-3 py-1 bg-teal-500 text-white rounded text-sm hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreatingTag(false);
                                    setNewTagName('');
                                    setNewTagColor('bg-blue-500');
                                }}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreatingTag(true)}
                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Tag
                        </button>
                    )}
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, phone, or address..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
                        <select
                            value={filterTag || ''}
                            onChange={(e) => setFilterTag(e.target.value || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="">All Tags</option>
                            {availableTags.map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="deliveredItems">Items Delivered</option>
                                <option value="totalDonations">Total Donations</option>
                                <option value="name">Name</option>
                                <option value="lastDonation">Last Donation</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                {sortOrder === 'asc' ? (
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Donors List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Donor</th>
                                <th scope="col" className="px-6 py-3">Tags</th>
                                <th scope="col" className="px-6 py-3">Total Donations</th>
                                <th scope="col" className="px-6 py-3">Items Delivered</th>
                                <th scope="col" className="px-6 py-3">Last Donation</th>
                                <th scope="col" className="px-6 py-3">Contact</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDonors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No donors found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDonors.map(donor => (
                                    <tr key={donor.donorId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{donor.donorName}</div>
                                            <div className="text-xs text-gray-500">{donor.donorAddress}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {donor.tags.length === 0 ? (
                                                    <span className="text-gray-400 text-xs">No tags</span>
                                                ) : (
                                                    donor.tags.slice(0, 2).map(tag => (
                                                        <span
                                                            key={tag.id}
                                                            className={`${tag.color} text-white px-2 py-0.5 rounded text-xs`}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))
                                                )}
                                                {donor.tags.length > 2 && (
                                                    <span className="text-gray-500 text-xs">+{donor.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {donor.statistics.totalDonations}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-green-700">
                                            {donor.statistics.deliveredItems}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {donor.statistics.lastDonationDate
                                                ? donor.statistics.lastDonationDate.toLocaleDateString()
                                                : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="text-xs">{donor.donorPhoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleSelectDonor(donor)}
                                                className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-600">Total Donors</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredDonors.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {filteredDonors.reduce((sum, d) => sum + d.statistics.totalDonations, 0)}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-600">Total Items Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {filteredDonors.reduce((sum, d) => sum + d.statistics.deliveredItems, 0)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DonorManagement;

