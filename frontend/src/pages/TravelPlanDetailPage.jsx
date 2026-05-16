import { useEffect, useState } from 'react';
import { useParams, Link }    from 'react-router-dom';
import { useTravelPlan }      from '../hooks/useTravelPlan';
import { useToast }           from '../hooks/useToast';
import { ACTIVITY_STATUSES }  from '../models/Activity';
import { EXPENSE_CATEGORIES } from '../models/Expense';
import LoadingSpinner  from '../components/LoadingSpinner';
import CalendarView    from '../components/CalendarView';
import Modal           from '../components/Modal';
import ConfirmModal    from '../components/ConfirmModal';
import sharingService  from '../services/sharingService';
import { formatDate, formatDateLong, formatDateRange } from '../utils/formatDate';
import {
  ArrowLeft, Pencil, MapPin, Calendar, Wallet, Activity, CheckSquare,
  Share2, BarChart3, Plus, Trash2, Eye, Clock, AlertCircle,
  CheckCircle, Copy, QrCode, List,
} from 'lucide-react';

// ── Konstante ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Pregled',     icon: BarChart3   },
  { id: 'destinations', label: 'Destinacije', icon: MapPin      },
  { id: 'activities',   label: 'Aktivnosti',  icon: Activity    },
  { id: 'expenses',     label: 'Troškovi',    icon: Wallet      },
  { id: 'checklist',    label: 'Checklist',   icon: CheckSquare },
  { id: 'sharing',      label: 'Dijeljenje',  icon: Share2      },
];

const STATUS_BADGE = {
  'Planirano':   'badge-sky',
  'Rezervisano': 'badge-violet',
  'Završeno':    'badge-success',
  'Otkazano':    'badge-danger',
};

// ── Komponenta ────────────────────────────────────────────────────────────────
const TravelPlanDetailPage = () => {
  const { id } = useParams();
  const {
    currentPlan: plan, destinations, activities, expenses, checklist,
    budgetSummary, loading, error: ctxErr,
    fetchPlan,
    addDestination,    updateDestination, removeDestination,
    addActivity,       updateActivity,    removeActivity,
    addExpense,        updateExpense,     removeExpense,
    addChecklistItem,  toggleChecklistItem, removeChecklistItem,
  } = useTravelPlan();

  const { showToast } = useToast();

  // ── UI State ──
  const [activeTab,    setActiveTab]   = useState('overview');
  const [actView,      setActView]     = useState('list');
  // modal: null | 'dest' | 'act' | 'exp' | 'editDest' | 'editAct' | 'editExp'
  const [modal,        setModal]       = useState(null);
  const [editTarget,   setEditTarget]  = useState(null);
  const [shareToken,   setShareToken]  = useState(null);
  const [copied,       setCopied]      = useState(false);
  const [localErr,     setLocalErr]    = useState('');
  const [checkInput,   setCheckInput]  = useState('');
  const [apiLoading,   setApiLoading]  = useState(false);

  // FIX: ConfirmModal state umjesto window.confirm()
  const [confirmModal, setConfirmModal] = useState(null);

  // ── Forme ──
  const emptyDest = { name: '', location: '', arrivalDate: '', departureDate: '', description: '' };
  const emptyAct  = { name: '', date: '', time: '', location: '', description: '', estimatedCost: 0, status: 'Planirano' };
  const emptyExp  = { name: '', category: 'Prevoz', amount: '', date: '', description: '' };

  const [destForm, setDestForm] = useState(emptyDest);
  const [actForm,  setActForm]  = useState(emptyAct);
  const [expForm,  setExpForm]  = useState(emptyExp);

  const planStart = plan?.startDate?.split('T')[0];
  const planEnd   = plan?.endDate?.split('T')[0];

  useEffect(() => { fetchPlan(id); }, [id, fetchPlan]);

  // ── Helpers ──
  const notifyErr = (msg) => { setLocalErr(msg); setTimeout(() => setLocalErr(''), 4000); };

  const isDateInPlan = (dateStr) => {
    if (!dateStr || !planStart || !planEnd) return true;
    return dateStr >= planStart && dateStr <= planEnd;
  };

  const spinBtn = (label) => apiLoading
    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Čuvanje...</>
    : label;

  // ── Modal otvaranje ──
  const openModal = (type) => {
    setDestForm(emptyDest); setActForm(emptyAct); setExpForm(emptyExp);
    setEditTarget(null);
    setLocalErr('');
    setModal(type);
  };

  const openEditModal = (type, item) => {
    setLocalErr('');
    setEditTarget(item);
    if (type === 'editDest') {
      setDestForm({
        name:          item.name,
        location:      item.location,
        arrivalDate:   item.arrivalDate?.split('T')[0]   || '',
        departureDate: item.departureDate?.split('T')[0] || '',
        description:   item.description || '',
      });
    } else if (type === 'editAct') {
      setActForm({
        name:          item.name,
        date:          item.date?.split('T')[0] || '',
        time:          item.time          || '',
        location:      item.location      || '',
        description:   item.description   || '',
        estimatedCost: item.estimatedCost || 0,
        status:        item.status        || 'Planirano',
      });
    } else if (type === 'editExp') {
      setExpForm({
        name:        item.name,
        category:    item.category || 'Prevoz',
        amount:      item.amount   || '',
        date:        item.date?.split('T')[0] || '',
        description: item.description || '',
      });
    }
    setModal(type);
  };

  // FIX: Umjesto window.confirm — otvara ConfirmModal, izvršava akciju pri potvrdi
  const handleDeleteClick = (action, name, successMsg) => {
    setConfirmModal({ action, name, successMsg });
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await confirmModal.action();
      showToast(confirmModal.successMsg);
    } catch {
      showToast('Greška pri brisanju.', 'error');
    }
  };

  // ── ADD Handlers ──
  const handleAddDestination = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(destForm.arrivalDate) || !isDateInPlan(destForm.departureDate)) {
      notifyErr('Datumi destinacije moraju biti unutar perioda putovanja!'); return;
    }
    if (destForm.departureDate && destForm.arrivalDate && destForm.departureDate < destForm.arrivalDate) {
      notifyErr('Datum odlaska ne može biti prije datuma dolaska!'); return;
    }
    setApiLoading(true);
    try {
      await addDestination({ ...destForm, travelPlanId: parseInt(id) });
      setModal(null);
      showToast('Destinacija uspješno dodana!');
    } catch { notifyErr('Greška pri dodavanju destinacije.'); }
    finally { setApiLoading(false); }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(actForm.date)) {
      notifyErr('Datum aktivnosti mora biti unutar perioda putovanja!'); return;
    }
    setApiLoading(true);
    try {
      await addActivity({
        ...actForm,
        travelPlanId:  parseInt(id),
        estimatedCost: parseFloat(actForm.estimatedCost) || 0,
      });
      setModal(null);
      showToast('Aktivnost uspješno dodana!');
    } catch { notifyErr('Greška pri dodavanju aktivnosti.'); }
    finally { setApiLoading(false); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (expForm.date && !isDateInPlan(expForm.date)) {
      notifyErr('Datum troška mora biti unutar perioda putovanja!'); return;
    }
    setApiLoading(true);
    try {
      await addExpense({
        ...expForm,
        travelPlanId: parseInt(id),
        amount:       parseFloat(expForm.amount),
      }, plan.budget);
      setModal(null);
      showToast('Trošak uspješno dodan!');
    } catch { notifyErr('Greška pri dodavanju troška.'); }
    finally { setApiLoading(false); }
  };

  // ── EDIT Handlers ──
  const handleEditDestination = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(destForm.arrivalDate) || !isDateInPlan(destForm.departureDate)) {
      notifyErr('Datumi destinacije moraju biti unutar perioda putovanja!'); return;
    }
    if (destForm.departureDate && destForm.arrivalDate && destForm.departureDate < destForm.arrivalDate) {
      notifyErr('Datum odlaska ne može biti prije datuma dolaska!'); return;
    }
    setApiLoading(true);
    try {
      await updateDestination(editTarget.id, { ...destForm, travelPlanId: parseInt(id) });
      setModal(null);
      showToast('Destinacija uspješno ažurirana!');
    } catch { notifyErr('Greška pri ažuriranju destinacije.'); }
    finally { setApiLoading(false); }
  };

  const handleEditActivity = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(actForm.date)) {
      notifyErr('Datum aktivnosti mora biti unutar perioda putovanja!'); return;
    }
    setApiLoading(true);
    try {
      await updateActivity(editTarget.id, {
        ...actForm,
        travelPlanId:  parseInt(id),
        estimatedCost: parseFloat(actForm.estimatedCost) || 0,
      });
      setModal(null);
      showToast('Aktivnost uspješno ažurirana!');
    } catch { notifyErr('Greška pri ažuriranju aktivnosti.'); }
    finally { setApiLoading(false); }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    if (expForm.date && !isDateInPlan(expForm.date)) {
      notifyErr('Datum troška mora biti unutar perioda putovanja!'); return;
    }
    setApiLoading(true);
    try {
      await updateExpense(
        editTarget.id,
        { ...expForm, travelPlanId: parseInt(id), amount: parseFloat(expForm.amount) },
        parseInt(id),
        plan.budget,
      );
      setModal(null);
      showToast('Trošak uspješno ažuriran!');
    } catch { notifyErr('Greška pri ažuriranju troška.'); }
    finally { setApiLoading(false); }
  };

  const handleAddCheck = async (e) => {
    e.preventDefault();
    if (!checkInput.trim()) return;
    try {
      await addChecklistItem({ name: checkInput, travelPlanId: parseInt(id) });
      setCheckInput('');
      showToast('Stavka dodana na listu!');
    } catch { notifyErr('Greška pri dodavanju stavke.'); }
  };

  const handleShare = async (type) => {
    try {
      const r = await sharingService.createShareToken({
        travelPlanId: parseInt(id),
        accessType:   type,
        expiryDays:   7,
      });
      setShareToken(r);
      showToast('Share link uspješno kreiran!');
    } catch { showToast('Greška pri kreiranju linka.', 'error'); }
  };

  const handleCopy = () => {
    if (!shareToken) return;
    navigator.clipboard.writeText(shareToken.shareUrl);
    setCopied(true);
    showToast('Link kopiran u clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render guards ──
  if (loading && !plan) return <LoadingSpinner />;
  if (!plan) return (
    <div className="page-container text-center py-16 text-slate-500">
      Plan nije pronađen.
    </div>
  );

  const completedItems = checklist.filter(c => c.isCompleted).length;
  const budgetPct      = budgetSummary
    ? Math.min((budgetSummary.totalExpenses / budgetSummary.plannedBudget) * 100, 100)
    : 0;
  const byDate = activities.reduce((acc, a) => {
    const key = formatDate(a.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  // ── Shared form parts ──
  const destFormFields = (
    <>
      <div className="alert-info text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Datumi moraju biti unutar perioda putovanja: {formatDateRange(plan.startDate, plan.endDate)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Naziv *</label>
          <input className="input" value={destForm.name} onChange={e => setDestForm({ ...destForm, name: e.target.value })} placeholder="npr. Pariz" required />
        </div>
        <div>
          <label className="label">Lokacija *</label>
          <input className="input" value={destForm.location} onChange={e => setDestForm({ ...destForm, location: e.target.value })} placeholder="npr. Francuska" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Datum dolaska *</label>
          <input type="date" className="input" value={destForm.arrivalDate} min={planStart} max={planEnd}
            onChange={e => setDestForm({ ...destForm, arrivalDate: e.target.value })} required />
        </div>
        <div>
          <label className="label">Datum odlaska *</label>
          <input type="date" className="input" value={destForm.departureDate}
            min={destForm.arrivalDate || planStart} max={planEnd}
            onChange={e => setDestForm({ ...destForm, departureDate: e.target.value })} required />
        </div>
      </div>
      <div>
        <label className="label">Opis / napomene</label>
        <input className="input" value={destForm.description} onChange={e => setDestForm({ ...destForm, description: e.target.value })} placeholder="Kratki opis..." />
      </div>
    </>
  );

  const actFormFields = (
    <>
      <div className="alert-info text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Datum mora biti unutar perioda putovanja: {formatDateRange(plan.startDate, plan.endDate)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Naziv *</label>
          <input className="input" value={actForm.name} onChange={e => setActForm({ ...actForm, name: e.target.value })} placeholder="npr. Eiffelov toranj" required />
        </div>
        <div>
          <label className="label">Lokacija</label>
          <input className="input" value={actForm.location} onChange={e => setActForm({ ...actForm, location: e.target.value })} placeholder="npr. Pariz" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Datum *</label>
          <input type="date" className="input" value={actForm.date} min={planStart} max={planEnd}
            onChange={e => setActForm({ ...actForm, date: e.target.value })} required />
        </div>
        <div>
          <label className="label">Vrijeme</label>
          <input type="time" className="input" value={actForm.time} onChange={e => setActForm({ ...actForm, time: e.target.value })} />
        </div>
        <div>
          <label className="label">Trošak (€)</label>
          <input type="number" min="0" step="0.01" className="input" value={actForm.estimatedCost}
            onChange={e => setActForm({ ...actForm, estimatedCost: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="select" value={actForm.status} onChange={e => setActForm({ ...actForm, status: e.target.value })}>
            {ACTIVITY_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Opis</label>
          <input className="input" value={actForm.description} onChange={e => setActForm({ ...actForm, description: e.target.value })} placeholder="Kratki opis..." />
        </div>
      </div>
    </>
  );

  const expFormFields = (
    <>
      <div className="alert-info text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Datum troška mora biti unutar perioda putovanja: {formatDateRange(plan.startDate, plan.endDate)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Naziv *</label>
          <input className="input" value={expForm.name} onChange={e => setExpForm({ ...expForm, name: e.target.value })} placeholder="npr. Avionska karta" required />
        </div>
        <div>
          <label className="label">Kategorija</label>
          <select className="select" value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>
            {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Iznos (€) *</label>
          <input type="number" min="0.01" step="0.01" className="input" value={expForm.amount}
            onChange={e => setExpForm({ ...expForm, amount: e.target.value })} required />
        </div>
        <div>
          <label className="label">Datum</label>
          <input type="date" className="input" value={expForm.date} min={planStart} max={planEnd}
            onChange={e => setExpForm({ ...expForm, date: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Opis</label>
        <input className="input" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} placeholder="Kratki opis..." />
      </div>
    </>
  );

  return (
    <div className="page-container">

      {/* ── ConfirmModal za brisanje (zamjena za window.confirm) ── */}
      {confirmModal && (
        <ConfirmModal
          title="Potvrdi brisanje"
          message={`Obrisati "${confirmModal.name}"? Ova akcija se ne može poništiti.`}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {/* ══ ADD MODALI ══ */}
      {modal === 'dest' && (
        <Modal title="Nova destinacija" onClose={() => setModal(null)}>
          <form onSubmit={handleAddDestination} className="space-y-4">
            {destFormFields}
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Sačuvaj destinaciju')}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'act' && (
        <Modal title="Nova aktivnost" onClose={() => setModal(null)}>
          <form onSubmit={handleAddActivity} className="space-y-4">
            {actFormFields}
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Sačuvaj aktivnost')}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'exp' && (
        <Modal title="Novi trošak" onClose={() => setModal(null)}>
          <form onSubmit={handleAddExpense} className="space-y-4">
            {expFormFields}
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Sačuvaj trošak')}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ EDIT MODALI ══ */}
      {modal === 'editDest' && (
        <Modal title="Uredi destinaciju" onClose={() => setModal(null)}>
          <form onSubmit={handleEditDestination} className="space-y-4">
            {destFormFields}
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Ažuriraj destinaciju')}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'editAct' && (
        <Modal title="Uredi aktivnost" onClose={() => setModal(null)}>
          <form onSubmit={handleEditActivity} className="space-y-4">
            {actFormFields}
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Ažuriraj aktivnost')}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'editExp' && (
        <Modal title="Uredi trošak" onClose={() => setModal(null)}>
          <form onSubmit={handleEditExpense} className="space-y-4">
            {expFormFields}
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Odustani</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Ažuriraj trošak')}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-sm mb-2 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Moja putovanja
          </Link>
          <h1 className="text-slate-900">{plan.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />{formatDateRange(plan.startDate, plan.endDate)}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Wallet className="w-3.5 h-3.5" />{plan.budget?.toLocaleString()} €
            </span>
          </div>
        </div>
        <Link to={`/edit-plan/${id}`} className="btn-outline self-start">
          <Pencil className="w-4 h-4" />Uredi plan
        </Link>
      </div>

      {localErr && !modal && (
        <div className="alert-error mb-4"><AlertCircle className="w-4 h-4 shrink-0" />{localErr}</div>
      )}
      {ctxErr && (
        <div className="alert-error mb-4"><AlertCircle className="w-4 h-4 shrink-0" />{ctxErr}</div>
      )}

      {/* ── TABS ── */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={activeTab === t.id ? 'tab-active' : 'tab-inactive'}>
            <t.icon className="w-4 h-4" /><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="section-title mb-4"><BarChart3 className="w-4 h-4 text-sky-500" />Osnovni podaci</h3>
            {plan.description && <p className="text-slate-600 text-sm leading-relaxed mb-3">{plan.description}</p>}
            {plan.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm flex gap-2">
                <span className="shrink-0">📝</span>{plan.notes}
              </div>
            )}
            {!plan.description && !plan.notes && (
              <p className="text-slate-400 text-sm italic">Nema dodatnih informacija.</p>
            )}
          </div>

          {budgetSummary && (
            <div className="card">
              <h3 className="section-title mb-4"><Wallet className="w-4 h-4 text-emerald-500" />Finansije</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Potrošeno</span>
                  <span className="font-bold">{budgetSummary.totalExpenses} €</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${budgetPct > 90 ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Preostalo</span>
                  <span className={`font-bold text-xl ${budgetSummary.remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {budgetSummary.remainingBudget} €
                  </span>
                </div>
                <div className="divider" />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Planirani budžet</span><span>{budgetSummary.plannedBudget} €</span>
                </div>
              </div>
            </div>
          )}

          <div className="card md:col-span-2">
            <h3 className="section-title mb-4">📊 Pregled putovanja</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: MapPin,      label: 'Destinacije', value: destinations.length,                       bg: 'bg-sky-50',     ic: 'text-sky-500'     },
                { icon: Activity,    label: 'Aktivnosti',  value: activities.length,                         bg: 'bg-blue-50',    ic: 'text-primary-500' },
                { icon: Wallet,      label: 'Troškovi',    value: expenses.length,                           bg: 'bg-emerald-50', ic: 'text-emerald-600' },
                { icon: CheckSquare, label: 'Checklist',   value: `${completedItems}/${checklist.length}`,   bg: 'bg-violet-50',  ic: 'text-violet-500'  },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                    <s.icon className={`w-5 h-5 ${s.ic}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ DESTINATIONS ══ */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title"><MapPin className="w-5 h-5 text-sky-500" />Destinacije ({destinations.length})</h2>
            <button onClick={() => openModal('dest')} className="btn-sky"><Plus className="w-4 h-4" />Dodaj</button>
          </div>

          {destinations.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <MapPin className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-400 font-medium text-sm">Nema destinacija. Dodajte prvu destinaciju klikom na dugme gore.</p>
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
                    <button onClick={() => openEditModal('editDest', d)}
                      className="btn-icon bg-slate-50 hover:bg-sky-50 hover:text-sky-600 border border-slate-200">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(() => removeDestination(d.id), d.name, 'Destinacija uspješno obrisana.')}
                      className="btn-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <Calendar className="w-3 h-3" />{formatDateRange(d.arrivalDate, d.departureDate)}
                </div>
                {d.description && (
                  <div className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-xl p-2.5">{d.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ ACTIVITIES ══ */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="section-title"><Activity className="w-5 h-5 text-primary-500" />Aktivnosti ({activities.length})</h2>
            <div className="flex gap-2">
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {[['list', List, 'Lista'], ['calendar', Calendar, 'Kalendar']].map(([v, I, l]) => (
                  <button key={v} onClick={() => setActView(v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${actView === v ? 'bg-white shadow-card text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                    <I className="w-3.5 h-3.5" />{l}
                  </button>
                ))}
              </div>
              <button onClick={() => openModal('act')} className="btn-sky"><Plus className="w-4 h-4" />Dodaj</button>
            </div>
          </div>

          {actView === 'calendar' && (
            <CalendarView activities={activities} startDate={plan.startDate} endDate={plan.endDate} />
          )}

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
                          <button onClick={() => openEditModal('editAct', a)}
                            className="btn-icon bg-slate-50 hover:bg-sky-50 hover:text-sky-600 border border-slate-200">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(() => removeActivity(a.id), a.name, 'Aktivnost uspješno obrisana.')}
                            className="btn-danger"
                          >
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
      )}

      {/* ══ EXPENSES ══ */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title"><Wallet className="w-5 h-5 text-emerald-500" />Troškovi ({expenses.length})</h2>
            <button onClick={() => openModal('exp')} className="btn-sky"><Plus className="w-4 h-4" />Dodaj</button>
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
                  <button onClick={() => openEditModal('editExp', exp)}
                    className="btn-icon bg-slate-50 hover:bg-sky-50 hover:text-sky-600 border border-slate-200">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(() => removeExpense(exp.id, parseInt(id), plan.budget), exp.name, 'Trošak uspješno obrisan.')}
                    className="btn-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ CHECKLIST ══ */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <h2 className="section-title"><CheckSquare className="w-5 h-5 text-violet-500" />Packing lista</h2>

          {checklist.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Napredak</span>
                <span className="text-sm font-bold text-slate-800">{completedItems} / {checklist.length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${checklist.length ? (completedItems / checklist.length) * 100 : 0}%` }}
                />
              </div>
              {completedItems === checklist.length && checklist.length > 0 && (
                <div className="alert-success mt-3 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />Sve je spakováno! Sretan put! 🎉
                </div>
              )}
            </div>
          )}

          <div className="card">
            <form onSubmit={handleAddCheck} className="flex gap-3">
              <input
                className="input flex-1"
                value={checkInput}
                onChange={e => setCheckInput(e.target.value)}
                placeholder="Dodajte stavku (Pasoš, Punjač, Osiguranje...)"
              />
              <button type="submit" className="btn-sky shrink-0"><Plus className="w-4 h-4" />Dodaj</button>
            </form>
          </div>

          {/* Brzi prijedlozi */}
          <div className="flex flex-wrap gap-2">
            {['Pasoš', 'Karta', 'Hotel', 'Osiguranje', 'Punjač', 'Adapter', 'Lijekovi', 'Gotovina', 'Sunčane naočale'].map(s => (
              <button key={s} onClick={() => setCheckInput(s)}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-full transition-colors font-medium">
                + {s}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {checklist.length === 0 && (
              <div className="card">
                <div className="empty-state py-8">
                  <CheckSquare className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-400 text-sm">Lista je prazna. Koristite brze prijedloge iznad ili upišite stavku.</p>
                </div>
              </div>
            )}
            {/* Prikazujemo prvo nezavršene, pa završene */}
            {[false, true].map(done =>
              checklist.filter(c => c.isCompleted === done).map(item => (
                <div
                  key={item.id}
                  className={`card-sm flex items-center justify-between gap-4 transition-all ${item.isCompleted ? 'opacity-60' : ''}`}
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                    />
                    <span className={`text-slate-800 text-sm font-medium ${item.isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {item.name}
                    </span>
                    {item.isCompleted && (
                      <span className="text-xs text-emerald-500 font-semibold">✓ Spakováno</span>
                    )}
                  </label>
                  <button
                    onClick={() => handleDeleteClick(() => removeChecklistItem(item.id), item.name, 'Stavka uspješno obrisana.')}
                    className="text-slate-300 hover:text-rose-400 transition-colors w-6 h-6 flex items-center justify-center text-xl font-light"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══ SHARING ══ */}
      {activeTab === 'sharing' && (
        <div className="space-y-5">
          <h2 className="section-title"><Share2 className="w-5 h-5 text-primary-500" />Dijeljenje plana</h2>

          <div className="card">
            <p className="text-sm text-slate-500 mb-5">
              Generirajte link i QR kod za dijeljenje plana sa prijateljima i porodicom. Link ističe za 7 dana.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'VIEW', icon: Eye,    label: 'VIEW pristup', desc: 'Samo pregled',
                  hB: 'hover:border-sky-400', hBg: 'hover:bg-sky-50',
                  iB: 'bg-sky-50 group-hover:bg-sky-100', iC: 'text-sky-500', tC: 'text-sky-700' },
                { type: 'EDIT', icon: Pencil, label: 'EDIT pristup', desc: 'Pregled i uređivanje',
                  hB: 'hover:border-emerald-400', hBg: 'hover:bg-emerald-50',
                  iB: 'bg-emerald-50 group-hover:bg-emerald-100', iC: 'text-emerald-600', tC: 'text-emerald-700' },
              ].map(b => (
                <button key={b.type} onClick={() => handleShare(b.type)}
                  className={`group flex flex-col items-center gap-3 p-5 border-2 border-slate-200 rounded-2xl transition-all ${b.hB} ${b.hBg}`}>
                  <div className={`w-14 h-14 ${b.iB} rounded-2xl flex items-center justify-center transition-colors`}>
                    <b.icon className={`w-7 h-7 ${b.iC}`} />
                  </div>
                  <div className="text-center">
                    <div className={`font-bold ${b.tC}`}>{b.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{b.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {shareToken && (
            <div className="card space-y-5">
              <div className="flex items-center gap-3">
                <span className={`badge ${shareToken.accessType === 'EDIT' ? 'badge-success' : 'badge-sky'}`}>
                  {shareToken.accessType === 'EDIT' ? '✏️ EDIT' : '👁️ VIEW'}
                </span>
                <span className="text-sm text-slate-400">Ističe {formatDateLong(shareToken.expiresAt)}</span>
              </div>

              <div>
                <label className="label">Share link</label>
                <div className="flex gap-2">
                  <input className="input flex-1 text-sm font-mono bg-slate-50" value={shareToken.shareUrl} readOnly />
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
                  >
                    <Copy className="w-4 h-4" />{copied ? 'Kopirano!' : 'Kopiraj'}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                  <QrCode className="w-4 h-4 text-sky-500" />QR kod za dijeljenje
                </div>
                <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-card">
                  <img
                    src={sharingService.getQrCodeUrl(shareToken.token)}
                    alt="QR kod za dijeljenje plana"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3">Skenirajte telefonom za brzi pristup planu</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelPlanDetailPage;
