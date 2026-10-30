import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Activity,
  PackageCheck,
  ShieldCheck,
  PlusCircle,
  X,
  Lock,
  ArrowRight,
  User,
  Info,
  Calendar,
  DollarSign,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ServiceRequest, ServiceWorkflowState, WatchMovement } from '../types';

export const ServiceCenterView: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    serviceRequests,
    createServiceRequest,
    transitionServiceRequest,
    showToast
  } = useMarketplace();

  // Role check
  const isServiceExecutive = currentUser?.role === 'service_executive' || isAdmin;

  // Filter states
  const [filterState, setFilterState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<ServiceRequest | null>(null);
  const [actionModalType, setActionModalType] = useState<'accept' | 'reject' | 'ship' | 'return' | null>(null);

  // Form states for modals
  const [newBrand, setNewBrand] = useState('Rolex');
  const [newModel, setNewModel] = useState('');
  const [newMovement, setNewMovement] = useState<WatchMovement>('Automatic');
  const [newIsWorking, setNewIsWorking] = useState(true);
  const [newGlassChange, setNewGlassChange] = useState(false);
  const [newIssueDesc, setNewIssueDesc] = useState('');
  const [newPhone, setNewPhone] = useState(currentUser?.phone || '');

  // Action form states
  const [estimatedPriceInput, setEstimatedPriceInput] = useState<number>(25000);
  const [actionNotesInput, setActionNotesInput] = useState('');
  const [courierCompanyInput, setCourierCompanyInput] = useState('Blue Dart Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Filter requests based on user perspective and active filter pill
  const visibleRequests = useMemo(() => {
    let list = serviceRequests || [];

    // Customer View: filter to own requests only
    if (!isServiceExecutive) {
      list = list.filter((r) => String(r.userId) === String(currentUser.id));
    }

    // Filter by workflow state
    if (filterState !== 'all') {
      list = list.filter((r) => r.currentState === filterState);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.watchBrand.toLowerCase().includes(q) ||
          r.watchModel.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.trackingNumber && r.trackingNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }, [serviceRequests, isServiceExecutive, currentUser.id, filterState, searchQuery]);

  // Overall metric statistics
  const stats = useMemo(() => {
    const all = isServiceExecutive
      ? serviceRequests || []
      : (serviceRequests || []).filter((r) => String(r.userId) === String(currentUser.id));

    return {
      total: all.length,
      created: all.filter((r) => r.currentState === 'ServiceRequestCreated').length,
      inProgress: all.filter((r) => ['ServiceRequestAccepted', 'InTransit', 'UnderRepair', 'InTesting'].includes(r.currentState)).length,
      completed: all.filter((r) => r.currentState === 'TransitBack').length
    };
  }, [serviceRequests, isServiceExecutive, currentUser.id]);

  // Handle Create Request Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim() || !newModel.trim() || !newIssueDesc.trim()) {
      showToast('Validation Error', 'Please complete all required fields.', 'warning');
      return;
    }

    await createServiceRequest({
      userId: String(currentUser.id),
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: newPhone || currentUser.phone,
      watchBrand: newBrand.trim(),
      watchModel: newModel.trim(),
      movementType: newMovement,
      isWorking: newIsWorking,
      glassChangeRequired: newGlassChange,
      issueDescription: newIssueDesc.trim()
    });

    setIsCreateModalOpen(false);
    setNewModel('');
    setNewIssueDesc('');
  };

  // Open action modal
  const openActionModal = (request: ServiceRequest, type: 'accept' | 'reject' | 'ship' | 'return') => {
    setSelectedRequestForAction(request);
    setActionModalType(type);
    setActionNotesInput('');
    if (type === 'accept') {
      setEstimatedPriceInput(request.estimatedPrice || 25000);
    } else if (type === 'ship') {
      setCourierCompanyInput('Blue Dart Express');
      setTrackingNumberInput('');
    } else if (type === 'return') {
      setCourierCompanyInput('Blue Dart Secure Armored');
      setTrackingNumberInput('');
    }
  };

  // Execute transition action
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForAction || !actionModalType) return;

    if (actionModalType === 'accept') {
      if (estimatedPriceInput <= 0) {
        showToast('Error', 'Please enter a valid estimated price quote.', 'warning');
        return;
      }
      await transitionServiceRequest(selectedRequestForAction.id, {
        targetState: 'ServiceRequestAccepted',
        action: 'Accept Request',
        userId: String(currentUser.id),
        userName: currentUser.name,
        userRole: currentUser.role,
        estimatedPrice: Number(estimatedPriceInput),
        notes: actionNotesInput.trim() || 'Service request approved with preliminary estimate.'
      });
    } else if (actionModalType === 'reject') {
      if (!actionNotesInput.trim()) {
        showToast('Error', 'Please provide a reason for declining service.', 'warning');
        return;
      }
      await transitionServiceRequest(selectedRequestForAction.id, {
        targetState: 'ServiceRequestRejected',
        action: 'Reject Request',
        userId: String(currentUser.id),
        userName: currentUser.name,
        userRole: currentUser.role,
        rejectionReason: actionNotesInput.trim()
      });
    } else if (actionModalType === 'ship') {
      if (!courierCompanyInput.trim() || !trackingNumberInput.trim()) {
        showToast('Error', 'Please enter both courier company and tracking number.', 'warning');
        return;
      }
      await transitionServiceRequest(selectedRequestForAction.id, {
        targetState: 'InTransit',
        action: 'Dispatch Watch',
        userId: String(currentUser.id),
        userName: currentUser.name,
        userRole: currentUser.role,
        courierCompany: courierCompanyInput.trim(),
        trackingNumber: trackingNumberInput.trim(),
        notes: `Dispatched via ${courierCompanyInput.trim()} (#${trackingNumberInput.trim()})`
      });
    } else if (actionModalType === 'return') {
      if (!courierCompanyInput.trim() || !trackingNumberInput.trim()) {
        showToast('Error', 'Please enter return courier and tracking number.', 'warning');
        return;
      }
      await transitionServiceRequest(selectedRequestForAction.id, {
        targetState: 'TransitBack',
        action: 'Dispatch Return',
        userId: String(currentUser.id),
        userName: currentUser.name,
        userRole: currentUser.role,
        returnCourierCompany: courierCompanyInput.trim(),
        returnTrackingNumber: trackingNumberInput.trim(),
        notes: actionNotesInput.trim() || 'Service complete; dispatched back to customer.'
      });
    }

    setActionModalType(null);
    setSelectedRequestForAction(null);
  };

  // Direct transitions (no modal needed: InTransit -> UnderRepair, UnderRepair -> InTesting)
  const handleDirectTransition = async (request: ServiceRequest, targetState: ServiceWorkflowState, actionName: string) => {
    await transitionServiceRequest(request.id, {
      targetState,
      action: actionName,
      userId: String(currentUser.id),
      userName: currentUser.name,
      userRole: currentUser.role,
      notes: `${actionName} initiated by ${currentUser.name}`
    });
  };

  // Workflow step helper
  const getWorkflowStepIndex = (state: ServiceWorkflowState): number => {
    switch (state) {
      case 'ServiceRequestCreated': return 0;
      case 'ServiceRequestAccepted': return 1;
      case 'InTransit': return 2;
      case 'UnderRepair': return 3;
      case 'InTesting': return 4;
      case 'TransitBack': return 5;
      case 'ServiceRequestRejected': return -1;
      default: return 0;
    }
  };

  const workflowSteps = [
    { id: 'ServiceRequestCreated', label: '1. Request', desc: 'Created' },
    { id: 'ServiceRequestAccepted', label: '2. Quote', desc: 'Accepted' },
    { id: 'InTransit', label: '3. In Transit', desc: 'Dispatched' },
    { id: 'UnderRepair', label: '4. Bench', desc: 'Servicing' },
    { id: 'InTesting', label: '5. Testing', desc: 'Regulating' },
    { id: 'TransitBack', label: '6. Return', desc: 'Shipped' }
  ];

  return (
    <div id="service-center-view" className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#85642F]/10 text-[#85642F] border border-[#85642F]/20">
                <Wrench className="w-3.5 h-3.5" />
                THC Certified WatchMaker Service
              </span>
              {isServiceExecutive ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Service Status Dashboard
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  <User className="w-3.5 h-3.5" />
                  Customer Service Dashboard
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1C1917]">
              Watch Service & Restoration Center
            </h1>
            <p className="text-sm text-[#78716C] max-w-2xl">
              Workflow governed maintenance lifecycle. Every diagnostic quote, courier shipment, mechanical overhaul, and regulation is strictly tracked via expert watch makers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="open-service-request-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#C5A880]" />
              New Service Request
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E5DFD5]">
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DFD5]/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">Total Watches</div>
            <div className="text-2xl font-bold font-mono text-[#1C1917] mt-1">{stats.total}</div>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DFD5]/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</div>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{stats.created}</div>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DFD5]/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Active Servicing</div>
            <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{stats.inProgress}</div>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DFD5]/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Dispatched / Returned</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{stats.completed}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* State filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'ServiceRequestCreated', label: 'Created' },
            { id: 'ServiceRequestAccepted', label: 'Accepted Quote' },
            { id: 'InTransit', label: 'In Transit' },
            { id: 'UnderRepair', label: 'Under Repair' },
            { id: 'InTesting', label: 'In Testing' },
            { id: 'TransitBack', label: 'Transit Back' },
            { id: 'ServiceRequestRejected', label: 'Rejected' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterState(pill.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                filterState === pill.id
                  ? 'bg-[#1C1917] text-[#FAF8F5] shadow-xs'
                  : 'bg-[#EDE8E0]/70 text-[#57534E] hover:bg-[#EDE8E0]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand, model, customer, tracking..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
          />
        </div>
      </div>

      {/* Service Request Cards List */}
      {visibleRequests.length === 0 ? (
        <div className="bg-[#FAF8F5] border border-dashed border-[#D8D0C5] rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EDE8E0] flex items-center justify-center mx-auto text-[#78716C]">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1C1917]">No watch service requests found</h3>
          <p className="text-xs text-[#78716C] max-w-sm mx-auto">
            {isServiceExecutive
              ? 'There are currently no watch repair requests matching the active filter.'
              : 'You have not submitted any timepieces for service yet. Click "New Service Request" to begin.'}
          </p>
          {!isServiceExecutive && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] text-xs font-bold"
            >
              Submit Your Watch
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleRequests.map((req) => {
            const stepIdx = getWorkflowStepIndex(req.currentState);
            const isOwner = String(req.userId) === String(currentUser.id);
            const isRejected = req.currentState === 'ServiceRequestRejected';

            return (
              <div
                key={req.id}
                id={`service-card-${req.id}`}
                className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-3xl p-5 md:p-6 shadow-xs hover:border-[#C5A880]/50 transition-all space-y-5"
              >
                {/* Top Card Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE1] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#85642F]">
                        TICKET #{req.id}
                      </span>
                      <span className="text-xs text-[#A8A29E]">•</span>
                      <span className="text-xs text-[#78716C] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A8A29E]" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#1C1917]">
                      {req.watchBrand} <span className="font-sans font-normal text-base text-[#57534E]">{req.watchModel}</span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Working condition badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        req.isWorking
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {req.isWorking ? '✓ Working' : '✕ Non-Working'}
                    </span>

                    {/* Glass replacement badge */}
                    {req.glassChangeRequired && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Crystal Replacement Req.
                      </span>
                    )}

                    {/* Movement badge */}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EDE8E0] text-[#57534E]">
                      {req.movementType}
                    </span>
                  </div>
                </div>

                {/* Workflow Stepper Graphic */}
                {!isRejected ? (
                  <div className="py-2">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {workflowSteps.map((step, idx) => {
                        const isDone = idx < stepIdx;
                        const isCurrent = idx === stepIdx;
                        return (
                          <div
                            key={step.id}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              isCurrent
                                ? 'bg-[#85642F]/10 border-[#85642F] text-[#85642F] font-bold shadow-2xs'
                                : isDone
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 font-medium'
                                : 'bg-[#FAF8F5] border-[#EAE4DC] text-[#A8A29E]'
                            }`}
                          >
                            <div className="text-[10px] uppercase font-mono">{step.label}</div>
                            <div className="text-[11px] truncate mt-0.5">
                              {isDone ? '✓ ' + step.desc : isCurrent ? '● ' + step.desc : step.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Service Request Declined:</strong> {req.rejectionReason || 'Atelier unable to fulfill service specs.'}
                    </span>
                  </div>
                )}

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF8F5] text-xs">
                  {/* Issue details */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
                      Issue Description
                    </span>
                    <p className="text-[#1C1917] leading-relaxed">{req.issueDescription}</p>
                  </div>

                  {/* Pricing and Logistics */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
                      Pricing & Courier Tracking
                    </span>
                    <div className="space-y-1">
                      {req.estimatedPrice ? (
                        <div className="font-mono font-bold text-sm text-[#1C1917]">
                          Est. Quote: ₹{req.estimatedPrice.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-[#A8A29E] italic">Quote pending assessment</div>
                      )}

                      {req.trackingNumber && (
                        <div className="text-[#57534E] flex items-center gap-1 font-mono">
                          <Truck className="w-3.5 h-3.5 text-[#85642F]" />
                          <span>{req.courierCompany}: {req.trackingNumber}</span>
                        </div>
                      )}

                      {req.returnTrackingNumber && (
                        <div className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Return: {req.returnCourierCompany} #{req.returnTrackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User & Atelier Notes */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
                      {isServiceExecutive ? 'Customer Contact' : 'Service Atelier'}
                    </span>
                    {isServiceExecutive ? (
                      <div className="text-[#1C1917] space-y-0.5">
                        <div className="font-bold">{req.customerName} (User #{req.userId})</div>
                        {req.customerEmail && <div className="text-[#78716C]">{req.customerEmail}</div>}
                        {req.customerPhone && <div className="text-[#78716C]">{req.customerPhone}</div>}
                      </div>
                    ) : (
                      <div className="text-[#1C1917] space-y-0.5">
                        <div className="font-bold">Geneva Service Atelier</div>
                        <div className="text-[#78716C]">Lead: Jean-Marc Piguet</div>
                        {req.serviceNotes && (
                          <div className="text-[11px] text-[#85642F] mt-1 bg-[#85642F]/10 p-1.5 rounded-lg border border-[#85642F]/20">
                            {req.serviceNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* State Transition Actions Row (Rule 10: Strict Role Permission Enforcement) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-[#78716C]">
                    Current Status:{' '}
                    <span className="font-bold text-[#1C1917]">{req.currentState}</span>
                  </div>

                  {/* Actions Matrix */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* STATE 1: ServiceRequestCreated */}
                    {req.currentState === 'ServiceRequestCreated' && (
                      <>
                        {isServiceExecutive ? (
                          <>
                            <button
                              id={`accept-btn-${req.id}`}
                              onClick={() => openActionModal(req, 'accept')}
                              className="px-4 py-2 rounded-xl bg-[#85642F] hover:bg-[#6B5026] text-[#FAF8F5] text-xs font-bold transition-all shadow-2xs"
                            >
                              Assess & Accept Quote
                            </button>
                            <button
                              id={`reject-btn-${req.id}`}
                              onClick={() => openActionModal(req, 'reject')}
                              className="px-3 py-2 rounded-xl bg-[#FFFFFF] border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-medium transition-all"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <button
                            disabled
                            title="Action locked: Service Executive must provide price quote and approve request."
                            className="px-4 py-2 rounded-xl bg-[#EDE8E0] text-[#A8A29E] text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-[#D8D0C5]"
                          >
                            <Lock className="w-3.5 h-3.5 text-[#A8A29E]" />
                            Awaiting Atelier Quote Review
                          </button>
                        )}
                      </>
                    )}

                    {/* STATE 2: ServiceRequestAccepted */}
                    {req.currentState === 'ServiceRequestAccepted' && (
                      <>
                        {isOwner ? (
                          <button
                            id={`dispatch-btn-${req.id}`}
                            onClick={() => openActionModal(req, 'ship')}
                            className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#C5A880]" />
                            Dispatch Watch (Add Tracking)
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Action locked: Customer must dispatch the timepiece and provide tracking number."
                            className="px-4 py-2 rounded-xl bg-[#EDE8E0] text-[#A8A29E] text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-[#D8D0C5]"
                          >
                            <Lock className="w-3.5 h-3.5 text-[#A8A29E]" />
                            Awaiting Customer Shipment
                          </button>
                        )}
                      </>
                    )}

                    {/* STATE 3: InTransit */}
                    {req.currentState === 'InTransit' && (
                      <>
                        {isServiceExecutive ? (
                          <button
                            id={`receive-repair-btn-${req.id}`}
                            onClick={() => handleDirectTransition(req, 'UnderRepair', 'Begin Repair')}
                            className="px-4 py-2 rounded-xl bg-[#85642F] hover:bg-[#6B5026] text-[#FAF8F5] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <Wrench className="w-3.5 h-3.5 text-[#E7DFD5]" />
                            Receive & Begin Repair
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Action locked: Waiting for Service Atelier package intake and bench disassembly."
                            className="px-4 py-2 rounded-xl bg-[#EDE8E0] text-[#A8A29E] text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-[#D8D0C5]"
                          >
                            <Lock className="w-3.5 h-3.5 text-[#A8A29E]" />
                            In Transit to Atelier
                          </button>
                        )}
                      </>
                    )}

                    {/* STATE 4: UnderRepair */}
                    {req.currentState === 'UnderRepair' && (
                      <>
                        {isServiceExecutive ? (
                          <button
                            id={`move-testing-btn-${req.id}`}
                            onClick={() => handleDirectTransition(req, 'InTesting', 'Move to Testing')}
                            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-[#FAF8F5] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            Complete Repair & Move to Testing
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Action locked: Master Horologist actively servicing movement."
                            className="px-4 py-2 rounded-xl bg-[#EDE8E0] text-[#A8A29E] text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-[#D8D0C5]"
                          >
                            <Lock className="w-3.5 h-3.5 text-[#A8A29E]" />
                            Master Watchmaker Working
                          </button>
                        )}
                      </>
                    )}

                    {/* STATE 5: InTesting */}
                    {req.currentState === 'InTesting' && (
                      <>
                        {isServiceExecutive ? (
                          <button
                            id={`dispatch-return-btn-${req.id}`}
                            onClick={() => openActionModal(req, 'return')}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#FAF8F5] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <PackageCheck className="w-3.5 h-3.5 text-emerald-200" />
                            Testing Passed - Dispatch Return
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Action locked: 48-hour chronometer regulation and water resistance testing underway."
                            className="px-4 py-2 rounded-xl bg-[#EDE8E0] text-[#A8A29E] text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-[#D8D0C5]"
                          >
                            <Lock className="w-3.5 h-3.5 text-[#A8A29E]" />
                            Chronometer Testing Underway
                          </button>
                        )}
                      </>
                    )}

                    {/* STATE 6: TransitBack (Final State) */}
                    {req.currentState === 'TransitBack' && (
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Service Completed & Shipped
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Create New Service Request (End User)                             */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1C1917] flex items-center justify-center text-[#C5A880]">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                    New Service & Repair Request
                  </h3>
                  <p className="text-[11px] text-[#78716C]">State: ServiceRequestCreated</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Watch Brand *
                </label>
                <input
                  type="text"
                  required
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="e.g. Rolex, Omega, Patek Philippe, Seiko"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Watch Model & Reference *
                </label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. Submariner 126610LN or Speedmaster Pro"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Movement Type
                  </label>
                  <select
                    value={newMovement}
                    onChange={(e) => setNewMovement(e.target.value as WatchMovement)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual Winding">Manual Winding</option>
                    <option value="Quartz">Quartz</option>
                    <option value="Spring Drive">Spring Drive</option>
                    <option value="Solar">Solar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                  />
                </div>
              </div>

              {/* Working Condition Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5]">
                <div>
                  <div className="font-bold text-[#1C1917]">Is the watch currently ticking?</div>
                  <div className="text-[10px] text-[#78716C]">Working vs non-working balance wheel</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewIsWorking(true)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      newIsWorking ? 'bg-emerald-600 text-white' : 'bg-[#EDE8E0] text-[#78716C]'
                    }`}
                  >
                    Working
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIsWorking(false)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      !newIsWorking ? 'bg-rose-600 text-white' : 'bg-[#EDE8E0] text-[#78716C]'
                    }`}
                  >
                    Non-Working
                  </button>
                </div>
              </div>

              {/* Glass Change Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5]">
                <div>
                  <div className="font-bold text-[#1C1917]">Front Glass / Crystal Replacement Required?</div>
                  <div className="text-[10px] text-[#78716C]">Scratched or cracked sapphire/mineral glass</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewGlassChange(!newGlassChange)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    newGlassChange ? 'bg-[#85642F] text-white' : 'bg-[#EDE8E0] text-[#78716C]'
                  }`}
                >
                  {newGlassChange ? 'Yes (Replace)' : 'No (Intact)'}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Issue Description & Desired Servicing *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newIssueDesc}
                  onChange={(e) => setNewIssueDesc(e.target.value)}
                  placeholder="Describe defects, time loss/gain, water exposure, or requested service (e.g. ultrasonic clean, chronograph reset)..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8D0C5] text-[#57534E] hover:bg-[#EDE8E0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF8F5] font-bold uppercase tracking-wider"
                >
                  Submit Service Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Workflow State Transition Actions Modal                          */}
      {/* ========================================================================= */}
      {actionModalType && selectedRequestForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl max-w-md w-full p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                {actionModalType === 'accept' && 'Accept Service Request'}
                {actionModalType === 'reject' && 'Decline Service Request'}
                {actionModalType === 'ship' && 'Dispatch Watch to Atelier'}
                {actionModalType === 'return' && 'Dispatch Return to Customer'}
              </h3>
              <button
                onClick={() => setActionModalType(null)}
                className="p-1 rounded-full text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#78716C] mb-4">
              Watch:{' '}
              <span className="font-bold text-[#1C1917]">
                {selectedRequestForAction.watchBrand} {selectedRequestForAction.watchModel}
              </span>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              {/* Accept Request: Estimated Price */}
              {actionModalType === 'accept' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Estimated Repair Quote (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      step={500}
                      value={estimatedPriceInput}
                      onChange={(e) => setEstimatedPriceInput(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Diagnostic Assessment Notes
                    </label>
                    <textarea
                      rows={2}
                      value={actionNotesInput}
                      onChange={(e) => setActionNotesInput(e.target.value)}
                      placeholder="Add assessment remarks, recommended replacements, or overhaul timeframe..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                    />
                  </div>
                </>
              )}

              {/* Reject Request */}
              {actionModalType === 'reject' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={actionNotesInput}
                    onChange={(e) => setActionNotesInput(e.target.value)}
                    placeholder="Explain why the atelier cannot service this piece (e.g. counterfeit parts, obsolete movement, unavailable spares)..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-rose-300 text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              {/* Ship to Center / Return Dispatch */}
              {(actionModalType === 'ship' || actionModalType === 'return') && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Courier / Carrier Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={courierCompanyInput}
                      onChange={(e) => setCourierCompanyInput(e.target.value)}
                      placeholder="e.g. Blue Dart, FedEx, DHL, DTDC"
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Tracking / Air Waybill Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      placeholder="e.g. BD-994820194IN or FDX-8822019"
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] font-mono focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                      Shipment Notes
                    </label>
                    <input
                      type="text"
                      value={actionNotesInput}
                      onChange={(e) => setActionNotesInput(e.target.value)}
                      placeholder="e.g. Insured parcel, signature required"
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D0C5] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#85642F]"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setActionModalType(null)}
                  className="px-4 py-2 rounded-xl border border-[#D8D0C5] text-[#57534E] hover:bg-[#EDE8E0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold uppercase tracking-wider text-white shadow-2xs ${
                    actionModalType === 'reject' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-[#1C1917] hover:bg-[#2D2A26]'
                  }`}
                >
                  Confirm & Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

