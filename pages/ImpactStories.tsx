import React, { useState, useEffect } from 'react';
import { getImpactStories, getTotalImpactStats } from '../services/impactStoryService';
import { ImpactStory } from '../types';

const ImpactStories: React.FC = () => {
    const [stories, setStories] = useState<ImpactStory[]>([]);
    const [featuredStories, setFeaturedStories] = useState<ImpactStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStory, setSelectedStory] = useState<ImpactStory | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalStats, setTotalStats] = useState({
        totalStories: 0,
        totalPeopleHelped: 0,
        totalItemsReceived: 0,
        categoriesCovered: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [allStories, featured, stats] = await Promise.all([
                    getImpactStories(false),
                    getImpactStories(true),
                    getTotalImpactStats(),
                ]);
                setStories(allStories);
                setFeaturedStories(featured);
                setTotalStats(stats);
            } catch (err) {
                setError('Failed to load impact stories.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStories = selectedCategory === 'all'
        ? stories
        : stories.filter(story => story.category === selectedCategory);

    const categories = ['all', ...Array.from(new Set(stories.map(s => s.category)))];

    const handleStoryClick = (story: ImpactStory) => {
        setSelectedStory(story);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStory(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                    Impact <span className="text-teal-500">Stories</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                    See how your generous donations are making a real difference in people's lives. Every donation creates a positive impact in our community.
                </p>
            </div>

            {/* Total Impact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md p-6 text-white text-center">
                    <div className="text-3xl font-bold mb-1">{totalStats.totalStories}</div>
                    <div className="text-sm text-teal-100">Impact Stories</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white text-center">
                    <div className="text-3xl font-bold mb-1">{totalStats.totalPeopleHelped.toLocaleString()}</div>
                    <div className="text-sm text-blue-100">People Helped</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white text-center">
                    <div className="text-3xl font-bold mb-1">{totalStats.totalItemsReceived.toLocaleString()}</div>
                    <div className="text-sm text-green-100">Items Received</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white text-center">
                    <div className="text-3xl font-bold mb-1">{totalStats.categoriesCovered}</div>
                    <div className="text-sm text-purple-100">Categories</div>
                </div>
            </div>

            {/* Featured Stories Section */}
            {featuredStories.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredStories.map((story) => (
                            <div
                                key={story.id}
                                onClick={() => handleStoryClick(story)}
                                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all hover:shadow-xl hover:scale-105"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={story.afterImageUrl}
                                        alt={story.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                                            Featured
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full">
                                            {story.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.description}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-teal-600">
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>{story.impactMetrics.peopleHelped} people helped</span>
                                        </div>
                                        <span className="text-gray-500">
                                            {story.impactMetrics.dateDelivered.toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Stories Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">All Stories</h2>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                    selectedCategory === category
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category === 'all' ? 'All Categories' : category}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStories.map((story) => (
                            <div
                                key={story.id}
                                onClick={() => handleStoryClick(story)}
                                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all hover:shadow-xl hover:scale-105"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <div className="grid grid-cols-2 h-full">
                                        <div className="relative overflow-hidden border-r-2 border-white">
                                            <img
                                                src={story.beforeImageUrl}
                                                alt="Before"
                                                className="w-full h-full object-cover opacity-80"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                Before
                                            </div>
                                        </div>
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={story.afterImageUrl}
                                                alt="After"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                After
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full shadow">
                                            {story.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.description}</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="h-4 w-4 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                            <span>{story.impactMetrics.itemsReceived} items received</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="h-4 w-4 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>{story.impactMetrics.peopleHelped} people helped</span>
                                        </div>
                                        {story.location && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="h-4 w-4 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{story.location}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button className="mt-4 w-full text-teal-600 hover:text-teal-800 font-medium text-sm">
                                        Read Full Story →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">No stories found in this category.</p>
                    </div>
                )}
            </div>

            {/* Story Detail Modal */}
            {isModalOpen && selectedStory && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {selectedStory.featured && (
                                        <span className="px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                                            Featured
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                        {selectedStory.category}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedStory.title}</h2>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="ml-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Before/After Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <img
                                        src={selectedStory.beforeImageUrl}
                                        alt="Before"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                                        <span className="font-semibold">Before</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <img
                                        src={selectedStory.afterImageUrl}
                                        alt="After"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-4 left-4 bg-teal-500 text-white px-4 py-2 rounded-lg">
                                        <span className="font-semibold">After</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">The Impact</h3>
                                <p className="text-gray-700 leading-relaxed">{selectedStory.description}</p>
                            </div>

                            {/* Impact Metrics */}
                            <div className="grid grid-cols-3 gap-4 p-4 bg-teal-50 rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-teal-700 mb-1">
                                        {selectedStory.impactMetrics.itemsReceived}
                                    </div>
                                    <div className="text-sm text-teal-600">Items Received</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-teal-700 mb-1">
                                        {selectedStory.impactMetrics.peopleHelped}
                                    </div>
                                    <div className="text-sm text-teal-600">People Helped</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-teal-700 mb-1">
                                        {selectedStory.impactMetrics.dateDelivered.toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-teal-600">Date Delivered</div>
                                </div>
                            </div>

                            {/* Testimonial */}
                            {selectedStory.beneficiaryTestimonial && (
                                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-teal-500">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg">
                                                {selectedStory.beneficiaryName?.[0] || '?'}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {selectedStory.beneficiaryName && (
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {selectedStory.beneficiaryName}
                                                </h4>
                                            )}
                                            <p className="text-gray-700 italic leading-relaxed">
                                                "{selectedStory.beneficiaryTestimonial}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {selectedStory.location && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{selectedStory.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImpactStories;

