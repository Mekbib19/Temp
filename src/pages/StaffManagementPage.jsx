import { useState, useMemo } from 'react'
import MainLayout from '../layouts/MainLayout'
import DataTable from '../components/DataTable'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from '../components/ui/dropdown-menu'

const staffMembers = [
  {
    id: 1,
    name: 'Marcus Vane',
    email: 'marcus.v@culina.com',
    role: 'Executive Chef',
    roleVariant: 'orange',
    branch: 'Downtown Bistro',
    status: 'Active',
    statusVariant: 'active',
    joinedDate: 'Oct 12, 2021',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2fbK2AqH2QSN6mWJCq5P73Tew00oQOr_9TqM7eVuc1bLLP_uRxeIoV-wesiwSYz_UYE8D6ChgP_dHRo910MKMUf494h5lcBj1Db6h5rRs5P7u2Hp7FU_T3cq-jWbuGs10fdK2wFTebSJCupI1wil5MYucfEJybDhYCaHeZILbVV0NsgRAIsv6IXMRuOhnH4SpzpKsmO6Uv3h18NjjC66sKz6ESnipdW61lHtznxENR1Byi1S4psMX_BUQe7J04PHynKpkkGOvKC8',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 's.jenkins@culina.com',
    role: 'Manager',
    roleVariant: 'blue',
    branch: 'Harbor View',
    status: 'Active',
    statusVariant: 'active',
    joinedDate: 'Jan 05, 2022',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIvL7eX9jDEOipCFcw_dAQqTAR-U8ji5GDMLAVuoaA1ztVhIhUVzhSKUd8a81aHArT2Uz6OKhn4aJOlfw3lNScx9Ra9kojATj1gdb49fjSZ7PNDnfpiuRo_OivaOdnguYVqZAtcX5_27MRq7Jmvc5fp-B7CxNfQkptyt2AOc_QduqCP74MPzH4Y706g8_WHkZUcodbhVhRqRQCA6dQj7MRMZW4MLspoZS5dosZO3cDZCC0_gsmTikjE6-BHNMcson_UonclOsgBPg',
  },
  {
    id: 3,
    name: 'David Chen',
    email: 'd.chen@culina.com',
    role: 'Driver',
    roleVariant: 'purple',
    branch: 'Central Kitchen',
    status: 'On Leave',
    statusVariant: 'leave',
    joinedDate: 'Mar 19, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN1IEczdcvsariAG9A6Vs5ZNASqpGwItGRxE68F8417M7l3BWDzFsPoMCd-dMYKsyAViCmKCvv5t2vsum4pJVj7Bt4tzilNI_2nXQ4tvJEcXQCeH5N1VZKXBMn1zNnK_1nz2zNcSgc2lokp2sHfHKhrBRydscH61RaFANOPk--IjHOqyxWogn5QG6ak9785C8Q07tbV4e4oexTSccE0F6NZpsshuB0wPDzU-0CdkH5ISwo9Hz6fmBhbx1GdvHymCOg6c-YdAYb3Do',
  },
  {
    id: 4,
    name: 'Elena Rodriguez',
    email: 'elena.r@culina.com',
    role: 'Cashier',
    roleVariant: 'emerald',
    branch: 'South Plaza',
    status: 'Active',
    statusVariant: 'active',
    joinedDate: 'Dec 01, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6e2X3H-LBCZr7eod1uLCWjUxgD4BPDD8KWKcYnqH2rTr6cZzlNFVhJZhCOvfBk2H8PJX5ycJNMRlaE2nHgJe7HN_MG45wd842dOTYCCxEfygddpi6e1_iCpBW55xs9DFMxf8gWwmZT0hPkWFQCX_7UceFcjIvWQoD6x5PXE-9dyoM6LmRFA9JHKLMBBrDUQim3C8Pw_2ftLrNhbK4Qj-CnWp70TIy2zHhdhM6FQD_B794NSToY1X4WGnO034nkOp5W7Wc3X4u70o',
  },
]

const rolePill = {
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const StaffManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      if (
        searchQuery &&
        !staff.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !staff.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      if (roleFilter !== 'all' && staff.role !== roleFilter) {
        return false
      }
      if (branchFilter !== 'all' && staff.branch !== branchFilter) {
        return false
      }
      if (statusFilter !== 'all' && staff.status.toLowerCase() !== statusFilter) {
        return false
      }
      return true
    })
  }, [searchQuery, roleFilter, branchFilter, statusFilter])

  const columns = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: (info) => {
        const staff = info.row.original
        return (
          <div className="flex items-center space-x-4">
            <img
              alt={staff.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-zinc-900"
              src={staff.avatar}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 text-left">{staff.name}</span>
              <span className="text-[11px] text-slate-400 text-left">{staff.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: (info) => {
        const staff = info.row.original
        return (
          <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${rolePill[staff.roleVariant]}`}>
            {staff.role}
          </span>
        )
      },
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: (info) => (
        <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const staff = info.row.original
        return (
          <div className="flex items-center">
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${staff.statusVariant === 'active' ? 'bg-green-500' : 'bg-slate-300 dark:bg-zinc-600'}`}></span>
            <span className={`text-sm font-medium ${staff.statusVariant === 'active' ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-400'}`}>
              {staff.status}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'joinedDate',
      header: 'Joined Date',
      cell: (info) => (
        <span className="text-sm text-slate-500 dark:text-zinc-400">{info.getValue()}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: {
        headerClassName: 'px-6 py-6 sm:px-8 text-right',
        cellClassName: 'px-6 py-6 sm:px-8 text-right',
      },
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-slate-400 hover:text-[#ab3500] dark:hover:text-orange-400 transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem className="gap-2">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 dark:focus:bg-red-950/50 focus:text-red-600 dark:focus:text-red-400">
                <span className="material-symbols-outlined text-[18px]">person_off</span>
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <MainLayout
      activeMenuKey="staffManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Staff"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Staff Directory
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Manage your culinary workforce across all operational branches. Track assignments, roles, and status from a centralized console.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export List
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Staff Member
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Employees
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">group</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                148
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +12% this year
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Now
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">event_available</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                132
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                89.2% on duty
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                On Leave
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-200/60 dark:bg-purple-950/40 dark:ring-purple-800/40">
                <span className="material-symbols-outlined text-lg">person_off</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                16
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                Scheduled leaves
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Onboarding
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                04
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                In training
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar - Order Management Style with Matching Size Filters Icon and Search Engine */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Engine - Matching Size with Filters Card */}
          <div className="relative h-11 min-w-[280px] flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee name or email..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
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

          {/* Role Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Roles</option>
              <option value="Executive Chef">Executive Chef</option>
              <option value="Manager">Manager</option>
              <option value="Driver">Driver</option>
              <option value="Cashier">Cashier</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Branches</option>
              <option value="Downtown Bistro">Downtown Bistro</option>
              <option value="Harbor View">Harbor View</option>
              <option value="Central Kitchen">Central Kitchen</option>
              <option value="South Plaza">South Plaza</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="on leave">On Leave</option>
            </select>
          </div>

          {(searchQuery || roleFilter !== 'all' || branchFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
                setBranchFilter('all')
                setStatusFilter('all')
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <DataTable
            columns={columns}
            data={filteredStaff}
            keyExtractor={(staff) => staff.id}
            enablePagination={true}
            itemName="employees"
          />
        </section>
      </div>
    </MainLayout>
  )
}

export default StaffManagementPage
