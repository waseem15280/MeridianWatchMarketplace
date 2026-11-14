import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { SellerOnboardingRequest, SellerOnboardingStatus } from '../types';
import {
  ShieldCheck,
  Store,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Mail,
  UserPlus,
  AlertTriangle,
  Award,
  ArrowRight,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

export const SellerOnboardingView: React.FC = () => {
  const {
    sellerOnboardingRequests,
    pendingSellerRequestsCount,
    loadSellerOnboardingRequests,
    approveSellerRequest,
    rejectSellerRequest,
    isAdmin
  } = useMarketplace();

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'all' | SellerOnboardingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Approval Modal State
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<SellerOnboardingRequest | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Rejection Modal State
  const [selectedRequestForRejection, setSelectedRequestForRejection] = useState<SellerOnboardingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPresetReason, setSelectedPresetReason] = useState('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  // Preset rejection reasons for rapid evaluation
  const PRESET_REASONS = [
    'Incomplete dealer credentials and physical boutique verification.',
    'Insufficient horological provenance documentation for high-value timepieces.',
    'Commercial dealer license could not be validated with regional authorities.',
    'Application requires additional identity verification and business documentation.'
  ];

  // Refresh from microservice
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadSellerOnboardingRequests();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = sellerOnboardingRequests.length;
    const pending = sellerOnboardingRequests.filter((r) => r.status === 'pending').length;
    const approved = sellerOnboardingRequests.filter((r) => r.status === 'approved').length;
    const rejected = sellerOnboardingRequests.filter((r) => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [sellerOnboardingRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return sellerOnboardingRequests.filter((req) => {
      // Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesUsername = req.username.toLowerCase().includes(q);
        const matchesEmail = req.email.toLowerCase().includes(q);
        const matchesName = req.displayName.toLowerCase().includes(q);
        const matchesLocation = req.location?.toLowerCase().includes(q) || false;
        const matchesBio = req.bio?.toLowerCase().includes(q) || false;
        if (!matchesUsername && !matchesEmail && !matchesName && !matchesLocation && !matchesBio) {
          return false;
        }
      }

      return true;
    });
  }, [sellerOnboardingRequests, statusFilter, searchQuery]);

  // Confirm Approval
  const handleConfirmApproval = async () => {
    if (!selectedRequestForApproval) return;
    setIsSubmittingApproval(true);
    try {
      await approveSellerRequest(selectedRequestForApproval.id, approvalNote.trim() || undefined);
      setSelectedRequestForApproval(null);
      setApprovalNote('');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Confirm Rejection
  const handleConfirmRejection = async () => {
    if (!selectedRequestForRejection) return;
    const finalReason = rejectionReason.trim() || selectedPresetReason || 'Application could not be approved at this time.';
    setIsSubmittingRejection(true);
    try {
      await rejectSellerRequest(selectedRequestForRejection.id, finalReason);
      setSelectedRequestForRejection(null);
      setRejectionReason('');
      setSelectedPresetReason('');
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* ================= HERO HEADER ================= */}
      <div className="bg-gradient-to-r from-[#1C1917] via-[#2D2A26] to-[#1C1917] rounded-3xl p-6 sm:p-8 text-[#FAF8F5] border border-[#3D3A36] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(197,168,128,0.18),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#C5A880] uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>THC Admin Concierge • Seller Verification Atelier</span>
              <span className="text-[#78716C]">•</span>
              <span className="text-emerald-400">
                {isAdmin ? 'Platform Administrator Mode' : 'Supervisory Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF8F5] tracking-tight">
              Seller Onboarding & Verification
            </h1>
            <p className="text-sm text-[#B8AEA3] max-w-2xl leading-relaxed">
              Evaluate prospective horologist dealers. Review dealer credentials, inspect boutique locations, and grant or decline seller privileges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="refresh-seller-requests-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#FAF8F5] text-xs font-medium border border-[#FAF8F5]/15 transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C5A880] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Requests'}</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-[#FAF8F5]/10 text-xs">
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px]">Total Applications</div>
            <div className="text-xl font-serif font-bold text-[#FAF8F5] mt-1">{metrics.total}</div>
          </div>
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px] flex items-center gap-1.5">
              <span>Pending Review</span>
              {metrics.pending > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              )}
            </div>
            <div className="text-xl font-serif font-bold text-[#C5A059] mt-1">{metrics.pending}</div>
          </div>
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px]">Approved Sellers</div>
            <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{metrics.approved}</div>
          </div>
          <div className="bg-[#FAF8F5]/5 rounded-2xl p-3 border border-[#FAF8F5]/10">
            <div className="text-[#8E867E] text-[11px]">Declined Applications</div>
            <div className="text-xl font-serif font-bold text-rose-400 mt-1">{metrics.rejected}</div>
          </div>
        </div>
      </div>

      {/* ================= FILTER & SEARCH TOOLBAR ================= */}
      <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
          <input
            type="text"
            id="seller-onboarding-search-input"
            placeholder="Search by store name, username, email, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] placeholder-[#8C7D70] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:bg-[#FAF8F5] transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#EDE8E0]/70 p-1 rounded-xl border border-[#DDD6CB] self-start md:self-auto overflow-x-auto">
          {[
            { key: 'all' as const, label: 'All Requests', count: metrics.total },
            { key: 'pending' as const, label: 'Pending Review', count: metrics.pending },
            { key: 'approved' as const, label: 'Approved', count: metrics.approved },
            { key: 'rejected' as const, label: 'Declined', count: metrics.rejected }
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                id={`filter-seller-tab-${tab.key}`}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1C1917] text-[#FAF8F5] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5]/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? tab.key === 'pending'
                        ? 'bg-[#C5A059] text-white'
                        : 'bg-[#FAF8F5]/20 text-[#FAF8F5]'
                      : 'bg-[#DDD6CB] text-[#57534E]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= APPLICATIONS LIST / CARDS ================= */}
      {filteredRequests.length === 0 ? (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE8E0] text-[#78716C] flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#1C1917]">No Onboarding Requests Found</h3>
          <p className="text-xs text-[#78716C] max-w-md mx-auto leading-relaxed">
            {statusFilter !== 'all'
              ? `There are no seller onboarding applications matching the "${statusFilter}" filter.`
              : 'No seller onboarding requests have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                id={`seller-request-card-${req.id}`}
                className="bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Requester identity & Status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#1C1917] text-[#C5A059] flex items-center justify-center font-bold text-sm shrink-0 border border-[#3D3A36]">
                      <Store className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-serif font-bold text-[#1C1917]">
                          {req.displayName}
                        </h3>
                        <span className="text-xs font-mono text-[#85642F]">@{req.username}</span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            req.type === 'new_user'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {req.type === 'new_user' ? 'New User Registration' : 'Persona Expansion'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#78716C] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#85642F]" />
                          <span>{req.email}</span>
                        </span>
                        {req.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#85642F]" />
                            <span>{req.location}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#85642F]" />
                          <span>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 self-start sm:self-auto">
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C5A059]/15 text-[#85642F] border border-[#C5A059]/30">
                        <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
                        <span>Pending Admin Review</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approved & Verified</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Application Declined</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Content: Bio / Horology Specialty */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                    Dealer Specialization & Boutique Profile:
                  </span>
                  <p className="text-[#3D3A36] leading-relaxed bg-[#EDE8E0]/40 p-3 rounded-xl border border-[#DDD6CB]/60">
                    {req.bio || 'No additional specialization notes provided.'}
                  </p>
                </div>

                {/* Bottom Row: Actions or Determination Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  {isPending ? (
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        id={`accept-seller-btn-${req.id}`}
                        onClick={() => {
                          setSelectedRequestForApproval(req);
                          setApprovalNote('');
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept Seller</span>
                      </button>

                      <button
                        type="button"
                        id={`reject-seller-btn-${req.id}`}
                        onClick={() => {
                          setSelectedRequestForRejection(req);
                          setRejectionReason('');
                          setSelectedPresetReason('');
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-[#78716C] flex items-center gap-4 flex-wrap">
                      <span>
                        Reviewed by: <strong>@{req.reviewedBy || 'admin'}</strong>
                      </span>
                      {req.reviewedAt && (
                        <span>
                          Reviewed: {new Date(req.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                      {isRejected && req.rejectionReason && (
                        <span className="text-rose-700 font-medium">
                          Reason: {req.rejectionReason}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-[#78716C] italic">
                    {isPending
                      ? 'Decision will notify applicant via email & on next login session.'
                      : 'Applicant determination recorded and notification queued.'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= APPROVE CONFIRMATION MODAL ================= */}
      {selectedRequestForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-[#FAF8F5] rounded-3xl border border-[#DDD6CB] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1C1917]">Approve Seller Onboarding</h3>
                <p className="text-xs text-[#78716C]">Grant full verified seller privileges</p>
              </div>
            </div>

            <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#DDD6CB] text-xs space-y-1.5 text-[#1C1917]">
              <div><strong>Store Persona:</strong> {selectedRequestForApproval.displayName}</div>
              <div><strong>Requester:</strong> @{selectedRequestForApproval.username} ({selectedRequestForApproval.email})</div>
              <div><strong>Application Type:</strong> {selectedRequestForApproval.type === 'new_user' ? 'New User Registration' : 'Persona Expansion'}</div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Welcome / Supervisory Note (Optional)
              </label>
              <textarea
                rows={3}
                id="approval-note-input"
                placeholder="Congratulations on joining the THC verified dealer network..."
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <p className="text-xs text-[#78716C] leading-relaxed">
              Approving will automatically provision a Verified Seller persona for this member, dispatch a confirmation email, and present a celebration modal dialog on their next login session.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#DDD6CB]">
              <button
                type="button"
                onClick={() => setSelectedRequestForApproval(null)}
                className="px-4 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#1C1917] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-approve-seller-btn"
                onClick={handleConfirmApproval}
                disabled={isSubmittingApproval}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingApproval ? 'Approving...' : 'Confirm & Approve Seller'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECT CONFIRMATION MODAL ================= */}
      {selectedRequestForRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-[#FAF8F5] rounded-3xl border border-[#DDD6CB] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1C1917]">Decline Seller Application</h3>
                <p className="text-xs text-[#78716C]">Provide a reason for administrative determination</p>
              </div>
            </div>

            <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#DDD6CB] text-xs space-y-1 text-[#1C1917]">
              <div><strong>Applicant:</strong> {selectedRequestForRejection.displayName} (@{selectedRequestForRejection.username})</div>
              <div><strong>Email:</strong> {selectedRequestForRejection.email}</div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#57534E]">
                Select Standard Reason Preset
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {PRESET_REASONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPresetReason(preset);
                      setRejectionReason(preset);
                    }}
                    className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      selectedPresetReason === preset
                        ? 'border-rose-400 bg-rose-50/70 text-rose-900 font-medium'
                        : 'border-[#DDD6CB] bg-[#FAF8F5] hover:bg-[#EDE8E0] text-[#57534E]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Custom Feedback / Reason for Notice *
              </label>
              <textarea
                rows={3}
                id="rejection-reason-input"
                required
                placeholder="Enter detailed determination reason to include in the email and login notification..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EDE8E0]/70 border border-[#DDD6CB] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#DDD6CB]">
              <button
                type="button"
                onClick={() => setSelectedRequestForRejection(null)}
                className="px-4 py-2 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#1C1917] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-reject-seller-btn"
                onClick={handleConfirmRejection}
                disabled={isSubmittingRejection || (!rejectionReason.trim() && !selectedPresetReason)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingRejection ? 'Declining...' : 'Confirm & Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
