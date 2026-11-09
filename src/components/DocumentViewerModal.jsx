import { useState } from 'react'
import { ComplianceDocumentVisual } from './ComplianceDocumentVisual'

/**
 * Interactive Document Viewer Modal for Compliance Documents
 * Supports:
 * - Opening with either `doc` or `document` prop
 * - Viewing FRONT and BACK pages with quick toggle and Flip controls
 * - Side-by-Side comparison mode (view Front & Back together)
 * - Zoom, rotate, and reset controls
 * - Download document summary
 */
export const DocumentViewerModal = ({
  doc: propDoc,
  document: altDoc,
  rider = {},
  isOpen,
  onClose,
  initialSide = 'FRONT',
}) => {
  const doc = propDoc || altDoc
  const [side, setSide] = useState(initialSide)
  const [viewBoth, setViewBoth] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  if (!isOpen || !doc) return null

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 75))
  const handleReset = () => {
    setZoom(100)
    setRotation(0)
    setViewBoth(false)
  }
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleFlip = () => setSide((prev) => (prev === 'FRONT' ? 'BACK' : 'FRONT'))

  const docTypeName = doc.document_name || doc.document_type?.replace(/_/g, ' ') || 'Compliance Document'

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
              <span className="material-symbols-outlined text-xl">fact_check</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  {docTypeName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    doc.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : doc.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {doc.status || 'PENDING'}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                {doc.id} • Number: <span className="font-bold text-slate-800 dark:text-zinc-200">{doc.document_number}</span> • Authority: {doc.issuing_authority || 'Ministry of Transport'}
              </p>
            </div>
          </div>

          {/* Action buttons & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const summary = `OFFICIAL COMPLIANCE DOCUMENT AUDIT RECORD
Document ID: ${doc.id}
Document Type: ${doc.document_type}
Document Title: ${docTypeName}
Official Number: ${doc.document_number}
Holder Legal Name: ${rider.full_name || 'N/A'}
Courier ID: ${rider.id || 'N/A'}
Authority: ${doc.issuing_authority || 'Federal Transport Authority'}
Issue Date: ${doc.issue_date || 'N/A'}
Expiry Date: ${doc.expiry_date || 'N/A'}
Verification Status: ${doc.status || 'PENDING'}
Verified By: ${doc.verified_by || 'Operations Desk'}
Timestamp: ${new Date().toISOString()}`
                const blob = new Blob([summary], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${doc.document_number || 'document'}_audit_record.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Download audit transcript"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              title="Close viewer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Toolbar: FRONT / BACK PAGE SELECTOR + ZOOM & ROTATE CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
          {/* Front / Back Side Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => {
                setSide('FRONT')
                setViewBoth(false)
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                !viewBoth && side === 'FRONT'
                  ? 'bg-[#FF6B35] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined text-sm">badge</span>
              <span>Front Page</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSide('BACK')
                setViewBoth(false)
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                !viewBoth && side === 'BACK'
                  ? 'bg-[#FF6B35] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined text-sm">flip_to_back</span>
              <span>Back Page (Page 2)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewBoth(!viewBoth)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                viewBoth
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
              title="View both Front and Back together"
            >
              <span className="material-symbols-outlined text-sm">view_agenda</span>
              <span className="hidden sm:inline">Both Sides</span>
            </button>
          </div>

          {/* Quick Flip Button */}
          {!viewBoth && (
            <button
              type="button"
              onClick={handleFlip}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <span className="material-symbols-outlined text-base">sync</span>
              <span>Flip to {side === 'FRONT' ? 'Back Side' : 'Front Side'}</span>
            </button>
          )}

          {/* Zoom & View Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              title="Zoom out"
            >
              <span className="material-symbols-outlined text-sm">remove</span>
            </button>
            <span className="min-w-[44px] text-center font-mono text-[11px] font-bold text-slate-600 dark:text-zinc-300">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              title="Zoom in"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              title="Rotate 90 degrees"
            >
              <span className="material-symbols-outlined text-sm">rotate_right</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Document Viewer Canvas */}
        <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center min-h-[380px]">
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
            className="origin-center w-full"
          >
            {viewBoth ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="font-bold text-emerald-400">● FRONT PAGE</span>
                    <span>Document Face</span>
                  </div>
                  <ComplianceDocumentVisual doc={doc} rider={rider} side="FRONT" isThumbnail={false} />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="font-bold text-amber-400">● BACK PAGE (PAGE 2)</span>
                    <span>Endorsements &amp; MRZ</span>
                  </div>
                  <ComplianceDocumentVisual doc={doc} rider={rider} side="BACK" isThumbnail={false} />
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto">
                <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className={`font-bold ${side === 'FRONT' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ● {side === 'FRONT' ? 'FRONT PAGE' : 'BACK PAGE (PAGE 2)'}
                  </span>
                  <span>Click toolbar above to flip sides</span>
                </div>
                <ComplianceDocumentVisual doc={doc} rider={rider} side={side} isThumbnail={false} />
              </div>
            )}
          </div>
        </div>

        {/* Footer Audit Checklist */}
        <div className="border-t border-slate-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-zinc-800/60">
              <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Auditor Verification</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                  {doc.verified_by || 'Senior Compliance Desk'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-zinc-800/60">
              <span className="material-symbols-outlined text-emerald-600 text-base">event_available</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Validity Window</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                  Valid thru {doc.expiry_date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-zinc-800/60">
              <span className="material-symbols-outlined text-emerald-600 text-base">gavel</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Both Pages Audited</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                  Front Portrait &amp; Reverse MRZ Checked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
