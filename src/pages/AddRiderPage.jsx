import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { addRider } from '../data/demoRiders'

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
]

const AddRiderPage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('personal') // 'personal' | 'vehicle' | 'documents' | 'settings'

  // Personal
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [birthDate, setBirthDate] = useState('1996-05-18')
  const [gender, setGender] = useState('MALE')
  const [profilePicture, setProfilePicture] = useState(AVATAR_PRESETS[0])

  // Vehicle
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE')
  const [brand, setBrand] = useState('TVS')
  const [model, setModel] = useState('Apache RTR 160')
  const [plateNumber, setPlateNumber] = useState('AA 3-')
  const [color, setColor] = useState('Matte Black')
  const [year, setYear] = useState('2023')

  // Documents
  const [licenseNumber, setLicenseNumber] = useState('DL-')
  const [licenseExpiry, setLicenseExpiry] = useState('2027-08-15')
  const [idNumber, setIdNumber] = useState('NID-')
  const [idExpiry, setIdExpiry] = useState('2029-01-10')
  const [insuranceNumber, setInsuranceNumber] = useState('INS-')
  const [insuranceExpiry, setInsuranceExpiry] = useState('2026-12-31')
  const [regNumber, setRegNumber] = useState('REG-')
  const [regExpiry, setRegExpiry] = useState('2026-10-20')

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [emergencyRelation, setEmergencyRelation] = useState('Family')

  // Settings
  const [status, setStatus] = useState('ACTIVE')
  const [verificationStatus, setVerificationStatus] = useState('APPROVED')
  const [canAcceptOrders, setCanAcceptOrders] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [level, setLevel] = useState('REGULAR')

  const [formError, setFormError] = useState('')

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!fullName.trim()) {
      setFormError('Full Name is required.')
      setActiveTab('personal')
      return
    }
    if (!phoneNumber.trim()) {
      setFormError('Phone Number is required.')
      setActiveTab('personal')
      return
    }
    if (!plateNumber.trim()) {
      setFormError('Vehicle Plate Number is required.')
      setActiveTab('vehicle')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    const newRiderData = {
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@shimadelivery.com`,
      profile_picture: profilePicture,
      birth_date: birthDate,
      gender,
      two_factor_enabled: twoFactorEnabled,
      two_factor_email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@shimadelivery.com`,
      two_factor_otp: twoFactorEnabled ? 'Verified (SMS)' : 'Disabled',
      two_factor_otp_expires_at: null,
      level,
      wallet_balance: 0,
      status,
      onboarding_step: 'APPROVED',
      verification_status: verificationStatus,
      can_accept_orders: canAcceptOrders,
      is_online: false,
      last_online_at: 'Registered Today',
      completed_orders: 0,
      rating: 5.0,
      emergency_contact: {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relation: emergencyRelation,
      },
      vehicle: {
        id: `VEH-${Math.floor(100 + Math.random() * 900)}`,
        vehicle_type: vehicleType,
        brand: brand.trim(),
        model: model.trim(),
        plate_number: plateNumber.trim(),
        color: color.trim(),
        year: parseInt(year, 10) || 2023,
        status: verificationStatus,
        rejection_reason: null,
        verified_at: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      },
      documents: [
        {
          id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          document_type: 'LICENSE',
          document_number: licenseNumber.trim(),
          expiry_date: licenseExpiry,
          status: verificationStatus,
          verified_at: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
        {
          id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          document_type: 'ID_CARD',
          document_number: idNumber.trim(),
          expiry_date: idExpiry,
          status: verificationStatus,
          verified_at: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
        {
          id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          document_type: 'INSURANCE',
          document_number: insuranceNumber.trim(),
          expiry_date: insuranceExpiry,
          status: verificationStatus,
          verified_at: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
        {
          id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          document_type: 'VEHICLE_REGISTRATION',
          document_number: regNumber.trim(),
          expiry_date: regExpiry,
          status: verificationStatus,
          verified_at: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
      ],
    }

    const created = addRider(newRiderData)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate(`/riders/${created.id}`)
    }, 300)
  }

  const tabs = [
    { id: 'personal', label: '1. Personal & Contact', icon: 'person' },
    { id: 'vehicle', label: '2. Vehicle Details', icon: 'two_wheeler' },
    { id: 'documents', label: '3. Compliance & Docs', icon: 'verified_user' },
    { id: 'settings', label: '4. Dispatch & Security', icon: 'tune' },
  ]

  return (
    <MainLayout
      activeMenuKey="riderManagement"
      breadcrumbParent="Riders"
      breadcrumbCurrent="Register Courier"
    >
      <div className="mx-auto max-w-4xl space-y-6 pb-16">
        {/* Navigation Breadcrumb Back */}
        <div className="flex items-center justify-between">
          <Link
            to="/riders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Rider Fleet
          </Link>
          <span className="text-xs text-slate-400 dark:text-zinc-500">Courier Onboarding Wizard</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Register New Courier
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Add a delivery rider to the fleet network with verified identity, vehicle inspection, and dispatch permissions.
            </p>
          </div>
        </div>

        {formError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-rose-600">error</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex border-b border-slate-100 px-4 dark:border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* TAB 1: Personal & Contact */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                    Courier Profile Photo
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <img
                      src={profilePicture}
                      alt="Selected avatar"
                      className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#FF6B35] shadow-xs"
                    />
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Choose an avatar preset or provide custom image URL:</p>
                      <div className="flex items-center gap-2">
                        {AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setProfilePicture(preset)}
                            className={`h-9 w-9 overflow-hidden rounded-xl border-2 transition ${
                              profilePicture === preset ? 'border-[#FF6B35] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt="preset" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <input
                        type="url"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        placeholder="https://..."
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Abebe Kebede"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#FF6B35] focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Phone Number (Dispatch SMS) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 911 234567"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#FF6B35] focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="courier@shimadelivery.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#FF6B35] focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other / Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Fleet Tier
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="REGULAR">Regular Fleet</option>
                      <option value="SILVER">Silver Courier</option>
                      <option value="GOLD">Gold Courier</option>
                      <option value="VIP">VIP / Priority Fleet</option>
                    </select>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                    Emergency Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="e.g. Almaz Bekele"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        placeholder="Spouse / Parent / Sibling"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                        Emergency Phone
                      </label>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+251 922 456789"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('vehicle')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Next: Vehicle Details
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Vehicle Details */}
            {activeTab === 'vehicle' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                    Assigned Vehicle Profile
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Vehicle Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="MOTORCYCLE">Motorcycle</option>
                        <option value="BICYCLE">Bicycle</option>
                        <option value="SCOOTER">Electric Scooter</option>
                        <option value="CAR">Car</option>
                        <option value="VAN">Delivery Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        License Plate Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="e.g. AA 3-84920"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:border-[#FF6B35] focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Make / Brand
                      </label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g. TVS / Bajaj / Yamaha"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Model
                      </label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g. Apache RTR 160 4V"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Color
                      </label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="e.g. Matte Blue"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Manufacturing Year
                      </label>
                      <input
                        type="number"
                        min="2000"
                        max="2030"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Next: Compliance & Docs
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Compliance & Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                    Statutory Permits & Vehicle Documents
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* License */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-zinc-200">
                        <span className="material-symbols-outlined text-base text-[#FF6B35]">badge</span>
                        Driver's License
                      </div>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="DL Number (e.g. DL-849201)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <div>
                        <label className="block text-[10px] text-slate-400">License Expiry Date</label>
                        <input
                          type="date"
                          value={licenseExpiry}
                          onChange={(e) => setLicenseExpiry(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* National ID */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-zinc-200">
                        <span className="material-symbols-outlined text-base text-[#FF6B35]">fingerprint</span>
                        National ID / Kebele ID
                      </div>
                      <input
                        type="text"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="NID Number (e.g. NID-772910)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <div>
                        <label className="block text-[10px] text-slate-400">National ID Expiry Date</label>
                        <input
                          type="date"
                          value={idExpiry}
                          onChange={(e) => setIdExpiry(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* Insurance */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-zinc-200">
                        <span className="material-symbols-outlined text-base text-[#FF6B35]">health_and_safety</span>
                        Third-Party Commercial Insurance
                      </div>
                      <input
                        type="text"
                        value={insuranceNumber}
                        onChange={(e) => setInsuranceNumber(e.target.value)}
                        placeholder="Policy # (e.g. INS-492010)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <div>
                        <label className="block text-[10px] text-slate-400">Insurance Expiry Date</label>
                        <input
                          type="date"
                          value={insuranceExpiry}
                          onChange={(e) => setInsuranceExpiry(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* Registration Card */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-zinc-200">
                        <span className="material-symbols-outlined text-base text-[#FF6B35]">directions_car</span>
                        Vehicle Registration Certificate (Bolo)
                      </div>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="Registration # (e.g. REG-99104)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <div>
                        <label className="block text-[10px] text-slate-400">Certificate Expiry Date</label>
                        <input
                          type="date"
                          value={regExpiry}
                          onChange={(e) => setRegExpiry(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('vehicle')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Next: Dispatch & Security
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Dispatch & Security */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                    Initial Dispatch Permissions & Security
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Account Initial Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="ACTIVE">Active (Ready immediately)</option>
                        <option value="PENDING">Pending Review (Hold until manager approval)</option>
                        <option value="INACTIVE">Inactive (Disabled)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Verification Status
                      </label>
                      <select
                        value={verificationStatus}
                        onChange={(e) => setVerificationStatus(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="APPROVED">Approved & Verified</option>
                        <option value="PENDING">Pending Inspection</option>
                        <option value="ONBOARDING">In Onboarding</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Dispatch Controls</h4>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canAcceptOrders}
                      onChange={(e) => setCanAcceptOrders(e.target.checked)}
                      className="rounded-sm accent-[#FF6B35]"
                    />
                    <span><strong>Dispatch Ready:</strong> Allow courier to receive automated routing algorithm assignments</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="rounded-sm accent-[#FF6B35]"
                    />
                    <span><strong>Mandatory 2FA:</strong> Courier must authenticate via SMS OTP upon mobile login</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Previous
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving Courier...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">how_to_reg</span>
                        Save & Register Courier
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default AddRiderPage
