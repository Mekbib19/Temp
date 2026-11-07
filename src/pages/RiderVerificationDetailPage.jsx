import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import {
  loadStoredRiders,
  updateRiderDocumentVerification,
  updateRider,
  resetRiderVerificationToPending,
} from '../data/demoRiders'
import { getVerificationBadge, getVehicleIcon } from '../utils/riderBadges'
import { ComplianceDocumentVisual } from '../components/ComplianceDocumentVisual'
import { DocumentViewerModal } from '../components/DocumentViewerModal'

const DOC_REJECTION_REASONS = {
  LICENSE: [
    "Driver's License is expired or invalid for commercial motorcycle/vehicle operations",
    'License scan is blurry, dark, cropped, or unreadable',
    'Name on license does not match courier legal application name',
    'License category does not permit commercial courier dispatch',
    'Missing front or back scan of driver license',
  ],
  ID_CARD: [
    'National ID scan is blurry, damaged, or unreadable',
    'National ID is expired or invalid',
    'Facial photograph does not match courier portrait',
    'National ID number cannot be validated against registry',
    'Missing reverse side of national identity card',
  ],
  INSURANCE: [
    'Commercial fleet insurance endorsement is expired or invalid',
    'Policy coverage amount is below required municipal minimum',
    'Vehicle plate number does not match registered policy schedule',
    'Policy holder name does not match courier or authorized fleet operator',
    'Insurance certificate scan missing official seal or stamp',
  ],
  VEHICLE_REGISTRATION: [
    'Vehicle plate number does not match submitted registration title',
    'Title document is expired or shows active road safety suspension',
    'Vehicle chassis / VIN number mismatch',
    'Owner transfer documentation is incomplete or missing',
    'Annual roadworthiness inspection sticker expired',
  ],
  BACKGROUND_CHECK: [
    'Criminal background clearance certificate expired (older than 6 months)',
    'Certificate missing official federal police biometric stamp',
    'Document scan is low resolution or cropped',
    'Clearance check failed compliance thresholds',
  ],
  OTHER: [
    'Document scan is unreadable or corrupted',
    'Document expired prior to application submission',
    'Information mismatch with courier records',
    'Other / Custom reason',
  ],
}

export default function RiderVerificationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Load rider data
  const [rider, setRider] = useState(() => {
    const list = loadStoredRiders()
    return list.find((r) => r.id === id || String(r.id).toLowerCase() === String(id).toLowerCase()) || null
  })

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Reload rider whenever data updates
  const refreshRider = useCallback(() => {
    const list = loadStoredRiders()
    const found = list.find((r) => r.id === id || String(r.id).toLowerCase() === String(id).toLowerCase())
    if (found) {
      setRider(found)
    }
  }, [id])

  useEffect(() => {
    window.addEventListener('riders-data-updated', refreshRider)
    return () => window.removeEventListener('riders-data-updated', refreshRider)
  }, [refreshRider])

  // Fullscreen Doc Lightbox
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [modalInitialSide, setModalInitialSide] = useState('FRONT')
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)

  // Track active page side per document card: { [docId]: 'FRONT' | 'BACK' }
  const [docSides, setDocSides] = useState({})

  const handleOpenDocModal = (doc, initialSide = 'FRONT') => {
    setSelectedDoc(doc)
    setModalInitialSide(initialSide)
    setIsDocModalOpen(true)
  }

  // Rejection modal / drawer per document
  const [rejectingDocId, setRejectingDocId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectNote, setRejectNote] = useState('')

  // Inline notes editing per document
  const [editingNotesDocId, setEditingNotesDocId] = useState(null)
  const [docNotesText, setDocNotesText] = useState('')

  // Document stats
  const docs = useMemo(() => rider?.documents || [], [rider])
  const approvedDocsCount = useMemo(() => docs.filter((d) => d.status === 'APPROVED').length, [docs])
  const rejectedDocsCount = useMemo(() => docs.filter((d) => d.status === 'REJECTED').length, [docs])
  const pendingDocsCount = useMemo(() => docs.filter((d) => d.status === 'PENDING' || !d.status).length, [docs])

  if (!rider) {
    return (
      <MainLayout
        activeMenuKey="riderVerification"
        breadcrumbParent="Riders"
        breadcrumbCurrent="Verification Details"
      >
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
            <span className="material-symbols-outlined text-3xl">person_off</span>
          </div>
          <h2 className="mt-4 font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-800 dark:text-zinc-100">
            Courier Not Found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            No applicant was found with identifier &quot;{id}&quot;.
          </p>
          <button
            type="button"
            onClick={() => navigate('/riders/verification')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Verification Queue
          </button>
        </div>
      </MainLayout>
    )
  }

  // Handle approving a single document
  const handleApproveDocument = (doc) => {
    const updated = updateRiderDocumentVerification(rider.id, doc.id, {
      status: 'APPROVED',
      notes: doc.review_notes || `Approved on ${new Date().toLocaleDateString()}`,
      verified_by: 'Super Admin Operations',
    })
    if (updated) {
      setRider(updated)
      showToast(`${doc.document_name || doc.document_type} verified and approved successfully!`, 'success')
    }
  }

  // Open rejection form for a single document
  const handleOpenRejectDoc = (doc) => {
    setRejectingDocId(doc.id)
    const presetList = DOC_REJECTION_REASONS[doc.document_type] || DOC_REJECTION_REASONS.OTHER
    setRejectReason(presetList[0])
    setRejectNote('')
  }

  // Submit rejection for a single document
  const handleConfirmRejectDoc = (docId) => {
    const finalReason = rejectNote.trim() ? `${rejectReason}: ${rejectNote.trim()}` : rejectReason
    const updated = updateRiderDocumentVerification(rider.id, docId, {
      status: 'REJECTED',
      rejection_reason: finalReason,
      notes: rejectNote.trim() || undefined,
    })
    if (updated) {
      setRider(updated)
      setRejectingDocId(null)
      setRejectReason('')
      setRejectNote('')
      showToast(`Document marked as rejected. Courier must resubmit.`, 'error')
    }
  }

  // Reset a document back to pending
  const handleResetDoc = (docId) => {
    const updated = updateRiderDocumentVerification(rider.id, docId, {
      status: 'PENDING',
      rejection_reason: null,
      notes: 'Audit reopened for re-inspection.',
    })
    if (updated) {
      setRider(updated)
      showToast('Document returned to Pending review.', 'info')
    }
  }

  // Save audit note for a document
  const handleSaveDocNote = (docId) => {
    const updated = updateRiderDocumentVerification(rider.id, docId, {
      status: docs.find((d) => d.id === docId)?.status || 'PENDING',
      notes: docNotesText,
    })
    if (updated) {
      setRider(updated)
      setEditingNotesDocId(null)
      showToast('Auditor note saved.', 'success')
    }
  }

  // Overall Reset to Pending
  const handleResetEntireRider = () => {
    const updated = resetRiderVerificationToPending(rider.id, 'Returned to pending review queue for complete reassessment.')
    if (updated) {
      setRider(updated)
      showToast('Courier verification reset to Pending Review.', 'info')
    }
  }

  // Toggle Vehicle approval status
  const handleToggleVehicleVerification = () => {
    if (!rider.vehicle) return
    const newVehicleStatus = rider.vehicle.status === 'APPROVED' ? 'PENDING' : 'APPROVED'
    const updatedVehicle = {
      ...rider.vehicle,
      status: newVehicleStatus,
      verified_at: newVehicleStatus === 'APPROVED' ? new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : null,
    }
    const updated = updateRider(rider.id, { vehicle: updatedVehicle })
    if (updated) {
      setRider(updated)
      showToast(`Vehicle inspection status updated to ${newVehicleStatus}.`, 'success')
    }
  }

  return (
    <MainLayout
      activeMenuKey="riderVerification"
      breadcrumbParent="Riders"
      breadcrumbCurrent={`${rider.full_name} Verification`}
    >
      <div className="space-y-6 pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-bold text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600'
                : toastMessage.type === 'error'
                ? 'bg-rose-600'
                : 'bg-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toastMessage.type === 'success' ? 'check_circle' : toastMessage.type === 'error' ? 'cancel' : 'info'}
            </span>
            <span>{toastMessage.message}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Top Navigation & Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/riders/verification')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Return to Verification Queue"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  Courier KYC &amp; Document Audit
                </h1>
                {getVerificationBadge(rider.verification_status)}
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Inspect and approve each compliance credential individually. Overall status updates automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/riders/${rider.id}`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">person</span>
              <span>View Full Profile</span>
            </button>

            <button
              type="button"
              onClick={handleResetEntireRider}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 shadow-2xs transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400"
              title="Reset entire application to pending"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              <span>Reset All to Pending</span>
            </button>
          </div>
        </div>

        {/* Applicant Summary Banner */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Courier Profile Info */}
            <div className="flex items-start gap-4">
              <img
                src={rider.profile_picture}
                alt={rider.full_name}
                className="h-20 w-20 rounded-2xl border-2 border-slate-200/80 object-cover shadow-sm dark:border-zinc-700"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {rider.full_name}
                  </h2>
                  <span className="rounded-md bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {rider.id}
                  </span>
                  <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold text-[#FF6B35] border border-orange-200/60 dark:bg-orange-950/40 dark:border-orange-900/50">
                    {rider.level || 'Standard'} Courier
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-base text-slate-400">call</span>
                    {rider.phone_number}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-base text-slate-400">mail</span>
                    {rider.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
                    Applied: {rider.joined_date || 'Recent'}
                  </span>
                </div>

                {rider.vehicle && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <span className="material-symbols-outlined text-base text-[#FF6B35]">
                        {getVehicleIcon(rider.vehicle.vehicle_type)}
                      </span>
                      <span>
                        {rider.vehicle.brand} {rider.vehicle.model} ({rider.vehicle.year})
                      </span>
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs font-bold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200">
                      {rider.vehicle.plate_number}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                      rider.vehicle.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {rider.vehicle.status === 'APPROVED' ? 'check_circle' : 'pending'}
                      </span>
                      Vehicle: {rider.vehicle.status || 'PENDING'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Verification Progress KPI */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 lg:min-w-[320px] dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Document Progress
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {approvedDocsCount} of {docs.length} Approved
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${docs.length > 0 ? (approvedDocsCount / docs.length) * 100 : 0}%` }}
                />
              </div>

              {/* Stats badges */}
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {approvedDocsCount} Approved
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined text-sm">hourglass_top</span>
                  {pendingDocsCount} Pending
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  {rejectedDocsCount} Rejected
                </span>
              </div>
            </div>
          </div>

          {/* Overall Status Banner */}
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-zinc-800">
            {rider.verification_status === 'APPROVED' ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="material-symbols-outlined text-2xl text-emerald-600 dark:text-emerald-400">
                  check_circle
                </span>
                <div>
                  <p className="font-bold">Courier Certified &amp; Ready for Live Orders</p>
                  <p className="mt-0.5 text-emerald-700 dark:text-emerald-400/90">
                    All required compliance credentials have been individually certified by compliance auditors. The courier can receive automatic dispatch routing.
                  </p>
                </div>
              </div>
            ) : rider.verification_status === 'REJECTED' ? (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                <span className="material-symbols-outlined text-2xl text-rose-600 dark:text-rose-400">
                  warning
                </span>
                <div>
                  <p className="font-bold">Verification Incomplete — Rejections Flagged</p>
                  <p className="mt-0.5 text-rose-700 dark:text-rose-300/90">
                    {rider.rejection_reason || 'One or more credentials failed validation standards. See individual rejection notes below.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">
                  pending_actions
                </span>
                <div>
                  <p className="font-bold">Awaiting Individual Document Approval</p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400/90">
                    Review each document below one-by-one. When all credentials are authenticated and approved, this courier will be promoted to Verified &amp; Active.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: INDIVIDUAL DOCUMENT REVIEW LIST */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900 dark:text-zinc-100">
                Submitted Compliance Credentials ({docs.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Audit each document individually. Click &quot;Approve&quot; or &quot;Reject&quot; on each card below.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Auditor: Super Admin Operations
            </span>
          </div>

          {docs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600">
                folder_off
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                No documents uploaded for this courier.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {docs.map((doc, index) => {
                const isApproved = doc.status === 'APPROVED'
                const isRejected = doc.status === 'REJECTED'
                const isPending = !isApproved && !isRejected
                const isRejectingThis = rejectingDocId === doc.id
                const isEditingNotesThis = editingNotesDocId === doc.id
                const presetReasons = DOC_REJECTION_REASONS[doc.document_type] || DOC_REJECTION_REASONS.OTHER

                return (
                  <div
                    key={doc.id || index}
                    className={`overflow-hidden rounded-2xl border transition-all duration-200 shadow-xs ${
                      isApproved
                        ? 'border-emerald-200/90 bg-white dark:border-emerald-900/30 dark:bg-zinc-900'
                        : isRejected
                        ? 'border-rose-200/90 bg-white dark:border-rose-900/30 dark:bg-zinc-900'
                        : 'border-slate-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    {/* Document Header Bar */}
                    <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${
                      isApproved
                        ? 'border-emerald-100 bg-emerald-50/40 dark:border-emerald-950/40 dark:bg-emerald-950/10'
                        : isRejected
                        ? 'border-rose-100 bg-rose-50/40 dark:border-rose-950/40 dark:bg-rose-950/10'
                        : 'border-slate-100 bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-800/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-2xs border border-slate-200/70 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
                          <span className="material-symbols-outlined text-base">
                            {doc.document_type === 'LICENSE'
                              ? 'badge'
                              : doc.document_type === 'ID_CARD'
                              ? 'fingerprint'
                              : doc.document_type === 'INSURANCE'
                              ? 'verified_user'
                              : doc.document_type === 'VEHICLE_REGISTRATION'
                              ? 'directions_car'
                              : 'description'}
                          </span>
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                              {doc.document_name || doc.document_type}
                            </h3>
                            <span className="rounded-md bg-slate-200/70 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">
                              {doc.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Type: <span className="font-semibold">{doc.document_type}</span> • File: {doc.file_type || 'Secure PDF/Image'} {doc.file_size ? `(${doc.file_size})` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Status indicator pill */}
                      <div className="flex items-center gap-2">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Rejected
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            <span className="material-symbols-outlined text-sm">pending</span>
                            Pending Audit
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Document Content: Visual Mockup + Metadata Details */}
                    <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-12">
                      {/* Left: Document Visual Preview (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col justify-between">
                        {/* Page Selector Tabs: Front / Back */}
                        <div className="mb-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                            <button
                              type="button"
                              onClick={() => setDocSides((prev) => ({ ...prev, [doc.id]: 'FRONT' }))}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                (docSides[doc.id] || 'FRONT') === 'FRONT'
                                  ? 'bg-[#FF6B35] text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-300'
                              }`}
                            >
                              Front Page
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocSides((prev) => ({ ...prev, [doc.id]: 'BACK' }))}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                docSides[doc.id] === 'BACK'
                                  ? 'bg-[#FF6B35] text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-300'
                              }`}
                            >
                              Back Page (Page 2)
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setDocSides((prev) => ({
                                ...prev,
                                [doc.id]: (docSides[doc.id] || 'FRONT') === 'FRONT' ? 'BACK' : 'FRONT',
                              }))
                            }
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-[#FF6B35] hover:bg-orange-50 dark:hover:bg-orange-950/20"
                            title="Flip to other side"
                          >
                            <span className="material-symbols-outlined text-xs">sync</span>
                            <span>Flip Side</span>
                          </button>
                        </div>

                        {/* Interactive Preview Canvas */}
                        <div
                          onClick={() => handleOpenDocModal(doc, docSides[doc.id] || 'FRONT')}
                          className="group/doc relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 transition hover:border-[#FF6B35] hover:shadow-md dark:border-zinc-700"
                          title="Click to open interactive document viewer"
                        >
                          <ComplianceDocumentVisual
                            doc={doc}
                            rider={rider}
                            side={docSides[doc.id] || 'FRONT'}
                            isThumbnail={false}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition group-hover/doc:opacity-100">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md">
                              <span className="material-symbols-outlined text-base">zoom_in</span>
                              Open Fullscreen &amp; Zoom
                            </span>
                          </div>
                        </div>

                        {/* Open Viewer & Flip Action Buttons */}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDocModal(doc, docSides[doc.id] || 'FRONT')}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#FF6B35] hover:bg-orange-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-[#FF6B35]"
                          >
                            <span className="material-symbols-outlined text-base">open_in_full</span>
                            <span>Open Fullscreen Viewer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDocModal(doc, (docSides[doc.id] || 'FRONT') === 'FRONT' ? 'BACK' : 'FRONT')
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            title="Inspect reverse page in viewer"
                          >
                            <span className="material-symbols-outlined text-base">flip_to_back</span>
                            <span>See {(docSides[doc.id] || 'FRONT') === 'FRONT' ? 'Back' : 'Front'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Metadata Attributes & Verification Fields (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                              Document Number
                            </p>
                            <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {doc.document_number || 'N/A'}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                              Issuing Authority
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-800 dark:text-zinc-200">
                              {doc.issuing_authority || 'Ministry / Official Agency'}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                              Issue Date
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                              {doc.issue_date || 'Standard Validity'}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                              Expiry Date
                            </p>
                            <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                              {doc.expiry_date || 'Permanent / Not Expired'}
                            </p>
                          </div>

                          {doc.coverage_amount && (
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Policy Coverage
                              </p>
                              <p className="mt-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {doc.coverage_amount}
                              </p>
                            </div>
                          )}

                          {doc.chassis_number && (
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Chassis / VIN Number
                              </p>
                              <p className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                                {doc.chassis_number}
                              </p>
                            </div>
                          )}

                          {doc.blood_group && (
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Blood Group
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-800 dark:text-zinc-200">
                                {doc.blood_group}
                              </p>
                            </div>
                          )}

                          {doc.restrictions && (
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Category &amp; Restrictions
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-800 dark:text-zinc-200">
                                {doc.restrictions}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Audit Verification Log / Rejection Reason on this doc */}
                        {isApproved && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                              <span>Approved on {doc.verified_at || 'Recently'}</span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                              Verified by: {doc.verified_by || 'Operations Compliance Desk'}
                            </p>
                            {doc.review_notes && (
                              <p className="mt-1 text-[11px] italic text-emerald-800/90 dark:text-emerald-300">
                                Note: &quot;{doc.review_notes}&quot;
                              </p>
                            )}
                          </div>
                        )}

                        {isRejected && (
                          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                            <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-200">
                              <span className="material-symbols-outlined text-base text-rose-600">error</span>
                              <span>Document Rejected:</span>
                            </div>
                            <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                              {doc.rejection_reason || 'Compliance standards not met.'}
                            </p>
                            {doc.review_notes && (
                              <p className="mt-1 text-[11px] italic text-rose-800/80 dark:text-rose-400">
                                Auditor feedback: {doc.review_notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Inline Auditor Notes Editor */}
                        {isEditingNotesThis ? (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-200">
                              Auditor Internal Note for {doc.document_type}:
                            </label>
                            <textarea
                              value={docNotesText}
                              onChange={(e) => setDocNotesText(e.target.value)}
                              placeholder="e.g. Scanned barcodes verified with ministry registry portal..."
                              rows={2}
                              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                            />
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingNotesDocId(null)}
                                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-zinc-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveDocNote(doc.id)}
                                className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs">
                            {doc.review_notes ? (
                              <span className="text-slate-500 dark:text-zinc-400 italic">
                                Note: &quot;{doc.review_notes}&quot;
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                                No audit comment recorded yet.
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNotesDocId(doc.id)
                                setDocNotesText(doc.review_notes || '')
                              }}
                              className="text-[11px] font-bold text-[#FF6B35] hover:underline"
                            >
                              {doc.review_notes ? 'Edit Note' : '+ Add Audit Note'}
                            </button>
                          </div>
                        )}

                        {/* INLINE REJECTION FORM FOR THIS SPECIFIC DOCUMENT */}
                        {isRejectingThis && (
                          <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 animate-in fade-in dark:border-rose-900/60 dark:bg-rose-950/30">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-rose-600">cancel</span>
                                Reject {doc.document_name || doc.document_type}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRejectingDocId(null)}
                                className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="mt-3 space-y-2.5">
                              <div>
                                <label className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                                  Select Rejection Preset:
                                </label>
                                <select
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  className="mt-1 w-full rounded-xl border border-rose-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                >
                                  {presetReasons.map((reason, rIdx) => (
                                    <option key={rIdx} value={reason}>
                                      {reason}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                                  Custom Feedback or Specific Instructions for Courier (Optional):
                                </label>
                                <input
                                  type="text"
                                  value={rejectNote}
                                  onChange={(e) => setRejectNote(e.target.value)}
                                  placeholder="e.g. Please re-scan in high resolution with all 4 corners visible..."
                                  className="mt-1 w-full rounded-xl border border-rose-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setRejectingDocId(null)}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                >
                                  Dismiss
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmRejectDoc(doc.id)}
                                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                                >
                                  Confirm Rejection of This Document
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ACTION BUTTONS FOR THIS SPECIFIC DOCUMENT */}
                        {!isRejectingThis && (
                          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-zinc-800">
                            {/* Reset button if already decided */}
                            {(isApproved || isRejected) && (
                              <button
                                type="button"
                                onClick={() => handleResetDoc(doc.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                title="Reset this document to pending"
                              >
                                <span className="material-symbols-outlined text-base">restart_alt</span>
                                <span>Reset to Pending</span>
                              </button>
                            )}

                            {/* Reject Document Button */}
                            {!isRejected && (
                              <button
                                type="button"
                                onClick={() => handleOpenRejectDoc(doc)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                              >
                                <span className="material-symbols-outlined text-base">cancel</span>
                                <span>Reject Document</span>
                              </button>
                            )}

                            {/* Approve Document Button */}
                            {!isApproved && (
                              <button
                                type="button"
                                onClick={() => handleApproveDocument(doc)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                              >
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                <span>Approve Document</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* SECTION: VEHICLE VERIFICATION & SAFETY INSPECTION */}
        {rider.vehicle && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                  <span className="material-symbols-outlined text-2xl">
                    {getVehicleIcon(rider.vehicle.vehicle_type)}
                  </span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Vehicle Safety &amp; Roadworthiness Inspection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {rider.vehicle.brand} {rider.vehicle.model} ({rider.vehicle.year}) • Color: {rider.vehicle.color}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Plate: {rider.vehicle.plate_number}
                </span>

                <button
                  type="button"
                  onClick={handleToggleVehicleVerification}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                    rider.vehicle.status === 'APPROVED'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {rider.vehicle.status === 'APPROVED' ? 'check_circle' : 'pending_actions'}
                  </span>
                  <span>{rider.vehicle.status === 'APPROVED' ? 'Vehicle Approved' : 'Mark Vehicle Approved'}</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen Document Preview Modal */}
      {isDocModalOpen && selectedDoc && (
        <DocumentViewerModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          doc={selectedDoc}
          document={selectedDoc}
          initialSide={modalInitialSide}
          rider={rider}
        />
      )}
    </MainLayout>
  )
}
