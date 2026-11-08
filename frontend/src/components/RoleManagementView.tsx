import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Permission, RoleDefinition, PERMISSION_METADATA } from '../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Trash2,
  Check,
  Info,
  Sliders,
  Award
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Heritage Gold', hex: '#C5A059' },
  { name: 'Emerald Horology', hex: '#10B981' },
  { name: 'Royal Sapphire', hex: '#3B82F6' },
  { name: 'Imperial Amethyst', hex: '#8B5CF6' },
  { name: 'Crimson Ruby', hex: '#EF4444' },
  { name: 'Titanium Slate', hex: '#64748B' }
];

export const RoleManagementView: React.FC = () => {
  const {
    roles,
    createRole,
    updateRolePermissions,
    deleteRole,
    resetRolesToDefault,
    hasPermission,
    currentUser,
    setActiveTab
  } = useMarketplace();

  // Access check: only users with 'manage_roles'
  const canManageRoles = hasPermission('manage_roles');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');

  // Create Role Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState(COLOR_PRESETS[0].hex);
  const [newRolePermissions, setNewRolePermissions] = useState<Permission[]>([
    'marketplace_access',
    'wishlist_access'
  ]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete Role confirmation modal
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  // Reset to default confirmation modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // All 13 permissions
  const allPermissions = useMemo<Permission[]>(() => {
    return Object.keys(PERMISSION_METADATA) as Permission[];
  }, []);

  // Group permissions by category
  const categorizedPermissions = useMemo<Record<string, Permission[]>>(() => {
    const categories: Record<string, Permission[]> = {};
    allPermissions.forEach((perm) => {
      const meta = PERMISSION_METADATA[perm];
      const cat = meta?.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(perm);
    });
    return categories;
  }, [allPermissions]);

  // Auto-generate slug when role name changes if user hasn't manually typed slug
  const handleNameChange = (name: string) => {
    setNewRoleName(name);
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setNewRoleId(slug);
  };

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      // Type filter
      if (filterType === 'system' && !role.isSystem) return false;
      if (filterType === 'custom' && role.isSystem) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = role.name.toLowerCase().includes(q);
      const matchId = role.id.toLowerCase().includes(q);
      const matchDesc = role.description.toLowerCase().includes(q);
      const matchPerm = role.permissions.some((p) => p.toLowerCase().includes(q));
      return matchName || matchId || matchDesc || matchPerm;
    });
  }, [roles, filterType, searchQuery]);

  // Metrics
  const systemRoleCount = useMemo(() => roles.filter((r) => r.isSystem).length, [roles]);
  const customRoleCount = useMemo(() => roles.filter((r) => !r.isSystem).length, [roles]);

  // Toggle permission for existing role
  const handleTogglePermission = (role: RoleDefinition, permission: Permission) => {
    // If admin role and manage_roles, prevent removing to avoid lock-out
    if (role.id === 'admin' && permission === 'manage_roles') {
      return;
    }

    const has = role.permissions.includes(permission);
    const updated = has
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];

    updateRolePermissions(role.id, updated);
  };

  // Grant all permissions to a role
  const handleGrantAll = (role: RoleDefinition) => {
    updateRolePermissions(role.id, [...allPermissions]);
  };

  // Revoke all permissions from a role (keeps manage_roles for admin)
  const handleRevokeAll = (role: RoleDefinition) => {
    if (role.id === 'admin') {
      updateRolePermissions(role.id, ['manage_roles']);
    } else {
      updateRolePermissions(role.id, []);
    }
  };

  // Submit Create Role
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const slug = newRoleId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!slug) {
      setCreateError('Role identifier slug is required.');
      return;
    }
    if (!newRoleName.trim()) {
      setCreateError('Role display name is required.');
      return;
    }
    if (roles.some((r) => r.id.toLowerCase() === slug)) {
      setCreateError(`A role with identifier "${slug}" already exists.`);
      return;
    }

    setIsCreatingRole(true);
    const res = createRole({
      id: slug,
      name: newRoleName.trim(),
      description: newRoleDescription.trim() || `Custom role with ${newRolePermissions.length} granted permissions.`,
      permissions: newRolePermissions,
      color: newRoleColor
    });

    setIsCreatingRole(false);
    if (res.success) {
      setIsCreateModalOpen(false);
      setNewRoleName('');
      setNewRoleId('');
      setNewRoleDescription('');
      setNewRolePermissions(['marketplace_access', 'wishlist_access']);
    } else {
      setCreateError(res.message);
    }
  };

  // Confirm Delete Custom Role
  const handleConfirmDelete = () => {
    if (!roleToDelete) return;
    setIsDeletingRole(true);
    deleteRole(roleToDelete.id);
    setIsDeletingRole(false);
    setRoleToDelete(null);
  };

  // Confirm Reset Defaults
  const handleConfirmReset = () => {
    resetRolesToDefault();
    setIsResetConfirmOpen(false);
  };

  // Access Denied Fallback
  if (!canManageRoles) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FAF8F5] border border-amber-300/80 rounded-3xl p-8 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-600">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1C1917]">Administrative Privilege Required</h2>
          <p className="text-xs text-[#78716C] leading-relaxed">
            The Role & Permission Atelier is restricted to authorized platform administrators with{' '}
            <code className="text-[#C5A059] bg-[#EDE8E0] px-1.5 py-0.5 rounded font-mono">manage_roles</code>{' '}
            privileges.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('explore')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D2A26] hover:bg-[#1C1917] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Return to Marketplace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-24 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="border-b border-[#DDD6CB] bg-[#FAF8F5]/80 backdrop-blur-md sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#C5A059] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>THC Security Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] mt-1">
                Role & Permission Atelier
              </h1>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1 max-w-2xl">
                Define custom horological roles, grant or revoke granular feature capabilities, and govern access control policies.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DDD6CB] hover:bg-[#EDE8E0] text-xs font-semibold text-[#57534E] shadow-xs transition-colors"
                title="Restore default system roles"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#78716C]" />
                <span>Restore Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-semibold tracking-wide shadow-sm transition-all hover:shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Role</span>
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
            <div className="p-4 rounded-2xl bg-white border border-[#DDD6CB] shadow-xs">
              <div className="text-[11px] font-mono tracking-wider uppercase text-[#78716C]">Total Roles</div>
              <div className="text-2xl font-serif font-bold text-[#1C1917] mt-1 flex items-baseline gap-2">
                <span>{roles.length}</span>
                <span className="text-[11px] font-normal text-[#78716C]">active</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DDD6CB] shadow-xs">
              <div className="text-[11px] font-mono tracking-wider uppercase text-[#78716C]">System Roles</div>
              <div className="text-2xl font-serif font-bold text-[#1C1917] mt-1 flex items-baseline gap-2">
                <span>{systemRoleCount}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Immutable
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DDD6CB] shadow-xs">
              <div className="text-[11px] font-mono tracking-wider uppercase text-[#78716C]">Custom Roles</div>
              <div className="text-2xl font-serif font-bold text-[#1C1917] mt-1 flex items-baseline gap-2">
                <span>{customRoleCount}</span>
                <span className="text-[10px] font-bold uppercase text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded">
                  Dynamic
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DDD6CB] shadow-xs">
              <div className="text-[11px] font-mono tracking-wider uppercase text-[#78716C]">Total Permissions</div>
              <div className="text-2xl font-serif font-bold text-[#1C1917] mt-1 flex items-baseline gap-2">
                <span>{allPermissions.length}</span>
                <span className="text-[11px] font-normal text-[#78716C]">capabilities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#DDD6CB] shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter roles by name, slug code, or permission capability..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-[#1C1917]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#DDD6CB]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              All ({roles.length})
            </button>
            <button
              onClick={() => setFilterType('system')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'system'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              System ({systemRoleCount})
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'custom'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Custom ({customRoleCount})
            </button>
          </div>
        </div>

        {/* Roles List */}
        {filteredRoles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#DDD6CB] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EDE8E0] flex items-center justify-center mx-auto text-[#78716C]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#1C1917]">No Roles Found</h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              No roles match your search filter "{searchQuery}". Try a different keyword or create a new custom role.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRoles.map((role) => {
              const grantedCount = role.permissions.length;
              const isFullAdmin = role.id === 'admin';

              return (
                <div
                  key={role.id}
                  className="bg-white rounded-3xl border border-[#DDD6CB] shadow-xs hover:border-[#C5A059]/60 transition-all overflow-hidden"
                >
                  {/* Role Header */}
                  <div className="p-6 border-b border-[#DDD6CB] bg-[#FAF8F5]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: role.color || '#C5A059' }}
                      >
                        {role.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-lg font-serif font-bold text-[#1C1917]">{role.name}</h2>
                          <code className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#EDE8E0] text-[#57534E] font-semibold">
                            id: {role.id}
                          </code>
                          {role.isSystem ? (
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
                              System Preset
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#85642F] bg-[#C5A059]/20 border border-[#C5A059]/40 px-2 py-0.5 rounded-full">
                              Custom Role
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                      <div className="text-right mr-1">
                        <div className="text-xs font-semibold text-[#1C1917]">
                          {grantedCount} of {allPermissions.length}
                        </div>
                        <div className="text-[10px] text-[#78716C]">granted permissions</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGrantAll(role)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition-colors"
                        title="Grant all 13 permissions"
                      >
                        Grant All
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRevokeAll(role)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-colors"
                        title="Revoke all non-essential permissions"
                      >
                        Revoke All
                      </button>

                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={() => setRoleToDelete(role)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete custom role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interactive Permission Matrix */}
                  <div className="p-6 space-y-6">
                    {(Object.entries(categorizedPermissions) as [string, Permission[]][]).map(([category, perms]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C5A059]">
                            {category}
                          </span>
                          <div className="h-px bg-[#EDE8E0] flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {perms.map((perm) => {
                            const meta = PERMISSION_METADATA[perm];
                            const isChecked = role.permissions.includes(perm);
                            const isLockedAdminRole = isFullAdmin && perm === 'manage_roles';

                            return (
                              <label
                                key={perm}
                                onClick={(e) => {
                                  if (isLockedAdminRole) {
                                    e.preventDefault();
                                    return;
                                  }
                                }}
                                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? 'bg-[#C5A059]/5 border-[#C5A059]/40 hover:border-[#C5A059]'
                                    : 'bg-[#FAF8F5]/60 border-[#DDD6CB] hover:bg-[#FAF8F5] opacity-75 hover:opacity-100'
                                } ${isLockedAdminRole ? 'cursor-not-allowed' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isLockedAdminRole}
                                  onChange={() => handleTogglePermission(role, perm)}
                                  className="mt-0.5 rounded border-[#DDD6CB] text-[#C5A059] focus:ring-[#C5A059] w-4 h-4 cursor-pointer"
                                />

                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-xs font-semibold text-[#1C1917]">
                                      {meta?.label || perm}
                                    </span>
                                    {isLockedAdminRole && (
                                      <span
                                        className="text-[9px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5"
                                        title="Mandatory for platform administration"
                                      >
                                        <Lock className="w-2.5 h-2.5" /> Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-mono text-[#78716C]">
                                    {perm}
                                  </div>
                                  <p className="text-[11px] text-[#57534E] leading-relaxed">
                                    {meta?.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= CREATE NEW ROLE MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#DDD6CB] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DDD6CB] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1C1917]">Create Custom Role</h3>
                  <p className="text-xs text-[#78716C]">
                    Define a tailored organizational role and choose its permissions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E0]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                    Role Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Master Watchmaker"
                    className="w-full px-3.5 py-2 bg-white border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                    Role Identifier Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value)}
                    placeholder="e.g. master_watchmaker"
                    className="w-full px-3.5 py-2 bg-white border border-[#DDD6CB] rounded-xl text-xs font-mono text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Summarize the responsibilities and scope of this role..."
                  className="w-full px-3.5 py-2 bg-white border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#57534E] mb-1.5">
                  Badge Color Accent
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewRoleColor(color.hex)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        newRoleColor === color.hex
                          ? 'border-[#1C1917] bg-white shadow-xs font-bold'
                          : 'border-transparent bg-white/60 hover:bg-white'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[11px] text-[#57534E]">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Permissions Selection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-[#57534E]">
                    Assign Permissions ({newRolePermissions.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRolePermissions([...allPermissions])}
                      className="text-[11px] text-[#C5A059] hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-[#DDD6CB]">|</span>
                    <button
                      type="button"
                      onClick={() => setNewRolePermissions([])}
                      className="text-[11px] text-[#78716C] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#DDD6CB] max-h-60 overflow-y-auto space-y-4">
                  {(Object.entries(categorizedPermissions) as [string, Permission[]][]).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <div className="text-[10px] font-mono uppercase font-bold text-[#C5A059] tracking-wider">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = newRolePermissions.includes(p);
                          const meta = PERMISSION_METADATA[p];
                          return (
                            <label
                              key={p}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-[#C5A059]/10 border-[#C5A059]/50'
                                  : 'bg-[#FAF8F5]/60 border-[#DDD6CB]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRolePermissions((prev) => [...prev, p]);
                                  } else {
                                    setNewRolePermissions((prev) => prev.filter((item) => item !== p));
                                  }
                                }}
                                className="mt-0.5 rounded border-[#DDD6CB] text-[#C5A059] focus:ring-[#C5A059] w-3.5 h-3.5"
                              />
                              <div>
                                <div className="font-semibold text-[#1C1917] text-[11px]">
                                  {meta?.label || p}
                                </div>
                                <div className="text-[10px] text-[#78716C] font-mono">{p}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#DDD6CB]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#57534E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRole}
                  className="px-5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#b08d4b] text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {isCreatingRole ? 'Creating Role...' : 'Register Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-rose-300 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3.5 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1C1917]">Delete Custom Role</h3>
                <p className="text-xs text-rose-600 font-medium">Irreversible removal</p>
              </div>
            </div>

            <p className="text-xs text-[#78716C] leading-relaxed">
              Are you sure you want to delete role <strong>"{roleToDelete.name}"</strong> (slug:{' '}
              <code className="font-mono text-[#1C1917]">{roleToDelete.id}</code>)? Any users or personas assigned to this role will lose its custom permissions and fall back to baseline.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DDD6CB]">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#57534E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingRole}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isDeletingRole ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESET TO DEFAULTS CONFIRMATION MODAL ================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-amber-300 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3.5 text-amber-600">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1C1917]">Restore Default Roles</h3>
                <p className="text-xs text-amber-600 font-medium">Reverts permissions to baseline</p>
              </div>
            </div>

            <p className="text-xs text-[#78716C] leading-relaxed">
              This action will reset the 5 system roles (Buyer, Collector, Seller, Admin, Service Executive) to their canonical permission sets. Any custom roles created will be preserved or reset.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DDD6CB]">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#57534E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#b08d4b] text-xs font-semibold text-white"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
