import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '../api'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '', description: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const load = () => productsApi.getAll().then(setProducts).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
    try {
      if (editing) {
        await productsApi.update(editing.id, data)
        toast.success('Product updated')
      } else {
        await productsApi.create(data)
        toast.success('Product created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await productsApi.delete(id)
      toast.success('Product deleted')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Products</h1>
          <p className="text-ink-400 text-sm mt-1">{products.length} items in inventory</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} strokeWidth={2.5} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          className="input pl-10"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={search ? "Try a different search term" : "Add your first product to get started"}
            action={!search && <button className="btn-primary flex items-center gap-2" onClick={openCreate}><Plus size={14} />Add Product</button>}
          />
        ) : (
          <table className="w-full">
            <thead className="border-b border-ink-700/40 bg-ink-800/30">
              <tr>
                <th className="table-head">Product</th>
                <th className="table-head">SKU</th>
                <th className="table-head">Price</th>
                <th className="table-head">Stock</th>
                <th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-ink-100">{p.name}</p>
                      {p.description && <p className="text-xs text-ink-500 mt-0.5 truncate max-w-xs">{p.description}</p>}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs text-ink-400 bg-ink-700/40 px-2 py-0.5 rounded">{p.sku}</span>
                  </td>
                  <td className="table-cell font-medium">${p.price.toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`badge ${p.quantity === 0 ? 'badge-rose' : p.quantity <= 10 ? 'badge-amber' : 'badge-emerald'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-ink-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg text-ink-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Keyboard" />
            </div>
            <div>
              <label className="label">SKU *</label>
              <input className="input font-mono" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. KB-001" />
            </div>
            <div>
              <label className="label">Price ($) *</label>
              <input className="input" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input className="input" type="number" min="0" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
