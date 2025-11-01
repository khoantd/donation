
import React from 'react';
import DonationForm from '../components/DonationForm';

const DonatePage: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto px-2 sm:px-0">
             <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Make a Donation</h1>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Fill out the form below to donate items. Your generosity is greatly appreciated!</p>
                <DonationForm />
            </div>
        </div>
    );
};

export default DonatePage;
