import { Wallet, Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import Modal        from '../Modal';
import ConfirmModal from '../ConfirmModal';
import { formatDate } from '../../utils/formatDate';
import { EXPENSE_CATEGORIES } from '../../models/Expense';

const ExpensesTab = ({ hook, planStart, planEnd, dateRangeLabel }) => {
  const {
    expenses, budgetSummary,
    modal, form, setForm, loading, error,
    confirmModal, setConfirmModal,
    openAdd, openEdit, closeModal,
    handleSubmit, handleDeleteClick, handleDeleteConfirmed,
  } = hook;

  const spinBtn = (label) => loading
    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Čuvanje...</>
    : label;

  const formFields = (
    <>
      <div className="alert-info text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Datum troška mora biti unutar perioda putovanja: {dateRangeLabel}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Naziv *</label>
          <input className="input" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="npr. Avionska karta" required />
        </div>
        <div>
          <label className="label">Kategorija</label>
          <select className="select" value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}>
            {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Iznos (€) *</label>
          <input type="number" min="0.01" step="0.01" className="input" value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })} required />
        </div>
        <div>
          <label className="label">Datum</label>
          <input type="date" className="input" value={form.date}
            min={planStart} max={planEnd}
            onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Opis</label>
        <input className="input" value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Kratki opis..." />
      </div>
    </>
  );

  return (
    <>
      {/* ── Modali ── */}
      {confirmModal && (
        <ConfirmModal
          title="Obrisati trošak?"
          message={`Obrisati "${confirmModal.name}"? Ova akcija se ne može poništiti.`}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmModal(null)}
        />
      )}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Novi trošak' : 'Uredi trošak'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields}
            {error && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {spinBtn(modal === 'add' ? 'Sačuvaj trošak' : 'Ažuriraj trošak')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Sadržaj ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            <Wallet className="w-5 h-5 text-emerald-500" />
            Troškovi ({expenses.length})
          </h2>
          <button onClick={openAdd} className="btn-sky">
            <Plus className="w-4 h-4" />Dodaj
          </button>
        </div>

        {budgetSummary && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card-sm text-center">
              <div className="text-xl font-bold text-slate-800">{budgetSummary.plannedBudget} €</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Planirani budžet</div>
            </div>
            <div className="card-sm text-center bg-rose-50 border-rose-100">
              <div className="text-xl font-bold text-rose-500">{budgetSummary.totalExpenses} €</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Potrošeno</div>
            </div>
            <div className={`card-sm text-center ${budgetSummary.remainingBudget >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className={`text-xl font-bold ${budgetSummary.remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {budgetSummary.remainingBudget} €
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Preostalo</div>
            </div>
          </div>
        )}

        {budgetSummary?.byCategory?.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Troškovi po kategorijama</h3>
            <div className="space-y-2.5">
              {budgetSummary.byCategory.map(c => {
                const pct = budgetSummary.totalExpenses > 0
                  ? (c.total / budgetSummary.totalExpenses) * 100 : 0;
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">{c.category}</span>
                      <span className="font-bold text-slate-800">{c.total} €</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {expenses.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <Wallet className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm">Nema evidentiranih troškova.</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {expenses.map(exp => (
            <div key={exp.id} className="card-sm flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{exp.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge-neutral text-xs">{exp.category}</span>
                    {exp.date && <span className="text-xs text-slate-400">{formatDate(exp.date)}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg font-bold text-slate-800">{exp.amount} €</span>
                <button onClick={() => openEdit(exp)}
                  className="btn-icon bg-slate-50 hover:bg-sky-50 hover:text-sky-600 border border-slate-200">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDeleteClick(exp)} className="btn-danger">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExpensesTab;
