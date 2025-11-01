import React, { useState } from 'react';
import { DonationItem, DonationStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export type SortOption = 'date-desc' | 'date-asc' | 'quantity-desc' | 'quantity-asc' | 'status';

interface SearchAndFilterProps {
    donations: DonationItem[];
    onFilteredDonations: (filtered: DonationItem[]) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ donations, onFilteredDonations }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<DonationStatus | 'all'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Get unique categories from donations
    const categories = Array.from(new Set(donations.map(d => d.category))).sort();

    React.useEffect(() => {
        let filtered = [...donations];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(donation => 
                donation.itemName.toLowerCase().includes(query) ||
                donation.description.toLowerCase().includes(query) ||
                donation.category.toLowerCase().includes(query) ||
                (user?.role === 'admin' && donation.donorName.toLowerCase().includes(query))
            );
        }

        // Status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(donation => donation.status === selectedStatus);
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(donation => donation.category === selectedCategory);
        }

        // Date range filter
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(donation => {
                const donationDate = new Date(donation.submittedAt);
                donationDate.setHours(0, 0, 0, 0);
                return donationDate.getTime() >= start.getTime();
            });
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(donation => {
                const donationDate = new Date(donation.submittedAt);
                return donationDate.getTime() <= end.getTime();
            });
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'date-desc':
                    return b.submittedAt.getTime() - a.submittedAt.getTime();
                case 'date-asc':
                    return a.submittedAt.getTime() - b.submittedAt.getTime();
                case 'quantity-desc':
                    return b.quantity - a.quantity;
                case 'quantity-asc':
                    return a.quantity - b.quantity;
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        onFilteredDonations(filtered);
    }, [donations, searchQuery, selectedStatus, selectedCategory, sortOption, startDate, endDate, user?.role]);

    return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Search
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={user?.role === 'admin' ? 'Search by item name, description, category, or donor...' : 'Search by item name, description, or category...'}
                        className="block w-full pl-10 pr-3 py-2.5 sm:py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Status Filter */}
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Status
                    </label>
                    <select
                        id="status-filter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as DonationStatus | 'all')}
                        className="block w-full px-3 sm:px-3 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(DonationStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Category
                    </label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full px-3 sm:px-3 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Sort Option */}
                <div className="sm:col-span-2 md:col-span-1">
                    <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Sort By
                    </label>
                    <select
                        id="sort-filter"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="block w-full px-3 sm:px-3 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="quantity-desc">Quantity (High to Low)</option>
                        <option value="quantity-asc">Quantity (Low to High)</option>
                        <option value="status">Status</option>
                    </select>
                </div>
            </div>

            {/* Date Range Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Date Range (Submission Date)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-xs text-gray-600 mb-1">
                            From
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full px-3 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-xs text-gray-600 mb-1">
                            To
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || undefined}
                            className="block w-full px-3 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm min-h-[44px]"
                        />
                    </div>
                </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || startDate || endDate) && (
                <div>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedStatus('all');
                            setSelectedCategory('all');
                            setStartDate('');
                            setEndDate('');
                            setSortOption('date-desc');
                        }}
                        className="text-sm text-teal-600 hover:text-teal-800 font-medium min-h-[44px] py-2"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchAndFilter;

