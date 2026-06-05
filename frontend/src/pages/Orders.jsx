import { useState, useEffect } from 'react'
import { Plus, Trash2, ShoppingCart, ChevronDown, ChevronUp, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi, productsApi, customersApi } from '../api'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    Promise.all([
      ordersApi.getAll(),
      productsApi.getAll(),
      customersApi.getAll(),
    ]).then(([o, p, c]) => {
      setOrders(o)
      setProducts(p)
      setCustomers(c)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i, field, value) => {
    const items = [...form.items]
    items[i] = { ...items[i], [field]: value }
    setForm({ ...form, items })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_id) { toast.error('Select a customer'); return }
    if (form.items.some((it) => !it.product_id)) { toast.error('Select a product for each item'); return }
    setSubmitting(true)
    const payload = {
      customer_id: parseInt(form.customer_id),
      items: form.items.map((it) => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) })),
    }
    try {
      await ordersApi.create(payload)
      toast.success('Order created!')
      setModalOpen(false)
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] })
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try {
      await ordersApi.delete(id)
      toast.success('Order cancelled')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Calc preview total
  const previewTotal = form.items.reduce((sum, it) => {
    const prod = products.find((p) => p.id === parseInt(it.product_id))
    return sum + (prod ? prod.price * (parseInt(it.quantity) || 0) : 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Orders</h1>
          <p className="text-ink-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          New Order
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="card">
            <EmptyState icon={ShoppingCart} title="No orders yet" description="Create your first order to get started" action={<button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={14} />New Order</button>} />
          </div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="card-hover overflow-hidden">
              {/* Order header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              >
                <div className="w-10 h-10 rounded-xl bg-ink-700/50 border border-ink-700 flex items-center justify-center font-mono text-sm font-bold text-ink-300">
                  #{o.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-100">{o.customer?.full_name || `Customer #${o.customer_id}`}</p>
                  <p className="text-xs text-ink-500">{new Date(o.created_at).toLocaleDateString()} · {o.items?.length || 0} items</p>
                </div>
                <div className="text-right mr-2">
                  <p className="font-display font-bold text-lg text-amber-400">${o.total_amount.toFixed(2)}</p>
                  <span className="badge-ink text-xs">{o.status}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(o.id) }}
                  className="p-1.5 rounded-lg text-ink-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                {expanded === o.id ? <ChevronUp size={16} className="text-ink-500" /> : <ChevronDown size={16} className="text-ink-500" />}
              </div>

              {/* Expanded details */}
              {expanded === o.id && (
                <div className="border-t border-ink-700/40 px-4 py-3 bg-ink-800/30">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">Order Items</p>
                  <div className="space-y-2">
                    {o.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink-200">{item.product?.name || `Product #${item.product_id}`}</span>
                        <span className="text-ink-400">
                          {item.quantity} × ${item.unit_price.toFixed(2)} = <span className="text-ink-200 font-medium">${(item.quantity * item.unit_price).toFixed(2)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-ink-700/40">
                    <span className="text-sm text-ink-400">Total</span>
                    <span className="font-bold text-amber-400">${o.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Customer *</label>
            <select className="input" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
              <option value="">Select a customer...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Items *</label>
              <button type="button" onClick={addItem} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                <Plus size={12} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    className="input flex-1"
                    value={item.product_id}
                    onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                        {p.name} (${p.price.toFixed(2)}) — {p.quantity} in stock
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="input w-20"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  />
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-2.5 text-ink-500 hover:text-rose-400 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {previewTotal > 0 && (
            <div className="flex justify-between px-3 py-2.5 rounded-xl bg-amber-400/5 border border-amber-400/20">
              <span className="text-sm text-ink-400">Estimated Total</span>
              <span className="font-bold text-amber-400">${previewTotal.toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
