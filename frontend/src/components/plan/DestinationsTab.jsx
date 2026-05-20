import { MapPin, Pencil, Trash2, Plus, Calendar, AlertCircle } from 'lucide-react';
import Modal        from '../Modal';
import ConfirmModal from '../ConfirmModal';
import { formatDateRange } from '../../utils/formatDate';

const DestinationsTab = ({ hook, planStart, planEnd, dateRangeLabel }) => {
  const {
    destinations,
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
        Datumi moraju biti unutar perioda putovanja: {dateRangeLabel}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Naziv *</label>
          <input className="input" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="npr. Pariz" required />
        </div>
        <div>
          <label className="label">Lokacija *</label>
          <input className="input" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="npr. Francuska" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Datum dolaska *</label>
          <input type="date" className="input" value={form.arrivalDate}
            min={planStart} max={planEnd}
            onChange={e => setForm({ ...form, arrivalDate: e.target.value })} required />
        </div>
        <div>
          <label className="label">Datum odlaska *</label>
          <input type="date" className="input" value={form.departureDate}
            min={form.arrivalDate || planStart} max={planEnd}
            onChange={e => setForm({ ...form, departureDate: e.target.value })} required />
        </div>
      </div>
      <div>
        <label className="label">Opis / napomene</label>
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
          title="Obrisati destinaciju?"
          message={`Obrisati "${confirmModal.name}"? Ova akcija se ne može poništiti.`}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmModal(null)}
        />
      )}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Nova destinacija' : 'Uredi destinaciju'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields}
            {error && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {spinBtn(modal === 'add' ? 'Sačuvaj destinaciju' : 'Ažuriraj destinaciju')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Sadržaj ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            <MapPin className="w-5 h-5 text-sky-500" />
            Destinacije ({destinations.length})
          </h2>
          <button onClick={openAdd} className="btn-sky">
            <Plus className="w-4 h-4" />Dodaj
          </button>
        </div>

        {destinations.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <MapPin className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-400 font-medium text-sm">
                Nema destinacija. Dodajte prvu destinaciju klikom na dugme gore.
              </p>
            </div>
          </div>
        )}

        {destinations.map((d, i) => (
          <div key={d.id} className="card flex items-start gap-4">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">{d.name}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{d.location}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(d)}
                    className="btn-icon bg-slate-50 hover:bg-sky-50 hover:text-sky-600 border border-slate-200">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteClick(d)} className="btn-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                <Calendar className="w-3 h-3" />{formatDateRange(d.arrivalDate, d.departureDate)}
              </div>
              {d.description && (
                <div className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-xl p-2.5">
                  {d.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DestinationsTab;
