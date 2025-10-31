import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    createItemRequest,
    getItemRequestsByRecipient,
    getActiveItemRequests,
    updateItemRequest,
    cancelItemRequest,
    deleteItemRequest,
    REQUEST_CATEGORIES,
    expireOldRequests,
} from '../services/requestService';
import { getRecipientProfile } from '../services/recipientRegistrationService';
import { ItemRequest, RecipientProfile } from '../types';
import { compressImage, createImagePreview, isImageFile, validateImageSize } from '../services/imageService';

const RequestItemsPage: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<ItemRequest[]>([]);
    const [activeRequests, setActiveRequests] = useState<ItemRequest[]>([]);
    const [profile, setProfile] = useState<RecipientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingRequest, setEditingRequest] = useState<ItemRequest | null>(null);
    const [formData, setFormData] = useState({
        category: 'Clothing',
        itemName: '',
        quantityNeeded: 1,
        description: '',
        urgency: 'medium' as 'high' | 'medium' | 'low',
        estimatedNeedDate: '',
        deadline: '',
        visibility: 'public' as 'public' | 'private',
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [compressing, setCompressing] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formError, setFormError] = useState<string>('');
    
    // Filter and sort state
    const [filterStatus, setFilterStatus] = useState<'all' | ItemRequest['status']>('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'date' | 'urgency' | 'quantity'>('date');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user || (user.role !== 'recipient' && !user.roles?.includes('recipient'))) {
                setError('You must be logged in as a recipient to access this page.');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError('');
                
                // Expire old requests
                await expireOldRequests();
                
                const [allRequests, activeRequestsData, profileData] = await Promise.all([
                    getItemRequestsByRecipient(user.id),
                    getActiveItemRequests(user.id),
                    getRecipientProfile(user.id),
                ]);
                
                setRequests(allRequests);
                setActiveRequests(activeRequestsData);
                setProfile(profileData);
            } catch (err) {
                console.error('Failed to fetch requests:', err);
                setError('Failed to load requests. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;

        setFormError('');
        setCompressing(true);

        try {
            const validFiles: File[] = [];
            const previews: string[] = [];
            const maxImages = 5;

            if (images.length + files.length > maxImages) {
                setFormError(`Maximum ${maxImages} images allowed. You have ${images.length} images and are trying to add ${files.length}.`);
                setCompressing(false);
                return;
            }

            for (const file of files) {
                if (!isImageFile(file)) {
                    setFormError(`"${file.name}" is not an image file.`);
                    setCompressing(false);
                    return;
                }

                if (!validateImageSize(file, 10)) {
                    setFormError(`"${file.name}" is too large. Maximum size is 10MB.`);
                    setCompressing(false);
                    return;
                }

                try {
                    const compressedFile = await compressImage(file, {
                        maxWidth: 1920,
                        maxHeight: 1080,
                        quality: 0.8,
                        maxSizeKB: 500,
                    });

                    const preview = await createImagePreview(compressedFile);
                    validFiles.push(compressedFile);
                    previews.push(preview);
                } catch (err) {
                    setFormError(`Failed to process "${file.name}". Please try again.`);
                    setCompressing(false);
                    return;
                }
            }

            setImages(prev => [...prev, ...validFiles]);
            setImagePreviews(prev => [...prev, ...previews]);
        } catch (err) {
            setFormError('Failed to process images. Please try again.');
        } finally {
            setCompressing(false);
            const input = e.target;
            if (input) input.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData({
            category: 'Clothing',
            itemName: '',
            quantityNeeded: 1,
            description: '',
            urgency: 'medium',
            estimatedNeedDate: '',
            deadline: '',
            visibility: 'public',
        });
        setImages([]);
        setImagePreviews([]);
        setFormError('');
        setFormStatus('idle');
        setEditingRequest(null);
        setShowForm(false);
    };

    const handleEdit = (request: ItemRequest) => {
        setEditingRequest(request);
        setFormData({
            category: request.category,
            itemName: request.itemName,
            quantityNeeded: request.quantityNeeded,
            description: request.description,
            urgency: request.urgency,
            estimatedNeedDate: request.estimatedNeedDate ? new Date(request.estimatedNeedDate).toISOString().split('T')[0] : '',
            deadline: request.deadline ? new Date(request.deadline).toISOString().split('T')[0] : '',
            visibility: request.visibility,
        });
        setImagePreviews(request.imageUrls || []);
        setImages([]); // Reset new images
        setShowForm(true);
        setFormError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setFormError('You must be logged in to create a request.');
            return;
        }

        if (!formData.itemName || !formData.description || formData.quantityNeeded < 1) {
            setFormError('Please fill in all required fields.');
            return;
        }

        setFormStatus('loading');
        setFormError('');

        try {
            // Process images to URLs (in production, upload to cloud storage)
            const imageUrls = imagePreviews; // For now, use previews (in production, upload and get URLs)

            const requestData: Omit<ItemRequest, 'id' | 'submittedAt' | 'status'> = {
                recipientId: user.id,
                recipientName: user.name,
                category: formData.category,
                itemName: formData.itemName,
                quantityNeeded: formData.quantityNeeded,
                description: formData.description,
                urgency: formData.urgency,
                estimatedNeedDate: formData.estimatedNeedDate ? new Date(formData.estimatedNeedDate) : undefined,
                deadline: formData.deadline ? new Date(formData.deadline) : undefined,
                familySize: profile?.familySize,
                familyComposition: profile?.familyComposition,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                visibility: formData.visibility,
                matchingStatus: 'waiting',
            };

            let updatedRequest: ItemRequest;
            
            if (editingRequest) {
                // Update existing request
                updatedRequest = await updateItemRequest(editingRequest.id, requestData);
                setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
            } else {
                // Create new request
                updatedRequest = await createItemRequest(requestData);
                setRequests(prev => [updatedRequest, ...prev]);
            }

            // Refresh active requests
            const activeRequestsData = await getActiveItemRequests(user.id);
            setActiveRequests(activeRequestsData);

            setFormStatus('success');
            setTimeout(() => {
                resetForm();
            }, 1500);
        } catch (err: any) {
            setFormError(err.message || 'Failed to save request. Please try again.');
            setFormStatus('error');
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        if (!confirm('Are you sure you want to cancel this request?')) return;
        
        try {
            const cancelled = await cancelItemRequest(requestId, user?.name);
            setRequests(prev => prev.map(r => r.id === cancelled.id ? cancelled : r));
            
            const activeRequestsData = await getActiveItemRequests(user?.id || '');
            setActiveRequests(activeRequestsData);
        } catch (err: any) {
            alert(err.message || 'Failed to cancel request.');
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) return;
        
        try {
            await deleteItemRequest(requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
            
            const activeRequestsData = await getActiveItemRequests(user?.id || '');
            setActiveRequests(activeRequestsData);
        } catch (err: any) {
            alert(err.message || 'Failed to delete request.');
        }
    };

    // Filter and sort requests
    const filteredAndSortedRequests = useMemo(() => {
        let filtered = requests;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(r => r.status === filterStatus);
        }

        // Filter by category
        if (filterCategory !== 'all') {
            filtered = filtered.filter(r => r.category === filterCategory);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.itemName.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query) ||
                r.category.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'urgency':
                    const urgencyOrder = { high: 3, medium: 2, low: 1 };
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
                case 'quantity':
                    return b.quantityNeeded - a.quantityNeeded;
                case 'date':
                default:
                    return b.submittedAt.getTime() - a.submittedAt.getTime();
            }
        });

        return filtered;
    }, [requests, filterStatus, filterCategory, searchQuery, sortBy]);

    const getStatusColor = (status: ItemRequest['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'approved':
            case 'matched':
                return 'bg-blue-100 text-blue-800 border-blue-500';
            case 'fulfilled':
                return 'bg-green-100 text-green-800 border-green-500';
            case 'cancelled':
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-500';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };

    const getUrgencyColor = (urgency: ItemRequest['urgency']) => {
        switch (urgency) {
            case 'high':
                return 'bg-red-500 text-white';
            case 'medium':
                return 'bg-yellow-500 text-white';
            case 'low':
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md">
                    {error || 'You must be logged in as a recipient to access this page.'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Items</h1>
                        <p className="text-gray-600">Create and manage your item requests</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="bg-teal-500 text-white px-6 py-3 rounded-md hover:bg-teal-600 transition font-medium shadow-md"
                    >
                        + New Request
                    </button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {activeRequests.length} Active Requests
                    </div>
                    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {requests.length} Total Requests
                    </div>
                </div>
            </div>

            {/* Create/Edit Request Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {editingRequest ? 'Edit Request' : 'Create New Request'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ✕ Close
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formError && (
                            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md">
                                {formError}
                            </div>
                        )}

                        {formStatus === 'success' && (
                            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-md">
                                {editingRequest ? 'Request updated successfully!' : 'Request created successfully!'}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                >
                                    {REQUEST_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="itemName"
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="e.g., Winter Jackets, Canned Goods"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="quantityNeeded" className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity Needed <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="quantityNeeded"
                                    min="1"
                                    value={formData.quantityNeeded}
                                    onChange={(e) => setFormData({ ...formData, quantityNeeded: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                                    Urgency Level <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="urgency"
                                    value={formData.urgency}
                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'high' | 'medium' | 'low' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                >
                                    <option value="high">High/Urgent</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                                    Visibility
                                </label>
                                <select
                                    id="visibility"
                                    value={formData.visibility}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="public">Public (visible to donors)</option>
                                    <option value="private">Private (admin only)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                rows={4}
                                placeholder="Describe the items you need and why they are important..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="estimatedNeedDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Need Date
                                </label>
                                <input
                                    type="date"
                                    id="estimatedNeedDate"
                                    value={formData.estimatedNeedDate}
                                    onChange={(e) => setFormData({ ...formData, estimatedNeedDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                                    Deadline (Optional)
                                </label>
                                <input
                                    type="date"
                                    id="deadline"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        {/* Family Context */}
                        {profile && (profile.familySize || profile.familyComposition) && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Family Context:</strong> This request will include your family information:
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {profile.familySize && (
                                        <span>Family Size: {profile.familySize}</span>
                                    )}
                                    {profile.familyComposition && (
                                        <span>Composition: {profile.familyComposition}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Images (up to 5)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-md border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                disabled={compressing || imagePreviews.length >= 5}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 disabled:opacity-50"
                            />
                            {compressing && (
                                <p className="text-sm text-gray-500 mt-2">Compressing images...</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={formStatus === 'loading'}
                                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition font-medium disabled:bg-teal-300 disabled:cursor-not-allowed"
                            >
                                {formStatus === 'loading' ? 'Saving...' : editingRequest ? 'Update Request' : 'Create Request'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={formStatus === 'loading'}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            id="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Search requests..."
                        />
                    </div>
                    <div>
                        <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="filterStatus"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="matched">Matched</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            id="filterCategory"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="all">All Categories</option>
                            {REQUEST_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                        </label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="date">Date (Newest)</option>
                            <option value="urgency">Urgency</option>
                            <option value="quantity">Quantity</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Your Requests ({filteredAndSortedRequests.length})
                </h2>
                {filteredAndSortedRequests.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">
                            {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                                ? 'No requests match your filters.'
                                : 'No requests yet. Create your first request to get started!'}
                        </p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition font-medium"
                            >
                                Create First Request
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAndSortedRequests.map(request => (
                            <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <h3 className="text-lg font-semibold text-gray-900">{request.itemName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                                                {request.urgency.toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            {request.visibility === 'private' && (
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-400">
                                                    Private
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mb-3">{request.description}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                            <div>
                                                <span className="font-medium">Category:</span> {request.category}
                                            </div>
                                            <div>
                                                <span className="font-medium">Quantity Needed:</span> {request.quantityNeeded}
                                            </div>
                                            {request.quantityReceived && (
                                                <div>
                                                    <span className="font-medium">Received:</span> {request.quantityReceived}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Submitted:</span> {request.submittedAt.toLocaleDateString()}
                                            </div>
                                        </div>
                                        {(request.estimatedNeedDate || request.deadline) && (
                                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                                                {request.estimatedNeedDate && (
                                                    <div>
                                                        <span className="font-medium">Need Date:</span> {new Date(request.estimatedNeedDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {request.deadline && (
                                                    <div>
                                                        <span className="font-medium">Deadline:</span> {new Date(request.deadline).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {request.imageUrls && request.imageUrls.length > 0 && (
                                            <div className="flex gap-2 mt-3">
                                                {request.imageUrls.slice(0, 3).map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt={`${request.itemName} ${idx + 1}`}
                                                        className="w-20 h-20 object-cover rounded-md border border-gray-300"
                                                    />
                                                ))}
                                                {request.imageUrls.length > 3 && (
                                                    <div className="w-20 h-20 bg-gray-100 rounded-md border border-gray-300 flex items-center justify-center text-sm text-gray-600">
                                                        +{request.imageUrls.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {request.matchingStatus === 'waiting' && request.status !== 'cancelled' && (
                                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                                ⏳ Waiting for matching donation...
                                            </div>
                                        )}
                                        {request.matchingStatus === 'matched' && (
                                            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                                                ✓ Matched with available donation
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        {(request.status === 'pending' || request.status === 'approved' || request.status === 'matched') && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(request)}
                                                    className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleCancelRequest(request.id)}
                                                    className="text-orange-600 hover:text-orange-800 font-medium text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {(request.status === 'pending' || request.status === 'cancelled') && (
                                            <button
                                                onClick={() => handleDeleteRequest(request.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestItemsPage;

