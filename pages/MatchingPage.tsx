import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDonations } from '../services/donationService';
import { DonationItem, DonationStatus } from '../types';
import { getPublicItemRequests, getItemRequestById, ItemRequest } from '../services/requestService';
import {
    getMatchingSuggestions,
    createDonationMatch,
    confirmMatch,
    rejectMatch,
    fulfillMatch,
    cancelMatch,
    getAllMatches,
    getMatchesByDonation,
    getMatchesByRequest,
    getMatchesByStatus,
    getUnmatchedDonations,
    getUnmatchedRequests,
    batchMatchDonationToRequests,
    batchMatchRequestToDonations,
    updateMatchNotes,
} from '../services/matchingService';
import { DonationMatch, MatchingSuggestion } from '../types';

const MatchingPage: React.FC = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState<DonationItem[]>([]);
    const [requests, setRequests] = useState<ItemRequest[]>([]);
    const [matches, setMatches] = useState<DonationMatch[]>([]);
    const [suggestions, setSuggestions] = useState<MatchingSuggestion[]>([]);
    const [unmatchedDonations, setUnmatchedDonations] = useState<DonationItem[]>([]);
    const [unmatchedRequests, setUnmatchedRequests] = useState<ItemRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    
    // Modal and selection states
    const [activeTab, setActiveTab] = useState<'suggestions' | 'manual' | 'matches' | 'unmatched'>('suggestions');
    const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null);
    const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
    const [isMatchDetailsModalOpen, setIsMatchDetailsModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<DonationMatch | null>(null);
    
    // Manual matching form
    const [matchingForm, setMatchingForm] = useState({
        donationId: '',
        requestId: '',
        quantityAllocated: 1,
        notes: '',
    });
    
    // Batch matching
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchDonationMatches, setBatchDonationMatches] = useState<Array<{ requestId: string; quantityAllocated: number }>>([]);
    const [batchRequestMatches, setBatchRequestMatches] = useState<Array<{ donationId: string; quantityAllocated: number }>>([]);
    
    // Filters
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterUrgency, setFilterUrgency] = useState<'all' | ItemRequest['urgency']>('all');
    const [minScore, setMinScore] = useState(50);
    const [searchQuery, setSearchQuery] = useState('');
    const [matchStatusFilter, setMatchStatusFilter] = useState<'all' | DonationMatch['status']>('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!user || user.role !== 'admin') {
                setError('Only admins can access the matching page.');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError('');
                
                const [
                    allDonations,
                    allRequests,
                    allMatches,
                    suggestionsData,
                    unmatchedDonationsData,
                    unmatchedRequestsData,
                ] = await Promise.all([
                    getDonations(),
                    getPublicItemRequests(),
                    getAllMatches(),
                    getMatchingSuggestions(undefined, undefined, minScore),
                    getUnmatchedDonations(),
                    getUnmatchedRequests(),
                ]);
                
                setDonations(allDonations);
                setRequests(allRequests);
                setMatches(allMatches);
                setSuggestions(suggestionsData);
                setUnmatchedDonations(unmatchedDonationsData);
                setUnmatchedRequests(unmatchedRequestsData);
            } catch (err) {
                console.error('Failed to fetch matching data:', err);
                setError('Failed to load matching data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, minScore]);

    const handleCreateMatch = async () => {
        if (!user || !matchingForm.donationId || !matchingForm.requestId || matchingForm.quantityAllocated < 1) {
            setError('Please select a donation and request, and enter a valid quantity.');
            return;
        }
        
        try {
            await createDonationMatch(
                matchingForm.donationId,
                matchingForm.requestId,
                matchingForm.quantityAllocated,
                user.name,
                matchingForm.notes
            );
            
            // Refresh data
            const [allMatches, suggestionsData, unmatchedDonationsData, unmatchedRequestsData] = await Promise.all([
                getAllMatches(),
                getMatchingSuggestions(undefined, undefined, minScore),
                getUnmatchedDonations(),
                getUnmatchedRequests(),
            ]);
            
            setMatches(allMatches);
            setSuggestions(suggestionsData);
            setUnmatchedDonations(unmatchedDonationsData);
            setUnmatchedRequests(unmatchedRequestsData);
            
            // Reset form
            setMatchingForm({ donationId: '', requestId: '', quantityAllocated: 1, notes: '' });
            setIsCreateMatchModalOpen(false);
        } catch (err: any) {
            setError(err.message || 'Failed to create match.');
        }
    };

    const handleConfirmMatch = async (matchId: string) => {
        if (!user) return;
        
        try {
            await confirmMatch(matchId, user.name);
            
            // Refresh data
            const [allMatches, suggestionsData, unmatchedDonationsData, unmatchedRequestsData] = await Promise.all([
                getAllMatches(),
                getMatchingSuggestions(undefined, undefined, minScore),
                getUnmatchedDonations(),
                getUnmatchedRequests(),
            ]);
            
            setMatches(allMatches);
            setSuggestions(suggestionsData);
            setUnmatchedDonations(unmatchedDonationsData);
            setUnmatchedRequests(unmatchedRequestsData);
        } catch (err: any) {
            setError(err.message || 'Failed to confirm match.');
        }
    };

    const handleRejectMatch = async (matchId: string, reason?: string) => {
        if (!user) return;
        
        if (!confirm('Are you sure you want to reject this match?')) return;
        
        try {
            await rejectMatch(matchId, user.name, reason);
            
            // Refresh data
            const allMatches = await getAllMatches();
            setMatches(allMatches);
        } catch (err: any) {
            setError(err.message || 'Failed to reject match.');
        }
    };

    const handleFulfillMatch = async (matchId: string) => {
        if (!user) return;
        
        if (!confirm('Mark this match as fulfilled?')) return;
        
        try {
            await fulfillMatch(matchId, user.name);
            
            // Refresh data
            const allMatches = await getAllMatches();
            setMatches(allMatches);
        } catch (err: any) {
            setError(err.message || 'Failed to fulfill match.');
        }
    };

    const handleCancelMatch = async (matchId: string) => {
        if (!user) return;
        
        if (!confirm('Are you sure you want to cancel this match?')) return;
        
        try {
            await cancelMatch(matchId, user.name);
            
            // Refresh data
            const [allMatches, unmatchedDonationsData, unmatchedRequestsData] = await Promise.all([
                getAllMatches(),
                getUnmatchedDonations(),
                getUnmatchedRequests(),
            ]);
            
            setMatches(allMatches);
            setUnmatchedDonations(unmatchedDonationsData);
            setUnmatchedRequests(unmatchedRequestsData);
        } catch (err: any) {
            setError(err.message || 'Failed to cancel match.');
        }
    };

    const handleSuggestionMatch = async (suggestion: MatchingSuggestion, quantityAllocated?: number) => {
        if (!user) return;
        
        try {
            const donation = donations.find(d => d.id === suggestion.donationId);
            const request = requests.find(r => r.id === suggestion.requestId);
            
            if (!donation || !request) {
                setError('Donation or request not found.');
                return;
            }
            
            // Calculate quantity to allocate
            const remainingNeeded = request.quantityNeeded - (request.quantityReceived || 0);
            const allocated = quantityAllocated || Math.min(donation.quantity, remainingNeeded);
            
            await createDonationMatch(
                suggestion.donationId,
                suggestion.requestId,
                allocated,
                user.name
            );
            
            // Refresh data
            const [allMatches, suggestionsData, unmatchedDonationsData, unmatchedRequestsData] = await Promise.all([
                getAllMatches(),
                getMatchingSuggestions(undefined, undefined, minScore),
                getUnmatchedDonations(),
                getUnmatchedRequests(),
            ]);
            
            setMatches(allMatches);
            setSuggestions(suggestionsData);
            setUnmatchedDonations(unmatchedDonationsData);
            setUnmatchedRequests(unmatchedRequestsData);
        } catch (err: any) {
            setError(err.message || 'Failed to create match from suggestion.');
        }
    };

    // Filter suggestions
    const filteredSuggestions = useMemo(() => {
        let filtered = suggestions;
        
        if (filterCategory !== 'all') {
            filtered = filtered.filter(s => {
                const donation = donations.find(d => d.id === s.donationId);
                const request = requests.find(r => r.id === s.requestId);
                return donation?.category === filterCategory || request?.category === filterCategory;
            });
        }
        
        if (filterUrgency !== 'all') {
            filtered = filtered.filter(s => {
                const request = requests.find(r => r.id === s.requestId);
                return request?.urgency === filterUrgency;
            });
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s => {
                const donation = donations.find(d => d.id === s.donationId);
                const request = requests.find(r => r.id === s.requestId);
                return (
                    donation?.itemName.toLowerCase().includes(query) ||
                    donation?.description.toLowerCase().includes(query) ||
                    request?.itemName.toLowerCase().includes(query) ||
                    request?.description.toLowerCase().includes(query)
                );
            });
        }
        
        return filtered;
    }, [suggestions, donations, requests, filterCategory, filterUrgency, searchQuery]);

    // Filter matches
    const filteredMatches = useMemo(() => {
        let filtered = matches;
        
        if (matchStatusFilter !== 'all') {
            filtered = filtered.filter(m => m.status === matchStatusFilter);
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m => {
                const donation = donations.find(d => d.id === m.donationId);
                const request = requests.find(r => r.id === m.requestId);
                return (
                    donation?.itemName.toLowerCase().includes(query) ||
                    request?.itemName.toLowerCase().includes(query)
                );
            });
        }
        
        return filtered;
    }, [matches, donations, requests, matchStatusFilter, searchQuery]);

    const getMatchStatusColor = (status: DonationMatch['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-500';
            case 'fulfilled':
                return 'bg-green-100 text-green-800 border-green-500';
            case 'rejected':
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-500';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };

    const getUrgencyColor = (urgency: ItemRequest['urgency']) => {
        switch (urgency) {
            case 'high':
                return 'bg-red-500 text-white';
            case 'medium':
                return 'bg-yellow-500 text-white';
            case 'low':
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error || !user || user.role !== 'admin') {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md">
                    {error || 'Only admins can access the matching page.'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation-Recipient Matching</h1>
                        <p className="text-gray-600">Match approved donations with recipient requests</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsCreateMatchModalOpen(true)}
                            className="bg-teal-500 text-white px-6 py-3 rounded-md hover:bg-teal-600 transition font-medium shadow-md"
                        >
                            + Create Match
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const newSuggestions = await getMatchingSuggestions(undefined, undefined, minScore);
                                    setSuggestions(newSuggestions);
                                } catch (err) {
                                    setError('Failed to refresh suggestions.');
                                }
                            }}
                            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition font-medium"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>
                
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-teal-50 p-4 rounded-lg">
                        <p className="text-sm text-teal-600 font-medium">Unmatched Donations</p>
                        <p className="text-2xl font-bold text-teal-800">{unmatchedDonations.length}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Unmatched Requests</p>
                        <p className="text-2xl font-bold text-blue-800">{unmatchedRequests.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Pending Matches</p>
                        <p className="text-2xl font-bold text-green-800">
                            {matches.filter(m => m.status === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Confirmed Matches</p>
                        <p className="text-2xl font-bold text-purple-800">
                            {matches.filter(m => m.status === 'confirmed' || m.status === 'fulfilled').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {[
                            { id: 'suggestions', label: 'Suggestions', count: filteredSuggestions.length },
                            { id: 'manual', label: 'Manual Match', count: 0 },
                            { id: 'matches', label: 'All Matches', count: filteredMatches.length },
                            { id: 'unmatched', label: 'Unmatched', count: unmatchedDonations.length + unmatchedRequests.length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                        activeTab === tab.id
                                            ? 'bg-teal-100 text-teal-800'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Filters */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Search donations/requests..."
                            />
                        </div>
                        {activeTab === 'suggestions' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="all">All Categories</option>
                                        {['Clothing', 'Food', 'Electronics', 'Books', 'Furniture', 'Medical', 'Toys', 'Other'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                                    <select
                                        value={filterUrgency}
                                        onChange={(e) => setFilterUrgency(e.target.value as any)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="all">All Urgency</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={minScore}
                                        onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </>
                        )}
                        {activeTab === 'matches' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={matchStatusFilter}
                                    onChange={(e) => setMatchStatusFilter(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="fulfilled">Fulfilled</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'suggestions' && (
                        <div className="space-y-4">
                            {filteredSuggestions.length === 0 ? (
                                <p className="text-gray-500 text-center py-12 italic">
                                    No matching suggestions found. Try adjusting filters or refreshing.
                                </p>
                            ) : (
                                filteredSuggestions.map(suggestion => {
                                    const donation = donations.find(d => d.id === suggestion.donationId);
                                    const request = requests.find(r => r.id === suggestion.requestId);
                                    
                                    if (!donation || !request) return null;
                                    
                                    const remainingNeeded = request.quantityNeeded - (request.quantityReceived || 0);
                                    const availableQuantity = donation.quantity;
                                    
                                    return (
                                        <div key={`${suggestion.donationId}-${suggestion.requestId}`} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getScoreColor(suggestion.matchingScore)}`}>
                                                            Score: {suggestion.matchingScore}
                                                        </span>
                                                        {suggestion.urgencyLevel && (
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getUrgencyColor(suggestion.urgencyLevel)}`}>
                                                                {suggestion.urgencyLevel.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Donation Info */}
                                                        <div className="border-r border-gray-200 pr-6">
                                                            <h3 className="font-semibold text-gray-800 mb-2">Donation</h3>
                                                            <p className="text-lg font-bold text-gray-900">{donation.itemName}</p>
                                                            <p className="text-sm text-gray-600 mt-1">{donation.description}</p>
                                                            <div className="mt-3 space-y-1 text-sm">
                                                                <p><strong>Category:</strong> {donation.category}</p>
                                                                <p><strong>Quantity:</strong> {donation.quantity}</p>
                                                                <p><strong>Donor:</strong> {donation.donorName}</p>
                                                                <p><strong>Status:</strong> {donation.status}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Request Info */}
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800 mb-2">Request</h3>
                                                            <p className="text-lg font-bold text-gray-900">{request.itemName}</p>
                                                            <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                                                            <div className="mt-3 space-y-1 text-sm">
                                                                <p><strong>Category:</strong> {request.category}</p>
                                                                <p><strong>Needed:</strong> {request.quantityNeeded}</p>
                                                                <p><strong>Received:</strong> {request.quantityReceived || 0}</p>
                                                                <p><strong>Remaining:</strong> {remainingNeeded}</p>
                                                                <p><strong>Recipient:</strong> {request.recipientName}</p>
                                                                <p><strong>Status:</strong> {request.status}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Matching Reasons */}
                                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm font-medium text-blue-800 mb-2">Matching Reasons:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {suggestion.reasons.map((reason, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                                    {reason}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="mt-2 text-xs text-blue-600">
                                                            <p><strong>Quantity Fit:</strong> {suggestion.quantityFit}</p>
                                                            {suggestion.categoryMatch && (
                                                                <p className="text-green-700">✓ Exact category match</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex flex-col gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const quantity = Math.min(availableQuantity, remainingNeeded);
                                                            handleSuggestionMatch(suggestion, quantity);
                                                        }}
                                                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition font-medium text-sm"
                                                    >
                                                        Match All
                                                    </button>
                                                    {availableQuantity > 1 && remainingNeeded > 1 && (
                                                        <button
                                                            onClick={() => {
                                                                const quantity = Math.floor(Math.min(availableQuantity, remainingNeeded) / 2);
                                                                if (quantity > 0) {
                                                                    handleSuggestionMatch(suggestion, quantity);
                                                                }
                                                            }}
                                                            className="bg-teal-200 text-teal-800 px-4 py-2 rounded-md hover:bg-teal-300 transition font-medium text-sm"
                                                        >
                                                            Match Partial
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'manual' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Manual Match</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Donation <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={matchingForm.donationId}
                                            onChange={(e) => {
                                                setMatchingForm({ ...matchingForm, donationId: e.target.value });
                                                const donation = donations.find(d => d.id === e.target.value);
                                                setSelectedDonation(donation || null);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        >
                                            <option value="">-- Select Donation --</option>
                                            {donations
                                                .filter(d => d.status === DonationStatus.APPROVED)
                                                .map(donation => (
                                                    <option key={donation.id} value={donation.id}>
                                                        {donation.itemName} ({donation.quantity} items) - {donation.category}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Request <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={matchingForm.requestId}
                                            onChange={(e) => {
                                                setMatchingForm({ ...matchingForm, requestId: e.target.value });
                                                const request = requests.find(r => r.id === e.target.value);
                                                setSelectedRequest(request || null);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        >
                                            <option value="">-- Select Request --</option>
                                            {requests
                                                .filter(r => r.status === 'approved' || r.status === 'pending')
                                                .map(request => {
                                                    const remaining = request.quantityNeeded - (request.quantityReceived || 0);
                                                    return (
                                                        <option key={request.id} value={request.id}>
                                                            {request.itemName} (need {remaining}) - {request.category} [{request.urgency}]
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                </div>
                                
                                {(selectedDonation || selectedRequest) && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedDonation && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Available Quantity</p>
                                                <p className="text-2xl font-bold text-gray-900">{selectedDonation.quantity}</p>
                                            </div>
                                        )}
                                        {selectedRequest && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Remaining Needed</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {selectedRequest.quantityNeeded - (selectedRequest.quantityReceived || 0)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity to Allocate <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedDonation ? selectedDonation.quantity : undefined}
                                        value={matchingForm.quantityAllocated}
                                        onChange={(e) => setMatchingForm({ ...matchingForm, quantityAllocated: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                    {selectedDonation && selectedRequest && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max: {Math.min(selectedDonation.quantity, selectedRequest.quantityNeeded - (selectedRequest.quantityReceived || 0))}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        value={matchingForm.notes}
                                        onChange={(e) => setMatchingForm({ ...matchingForm, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                        rows={3}
                                        placeholder="Add notes about this match..."
                                    />
                                </div>
                                
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={handleCreateMatch}
                                        className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition font-medium"
                                    >
                                        Create Match
                                    </button>
                                    <button
                                        onClick={() => setMatchingForm({ donationId: '', requestId: '', quantityAllocated: 1, notes: '' })}
                                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition font-medium"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'matches' && (
                        <div className="space-y-4">
                            {filteredMatches.length === 0 ? (
                                <p className="text-gray-500 text-center py-12 italic">No matches found.</p>
                            ) : (
                                filteredMatches.map(match => {
                                    const donation = donations.find(d => d.id === match.donationId);
                                    const request = requests.find(r => r.id === match.requestId);
                                    
                                    if (!donation || !request) return null;
                                    
                                    return (
                                        <div key={match.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getMatchStatusColor(match.status)}`}>
                                                            {match.status}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full text-sm font-bold text-white bg-teal-600">
                                                            Score: {match.matchingScore}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Matched: {match.matchedAt.toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 mb-1">Donation</p>
                                                            <p className="text-lg font-bold text-gray-900">{donation.itemName}</p>
                                                            <p className="text-sm text-gray-600">Quantity: {donation.quantity}</p>
                                                            <p className="text-sm text-gray-600">Category: {donation.category}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 mb-1">Request</p>
                                                            <p className="text-lg font-bold text-gray-900">{request.itemName}</p>
                                                            <p className="text-sm text-gray-600">Needed: {request.quantityNeeded}</p>
                                                            <p className="text-sm text-gray-600">Recipient: {request.recipientName}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-sm"><strong>Allocated Quantity:</strong> {match.quantityAllocated}</p>
                                                        <p className="text-sm"><strong>Matched By:</strong> {match.matchedBy}</p>
                                                        {match.notes && (
                                                            <p className="text-sm mt-1"><strong>Notes:</strong> {match.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex flex-col gap-2">
                                                    {match.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleConfirmMatch(match.id)}
                                                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition font-medium text-sm"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectMatch(match.id)}
                                                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition font-medium text-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {match.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleFulfillMatch(match.id)}
                                                            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition font-medium text-sm"
                                                        >
                                                            Mark Fulfilled
                                                        </button>
                                                    )}
                                                    {match.status !== 'fulfilled' && match.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleCancelMatch(match.id)}
                                                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition font-medium text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'unmatched' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Unmatched Donations */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Unmatched Donations ({unmatchedDonations.length})
                                </h2>
                                {unmatchedDonations.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 italic">All donations are matched!</p>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {unmatchedDonations.map(donation => (
                                            <div key={donation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                                <p className="font-semibold text-gray-900">{donation.itemName}</p>
                                                <p className="text-sm text-gray-600 mt-1">{donation.description}</p>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <p>Category: {donation.category} | Quantity: {donation.quantity}</p>
                                                    <p>Donor: {donation.donorName}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDonation(donation);
                                                        setMatchingForm({ ...matchingForm, donationId: donation.id });
                                                        setActiveTab('manual');
                                                    }}
                                                    className="mt-3 text-teal-600 hover:text-teal-800 font-medium text-sm"
                                                >
                                                    Create Match →
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Unmatched Requests */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Unmatched Requests ({unmatchedRequests.length})
                                </h2>
                                {unmatchedRequests.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 italic">All requests are matched!</p>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {unmatchedRequests.map(request => (
                                            <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="font-semibold text-gray-900">{request.itemName}</p>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                                                        {request.urgency.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <p>Category: {request.category} | Needed: {request.quantityNeeded}</p>
                                                    <p>Recipient: {request.recipientName}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setMatchingForm({ ...matchingForm, requestId: request.id });
                                                        setActiveTab('manual');
                                                    }}
                                                    className="mt-3 text-teal-600 hover:text-teal-800 font-medium text-sm"
                                                >
                                                    Create Match →
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
};

export default MatchingPage;

