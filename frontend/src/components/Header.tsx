import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  UserPlus,
  LogIn,
  LogOut,
  X,
  KeyRound,
  CheckCircle,
  Users,
  ShieldAlert,
  RefreshCw,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { emailApi } from '../services/api';
import { ActiveTab, UserRole } from '../types';

interface HeaderProps {
  onOpenFiltersMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFiltersMobile }) => {
  const {
    currentLogin,
    userAccounts,
    currentUser,
    accounts,
    isAdmin,
    isFeatureEnabled,
    isTabEnabled,
    isLoginModalOpen,
    setIsLoginModalOpen,
    switchUser,
    createUserAccount,
    loginUser,
    logoutUser,
    registerUser,
    changeUserPassword,
    isLoggedIn,
    activeTab,
    setActiveTab,
    wishlist,
    compareList,
    setIsAddListingOpen,
    filters,
    setFilters,
    isGatewayConnected,
    isSyncing,
    refreshData,
    showToast
  } = useMarketplace();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu on click outside or escape key
  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  // Persona Creation Modal State
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountRole, setNewAccountRole] = useState<UserRole>('buyer');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBio, setNewAccountBio] = useState('');
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);

  // Login Modal State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Register Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerAccountName, setRegisterAccountName] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('buyer');
  const [registerLocation, setRegisterLocation] = useState('');
  const [registerBio, setRegisterBio] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  // Forgot Password Modal State
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordInput, setForgotPasswordInput] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);
  const [simulatedResetUrl, setSimulatedResetUrl] = useState('');

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState('');
  const [isSubmittingResetPassword, setIsSubmittingResetPassword] = useState(false);
  const [isVerifyingResetToken, setIsVerifyingResetToken] = useState(false);
  const [tokenUsername, setTokenUsername] = useState<string | null>(null);

  // Change Password Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [isSubmittingChangePassword, setIsSubmittingChangePassword] = useState(false);

  // Detect resetToken & userId in URL query on app load
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('resetToken');
      const uid = urlParams.get('userId');
      if (token && uid) {
        const parsedUid = parseInt(uid, 10);
        if (!isNaN(parsedUid) && parsedUid > 0) {
          setResetUserId(parsedUid);
          setResetToken(token);
          setIsResetPasswordModalOpen(true);
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Verify reset token when modal opens with credentials
  useEffect(() => {
    if (isResetPasswordModalOpen && resetUserId && resetToken) {
      setIsVerifyingResetToken(true);
      setResetPasswordError('');
      emailApi.verifyResetToken(resetUserId, resetToken)
        .then((res) => {
          if (res.isValid) {
            setTokenUsername(res.username || null);
          } else {
            setResetPasswordError(res.message || 'Invalid or expired reset token.');
          }
        })
        .catch((err: any) => {
          setResetPasswordError(err?.data?.message || err?.message || 'Unable to verify reset token with server.');
        })
        .finally(() => {
          setIsVerifyingResetToken(false);
        });
    }
  }, [isResetPasswordModalOpen, resetUserId, resetToken]);

  // Close open modals on Escape key
  useEffect(() => {
    const handleModalEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddAccountModalOpen) setIsAddAccountModalOpen(false);
        if (isLoginModalOpen) setIsLoginModalOpen(false);
        if (isRegisterModalOpen) setIsRegisterModalOpen(false);
        if (isForgotPasswordModalOpen) setIsForgotPasswordModalOpen(false);
        if (isResetPasswordModalOpen) setIsResetPasswordModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleModalEscape);
    return () => window.removeEventListener('keydown', handleModalEscape);
  }, [isAddAccountModalOpen, isLoginModalOpen, isRegisterModalOpen, isForgotPasswordModalOpen, isResetPasswordModalOpen]);

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
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Please enter username/email and password.');
      return;
    }
    setIsSubmittingLogin(true);
    try {
      const ok = await loginUser(loginUsername.trim(), loginPassword);
      if (ok) {
        setIsLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError('Invalid username or password.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword || !registerAccountName.trim()) {
      setRegisterError('Please fill in all required fields (Username, Email, Password, and Display Name).');
      return;
    }

    setIsSubmittingRegister(true);
    try {
      await registerUser({
        username: registerUsername.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        accountName: registerAccountName.trim(),
        role: registerRole,
        location: registerLocation.trim() || undefined,
        bio: registerBio.trim() || undefined
      });
      setIsRegisterModalOpen(false);
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterAccountName('');
      setRegisterRole('buyer');
      setRegisterLocation('');
      setRegisterBio('');
      setRegisterError('');
    } catch (err: any) {
      setRegisterError(err?.data?.message || err?.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setSimulatedResetUrl('');

    if (!forgotPasswordInput.trim()) {
      setForgotPasswordError('Please enter your email address or username.');
      return;
    }

    setIsSubmittingForgotPassword(true);
    try {
      const res = await emailApi.forgotPassword(forgotPasswordInput.trim());
      setForgotPasswordSuccess(res.message || 'If an account matches that username or email, a password reset link has been dispatched.');
      if (res.resetUrl) {
        setSimulatedResetUrl(res.resetUrl);
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.message || 'Failed to dispatch reset email. Please try again later.';
      setForgotPasswordError(errorMsg);
    } finally {
      setIsSubmittingForgotPassword(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordError('');
    setResetPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setResetPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetPasswordError('Passwords do not match.');
      return;
    }

    if (!resetUserId || !resetToken) {
      setResetPasswordError('Invalid reset session. Please request a new reset link.');
      return;
    }

    setIsSubmittingResetPassword(true);
    try {
      const res = await emailApi.resetPassword(resetUserId, resetToken, newPassword);
      if (res.success) {
        setResetPasswordSuccess('Password reset successfully!');
        showToast('Password Updated', 'Your password has been changed. You can now log in.', 'success');

        if (window.location.search.includes('resetToken')) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        setTimeout(() => {
          setIsResetPasswordModalOpen(false);
          setNewPassword('');
          setConfirmPassword('');
          setResetUserId(null);
          setResetToken('');
          setIsLoginModalOpen(true);
        }, 1500);
      } else {
        setResetPasswordError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setResetPasswordError(err?.data?.message || err?.message || 'Failed to reset password.');
    } finally {
      setIsSubmittingResetPassword(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!currentPasswordInput) {
      setChangePasswordError('Please enter your current password.');
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 6) {
      setChangePasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError('New passwords do not match.');
      return;
    }

    if (newPasswordInput === currentPasswordInput) {
      setChangePasswordError('New password must be different from current password.');
      return;
    }

    setIsSubmittingChangePassword(true);
    try {
      const res = await changeUserPassword(currentPasswordInput, newPasswordInput);
      if (res.success) {
        setChangePasswordSuccess(res.message || 'Password updated successfully!');
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setCurrentPasswordInput('');
          setNewPasswordInput('');
          setConfirmPasswordInput('');
          setChangePasswordSuccess('');
        }, 1400);
      } else {
        setChangePasswordError(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setChangePasswordError(err?.data?.message || err?.message || 'Failed to update password.');
    } finally {
      setIsSubmittingChangePassword(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
    if (isTabEnabled('explore') && activeTab !== 'explore') {
      setActiveTab('explore');
    }
  };

  const handleProbeGateway = async () => {
    if (isSyncing) return;
    try {
      const connected = await refreshData();
      if (connected) {
        showToast('Gateway Connected', 'Connected to API Gateway (:5000) and synced with microservices.', 'success');
      } else {
        showToast('Gateway Unreachable', 'Could not reach API Gateway at :5000. Running in Local Cache Mode.', 'warning');
      }
    } catch {
      showToast('Gateway Unreachable', 'Could not reach API Gateway at :5000. Running in Local Cache Mode.', 'warning');
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'explore', label: 'Marketplace', icon: Watch },
    { id: 'collection', label: 'My Watch Vault', icon: Box },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
    { id: 'seller-hub', label: 'Seller Hub', icon: Store },
    { id: 'orders', label: 'Orders & Offers', icon: ShoppingBag }
  ];

  const visibleNavItems = navItems.filter((item) => isTabEnabled(item.id));

  return (
    <>
      <header id="main-header" className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-[#E5DFD5]">
      {/* Top Banner: Authenticity Guarantee & Market Bar */}
      <div className="bg-[#2D2A26] text-[#E7DFD5] text-xs py-1.5 px-4 border-b border-[#3D3A36]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#E8CDA3] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              Verified Sellers by watch community and buyers rating
            </span>
            <span className="hidden md:inline-block text-[#6E6760]">•</span>
            <span className="hidden md:inline-block text-[#B8AEA3]">
              Watch originality feedback
            </span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3 text-xs">
              <button
                id="probe-gateway-btn"
                onClick={handleProbeGateway}
                disabled={isSyncing}
                title={
                  isGatewayConnected
                    ? "API Gateway (:5000) Active. Click to probe and re-sync microservices."
                    : "API Gateway is offline. Click to probe connection (:5000)."
                }
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                  isSyncing ? 'opacity-75 cursor-wait' : 'cursor-pointer hover:shadow-xs'
                } ${
                  isGatewayConnected
                    ? 'bg-[#52B788]/20 text-[#52B788] border border-[#52B788]/40 hover:bg-[#52B788]/30'
                    : 'bg-[#D4A373]/20 text-[#E8CDA3] border border-[#D4A373]/40 hover:bg-[#D4A373]/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSyncing
                      ? 'bg-[#E8CDA3] animate-ping'
                      : isGatewayConnected
                      ? 'bg-[#52B788] animate-pulse'
                      : 'bg-[#D4A373]'
                  }`}
                ></span>
                <span>
                  {isSyncing
                    ? 'Syncing Microservices...'
                    : isGatewayConnected
                    ? 'API Gateway (:5000) Active'
                    : 'Local Cache Mode'}
                </span>
                <RefreshCw className={`w-3 h-3 ml-0.5 opacity-70 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              <div className="hidden sm:flex items-center gap-1.5 text-[#8E867E]">
                <span>6 Microservices</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => {
                if (isTabEnabled('explore')) {
                  setActiveTab('explore');
                }
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1C1917] text-[#FAF8F5] border border-[#3D3A36] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Watch className="w-5 h-5 stroke-[2] text-[#C5A880]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-wider uppercase font-serif text-[#1C1917] group-hover:text-[#85642F] transition-colors">
                  THC
                </span>
                <span className="block text-[10px] tracking-widest text-[#967139] uppercase font-mono -mt-1 font-semibold">
                  The Heritage Club
                </span>
              </div>
            </button>

            {/* Navigation Tabs Desktop */}
            {visibleNavItems.length > 0 && (
              <nav className="hidden lg:flex items-center gap-1 ml-4 bg-[#EDE8E0] p-1 rounded-xl border border-[#DDD6CB]">
                {visibleNavItems.map((item) => {
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
            )}
          </div>

          {/* Search Bar */}
          {isFeatureEnabled('marketplace') && (
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
          )}

          {/* Right Action Icons & Account Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Filter Button */}
            {isFeatureEnabled('marketplace') && onOpenFiltersMobile && (
              <button
                id="mobile-filter-toggle-btn"
                onClick={onOpenFiltersMobile}
                className="lg:hidden p-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#57534E] hover:text-[#1C1917]"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* List Watch CTA */}
            {isFeatureEnabled('sellerHub') && (
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
            )}

            {/* Account Switcher Dropdown */}
            <div className="relative" ref={accountMenuRef}>
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
                  <div className="font-semibold text-[#1C1917] leading-tight flex items-center gap-1.5">
                    <span className="truncate max-w-[120px]">{currentUser.name}</span>
                    {currentUser.verifiedDealer && (
                      <ShieldCheck className="w-3 h-3 text-[#967139] shrink-0" />
                    )}
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <div className="text-[10px] text-[#78716C] font-mono flex items-center gap-1">
                    <span>@{currentLogin.username}</span>
                    {isLoggedIn && (
                      <>
                        <span>•</span>
                        <span>
                          {currentUser.reviewCount > 0 && currentUser.rating > 0
                            ? `★ ${currentUser.rating.toFixed(1)}`
                            : '★ New'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <div
                  id="account-dropdown-menu"
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
                        {!isLoggedIn && (
                          <span className="text-[9px] bg-[#D8D0C5] text-[#57534E] px-1.5 py-0.5 rounded font-sans font-medium">
                            Guest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isLoggedIn ? (
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              type="button"
                              id="account-menu-logout-btn"
                              onClick={() => {
                                logoutUser();
                                setIsAccountMenuOpen(false);
                              }}
                              className="text-[10px] text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1 bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-rose-200 hover:border-rose-300 transition-colors shadow-2xs"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Log Out</span>
                            </button>
                            <button
                              type="button"
                              id="account-menu-change-password-btn"
                              onClick={() => {
                                setIsAccountMenuOpen(false);
                                setIsChangePasswordModalOpen(true);
                                setCurrentPasswordInput('');
                                setNewPasswordInput('');
                                setConfirmPasswordInput('');
                                setChangePasswordError('');
                                setChangePasswordSuccess('');
                              }}
                              className="text-[10px] text-[#85642F] hover:text-[#1C1917] font-semibold flex items-center gap-1 bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-[#D8D0C5] hover:border-[#85642F] transition-colors shadow-2xs"
                            >
                              <KeyRound className="w-3 h-3 text-[#C5A880]" />
                              <span>Change Password</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              id="account-menu-login-btn"
                              onClick={() => {
                                setIsAccountMenuOpen(false);
                                setIsLoginModalOpen(true);
                              }}
                              className="text-[10px] text-[#85642F] hover:underline font-semibold flex items-center gap-1 bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-[#D8D0C5] transition-colors"
                            >
                              <LogIn className="w-3 h-3" />
                              <span>Log In</span>
                            </button>
                            <button
                              type="button"
                              id="account-menu-register-btn"
                              onClick={() => {
                                setIsAccountMenuOpen(false);
                                setIsRegisterModalOpen(true);
                              }}
                              className="text-[10px] text-[#FAF8F5] bg-[#1C1917] hover:bg-[#3D3A36] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#1C1917] transition-colors shadow-2xs"
                            >
                              <UserPlus className="w-3 h-3 text-[#C5A880]" />
                              <span>Register</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-[#78716C] truncate mt-0.5">{currentLogin.email}</div>
                  </div>

                  {!isLoggedIn ? (
                    <div className="px-3 py-3 bg-[#EDE8E0]/60 rounded-xl border border-[#D8D0C5] text-center my-2">
                      <p className="text-xs font-semibold text-[#1C1917]">You are browsing as Guest</p>
                      <p className="text-[11px] text-[#78716C] mt-1 leading-relaxed">
                        Log in to manage your watch vault, create listings, submit offers, and access multiple persona accounts.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsLoginModalOpen(true);
                        }}
                        className="mt-2.5 w-full py-1.5 px-3 bg-[#1C1917] text-[#FAF8F5] text-xs font-bold rounded-lg hover:bg-[#3D3A36] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Log In with Credentials</span>
                      </button>
                    </div>
                  ) : (
                    <>
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
                                <span className="text-[9px] bg-[#C5A880]/25 text-[#78592A] px-1 py-0.5 rounded font-normal">
                                  Verified
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-[#78716C] truncate">{currentUser.email}</p>
                            <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#57534E]">
                              {currentUser.reviewCount > 0 && currentUser.rating > 0 ? (
                                <span className="flex items-center gap-1 text-[#967139] font-medium">
                                  <Star className="w-3 h-3 fill-[#C5A880] text-[#967139]" />
                                  {currentUser.rating.toFixed(1)} ({currentUser.reviewCount})
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[#78716C] font-medium">
                                  <Star className="w-3 h-3 text-[#B8AEA3]" />
                                  New (0 reviews)
                                </span>
                              )}
                              <span className="text-[#C5A880]">•</span>
                              <span className="text-[#78716C]">{currentUser.totalSalesCount} sales</span>
                              <span className="text-[#78716C]">{currentUser.location.split(',')[0]}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Switch Account Persona */}
                      <div className="mt-2.5 pt-1">
                        <div className="text-[10px] font-semibold tracking-wider text-[#78716C] uppercase px-1 mb-1.5 flex items-center justify-between">
                          <span>Accounts for @{currentLogin.username}</span>
                          <span className="text-[9px] text-[#967139] font-medium">1 Role Each</span>
                        </div>

                        <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                          {userAccounts.map((acc) => {
                            const isSelected = acc.id === currentUser.id;
                            return (
                              <button
                                key={acc.id}
                                id={`switch-user-${acc.id}`}
                                type="button"
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
                                    </div>
                                  </div>
                                </div>

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
                          type="button"
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
                    </>
                  )}

                  {/* Quick Hub Navigation */}
                  {(isFeatureEnabled('collectorVault') || isFeatureEnabled('sellerHub')) && (
                    <div className="mt-3 pt-2 border-t border-[#E5DFD5] grid grid-cols-2 gap-1.5">
                      {isFeatureEnabled('collectorVault') && (
                        <button
                          type="button"
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
                      )}
                      {isFeatureEnabled('sellerHub') && (
                        <button
                          type="button"
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
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        {visibleNavItems.length > 0 && (
          <div className="flex lg:hidden items-center justify-between gap-1 mt-3 pt-2.5 border-t border-[#E5DFD5] overflow-x-auto no-scrollbar">
            {visibleNavItems.map((item) => {
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
        )}
      </div>
    </header>

    {/* Add Role Persona Modal */}
    {isAddAccountModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto"
        onClick={() => setIsAddAccountModalOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 my-auto max-h-[90vh] flex flex-col"
        >
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 my-auto max-h-[90vh] flex flex-col"
          >
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

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
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
                  placeholder="e.g. waseema or waseem15280@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    Password
                  </label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => {
                      setIsLoginModalOpen(false);
                      setIsForgotPasswordModalOpen(true);
                      setForgotPasswordInput(loginUsername.trim());
                      setForgotPasswordError('');
                      setForgotPasswordSuccess('');
                      setSimulatedResetUrl('');
                    }}
                    className="text-xs text-[#85642F] hover:text-[#1C1917] font-semibold hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                  disabled={isSubmittingLogin || !loginUsername.trim() || !loginPassword}
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

              {/* Switch to Register */}
              <div className="pt-3 text-center border-t border-[#E5DFD5]">
                <span className="text-xs text-[#78716C]">Don't have an account? </span>
                <button
                  type="button"
                  id="switch-to-register-btn"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsRegisterModalOpen(true);
                  }}
                  className="text-xs text-[#85642F] hover:text-[#1C1917] font-bold hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 my-auto max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#85642F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">Create THC Account</h3>
                  <p className="text-xs text-[#78716C]">Register credentials and choose your primary role persona</p>
                </div>
              </div>
              <button
                type="button"
                id="close-register-modal-btn"
                onClick={() => setIsRegisterModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EDE8E0] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {registerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Login Credentials Section */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#85642F] flex items-center gap-1.5 border-b border-[#E5DFD5] pb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>1. Login Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      id="register-username-input"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder="e.g. sterling_collector"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      id="register-email-input"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="e.g. example@email.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    id="register-password-input"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                  />
                </div>
              </div>

              {/* Account Persona Profile Section */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#85642F] flex items-center gap-1.5 border-b border-[#E5DFD5] pb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>2. Primary Persona Profile (1 Role Rule)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Display / Persona Name *
                    </label>
                    <input
                      type="text"
                      required
                      id="register-account-name-input"
                      value={registerAccountName}
                      onChange={(e) => setRegisterAccountName(e.target.value)}
                      placeholder="e.g. James Sterling"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      id="register-location-input"
                      value={registerLocation}
                      onChange={(e) => setRegisterLocation(e.target.value)}
                      placeholder="e.g. Geneva, Switzerland"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                    />
                  </div>
                </div>

                {/* Role Picker (Single role per persona) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                    Select Initial Role Persona *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        role: 'buyer' as UserRole,
                        title: 'Buyer',
                        desc: 'Browse catalog, make offers, cart & orders'
                      },
                      {
                        role: 'seller' as UserRole,
                        title: 'Seller',
                        desc: 'Create listings, respond to offers, seller hub'
                      },
                      {
                        role: 'collector' as UserRole,
                        title: 'Collector',
                        desc: 'Personal watch vault, track valuations & history'
                      },
                      {
                        role: 'admin' as UserRole,
                        title: 'Admin',
                        desc: 'Catalog oversight, marketplace administration'
                      }
                    ].map((item) => {
                      const isSelected = registerRole === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          id={`reg-role-${item.role}`}
                          onClick={() => setRegisterRole(item.role)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-[#85642F] bg-[#C5A880]/15 ring-2 ring-[#85642F]/30 shadow-xs'
                              : 'border-[#D8D0C5] bg-[#FFFFFF] hover:border-[#B8AEA3]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#1C1917]">{item.title}</span>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#85642F]" />}
                          </div>
                          <p className="text-[10px] text-[#78716C] leading-snug">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#78716C] italic mt-1.5">
                    * You can always create additional personas for other roles under your login anytime.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Bio / Horology Specialization (Optional)
                  </label>
                  <textarea
                    rows={2}
                    id="register-bio-input"
                    value={registerBio}
                    onChange={(e) => setRegisterBio(e.target.value)}
                    placeholder="Tell other horologists about your passion or collection focus..."
                    className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8D0C5] text-xs font-medium text-[#57534E] hover:bg-[#EDE8E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-register-btn"
                  disabled={isSubmittingRegister || !registerUsername.trim() || !registerEmail.trim() || !registerPassword || !registerAccountName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A36] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  {isSubmittingRegister ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Create Account & Register</span>
                    </>
                  )}
                </button>
              </div>

              {/* Switch to Login */}
              <div className="pt-2 text-center border-t border-[#E5DFD5]">
                <span className="text-xs text-[#78716C]">Already have an account? </span>
                <button
                  type="button"
                  id="switch-to-login-from-reg-btn"
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="text-xs text-[#85642F] hover:text-[#1C1917] font-bold hover:underline"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={() => setIsForgotPasswordModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 my-auto max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#85642F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">Forgot Password</h3>
                  <p className="text-xs text-[#78716C]">Reset your account password via Email</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotPasswordModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EDE8E0] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotPasswordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{forgotPasswordError}</span>
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{forgotPasswordSuccess}</span>
                </div>
                {simulatedResetUrl && (
                  <div className="pt-2 border-t border-emerald-200/60 mt-2">
                    <p className="text-[11px] text-emerald-900 font-semibold mb-1">
                      Direct Email Reset Link (Development Mode):
                    </p>
                    <button
                      type="button"
                      id="dev-open-reset-btn"
                      onClick={() => {
                        try {
                          const url = new URL(simulatedResetUrl);
                          const token = url.searchParams.get('resetToken');
                          const uid = url.searchParams.get('userId');
                          if (token && uid) {
                            setResetToken(token);
                            setResetUserId(parseInt(uid, 10));
                            setIsForgotPasswordModalOpen(false);
                            setIsResetPasswordModalOpen(true);
                          }
                        } catch {
                          window.location.href = simulatedResetUrl;
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1917] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A36] transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Open Reset Password Screen</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Username or Email Address
                </label>
                <input
                  type="text"
                  required
                  id="forgot-password-input"
                  value={forgotPasswordInput}
                  onChange={(e) => setForgotPasswordInput(e.target.value)}
                  placeholder="e.g. waseema or waseem15280@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
                <p className="text-[11px] text-[#A8A29E] mt-1">
                  We will send a secure time-limited URL to the registered email address.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordModalOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#85642F] hover:text-[#1C1917] hover:bg-[#EDE8E0] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Log In</span>
                </button>
                <button
                  type="submit"
                  id="submit-forgot-password-btn"
                  disabled={isSubmittingForgotPassword || !forgotPasswordInput.trim()}
                  className="px-5 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A36] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  {isSubmittingForgotPassword ? (
                    <span>Sending Link...</span>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={() => setIsResetPasswordModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 my-auto max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#85642F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">Reset Password</h3>
                  <p className="text-xs text-[#78716C]">
                    {tokenUsername ? `Establishing new credentials for @${tokenUsername}` : 'Enter your new account password'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EDE8E0] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isVerifyingResetToken && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-[#85642F]" />
                <span>Verifying reset security token with server...</span>
              </div>
            )}

            {resetPasswordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{resetPasswordError}</span>
              </div>
            )}

            {resetPasswordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resetPasswordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  id="new-password-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  id="confirm-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8D0C5] text-xs font-medium text-[#57534E] hover:bg-[#EDE8E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-reset-password-btn"
                  disabled={isSubmittingResetPassword || !newPassword || !confirmPassword || isVerifyingResetToken}
                  className="px-5 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A36] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  {isSubmittingResetPassword ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 my-auto max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#85642F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">Change Password</h3>
                  <p className="text-xs text-[#78716C]">
                    Update credentials for <strong className="font-mono text-[#85642F]">@{currentLogin.username}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EDE8E0] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {changePasswordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{changePasswordError}</span>
              </div>
            )}

            {changePasswordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{changePasswordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  id="current-password-input"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  id="change-new-password-input"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  id="change-confirm-password-input"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8D0C5] bg-[#FFFFFF] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#85642F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8D0C5] text-xs font-medium text-[#57534E] hover:bg-[#EDE8E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-change-password-btn"
                  disabled={
                    isSubmittingChangePassword ||
                    !currentPasswordInput ||
                    !newPasswordInput ||
                    !confirmPasswordInput ||
                    Boolean(changePasswordSuccess)
                  }
                  className="px-5 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A36] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  {isSubmittingChangePassword ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
