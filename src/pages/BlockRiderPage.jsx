import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { getRiderById, blockRider, unblockRider, demoRiders } from '../data/demoRiders'
import { getStatusBadge, getVerificationBadge } from '../utils/riderBadges'

const BLOCK_REASONS = [
  { id: 'safety', label: 'Safety Violation / Reckless Driving', description: 'Reported reckless driving, traffic violations, or speeding.' },
  { id: 'cancellation', label: 'Frequent Rejections / Unreasonable Cancellations', description: 'Excessive order cancellations after accepting pickup.' },
  { id: 'compliance', label: 'Expired Documents / Missing Insurance', description: 'Driver license, commercial insurance or registration expired.' },
  { id: 'conduct', label: 'Customer or Merchant Harassment', description: 'Inappropriate language, disputes, or abusive behavior.' },
  { id: 'fraud', label: 'Vehicle / Rider Substitution Fraud', description: 'Courier dispatched a different individual or unregistered vehicle.' },
  { id: 'financial', label: 'Cash Collection / Wallet Discrepancy', description: 'Disputes over cash-on-delivery settlement or negative balance.' },
  { id: 'other', label: 'Other Regulatory / Internal Policy Violation', description: 'Specify custom reason and administrative notes below.' },
]

const BlockRiderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rider] = useState(() => getRiderById(id) || demoRiders.find((r) => r.id === id))

  const [selectedReason, setSelectedReason] = useState(BLOCK_REASONS[0].id)
  const [customReason, setCustomReason] = useState('')
  const [actionType, setActionType] = useState('temporary') // 'temporary' | 'permanent'
  const [duration, setDuration] = useState('7_days')
  const [ticketId, setTicketId] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [revokeSessions, setRevokeSessions] = useState(true)
  const [freezeWallet, setFreezeWallet] = useState(true)
  const [notifyCourier, setNotifyCourier] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const finalBanReason = useMemo(() => {
    const selectedObj = BLOCK_REASONS.find((r) => r.id === selectedReason)
    if (selectedReason === 'other') {
      return customReason.trim() || 'Administrative policy suspension'
    }
    return selectedObj ? `${selectedObj.label}${customReason.trim() ? `: ${customReason.trim()}` : ''}` : 'Administrative ban'
  }, [selectedReason, customReason])

  if (!rider) {
    return (
      <MainLayout activeMenuKey="riderManagement" breadcrumbParent="Riders" breadcrumbCurrent="Block Rider">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="material-symbols-outlined text-5xl text-rose-400">person_off</span>
          <h2 className="mt-4 font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-800 dark:text-zinc-100">
            Courier Record Not Found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Could not find courier profile matching ID <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{id}</span>.
          </p>
          <button
            type="button"
            onClick={() => navigate('/riders')}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#e0531f]"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Return to Fleet Overview
          </button>
        </div>
      </MainLayout>
    )
  }

  const isAlreadyBlocked = rider.status === 'BLOCKED'

  const handleConfirmBlock = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      blockRider(rider.id, finalBanReason, {
        action_type: actionType,
        duration: actionType === 'temporary' ? duration : 'PERMANENT',
        ticket_id: ticketId || `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
        admin_notes: adminNotes,
        revoke_sessions: revokeSessions,
        freeze_wallet: freezeWallet,
        notified_courier: notifyCourier,
      })
      setIsSubmitting(false)
      navigate(`/riders/${rider.id}`)
    }, 400)
  }

  const handleUnblock = () => {
    unblockRider(rider.id)
    navigate(`/riders/${rider.id}`)
  }

  return (
    <MainLayout
      activeMenuKey="riderManagement"
      breadcrumbParent="Riders"
      breadcrumbMiddle={rider.full_name}
      breadcrumbCurrent={isAlreadyBlocked ? 'Manage Suspension' : 'Suspend Courier'}
    >
      <div className="mx-auto max-w-4xl space-y-6 pb-16">
        {/* Navigation Breadcrumb Back */}
        <div className="flex items-center justify-between">
          <Link
            to={`/riders/${rider.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Courier Profile
          </Link>
          <span className="text-xs text-slate-400 dark:text-zinc-500">Security & Enforcement Module</span>
        </div>

        {/* Courier Summary Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={rider.profile_picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={rider.full_name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-zinc-800 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {rider.full_name}
                  </h2>
                  <span className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500">
                    {rider.id}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <span>{rider.phone_number}</span>
                  <span>•</span>
                  <span>{rider.vehicle?.vehicle_type || 'Motorcycle'} ({rider.vehicle?.plate_number || 'N/A'})</span>
                  <span>•</span>
                  <span>{rider.completed_orders || 0} completed orders</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              {getStatusBadge(rider.status)}
              {getVerificationBadge(rider.verification_status)}
            </div>
          </div>

          {isAlreadyBlocked && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs dark:border-rose-900/60 dark:bg-rose-950/40">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200">
                    <span className="material-symbols-outlined text-base text-rose-600">block</span>
                    Account Currently Suspended
                  </div>
                  <p className="text-rose-700/90 dark:text-rose-300">
                    <span className="font-semibold">Reason:</span> {rider.ban_reason || 'Administrative restriction'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUnblock}
                  className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  Unblock & Restore Access
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Warning Callout */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5 text-xl text-amber-600 dark:text-amber-400">
              warning
            </span>
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <h4 className="font-bold">Important Operational Impact</h4>
              <p className="mt-0.5 leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                Suspending this courier will immediately revoke their mobile dispatch app access, pause order distribution,
                and reassign any active orders to neighboring fleet couriers. Wallet disbursements will be frozen until resolved.
              </p>
            </div>
          </div>
        </div>

        {/* Enforcement Form */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-slate-100 pb-4 dark:border-zinc-800">
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-slate-900 dark:text-zinc-100">
              {isAlreadyBlocked ? 'Update Suspension Details' : 'Enforce Account Suspension / Block'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Select the primary cause, suspension type, and regulatory documentation notes for the audit ledger.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              Primary Infraction Reason <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {BLOCK_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id
                return (
                  <div
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 text-rose-900 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/30 dark:text-rose-100'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedReason(reason.id)}
                        className="mt-0.5 accent-rose-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {reason.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Additional details */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              Specific Infraction Summary / Incident Clarification
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Courier failed to produce valid insurance policy during annual fleet checkup"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-hidden focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-100"
            />
          </div>

          {/* Action Type & Duration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Suspension Scope
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="actionType"
                    value="temporary"
                    checked={actionType === 'temporary'}
                    onChange={() => setActionType('temporary')}
                    className="accent-rose-600"
                  />
                  Temporary Suspension
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="actionType"
                    value="permanent"
                    checked={actionType === 'permanent'}
                    onChange={() => setActionType('permanent')}
                    className="accent-rose-600"
                  />
                  Permanent Fleet Ban
                </label>
              </div>
            </div>

            {actionType === 'temporary' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Suspension Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="24_hours">24 Hours (Warning cooldown)</option>
                  <option value="3_days">3 Days</option>
                  <option value="7_days">7 Days (1 Week standard investigation)</option>
                  <option value="14_days">14 Days (2 Weeks)</option>
                  <option value="30_days">30 Days (Document renewal window)</option>
                  <option value="until_resolved">Until Compliance Resolution</option>
                </select>
              </div>
            )}
          </div>

          {/* Audit & Ticket ID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Support Ticket / Audit Incident Reference
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="e.g. INC-84920"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Internal Administrative Notes (Ledger only)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Include internal references, customer IDs, or police report numbers..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Enforcement Checkboxes */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2.5">
            <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Automated Safeguard Protocols</h5>
            
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={revokeSessions}
                onChange={(e) => setRevokeSessions(e.target.checked)}
                className="rounded-sm accent-rose-600"
              />
              <span>Revoke live bearer token and terminate mobile dispatch app sessions immediately</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={freezeWallet}
                onChange={(e) => setFreezeWallet(e.target.checked)}
                className="rounded-sm accent-rose-600"
              />
              <span>Freeze courier wallet payouts (ETB {rider.wallet_balance?.toLocaleString() || '0'}) until investigation is completed</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCourier}
                onChange={(e) => setNotifyCourier(e.target.checked)}
                className="rounded-sm accent-rose-600"
              />
              <span>Dispatch automated SMS notification with appeal instructions to {rider.phone_number}</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => navigate(`/riders/${rider.id}`)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
              >
                <span className="material-symbols-outlined text-base">gavel</span>
                {isAlreadyBlocked ? 'Update Suspension Order' : 'Execute Account Suspension'}
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60">
                  <span className="material-symbols-outlined text-2xl">block</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                    Confirm Courier Account Suspension
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{rider.full_name} ({rider.id})</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 dark:bg-zinc-800/60 dark:text-zinc-300 space-y-1.5">
                <p><span className="font-semibold text-slate-900 dark:text-zinc-100">Reason:</span> {finalBanReason}</p>
                <p><span className="font-semibold text-slate-900 dark:text-zinc-100">Scope:</span> {actionType === 'permanent' ? 'Permanent Fleet Ban' : `Temporary (${duration})`}</p>
                <p><span className="font-semibold text-slate-900 dark:text-zinc-100">Active Orders:</span> Reassigned automatically</p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBlock}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check</span>
                      Confirm & Enforce
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default BlockRiderPage
