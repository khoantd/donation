import React, { useState, useEffect } from 'react';
import { DonationItem, DonationStatus, ActionHistory, AdminNote } from '../types';
import { useAuth } from '../context/AuthContext';
import { addAdminNote, updateAdminNote, deleteAdminNote } from '../services/donationService';

interface DonationDetailsModalProps {
    donation: DonationItem | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate?: (id: string, status: DonationStatus) => void;
    onQuantityUpdate?: (id: string, quantity: number) => void;
    onDonationUpdate?: () => void; // Callback to refresh donation data after note changes
    isAdmin?: boolean;
}

const getStatusColor = (status: DonationStatus) => {
    switch (status) {
        case DonationStatus.PENDING:
            return 'bg-yellow-100 text-yellow-800 border-yellow-500';
        case DonationStatus.APPROVED:
            return 'bg-blue-100 text-blue-800 border-blue-500';
        case DonationStatus.DELIVERED:
            return 'bg-green-100 text-green-800 border-green-500';
        case DonationStatus.REJECTED:
            return 'bg-red-100 text-red-800 border-red-500';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-500';
    }
};

const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
    donation,
    isOpen,
    onClose,
    onStatusUpdate,
    onQuantityUpdate,
    onDonationUpdate,
    isAdmin = false,
}) => {
    const { user } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [editQuantity, setEditQuantity] = useState(0);
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState('');
    const [notes, setNotes] = useState<AdminNote[]>([]);

    // Get all images
    const allImages = donation
        ? (donation.imageUrls && donation.imageUrls.length > 0
            ? donation.imageUrls
            : [donation.imageUrl])
        : [];

    // Initialize edit quantity and notes when donation changes
    useEffect(() => {
        if (donation) {
            setEditQuantity(donation.quantity);
            setIsEditingQuantity(false);
            setCurrentImageIndex(0);
            setIsImageZoomed(false);
            setNotes(donation.adminNotes || []);
            setNewNote('');
            setIsAddingNote(false);
            setEditingNoteId(null);
            setEditingNoteContent('');
        }
    }, [donation]);

    // Handle keyboard navigation for images
    useEffect(() => {
        if (!isOpen || !donation) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isImageZoomed) {
                    setIsImageZoomed(false);
                } else {
                    onClose();
                }
            } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
                setCurrentImageIndex(prev => prev - 1);
            } else if (e.key === 'ArrowRight' && currentImageIndex < allImages.length - 1) {
                setCurrentImageIndex(prev => prev + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, donation, currentImageIndex, allImages.length, isImageZoomed, onClose]);

    if (!isOpen || !donation) return null;

    // Generate status timeline from action history and donation dates
    const getStatusTimeline = () => {
        const timeline: Array<{ status: DonationStatus; date: Date; performedBy?: string; notes?: string }> = [];
        
        // Add creation event
        timeline.push({
            status: DonationStatus.PENDING,
            date: donation.submittedAt,
            performedBy: donation.donorName,
            notes: 'Donation submitted',
        });

        // Add status changes from action history
        if (donation.actionHistory) {
            donation.actionHistory
                .filter(action => action.action === 'status_change')
                .forEach(action => {
                    timeline.push({
                        status: action.newValue as DonationStatus,
                        date: action.performedAt,
                        performedBy: action.performedBy,
                        notes: action.notes,
                    });
                });
        }

        // If current status is not in timeline, add it
        const hasCurrentStatus = timeline.some(item => item.status === donation.status);
        if (!hasCurrentStatus) {
            timeline.push({
                status: donation.status,
                date: donation.submittedAt,
                performedBy: 'System',
            });
        }

        return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    const statusTimeline = getStatusTimeline();
    const currentImage = allImages[currentImageIndex] || allImages[0];

    const handleQuantitySave = () => {
        if (onQuantityUpdate && donation && editQuantity !== donation.quantity) {
            onQuantityUpdate(donation.id, editQuantity);
            setIsEditingQuantity(false);
        }
    };

    const handleAddNote = async () => {
        if (!donation || !newNote.trim() || !user) return;
        
        try {
            const note = await addAdminNote(donation.id, newNote, user.name);
            setNotes([...notes, note]);
            setNewNote('');
            setIsAddingNote(false);
            if (onDonationUpdate) {
                onDonationUpdate();
            }
        } catch (err) {
            alert('Failed to add note. Please try again.');
        }
    };

    const handleUpdateNote = async (noteId: string) => {
        if (!donation || !editingNoteContent.trim() || !user) return;
        
        try {
            const updatedNote = await updateAdminNote(donation.id, noteId, editingNoteContent, user.name);
            setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
            setEditingNoteId(null);
            setEditingNoteContent('');
            if (onDonationUpdate) {
                onDonationUpdate();
            }
        } catch (err) {
            alert('Failed to update note. Please try again.');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!donation || !confirm('Are you sure you want to delete this note?')) return;
        
        try {
            await deleteAdminNote(donation.id, noteId);
            setNotes(notes.filter(n => n.id !== noteId));
            if (onDonationUpdate) {
                onDonationUpdate();
            }
        } catch (err) {
            alert('Failed to delete note. Please try again.');
        }
    };

    const startEditingNote = (note: AdminNote) => {
        setEditingNoteId(note.id);
        setEditingNoteContent(note.content);
    };

    const cancelEditingNote = () => {
        setEditingNoteId(null);
        setEditingNoteContent('');
    };

    return (
        <>
            {/* Modal Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-0 sm:p-4"
                onClick={onClose}
                aria-modal="true"
                role="dialog"
            >
                <div
                    className="bg-white rounded-none sm:rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] flex flex-col relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 pr-2 truncate flex-1">{donation.itemName}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 text-2xl sm:text-3xl font-light leading-none transition min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                            aria-label="Close modal"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                        {/* Images Gallery Section */}
                        {allImages.length > 0 && (
                            <div className="space-y-3 sm:space-y-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Images</h3>
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                                    <div className="aspect-video relative group">
                                        <img
                                            src={currentImage}
                                            alt={`${donation.itemName} - Image ${currentImageIndex + 1}`}
                                            className="w-full h-full object-contain cursor-pointer"
                                            onClick={() => setIsImageZoomed(true)}
                                        />

                                        {/* Image Counter */}
                                        {allImages.length > 1 && (
                                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                {currentImageIndex + 1} / {allImages.length}
                                            </div>
                                        )}

                                        {/* Navigation Buttons */}
                                        {allImages.length > 1 && (
                                            <>
                                                {currentImageIndex > 0 && (
                                                    <button
                                                        onClick={() => setCurrentImageIndex(prev => prev - 1)}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 sm:p-2.5 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        aria-label="Previous image"
                                                    >
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {currentImageIndex < allImages.length - 1 && (
                                                    <button
                                                        onClick={() => setCurrentImageIndex(prev => prev + 1)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 sm:p-2.5 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        aria-label="Next image"
                                                    >
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* Click to zoom hint */}
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                            Click to zoom
                                        </div>
                                    </div>

                                    {/* Thumbnail Strip */}
                                    {allImages.length > 1 && (
                                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                            {allImages.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition ${
                                                        index === currentImageIndex
                                                            ? 'border-teal-500 ring-2 ring-teal-200'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Left Column */}
                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Category:</strong> {donation.category}</p>
                                        <p>
                                            <strong>Quantity:</strong>{' '}
                                            {isAdmin && onQuantityUpdate ? (
                                                isEditingQuantity ? (
                                                    <div className="inline-flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={editQuantity}
                                                            onChange={(e) => setEditQuantity(parseInt(e.target.value, 10) || 0)}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                            min="0"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={handleQuantitySave}
                                                            className="text-teal-600 hover:text-teal-800 text-xs font-medium"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditQuantity(donation.quantity);
                                                                setIsEditingQuantity(false);
                                                            }}
                                                            className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span>
                                                        {donation.quantity}{' '}
                                                        <button
                                                            onClick={() => setIsEditingQuantity(true)}
                                                            className="text-teal-600 hover:text-teal-800 text-xs ml-2"
                                                        >
                                                            Edit
                                                        </button>
                                                    </span>
                                                )
                                            ) : (
                                                donation.quantity
                                            )}
                                        </p>
                                        <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(donation.status)}`}>{donation.status}</span></p>
                                        <p><strong>Submitted:</strong> {donation.submittedAt.toLocaleDateString()} at {donation.submittedAt.toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Description</h3>
                                    <p className="text-sm text-gray-700">{donation.description}</p>
                                </div>

                                {(isAdmin || donation.donorId === user?.id) && (
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-md border">
                                        <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Donor Information</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong>Name:</strong> {donation.donorName}</p>
                                            <p><strong>Phone:</strong> {donation.donorPhoneNumber}</p>
                                            <p><strong>Address:</strong> {donation.donorAddress}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Status Timeline */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Status Timeline</h3>
                                    <div className="space-y-3">
                                        {statusTimeline.map((item, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 border-2 ${getStatusColor(item.status).split(' ')[1]}`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    {item.performedBy && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            by {item.performedBy}
                                                        </p>
                                                    )}
                                                    {item.notes && (
                                                        <p className="text-xs text-gray-500 mt-1 italic">{item.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action History (Admin Only) */}
                                {isAdmin && donation.actionHistory && donation.actionHistory.length > 0 && (
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Action History</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {donation.actionHistory.map((action) => (
                                                <div key={action.id} className="p-3 bg-gray-50 rounded border text-sm">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-semibold text-gray-800 capitalize">
                                                            {action.action.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {action.performedAt.toLocaleDateString()} {action.performedAt.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-600">
                                                        {action.previousValue !== undefined && (
                                                            <p>
                                                                Changed from <strong>{action.previousValue}</strong> to <strong>{action.newValue}</strong>
                                                            </p>
                                                        )}
                                                        {!action.previousValue && (
                                                            <p>Set to <strong>{action.newValue}</strong></p>
                                                        )}
                                                    </div>
                                                    {action.performedBy && (
                                                        <p className="text-xs text-gray-500 mt-1">by {action.performedBy}</p>
                                                    )}
                                                    {action.notes && (
                                                        <p className="text-xs text-gray-500 mt-1 italic">{action.notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Notes (Admin Only - Private) */}
                                {isAdmin && (
                                    <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                                Admin Notes
                                                <span className="ml-2 text-xs font-normal text-gray-500 bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                    Private
                                                </span>
                                            </h3>
                                            {!isAddingNote && (
                                                <button
                                                    onClick={() => setIsAddingNote(true)}
                                                    className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 min-h-[44px] px-2"
                                                >
                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Note
                                                </button>
                                            )}
                                        </div>

                                        {/* Add Note Form */}
                                        {isAddingNote && (
                                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <textarea
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Add an internal note about this donation..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingNote(false);
                                                            setNewNote('');
                                                        }}
                                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleAddNote}
                                                        disabled={!newNote.trim()}
                                                        className="px-3 py-1 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                                    >
                                                        Add Note
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes List */}
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {notes.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic text-center py-4">
                                                    No notes yet. Add your first note above.
                                                </p>
                                            ) : (
                                                notes
                                                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                                                    .map((note) => (
                                                        <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {editingNoteId === note.id ? (
                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        value={editingNoteContent}
                                                                        onChange={(e) => setEditingNoteContent(e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
                                                                        rows={3}
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={cancelEditingNote}
                                                                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateNote(note.id)}
                                                                            disabled={!editingNoteContent.trim()}
                                                                            className="px-3 py-1 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                                                        <div className="text-xs text-gray-500">
                                                                            <span>by {note.createdBy}</span>
                                                                            <span className="mx-1">•</span>
                                                                            <span>{note.createdAt.toLocaleDateString()} {note.createdAt.toLocaleTimeString()}</span>
                                                                            {note.updatedAt && (
                                                                                <>
                                                                                    <span className="mx-1">•</span>
                                                                                    <span className="italic">edited {note.updatedAt.toLocaleDateString()}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => startEditingNote(note)}
                                                                                className="text-xs text-teal-600 hover:text-teal-800"
                                                                                aria-label="Edit note"
                                                                            >
                                                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteNote(note.id)}
                                                                                className="text-xs text-red-600 hover:text-red-800"
                                                                                aria-label="Delete note"
                                                                            >
                                                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions (Admin Only) */}
                    {isAdmin && onStatusUpdate && (
                        <div className="p-4 sm:p-6 bg-gray-50 border-t mt-auto">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Actions</h3>
                            {donation.status === DonationStatus.PENDING && (
                                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                                    <button
                                        onClick={() => onStatusUpdate(donation.id, DonationStatus.APPROVED)}
                                        className="flex-1 px-4 py-3 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition min-h-[44px] font-medium"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => onStatusUpdate(donation.id, DonationStatus.REJECTED)}
                                        className="flex-1 px-4 py-3 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition min-h-[44px] font-medium"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                            {donation.status === DonationStatus.APPROVED && (
                                <button
                                    onClick={() => onStatusUpdate(donation.id, DonationStatus.DELIVERED)}
                                    className="w-full px-4 py-3 sm:py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition min-h-[44px] font-medium"
                                >
                                    Mark as Delivered
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Zoom Modal */}
            {isImageZoomed && currentImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-2 sm:p-4"
                    onClick={() => setIsImageZoomed(false)}
                >
                    <div className="relative max-w-7xl max-h-full">
                        <img
                            src={currentImage}
                            alt={`${donation.itemName} - Zoomed`}
                            className="max-w-full max-h-[95vh] sm:max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setIsImageZoomed(false)}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-2 sm:p-2.5 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Close zoom"
                        >
                            <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {allImages.length > 1 && (
                            <>
                                {currentImageIndex > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(prev => prev - 1);
                                        }}
                                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-2.5 sm:p-3 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                                        aria-label="Previous image"
                                    >
                                        <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                                {currentImageIndex < allImages.length - 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(prev => prev + 1);
                                        }}
                                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-2.5 sm:p-3 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                                        aria-label="Next image"
                                    >
                                        <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded">
                            {currentImageIndex + 1} / {allImages.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DonationDetailsModal;

