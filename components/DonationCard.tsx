import React, { useState } from 'react';
import { DonationItem, DonationStatus } from '../types';

interface DonationCardProps {
    donation: DonationItem;
    isAdmin: boolean;
    onManage?: (donation: DonationItem) => void;
    onViewDetails?: (donation: DonationItem) => void;
}

const getStatusColor = (status: DonationStatus) => {
    switch (status) {
        case DonationStatus.PENDING:
            return 'bg-yellow-100 text-yellow-800';
        case DonationStatus.APPROVED:
            return 'bg-blue-100 text-blue-800';
        case DonationStatus.DELIVERED:
            return 'bg-green-100 text-green-800';
        case DonationStatus.REJECTED:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const DonationCard: React.FC<DonationCardProps> = ({ donation, isAdmin, onManage, onViewDetails }) => {
    // Get all images, prioritizing imageUrls array, fallback to imageUrl for backward compatibility
    const allImages = donation.imageUrls && donation.imageUrls.length > 0
        ? donation.imageUrls
        : [donation.imageUrl];
    
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = allImages.length > 1;

    const getCurrentImage = () => allImages[currentImageIndex] || allImages[0];

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl cursor-pointer"
            onClick={() => onViewDetails && onViewDetails(donation)}
        >
            <div className="flex flex-col sm:flex-row">
                <div className="relative h-48 sm:h-40 w-full sm:w-48 lg:w-56 overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                        className="h-full w-full object-cover" 
                        src={getCurrentImage()} 
                        alt={donation.itemName}
                    />
                    
                    {/* Image Gallery Navigation */}
                    {hasMultipleImages && (
                        <>
                            {/* Image Counter */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {currentImageIndex + 1} / {allImages.length}
                            </div>
                            
                            {/* Previous Button */}
                            {currentImageIndex > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(prev => prev - 1);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-1.5 transition"
                                    aria-label="Previous image"
                                >
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                            
                            {/* Next Button */}
                            {currentImageIndex < allImages.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(prev => prev + 1);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-1.5 transition"
                                    aria-label="Next image"
                                >
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                            
                            {/* Thumbnail Dots */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {allImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(index);
                                        }}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentImageIndex
                                                ? 'w-6 bg-white'
                                                : 'w-2 bg-white bg-opacity-50 hover:bg-opacity-75'
                                        }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow min-w-0">
                    <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                             <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex-1">{donation.itemName}</h3>
                             <span className={`text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${getStatusColor(donation.status)}`}>
                                 {donation.status}
                             </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-2">
                            Category: {donation.category} | Quantity: <span className="font-semibold">{donation.quantity}</span>
                        </p>
                        <p className="text-gray-700 mt-2 text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">{donation.description}</p>
                    </div>

                    {isAdmin && (
                         <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-md border text-xs sm:text-sm text-gray-600 space-y-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">Donor Information</h4>
                            <p className="truncate"><strong>Name:</strong> {donation.donorName}</p>
                            <p className="truncate"><strong>Phone:</strong> {donation.donorPhoneNumber}</p>
                            <p className="line-clamp-2"><strong>Address:</strong> {donation.donorAddress}</p>
                        </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-3 sm:mt-4 gap-3">
                        <div className="text-xs sm:text-sm text-gray-500">
                             {!isAdmin && <p className="truncate">Donated by: {donation.donorName}</p>}
                             <p>Submitted: {donation.submittedAt.toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                            {onViewDetails && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails(donation);
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-teal-500 text-white text-sm font-semibold rounded-md hover:bg-teal-600 transition shadow min-h-[44px]"
                                >
                                    View Details
                                </button>
                            )}
                            {isAdmin && onManage && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onManage(donation);
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition shadow min-h-[44px]"
                                >
                                    Manage
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationCard;