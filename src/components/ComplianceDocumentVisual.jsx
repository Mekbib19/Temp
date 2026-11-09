/**
 * Renders realistic visual document mockups for Compliance Documents
 * Supports both FRONT and BACK sides for all document types:
 * - Driver's License (Front: photo, biometrics, categories; Back: category matrix, emergency contact, barcode, MRZ)
 * - National ID / Fayda (Front: photo, national ID, citizen info; Back: address, father/mother name, thumbprint, QR, ICAO MRZ)
 * - Insurance Certificate (Front: policy coverage, vehicle info, dates; Back: schedule of clauses, liability limits, seal stamp)
 * - Vehicle Registration Title (Front: owner, plate, vehicle specs; Back: technical engine/VIN specs, inspection pass, transport bureau seal)
 */
export const ComplianceDocumentVisual = ({
  doc: propDoc,
  document: altDoc,
  rider = {},
  isThumbnail = false,
  side = 'FRONT',
}) => {
  const doc = propDoc || altDoc || {}
  const docType = doc.document_type || 'LICENSE'
  const isApproved = doc.status === 'APPROVED'
  const isRejected = doc.status === 'REJECTED'
  const isBack = side === 'BACK'

  const riderName = (rider?.full_name || 'COURIER APPLICANT').toUpperCase()
  const docNumber = doc.document_number || 'N/A'
  const expiryDate = doc.expiry_date || '2027-12-31'
  const issueDate = doc.issue_date || '2023-01-15'
  const vehiclePlate = rider?.vehicle?.plate_number || 'AA 3-84920'
  const vehicleModel = rider?.vehicle ? `${rider.vehicle.brand} ${rider.vehicle.model}` : 'TVS Apache RTR'

  // ==========================================
  // 1. DRIVER'S LICENSE
  // ==========================================
  if (docType === 'LICENSE') {
    if (isBack) {
      // LICENSE - BACK SIDE
      return (
        <div
          className={`relative overflow-hidden rounded-xl border select-none transition-all ${
            isThumbnail
              ? 'h-48 w-full bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-3 text-white shadow-inner border-emerald-600/30'
              : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-2xl border-emerald-600/30'
          }`}
        >
          {/* Security Guilloche Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Magnetic Stripe */}
          <div className="-mx-6 -mt-6 mb-3 h-8 bg-black/90 border-b border-emerald-500/30 flex items-center px-4">
            <span className="font-mono text-[8px] text-emerald-400 tracking-widest opacity-60">
              ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
            </span>
          </div>

          {/* Back Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                PAGE 2 • BACK
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                VEHICLE ENDORSEMENT MATRIX
              </span>
            </div>
            <span className="font-mono text-[9px] text-slate-400">
              DOC: {docNumber}
            </span>
          </div>

          {/* Category Table */}
          <div className="relative z-10 mt-2 space-y-1 text-[9px] font-mono">
            <div className="grid grid-cols-4 gap-1 text-[8px] font-bold uppercase text-slate-400 border-b border-emerald-500/20 pb-0.5">
              <span>CAT</span>
              <span>VEHICLE</span>
              <span>STATUS</span>
              <span className="text-right">EXPIRY</span>
            </div>
            <div className="grid grid-cols-4 gap-1 py-0.5 text-slate-200">
              <span className="font-bold text-emerald-300">CAT 1</span>
              <span>Motorcycle</span>
              <span className="text-emerald-400 font-bold">✓ AUTHORIZED</span>
              <span className="text-right text-amber-300">{expiryDate}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 py-0.5 text-slate-200 bg-emerald-500/10 rounded px-0.5">
              <span className="font-bold text-emerald-300">CAT 3</span>
              <span className="font-bold text-white">Commercial Fleet</span>
              <span className="text-emerald-400 font-bold">✓ CERTIFIED</span>
              <span className="text-right text-amber-300 font-bold">{expiryDate}</span>
            </div>
            {!isThumbnail && (
              <>
                <div className="grid grid-cols-4 gap-1 py-0.5 text-slate-400">
                  <span>CAT 4</span>
                  <span>Passenger Auto</span>
                  <span className="text-slate-500">— Restricted</span>
                  <span className="text-right">—</span>
                </div>
                <div className="grid grid-cols-4 gap-1 py-0.5 text-slate-400">
                  <span>CAT 5</span>
                  <span>Heavy Truck</span>
                  <span className="text-slate-500">— Restricted</span>
                  <span className="text-right">—</span>
                </div>
              </>
            )}
          </div>

          {/* Emergency & Biometric Info */}
          <div className="relative z-10 mt-3 pt-2 border-t border-emerald-500/20 grid grid-cols-2 gap-2 text-[9px] font-mono">
            <div>
              <span className="text-slate-400 block text-[8px]">EMERGENCY CONTACT:</span>
              <span className="font-bold text-slate-200 truncate block">
                {rider.two_factor_email || 'Dispatch Ops (+251 911 234567)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px]">BLOOD GROUP / DONOR:</span>
              <span className="font-bold text-white">
                {doc.blood_group || 'O+'} • ORGAN DONOR (YES)
              </span>
            </div>
          </div>

          {/* Machine Readable Zone (MRZ) */}
          <div className="relative z-10 mt-2.5 rounded bg-black/60 p-1.5 font-mono text-[7px] text-emerald-400/90 tracking-widest leading-tight">
            <div>DL&lt;ETH{docNumber}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
            <div>{riderName.replace(/\s+/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
          </div>
        </div>
      )
    }

    // LICENSE - FRONT SIDE
    return (
      <div
        className={`relative overflow-hidden rounded-xl border select-none transition-all ${
          isThumbnail
            ? 'h-48 w-full bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 p-3 text-white shadow-inner border-emerald-600/30'
            : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-2xl border-emerald-600/30'
        }`}
      >
        {/* Security Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/30 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-7 flex-col overflow-hidden rounded-xs border border-white/20 shadow-xs">
              <div className="h-1.5 bg-[#009A44]" />
              <div className="h-2 bg-[#FED100]" />
              <div className="h-1.5 bg-[#EF3340]" />
            </div>
            <div>
              <p className="font-mono text-[8px] font-extrabold uppercase tracking-widest text-emerald-300">
                FDRE MINISTRY OF TRANSPORT
              </p>
              <h5 className="text-[10px] font-black tracking-tight text-white uppercase sm:text-[11px]">
                DRIVER&apos;S LICENSE • COMMERCIAL FLEET
              </h5>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-300 border border-emerald-500/40">
              CAT 3 / MOTO
            </span>
            <span className="rounded bg-white/10 px-1 py-0.5 font-mono text-[8px] text-slate-300">
              PAGE 1 (FRONT)
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="relative z-10 mt-3 flex items-start gap-3">
          {/* Photo */}
          <div className="relative shrink-0">
            <img
              src={rider.profile_picture}
              alt={rider.full_name}
              className={`${
                isThumbnail ? 'h-18 w-16' : 'h-24 w-20'
              } rounded-lg border-2 border-emerald-400/50 object-cover shadow-md bg-slate-800`}
            />
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-teal-200 text-[8px] text-slate-900 shadow-xs">
              ★
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[8px]">NAME:</span>
              <span className="font-bold text-white text-xs truncate">{riderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[8px]">LICENSE NO:</span>
              <span className="font-bold text-emerald-300 tracking-wider">{docNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[8px]">ISSUE DATE:</span>
              <span className="text-slate-200">{issueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[8px]">EXPIRY DATE:</span>
              <span className="font-bold text-amber-300">{expiryDate}</span>
            </div>
            {!isThumbnail && (
              <div className="flex justify-between">
                <span className="text-slate-400 text-[8px]">BLOOD GROUP:</span>
                <span className="text-white font-bold">{doc.blood_group || 'O+'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Barcode Representation */}
        <div className="relative z-10 mt-3 pt-1.5 border-t border-emerald-500/20 flex items-center justify-between text-[8px] font-mono text-slate-400">
          <span>||||| ||| ||||||| || |||||| ||||| |||</span>
          <span className="font-semibold text-emerald-400">
            {isApproved ? '● VERIFIED AUTHENTIC' : isRejected ? '● REJECTED' : '● AUDIT PENDING'}
          </span>
        </div>
      </div>
    )
  }

  // ==========================================
  // 2. NATIONAL ID CARD (FAYDA ID)
  // ==========================================
  if (docType === 'ID_CARD') {
    if (isBack) {
      // ID CARD - BACK SIDE
      return (
        <div
          className={`relative overflow-hidden rounded-xl border select-none transition-all ${
            isThumbnail
              ? 'h-48 w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 p-3 text-white shadow-inner border-indigo-500/30'
              : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl border-indigo-500/30'
          }`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-indigo-500/30 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-indigo-300 border border-indigo-500/30">
                PAGE 2 • BACK
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-indigo-200">
                FAYDA RESIDENCE &amp; BIOMETRIC DATA
              </span>
            </div>
            <span className="font-mono text-[9px] text-slate-400">{docNumber}</span>
          </div>

          {/* Back Body Content */}
          <div className="relative z-10 mt-2.5 grid grid-cols-12 gap-3">
            <div className="col-span-8 space-y-1.5 font-mono text-[9px]">
              <div>
                <span className="text-slate-400 text-[8px] block">PERMANENT RESIDENTIAL ADDRESS:</span>
                <span className="font-bold text-white text-[10px]">
                  Addis Ababa, Bole Sub-City, Woreda 03, House #402
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[8px] block">PARENTS:</span>
                  <span className="text-slate-200">Abebe / Almaz</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[8px] block">PLACE OF BIRTH:</span>
                  <span className="text-slate-200">Addis Ababa</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[8px] block">SERIAL REGISTRATION ID:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  FAYDA-ETH-2023-992014-X
                </span>
              </div>
            </div>

            {/* Biometric Thumbprint + QR Mockup */}
            <div className="col-span-4 flex flex-col items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-950/40 p-2 text-center">
              <span className="material-symbols-outlined text-2xl text-indigo-300">
                fingerprint
              </span>
              <span className="mt-1 font-mono text-[7px] text-indigo-300 font-bold">
                ENCRYPTED BIOMETRICS
              </span>
              <span className="text-[7px] text-slate-400">NIDP CERTIFIED</span>
            </div>
          </div>

          {/* ICAO 3-line MRZ */}
          <div className="relative z-10 mt-2.5 rounded bg-black/70 p-1.5 font-mono text-[7px] text-indigo-300 tracking-widest leading-tight">
            <div>I&lt;ETH{docNumber}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
            <div>9504128M2901202ETH&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4</div>
            <div>{riderName.replace(/\s+/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
          </div>
        </div>
      )
    }

    // ID CARD - FRONT SIDE
    return (
      <div
        className={`relative overflow-hidden rounded-xl border select-none transition-all ${
          isThumbnail
            ? 'h-48 w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 p-3 text-white shadow-inner border-indigo-500/30'
            : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl border-indigo-500/30'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-indigo-500/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/30 text-indigo-300 font-bold text-[10px]">
              🇪🇹
            </span>
            <div>
              <p className="font-mono text-[8px] font-extrabold uppercase tracking-widest text-indigo-300">
                NATIONAL ID PROGRAM (FAYDA)
              </p>
              <h5 className="text-[10px] font-black tracking-tight text-white uppercase sm:text-[11px]">
                DIGITAL IDENTITY CARD
              </h5>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-indigo-300 border border-indigo-500/40">
              SMART BIOMETRIC
            </span>
            <span className="rounded bg-white/10 px-1 py-0.5 font-mono text-[8px] text-slate-300">
              PAGE 1 (FRONT)
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="relative z-10 mt-3 flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={rider.profile_picture}
              alt={rider.full_name}
              className={`${
                isThumbnail ? 'h-18 w-16' : 'h-24 w-20'
              } rounded-lg border-2 border-indigo-400/50 object-cover shadow-md bg-slate-800`}
            />
            <div className="absolute -bottom-1 -left-1 rounded-xs bg-amber-400 px-1 text-slate-950 text-[6px] font-mono font-bold">
              CHIP
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[8px]">CITIZEN:</span>
              <span className="font-bold text-white text-xs truncate">{riderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[8px]">NATIONAL ID:</span>
              <span className="font-bold text-indigo-300 tracking-wider">{docNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[8px]">DOB / SEX:</span>
              <span className="text-slate-200">{rider.birth_date || '1995-04-12'} • {rider.gender || 'MALE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[8px]">VALID THRU:</span>
              <span className="font-bold text-amber-300">{expiryDate}</span>
            </div>
            {!isThumbnail && (
              <div className="flex justify-between">
                <span className="text-slate-400 text-[8px]">NATIONALITY:</span>
                <span className="text-white font-bold">ETHIOPIAN</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: QR representation & Verified */}
        <div className="relative z-10 mt-3 pt-1.5 border-t border-indigo-500/20 flex items-center justify-between text-[8px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-indigo-300 font-bold">
            <span className="material-symbols-outlined text-xs">qr_code_2</span>
            <span>QR ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-indigo-400">
            <span className="material-symbols-outlined text-xs">fingerprint</span>
            <span>CHIP VALIDATED</span>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // 3. INSURANCE CERTIFICATE
  // ==========================================
  if (docType === 'INSURANCE') {
    if (isBack) {
      // INSURANCE - BACK SIDE (Schedule of Clauses & Liability Terms)
      return (
        <div
          className={`relative overflow-hidden rounded-xl border select-none transition-all ${
            isThumbnail
              ? 'h-48 w-full bg-gradient-to-br from-amber-950 via-slate-900 to-stone-900 p-3 text-white shadow-inner border-amber-500/30'
              : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-6 text-white shadow-2xl border-amber-500/30'
          }`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-amber-300 border border-amber-500/30">
                PAGE 2 • SCHEDULE &amp; CLAUSES
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
                ENDORSEMENTS &amp; LIMITS
              </span>
            </div>
            <span className="font-mono text-[9px] text-slate-400">{docNumber}</span>
          </div>

          {/* Clauses list */}
          <div className="relative z-10 mt-2 space-y-1.5 font-mono text-[9px]">
            <div className="rounded bg-amber-500/10 p-1.5 border border-amber-500/20">
              <span className="text-amber-300 font-bold block text-[8px]">
                CLAUSE 21: COMMERCIAL COURIER DELIVERY ENDORSEMENT
              </span>
              <span className="text-slate-300 text-[8px] leading-tight block">
                Covers commercial on-demand food &amp; parcel dispatch within municipal boundary limits.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[8px]">
              <div className="rounded border border-slate-700 bg-slate-900/60 p-1.5">
                <span className="text-slate-400 block">THIRD PARTY BODILY INJURY:</span>
                <span className="font-bold text-emerald-300">Unlimited (Statutory Cap)</span>
              </div>
              <div className="rounded border border-slate-700 bg-slate-900/60 p-1.5">
                <span className="text-slate-400 block">PROPERTY DAMAGE LIMIT:</span>
                <span className="font-bold text-amber-300">{doc.coverage_amount || '1,500,000 ETB'}</span>
              </div>
            </div>

            {!isThumbnail && (
              <div className="text-[8px] text-slate-400 leading-relaxed pt-1">
                Authorized Drivers: Any licensed courier aged 18-65 holding a valid Category 3 Commercial license. Claims Emergency Hotline: 9811 / claim@nyalainsurance.et
              </div>
            )}
          </div>

          {/* Underwriter Stamp */}
          <div className="relative z-10 mt-2.5 pt-1.5 border-t border-amber-500/20 flex items-center justify-between text-[8px] font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="material-symbols-outlined text-xs">verified</span>
              <span>NYALA UNDERWRITER SEALED</span>
            </div>
            <span className="text-slate-400">AUTHORIZED SIGNATURE RECORDED</span>
          </div>
        </div>
      )
    }

    // INSURANCE - FRONT SIDE
    return (
      <div
        className={`relative overflow-hidden rounded-xl border select-none transition-all ${
          isThumbnail
            ? 'h-48 w-full bg-gradient-to-br from-amber-950 via-slate-900 to-stone-900 p-3 text-white shadow-inner border-amber-500/30'
            : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-6 text-white shadow-2xl border-amber-500/30'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-amber-400 font-bold text-xs">
              <span className="material-symbols-outlined text-xs">shield</span>
            </span>
            <div>
              <p className="font-mono text-[8px] font-extrabold uppercase tracking-widest text-amber-300">
                NYALA INSURANCE COMPANY S.C.
              </p>
              <h5 className="text-[10px] font-black tracking-tight text-white uppercase sm:text-[11px]">
                CERTIFICATE OF MOTOR INSURANCE
              </h5>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-amber-300 border border-amber-500/40">
              COMPREHENSIVE
            </span>
            <span className="rounded bg-white/10 px-1 py-0.5 font-mono text-[8px] text-slate-300">
              PAGE 1 (FRONT)
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="relative z-10 mt-3 space-y-1.5 font-mono text-[10px]">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 text-[8px]">POLICY NUMBER:</span>
            <span className="font-bold text-amber-300 tracking-wider">{docNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-[8px]">INSURED HOLDER:</span>
            <span className="font-bold text-white truncate">{riderName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-[8px]">VEHICLE COVERED:</span>
            <span className="text-slate-200">{vehicleModel} ({vehiclePlate})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-[8px]">COVER PERIOD:</span>
            <span className="text-white">{issueDate} to <span className="font-bold text-amber-400">{expiryDate}</span></span>
          </div>
          {!isThumbnail && (
            <div className="flex justify-between">
              <span className="text-slate-400 text-[8px]">COVERAGE LIMIT:</span>
              <span className="text-emerald-400 font-bold">{doc.coverage_amount || '1,500,000 ETB'} (Commercial)</span>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 mt-3 pt-1.5 border-t border-amber-500/20 flex items-center justify-between text-[8px] font-mono text-slate-400">
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <span className="material-symbols-outlined text-xs">verified_user</span>
            <span>UNDERWRITER SEALED</span>
          </div>
          <span>AUTHORIZED AGENT STAMP</span>
        </div>
      </div>
    )
  }

  // ==========================================
  // 4. VEHICLE REGISTRATION (TITLE)
  // ==========================================
  if (isBack) {
    // VEHICLE REGISTRATION - BACK SIDE (Technical Specs & Inspection Log)
    return (
      <div
        className={`relative overflow-hidden rounded-xl border select-none transition-all ${
          isThumbnail
            ? 'h-48 w-full bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-3 text-white shadow-inner border-cyan-500/30'
            : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 text-white shadow-2xl border-cyan-500/30'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/30 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-cyan-300 border border-cyan-500/30">
              PAGE 2 • BACK
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-300">
              TECHNICAL SPECIFICATIONS &amp; LOG
            </span>
          </div>
          <span className="font-mono text-[9px] text-slate-400">{docNumber}</span>
        </div>

        {/* Technical Specs Grid */}
        <div className="relative z-10 mt-2 space-y-1 font-mono text-[9px]">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded bg-slate-900/60 p-1.5 border border-slate-700">
              <span className="text-slate-400 text-[8px] block">ENGINE NO:</span>
              <span className="font-bold text-cyan-300">{doc.engine_number || 'ENG-160RTR4410'}</span>
            </div>
            <div className="rounded bg-slate-900/60 p-1.5 border border-slate-700">
              <span className="text-slate-400 text-[8px] block">CHASSIS / VIN:</span>
              <span className="font-bold text-white">{doc.chassis_number || 'TVS4V8920194B'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1 text-[8px]">
            <div className="rounded border border-slate-800 bg-slate-900/40 p-1">
              <span className="text-slate-400 block">DISPLACEMENT:</span>
              <span className="text-slate-200 font-bold">159.7 cc</span>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/40 p-1">
              <span className="text-slate-400 block">FUEL TYPE:</span>
              <span className="text-slate-200 font-bold">Petrol / EFI</span>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/40 p-1">
              <span className="text-slate-400 block">SEATS / CARGO:</span>
              <span className="text-slate-200 font-bold">2 / 45 kg</span>
            </div>
          </div>

          {!isThumbnail && (
            <div className="mt-2 rounded bg-cyan-500/10 p-2 border border-cyan-500/20 text-[8px] text-slate-300 flex items-center justify-between">
              <span>Annual Roadworthiness Inspection: PASSED</span>
              <span className="font-bold text-cyan-300">EXP: {expiryDate}</span>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 mt-2.5 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[8px] font-mono text-slate-400">
          <div className="flex items-center gap-1 font-bold text-cyan-400">
            <span className="material-symbols-outlined text-xs">verified</span>
            <span>CITY TRANSPORT AUTHORITY SEAL</span>
          </div>
          <span>OFFICIAL STAMPED</span>
        </div>
      </div>
    )
  }

  // VEHICLE REGISTRATION - FRONT SIDE
  return (
    <div
      className={`relative overflow-hidden rounded-xl border select-none transition-all ${
        isThumbnail
          ? 'h-48 w-full bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-3 text-white shadow-inner border-cyan-500/30'
          : 'w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 text-white shadow-2xl border-cyan-500/30'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">
            <span className="material-symbols-outlined text-xs">directions_car</span>
          </span>
          <div>
            <p className="font-mono text-[8px] font-extrabold uppercase tracking-widest text-cyan-300">
              CITY TRANSPORT BUREAU
            </p>
            <h5 className="text-[10px] font-black tracking-tight text-white uppercase sm:text-[11px]">
              VEHICLE TITLE &amp; REGISTRATION
            </h5>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-cyan-300 border border-cyan-500/40">
            CERTIFIED TITLE
          </span>
          <span className="rounded bg-white/10 px-1 py-0.5 font-mono text-[8px] text-slate-300">
            PAGE 1 (FRONT)
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative z-10 mt-3 space-y-1.5 font-mono text-[10px]">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400 text-[8px]">REGISTRATION NO:</span>
          <span className="font-bold text-cyan-300 tracking-wider">{docNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-[8px]">REGISTERED OWNER:</span>
          <span className="font-bold text-white truncate">{riderName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-[8px]">LICENSE PLATE:</span>
          <span className="font-bold text-amber-300">{vehiclePlate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-[8px]">MAKE / MODEL:</span>
          <span className="text-slate-200">{vehicleModel} ({rider?.vehicle?.year || 2023})</span>
        </div>
        {!isThumbnail && (
          <div className="flex justify-between">
            <span className="text-slate-400 text-[8px]">CHASSIS / VIN:</span>
            <span className="text-slate-300">{doc.chassis_number || 'TVS4V8920194B'}</span>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 mt-3 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[8px] font-mono text-slate-400">
        <div className="flex items-center gap-1 font-bold text-cyan-400">
          <span className="material-symbols-outlined text-xs">check_circle</span>
          <span>ANNUAL ROAD INSPECTION VALID</span>
        </div>
        <span>EXP: {expiryDate}</span>
      </div>
    </div>
  )
}
