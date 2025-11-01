
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DonorLeaderboard from '../components/DonorLeaderboard';
import AnimatedStatCard from '../components/AnimatedStatCard';
import { getImpactStories } from '../services/impactStoryService';
import { getHomeStats, HomeStats } from '../services/homeStatsService';
import { ImpactStory } from '../types';
import { useScrollAnimation } from '../utils/useScrollAnimation';

type Page = 'home' | 'donate' | 'history' | 'admin' | 'login' | 'impact';

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [featuredStories, setFeaturedStories] = useState<ImpactStory[]>([]);
    const [stats, setStats] = useState<HomeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [stories, homeStats] = await Promise.all([
                    getImpactStories(true),
                    getHomeStats(),
                ]);
                setFeaturedStories(stories.slice(0, 3)); // Show top 3 featured stories
                setStats(homeStats);
            } catch (err) {
                console.error('Failed to load homepage data:', err);
                setError('Failed to load homepage data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRetry = () => {
        setError(null);
        const fetchData = async () => {
            try {
                setLoading(true);
                const [stories, homeStats] = await Promise.all([
                    getImpactStories(true),
                    getHomeStats(),
                ]);
                setFeaturedStories(stories.slice(0, 3));
                setStats(homeStats);
            } catch (err) {
                console.error('Failed to load homepage data:', err);
                setError('Failed to load homepage data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    };

    const handleImageLoad = (imageUrl: string) => {
        setImagesLoaded(prev => new Set(prev).add(imageUrl));
    };

    const featuresSection = useScrollAnimation({ threshold: 0.15 });
    const storiesSection = useScrollAnimation({ threshold: 0.15 });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md max-w-6xl mx-auto flex items-center justify-between" role="alert">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="ml-4 text-red-800 hover:text-red-900 font-medium underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                        aria-label="Retry loading data"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <div className="text-center max-w-6xl mx-auto" role="banner">
                <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 md:p-12 lg:p-16 transform transition-all duration-700 opacity-100">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-3 sm:mb-4 px-2">
                        Welcome to <span className="text-teal-500">Charity Connect</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                        Your contribution can make a world of difference. We bridge the gap between your generosity and those in need.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-2">
                        <button 
                            onClick={() => onNavigate(user ? 'donate' : 'login')}
                            disabled={loading}
                            className="w-full sm:w-auto bg-teal-500 text-white font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-teal-600 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg disabled:bg-teal-300 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 min-h-[44px]"
                            aria-label="Navigate to donate page"
                        >
                            Donate Now
                        </button>
                        <button 
                            onClick={() => onNavigate(user ? 'history' : 'login')}
                            disabled={loading}
                            className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[44px]"
                            aria-label="View donation history"
                        >
                            View My Donations
                        </button>
                    </div>
                </div>
            </div>

            {/* Animated Statistics Section */}
            <div className="max-w-6xl mx-auto">
                {loading && !stats ? (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
                            Our Impact So Far
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-lg p-6 animate-pulse"
                                    aria-hidden="true"
                                >
                                    <div className="h-4 bg-gray-400 rounded w-24 mb-4"></div>
                                    <div className="h-12 bg-gray-400 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-400 rounded w-40"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : stats ? (
                    <div 
                        className={`transform transition-all duration-700 ${
                            !loading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4 sm:mb-6">
                            Our Impact So Far
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="region" aria-label="Impact statistics">
                            <AnimatedStatCard
                                title="Total Donations"
                                value={stats.totalDonations}
                                icon={
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                                gradient="from-teal-500 to-teal-600"
                                description="Donations received"
                                delay={0}
                            />
                            <AnimatedStatCard
                                title="Items Delivered"
                                value={stats.deliveredItems}
                                icon={
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                }
                                gradient="from-blue-500 to-blue-600"
                                description="Items successfully delivered"
                                delay={100}
                            />
                            <AnimatedStatCard
                                title="People Helped"
                                value={stats.peopleHelped}
                                icon={
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                }
                                gradient="from-green-500 to-green-600"
                                description="Lives impacted"
                                delay={200}
                            />
                            <AnimatedStatCard
                                title="Active Donors"
                                value={stats.activeDonors}
                                icon={
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                                gradient="from-purple-500 to-purple-600"
                                description="Donors this month"
                                delay={300}
                            />
                            <AnimatedStatCard
                                title="Total Donors"
                                value={stats.totalDonors}
                                icon={
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                                gradient="from-orange-500 to-orange-600"
                                description="Community members"
                                delay={400}
                            />
                            <AnimatedStatCard
                                title="Categories"
                                value={stats.categoriesCovered}
                                icon={
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                }
                                gradient="from-pink-500 to-pink-600"
                                description="Different categories covered"
                                delay={500}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-600 mb-2">Unable to load statistics</p>
                        <p className="text-sm text-gray-500">Please try refreshing the page</p>
                    </div>
                )}
            </div>

            {/* Features Grid */}
            <section 
                ref={featuresSection.ref}
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto transform transition-all duration-700 ${
                    featuresSection.isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                }`}
                aria-label="Platform features"
            >
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-teal-100 rounded-full p-2.5 sm:p-3 flex-shrink-0">
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-teal-600">Easy Giving</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">Our simple donation process makes it easy for you to give items to those who need them most.</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-teal-100 rounded-full p-2.5 sm:p-3 flex-shrink-0">
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-teal-600">Track Your Impact</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">See the status of your donations and know when your contributions have been received.</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-teal-100 rounded-full p-2.5 sm:p-3 flex-shrink-0">
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-teal-600">Transparent Process</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">We ensure that your donations are managed efficiently and reach their intended recipients.</p>
                </div>
            </section>

            {/* Featured Impact Stories Section */}
            <section 
                ref={storiesSection.ref}
                className={`max-w-6xl mx-auto transform transition-all duration-700 ${
                    storiesSection.isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                }`}
                aria-label="Featured impact stories"
            >
                {loading && featuredStories.length === 0 ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Featured Impact Stories</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                                    aria-hidden="true"
                                >
                                    <div className="h-48 bg-gray-300"></div>
                                    <div className="p-6">
                                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                                        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : featuredStories.length > 0 ? (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Featured Impact Stories</h2>
                            <button
                                onClick={() => onNavigate('impact')}
                                className="text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1 min-h-[44px]"
                                aria-label="View all impact stories"
                            >
                                View All Stories
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredStories.map((story, index) => (
                                <article
                                    key={story.id}
                                    onClick={() => onNavigate('impact')}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onNavigate('impact');
                                        }
                                    }}
                                    tabIndex={0}
                                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                                        storiesSection.isVisible
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-8'
                                    }`}
                                    style={{
                                        transitionDelay: storiesSection.isVisible ? `${index * 100}ms` : '0ms',
                                    }}
                                    role="button"
                                    aria-label={`View story: ${story.title}`}
                                >
                                    <div className="relative h-48 overflow-hidden bg-gray-200">
                                        {!imagesLoaded.has(story.afterImageUrl) && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                                            </div>
                                        )}
                                        <img
                                            src={story.afterImageUrl}
                                            alt={`${story.title} - impact story`}
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                                                imagesLoaded.has(story.afterImageUrl) ? 'opacity-100' : 'opacity-0'
                                            }`}
                                            onLoad={() => handleImageLoad(story.afterImageUrl)}
                                            onError={() => handleImageLoad(story.afterImageUrl)}
                                            loading="lazy"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                                                Featured
                                            </span>
                                        </div>
                                    </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-teal-600">
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>{story.impactMetrics.peopleHelped} people helped</span>
                                    </div>
                                </div>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600 mb-2">No impact stories available yet</p>
                        <p className="text-sm text-gray-500">Check back soon for inspiring stories of impact!</p>
                    </div>
                )}
            </section>

            {/* Leaderboard Section */}
            <section className="max-w-6xl mx-auto" aria-label="Top donors leaderboard">
                <DonorLeaderboard showUserPosition={true} limit={10} />
            </section>
        </div>
    );
};

export default HomePage;
