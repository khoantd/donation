
import React, { useState, useEffect } from 'react';
import { getDonationsByUserId } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { DonationItem, DonationStatus } from '../types';
import DonationList from '../components/DonationList';
import SearchAndFilter from '../components/SearchAndFilter';
import DonationDetailsModal from '../components/DonationDetailsModal';

const HistoryPage: React.FC = () => {
    const [donations, setDonations] = useState<DonationItem[]>([]);
    const [filteredDonations, setFilteredDonations] = useState<DonationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState<DonationStatus | 'all'>('all');
    const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDonations = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const userDonations = await getDonationsByUserId(user.id);
                setDonations(userDonations);
                setFilteredDonations(userDonations);
            } catch (err) {
                setError('Failed to fetch donation history.');
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div></div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    // Calculate stats for user's donations
    const stats = {
        totalDonations: donations.length,
        totalItems: donations.reduce((sum, d) => sum + d.quantity, 0),
        byStatus: {
            pending: donations.filter(d => d.status === DonationStatus.PENDING).length,
            approved: donations.filter(d => d.status === DonationStatus.APPROVED).length,
            delivered: donations.filter(d => d.status === DonationStatus.DELIVERED).length,
            rejected: donations.filter(d => d.status === DonationStatus.REJECTED).length,
        }
    };

    // Handle tab change and update filtered donations
    const handleTabChange = (tab: DonationStatus | 'all') => {
        setSelectedTab(tab);
        const tabFiltered = tab === 'all' 
            ? donations 
            : donations.filter(d => d.status === tab);
        setFilteredDonations(tabFiltered);
    };

    // Handle filtered donations from SearchAndFilter component
    const handleFilteredDonations = (filtered: DonationItem[]) => {
        // Apply tab filter on top of SearchAndFilter results
        // This allows users to search across all donations while still respecting the selected tab
        if (selectedTab !== 'all') {
            const tabFiltered = filtered.filter(d => d.status === selectedTab);
            setFilteredDonations(tabFiltered);
        } else {
            setFilteredDonations(filtered);
        }
    };

    // Get status color for tabs
    const getStatusColor = (status: DonationStatus) => {
        switch (status) {
            case DonationStatus.PENDING:
                return 'text-yellow-600 border-yellow-500';
            case DonationStatus.APPROVED:
                return 'text-blue-600 border-blue-500';
            case DonationStatus.DELIVERED:
                return 'text-green-600 border-green-500';
            case DonationStatus.REJECTED:
                return 'text-red-600 border-red-500';
            default:
                return 'text-gray-600 border-gray-500';
        }
    };

    // Get active tab color
    const getActiveTabClasses = (tab: DonationStatus | 'all') => {
        const isActive = selectedTab === tab;
        const baseClasses = 'px-4 py-2 font-medium text-sm border-b-2 transition-colors';
        if (isActive) {
            return tab === 'all' 
                ? `${baseClasses} border-teal-500 text-teal-600 bg-teal-50`
                : `${baseClasses} ${getStatusColor(tab as DonationStatus)} bg-gray-50`;
        }
        return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
    };

    const tabs = [
        { id: 'all' as const, label: 'All', count: stats.totalDonations },
        { id: DonationStatus.PENDING, label: 'Pending', count: stats.byStatus.pending },
        { id: DonationStatus.APPROVED, label: 'Approved', count: stats.byStatus.approved },
        { id: DonationStatus.DELIVERED, label: 'Delivered', count: stats.byStatus.delivered },
        { id: DonationStatus.REJECTED, label: 'Rejected', count: stats.byStatus.rejected },
    ];

    return (
        <div className="max-w-6xl mx-auto">
             <h1 className="text-3xl font-bold text-gray-900 mb-6">My Donation History</h1>
             
             {/* Quick Stats */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                     <p className="text-2xl font-bold text-green-600">{stats.byStatus.delivered}</p>
                 </div>
                 <div className="bg-white p-4 rounded-lg shadow-md">
                     <p className="text-sm font-medium text-gray-500">Pending</p>
                     <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</p>
                 </div>
             </div>

             {/* Status Tabs */}
             <div className="bg-white rounded-lg shadow-md mb-6">
                 <div className="border-b border-gray-200">
                     <nav className="flex overflow-x-auto" aria-label="Tabs">
                         {tabs.map((tab) => (
                             <button
                                 key={tab.id}
                                 onClick={() => handleTabChange(tab.id)}
                                 className={getActiveTabClasses(tab.id)}
                                 type="button"
                             >
                                 <span className="flex items-center gap-2">
                                     {tab.label}
                                     {tab.count > 0 && (
                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                             selectedTab === tab.id
                                                 ? tab.id === 'all'
                                                     ? 'bg-teal-100 text-teal-800'
                                                     : tab.id === DonationStatus.PENDING
                                                     ? 'bg-yellow-100 text-yellow-800'
                                                     : tab.id === DonationStatus.APPROVED
                                                     ? 'bg-blue-100 text-blue-800'
                                                     : tab.id === DonationStatus.DELIVERED
                                                     ? 'bg-green-100 text-green-800'
                                                     : 'bg-red-100 text-red-800'
                                                 : 'bg-gray-100 text-gray-600'
                                         }`}>
                                             {tab.count}
                                         </span>
                                     )}
                                 </span>
                             </button>
                         ))}
                     </nav>
                 </div>
             </div>

             <SearchAndFilter
                donations={donations}
                onFilteredDonations={handleFilteredDonations}
             />
             <DonationList 
                donations={filteredDonations}
                onViewDetails={(donation) => {
                    setSelectedDonation(donation);
                    setIsDetailsModalOpen(true);
                }}
             />
             
             <DonationDetailsModal
                donation={selectedDonation}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDonation(null);
                }}
                isAdmin={user?.role === 'admin'}
             />
        </div>
    );
};

export default HistoryPage;
