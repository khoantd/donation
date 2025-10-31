import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getDonations, updateDonationStatus, updateDonationQuantity } from '../services/donationService';
import { DonationItem, DonationStatus } from '../types';
import DonationList from '../components/DonationList';
import SearchAndFilter from '../components/SearchAndFilter';
import DonationDetailsModal from '../components/DonationDetailsModal';
import { useAuth } from '../context/AuthContext';
import { exportToCSV, exportToJSON, exportToPDF } from '../services/exportService';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-teal-100 text-teal-500 rounded-full p-3 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const [donations, setDonations] = useState<DonationItem[]>([]);
    const [filteredDonations, setFilteredDonations] = useState<DonationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [managingDonation, setManagingDonation] = useState<DonationItem | null>(null);
    const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editQuantity, setEditQuantity] = useState(0);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'monthly' | 'quarterly' | 'all'>('7d');
    const { user } = useAuth();

    const fetchDonations = useCallback(async () => {
        try {
            setLoading(true);
            const allDonations = await getDonations();
            setDonations(allDonations);
            setFilteredDonations(allDonations);
        } catch (err) {
            setError('Failed to fetch donations.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations]);

    const handleOpenManageModal = (donation: DonationItem) => {
        setManagingDonation(donation);
        setEditQuantity(donation.quantity);
    };

    const handleCloseManageModal = () => {
        setManagingDonation(null);
    };

    const handleStatusUpdate = async (id: string, status: DonationStatus) => {
        try {
            await updateDonationStatus(id, status, user?.name || 'Admin');
            fetchDonations(); // Refresh the list after update
            handleCloseManageModal();
            setIsDetailsModalOpen(false);
            setSelectedDonation(null);
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
    };

    const handleQuantityUpdate = async (id: string, quantity: number) => {
        if (quantity < 0) {
            alert('Quantity cannot be negative.');
            return;
        }
        try {
            await updateDonationQuantity(id, quantity, user?.name || 'Admin');
            fetchDonations(); // Refresh the list
            handleCloseManageModal();
            setIsDetailsModalOpen(false);
            setSelectedDonation(null);
        } catch (err) {
            alert('Failed to update quantity. Please try again.');
        }
    };
    
    const summaryStats = useMemo(() => {
        const totalDonations = donations.length;
        const totalItems = donations.reduce((sum, d) => sum + d.quantity, 0);
        const pendingCount = donations.filter(d => d.status === DonationStatus.PENDING).length;
        const uniqueDonors = new Set(donations.map(d => d.donorId)).size;
        
        return { totalDonations, totalItems, pendingCount, uniqueDonors };
    }, [donations]);

    const categoryStats = useMemo(() => {
        const stats: { [key: string]: { count: number; totalItems: number } } = {};
        donations.forEach(d => {
            if (!stats[d.category]) {
                stats[d.category] = { count: 0, totalItems: 0 };
            }
            stats[d.category].count++;
            stats[d.category].totalItems += d.quantity;
        });
        return Object.entries(stats).sort(([,a],[,b]) => b.totalItems - a.totalItems);
    }, [donations]);

    // Chart data for category distribution
    const categoryChartData = useMemo(() => {
        return categoryStats.map(([category, stats]) => ({
            name: category,
            donations: stats.count,
            items: stats.totalItems,
        }));
    }, [categoryStats]);

    // Chart data for status distribution
    const statusChartData = useMemo(() => {
        const statusCounts: { [key: string]: number } = {};
        donations.forEach(d => {
            statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({
            name,
            value,
        }));
    }, [donations]);

    // Chart data for donations over time with time range selector
    const donationsOverTime = useMemo(() => {
        const now = new Date();
        let periods: Date[] = [];
        let dateFormat: (date: Date) => string;

        switch (timeRange) {
            case '7d':
                periods = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(now);
                    date.setDate(date.getDate() - (6 - i));
                    date.setHours(0, 0, 0, 0);
                    return date;
                });
                dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                break;
            case '30d':
                periods = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date(now);
                    date.setDate(date.getDate() - (29 - i));
                    date.setHours(0, 0, 0, 0);
                    return date;
                });
                dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                break;
            case 'monthly':
                periods = Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(now);
                    date.setMonth(date.getMonth() - (11 - i));
                    date.setDate(1);
                    date.setHours(0, 0, 0, 0);
                    return date;
                });
                dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                break;
            case 'quarterly':
                periods = Array.from({ length: 8 }, (_, i) => {
                    const date = new Date(now);
                    date.setMonth(date.getMonth() - (7 - i) * 3);
                    date.setDate(1);
                    date.setHours(0, 0, 0, 0);
                    return date;
                });
                dateFormat = (date: Date) => {
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    return `Q${quarter} ${date.getFullYear().toString().slice(2)}`;
                };
                break;
            case 'all':
                // Group by month for all time
                const earliestDate = donations.length > 0 
                    ? new Date(Math.min(...donations.map(d => d.submittedAt.getTime())))
                    : new Date(now);
                earliestDate.setDate(1);
                const months = Math.ceil((now.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                periods = Array.from({ length: Math.max(1, Math.min(months, 24)) }, (_, i) => {
                    const date = new Date(earliestDate);
                    date.setMonth(date.getMonth() + i);
                    date.setHours(0, 0, 0, 0);
                    return date;
                });
                dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                break;
        }

        return periods.map(period => {
            let periodDonations: DonationItem[] = [];
            
            if (timeRange === '7d' || timeRange === '30d') {
                const nextPeriod = new Date(period);
                nextPeriod.setDate(nextPeriod.getDate() + 1);
                periodDonations = donations.filter(d => {
                    const donationDate = new Date(d.submittedAt);
                    return donationDate >= period && donationDate < nextPeriod;
                });
            } else {
                const nextPeriod = new Date(period);
                if (timeRange === 'monthly' || timeRange === 'all') {
                    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
                } else if (timeRange === 'quarterly') {
                    nextPeriod.setMonth(nextPeriod.getMonth() + 3);
                }
                periodDonations = donations.filter(d => {
                    const donationDate = new Date(d.submittedAt);
                    return donationDate >= period && donationDate < nextPeriod;
                });
            }

            return {
                date: dateFormat(period),
                count: periodDonations.length,
                items: periodDonations.reduce((sum, d) => sum + d.quantity, 0),
            };
        });
    }, [donations, timeRange]);

    // Donor activity reports
    const donorActivityReport = useMemo(() => {
        const donorMap = new Map<string, {
            donorId: string;
            donorName: string;
            totalDonations: number;
            totalItems: number;
            pending: number;
            approved: number;
            delivered: number;
            rejected: number;
            lastDonationDate: Date | null;
        }>();

        donations.forEach(donation => {
            if (!donorMap.has(donation.donorId)) {
                donorMap.set(donation.donorId, {
                    donorId: donation.donorId,
                    donorName: donation.donorName,
                    totalDonations: 0,
                    totalItems: 0,
                    pending: 0,
                    approved: 0,
                    delivered: 0,
                    rejected: 0,
                    lastDonationDate: null,
                });
            }

            const donor = donorMap.get(donation.donorId)!;
            donor.totalDonations++;
            donor.totalItems += donation.quantity;
            
            switch (donation.status) {
                case DonationStatus.PENDING:
                    donor.pending++;
                    break;
                case DonationStatus.APPROVED:
                    donor.approved++;
                    break;
                case DonationStatus.DELIVERED:
                    donor.delivered++;
                    break;
                case DonationStatus.REJECTED:
                    donor.rejected++;
                    break;
            }

            if (!donor.lastDonationDate || donation.submittedAt > donor.lastDonationDate) {
                donor.lastDonationDate = donation.submittedAt;
            }
        });

        return Array.from(donorMap.values())
            .sort((a, b) => b.totalDonations - a.totalDonations || b.totalItems - a.totalItems);
    }, [donations]);

    // Monthly/Quarterly statistics
    const monthlyStats = useMemo(() => {
        const stats: { [key: string]: { donations: number; items: number; delivered: number } } = {};
        
        donations.forEach(donation => {
            const date = new Date(donation.submittedAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!stats[monthKey]) {
                stats[monthKey] = { donations: 0, items: 0, delivered: 0 };
            }
            
            stats[monthKey].donations++;
            stats[monthKey].items += donation.quantity;
            if (donation.status === DonationStatus.DELIVERED) {
                stats[monthKey].delivered++;
            }
        });

        return Object.entries(stats)
            .map(([month, data]) => ({
                month,
                label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                ...data,
            }))
            .sort((a, b) => b.month.localeCompare(a.month))
            .slice(0, 12); // Last 12 months
    }, [donations]);

    const quarterlyStats = useMemo(() => {
        const stats: { [key: string]: { donations: number; items: number; delivered: number } } = {};
        
        donations.forEach(donation => {
            const date = new Date(donation.submittedAt);
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            const quarterKey = `${date.getFullYear()}-Q${quarter}`;
            
            if (!stats[quarterKey]) {
                stats[quarterKey] = { donations: 0, items: 0, delivered: 0 };
            }
            
            stats[quarterKey].donations++;
            stats[quarterKey].items += donation.quantity;
            if (donation.status === DonationStatus.DELIVERED) {
                stats[quarterKey].delivered++;
            }
        });

        return Object.entries(stats)
            .map(([quarter, data]) => ({
                quarter,
                label: quarter,
                ...data,
            }))
            .sort((a, b) => b.quarter.localeCompare(a.quarter))
            .slice(0, 8); // Last 8 quarters
    }, [donations]);

    const COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];


    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div></div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Overview of all charitable activities.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportToCSV(donations, 'donations')}
                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export CSV
                    </button>
                    <button
                        onClick={() => exportToJSON(donations, 'donations')}
                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export JSON
                    </button>
                    <button
                        onClick={() => exportToPDF(donations, 'donations')}
                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Donations" value={summaryStats.totalDonations} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Total Items Donated" value={summaryStats.totalItems} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
                <StatCard title="Pending Review" value={summaryStats.pendingCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Unique Donors" value={summaryStats.uniqueDonors} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donations Over Time */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Donations Over Time</h2>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | 'monthly' | 'quarterly' | 'all')}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="monthly">Monthly (12 months)</option>
                            <option value="quarterly">Quarterly (8 quarters)</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={donationsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="count" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} name="Donations" />
                            <Area type="monotone" dataKey="items" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Items" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Donations by Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Donations by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="donations" fill="#14b8a6" name="Number of Donations" />
                            <Bar dataKey="items" fill="#3b82f6" name="Total Items" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown Table</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Total Items</th>
                                    <th scope="col" className="px-6 py-3"># of Donations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryStats.map(([category, stats]) => (
                                    <tr key={category} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{category}</th>
                                        <td className="px-6 py-4">{stats.totalItems}</td>
                                        <td className="px-6 py-4">{stats.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Monthly & Quarterly Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Statistics</h2>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Month</th>
                                    <th scope="col" className="px-4 py-3">Donations</th>
                                    <th scope="col" className="px-4 py-3">Items</th>
                                    <th scope="col" className="px-4 py-3">Delivered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyStats.map((stat) => (
                                    <tr key={stat.month} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{stat.label}</th>
                                        <td className="px-4 py-3">{stat.donations}</td>
                                        <td className="px-4 py-3">{stat.items}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-green-600 font-semibold">{stat.delivered}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quarterly Statistics</h2>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Quarter</th>
                                    <th scope="col" className="px-4 py-3">Donations</th>
                                    <th scope="col" className="px-4 py-3">Items</th>
                                    <th scope="col" className="px-4 py-3">Delivered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quarterlyStats.map((stat) => (
                                    <tr key={stat.quarter} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{stat.label}</th>
                                        <td className="px-4 py-3">{stat.donations}</td>
                                        <td className="px-4 py-3">{stat.items}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-green-600 font-semibold">{stat.delivered}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Donor Activity Reports */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Donor Activity Report</h2>
                    <button
                        onClick={() => {
                            const donorData = donorActivityReport.map(donor => ({
                                'Donor Name': donor.donorName,
                                'Total Donations': donor.totalDonations,
                                'Total Items': donor.totalItems,
                                'Pending': donor.pending,
                                'Approved': donor.approved,
                                'Delivered': donor.delivered,
                                'Rejected': donor.rejected,
                                'Last Donation': donor.lastDonationDate?.toLocaleDateString() || 'N/A',
                            }));
                            // Create CSV from donor data
                            const headers = Object.keys(donorData[0] || {});
                            const csvContent = [
                                headers.join(','),
                                ...donorData.map(row => headers.map(h => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(','))
                            ].join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            const url = URL.createObjectURL(blob);
                            link.setAttribute('href', url);
                            link.setAttribute('download', `donor_activity_${new Date().toISOString().split('T')[0]}.csv`);
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Donor Name</th>
                                <th scope="col" className="px-4 py-3">Total Donations</th>
                                <th scope="col" className="px-4 py-3">Total Items</th>
                                <th scope="col" className="px-4 py-3">Pending</th>
                                <th scope="col" className="px-4 py-3">Approved</th>
                                <th scope="col" className="px-4 py-3">Delivered</th>
                                <th scope="col" className="px-4 py-3">Rejected</th>
                                <th scope="col" className="px-4 py-3">Last Donation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donorActivityReport.length > 0 ? (
                                donorActivityReport.map((donor) => (
                                    <tr key={donor.donorId} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{donor.donorName}</th>
                                        <td className="px-4 py-3 font-semibold">{donor.totalDonations}</td>
                                        <td className="px-4 py-3">{donor.totalItems}</td>
                                        <td className="px-4 py-3">
                                            {donor.pending > 0 && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{donor.pending}</span>}
                                            {donor.pending === 0 && <span className="text-gray-400">0</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {donor.approved > 0 && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{donor.approved}</span>}
                                            {donor.approved === 0 && <span className="text-gray-400">0</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {donor.delivered > 0 && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{donor.delivered}</span>}
                                            {donor.delivered === 0 && <span className="text-gray-400">0</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {donor.rejected > 0 && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{donor.rejected}</span>}
                                            {donor.rejected === 0 && <span className="text-gray-400">0</span>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {donor.lastDonationDate ? donor.lastDonationDate.toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        No donor activity data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Donations</h2>
                 <p className="text-gray-600 mb-6">Review and manage all incoming donations.</p>
                 <SearchAndFilter
                    donations={donations}
                    onFilteredDonations={setFilteredDonations}
                 />
                 <DonationList
                    donations={filteredDonations}
                    onManage={handleOpenManageModal}
                    onViewDetails={(donation) => {
                        setSelectedDonation(donation);
                        setIsDetailsModalOpen(true);
                    }}
                 />
            </div>

            {/* Donation Details Modal */}
            <DonationDetailsModal
                donation={selectedDonation}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDonation(null);
                }}
                onStatusUpdate={handleStatusUpdate}
                onQuantityUpdate={handleQuantityUpdate}
                onDonationUpdate={fetchDonations}
                isAdmin={true}
            />

            {managingDonation && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-900">Manage Donation</h2>
                            <button onClick={handleCloseManageModal} className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none">&times;</button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">{managingDonation.itemName}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <p><strong>Category:</strong> {managingDonation.category}</p>
                                    <p><strong>Current Quantity:</strong> {managingDonation.quantity}</p>
                                    <p><strong>Status:</strong> {managingDonation.status}</p>
                                    <p><strong>Submitted:</strong> {managingDonation.submittedAt.toLocaleDateString()}</p>
                                    <p className="md:col-span-2"><strong>Description:</strong> {managingDonation.description}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-md border text-sm text-gray-600 space-y-2">
                                <h4 className="text-base font-semibold text-gray-800">Donor Information</h4>
                                <p><strong>Name:</strong> {managingDonation.donorName}</p>
                                <p><strong>Phone:</strong> {managingDonation.donorPhoneNumber}</p>
                                <p><strong>Address:</strong> {managingDonation.donorAddress}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t mt-auto">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Actions</h3>
                            {managingDonation.status === DonationStatus.PENDING && (
                                 <div className="flex space-x-3">
                                    <button onClick={() => handleStatusUpdate(managingDonation.id, DonationStatus.APPROVED)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">Approve</button>
                                    <button onClick={() => handleStatusUpdate(managingDonation.id, DonationStatus.REJECTED)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Reject</button>
                                 </div>
                            )}
                            {[DonationStatus.APPROVED, DonationStatus.DELIVERED].includes(managingDonation.status) && (
                                <div className="flex flex-wrap items-center gap-3">
                                    <label htmlFor="edit-quantity" className="text-sm font-medium text-gray-700">Update Quantity:</label>
                                    <input
                                        type="number"
                                        id="edit-quantity"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(parseInt(e.target.value, 10))}
                                        className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        min="0"
                                    />
                                    <button onClick={() => handleQuantityUpdate(managingDonation.id, editQuantity)} className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={editQuantity === managingDonation.quantity}>Save Changes</button>
                                </div>
                            )}
                             {![DonationStatus.PENDING, DonationStatus.APPROVED, DonationStatus.DELIVERED].includes(managingDonation.status) && (
                                <p className="text-sm text-gray-500">No actions available for this status.</p>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;