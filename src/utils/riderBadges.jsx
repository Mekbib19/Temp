export const getStatusBadge = (status) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      )
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pending Review
        </span>
      )
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          Blocked
        </span>
      )
    case 'INACTIVE':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Inactive
        </span>
      )
  }
}

export const getVerificationBadge = (status) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span className="material-symbols-outlined text-[13px]">verified</span>
          Approved
        </span>
      )
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400">
          <span className="material-symbols-outlined text-[13px]">pending</span>
          Pending
        </span>
      )
    case 'ONBOARDING':
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-400">
          <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
          Onboarding
        </span>
      )
    case 'REJECTED':
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400">
          <span className="material-symbols-outlined text-[13px]">cancel</span>
          Rejected
        </span>
      )
  }
}

export const getVehicleIcon = (type) => {
  switch (type) {
    case 'MOTORCYCLE':
      return 'two_wheeler'
    case 'BIKE':
      return 'pedal_bike'
    case 'CAR':
      return 'directions_car'
    default:
      return 'local_shipping'
  }
}