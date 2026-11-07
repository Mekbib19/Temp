import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import {
  getStaffById,
  updateStaffMember,
  setStaffStatus,
  deleteStaffMember,
  getBranchAndMerchant,
  PERMISSION_CATALOG,
  DEFAULT_ROLE_PERMISSIONS,
  generateUUID,
} from '../data/demoStaff'

export default function StaffDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [staff, setStaff] = useState(() => getStaffById(id))
  const [activeTab, setActiveTab] = useState('overview')
  const [showPasswordHash, setShowPasswordHash] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  // Edit & Delete State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: 'STAFF',
    is_owner: false,
    status: 'ACTIVE',
    profile_picture: '',
    password: '',
    notes: '',
  })

  // Live editable permissions state
  const [selectedPermissions, setSelectedPermissions] = useState(() => {
    const member = getStaffById(id)
    return Array.isArray(member?.permissions)
      ? member.permissions
      : DEFAULT_ROLE_PERMISSIONS[member?.role || 'STAFF'] || []
  })
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  // Toast message
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Resolve branch and merchant
  const branchInfo = useMemo(() => {
    if (!staff?.merchant_branch_id) return null
    return getBranchAndMerchant(staff.merchant_branch_id)
  }, [staff])

  // Copy to clipboard helper
  const handleCopy = (text, fieldName) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    showToast(`Copied ${fieldName} to clipboard`)
    setTimeout(() => setCopiedField(''), 2000)
  }

  // Handle Edit Modal Open
  const handleOpenEditModal = () => {
    if (!staff) return
    setEditFormData({
      full_name: staff.full_name || '',
      email: staff.email || '',
      phone_number: staff.phone_number || '',
      role: staff.role || 'STAFF',
      is_owner: !!staff.is_owner,
      status: staff.status || 'ACTIVE',
      profile_picture: staff.profile_picture || '',
      password: '',
      notes: staff.notes || '',
    })
    setIsEditModalOpen(true)
  }

  // Save Edit Profile
  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!staff) return
    if (!editFormData.full_name.trim() || !editFormData.email.trim()) {
      showToast('Please enter both name and email')
      return
    }

    const payload = {
      full_name: editFormData.full_name,
      email: editFormData.email,
      phone_number: editFormData.phone_number,
      role: editFormData.role,
      is_owner: editFormData.is_owner,
      status: editFormData.status,
      profile_picture: editFormData.profile_picture || staff.profile_picture,
      notes: editFormData.notes,
    }

    if (editFormData.password && editFormData.password.trim()) {
      payload.password = `$2a$12$${generateUUID().replace(/-/g, '').slice(0, 22)}${generateUUID().replace(/-/g, '').slice(0, 31)}`
    }

    const updated = updateStaffMember(staff.id, payload)
    if (updated) {
      setStaff(updated)
      showToast('Staff credentials updated successfully')
    }
    setIsEditModalOpen(false)
  }

  // Handle Block / Unblock
  const handleConfirmToggleBlock = () => {
    if (!staff) return
    const isCurrentlyBlocked = staff.status === 'BLOCKED'
    const newStatus = isCurrentlyBlocked ? 'ACTIVE' : 'BLOCKED'
    const updated = setStaffStatus(staff.id, newStatus, isCurrentlyBlocked ? '' : blockReason)
    if (updated) {
      setStaff(updated)
      showToast(
        isCurrentlyBlocked
          ? `Staff member ${staff.full_name} has been unblocked`
          : `Staff member ${staff.full_name} has been blocked`
      )
    }
    setIsBlockModalOpen(false)
  }

  // Toggle single permission
  const handleTogglePermission = (permKey) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permKey)) {
        return prev.filter((k) => k !== permKey)
      } else {
        return [...prev, permKey]
      }
    })
  }

  // Save updated permissions
  const handleSavePermissions = () => {
    if (!staff) return
    setIsSavingPermissions(true)
    setTimeout(() => {
      const updated = updateStaffMember(staff.id, { permissions: selectedPermissions })
      if (updated) {
        setStaff(updated)
        showToast('Staff permissions matrix saved successfully')
      }
      setIsSavingPermissions(false)
    }, 300)
  }

  // Mock Realistic Activity Logs
  const activityLogs = useMemo(() => {
    if (!staff) return []
    return [
      {
        id: 'act-1',
        action: 'Accepted Order',
        detail: `Confirmed branch incoming order #ORD-${(staff.id.charCodeAt(0) * 111).toString().slice(0, 4)} from Customer app`,
        timestamp: '15 minutes ago',
        icon: 'receipt_long',
        badge: 'Orders',
      },
      {
        id: 'act-2',
        action: 'Handed Over to Delivery Rider',
        detail: 'Dispatched order to verified rider Dawit K. for express dropoff',
        timestamp: '1 hour ago',
        icon: 'local_shipping',
        badge: 'Dispatch',
      },
      {
        id: 'act-3',
        action: 'Stock Quantity Adjusted',
        detail: 'Marked 2 items as "Limited Availability" in branch menu catalog',
        timestamp: 'Yesterday at 04:20 PM',
        icon: 'inventory_2',
        badge: 'Menu',
      },
      {
        id: 'act-4',
        action: 'Branch Portal Login',
        detail: 'Authenticated via 2FA session from Chrome / macOS (IP: 197.156.104.22)',
        timestamp: 'Yesterday at 08:05 AM',
        icon: 'fingerprint',
        badge: 'Security',
      },
      {
        id: 'act-5',
        action: 'Account Created & Verified',
        detail: `Added to ${branchInfo?.branch_name || 'Branch'} roster with role ${staff.role}`,
        timestamp: new Date(staff.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        icon: 'how_to_reg',
        badge: 'Account',
      },
    ]
  }, [staff, branchInfo])

  if (!staff) {
    return (
      <MainLayout
        activeMenuKey="staffManagement"
        breadcrumbParent="Dashboard"
        breadcrumbMiddle="Staff Directory"
        breadcrumbCurrent="Staff Not Found"
      >
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
            <span className="material-symbols-outlined text-3xl">person_off</span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-zinc-100">
            Staff Member Record Not Found
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            The requested staff UUID ({id}) does not exist or has been removed.
          </p>
          <Link
            to="/staff"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e0531f]"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Return to Staff Directory
          </Link>
        </div>
      </MainLayout>
    )
  }

  const role = staff.role || 'STAFF'
  const isOwner = !!staff.is_owner || role === 'OWNER'
  const isBlocked = staff.status === 'BLOCKED'

  return (
    <MainLayout
      activeMenuKey="staffManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Staff Directory"
      breadcrumbCurrent={staff.full_name}
    >
      <div className="space-y-6 pb-16 animate-fade-in">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl dark:border-zinc-700 dark:bg-zinc-100 dark:text-slate-900">
            <span className="material-symbols-outlined text-base text-[#FF6B35]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Back navigation & Quick links */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Staff Directory
          </button>

          {branchInfo && branchInfo.merchant_id && branchInfo.id && (
            <Link
              to={`/merchants/${branchInfo.merchant_id}/branches/${branchInfo.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <span className="material-symbols-outlined text-sm text-[#FF6B35]">storefront</span>
              <span>Go to Branch Dashboard</span>
            </Link>
          )}
        </div>

        {/* HERO PROFILE CARD */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <img
                  src={
                    staff.profile_picture ||
                    `https://ui-avatars.com/api/?background=FF6B35&color=fff&bold=true&size=160&name=${encodeURIComponent(
                      staff.full_name
                    )}`
                  }
                  alt={staff.full_name}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-zinc-800"
                />
                {isOwner && (
                  <span
                    title="Store Owner"
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-black text-slate-900 dark:text-zinc-100">
                    {staff.full_name}
                  </h1>

                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      role === 'OWNER'
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300'
                        : role === 'MANAGER'
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {role === 'OWNER' ? 'workspace_premium' : role === 'MANAGER' ? 'manage_accounts' : 'person'}
                    </span>
                    {role}
                  </span>

                  {/* Owner Chip if not primary owner role */}
                  {staff.is_owner && role !== 'OWNER' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Co-Owner
                    </span>
                  )}

                  {/* Status Indicator */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      staff.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : staff.status === 'BLOCKED'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        staff.status === 'ACTIVE'
                          ? 'bg-emerald-500'
                          : staff.status === 'BLOCKED'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    {staff.status}
                  </span>
                </div>

                {/* Subtitle Contact & Branch */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-sm text-slate-400">mail</span>
                    {staff.email}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-sm text-slate-400">call</span>
                    {staff.phone_number || 'No phone set'}
                  </span>
                  {branchInfo && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300">
                        <span className="material-symbols-outlined text-sm text-[#FF6B35]">storefront</span>
                        {branchInfo.branch_name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setBlockReason(staff.status_reason || '')
                  setIsBlockModalOpen(true)
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xs transition ${
                  isBlocked
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isBlocked ? 'lock_open' : 'block'}
                </span>
                {isBlocked ? 'Unblock Member' : 'Block Access'}
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 shadow-2xs transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* 4 SUMMARY STAT STRIPS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Branch 
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-zinc-100 truncate" title={branchInfo?.branch_name}>
              {branchInfo?.branch_name || staff.merchant_branch_id}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
              {staff.merchant_branch_id}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Parent Merchant
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
              {branchInfo?.merchant_name || 'Independent Partner'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
              Category: {branchInfo?.merchant_category || 'General'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Permissions Granted
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {(staff.permissions || []).length} / {PERMISSION_CATALOG.flatMap(c => c.items).length} Capabilities
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Account Registration
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-zinc-100">
              {new Date(staff.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
              Last updated: {new Date(staff.updated_at).toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* TABS NAVIGATION */}
        <div className="border-b border-slate-200 dark:border-zinc-800">
          <nav className="flex space-x-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview ', icon: 'badge' },
              { id: 'branch', label: 'Branch Affiliation', icon: 'storefront' },
              { id: 'permissions', label: `Permissions Matrix (${(staff.permissions || []).length})`, icon: 'security' },
              { id: 'activity', label: 'Activity & Audit Log', icon: 'history' },
              { id: 'security', label: 'Security & Access', icon: 'lock' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 py-3.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>


        {/* TAB 2: BRANCH AFFILIATION (RELATIONSHIP) */}
        {activeTab === 'branch' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-2xl">storefront</span>
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      Merchant Branch Relationship
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Staff belongs to MerchantBranch ({staff.merchant_branch_id}); Merchant derived from branch
                    </p>
                  </div>
                </div>

                {branchInfo?.merchant_id && branchInfo?.id && (
                  <Link
                    to={`/merchants/${branchInfo.merchant_id}/branches/${branchInfo.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                  >
                    <span>View Branch Page</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                )}
              </div>

              {branchInfo ? (
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Branch Details */}
                  <div className="rounded-xl border border-slate-200/80 p-5 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Operational Branch
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          branchInfo.is_open
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${branchInfo.is_open ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {branchInfo.is_open ? 'Open & Receiving Orders' : 'Temporarily Closed'}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                      {branchInfo.branch_name}
                    </h4>

                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex items-start gap-2 text-slate-600 dark:text-zinc-300">
                        <span className="material-symbols-outlined text-sm text-slate-400 shrink-0 mt-0.5">location_on</span>
                        <span>{branchInfo.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300 font-mono">
                        <span className="material-symbols-outlined text-sm text-slate-400">call</span>
                        <span>{branchInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                        <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                        <span>
                          {branchInfo.opening_hours} – {branchInfo.closing_hours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Merchant Details */}
                  <div className="rounded-xl border border-slate-200/80 p-5 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Derived Parent Merchant
                    </span>

                    <div className="mt-4 flex items-center gap-3">
                      <img
                        src={branchInfo.merchant_logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80'}
                        alt={branchInfo.merchant_name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-zinc-700"
                      />
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                          {branchInfo.merchant_name}
                        </h4>
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {branchInfo.merchant_category}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                      <p>
                        This staff member is granted access to the branch portal under merchant account <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">{branchInfo.merchant_id}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">No branch relationship resolved.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PERMISSIONS MATRIX (JSONB) */}
        {activeTab === 'permissions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Granular Access Control & Permissions Matrix
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Configured as a JSONB array stored on staff record ({selectedPermissions.length} active permissions)
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPermissions(
                        PERMISSION_CATALOG.flatMap((cat) => cat.items.map((i) => i.key))
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS[staff.role] || [])
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    Reset Role Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={isSavingPermissions}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    {isSavingPermissions ? 'Saving...' : 'Save Permissions Matrix'}
                  </button>
                </div>
              </div>

              {/* Categorized Permissions Grid */}
              <div className="mt-6 space-y-6">
                {PERMISSION_CATALOG.map((group) => (
                  <div
                    key={group.category}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-[#FF6B35]">
                          {group.categoryIcon}
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                          {group.category}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {group.items.filter((i) => selectedPermissions.includes(i.key)).length} / {group.items.length} granted
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                      {group.items.map((item) => {
                        const isGranted = selectedPermissions.includes(item.key)
                        return (
                          <div
                            key={item.key}
                            onClick={() => handleTogglePermission(item.key)}
                            className={`flex cursor-pointer items-start justify-between rounded-xl border p-3 transition ${
                              isGranted
                                ? 'border-[#FF6B35]/40 bg-white shadow-2xs dark:border-[#FF6B35]/40 dark:bg-zinc-900'
                                : 'border-slate-200 bg-white/60 opacity-60 hover:opacity-100 dark:border-zinc-700/60 dark:bg-zinc-900/60'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                                {item.label}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                {item.description}
                              </p>
                              <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 block pt-1">
                                {item.key}
                              </span>
                            </div>

                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 rounded accent-[#FF6B35] cursor-pointer"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACTIVITY & AUDIT TRAIL */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 dark:border-zinc-800">
                <span className="material-symbols-outlined text-lg text-[#FF6B35]">history</span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  Staff Activity & Audit Trail
                </h3>
              </div>

              <div className="mt-6 flow-root">
                <ul className="-mb-8">
                  {activityLogs.map((log, index) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {index !== activityLogs.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-zinc-800"
                          />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] ring-4 ring-white dark:bg-orange-950/40 dark:ring-zinc-900">
                            <span className="material-symbols-outlined text-base">{log.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                {log.action}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {log.timestamp}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-400">
                              {log.detail}
                            </p>
                            <span className="mt-1 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {log.badge}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-2xl">lock</span>
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      Security &amp; Authentication Credentials
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Password hash storage and cryptographic key access controls
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Password Storage
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordHash(!showPasswordHash)}
                      className="text-xs font-bold text-[#FF6B35] hover:underline"
                    >
                      {showPasswordHash ? 'Hide Hash' : 'Reveal Hash'}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="font-mono text-xs text-slate-800 dark:text-zinc-200 truncate mr-2">
                      {showPasswordHash ? staff.password : '••••••••••••••••••••••••••••••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(staff.password, 'Password Hash')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 shrink-0"
                    >
                      {copiedField === 'Password Hash' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Staff UUID
                  </span>
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="font-mono text-xs text-slate-800 dark:text-zinc-200 truncate mr-2">
                      {staff.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(staff.id, 'Staff UUID')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 shrink-0"
                    >
                      {copiedField === 'Staff UUID' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          >
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-[#FF6B35]">edit</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Edit Staff Profile — {staff.full_name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone_number}
                      onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Reset Password
                    </label>
                    <input
                      type="password"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      placeholder="Leave blank to keep hash"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="OWNER">OWNER</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Owner Flag
                    </label>
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-zinc-700 dark:bg-zinc-800">
                      <input
                        type="checkbox"
                        id="edit_detail_is_owner"
                        checked={editFormData.is_owner || editFormData.role === 'OWNER'}
                        disabled={editFormData.role === 'OWNER'}
                        onChange={(e) => setEditFormData({ ...editFormData, is_owner: e.target.checked })}
                        className="h-4 w-4 rounded accent-[#FF6B35]"
                      />
                      <label htmlFor="edit_detail_is_owner" className="cursor-pointer text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Is Owner
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.profile_picture}
                    onChange={(e) => setEditFormData({ ...editFormData, profile_picture: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BLOCK MODAL */}
        {isBlockModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isBlocked
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isBlocked ? 'lock_open' : 'block'}
                  </span>
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    {isBlocked ? `Unblock ${staff.full_name}` : `Block ${staff.full_name}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {staff.role} · {staff.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  {isBlocked
                    ? 'Unblocking will restore their branch merchant portal login and granted permissions immediately.'
                    : 'Blocking will instantly revoke merchant dashboard access, invalidate active sessions, and prevent staff actions.'}
                </p>

                {!isBlocked && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Reason for Blocking
                    </label>
                    <textarea
                      rows={3}
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="e.g. Compliance audit flag, missing credentials..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmToggleBlock}
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition ${
                    isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isBlocked ? 'Confirm Unblock' : 'Confirm Block'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {isDeleteModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">
                  <span className="material-symbols-outlined text-xl">delete_forever</span>
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Delete Staff Record
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {staff.full_name} ({staff.email})
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600 dark:text-zinc-300">
                Are you sure you want to permanently delete this staff member record? This will unassign them from the branch and remove their profile.
              </p>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteStaffMember(staff.id)
                    navigate('/staff')
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
