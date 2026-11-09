import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DataTable from '../components/DataTable'
import {
  loadStoredStaff,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  setStaffStatus,
  getAllBranchesWithMerchants,
  getBranchAndMerchant,
  PERMISSION_CATALOG,
  DEFAULT_ROLE_PERMISSIONS,
  generateUUID,
} from '../data/demoStaff'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from '../components/ui/dropdown-menu'

export default function StaffManagementPage() {
  const navigate = useNavigate()
  const [staffList, setStaffList] = useState(() => loadStoredStaff())
  const [branches] = useState(() => getAllBranchesWithMerchants())

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [branchFilter, setBranchFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [ownerFilter, setOwnerFilter] = useState('ALL')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeStaff, setActiveStaff] = useState(null)
  const [blockReason, setBlockReason] = useState('')

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    merchant_branch_id: '',
    role: 'STAFF',
    is_owner: false,
    status: 'ACTIVE',
    profile_picture: '',
    password: '',
    permissions: DEFAULT_ROLE_PERMISSIONS.STAFF,
    notes: '',
  })

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // KPI calculations
  const stats = useMemo(() => {
    const total = staffList.length
    const active = staffList.filter((s) => s.status === 'ACTIVE').length
    const ownersAndManagers = staffList.filter(
      (s) => s.is_owner || s.role === 'OWNER' || s.role === 'MANAGER'
    ).length
    const attentionNeeded = staffList.filter(
      (s) => s.status === 'BLOCKED' || s.status === 'PENDING' || s.status === 'INACTIVE'
    ).length

    return { total, active, ownersAndManagers, attentionNeeded }
  }, [staffList])

  // Filtered dataset
  const filteredStaff = useMemo(() => {
    return staffList.filter((member) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = (member.full_name || '').toLowerCase().includes(q)
        const matchesEmail = (member.email || '').toLowerCase().includes(q)
        const matchesPhone = (member.phone_number || '').toLowerCase().includes(q)
        const matchesId = (member.id || '').toLowerCase().includes(q)
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) {
          return false
        }
      }

      // Role filter
      if (roleFilter !== 'ALL' && member.role !== roleFilter) {
        return false
      }

      // Branch filter
      if (branchFilter !== 'ALL' && member.merchant_branch_id !== branchFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'ALL' && member.status !== statusFilter) {
        return false
      }

      // Owner filter
      if (ownerFilter === 'OWNERS_ONLY' && !member.is_owner) {
        return false
      }
      if (ownerFilter === 'STAFF_ONLY' && member.is_owner) {
        return false
      }

      return true
    })
  }, [staffList, searchQuery, roleFilter, branchFilter, statusFilter, ownerFilter])

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setRoleFilter('ALL')
    setBranchFilter('ALL')
    setStatusFilter('ALL')
    setOwnerFilter('ALL')
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    roleFilter !== 'ALL' ||
    branchFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    ownerFilter !== 'ALL'

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const defaultBranchId = branches.length > 0 ? branches[0].id : ''
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      merchant_branch_id: defaultBranchId,
      role: 'STAFF',
      is_owner: false,
      status: 'ACTIVE',
      profile_picture: '',
      password: '',
      permissions: [...DEFAULT_ROLE_PERMISSIONS.STAFF],
      notes: '',
    })
    setIsCreateModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (staff) => {
    setActiveStaff(staff)
    setFormData({
      full_name: staff.full_name || '',
      email: staff.email || '',
      phone_number: staff.phone_number || '',
      merchant_branch_id: staff.merchant_branch_id || (branches[0]?.id || ''),
      role: staff.role || 'STAFF',
      is_owner: !!staff.is_owner,
      status: staff.status || 'ACTIVE',
      profile_picture: staff.profile_picture || '',
      password: '',
      permissions: Array.isArray(staff.permissions)
        ? [...staff.permissions]
        : [...DEFAULT_ROLE_PERMISSIONS[staff.role || 'STAFF']],
      notes: staff.notes || '',
    })
    setIsEditModalOpen(true)
  }

  // Open Block Modal
  const handleOpenBlockModal = (staff) => {
    setActiveStaff(staff)
    setBlockReason(staff.status_reason || 'Administrative hold / compliance review')
    setIsBlockModalOpen(true)
  }

  // Confirm Toggle Block
  const handleConfirmToggleBlock = () => {
    if (!activeStaff) return
    const isCurrentlyBlocked = activeStaff.status === 'BLOCKED'
    const newStatus = isCurrentlyBlocked ? 'ACTIVE' : 'BLOCKED'
    const updated = setStaffStatus(activeStaff.id, newStatus, isCurrentlyBlocked ? '' : blockReason)
    if (updated) {
      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      showToast(
        isCurrentlyBlocked
          ? `Staff member ${activeStaff.full_name} has been unblocked`
          : `Staff member ${activeStaff.full_name} has been blocked`
      )
    }
    setIsBlockModalOpen(false)
    setActiveStaff(null)
  }

  // Delete Staff Member
  const handleOpenDeleteModal = (staff) => {
    setActiveStaff(staff)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!activeStaff) return
    const updated = deleteStaffMember(activeStaff.id)
    setStaffList(updated)
    showToast(`Deleted staff member ${activeStaff.full_name}`)
    setIsDeleteModalOpen(false)
    setActiveStaff(null)
  }

  // Handle Role Change in Form (auto-sync default permissions and is_owner)
  const handleRoleChange = (newRole) => {
    const isOwner = newRole === 'OWNER' || (formData.is_owner && newRole !== 'STAFF')
    const defaults = DEFAULT_ROLE_PERMISSIONS[newRole] || DEFAULT_ROLE_PERMISSIONS.STAFF
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      is_owner: isOwner,
      permissions: [...defaults],
    }))
  }

  // Toggle single permission in Form
  const handleTogglePermission = (permKey) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permKey)
      const newPerms = exists
        ? prev.permissions.filter((k) => k !== permKey)
        : [...prev.permissions, permKey]
      return { ...prev, permissions: newPerms }
    })
  }

  // Save New Staff Member
  const handleSaveNewStaff = (e) => {
    e.preventDefault()
    if (!formData.full_name.trim()) {
      showToast('Please enter full name')
      return
    }
    if (!formData.email.trim()) {
      showToast('Please enter email address')
      return
    }
    if (!formData.merchant_branch_id) {
      showToast('Please select a merchant branch')
      return
    }

    const created = createStaffMember(formData)
    setStaffList((prev) => [created, ...prev])
    showToast(`Staff member ${created.full_name} created successfully`)
    setIsCreateModalOpen(false)
  }

  // Save Edit Staff Member
  const handleSaveEditStaff = (e) => {
    e.preventDefault()
    if (!activeStaff) return
    if (!formData.full_name.trim()) {
      showToast('Please enter full name')
      return
    }
    if (!formData.email.trim()) {
      showToast('Please enter email address')
      return
    }

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      merchant_branch_id: formData.merchant_branch_id,
      role: formData.role,
      is_owner: formData.is_owner,
      status: formData.status,
      profile_picture: formData.profile_picture || activeStaff.profile_picture,
      permissions: formData.permissions,
      notes: formData.notes,
    }
    if (formData.password && formData.password.trim()) {
      payload.password = `$2a$12$${generateUUID().replace(/-/g, '').slice(0, 22)}${generateUUID().replace(/-/g, '').slice(0, 31)}`
    }

    const updated = updateStaffMember(activeStaff.id, payload)
    if (updated) {
      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      showToast(`Updated details for ${updated.full_name}`)
    }
    setIsEditModalOpen(false)
    setActiveStaff(null)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone Number',
      'Merchant Branch ID',
      'Branch Name',
      'Merchant Name',
      'Role',
      'Is Owner',
      'Status',
      'Permissions Count',
      'Created At',
    ]

    const rows = filteredStaff.map((s) => {
      const branchInfo = getBranchAndMerchant(s.merchant_branch_id)
      return [
        `"${s.id}"`,
        `"${s.full_name || ''}"`,
        `"${s.email || ''}"`,
        `"${s.phone_number || ''}"`,
        `"${s.merchant_branch_id || ''}"`,
        `"${branchInfo?.branch_name || ''}"`,
        `"${branchInfo?.merchant_name || ''}"`,
        `"${s.role || 'STAFF'}"`,
        s.is_owner ? 'TRUE' : 'FALSE',
        `"${s.status || 'ACTIVE'}"`,
        (s.permissions || []).length,
        `"${s.created_at || ''}"`,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `merchant_staff_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported CSV file successfully')
  }

  // DataTable Columns definition
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Staff Member',
      cell: (info) => {
        const staff = info.row.original
        return (
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={
                  staff.profile_picture ||
                  `https://ui-avatars.com/api/?background=FF6B35&color=fff&bold=true&name=${encodeURIComponent(
                    staff.full_name || 'Staff'
                  )}`
                }
                alt={staff.full_name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?background=FF6B35&color=fff&bold=true&name=${encodeURIComponent(
                    staff.full_name || 'Staff'
                  )}`
                }}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-zinc-800"
              />
              {staff.is_owner && (
                <span
                  title="Owner"
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white shadow-xs"
                >
                  <span className="material-symbols-outlined text-[11px]">star</span>
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <Link
                to={`/staff/${staff.id}`}
                className="font-bold text-slate-900 transition hover:text-[#FF6B35] dark:text-zinc-100 dark:hover:text-[#FF6B35] truncate text-sm"
              >
                {staff.full_name}
              </Link>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                {staff.email}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Role & Ownership',
      cell: (info) => {
        const staff = info.row.original
        const role = staff.role || 'STAFF'
        const roleBadge =
          role === 'OWNER'
            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300'
            : role === 'MANAGER'
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300'
            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300'

        return (
          <div className="flex flex-col items-start gap-1">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadge}`}>
              {role === 'OWNER' && <span className="material-symbols-outlined text-xs">workspace_premium</span>}
              {role === 'MANAGER' && <span className="material-symbols-outlined text-xs">manage_accounts</span>}
              {role === 'STAFF' && <span className="material-symbols-outlined text-xs">person</span>}
              {role}
            </span>
            {staff.is_owner && role !== 'OWNER' && (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">verified</span>
                Co-Owner
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'merchant_branch_id',
      header: 'Assigned Branch',
      cell: (info) => {
        const branchId = info.getValue()
        const branchInfo = getBranchAndMerchant(branchId)

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
              <span className="material-symbols-outlined text-sm text-[#FF6B35]">storefront</span>
              <span className="truncate max-w-[200px]" title={branchInfo.branch_name}>
                {branchInfo.branch_name}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[200px]">
              {branchInfo.merchant_name}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'phone_number',
      header: 'Contact',
      cell: (info) => {
        const phone = info.getValue()
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-zinc-300">
            <span className="material-symbols-outlined text-xs text-slate-400">call</span>
            <span>{phone || '—'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: (info) => {
        const staff = info.row.original
        const perms = Array.isArray(staff.permissions) ? staff.permissions : []
        const count = perms.length

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
              {count}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              granted
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = (info.getValue() || 'ACTIVE').toUpperCase()
        let dotColor = 'bg-emerald-500'
        let textColor = 'text-slate-900 dark:text-zinc-100'

        if (status === 'INACTIVE') {
          dotColor = 'bg-slate-400'
          textColor = 'text-slate-500 dark:text-zinc-400'
        } else if (status === 'PENDING') {
          dotColor = 'bg-amber-500'
          textColor = 'text-amber-700 dark:text-amber-400'
        } else if (status === 'BLOCKED') {
          dotColor = 'bg-rose-500'
          textColor = 'text-rose-700 dark:text-rose-400'
        }

        return (
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dotColor}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
              {status}
            </span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: {
        headerClassName: 'text-right',
        cellClassName: 'text-right',
      },
      cell: (info) => {
        const staff = info.row.original
        const isBlocked = staff.status === 'BLOCKED'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-base">more_vert</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" className="min-w-[170px]">
                <DropdownMenuItem onClick={() => navigate(`/staff/${staff.id}`)} className="gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-500">visibility</span>
                  View Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEditModal(staff)} className="gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-500">edit</span>
                  Edit Member
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (staff.merchant_branch_id) {
                      const branchInfo = getBranchAndMerchant(staff.merchant_branch_id)
                      if (branchInfo.merchant_id && branchInfo.id) {
                        navigate(`/merchants/${branchInfo.merchant_id}/branches/${branchInfo.id}`)
                      }
                    }
                  }}
                  className="gap-2"
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">storefront</span>
                  View Branch
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleOpenBlockModal(staff)}
                  className={`gap-2 ${
                    isBlocked
                      ? 'text-emerald-600 focus:text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 focus:text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {isBlocked ? 'check_circle' : 'block'}
                  </span>
                  {isBlocked ? 'Unblock Staff' : 'Block Access'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenDeleteModal(staff)}
                  className="gap-2 text-rose-600 focus:text-rose-600 dark:text-rose-400"
                >
                  <span className="material-symbols-outlined text-[17px]">delete</span>
                  Delete Staff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <MainLayout
      activeMenuKey="staffManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Staff Directory"
    >
      <div className="space-y-6 pb-12 animate-fade-in">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl dark:border-zinc-700 dark:bg-zinc-100 dark:text-slate-900">
            <span className="material-symbols-outlined text-base text-[#FF6B35]">info</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Staff Management
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Manage restaurant and merchant branch personnel, store owners, managers, and access permissions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Add Staff Member
            </button>
          </div>
        </section>

        {/* 4 Standard Metric Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Staff
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">badge</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {stats.total}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Across {branches.length} branches
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Staff
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {stats.active}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% operational
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Owners & Managers
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">manage_accounts</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {stats.ownersAndManagers}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Key leaders
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Needs Attention
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">warning</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {stats.attentionNeeded}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Pending / Blocked
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>

          <div className="mx-1 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Input */}
          <div className="relative h-11 min-w-[260px] flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff name, email, or phone..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <div className="flex min-w-[180px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Merchant Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branch_name} ({b.merchant_name})
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex min-w-[130px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex min-w-[130px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          {/* Ownership Filter */}
          <div className="flex min-w-[130px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Ownership
            </label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Personnel</option>
              <option value="OWNERS_ONLY">Owners Only</option>
              <option value="STAFF_ONLY">Non-Owners Only</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Data Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <DataTable
            columns={columns}
            data={filteredStaff}
            keyExtractor={(staff) => staff.id}
            enablePagination={true}
            itemName="staff members"
          />
        </section>

        {/* CREATE / ADD STAFF MODAL */}
        {isCreateModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-[#FF6B35]">person_add</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Add Merchant Branch Staff Member
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveNewStaff} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Almaz Bekele"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Email Address (Indexed) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="almaz.b@merchant.et"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="+251 91 234 5678"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Initial Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to auto-generate bcrypt hash"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Assigned Merchant Branch (Belongs to MerchantBranch) *
                  </label>
                  <select
                    required
                    value={formData.merchant_branch_id}
                    onChange={(e) => setFormData({ ...formData, merchant_branch_id: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="" disabled>Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name} — {b.merchant_name} ({b.merchant_category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role, Ownership, Status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="OWNER">OWNER</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Initial Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                      Ownership Flag
                    </label>
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-zinc-700 dark:bg-zinc-800">
                      <input
                        type="checkbox"
                        id="create_is_owner"
                        checked={formData.is_owner || formData.role === 'OWNER'}
                        disabled={formData.role === 'OWNER'}
                        onChange={(e) => setFormData({ ...formData, is_owner: e.target.checked })}
                        className="h-4 w-4 rounded accent-[#FF6B35]"
                      />
                      <label htmlFor="create_is_owner" className="cursor-pointer text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Is Store Owner
                      </label>
                    </div>
                  </div>
                </div>

                {/* Profile Picture URL */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Profile Picture URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.profile_picture}
                    onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                    placeholder="https://... (Leave blank for auto-generated avatar)"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                {/* Permissions JSONB Matrix Preview */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Permissions Matrix ({formData.permissions.length} granted)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        JSONB array configured for role: {formData.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            permissions: PERMISSION_CATALOG.flatMap((cat) => cat.items.map((i) => i.key)),
                          })
                        }
                        className="text-[11px] font-bold text-[#FF6B35] hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 dark:text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            permissions: DEFAULT_ROLE_PERMISSIONS[formData.role] || [],
                          })
                        }
                        className="text-[11px] font-bold text-slate-600 hover:underline dark:text-zinc-300"
                      >
                        Reset Role Preset
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {PERMISSION_CATALOG.map((group) => (
                      <div key={group.category} className="border-b border-slate-200/60 pb-2.5 last:border-0 dark:border-zinc-700/60">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                          <span className="material-symbols-outlined text-sm">{group.categoryIcon}</span>
                          {group.category}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {group.items.map((item) => {
                            const isChecked = formData.permissions.includes(item.key)
                            return (
                              <label
                                key={item.key}
                                className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-white dark:hover:bg-zinc-800 transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(item.key)}
                                  className="mt-0.5 h-3.5 w-3.5 rounded accent-[#FF6B35]"
                                />
                                <div className="text-[11px]">
                                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                                    {item.label}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                                    {item.key}
                                  </span>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                  >
                    Save Staff Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT STAFF MODAL */}
        {isEditModalOpen && activeStaff && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-[#FF6B35]">edit</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    Edit Staff Member — {activeStaff.full_name}
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

              <form onSubmit={handleSaveEditStaff} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Reset Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave empty to keep existing hash"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Assigned Merchant Branch *
                  </label>
                  <select
                    required
                    value={formData.merchant_branch_id}
                    onChange={(e) => setFormData({ ...formData, merchant_branch_id: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name} — {b.merchant_name} ({b.merchant_category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role, Ownership, Status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                      Ownership Flag
                    </label>
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-zinc-700 dark:bg-zinc-800">
                      <input
                        type="checkbox"
                        id="edit_is_owner"
                        checked={formData.is_owner || formData.role === 'OWNER'}
                        disabled={formData.role === 'OWNER'}
                        onChange={(e) => setFormData({ ...formData, is_owner: e.target.checked })}
                        className="h-4 w-4 rounded accent-[#FF6B35]"
                      />
                      <label htmlFor="edit_is_owner" className="cursor-pointer text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Is Store Owner
                      </label>
                    </div>
                  </div>
                </div>

                {/* Permissions JSONB Matrix */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Granular Permissions ({formData.permissions.length} granted)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        JSONB array stored in database
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            permissions: PERMISSION_CATALOG.flatMap((cat) => cat.items.map((i) => i.key)),
                          })
                        }
                        className="text-[11px] font-bold text-[#FF6B35] hover:underline"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {PERMISSION_CATALOG.map((group) => (
                      <div key={group.category} className="border-b border-slate-200/60 pb-2.5 last:border-0 dark:border-zinc-700/60">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                          <span className="material-symbols-outlined text-sm">{group.categoryIcon}</span>
                          {group.category}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {group.items.map((item) => {
                            const isChecked = formData.permissions.includes(item.key)
                            return (
                              <label
                                key={item.key}
                                className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-white dark:hover:bg-zinc-800 transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(item.key)}
                                  className="mt-0.5 h-3.5 w-3.5 rounded accent-[#FF6B35]"
                                />
                                <div className="text-[11px]">
                                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                                    {item.label}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                                    {item.key}
                                  </span>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
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

        {/* BLOCK / UNBLOCK MODAL */}
        {isBlockModalOpen && activeStaff && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    activeStaff.status === 'BLOCKED'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {activeStaff.status === 'BLOCKED' ? 'lock_open' : 'block'}
                  </span>
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    {activeStaff.status === 'BLOCKED'
                      ? `Unblock ${activeStaff.full_name}`
                      : `Block ${activeStaff.full_name}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {activeStaff.role} · {activeStaff.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  {activeStaff.status === 'BLOCKED'
                    ? 'Unblocking will restore their branch merchant portal login and granted permissions immediately.'
                    : 'Blocking will instantly revoke merchant dashboard access, invalidate active sessions, and prevent staff actions.'}
                </p>

                {activeStaff.status !== 'BLOCKED' && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Reason for Blocking
                    </label>
                    <textarea
                      rows={3}
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="e.g. Compliance audit flag, missing credentials, internal investigation..."
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
                    activeStaff.status === 'BLOCKED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {activeStaff.status === 'BLOCKED' ? 'Confirm Unblock' : 'Confirm Block'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {isDeleteModalOpen && activeStaff && (
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
                    {activeStaff.full_name} ({activeStaff.email})
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600 dark:text-zinc-300">
                Are you sure you want to permanently delete this staff member record? This will unassign them from the branch and purge their database record.
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
                  onClick={handleConfirmDelete}
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
