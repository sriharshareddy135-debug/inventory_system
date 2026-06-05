export default function StatCard({ label, value, icon: Icon, color = 'amber', sub }) {
  const colors = {
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    ink: 'text-ink-300 bg-ink-700/30 border-ink-600/30',
  }

  return (
    <div className="card p-5 flex gap-4 items-start">
      <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider">{label}</p>
        <p className="font-display text-3xl font-bold text-ink-50 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
