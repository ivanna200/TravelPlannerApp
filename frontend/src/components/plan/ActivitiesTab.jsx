import { Activity, Clock, MapPin, Pencil, Trash2, Plus, Calendar, List, AlertCircle, Map } from 'lucide-react';
import Modal        from '../Modal';
import ConfirmModal from '../ConfirmModal';
import CalendarView from '../CalendarView';
import RouteMapView from '../RouteMapView';
import { formatDate } from '../../utils/formatDate';
import { ACTIVITY_STATUSES } from '../../models/Activity';

const STATUS_BADGE = {
  'Planirano':   'badge-sky',
  'Rezervisano': 'badge-violet',
  'Završeno':    'badge-success',
  'Otkazano':    'badge-danger',
};

const ActivitiesTab = ({ hook, plan, planStart, planEnd, dateRangeLabel }) => {
  const {
    activities,
    modal, form, setForm, loading, error,
    actView, setActView,
    confirmModal, setConfirmModal,
    openAdd, openEdit, closeModal,
    handleSubmit, handleDeleteClick, handleDeleteConfirmed,
  } = hook;

  const byDate = activities.reduce((acc, a) => {
    const key = formatDate(a.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const spinBtn = (label) => loading
    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Čuvanje...</>
    : label;

  const formFields = (
    <>
      <div className="alert-info text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Datum mora biti unutar perioda putovanja: {dateRangeLabel}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Naziv *</label>
          <input className="input" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="npr. Eiffelov toranj" required />
        </div>
        <div>
          <label className="label">Lokacija</label>
          <input className="input" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="npr. Pariz, Francuska" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Datum *</label>
          <input type="date" className="input" value={form.date}
            min={planStart} max={planEnd}
            onChange={e => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div>
          <label className="label">Vrijeme</label>
          <input type="time" className="input" value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })} />
        </div>
        <div>
          <label className="label">Trošak (€)</label>
          <input type="number" min="0" step="0.01" className="input" value={form.estimatedCost}
            onChange={e => setForm({ ...form, estimatedCost: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="select" value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}>
            {ACTIVITY_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Opis</label>
          <input className="input" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Kratki opis..." />
        </div>
      </div>
    </>
  );

  const VIEWS = [
    ['list',     List,     'Lista'   ],
    ['calendar', Calendar, 'Kalendar'],
    ['map',      Map,      'Mapa'    ],  
  ];

  return (
    <>
      {confirmModal && (
        <ConfirmModal
          title="Obrisati aktivnost?"
          message={`Obrisati "${confirmModal.name}"? Ova akcija se ne može poništiti.`}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmModal(null)}
        />
      )}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Nova aktivnost' : 'Uredi aktivnost'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields}
            {error && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {spinBtn(modal === 'add' ? 'Sačuvaj aktivnost' : 'Ažuriraj aktivnost')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="section-title">
            <Activity className="w-5 h-5 text-primary-500" />
            Aktivnosti ({activities.length})
          </h2>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {VIEWS.map(([v, I, l]) => (
                <button key={v} onClick={() => setActView(v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                    ${actView === v ? 'bg-white shadow-card text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                  <I className="w-3.5 h-3.5" />{l}
                </button>
              ))}
            </div>
            <button onClick={openAdd} className="btn-sky">
              <Plus className="w-4 h-4" />Dodaj
            </button>
          </div>
        </div>

        {/* Kalendarski prikaz */}
        {actView === 'calendar' && (
          <CalendarView activities={activities} startDate={plan.startDate} endDate={plan.endDate} />
        )}

        {/*  Prikaz rute na mapi — nadogradnja po specifikaciji */}
        {actView === 'map' && (
          <div className="space-y-3">
            <div className="card-sm bg-sky-50 border-sky-100">
              <p className="text-xs text-sky-700">
                <strong>Ruta kretanja</strong> — Prikazuju se aktivnosti s unesenom lokacijom.
                Unesite puni naziv lokacije (npr. "Eiffelov toranj, Pariz") za precizno pozicioniranje na mapi.
              </p>
            </div>
            <RouteMapView activities={activities} selectedDate={null} />
          </div>
        )}

        {/* Lista prikaz */}
        {actView === 'list' && (
          <div className="space-y-4">
            {activities.length === 0 && (
              <div className="card">
                <div className="empty-state">
                  <Activity className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-400 text-sm">Nema aktivnosti. Dodajte prvu aktivnost klikom na dugme gore.</p>
                </div>
              </div>
            )}
            {Object.entries(byDate).map(([dateKey, dayActs]) => (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dateKey}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="badge-neutral text-xs">{dayActs.length}</span>
                </div>
                <div className="space-y-2">
                  {dayActs.map(a => (
                    <div key={a.id} className="card-sm flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-primary-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{a.name}</span>
                            <span className={`badge text-xs ${STATUS_BADGE[a.status] || 'badge-primary'}`}>{a.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                            {a.time     && <span className="flex items-center gap-1"><Clock  className="w-3 h-3" />{a.time}</span>}
                            {a.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</span>}
                            {a.estimatedCost > 0 && <span className="font-semibold text-emerald-600">💰 {a.estimatedCost} €</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEdit(a)}
                          className="btn-icon bg-slate-50 hover:bg-sky-50 hover:text-sky-600 border border-slate-200">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteClick(a)} className="btn-danger">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ActivitiesTab;
