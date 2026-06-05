import { useState, useEffect } from 'react'
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import { dashboardApi } from '../api'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  )

  if (error) return (
    <div className="card p-6 border-rose-500/30 bg-rose-500/5">
      <p className="text-rose-400 text-sm">Error: {error}</p>
      <p className="text-ink-500 text-xs mt-1">Make sure the backend is running.</p>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="text-ink-400 text-sm mt-1">Overview of your inventory and operations</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats?.total_products ?? 0}
          icon={Package}
          color="amber"
        />
        <StatCard
          label="Total Customers"
          value={stats?.total_customers ?? 0}
          icon={Users}
          color="emerald"
        />
        <StatCard
          label="Total Orders"
          value={stats?.total_orders ?? 0}
          icon={ShoppingCart}
          color="ink"
        />
        <StatCard
          label="Low Stock Items"
          value={stats?.low_stock_products?.length ?? 0}
          icon={AlertTriangle}
          color="rose"
          sub="≤ 10 units"
        />
      </div>

      {/* Low stock alert */}
      {stats?.low_stock_products?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-rose-400" />
            <h2 className="font-display font-semibold text-ink-100">Low Stock Alert</h2>
            <span className="badge-rose ml-auto">{stats.low_stock_products.length} items</span>
          </div>
          <div className="space-y-2">
            {stats.low_stock_products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-ink-700/30 border border-ink-700/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink-100">{p.name}</p>
                  <p className="text-xs text-ink-500 font-mono mt-0.5">{p.sku}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${p.quantity === 0 ? 'badge-rose' : 'badge-amber'}`}>
                    {p.quantity} left
                  </span>
                  <p className="text-xs text-ink-500 mt-0.5">${p.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome card when empty */}
      {stats?.total_products === 0 && (
        <div className="card p-8 text-center border-dashed border-ink-600/40">
          <TrendingUp size={32} className="text-ink-600 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-ink-300">Get started</h3>
          <p className="text-sm text-ink-500 mt-1">Add your first product to start managing inventory.</p>
        </div>
      )}
    </div>
  )
}
