import React from 'react';
import { useAuth } from '../context/AuthContext';

type Page = 'home' | 'donate' | 'history' | 'admin' | 'login' | 'profile' | 'impact';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <svg className="h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0h-4v-1h4v1zm0 6.01V13m0 .01v-.01m0 2.01V15m0 .01v-.01m0-10a9 9 0 11-9 9h4.586a1 1 0 00.707-.293l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-.707-.293H3a9 9 0 019-9z" />
                            </svg>
                            <span className="ml-2 font-bold text-xl text-gray-800">Charity Connect</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            Connecting donors with those in need. Your generosity makes a world of difference.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-teal-500 transition-colors"
                                aria-label="Facebook"
                                onClick={(e) => e.preventDefault()}
                            >
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-teal-500 transition-colors"
                                aria-label="Twitter"
                                onClick={(e) => e.preventDefault()}
                            >
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-teal-500 transition-colors"
                                aria-label="Instagram"
                                onClick={(e) => e.preventDefault()}
                            >
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => onNavigate('home')}
                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('impact')}
                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                >
                                    Impact Stories
                                </button>
                            </li>
                            {user ? (
                                <>
                                    {user.role === 'donor' && (
                                        <>
                                            <li>
                                                <button
                                                    onClick={() => onNavigate('donate')}
                                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                                >
                                                    Donate
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => onNavigate('history')}
                                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                                >
                                                    My History
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => onNavigate('profile')}
                                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                                >
                                                    My Profile
                                                </button>
                                            </li>
                                        </>
                                    )}
                                    {user.role === 'admin' && (
                                        <li>
                                            <button
                                                onClick={() => onNavigate('admin')}
                                                className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                            >
                                                Admin Panel
                                            </button>
                                        </li>
                                    )}
                                </>
                            ) : (
                                <li>
                                    <button
                                        onClick={() => onNavigate('login')}
                                        className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                    >
                                        Sign In
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-gray-900 font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Donation Guidelines
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-teal-500 text-sm transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-gray-900 font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start">
                                <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:contact@charityconnect.com" className="hover:text-teal-500 transition-colors">
                                    contact@charityconnect.com
                                </a>
                            </li>
                            <li className="flex items-start">
                                <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>123 Charity Street<br />Community City, CC 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            © {currentYear} Charity Connect. All rights reserved.
                        </p>
                        <p className="text-gray-600 text-sm mt-4 md:mt-0">
                            Made with <span className="text-red-500">❤</span> for a better world
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

