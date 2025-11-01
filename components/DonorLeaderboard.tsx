import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDonations } from '../services/donationService';
import { getLeaderboard, getUserLeaderboardPosition } from '../services/leaderboardService';
import { DonationItem, LeaderboardEntry } from '../types';

interface DonorLeaderboardProps {
    showUserPosition?: boolean;
    limit?: number;
}

const DonorLeaderboard: React.FC<DonorLeaderboardProps> = ({ 
    showUserPosition = true, 
    limit = 10 
}) => {
    const { user } = useAuth();
    const [donations, setDonations] = useState<DonationItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'all-time' | 'monthly'>('all-time');
    const [userPosition, setUserPosition] = useState<{ rank: number; entry: LeaderboardEntry | null } | null>(null);
    const [loadingUserPosition, setLoadingUserPosition] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const allDonations = await getDonations();
                setDonations(allDonations);
                
                const leaderboardData = await getLeaderboard(allDonations, period, limit);
                setLeaderboard(leaderboardData);

                // Get user's position if authenticated and showUserPosition is true
                if (user && user.role === 'donor' && showUserPosition) {
                    setLoadingUserPosition(true);
                    const position = await getUserLeaderboardPosition(user.id, allDonations, period);
                    setUserPosition(position);
                    setLoadingUserPosition(false);
                }
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period, limit, user, showUserPosition]);

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-lg shadow-lg">
                        🥇
                    </div>
                );
            case 2:
                return (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold text-lg shadow-lg">
                        🥈
                    </div>
                );
            case 3:
                return (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-lg shadow-lg">
                        🥉
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-lg">
                        {rank}
                    </div>
                );
        }
    };

    const userEntry = leaderboard.find(entry => entry.donorId === user?.id);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Top Donors</h2>
                <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No leaderboard data available yet.</p>
                    <p className="text-sm mt-2">Be the first to donate and top the leaderboard!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Top Donors</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium transition min-h-[44px] ${
                            period === 'monthly'
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => setPeriod('all-time')}
                        className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium transition min-h-[44px] ${
                            period === 'all-time'
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
                {leaderboard.map((entry) => {
                    const isCurrentUser = user && entry.donorId === user.id;
                    return (
                        <div
                            key={entry.donorId}
                            className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition ${
                                isCurrentUser
                                    ? 'border-teal-500 bg-teal-50'
                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {/* Rank and Avatar */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex-shrink-0">
                                    {getRankBadge(entry.rank)}
                                </div>
                                <div className="flex-shrink-0">
                                    {entry.donorAvatar ? (
                                        <img
                                            src={entry.donorAvatar}
                                            alt={entry.donorName}
                                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-white shadow"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow">
                                            {entry.donorName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Donor Info */}
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className={`font-semibold text-base sm:text-lg truncate ${
                                        isCurrentUser ? 'text-teal-700' : 'text-gray-900'
                                    }`}>
                                        {entry.donorName}
                                    </h3>
                                    {isCurrentUser && (
                                        <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-medium rounded-full whitespace-nowrap">
                                            You
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        <span className="font-medium text-gray-900">{entry.deliveredItems}</span>
                                        <span>items delivered</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-medium text-gray-900">{entry.deliveredDonations}</span>
                                        <span>donations</span>
                                    </span>
                                </div>
                            </div>

                            {/* Stats Badge */}
                            <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-right">
                                <div className={`px-3 sm:px-4 py-2 rounded-lg inline-block ${
                                    entry.rank <= 3
                                        ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                                        : 'bg-teal-100 text-teal-700'
                                }`}>
                                    <div className="text-xs font-medium opacity-90">Items Delivered</div>
                                    <div className="text-lg sm:text-xl font-bold">{entry.deliveredItems}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Position (if not in top list) */}
            {user && user.role === 'donor' && showUserPosition && !userEntry && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    {loadingUserPosition ? (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                        </div>
                    ) : userPosition ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 border-teal-500 bg-teal-50">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500 text-white font-bold text-lg">
                                    {userPosition.rank}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-base sm:text-lg text-teal-700">Your Position</h3>
                                    <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-medium rounded-full whitespace-nowrap">
                                        You
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium text-gray-900">{userPosition.entry?.deliveredItems || 0}</span>
                                        <span>items delivered</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium text-gray-900">{userPosition.entry?.deliveredDonations || 0}</span>
                                        <span>donations</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            <p>You haven't made any delivered donations yet.</p>
                            <p className="mt-1">Start donating to appear on the leaderboard!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Privacy Note */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    💡 Privacy: You can opt-out of appearing on the leaderboard in your profile settings.
                </p>
            </div>
        </div>
    );
};

export default DonorLeaderboard;

