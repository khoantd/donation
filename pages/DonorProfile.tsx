import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDonationsByUserId } from '../services/donationService';
import { getDonorProfile, updateDonorProfile, updateDonationGoal, deleteDonationGoal, AVAILABLE_ACHIEVEMENTS } from '../services/donorProfileService';
import { DonationItem, DonationStatus, DonorProfile, DonationGoal } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DonorProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState<DonationItem[]>([]);
    const [profile, setProfile] = useState<DonorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Partial<DonationGoal> | null>(null);
    const [showAllAchievements, setShowAllAchievements] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                const userDonations = await getDonationsByUserId(user.id);
                setDonations(userDonations);
                
                const donorProfile = await getDonorProfile(user.id, userDonations);
                setProfile(donorProfile);
                setBioText(donorProfile.bio || '');
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSaveBio = async () => {
        if (!profile || !user) return;
        
        try {
            const updated = await updateDonorProfile(user.id, { bio: bioText });
            setProfile(updated);
            setIsEditingBio(false);
        } catch (err) {
            alert('Failed to update bio.');
        }
    };

    const handleSaveGoal = async () => {
        if (!profile || !user || !editingGoal || !editingGoal.type || !editingGoal.target || !editingGoal.description) return;
        
        try {
            const goal: DonationGoal = {
                id: editingGoal.id || `goal-${Date.now()}`,
                type: editingGoal.type,
                target: editingGoal.target,
                current: editingGoal.current || 0,
                description: editingGoal.description,
                deadline: editingGoal.deadline,
                completed: false,
            };

            // Calculate current progress based on donations
            const deliveredDonations = donations.filter(d => d.status === DonationStatus.DELIVERED);
            
            switch (goal.type) {
                case 'items':
                    goal.current = deliveredDonations.reduce((sum, d) => sum + d.quantity, 0);
                    break;
                case 'donations':
                    goal.current = deliveredDonations.length;
                    break;
                case 'categories':
                    goal.current = new Set(deliveredDonations.map(d => d.category)).size;
                    break;
            }

            goal.completed = goal.current >= goal.target;
            if (goal.completed && !editingGoal.completedAt) {
                goal.completedAt = new Date();
            }

            const updated = await updateDonationGoal(user.id, goal);
            setProfile(updated);
            setIsEditingGoal(false);
            setEditingGoal(null);
        } catch (err) {
            alert('Failed to save goal.');
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!profile || !user) return;
        
        if (!confirm('Are you sure you want to delete this goal?')) return;
        
        try {
            const updated = await deleteDonationGoal(user.id, goalId);
            setProfile(updated);
        } catch (err) {
            alert('Failed to delete goal.');
        }
    };

    const handleNewGoal = () => {
        setEditingGoal({
            type: 'items',
            target: 10,
            current: 0,
            description: '',
            completed: false,
        });
        setIsEditingGoal(true);
    };

    // Calculate donation trends (last 6 months)
    const donationTrends = React.useMemo(() => {
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
            
            const monthDonations = donations.filter(d => {
                const donationDate = new Date(d.submittedAt);
                return donationDate >= month && donationDate < nextMonth;
            });

            const delivered = monthDonations.filter(d => d.status === DonationStatus.DELIVERED);

            return {
                month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                donations: monthDonations.length,
                delivered: delivered.length,
                items: delivered.reduce((sum, d) => sum + d.quantity, 0),
            };
        });
    }, [donations]);

    // Update goals progress when donations change
    useEffect(() => {
        if (!profile || !user || profile.donationGoals.length === 0) return;

        const updateGoalsProgress = async () => {
            const deliveredDonations = donations.filter(d => d.status === DonationStatus.DELIVERED);
            let hasChanges = false;
            
            const updatedGoals = profile.donationGoals.map(goal => {
                let current = goal.current;
                
                switch (goal.type) {
                    case 'items':
                        current = deliveredDonations.reduce((sum, d) => sum + d.quantity, 0);
                        break;
                    case 'donations':
                        current = deliveredDonations.length;
                        break;
                    case 'categories':
                        current = new Set(deliveredDonations.map(d => d.category)).size;
                        break;
                }

                const completed = current >= goal.target;
                const wasCompleted = goal.completed;
                
                if (current !== goal.current || completed !== goal.completed) {
                    hasChanges = true;
                }

                return {
                    ...goal,
                    current,
                    completed,
                    completedAt: completed && !wasCompleted ? new Date() : goal.completedAt,
                };
            });

            if (hasChanges) {
                try {
                    const updated = await updateDonorProfile(user.id, { donationGoals: updatedGoals });
                    setProfile(updated);
                } catch (err) {
                    console.error('Failed to update goals progress:', err);
                }
            }
        };

        updateGoalsProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [donations.length, user?.id]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div></div>;
    }

    if (error || !profile || !user) {
        return <div className="text-center text-red-500">{error || 'Profile not found'}</div>;
    }

    const unlockedAchievements = profile.achievements.filter(a => a.unlockedAt);
    const lockedAchievements = AVAILABLE_ACHIEVEMENTS.filter(a => !profile.achievements.some(ua => ua.id === a.id));
    const displayedAchievements = showAllAchievements 
        ? [...unlockedAchievements, ...lockedAchievements]
        : unlockedAchievements;

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return 'border-gray-300 bg-gray-50';
            case 'rare':
                return 'border-blue-300 bg-blue-50';
            case 'epic':
                return 'border-purple-300 bg-purple-50';
            case 'legendary':
                return 'border-yellow-300 bg-yellow-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };

    const stats = {
        totalDonations: donations.length,
        totalItems: donations.reduce((sum, d) => sum + d.quantity, 0),
        deliveredItems: donations
            .filter(d => d.status === DonationStatus.DELIVERED)
            .reduce((sum, d) => sum + d.quantity, 0),
        deliveredDonations: donations.filter(d => d.status === DonationStatus.DELIVERED).length,
        approvedDonations: donations.filter(d => d.status === DonationStatus.APPROVED).length,
        pendingDonations: donations.filter(d => d.status === DonationStatus.PENDING).length,
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <img 
                        src={user.avatarUrl} 
                        alt={user.name}
                        className="h-24 w-24 rounded-full object-cover border-4 border-teal-500"
                    />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                        <p className="text-gray-600 mb-4">{user.email}</p>
                        
                        {/* Bio Section */}
                        <div className="mt-4">
                            {isEditingBio ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={bioText}
                                        onChange={(e) => setBioText(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveBio}
                                            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setBioText(profile.bio || '');
                                                setIsEditingBio(false);
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <p className="text-gray-700 flex-1">
                                        {profile.bio || <span className="text-gray-400 italic">No bio yet. Click edit to add one.</span>}
                                    </p>
                                    <button
                                        onClick={() => setIsEditingBio(true)}
                                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                    >
                                        {profile.bio ? 'Edit' : 'Add Bio'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-teal-100 text-sm font-medium">Items Delivered</span>
                        <svg className="h-6 w-6 text-teal-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{profile.totalImpact.itemsDelivered}</p>
                    <p className="text-teal-100 text-sm mt-1">Total items donated</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-100 text-sm font-medium">People Helped</span>
                        <svg className="h-6 w-6 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{profile.totalImpact.peopleHelped}</p>
                    <p className="text-blue-100 text-sm mt-1">Estimated beneficiaries</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-green-100 text-sm font-medium">Categories Covered</span>
                        <svg className="h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{profile.totalImpact.categoriesCovered}</p>
                    <p className="text-green-100 text-sm mt-1">Different categories</p>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold text-green-600">{stats.deliveredDonations}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingDonations}</p>
                </div>
            </div>

            {/* Donation Trends Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Donation Trends (Last 6 Months)</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={donationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="donations" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} name="Donations" />
                        <Area type="monotone" dataKey="items" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Items" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Achievements Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Achievements ({unlockedAchievements.length} / {AVAILABLE_ACHIEVEMENTS.length})
                    </h2>
                    <button
                        onClick={() => setShowAllAchievements(!showAllAchievements)}
                        className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                        {showAllAchievements ? 'Show Unlocked Only' : 'Show All'}
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayedAchievements.map((achievement) => {
                        const isUnlocked = achievement.unlockedAt !== undefined;
                        return (
                            <div
                                key={achievement.id}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    isUnlocked
                                        ? getRarityColor(achievement.rarity)
                                        : 'border-gray-200 bg-gray-50 opacity-60'
                                }`}
                            >
                                <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                                <h3 className="font-semibold text-sm text-gray-900 mb-1">{achievement.title}</h3>
                                <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                                {isUnlocked && achievement.unlockedAt && (
                                    <p className="text-xs text-gray-500">
                                        Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                                    </p>
                                )}
                                {!isUnlocked && (
                                    <p className="text-xs text-gray-400 italic">Locked</p>
                                )}
                                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                                    achievement.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                                    achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                                    achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                                    'bg-yellow-200 text-yellow-700'
                                }`}>
                                    {achievement.rarity}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Favorite Categories */}
            {profile.favoriteCategories.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Favorite Categories</h2>
                    <div className="flex flex-wrap gap-3">
                        {profile.favoriteCategories.map((category, index) => (
                            <div
                                key={category}
                                className="px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium flex items-center gap-2"
                            >
                                <span className="text-lg">#{index + 1}</span>
                                <span>{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy Settings */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Show on Leaderboard</h3>
                            <p className="text-sm text-gray-600">
                                Allow your name and donation stats to appear on the public leaderboard. You can opt-out anytime.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                checked={profile.preferences.showOnLeaderboard}
                                onChange={async (e) => {
                                    try {
                                        const updated = await updateDonorProfile(user!.id, {
                                            preferences: {
                                                ...profile.preferences,
                                                showOnLeaderboard: e.target.checked,
                                            },
                                        });
                                        setProfile(updated);
                                    } catch (err) {
                                        alert('Failed to update privacy setting.');
                                    }
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Donation Goals */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Donation Goals</h2>
                    <button
                        onClick={handleNewGoal}
                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm font-medium"
                    >
                        + New Goal
                    </button>
                </div>

                {/* Goal Form */}
                {isEditingGoal && editingGoal && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">
                            {editingGoal.id ? 'Edit Goal' : 'New Goal'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                                <select
                                    value={editingGoal.type || 'items'}
                                    onChange={(e) => setEditingGoal({ ...editingGoal, type: e.target.value as 'items' | 'donations' | 'categories' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                >
                                    <option value="items">Total Items</option>
                                    <option value="donations">Number of Donations</option>
                                    <option value="categories">Categories Covered</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={editingGoal.description || ''}
                                    onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                                    placeholder="e.g., Donate 100 items this year"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                                    <input
                                        type="number"
                                        value={editingGoal.target || 0}
                                        onChange={(e) => setEditingGoal({ ...editingGoal, target: parseInt(e.target.value, 10) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (optional)</label>
                                    <input
                                        type="date"
                                        value={editingGoal.deadline ? editingGoal.deadline.toISOString().split('T')[0] : ''}
                                        onChange={(e) => setEditingGoal({ 
                                            ...editingGoal, 
                                            deadline: e.target.value ? new Date(e.target.value) : undefined 
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveGoal}
                                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm"
                                >
                                    Save Goal
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingGoal(false);
                                        setEditingGoal(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Goals List */}
                <div className="space-y-4">
                    {profile.donationGoals.length > 0 ? (
                        profile.donationGoals.map((goal) => {
                            const progress = Math.min((goal.current / goal.target) * 100, 100);
                            const isOverdue = goal.deadline && !goal.completed && new Date(goal.deadline) < new Date();
                            
                            return (
                                <div
                                    key={goal.id}
                                    className={`p-4 rounded-lg border-2 ${
                                        goal.completed
                                            ? 'border-green-300 bg-green-50'
                                            : isOverdue
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{goal.description}</h3>
                                                {goal.completed && (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        Completed
                                                    </span>
                                                )}
                                                {isOverdue && (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {goal.type === 'items' && 'Total items delivered'}
                                                {goal.type === 'donations' && 'Number of donations delivered'}
                                                {goal.type === 'categories' && 'Categories covered'}
                                            </p>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>{goal.current} / {goal.target}</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className={`h-2.5 rounded-full transition-all ${
                                                                goal.completed
                                                                    ? 'bg-green-500'
                                                                    : progress > 75
                                                                    ? 'bg-teal-500'
                                                                    : progress > 50
                                                                    ? 'bg-blue-500'
                                                                    : progress > 25
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-gray-400'
                                                            }`}
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            {goal.deadline && (
                                                <p className="text-xs text-gray-500">
                                                    Deadline: {goal.deadline.toLocaleDateString()}
                                                    {goal.completed && goal.completedAt && (
                                                        <> • Completed: {goal.completedAt.toLocaleDateString()}</>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    setEditingGoal(goal);
                                                    setIsEditingGoal(true);
                                                }}
                                                className="text-teal-600 hover:text-teal-800 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-center py-8">No goals set yet. Create your first goal!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonorProfilePage;

