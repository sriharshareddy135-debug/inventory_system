import { useState, useEffect } from 'react'
import { Plus, Trash2, Users, Search, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { customersApi } from '../api'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

const EMPTY_FORM = { full_name: '', email: '', phone: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const load = () => customersApi.getAll().then(setCustomers).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await customersApi.create(form)
      toast.success('Customer added')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await customersApi.delete(id)
      toast.success('Customer deleted')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Customers</h1>
          <p className="text-ink-400 text-sm mt-1">{customers.length} registered customers</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}>
          <Plus size={16} strokeWidth={2.5} />
          Add Customer
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input className="input pl-10" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description={search ? "Try a different search" : "Add your first customer"} action={!search && <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={14} />Add Customer</button>} />
        ) : (
          <table className="w-full">
            <thead className="border-b border-ink-700/40 bg-ink-800/30">
              <tr>
                <th className="table-head">Customer</th>
                <th className="table-head">Contact</th>
                <th className="table-head">Joined</th>
                <th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium text-ink-100">{c.full_name}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-ink-400">
                        <Mail size={11} />
                        {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-ink-500">
                          <Phone size={11} />
                          {c.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell text-ink-500 text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.full_name)}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-000-0000" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
