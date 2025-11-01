import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DonatePage from './pages/DonatePage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import DonorProfilePage from './pages/DonorProfile';
import RecipientProfilePage from './pages/RecipientProfile';
import RequestItemsPage from './pages/RequestItemsPage';
import ImpactStories from './pages/ImpactStories';
import DonorManagement from './pages/DonorManagement';
import RecipientRegistration from './pages/RecipientRegistration';
import MatchingPage from './pages/MatchingPage';
import MasterDataManagement from './pages/MasterDataManagement';
import UserManagement from './pages/UserManagement';

type Page = 'home' | 'donate' | 'history' | 'admin' | 'login' | 'profile' | 'impact' | 'donor-management' | 'recipient-registration' | 'request-items' | 'matching' | 'master-data' | 'user-management';

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const { user, loading } = useAuth();

    const navigate = (page: Page) => {
        if (!user && (page === 'donate' || page === 'history' || page === 'admin' || page === 'profile' || page === 'donor-management' || page === 'request-items' || page === 'matching' || page === 'master-data' || page === 'user-management')) {
            setCurrentPage('login');
        } else {
            setCurrentPage(page);
        }
    };
    
    const renderPage = () => {
        if (loading) {
             return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div></div>;
        }

        // Public pages that don't require authentication
        if (!user) {
            switch (currentPage) {
                case 'home':
                    return <HomePage onNavigate={navigate} />;
                case 'impact':
                    return <ImpactStories />;
                case 'login':
                    return <LoginPage onNavigate={navigate} />;
                case 'recipient-registration':
                    return <RecipientRegistration onNavigate={navigate} />;
                default:
                    // Redirect to login for protected pages
                    return <LoginPage onNavigate={navigate} />;
            }
        }

        // Authenticated user pages
        switch (currentPage) {
            case 'home':
                return <HomePage onNavigate={navigate} />;
            case 'donate':
                // Redirect admin from donate page to their dashboard
                return user.role === 'admin' ? <AdminDashboard /> : <DonatePage />;
            case 'history':
                return <HistoryPage />;
            case 'profile':
                if (user.role === 'admin') {
                    return <HomePage onNavigate={navigate} />;
                } else if (user.role === 'recipient' || user.roles?.includes('recipient')) {
                    return <RecipientProfilePage />;
                } else if (user.role === 'donor' || user.roles?.includes('donor')) {
                    return <DonorProfilePage />;
                }
                // Default to donor profile if user has donor role, or home
                return <HomePage onNavigate={navigate} />;
            case 'impact':
                return <ImpactStories />;
            case 'admin':
                return user.role === 'admin' ? <AdminDashboard /> : <HomePage onNavigate={navigate} />;
            case 'donor-management':
                return user.role === 'admin' ? <DonorManagement /> : <HomePage onNavigate={navigate} />;
            case 'matching':
                return user.role === 'admin' ? <MatchingPage /> : <HomePage onNavigate={navigate} />;
            case 'master-data':
                return user.role === 'admin' ? <MasterDataManagement /> : <HomePage onNavigate={navigate} />;
            case 'user-management':
                return user.role === 'admin' ? <UserManagement /> : <HomePage onNavigate={navigate} />;
            case 'request-items':
                if (user.role === 'recipient' || user.roles?.includes('recipient')) {
                    return <RequestItemsPage />;
                }
                return <HomePage onNavigate={navigate} />;
            case 'recipient-registration':
                // If already logged in, redirect to home
                return <HomePage onNavigate={navigate} />;
            case 'login':
                // If already logged in and on login page, redirect to home
                return <HomePage onNavigate={navigate} />;
            default:
                return <HomePage onNavigate={navigate} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
            <Header onNavigate={navigate} currentPage={currentPage} />
            <main className="p-2 sm:p-4 md:p-6 lg:p-8 flex-grow">
                {renderPage()}
            </main>
            <Footer onNavigate={navigate} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;