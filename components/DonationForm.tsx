import React, { useState } from 'react';
import { addDonation } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { DonationItem } from '../types';
import { compressImage, createImagePreview, isImageFile, validateImageSize } from '../services/imageService';

const DonationForm: React.FC = () => {
    const { user } = useAuth();
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [category, setCategory] = useState('Clothing');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [compressing, setCompressing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;

        setError('');
        setCompressing(true);

        try {
            const validFiles: File[] = [];
            const previews: string[] = [];
            const maxImages = 5; // Maximum 5 images per donation

            // Check if adding these files would exceed the limit
            if (images.length + files.length > maxImages) {
                setError(`Maximum ${maxImages} images allowed. You have ${images.length} images and are trying to add ${files.length}.`);
                setCompressing(false);
                return;
            }

            // Process each file
            for (const file of files) {
                // Validate file type
                if (!isImageFile(file)) {
                    setError(`"${file.name}" is not an image file.`);
                    setCompressing(false);
                    return;
                }

                // Validate file size (10MB)
                if (!validateImageSize(file, 10)) {
                    setError(`"${file.name}" is too large. Maximum size is 10MB.`);
                    setCompressing(false);
                    return;
                }

                try {
                    // Compress image
                    const compressedFile = await compressImage(file, {
                        maxWidth: 1920,
                        maxHeight: 1080,
                        quality: 0.8,
                        maxSizeKB: 500,
                    });

                    // Create preview
                    const preview = await createImagePreview(compressedFile);

                    validFiles.push(compressedFile);
                    previews.push(preview);
                } catch (err) {
                    setError(`Failed to process "${file.name}". Please try again.`);
                    setCompressing(false);
                    return;
                }
            }

            // Add all valid files and previews
            setImages(prev => [...prev, ...validFiles]);
            setImagePreviews(prev => [...prev, ...previews]);
        } catch (err) {
            setError('Failed to process images. Please try again.');
        } finally {
            setCompressing(false);
            // Reset input value to allow selecting the same file again
            const input = e.target;
            if (input) input.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to donate.');
            return;
        }
        if (!itemName || !description || quantity < 1 || !phoneNumber || !address) {
            setError('Please fill in all required fields.');
            return;
        }

        setStatus('loading');
        setError('');

        try {
            // Create image URLs from compressed files
            const imageUrls = images.length > 0
                ? images.map(img => URL.createObjectURL(img))
                : [`https://picsum.photos/seed/${itemName}/400/300`];

            const newDonation: Omit<DonationItem, 'id' | 'status' | 'submittedAt'> = {
                itemName,
                description,
                quantity,
                category,
                imageUrl: imageUrls[0], // First image for backward compatibility
                imageUrls: imageUrls, // Array of all images
                donorName: user.name,
                donorId: user.id,
                donorPhoneNumber: phoneNumber,
                donorAddress: address,
            };
            await addDonation(newDonation);
            setStatus('success');
            // Reset form
            setItemName('');
            setDescription('');
            setQuantity(1);
            setCategory('Clothing');
            setPhoneNumber('');
            setAddress('');
            setImages([]);
            setImagePreviews([]);
        } catch (err) {
            setStatus('error');
            setError('Failed to submit donation. Please try again.');
        }
    };
    
    const categories = ['Clothing', 'Food', 'Electronics', 'Books', 'Furniture', 'Medical', 'Toys', 'Other'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                    type="text"
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    required
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
             <div className="border-t border-gray-200 pt-6 space-y-6">
                 <h3 className="text-lg font-medium text-gray-900">Pickup Information</h3>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Pickup Address</label>
                    <textarea
                        id="address"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        required
                    />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Images (optional) - Up to 5 images
                </label>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                    <div className="mb-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <div className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                            aria-label={`Remove image ${index + 1}`}
                                        >
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    {images[index] && (
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            {images[index].name} ({(images[index].size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {images.length < 5 && (
                            <p className="text-xs text-gray-500">
                                {images.length} of 5 images uploaded. You can add {5 - images.length} more.
                            </p>
                        )}
                    </div>
                )}

                {/* Upload Area */}
                <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-teal-400 transition ${imagePreviews.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="space-y-1 text-center">
                        {compressing ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                                <p className="text-sm text-gray-600 mt-2">Compressing images...</p>
                            </>
                        ) : (
                            <>
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label htmlFor="file-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 ${imagePreviews.length >= 5 ? 'pointer-events-none opacity-50' : ''}`}>
                                        <span>Upload images</span>
                                        <input 
                                            id="file-upload" 
                                            name="file-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            onChange={handleImageChange} 
                                            accept="image/*" 
                                            multiple
                                            disabled={imagePreviews.length >= 5 || compressing}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each. Images will be automatically compressed.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {status === 'success' && <div className="p-4 bg-green-100 text-green-800 rounded-md">Donation submitted successfully! Thank you.</div>}
            {error && <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>}
            <div>
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? 'Submitting...' : 'Submit Donation'}
                </button>
            </div>
        </form>
    );
};

export default DonationForm;
