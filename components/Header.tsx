import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Page = 'home' | 'donate' | 'history' | 'admin' | 'login' | 'profile' | 'impact' | 'donor-management' | 'recipient-registration' | 'request-items' | 'matching' | 'master-data' | 'user-management';

interface HeaderProps {
    onNavigate: (page: Page) => void;
    currentPage: Page;
}

const NavLink: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            isActive
                ? 'bg-teal-500 text-white'
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
        }`}
    >
        {children}
    </button>
);

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMenuOpen && !target.closest('nav')) {
                setIsMenuOpen(false);
            }
            if (isProfileOpen && !target.closest('.profile-menu-container')) {
                setIsProfileOpen(false);
            }
        };

        if (isMenuOpen || isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMenuOpen, isProfileOpen]);

    const renderNavLinks = (isMobile: boolean = false) => {
        const closeMenu = isMobile ? () => setIsMenuOpen(false) : () => {};

        // Public navigation links (available to all users)
        const publicLinks = (
            <>
                <NavLink onClick={() => { onNavigate('home'); closeMenu(); }} isActive={currentPage === 'home'}>Home</NavLink>
                <NavLink onClick={() => { onNavigate('impact'); closeMenu(); }} isActive={currentPage === 'impact'}>Impact Stories</NavLink>
            </>
        );

        if (!user) {
            return publicLinks;
        }

        // Authenticated user navigation links
        if (user.role === 'admin') {
            return (
                <>
                    {publicLinks}
                    <NavLink onClick={() => { onNavigate('admin'); closeMenu(); }} isActive={currentPage === 'admin'}>Admin Panel</NavLink>
                    <NavLink onClick={() => { onNavigate('donor-management'); closeMenu(); }} isActive={currentPage === 'donor-management'}>Donor Management</NavLink>
                    <NavLink onClick={() => { onNavigate('user-management'); closeMenu(); }} isActive={currentPage === 'user-management'}>User Management</NavLink>
                    <NavLink onClick={() => { onNavigate('matching'); closeMenu(); }} isActive={currentPage === 'matching'}>Matching</NavLink>
                    <NavLink onClick={() => { onNavigate('master-data'); closeMenu(); }} isActive={currentPage === 'master-data'}>Master Data</NavLink>
                </>
            );
        }

        // Check if user is recipient or has recipient role
        const isRecipient = user.role === 'recipient' || user.roles?.includes('recipient');
        const isDonor = user.role === 'donor' || user.roles?.includes('donor');
        
        return (
            <>
                {publicLinks}
                {isDonor && (
                    <>
                        <NavLink onClick={() => { onNavigate('donate'); closeMenu(); }} isActive={currentPage === 'donate'}>Donate</NavLink>
                        <NavLink onClick={() => { onNavigate('history'); closeMenu(); }} isActive={currentPage === 'history'}>My History</NavLink>
                    </>
                )}
                {isRecipient && (
                    <NavLink onClick={() => { onNavigate('request-items'); closeMenu(); }} isActive={currentPage === 'request-items'}>Request Items</NavLink>
                )}
                <NavLink onClick={() => { onNavigate('profile'); closeMenu(); }} isActive={currentPage === 'profile'}>My Profile</NavLink>
            </>
        );
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 cursor-pointer flex items-center" onClick={() => onNavigate('home')}>
                             <svg className="h-7 w-7 sm:h-8 sm:w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0h-4v-1h4v1zm0 6.01V13m0 .01v-.01m0 2.01V15m0 .01v-.01m0-10a9 9 0 11-9 9h4.586a1 1 0 00.707-.293l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-.707-.293H3a9 9 0 019-9z" />
                             </svg>
                        </div>
                        <span className="ml-2 font-bold text-lg sm:text-xl text-gray-800">Charity Connect</span>
                        <div className="hidden md:block ml-4 lg:ml-10">
                            <div className="flex items-baseline space-x-2 lg:space-x-4">
                                {renderNavLinks()}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        {user ? (
                            <div className="ml-4 flex items-center md:ml-6 relative profile-menu-container">
                                <span className="text-gray-700 mr-2 lg:mr-3 text-sm lg:text-base">Welcome, {user.name.split(' ')[0]}!</span>
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white min-w-[44px] min-h-[44px]"
                                    aria-label="User menu"
                                >
                                    <img className="h-8 w-8 lg:h-10 lg:w-10 rounded-full" src={user.avatarUrl} alt="" />
                                </button>
                                {isProfileOpen && (
                                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2" style={{top: '100%'}}>
                                        {user.role === 'donor' && (
                                            <button onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition">My Profile</button>
                                        )}
                                        <button onClick={() => { logout(); onNavigate('home'); setIsProfileOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition">Sign out</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => onNavigate('login')} 
                                className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition min-h-[44px]"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                    <div className="flex md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="inline-flex items-center justify-center p-2.5 rounded-md text-gray-700 hover:text-white hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition min-w-[44px] min-h-[44px]"
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu with Animation */}
            <div 
                className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                    isMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-3 pt-2 pb-4 space-y-1 bg-white border-t border-gray-200">
                     {user ? (
                         <>
                            <div className="space-y-1">
                                {renderNavLinks(true)}
                            </div>
                            <div className="border-t border-gray-200 my-3"></div>
                             <div className="flex items-center px-3 py-3 bg-gray-50 rounded-lg">
                                 <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                                 <div className="ml-3 flex-1">
                                     <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                     <p className="text-xs text-gray-500">{user.role}</p>
                                 </div>
                             </div>
                            <button 
                                onClick={() => { logout(); onNavigate('home'); setIsMenuOpen(false); }} 
                                className="block w-full text-left px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition min-h-[44px]"
                            >
                                Sign out
                            </button>
                         </>
                     ) : (
                        <button 
                            onClick={() => {onNavigate('login'); setIsMenuOpen(false);}} 
                            className="block w-full bg-teal-500 text-white px-3 py-3 rounded-md text-sm font-medium hover:bg-teal-600 transition text-center min-h-[44px]"
                        >
                            Sign In
                        </button>
                     )}
                </div>
            </div>
        </nav>
    );
};

export default Header;