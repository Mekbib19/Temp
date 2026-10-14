const StatCard = ({ title, value, icon, change }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{title}</span>
        {icon && <span className="material-symbols-outlined text-lg text-slate-400">{icon}</span>}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
          {value}
        </span>
        {change && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {change}
          </span>
        )}
      </div>
    </div>
  )
}

export default StatCard
