import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    getRecipientProfileWithStats,
    getItemRequests,
    getActiveItemRequests,
    updateRecipientProfileData,
    calculateProfileCompleteness,
    getRequestHistoryTimeline
} from '../services/recipientProfileService';
import { getRecipientProfile } from '../services/recipientRegistrationService';
import { RecipientProfile, ItemRequest } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const RecipientProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<RecipientProfile | null>(null);
    const [statistics, setStatistics] = useState<any>(null);
    const [allRequests, setAllRequests] = useState<ItemRequest[]>([]);
    const [activeRequests, setActiveRequests] = useState<ItemRequest[]>([]);
    const [timeline, setTimeline] = useState<Array<{
        date: Date;
        event: string;
        requestId?: string;
        requestName?: string;
        status?: ItemRequest['status'];
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    
    // Editing states
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Partial<RecipientProfile>>({});
    const [isEditingPreferences, setIsEditingPreferences] = useState(false);
    const [editingPreferences, setEditingPreferences] = useState<RecipientProfile['preferences']>({
        preferredCategories: [],
        deliveryPreference: 'delivery',
        preferredContactMethod: 'email',
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user || (user.role !== 'recipient' && !user.roles?.includes('recipient'))) return;
            
            try {
                setLoading(true);
                setError('');
                
                const [profileData, requestsData, activeRequestsData, timelineData] = await Promise.all([
                    getRecipientProfileWithStats(user.id),
                    getItemRequests(user.id),
                    getActiveItemRequests(user.id),
                    getRequestHistoryTimeline(user.id),
                ]);
                
                setProfile(profileData.profile);
                setStatistics(profileData.statistics);
                setAllRequests(requestsData);
                setActiveRequests(activeRequestsData);
                setTimeline(timelineData);
                setBioText(profileData.profile.bio || '');
                setEditingPreferences(profileData.profile.preferences || {
                    preferredCategories: [],
                    deliveryPreference: 'delivery',
                    preferredContactMethod: 'email',
                });
            } catch (err) {
                console.error('Failed to fetch recipient profile:', err);
                setError('Failed to load profile data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSaveBio = async () => {
        if (!profile || !user) return;
        
        try {
            const updated = await updateRecipientProfileData(user.id, { bio: bioText });
            setProfile(updated);
            setIsEditingBio(false);
        } catch (err) {
            alert('Failed to update bio.');
        }
    };

    const handleSaveProfile = async () => {
        if (!profile || !user) return;
        
        try {
            const updated = await updateRecipientProfileData(user.id, editingProfile);
            setProfile(updated);
            setIsEditingProfile(false);
            setEditingProfile({});
        } catch (err) {
            alert('Failed to update profile.');
        }
    };

    const handleSavePreferences = async () => {
        if (!profile || !user) return;
        
        try {
            const updated = await updateRecipientProfileData(user.id, { preferences: editingPreferences });
            setProfile(updated);
            setIsEditingPreferences(false);
        } catch (err) {
            alert('Failed to update preferences.');
        }
    };

    // Calculate request trends (last 6 months) - MUST be before early returns
    const requestTrends = React.useMemo(() => {
        if (!allRequests || allRequests.length === 0) return [];
        
        const months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            return date;
        });

        return months.map(month => {
            const nextMonth = new Date(month);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            const monthRequests = allRequests.filter(r => {
                const requestDate = new Date(r.submittedAt);
                return requestDate >= month && requestDate < nextMonth;
            });

            const fulfilled = monthRequests.filter(r => r.status === 'fulfilled');

            return {
                month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                submitted: monthRequests.length,
                fulfilled: fulfilled.length,
                itemsReceived: fulfilled.reduce((sum, r) => sum + (r.quantityReceived || 0), 0),
            };
        });
    }, [allRequests]);

    // Category breakdown - MUST be before early returns
    const categoryBreakdown = React.useMemo(() => {
        if (!allRequests || allRequests.length === 0) return [];
        
        const categories: { [key: string]: { requested: number; received: number } } = {};
        allRequests.forEach(request => {
            if (!categories[request.category]) {
                categories[request.category] = { requested: 0, received: 0 };
            }
            categories[request.category].requested += request.quantityNeeded;
            if (request.quantityReceived) {
                categories[request.category].received += request.quantityReceived;
            }
        });
        return Object.entries(categories).map(([category, data]) => ({
            category,
            ...data,
        }));
    }, [allRequests]);

    // Early returns AFTER all hooks
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error || !profile || !statistics || !user) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md">
                    {error || 'Profile not found. Please make sure you are logged in as a recipient.'}
                </div>
            </div>
        );
    }

    const completeness = calculateProfileCompleteness(profile);
    const getStatusColor = (status: ItemRequest['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'approved':
            case 'matched':
                return 'bg-blue-100 text-blue-800 border-blue-500';
            case 'fulfilled':
                return 'bg-green-100 text-green-800 border-green-500';
            case 'cancelled':
            case 'expired':
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

    const getVerificationStatusColor = (status: RecipientProfile['verificationStatus']) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800 border-green-500';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-500';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };


    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {user.name}'s Recipient Profile
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getVerificationStatusColor(profile.verificationStatus)}`}>
                                {profile.verificationStatus === 'verified' ? '✓ Verified' : 
                                 profile.verificationStatus === 'pending' ? '⏳ Pending Verification' :
                                 '✗ Rejected'}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Profile Completeness:</span>
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${
                                            completeness >= 80 ? 'bg-green-500' :
                                            completeness >= 50 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${completeness}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{completeness}%</span>
                            </div>
                        </div>
                    </div>
                    {user.avatarUrl && (
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-24 h-24 rounded-full border-4 border-teal-500"
                        />
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Items Received</p>
                            <p className="text-2xl font-bold text-gray-900">{statistics.totalItemsReceived}</p>
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
                            <p className="text-sm text-gray-600">Requests Submitted</p>
                            <p className="text-2xl font-bold text-gray-900">{statistics.totalRequests}</p>
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
                            <p className="text-sm text-gray-600">Fulfilled Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{statistics.fulfilledRequests}</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">People Served</p>
                            <p className="text-2xl font-bold text-gray-900">{statistics.peopleServed}</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-3">
                            <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Impact Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                        <p className="text-3xl font-bold text-teal-800">{statistics.totalItemsReceived}</p>
                        <p className="text-sm text-teal-600 mt-1">Items Received</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-800">{statistics.categoriesReceived}</p>
                        <p className="text-sm text-blue-600 mt-1">Categories Received</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-800">{statistics.peopleServed}</p>
                        <p className="text-sm text-purple-600 mt-1">People Served</p>
                    </div>
                </div>
            </div>

            {/* Active Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Active Requests</h2>
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {activeRequests.length} Active
                    </span>
                </div>
                {activeRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 italic">No active requests. Create a new request to get started!</p>
                ) : (
                    <div className="space-y-4">
                        {activeRequests.map(request => (
                            <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{request.itemName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                                                {request.urgency.toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span><strong>Category:</strong> {request.category}</span>
                                            <span><strong>Quantity Needed:</strong> {request.quantityNeeded}</span>
                                            {request.quantityReceived && (
                                                <span><strong>Received:</strong> {request.quantityReceived}</span>
                                            )}
                                            <span><strong>Submitted:</strong> {request.submittedAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {request.matchingStatus === 'waiting' && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                        ⏳ Waiting for matching donation...
                                    </div>
                                )}
                                {request.matchingStatus === 'matched' && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                                        ✓ Matched with available donation
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request Status Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Status Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-800">{statistics.pendingRequests}</p>
                        <p className="text-sm text-yellow-600">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-800">{statistics.approvedRequests}</p>
                        <p className="text-sm text-blue-600">Approved</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-800">{statistics.fulfilledRequests}</p>
                        <p className="text-sm text-green-600">Fulfilled</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-800">{statistics.cancelledRequests}</p>
                        <p className="text-sm text-red-600">Cancelled</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-800">{statistics.totalRequests}</p>
                        <p className="text-sm text-gray-600">Total</p>
                    </div>
                </div>
            </div>

            {/* Request Trends Chart */}
            {requestTrends.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Trends (Last 6 Months)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={requestTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="submitted" stroke="#14b8a6" name="Submitted" strokeWidth={2} />
                            <Line type="monotone" dataKey="fulfilled" stroke="#10b981" name="Fulfilled" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Category Breakdown Chart */}
            {categoryBreakdown.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Category Breakdown</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="requested" fill="#14b8a6" name="Requested" />
                            <Bar dataKey="received" fill="#10b981" name="Received" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Request History Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Request History Timeline</h2>
                {timeline.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 italic">No request history yet.</p>
                ) : (
                    <div className="space-y-4">
                        {timeline.slice(0, 10).map((item, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(item.status || 'pending').split(' ')[1]} border-2`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-semibold text-gray-800">{item.event}</span>
                                        {item.requestName && (
                                            <span className="text-sm text-gray-600">- {item.requestName}</span>
                                        )}
                                        {item.status && (
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {timeline.length > 10 && (
                            <p className="text-sm text-gray-500 text-center pt-2">
                                Showing latest 10 events. Total: {timeline.length} events
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                    {!isEditingProfile && (
                        <button
                            onClick={() => {
                                setIsEditingProfile(true);
                                setEditingProfile({
                                    bio: profile.bio,
                                    familySize: profile.familySize,
                                    familyComposition: profile.familyComposition,
                                    needs: profile.needs,
                                });
                            }}
                            className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {isEditingProfile ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                value={editingProfile.bio || ''}
                                onChange={(e) => setEditingProfile({...editingProfile, bio: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                rows={4}
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
                                <input
                                    type="number"
                                    value={editingProfile.familySize || profile.familySize || 1}
                                    onChange={(e) => setEditingProfile({...editingProfile, familySize: parseInt(e.target.value) || 1})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Family Composition</label>
                                <input
                                    type="text"
                                    value={editingProfile.familyComposition || profile.familyComposition || ''}
                                    onChange={(e) => setEditingProfile({...editingProfile, familyComposition: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="e.g., 2 adults, 3 children"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Needs/Requirements</label>
                            <textarea
                                value={editingProfile.needs || ''}
                                onChange={(e) => setEditingProfile({...editingProfile, needs: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                rows={3}
                                placeholder="Describe your family's needs and requirements..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveProfile}
                                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition font-medium"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingProfile(false);
                                    setEditingProfile({});
                                }}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                                {profile.bio || 'No bio added yet.'}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
                                <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{profile.familySize || 'Not specified'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Family Composition</label>
                                <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{profile.familyComposition || 'Not specified'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                                <p className={`text-gray-800 bg-gray-50 p-3 rounded-md font-semibold ${getVerificationStatusColor(profile.verificationStatus).split(' ')[1]}`}>
                                    {profile.verificationStatus.charAt(0).toUpperCase() + profile.verificationStatus.slice(1)}
                                </p>
                            </div>
                        </div>
                        {profile.needs && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Needs/Requirements</label>
                                <p className="text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{profile.needs}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Preferences</h2>
                    {!isEditingPreferences && (
                        <button
                            onClick={() => {
                                setIsEditingPreferences(true);
                                setEditingPreferences(profile.preferences || {
                                    preferredCategories: [],
                                    deliveryPreference: 'delivery',
                                    preferredContactMethod: 'email',
                                });
                            }}
                            className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                        >
                            Edit Preferences
                        </button>
                    )}
                </div>

                {isEditingPreferences ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Preference</label>
                            <select
                                value={editingPreferences.deliveryPreference}
                                onChange={(e) => setEditingPreferences({...editingPreferences, deliveryPreference: e.target.value as 'delivery' | 'pickup' | 'either'})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="delivery">Delivery</option>
                                <option value="pickup">Pickup</option>
                                <option value="either">Either</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                            <select
                                value={editingPreferences.preferredContactMethod}
                                onChange={(e) => setEditingPreferences({...editingPreferences, preferredContactMethod: e.target.value as 'email' | 'phone' | 'sms' | 'in-app'})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="sms">SMS</option>
                                <option value="in-app">In-App</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSavePreferences}
                                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition font-medium"
                            >
                                Save Preferences
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingPreferences(false);
                                    setEditingPreferences(profile.preferences || {
                                        preferredCategories: [],
                                        deliveryPreference: 'delivery',
                                        preferredContactMethod: 'email',
                                    });
                                }}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Preference</label>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-md capitalize">
                                {profile.preferences?.deliveryPreference || 'Not set'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-md capitalize">
                                {profile.preferences?.preferredContactMethod || 'Not set'}
                            </p>
                        </div>
                        {profile.preferences?.preferredCategories && profile.preferences.preferredCategories.length > 0 && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferences.preferredCategories.map((category, index) => (
                                        <span key={index} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipientProfilePage;

