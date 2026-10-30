import React, { useState, useEffect, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserLogin, UserAccount, UserRole } from '../types';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Trash2,
  Edit3,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  Lock,
  Wrench,
  Store,
  Clock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const {
    currentLogin,
    currentUser,
    isAdmin,
    isServiceExecutive,
    canManageUsers,
    allLogins,
    loadAllLogins,
    updateUserStatus,
    resetUserPassword,
    updateUserLogin,
    deleteUserLogin,
    updateUserPersonaRole,
    deleteUserPersona,
    createPersonaForUser,
    setActiveTab,
    isGatewayConnected
  } = useMarketplace();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Edit User Modal State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<(UserLogin & { accounts: UserAccount[]; isActive?: boolean }) | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Persona Management inside User Modal
  const [editingPersonaId, setEditingPersonaId] = useState<string | number | null>(null);
  const [editPersonaRole, setEditPersonaRole] = useState<UserRole>('buyer');
  const [editPersonaName, setEditPersonaName] = useState('');
  const [isSavingPersonaRole, setIsSavingPersonaRole] = useState(false);

  // Add Persona Modal / Form State
  const [isAddPersonaOpen, setIsAddPersonaOpen] = useState(false);
  const [newPersonaTargetUserId, setNewPersonaTargetUserId] = useState<string | number | null>(null);
  const [newPersonaRole, setNewPersonaRole] = useState<UserRole>('buyer');
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaBio, setNewPersonaBio] = useState('');
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);

  // Delete User Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState<(UserLogin & { accounts: UserAccount[]; isActive?: boolean }) | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Delete Persona Confirmation Modal State
  const [personaToDelete, setPersonaToDelete] = useState<{ persona: UserAccount; user: UserLogin & { accounts: UserAccount[] } } | null>(null);
  const [isDeletingPersona, setIsDeletingPersona] = useState(false);

  // Load logins on mount
  useEffect(() => {
    if (canManageUsers) {
      setIsLoading(true);
      loadAllLogins().finally(() => setIsLoading(false));
    }
  }, [canManageUsers, loadAllLogins]);

  // Keep selectedUserForEdit in sync with updated allLogins
  useEffect(() => {
    if (selectedUserForEdit) {
      const refreshed = allLogins.find((l) => String(l.id) === String(selectedUserForEdit.id));
      if (refreshed) {
        setSelectedUserForEdit(refreshed);
      }
    }
  }, [allLogins]);

  // Open Edit User Modal
  const handleOpenEditUser = (user: UserLogin & { accounts: UserAccount[]; isActive?: boolean }) => {
    setSelectedUserForEdit(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditIsActive(user.isActive !== false);
    setNewPasswordInput('');
    setShowPassword(false);
    setEditingPersonaId(null);
  };

  // Save User Credentials & Status
  const handleSaveUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setIsUpdatingUser(true);
    try {
      const ok = await updateUserLogin(selectedUserForEdit.id, {
        username: editUsername.trim(),
        email: editEmail.trim(),
        isActive: editIsActive
      });
      if (ok) {
        setSelectedUserForEdit((prev) => prev ? { ...prev, username: editUsername.trim(), email: editEmail.trim(), isActive: editIsActive } : null);
      }
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Toggle user status quickly from list
  const handleToggleStatus = async (user: UserLogin & { accounts: UserAccount[]; isActive?: boolean }) => {
    const newStatus = user.isActive === false;
    await updateUserStatus(user.id, newStatus);
  };

  // Reset User Password (Admin Direct Reset)
  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !newPasswordInput.trim()) return;
    if (newPasswordInput.length < 6) return;
    setIsUpdatingPassword(true);
    try {
      const res = await resetUserPassword(selectedUserForEdit.id, newPasswordInput.trim());
      if (res.success) {
        setNewPasswordInput('');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Save Persona Role Update
  const handleSavePersonaRole = async (personaId: string | number) => {
    setIsSavingPersonaRole(true);
    try {
      await updateUserPersonaRole(personaId, editPersonaRole);
      setEditingPersonaId(null);
    } finally {
      setIsSavingPersonaRole(false);
    }
  };

  // Confirm Delete Persona
  const handleConfirmDeletePersona = async () => {
    if (!personaToDelete) return;
    setIsDeletingPersona(true);
    try {
      await deleteUserPersona(personaToDelete.persona.id);
      setPersonaToDelete(null);
    } finally {
      setIsDeletingPersona(false);
    }
  };

  // Confirm Delete User Entirely
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const ok = await deleteUserLogin(userToDelete.id);
      if (ok) {
        setUserToDelete(null);
        if (selectedUserForEdit && String(selectedUserForEdit.id) === String(userToDelete.id)) {
          setSelectedUserForEdit(null);
        }
      }
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Submit Add Persona
  const handleCreatePersonaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonaTargetUserId || !newPersonaName.trim()) return;
    setIsCreatingPersona(true);
    try {
      const ok = await createPersonaForUser(
        newPersonaTargetUserId,
        newPersonaRole,
        newPersonaName.trim(),
        newPersonaBio.trim()
      );
      if (ok) {
        setIsAddPersonaOpen(false);
        setNewPersonaName('');
        setNewPersonaBio('');
        setNewPersonaRole('buyer');
      }
    } finally {
      setIsCreatingPersona(false);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return allLogins.filter((user) => {
      // Status filter
      if (statusFilter === 'active' && user.isActive === false) return false;
      if (statusFilter === 'inactive' && user.isActive !== false) return false;

      // Role filter
      if (roleFilter !== 'all') {
        const hasRole = (user.accounts || []).some(
          (a) => a.role === roleFilter || (roleFilter === 'service_executive' && (a.role as string) === 'serviceexecutive')
        );
        if (!hasRole) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesUsername = user.username.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesPersona = (user.accounts || []).some(
          (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
        );
        if (!matchesUsername && !matchesEmail && !matchesPersona) return false;
      }

      return true;
    });
  }, [allLogins, statusFilter, roleFilter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalUsers = allLogins.length;
    const activeUsers = allLogins.filter((l) => l.isActive !== false).length;
    const deactivatedUsers = totalUsers - activeUsers;

    let totalPersonas = 0;
    let serviceExecutives = 0;
    let admins = 0;

    allLogins.forEach((l) => {
      (l.accounts || []).forEach((a) => {
        totalPersonas++;
        if (a.role === 'service_executive' || (a.role as string) === 'serviceexecutive') {
          serviceExecutives++;
        }
        if (a.role === 'admin') {
          admins++;
        }
      });
    });

    return { totalUsers, activeUsers, deactivatedUsers, totalPersonas, serviceExecutives, admins };
  }, [allLogins]);

  // Role badge helper
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Admin
          </span>
        );
      case 'service_executive':
      case 'serviceexecutive':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Wrench className="w-3 h-3 text-emerald-600" />
            Service Exec
          </span>
        );
      case 'seller':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#85642F] border border-[#C5A880]/40">
            <Store className="w-3 h-3 text-[#967139]" />
            Seller
          </span>
        );
      case 'collector':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <Award className="w-3 h-3 text-purple-600" />
            Collector
          </span>
        );
      case 'buyer':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Buyer
          </span>
        );
    }
  };

  // Security gate: only admin and service executive can view
  if (!canManageUsers) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1C1917]">Access Restricted</h2>
        <p className="text-sm text-[#78716C] mt-2 leading-relaxed">
          The User Management dashboard is strictly reserved for Platform Administrators and Service Executives of The Heritage Club (THC).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('explore')}
            className="px-5 py-2.5 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-semibold hover:bg-[#3D3A36] transition-colors"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1C1917] via-[#2D2A26] to-[#1C1917] rounded-3xl p-6 sm:p-8 text-[#FAF8F5] border border-[#3D3A36] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(197,168,128,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#C5A880] uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>THC User Administration Atelier</span>
              <span className="text-[#78716C]">•</span>
              <span className="text-emerald-400">
                {isAdmin ? 'Platform Administrator Mode' : 'Service Executive Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF8F5] tracking-tight">
              User & Horologist Management Directory
            </h1>
            <p className="text-sm text-[#B8AEA3] max-w-2xl leading-relaxed">
              Supervise registered THC collector logins, toggle active accounts, reset passwords, manage personas, and configure permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsLoading(true);
                loadAllLogins().finally(() => setIsLoading(false));
              }}
              disabled={isLoading}
              title="Refresh User Directory from Microservice"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#FAF8F5] text-xs font-medium border border-[#FAF8F5]/15 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C5A880] ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Refresh Directory'}</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-[#FAF8F5]/10 text-xs">
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px]">Total Logins</div>
            <div className="text-xl font-serif font-bold text-[#FAF8F5] mt-1">{stats.totalUsers}</div>
          </div>
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px]">Active Accounts</div>
            <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{stats.activeUsers}</div>
          </div>
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px]">Deactivated Users</div>
            <div className="text-xl font-serif font-bold text-rose-400 mt-1">{stats.deactivatedUsers}</div>
          </div>
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px]">Executives & Admins</div>
            <div className="text-xl font-serif font-bold text-[#C5A880] mt-1">
              {stats.serviceExecutives + stats.admins}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by username, email, persona name, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] placeholder-[#8C7D70] focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:bg-[#FAF8F5] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7D70] hover:text-[#1C1917] text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-[#EDE8E0]/60 px-3 py-1.5 rounded-xl border border-[#DDD6CB]">
            <Filter className="w-3.5 h-3.5 text-[#78716C]" />
            <span className="text-[#78716C] font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-transparent text-[#1C1917] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="service_executive">Service Executive</option>
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
              <option value="collector">Collector</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#EDE8E0]/60 px-3 py-1.5 rounded-xl border border-[#DDD6CB]">
            <span className="text-[#78716C] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-[#1C1917] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List Table / Cards */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C5A880]" />
            <h2 className="text-lg font-serif font-bold text-[#1C1917]">Registered THC Users</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EDE8E0] text-[#78716C] font-mono">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-[#78716C]">
            <Users className="w-10 h-10 mx-auto text-[#DDD6CB] mb-3" />
            <p className="text-sm font-medium">No users found matching your filters.</p>
            <p className="text-xs mt-1 text-[#8C7D70]">Try clearing search or relaxing filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5DFD5]">
            {filteredUsers.map((user) => {
              const isCurrentUserLogin = String(user.id) === String(currentLogin.id);
              const isActive = user.isActive !== false;
              const accountsCount = (user.accounts || []).length;

              return (
                <div
                  key={user.id}
                  className={`p-5 sm:p-6 transition-colors ${
                    !isActive ? 'bg-rose-50/20' : 'hover:bg-[#EDE8E0]/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Identity Column */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#2D2A26] text-[#C5A880] flex items-center justify-center font-serif text-base font-bold shadow-xs shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-[#1C1917]">{user.username}</span>
                          <span className="text-[11px] font-mono text-[#8C7D70]">ID #{user.id}</span>
                          
                          {/* Active / Inactive Badge */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={`Click to ${isActive ? 'deactivate' : 'activate'} user`}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{isActive ? 'Active' : 'Deactivated'}</span>
                          </button>

                          {isCurrentUserLogin && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#C5A880]/20 text-[#85642F] border border-[#C5A880]/40">
                              Current Session
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[#8C7D70]" />
                            {user.email}
                          </span>
                          {user.lastLoginAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#8C7D70]" />
                              Last seen {new Date(user.lastLoginAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Column */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <button
                        onClick={() => {
                          setNewPersonaTargetUserId(user.id);
                          setIsAddPersonaOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD6CB] bg-[#EDE8E0]/70 hover:bg-[#E2DCD2] text-xs font-medium text-[#1C1917] transition-colors"
                        title="Add Role Persona"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#967139]" />
                        <span className="hidden sm:inline">Add Persona</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditUser(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1917] hover:bg-[#3D3A36] text-xs font-semibold text-[#FAF8F5] transition-colors shadow-xs"
                        title="Edit User, Roles, Password & Status"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Edit User</span>
                      </button>

                      <button
                        onClick={() => setUserToDelete(user)}
                        disabled={isCurrentUserLogin}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                          isCurrentUserLogin
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                            : 'border-rose-200 text-rose-700 hover:bg-rose-50 bg-rose-50/30'
                        }`}
                        title={isCurrentUserLogin ? 'Cannot delete your active login session' : 'Delete user entirely'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete User</span>
                      </button>
                    </div>
                  </div>

                  {/* Personas Sub-section */}
                  <div className="mt-4 pt-4 border-t border-[#E5DFD5]/60 pl-2 sm:pl-14">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[#8C7D70] mb-2.5 flex items-center justify-between">
                      <span>Associated Personas ({accountsCount})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {(user.accounts || []).map((account) => (
                        <div
                          key={account.id}
                          className="bg-white/80 p-3 rounded-2xl border border-[#E5DFD5] shadow-2xs flex flex-col justify-between gap-2 hover:border-[#C5A880]/50 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={account.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                                alt={account.name}
                                className="w-7 h-7 rounded-full object-cover border border-[#DDD6CB] shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[#1C1917] truncate">{account.name}</div>
                                <div className="text-[10px] text-[#78716C] truncate">{account.email}</div>
                              </div>
                            </div>
                            <div>{getRoleBadge(account.role)}</div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE1] text-[11px] text-[#78716C]">
                            <span className="truncate max-w-[120px]">{account.location || 'Global'}</span>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setSelectedUserForEdit(user);
                                  setEditingPersonaId(account.id);
                                  setEditPersonaRole(account.role as UserRole);
                                  setEditPersonaName(account.name);
                                }}
                                className="p-1 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E0] transition-colors"
                                title="Change Persona Role"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setPersonaToDelete({ persona: account, user })}
                                disabled={accountsCount <= 1}
                                className={`p-1 rounded-lg transition-colors ${
                                  accountsCount <= 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-rose-600 hover:bg-rose-50'
                                }`}
                                title={accountsCount <= 1 ? 'Cannot delete sole persona' : 'Delete persona'}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= EDIT USER MODAL ================= */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#DDD6CB] shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5DFD5] pb-4">
              <div>
                <div className="text-[11px] font-mono tracking-widest text-[#C5A880] uppercase">
                  User Management Atelier
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1C1917] mt-0.5">
                  Edit User: @{selectedUserForEdit.username}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="p-1 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E0] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Section 1: User Account Credentials & Status */}
            <form onSubmit={handleSaveUserDetails} className="space-y-4">
              <h4 className="text-xs font-serif font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#C5A880]" />
                User Login Credentials & Active Status
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#57534E] mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#57534E] mb-1">Login Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              {/* Active / Inactive Switch */}
              <div className="bg-[#EDE8E0]/60 p-3.5 rounded-2xl border border-[#DDD6CB] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1C1917]">User Login Active Status</span>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    Deactivated users are immediately prevented from logging into The Heritage Club.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    editIsActive ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      editIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#3D3A36] text-xs font-semibold text-[#FAF8F5] transition-colors"
                >
                  {isUpdatingUser ? 'Saving...' : 'Save User Details'}
                </button>
              </div>
            </form>

            {/* Section 2: Administrative Direct Password Reset */}
            <div className="pt-4 border-t border-[#E5DFD5] space-y-3">
              <h4 className="text-xs font-serif font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#C5A880]" />
                Change User Password (Administrative Override)
              </h4>
              <p className="text-[11px] text-[#78716C]">
                As an administrator or service executive, you can set a new password directly for this user without needing their previous password.
              </p>

              <form onSubmit={handleAdminResetPassword} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 characters)..."
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingPassword || newPasswordInput.trim().length < 6}
                  className="px-4 py-2 rounded-xl bg-[#2D2A26] hover:bg-[#1C1917] text-xs font-semibold text-[#C5A880] disabled:opacity-50 transition-colors shrink-0"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Section 3: Personas & Roles Management */}
            <div className="pt-4 border-t border-[#E5DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-serif font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#C5A880]" />
                  Personas & Roles ({selectedUserForEdit.accounts.length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setNewPersonaTargetUserId(selectedUserForEdit.id);
                    setIsAddPersonaOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-[#85642F] hover:underline"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>+ Add Persona</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {selectedUserForEdit.accounts.map((acc) => {
                  const isEditingThisPersona = editingPersonaId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-2xl bg-[#EDE8E0]/50 border border-[#DDD6CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={acc.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#DDD6CB]"
                        />
                        <div>
                          <div className="text-xs font-semibold text-[#1C1917] flex items-center gap-2">
                            <span>{acc.name}</span>
                            {acc.isDefault && (
                              <span className="text-[10px] font-mono uppercase bg-[#C5A880]/20 text-[#85642F] px-1.5 py-0.2 rounded font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#78716C]">{acc.email}</div>
                        </div>
                      </div>

                      {/* Role selection & actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isEditingThisPersona ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editPersonaRole}
                              onChange={(e) => setEditPersonaRole(e.target.value as UserRole)}
                              className="px-2.5 py-1 bg-white border border-[#DDD6CB] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                            >
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="collector">Collector</option>
                              <option value="service_executive">Service Executive</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleSavePersonaRole(acc.id)}
                              disabled={isSavingPersonaRole}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                            >
                              {isSavingPersonaRole ? 'Saving...' : 'Apply'}
                            </button>
                            <button
                              onClick={() => setEditingPersonaId(null)}
                              className="px-2 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            {getRoleBadge(acc.role)}
                            <button
                              onClick={() => {
                                setEditingPersonaId(acc.id);
                                setEditPersonaRole(acc.role as UserRole);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-[#DDD6CB] bg-white hover:bg-gray-50 text-xs font-medium text-[#1C1917] transition-colors"
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => setPersonaToDelete({ persona: acc, user: selectedUserForEdit })}
                              disabled={selectedUserForEdit.accounts.length <= 1}
                              className={`p-1.5 rounded-lg transition-colors ${
                                selectedUserForEdit.accounts.length <= 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-rose-600 hover:bg-rose-50'
                              }`}
                              title={selectedUserForEdit.accounts.length <= 1 ? 'Cannot delete sole persona' : 'Delete persona'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#E5DFD5] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="px-5 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#1C1917] transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= ADD PERSONA MODAL ================= */}
      {isAddPersonaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#DDD6CB] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <h3 className="text-base font-serif font-bold text-[#1C1917] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#C5A880]" />
                Add New Role Persona
              </h3>
              <button
                onClick={() => setIsAddPersonaOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePersonaSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#57534E] mb-1">Select Persona Role</label>
                <select
                  value={newPersonaRole}
                  onChange={(e) => setNewPersonaRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                >
                  <option value="buyer">Buyer (Collector & Enthusiast)</option>
                  <option value="seller">Seller (Verified Horological Dealer)</option>
                  <option value="collector">Collector (Private Watch Vault Owner)</option>
                  <option value="service_executive">Service Executive (Watchmaker & Atelier Lead)</option>
                  <option value="admin">Admin (Platform Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#57534E] mb-1">Persona Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Horologist or London Gallery"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#57534E] mb-1">Bio / Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Atelier role notes or specialty..."
                  value={newPersonaBio}
                  onChange={(e) => setNewPersonaBio(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPersonaOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPersona || !newPersonaName.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#3D3A36] text-xs font-semibold text-[#FAF8F5] disabled:opacity-50"
                >
                  {isCreatingPersona ? 'Creating...' : 'Create Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE PERSONA CONFIRMATION MODAL ================= */}
      {personaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1C1917]">Delete Role Persona</h3>
                <p className="text-xs text-[#78716C]">Are you sure you want to remove this persona?</p>
              </div>
            </div>

            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 text-xs text-[#1C1917] space-y-1">
              <div><strong>Persona:</strong> {personaToDelete.persona.name}</div>
              <div><strong>Role:</strong> {personaToDelete.persona.role.toUpperCase()}</div>
              <div><strong>User Account:</strong> @{personaToDelete.user.username}</div>
            </div>

            <p className="text-[11px] text-[#78716C] leading-relaxed">
              This will remove this persona account from the login. Any user must retain at least one persona.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPersonaToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#1C1917]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePersona}
                disabled={isDeletingPersona}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isDeletingPersona ? 'Deleting...' : 'Delete Persona'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE ENTIRE USER CONFIRMATION MODAL ================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-rose-300 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3.5 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1C1917]">Delete User Entirely</h3>
                <p className="text-xs text-rose-600 font-medium">Permanent, irreversible deletion</p>
              </div>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-[#1C1917] space-y-1.5">
              <div><strong>Username:</strong> @{userToDelete.username}</div>
              <div><strong>Email:</strong> {userToDelete.email}</div>
              <div><strong>User ID:</strong> #{userToDelete.id}</div>
              <div><strong>Personas affected:</strong> {(userToDelete.accounts || []).length} personas will be deleted</div>
            </div>

            <p className="text-xs text-[#78716C] leading-relaxed">
              This action will permanently delete user <strong>@{userToDelete.username}</strong> and all associated personas, credentials, and settings from the THC user database. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#1C1917]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-50 shadow-sm"
              >
                {isDeletingUser ? 'Deleting User...' : 'Permanently Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

