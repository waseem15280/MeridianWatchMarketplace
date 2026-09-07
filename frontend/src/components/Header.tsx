import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Watch,
  Heart,
  Store,
  Box,
  ShoppingBag,
  PlusCircle,
  Search,
  SlidersHorizontal,
  ChevronDown,
  User,
  ShieldCheck,
  Star,
  Sparkles,
  Layers
  Layers,
  UserPlus,
  LogIn,
  LogOut,
  X,
  KeyRound,
  CheckCircle,
  Users,
  ShieldAlert
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface HeaderProps {
  onOpenFiltersMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFiltersMobile }) => {
  const {
    currentLogin,
    userAccounts,
    availableLogins,
    currentUser,
    accounts,
    switchUser,
    switchLogin,
    createUserAccount,
    loginUser,
    activeTab,
    setActiveTab,
    wishlist,
    compareList,
    setIsAddListingOpen,
    filters,
    setFilters,
    isGatewayConnected,
    isSyncing,
    refreshData
  } = useMarketplace();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  // Persona Creation Modal State
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountRole, setNewAccountRole] = useState<UserRole>('buyer');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBio, setNewAccountBio] = useState('');
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'seller':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#C5A880]/20 text-[#85642F] border border-[#C5A880]/40">Seller</span>;
      case 'buyer':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Buyer</span>;
      case 'collector':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">Collector</span>;
      case 'admin':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Admin</span>;
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    setIsSubmittingAccount(true);
    try {
      await createUserAccount(newAccountRole, newAccountName, newAccountBio);
      setIsAddAccountModalOpen(false);
      setNewAccountName('');
      setNewAccountBio('');
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);
    try {
      const ok = await loginUser(loginUsername, loginPassword);
      if (ok) {
        setIsLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError('Invalid username or password.');
      }
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'explore', label: 'Marketplace', icon: Watch },
    { id: 'collection', label: 'My Watch Vault', icon: Box },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
    { id: 'seller-hub', label: 'Seller Hub', icon: Store },
    { id: 'orders', label: 'Orders & Offers', icon: ShoppingBag }
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-[#E5DFD5]">
      {/* Top Banner: Authenticity Guarantee & Market Bar */}
      <div className="bg-[#2D2A26] text-[#E7DFD5] text-xs py-1.5 px-4 border-b border-[#3D3A36]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#E8CDA3] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              100% Certified Horology Escrow & Authenticity Guarantee
            </span>
            <span className="hidden md:inline-block text-[#6E6760]">•</span>
            <span className="hidden md:inline-block text-[#B8AEA3]">
              Verified dealer ratings & physical watchmaker inspections
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => refreshData()}
              title="Click to probe API Gateway and sync data with microservices"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                isGatewayConnected
                  ? 'bg-[#52B788]/20 text-[#52B788] border border-[#52B788]/40 hover:bg-[#52B788]/30'
                  : 'bg-[#D4A373]/20 text-[#E8CDA3] border border-[#D4A373]/40 hover:bg-[#D4A373]/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isGatewayConnected ? 'bg-[#52B788] animate-pulse' : 'bg-[#D4A373]'
                }`}
              ></span>
              <span>
                {isSyncing
                  ? 'Syncing Microservices...'
                  : isGatewayConnected
                  ? 'API Gateway (:5000) Active'
                  : 'Local Cache Mode'}
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[#8E867E]">
              <span>5 Microservices</span>
              <span>6 Microservices (UserAccountDb)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1C1917] text-[#FAF8F5] border border-[#3D3A36] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Watch className="w-5 h-5 stroke-[2] text-[#C5A880]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-wider uppercase font-serif text-[#1C1917] group-hover:text-[#85642F] transition-colors">
                  Meridian
                </span>
                <span className="block text-[10px] tracking-widest text-[#967139] uppercase font-mono -mt-1 font-semibold">
                  Antiquité Horlogerie
                </span>
              </div>
            </button>

            {/* Navigation Tabs Desktop */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 bg-[#EDE8E0] p-1 rounded-xl border border-[#DDD6CB]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1C1917] text-[#FAF8F5] font-semibold shadow-sm'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#E2DCD2]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A880]' : 'text-[#78716C]'}`} />
                    <span>{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#C5A880] text-[#1C1917]'
                            : 'bg-[#DDD6CB] text-[#1C1917]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Rolex, Daytona, Nautilus, Omega..."
                className="w-full bg-[#FFFFFF] border border-[#D8D0C5] rounded-xl pl-9 pr-20 py-2 text-xs text-[#1C1917] placeholder:text-[#8C7D70] focus:outline-none focus:border-[#967139] focus:ring-1 focus:ring-[#967139]/30 transition-all shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setFilters((prev) => ({ ...prev, searchQuery: '' }));
                  }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-[11px] text-[#78716C] hover:text-[#1C1917]"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                id="global-search-btn"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons & Account Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Filter Button */}
            {onOpenFiltersMobile && (
              <button
                id="mobile-filter-toggle-btn"
                onClick={onOpenFiltersMobile}
                className="lg:hidden p-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#57534E] hover:text-[#1C1917]"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* List Watch CTA */}
            <button
              id="header-list-watch-btn"
              onClick={() => {
                setIsAddListingOpen(true);
              }}
              className="flex items-center gap-1.5 bg-[#C5A880] hover:bg-[#B3936A] text-[#1C1917] font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm hover:shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Listing</span>
              <span className="sm:hidden">List</span>
            </button>

            {/* Account Switcher Dropdown */}
            <div className="relative">
              <button
                id="account-switcher-toggle"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] hover:border-[#B8AEA3] text-[#1C1917] transition-colors shadow-2xs"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-cover border border-[#D8D0C5]"
                />
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-[#1C1917] leading-tight flex items-center gap-1">
                    <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.verifiedDealer && (
                      <ShieldCheck className="w-3 h-3 text-[#967139] shrink-0" />
                    )}
                  <div className="font-semibold text-[#1C1917] leading-tight flex items-center gap-1.5">
                    <span className="truncate max-w-[120px]">{currentUser.name}</span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <div className="text-[10px] text-[#78716C] font-mono capitalize">
                    {currentUser.role} • ★ {currentUser.rating}
                  <div className="text-[10px] text-[#78716C] font-mono flex items-center gap-1">
                    <span>@{currentLogin.username}</span>
                    <span>•</span>
                    <span>★ {currentUser.rating}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <div
                  id="account-dropdown-menu"
                  className="absolute right-0 mt-2 w-72 bg-[#FAF8F5] border border-[#D8D0C5] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2"
                  className="absolute right-0 mt-2 w-80 bg-[#FAF8F5] border border-[#D8D0C5] rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  {/* Current Login Identity */}
                  <div className="p-2.5 bg-[#EDE8E0] rounded-xl border border-[#D8D0C5] mb-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <KeyRound className="w-3.5 h-3.5 text-[#85642F] shrink-0" />
                        <span className="text-xs font-bold text-[#1C1917] font-mono truncate">
                          @{currentLogin.username}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsLoginModalOpen(true);
                        }}
                        className="text-[10px] text-[#85642F] hover:underline font-semibold flex items-center gap-1 bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-[#D8D0C5]"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Log In</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-[#78716C] truncate mt-0.5">{currentLogin.email}</div>
                  </div>

                  {/* Active Persona Profile Card */}
                  <div className="px-2 py-2 border-b border-[#E5DFD5]">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-[#D8D0C5]"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1C1917] truncate flex items-center gap-1">
                          {currentUser.name}
                          {currentUser.verifiedDealer && (
                            <span className="text-[10px] bg-[#C5A880]/25 text-[#78592A] px-1 py-0.5 rounded font-normal">
                            <span className="text-[9px] bg-[#C5A880]/25 text-[#78592A] px-1 py-0.5 rounded font-normal">
                              Verified
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-[#78716C] truncate">{currentUser.email}</p>
                        <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#57534E]">
                          <span className="flex items-center gap-1 text-[#967139] font-medium">
                            <Star className="w-3 h-3 fill-[#C5A880] text-[#967139]" />
                            {currentUser.rating} ({currentUser.reviewCount})
                          </span>
                          <span className="text-[#C5A880]">•</span>
                          <span className="text-[#78716C]">{currentUser.totalSalesCount} sales</span>
                          <span className="text-[#78716C]">{currentUser.location.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Switch Account Persona */}
                  <div className="mt-2 pt-1">
                    <div className="text-[10px] font-semibold tracking-wider text-[#78716C] uppercase px-2 mb-1.5 flex items-center justify-between">
                      <span>Switch Account Profile</span>
                      <span className="text-[9px] text-[#967139] font-medium">Select Role</span>
                  {/* Multiple Role Accounts Under Current Login */}
                  <div className="mt-2.5 pt-1">
                    <div className="text-[10px] font-semibold tracking-wider text-[#78716C] uppercase px-1 mb-1.5 flex items-center justify-between">
                      <span>Accounts for @{currentLogin.username}</span>
                      <span className="text-[9px] text-[#967139] font-medium">1 Role Each</span>
                    </div>

                    <div className="space-y-1">
                      {accounts.map((acc) => {
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                      {userAccounts.map((acc) => {
                        const isSelected = acc.id === currentUser.id;
                        return (
                          <button
                            key={acc.id}
                            id={`switch-user-${acc.id}`}
                            onClick={() => {
                              switchUser(acc.id);
                              setIsAccountMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                              isSelected
                                ? 'bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#1C1917] font-semibold'
                                : 'hover:bg-[#EDE8E0] text-[#57534E]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={acc.avatar}
                                alt={acc.name}
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                              <div className="truncate">
                                <div className="font-medium text-[#1C1917] truncate">{acc.name}</div>
                                <div className="text-[10px] text-[#78716C] capitalize">
                                  {acc.role} • {acc.location.split(',')[0]}
                                <div className="text-[10px] text-[#78716C]">
                                  {acc.location.split(',')[0]}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="text-[10px] font-bold text-[#85642F] bg-[#C5A880]/30 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {getRoleBadge(acc.role)}
                              {isSelected && (
                                <span className="text-[9px] font-bold text-[#85642F] bg-[#C5A880]/30 px-1 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Persona Button */}
                    <button
                      id="add-role-persona-btn"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        setIsAddAccountModalOpen(true);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed border-[#C5A880] text-xs font-semibold text-[#85642F] hover:bg-[#C5A880]/10 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add New Role Persona</span>
                    </button>
                  </div>

                  {/* Switch Login Account */}
                  <div className="mt-2.5 pt-2 border-t border-[#E5DFD5]">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-[#78716C] px-1 mb-1.5 flex items-center justify-between">
                      <span>Switch User Login</span>
                      <span className="text-[9px] text-[#85642F] font-mono">UserAccountDb</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {availableLogins.slice(0, 6).map((l) => {
                        const isCurrent = l.id === currentLogin.id;
                        return (
                          <button
                            key={l.id}
                            id={`switch-login-${l.username}`}
                            onClick={() => {
                              switchLogin(l.id);
                              setIsAccountMenuOpen(false);
                            }}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-mono truncate text-center transition-all ${
                              isCurrent
                                ? 'bg-[#1C1917] text-[#FAF8F5] font-bold shadow-xs'
                                : 'bg-[#EDE8E0] hover:bg-[#E2DCD2] text-[#57534E]'
                            }`}
                            title={`Switch login to @${l.username}`}
                          >
                            @{l.username}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Hub Navigation */}
                  <div className="mt-3 pt-2 border-t border-[#E5DFD5] grid grid-cols-2 gap-1.5">
                    <button
                      id="account-menu-vault-btn"
                      onClick={() => {
                        setActiveTab('collection');
                        setIsAccountMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#EDE8E0] hover:bg-[#E2DCD2] text-xs text-[#1C1917] font-medium transition-colors"
                    >
                      <Box className="w-3.5 h-3.5 text-[#967139]" />
                      <span>Watch Vault</span>
                    </button>
                    <button
                      id="account-menu-seller-hub-btn"
                      onClick={() => {
                        setActiveTab('seller-hub');
                        setIsAccountMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#EDE8E0] hover:bg-[#E2DCD2] text-xs text-[#1C1917] font-medium transition-colors"
                    >
                      <Store className="w-3.5 h-3.5 text-[#967139]" />
                      <span>Seller Hub</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden items-center justify-between gap-1 mt-3 pt-2.5 border-t border-[#E5DFD5] overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1C1917] text-[#FAF8F5] font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full font-bold ${
                      isActive ? 'bg-[#C5A880] text-[#1C1917]' : 'bg-[#DDD6CB] text-[#1C1917]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Role Persona Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#85642F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">Create Account Persona</h3>
                  <p className="text-xs text-[#78716C]">
                    Under login <strong className="font-mono text-[#85642F]">@{currentLogin.username}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EDE8E0] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
              <div className="bg-[#EAE4DC]/60 p-3 rounded-xl border border-[#D8D0C5]/60 text-xs text-[#57534E]">
                💡 <span className="font-semibold text-[#1C1917]">Microservices Rule:</span> Each user account is strictly mapped to <strong>one single role</strong>. You can create multiple account personas under the same login session.
              </div>

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  Select Role (1 Role per Account)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { role: 'buyer' as UserRole, label: 'Buyer', desc: 'Browse catalog, buy watches, wishlists', color: 'blue' },
                      { role: 'seller' as UserRole, label: 'Seller', desc: 'List timepieces, seller hub, manage offers', color: 'amber' },
                      { role: 'collector' as UserRole, label: 'Collector', desc: 'Private vault, market valuation tracking', color: 'purple' },
                      { role: 'admin' as UserRole, label: 'Admin', desc: 'Escrow oversight, compliance & admin', color: 'rose' }
                    ] as const
                  ).map((item) => {
                    const isSelected = newAccountRole === item.role;
                    return (
                      <button
                        type="button"
                        key={item.role}
                        onClick={() => setNewAccountRole(item.role)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#FFFFFF] border-[#85642F] ring-2 ring-[#C5A880]/40 shadow-sm'
                            : 'bg-[#EDE8E0]/60 border-[#D8D0C5] hover:bg-[#EDE8E0]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs capitalize text-[#1C1917]">{item.label}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#85642F]" />}
                        </div>
                        <p className="text-[10px] text-[#78716C] leading-snug">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Persona Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                  Persona Profile Name
                </label>
                <input
                  type="text"
                  required
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder={`e.g. ${currentLogin.username.charAt(0).toUpperCase() + currentLogin.username.slice(1)} (${newAccountRole.charAt(0).toUpperCase() + newAccountRole.slice(1)} Persona)`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              {/* Persona Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                  Bio / Specialization (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newAccountBio}
                  onChange={(e) => setNewAccountBio(e.target.value)}
                  placeholder={`Brief description of this ${newAccountRole} persona...`}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8D0C5] text-xs font-medium text-[#57534E] hover:bg-[#EDE8E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccount || !newAccountName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A36] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingAccount ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Create Account Persona</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log In Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#85642F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">User Authentication</h3>
                  <p className="text-xs text-[#78716C]">Log in to retrieve accounts from UserAccountDb</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EDE8E0] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Pickers */}
            <div className="mb-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                Quick Demo Accounts (1-Click Switch)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { username: 'alexander', roleLabel: 'Seller • Collector • Buyer' },
                  { username: 'julian', roleLabel: 'Buyer • Collector' },
                  { username: 'admin', roleLabel: 'Platform Admin' },
                  { username: 'geneva_dealer', roleLabel: 'Verified Dealer' }
                ].map((demo) => (
                  <button
                    key={demo.username}
                    type="button"
                    onClick={() => {
                      const match = availableLogins.find((l) => l.username === demo.username);
                      if (match) {
                        switchLogin(match.id);
                        setIsLoginModalOpen(false);
                      }
                    }}
                    className="p-2 rounded-xl bg-[#EDE8E0] hover:bg-[#E2DCD2] text-left transition-colors border border-[#D8D0C5]"
                  >
                    <div className="text-xs font-mono font-bold text-[#1C1917]">@{demo.username}</div>
                    <div className="text-[9px] text-[#78716C]">{demo.roleLabel}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E5DFD5]"></div>
              <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-[#78716C]">or with credentials</span>
              <div className="flex-grow border-t border-[#E5DFD5]"></div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 mt-2">
              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. alexander or alexander.vance@horology.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Password (default: password123 / admin123)
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8D0C5] text-xs font-medium text-[#57534E] hover:bg-[#EDE8E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLogin || !loginUsername}
                  className="px-5 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A36] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingLogin ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Log In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
