import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserAccountStatus, UserTag, CommunicationRecord, UserChangeHistory, UserDependency } from '../types';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    bulkUpdateUserStatus,
    assignRoleToUser,
    bulkAssignRole,
    verifyUser,
    rejectUserVerification,
    bulkVerifyUsers,
    getUserDependencies,
    getUserChangeHistory,
    getUserStatistics,
    getAllUserTags,
    createUserTag,
    updateUserTag,
    deleteUserTag,
    assignTagsToUser,
    getUserTags,
    bulkAssignTags,
    addCommunicationRecord,
    getUserCommunications,
    deleteCommunicationRecord,
} from '../services/userManagementService';
import { getRoles } from '../services/masterDataService';

type Tab = 'users' | 'tags' | 'statistics';

const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('users');
    
    // Users state
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'donor' | 'admin' | 'recipient'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
    const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'lastActivityAt' | 'loginCount'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showInactive, setShowInactive] = useState(true);
    
    // Selection
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    
    // Forms
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [userDependencies, setUserDependencies] = useState<UserDependency | null>(null);
    const [userHistory, setUserHistory] = useState<UserChangeHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    
    // Statistics
    const [statistics, setStatistics] = useState<{
        totalUsers: number;
        activeUsers: number;
        usersByRole: { role: string; count: number }[];
        verifiedUsers: number;
        unverifiedUsers: number;
        pendingVerification: number;
        recentRegistrations: number;
    } | null>(null);
    
    // Roles for assignment
    const [roles, setRoles] = useState<any[]>([]);
    
    // User form data
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        role: 'donor',
        roles: [],
        accountStatus: 'active',
        bio: '',
    });
    
    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const filters: any = {};
            
            if (roleFilter !== 'all') {
                filters.role = roleFilter;
            }
            if (statusFilter !== 'all') {
                filters.accountStatus = statusFilter;
            }
            if (verificationFilter !== 'all') {
                filters.verificationStatus = verificationFilter;
            }
            if (!showInactive) {
                filters.accountStatus = 'active';
            }
            
            const allUsers = await getAllUsers(filters, sortBy, sortOrder);
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        } catch (err: any) {
            setError(err.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [roleFilter, statusFilter, verificationFilter, showInactive, sortBy, sortOrder]);
    
    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const stats = await getUserStatistics();
            setStatistics(stats);
        } catch (err: any) {
            console.error('Failed to load statistics:', err);
        }
    }, []);
    
    // Fetch roles
    const fetchRoles = useCallback(async () => {
        try {
            const allRoles = await getRoles(true); // Get all roles including inactive
            setRoles(allRoles);
        } catch (err: any) {
            console.error('Failed to load roles:', err);
        }
    }, []);
    
    useEffect(() => {
        fetchUsers();
        fetchStatistics();
        fetchRoles();
    }, [fetchUsers, fetchStatistics, fetchRoles]);
    
    // Filter users based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }
        
        const searchLower = searchTerm.toLowerCase();
        const filtered = users.filter(u =>
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower) ||
            u.phoneNumber?.toLowerCase().includes(searchLower) ||
            u.address?.toLowerCase().includes(searchLower)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);
    
    // Redirect non-admin users
    if (user?.role !== 'admin') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 text-red-800 p-4 rounded-md">
                    <p className="font-semibold">Access Denied</p>
                    <p>You must be an admin to access User Management.</p>
                </div>
            </div>
        );
    }
    
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            const newUser = await createUser(formData as Omit<User, 'id' | 'createdAt' | 'createdBy' | 'loginCount'>, user.name);
            setSuccess(`User "${newUser.name}" created successfully!`);
            setIsCreatingUser(false);
            resetForm();
            fetchUsers();
            fetchStatistics();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to create user. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !editingUser) return;
        
        try {
            setError(null);
            setSuccess(null);
            await updateUser(editingUser.id, formData, user.name);
            setSuccess(`User "${formData.name}" updated successfully!`);
            setEditingUser(null);
            resetForm();
            fetchUsers();
            fetchStatistics();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update user. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (!user) return;
        
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await deleteUser(userId, user.name, false); // Soft delete by default
            setSuccess('User deleted successfully!');
            fetchUsers();
            fetchStatistics();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete user. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleToggleStatus = async (userId: string, currentStatus: UserAccountStatus | undefined) => {
        if (!user) return;
        
        const newStatus = (currentStatus || 'active') === 'active' ? 'inactive' : 'active';
        
        try {
            setError(null);
            setSuccess(null);
            await updateUserStatus(userId, newStatus, undefined, user.name);
            setSuccess(`User status updated to ${newStatus}!`);
            fetchUsers();
            fetchStatistics();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update user status. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleBulkToggleStatus = async (status: UserAccountStatus) => {
        if (!user || selectedUsers.size === 0) return;
        
        if (!window.confirm(`Are you sure you want to ${status === 'active' ? 'activate' : status} ${selectedUsers.size} user(s)?`)) {
            return;
        }
        
        try {
            setError(null);
            setSuccess(null);
            await bulkUpdateUserStatus(Array.from(selectedUsers), status, undefined, user.name);
            setSuccess(`${selectedUsers.size} user(s) updated successfully!`);
            setSelectedUsers(new Set());
            fetchUsers();
            fetchStatistics();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to update users. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleVerifyUser = async (userId: string) => {
        if (!user) return;
        
        try {
            setError(null);
            setSuccess(null);
            await verifyUser(userId, user.name);
            setSuccess('User verified successfully!');
            fetchUsers();
            fetchStatistics();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to verify user. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleRejectVerification = async (userId: string) => {
        if (!user) return;
        
        const reason = window.prompt('Please provide a reason for rejection:');
        if (reason === null) return;
        
        try {
            setError(null);
            setSuccess(null);
            await rejectUserVerification(userId, reason, user.name);
            setSuccess('User verification rejected!');
            fetchUsers();
            fetchStatistics();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to reject verification. Please try again.');
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleViewUser = async (userToView: User) => {
        setViewingUser(userToView);
        
        try {
            const [deps, history] = await Promise.all([
                getUserDependencies(userToView.id),
                getUserChangeHistory(userToView.id),
            ]);
            setUserDependencies(deps);
            setUserHistory(history);
        } catch (err: any) {
            console.error('Failed to load user details:', err);
        }
    };
    
    const handleViewHistory = async (userId: string) => {
        try {
            const history = await getUserChangeHistory(userId);
            setUserHistory(history);
            setShowHistory(true);
        } catch (err: any) {
            setError('Failed to load user history.');
        }
    };
    
    const handleEditUser = async (userToEdit: User) => {
        setEditingUser(userToEdit);
        setFormData({
            name: userToEdit.name,
            email: userToEdit.email,
            phoneNumber: userToEdit.phoneNumber || '',
            address: userToEdit.address || '',
            role: userToEdit.role,
            roles: userToEdit.roles || [],
            accountStatus: userToEdit.accountStatus || 'active',
            bio: userToEdit.bio || '',
            roleId: userToEdit.roleId,
            verificationStatus: userToEdit.verificationStatus,
        });
        setIsCreatingUser(false);
    };
    
    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phoneNumber: '',
            address: '',
            role: 'donor',
            roles: [],
            accountStatus: 'active',
            bio: '',
        });
        setEditingUser(null);
        setViewingUser(null);
        setUserDependencies(null);
        setUserHistory([]);
    };
    
    const handleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };
    
    const handleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };
    
    const renderUsersTab = () => (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{statistics.totalUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <p className="text-xs sm:text-sm text-gray-500">Active Users</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{statistics.activeUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <p className="text-xs sm:text-sm text-gray-500">Verified Users</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{statistics.verifiedUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <p className="text-xs sm:text-sm text-gray-500">Pending Verification</p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">{statistics.pendingVerification}</p>
                    </div>
                </div>
            )}
            
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search users by name, email, phone, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="donor">Donor</option>
                        <option value="recipient">Recipient</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                        <option value="pending_verification">Pending Verification</option>
                    </select>
                    <select
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="all">All Verification</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">Show Inactive</span>
                        </label>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field as any);
                                setSortOrder(order as any);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="name-asc">Sort by Name (A-Z)</option>
                            <option value="name-desc">Sort by Name (Z-A)</option>
                            <option value="email-asc">Sort by Email (A-Z)</option>
                            <option value="email-desc">Sort by Email (Z-A)</option>
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="lastActivityAt-desc">Most Recent Activity</option>
                            <option value="lastActivityAt-asc">Least Recent Activity</option>
                            <option value="loginCount-desc">Most Logins</option>
                            <option value="loginCount-asc">Fewest Logins</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        {selectedUsers.size > 0 && (
                            <>
                                <button
                                    onClick={() => handleBulkToggleStatus('active')}
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm"
                                >
                                    Activate ({selectedUsers.size})
                                </button>
                                <button
                                    onClick={() => handleBulkToggleStatus('inactive')}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm"
                                >
                                    Deactivate ({selectedUsers.size})
                                </button>
                                <button
                                    onClick={() => handleBulkToggleStatus('suspended')}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-sm"
                                >
                                    Suspend ({selectedUsers.size})
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => {
                                setIsCreatingUser(true);
                                setEditingUser(null);
                                resetForm();
                            }}
                            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                        >
                            + Create User
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Create/Edit User Form */}
            {(isCreatingUser || editingUser) && (
                <div className="bg-white rounded-lg shadow-md p-6" id="user-form">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {editingUser ? 'Edit User' : 'Create New User'}
                    </h3>
                    <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Primary Role *
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                >
                                    <option value="donor">Donor</option>
                                    <option value="recipient">Recipient</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Status
                                </label>
                                <select
                                    value={formData.accountStatus || 'active'}
                                    onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value as UserAccountStatus })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="banned">Banned</option>
                                    <option value="pending_verification">Pending Verification</option>
                                </select>
                            </div>
                            {roles.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        System Role
                                    </label>
                                    <select
                                        value={formData.roleId || ''}
                                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value || undefined })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">None</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                value={formData.bio || ''}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                placeholder="User bio/profile description..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                            >
                                {editingUser ? 'Update User' : 'Create User'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingUser(false);
                                    setEditingUser(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Users List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No users found.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Verification
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Activity
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((userItem) => (
                                    <tr key={userItem.id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(userItem.id)}
                                                onChange={() => handleSelectUser(userItem.id)}
                                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={userItem.avatarUrl} alt={userItem.name} className="h-10 w-10 rounded-full" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                                    <div className="text-sm text-gray-500">{userItem.email}</div>
                                                    {userItem.phoneNumber && (
                                                        <div className="text-xs text-gray-400">{userItem.phoneNumber}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    userItem.role === 'donor' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {userItem.role}
                                                </span>
                                                {userItem.roles && userItem.roles.length > 1 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{userItem.roles.length - 1} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                (userItem.accountStatus || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                                                (userItem.accountStatus || 'active') === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                (userItem.accountStatus || 'active') === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {userItem.accountStatus || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {userItem.verificationStatus && (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    userItem.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                                    userItem.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {userItem.verificationStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {userItem.lastActivityAt ? (
                                                <div>
                                                    <div>{new Date(userItem.lastActivityAt).toLocaleDateString()}</div>
                                                    <div className="text-xs">{new Date(userItem.lastActivityAt).toLocaleTimeString()}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Never</span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewUser(userItem)}
                                                    className="text-blue-600 hover:text-blue-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="View Details"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => handleEditUser(userItem)}
                                                    className="text-teal-600 hover:text-teal-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                {userItem.verificationStatus === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerifyUser(userItem.id)}
                                                            className="text-green-600 hover:text-green-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                            title="Verify"
                                                        >
                                                            ✅
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectVerification(userItem.id)}
                                                            className="text-red-600 hover:text-red-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                            title="Reject"
                                                        >
                                                            ❌
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleToggleStatus(userItem.id, userItem.accountStatus)}
                                                    className={(userItem.accountStatus || 'active') === 'active' ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}
                                                    title={(userItem.accountStatus || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {(userItem.accountStatus || 'active') === 'active' ? '👁️' : '✅'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewHistory(userItem.id)}
                                                    className="text-purple-600 hover:text-purple-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="View History"
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(userItem.id)}
                                                    className="text-red-600 hover:text-red-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredUsers.map((userItem) => (
                            <div key={userItem.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.has(userItem.id)}
                                            onChange={() => handleSelectUser(userItem.id)}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1"
                                        />
                                        <img src={userItem.avatarUrl} alt={userItem.name} className="h-12 w-12 rounded-full flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 truncate">{userItem.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{userItem.email}</div>
                                            {userItem.phoneNumber && (
                                                <div className="text-xs text-gray-400 truncate">{userItem.phoneNumber}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                    <div>
                                        <span className="text-gray-600 text-xs block mb-1">Role</span>
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                                                userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                userItem.role === 'donor' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {userItem.role}
                                            </span>
                                            {userItem.roles && userItem.roles.length > 1 && (
                                                <span className="text-xs text-gray-500">
                                                    +{userItem.roles.length - 1} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-xs block mb-1">Status</span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            (userItem.accountStatus || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                                            (userItem.accountStatus || 'active') === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                            (userItem.accountStatus || 'active') === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {userItem.accountStatus || 'active'}
                                        </span>
                                    </div>
                                    {userItem.verificationStatus && (
                                        <div>
                                            <span className="text-gray-600 text-xs block mb-1">Verification</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                userItem.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                                userItem.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {userItem.verificationStatus}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600 text-xs block mb-1">Last Activity</span>
                                        {userItem.lastActivityAt ? (
                                            <div className="text-xs text-gray-900">
                                                <div>{new Date(userItem.lastActivityAt).toLocaleDateString()}</div>
                                                <div className="text-gray-500">{new Date(userItem.lastActivityAt).toLocaleTimeString()}</div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Never</span>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleViewUser(userItem)}
                                            className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium min-h-[44px]"
                                            title="View Details"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(userItem)}
                                            className="px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-md text-sm font-medium min-h-[44px]"
                                            title="Edit"
                                        >
                                            Edit
                                        </button>
                                        {userItem.verificationStatus === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleVerifyUser(userItem.id)}
                                                    className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-md text-sm font-medium min-h-[44px]"
                                                    title="Verify"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => handleRejectVerification(userItem.id)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium min-h-[44px]"
                                                    title="Reject"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleToggleStatus(userItem.id, userItem.accountStatus)}
                                            className={`px-3 py-2 rounded-md text-sm font-medium min-h-[44px] ${
                                                (userItem.accountStatus || 'active') === 'active' 
                                                    ? 'text-gray-600 hover:bg-gray-50' 
                                                    : 'text-green-600 hover:bg-green-50'
                                            }`}
                                            title={(userItem.accountStatus || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                                        >
                                            {(userItem.accountStatus || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleViewHistory(userItem.id)}
                                            className="px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-md text-sm font-medium min-h-[44px]"
                                            title="View History"
                                        >
                                            History
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(userItem.id)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium min-h-[44px]"
                                            title="Delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
    
    const renderTagsTab = () => (
        <div className="space-y-6">
            <p className="text-gray-500">Tag management coming soon...</p>
        </div>
    );
    
    const renderStatisticsTab = () => (
        <div className="space-y-6">
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{statistics.totalUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-500">Active Users</p>
                        <p className="text-3xl font-bold text-green-600">{statistics.activeUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-500">Verified Users</p>
                        <p className="text-3xl font-bold text-blue-600">{statistics.verifiedUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-500">Pending Verification</p>
                        <p className="text-3xl font-bold text-yellow-600">{statistics.pendingVerification}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-500">Unverified Users</p>
                        <p className="text-3xl font-bold text-red-600">{statistics.unverifiedUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-500">Recent Registrations (7 days)</p>
                        <p className="text-3xl font-bold text-teal-600">{statistics.recentRegistrations}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 col-span-1 md:col-span-2">
                        <p className="text-sm text-gray-500 mb-4">Users by Role</p>
                        <div className="space-y-2">
                            {statistics.usersByRole.map((item) => (
                                <div key={item.role} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 capitalize">{item.role}</span>
                                    <span className="text-lg font-bold text-gray-900">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage all users, roles, and permissions</p>
            </div>
            
            {/* Error and Success Messages */}
            {error && (
                <div className="mb-4 bg-red-100 text-red-800 p-4 rounded-md">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            {success && (
                <div className="mb-4 bg-green-100 text-green-800 p-4 rounded-md">
                    <p className="font-semibold">Success</p>
                    <p>{success}</p>
                </div>
            )}
            
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                activeTab === 'users'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('tags')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                activeTab === 'tags'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Tags
                        </button>
                        <button
                            onClick={() => setActiveTab('statistics')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                activeTab === 'statistics'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Statistics
                        </button>
                    </nav>
                </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'tags' && renderTagsTab()}
            {activeTab === 'statistics' && renderStatisticsTab()}
            
            {/* User Details Modal */}
            {viewingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                            <button
                                onClick={() => {
                                    setViewingUser(null);
                                    setUserDependencies(null);
                                    setUserHistory([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <img src={viewingUser.avatarUrl} alt={viewingUser.name} className="h-16 w-16 rounded-full" />
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{viewingUser.name}</h4>
                                    <p className="text-sm text-gray-500">{viewingUser.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium">{viewingUser.role}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-medium">{viewingUser.accountStatus || 'active'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="font-medium">{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Login</p>
                                    <p className="font-medium">{viewingUser.lastLoginAt ? new Date(viewingUser.lastLoginAt).toLocaleDateString() : 'Never'}</p>
                                </div>
                            </div>
                            {userDependencies && (
                                <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">Dependencies</h5>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Donations: {userDependencies.donations}</div>
                                        <div>Requests: {userDependencies.requests}</div>
                                        <div>Matches: {userDependencies.matches}</div>
                                        <div>Communications: {userDependencies.communications}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">User Change History</h3>
                            <button
                                onClick={() => {
                                    setShowHistory(false);
                                    setUserHistory([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            {userHistory.length === 0 ? (
                                <p className="text-gray-500">No change history available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {userHistory.map((history) => (
                                        <div key={history.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900 capitalize">{history.action}</p>
                                                    <p className="text-sm text-gray-500">
                                                        By {history.performedBy} on {new Date(history.performedAt).toLocaleString()}
                                                    </p>
                                                    {history.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

