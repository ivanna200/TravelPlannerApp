import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';
import destinationService from '../services/destinationService';
import activityService from '../services/activityService';
import expenseService from '../services/expenseService';
import checklistService from '../services/checklistService';
import sharingService from '../services/sharingService';
import { ACTIVITY_STATUSES } from '../models/Activity';
import { EXPENSE_CATEGORIES } from '../models/Expense';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { id: 'overview', label: '📊 Pregled' },
  { id: 'destinations', label: '🗺️ Destinacije' },
  { id: 'activities', label: '📋 Aktivnosti' },
  { id: 'expenses', label: '💰 Troškovi' },
  { id: 'checklist', label: '✅ Checklist' },
  { id: 'sharing', label: '🔗 Dijeljenje' },
];

const TravelPlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [shareToken, setShareToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [destForm, setDestForm] = useState({ name: '', location: '', arrivalDate: '', departureDate: '', description: '' });
  const [actForm, setActForm] = useState({ name: '', date: '', time: '', location: '', description: '', estimatedCost: 0, status: 'Planirano' });
  const [expForm, setExpForm] = useState({ name: '', category: 'Prevoz', amount: 0, date: '', description: '' });
  const [checkForm, setCheckForm] = useState('');

  useEffect(() => { loadAll(); }, [id]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const loadAll = async () => {
    try {
      const [planData, destData, actData, expData, checkData] = await Promise.all([
        travelPlanService.getPlan(id),
        destinationService.getPlanDestinations(id),
        activityService.getPlanActivities(id),
        expenseService.getPlanExpenses(id),
        checklistService.getPlanItems(id),
      ]);
      setPlan(planData);
      setDestinations(destData);
      setActivities(actData);
      setExpenses(expData);
      setChecklist(checkData);
      const summary = await expenseService.getBudgetSummary(id, planData.budget);
      setBudgetSummary(summary);
    } catch { setError('Greška pri učitavanju podataka.'); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('bs-BA', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const handleAddDestination = async (e) => {
    e.preventDefault();
    try {
      const dest = await destinationService.createDestination({ ...destForm, travelPlanId: parseInt(id) });
      setDestinations([...destinations, dest]);
      setDestForm({ name: '', location: '', arrivalDate: '', departureDate: '', description: '' });
      showSuccess('Destinacija dodana!');
    } catch { setError('Greška pri dodavanju destinacije.'); }
  };

  const handleDeleteDestination = async (destId) => {
    if (!window.confirm('Obrisati destinaciju?')) return;
    await destinationService.deleteDestination(destId);
    setDestinations(destinations.filter((d) => d.id !== destId));
    showSuccess('Destinacija obrisana.');
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const act = await activityService.createActivity({ ...actForm, travelPlanId: parseInt(id), estimatedCost: parseFloat(actForm.estimatedCost) });
      setActivities([...activities, act]);
      setActForm({ name: '', date: '', time: '', location: '', description: '', estimatedCost: 0, status: 'Planirano' });
      showSuccess('Aktivnost dodana!');
    } catch { setError('Greška pri dodavanju aktivnosti.'); }
  };

  const handleDeleteActivity = async (actId) => {
    if (!window.confirm('Obrisati aktivnost?')) return;
    await activityService.deleteActivity(actId);
    setActivities(activities.filter((a) => a.id !== actId));
    showSuccess('Aktivnost obrisana.');
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const exp = await expenseService.createExpense({ ...expForm, travelPlanId: parseInt(id), amount: parseFloat(expForm.amount) });
      setExpenses([...expenses, exp]);
      const summary = await expenseService.getBudgetSummary(id, plan.budget);
      setBudgetSummary(summary);
      setExpForm({ name: '', category: 'Prevoz', amount: 0, date: '', description: '' });
      showSuccess('Trošak dodan!');
    } catch { setError('Greška pri dodavanju troška.'); }
  };

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm('Obrisati trošak?')) return;
    await expenseService.deleteExpense(expId);
    setExpenses(expenses.filter((e) => e.id !== expId));
    const summary = await expenseService.getBudgetSummary(id, plan.budget);
    setBudgetSummary(summary);
    showSuccess('Trošak obrisan.');
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!checkForm.trim()) return;
    try {
      const item = await checklistService.createItem({ name: checkForm, travelPlanId: parseInt(id) });
      setChecklist([...checklist, item]);
      setCheckForm('');
    } catch { setError('Greška pri dodavanju stavke.'); }
  };

  const handleToggleItem = async (itemId) => {
    const updated = await checklistService.toggleItem(itemId);
    setChecklist(checklist.map((c) => (c.id === itemId ? updated : c)));
  };

  const handleDeleteChecklistItem = async (itemId) => {
    await checklistService.deleteItem(itemId);
    setChecklist(checklist.filter((c) => c.id !== itemId));
  };

  const handleShare = async (accessType) => {
    try {
      const result = await sharingService.createShareToken({ travelPlanId: parseInt(id), accessType, expiryDays: 7 });
      setShareToken(result);
      showSuccess('Share link kreiran!');
    } catch { setError('Greška pri kreiranju linka.'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!plan) return <div className="text-center py-16 text-slate-500">Plan nije pronađen.</div>;

  const completedItems = checklist.filter((c) => c.isCompleted).length;
  const budgetPercent = budgetSummary ? Math.min((budgetSummary.totalExpenses / budgetSummary.plannedBudget) * 100, 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Moja putovanja</Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">{plan.name}</h1>
          <p className="text-slate-500 text-sm mt-1">📅 {formatDate(plan.startDate)} — {formatDate(plan.endDate)} · 💰 {plan.budget?.toLocaleString()} €</p>
        </div>
        <Link to={`/edit-plan/${id}`} className="btn-warning self-start flex items-center gap-2">✏️ Uredi</Link>
      </div>

      {error && <div className="error-box mb-4">{error}</div>}
      {success && <div className="success-box mb-4">{success}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">ℹ️ Osnovni podaci</h3>
            <div className="space-y-3 text-sm">
              {plan.description && <div><span className="text-slate-500">Opis:</span> <span className="text-slate-700">{plan.description}</span></div>}
              {plan.notes && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">📝 {plan.notes}</div>}
            </div>
          </div>

          {budgetSummary && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4">💰 Budžet</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Potrošeno</span>
                  <span className="font-medium">{budgetSummary.totalExpenses} €</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all ${budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${budgetPercent}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Preostalo</span>
                  <span className={`font-semibold ${budgetSummary.remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {budgetSummary.remainingBudget} €
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Planirani budžet</span>
                  <span className="font-medium">{budgetSummary.plannedBudget} €</span>
                </div>
              </div>
            </div>
          )}

          <div className="card md:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-4">📊 Statistike</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '🗺️', label: 'Destinacije', value: destinations.length },
                { icon: '📋', label: 'Aktivnosti', value: activities.length },
                { icon: '💸', label: 'Troškovi', value: expenses.length },
                { icon: '✅', label: 'Checklist', value: `${completedItems}/${checklist.length}` },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DESTINATIONS */}
      {activeTab === 'destinations' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">+ Dodaj destinaciju</h3>
            <form onSubmit={handleAddDestination} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Naziv *</label><input className="input-field" value={destForm.name} onChange={(e) => setDestForm({ ...destForm, name: e.target.value })} placeholder="npr. Pariz" required /></div>
                <div><label className="label">Lokacija *</label><input className="input-field" value={destForm.location} onChange={(e) => setDestForm({ ...destForm, location: e.target.value })} placeholder="npr. Francuska" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Datum dolaska *</label><input type="date" className="input-field" value={destForm.arrivalDate} onChange={(e) => setDestForm({ ...destForm, arrivalDate: e.target.value })} required /></div>
                <div><label className="label">Datum odlaska *</label><input type="date" className="input-field" value={destForm.departureDate} onChange={(e) => setDestForm({ ...destForm, departureDate: e.target.value })} required /></div>
              </div>
              <div><label className="label">Opis</label><input className="input-field" value={destForm.description} onChange={(e) => setDestForm({ ...destForm, description: e.target.value })} placeholder="Kratki opis..." /></div>
              <button type="submit" className="btn-primary">+ Dodaj destinaciju</button>
            </form>
          </div>
          <div className="space-y-3">
            {destinations.length === 0 && <div className="card text-center text-slate-500 py-8">Nema destinacija. Dodajte prvu destinaciju iznad.</div>}
            {destinations.map((d) => (
              <div key={d.id} className="card flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <div className="font-semibold text-slate-800">{d.name}</div>
                    <div className="text-sm text-slate-500">{d.location}</div>
                    <div className="text-sm text-slate-500">{formatDate(d.arrivalDate)} — {formatDate(d.departureDate)}</div>
                    {d.description && <div className="text-sm text-slate-600 mt-1">{d.description}</div>}
                  </div>
                </div>
                <button onClick={() => handleDeleteDestination(d.id)} className="btn-danger text-sm px-3 py-1.5 shrink-0">🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">+ Dodaj aktivnost</h3>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Naziv *</label><input className="input-field" value={actForm.name} onChange={(e) => setActForm({ ...actForm, name: e.target.value })} placeholder="npr. Eiffelov toranj" required /></div>
                <div><label className="label">Lokacija</label><input className="input-field" value={actForm.location} onChange={(e) => setActForm({ ...actForm, location: e.target.value })} placeholder="npr. Pariz" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="label">Datum *</label><input type="date" className="input-field" value={actForm.date} onChange={(e) => setActForm({ ...actForm, date: e.target.value })} required /></div>
                <div><label className="label">Vrijeme</label><input type="time" className="input-field" value={actForm.time} onChange={(e) => setActForm({ ...actForm, time: e.target.value })} /></div>
                <div><label className="label">Trošak (€)</label><input type="number" min="0" className="input-field" value={actForm.estimatedCost} onChange={(e) => setActForm({ ...actForm, estimatedCost: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={actForm.status} onChange={(e) => setActForm({ ...actForm, status: e.target.value })}>
                    {ACTIVITY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="label">Opis</label><input className="input-field" value={actForm.description} onChange={(e) => setActForm({ ...actForm, description: e.target.value })} placeholder="Kratki opis..." /></div>
              </div>
              <button type="submit" className="btn-primary">+ Dodaj aktivnost</button>
            </form>
          </div>
          <div className="space-y-3">
            {activities.length === 0 && <div className="card text-center text-slate-500 py-8">Nema aktivnosti. Dodajte prvu aktivnost iznad.</div>}
            {activities.map((a) => (
              <div key={a.id} className="card flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{a.name}</span>
                      <span className={`badge text-xs ${a.status === 'Završeno' ? 'bg-emerald-100 text-emerald-700' : a.status === 'Otkazano' ? 'bg-red-100 text-red-700' : a.status === 'Rezervisano' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{a.status}</span>
                    </div>
                    <div className="text-sm text-slate-500">{a.location} · {formatDate(a.date)} u {a.time}</div>
                    {a.estimatedCost > 0 && <div className="text-sm text-emerald-600">💰 {a.estimatedCost} €</div>}
                    {a.description && <div className="text-sm text-slate-600">{a.description}</div>}
                  </div>
                </div>
                <button onClick={() => handleDeleteActivity(a.id)} className="btn-danger text-sm px-3 py-1.5 shrink-0">🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {budgetSummary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center"><div className="text-2xl font-bold text-slate-800">{budgetSummary.plannedBudget} €</div><div className="text-xs text-slate-500 mt-1">Planirani budžet</div></div>
              <div className="card text-center"><div className="text-2xl font-bold text-red-500">{budgetSummary.totalExpenses} €</div><div className="text-xs text-slate-500 mt-1">Ukupno potrošeno</div></div>
              <div className="card text-center"><div className={`text-2xl font-bold ${budgetSummary.remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{budgetSummary.remainingBudget} €</div><div className="text-xs text-slate-500 mt-1">Preostalo</div></div>
            </div>
          )}
          {budgetSummary?.byCategory?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3">Po kategorijama</h3>
              <div className="space-y-2">
                {budgetSummary.byCategory.map((c) => (
                  <div key={c.category} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">{c.category}</span>
                    <span className="font-medium text-slate-800">{c.total} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">+ Dodaj trošak</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Naziv *</label><input className="input-field" value={expForm.name} onChange={(e) => setExpForm({ ...expForm, name: e.target.value })} placeholder="npr. Avionska karta" required /></div>
                <div>
                  <label className="label">Kategorija</label>
                  <select className="input-field" value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                    {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Iznos (€) *</label><input type="number" min="0" className="input-field" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} required /></div>
                <div><label className="label">Datum *</label><input type="date" className="input-field" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} required /></div>
              </div>
              <div><label className="label">Opis</label><input className="input-field" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} placeholder="Kratki opis..." /></div>
              <button type="submit" className="btn-primary">+ Dodaj trošak</button>
            </form>
          </div>
          <div className="space-y-3">
            {expenses.length === 0 && <div className="card text-center text-slate-500 py-8">Nema troškova. Dodajte prvi trošak iznad.</div>}
            {expenses.map((e) => (
              <div key={e.id} className="card flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl">💸</span>
                  <div>
                    <div className="font-semibold text-slate-800">{e.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge bg-slate-100 text-slate-600 text-xs">{e.category}</span>
                      <span className="text-sm text-slate-500">{formatDate(e.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{e.amount} €</span>
                  <button onClick={() => handleDeleteExpense(e.id)} className="btn-danger text-sm px-3 py-1.5">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {checklist.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Napredak</span>
                <span className="text-sm text-slate-500">{completedItems}/{checklist.length}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0}%` }} />
              </div>
            </div>
          )}
          <div className="card">
            <form onSubmit={handleAddChecklistItem} className="flex gap-3">
              <input className="input-field flex-1" value={checkForm} onChange={(e) => setCheckForm(e.target.value)} placeholder="npr. Pasoš, Karta, Putno osiguranje..." required />
              <button type="submit" className="btn-primary shrink-0">+ Dodaj</button>
            </form>
          </div>
          <div className="space-y-2">
            {checklist.length === 0 && <div className="card text-center text-slate-500 py-8">Dodajte stavke na listu.</div>}
            {checklist.map((item) => (
              <div key={item.id} className={`card flex items-center justify-between gap-4 transition-opacity ${item.isCompleted ? 'opacity-60' : ''}`}>
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input type="checkbox" checked={item.isCompleted} onChange={() => handleToggleItem(item.id)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer" />
                  <span className={`text-slate-800 ${item.isCompleted ? 'line-through text-slate-400' : ''}`}>{item.name}</span>
                </label>
                <button onClick={() => handleDeleteChecklistItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors text-lg">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHARING */}
      {activeTab === 'sharing' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-2">🔗 Podijelite plan putovanja</h3>
            <p className="text-sm text-slate-500 mb-6">Generirajte link i QR kod za dijeljenje vašeg plana.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleShare('VIEW')} className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                <span className="text-3xl">👁️</span>
                <span className="font-medium text-blue-700">VIEW pristup</span>
                <span className="text-xs text-slate-500 text-center">Samo pregled plana</span>
              </button>
              <button onClick={() => handleShare('EDIT')} className="flex flex-col items-center gap-2 p-4 border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors">
                <span className="text-3xl">✏️</span>
                <span className="font-medium text-emerald-700">EDIT pristup</span>
                <span className="text-xs text-slate-500 text-center">Pregled i uređivanje</span>
              </button>
            </div>
          </div>

          {shareToken && (
            <div className="card">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${shareToken.accessType === 'EDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {shareToken.accessType === 'EDIT' ? '✏️ EDIT' : '👁️ VIEW'} · Ističe {formatDate(shareToken.expiresAt)}
              </div>

              <div className="flex gap-2 mb-6">
                <input className="input-field flex-1 text-sm" value={shareToken.shareUrl} readOnly />
                <button onClick={() => { navigator.clipboard.writeText(shareToken.shareUrl); showSuccess('Link kopiran!'); }} className="btn-secondary shrink-0">📋 Kopiraj</button>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 mb-3">QR kod za dijeljenje</p>
                <img src={sharingService.getQrCodeUrl(shareToken.token)} alt="QR kod" className="mx-auto rounded-xl border border-slate-200 w-48 h-48" />
                <p className="text-xs text-slate-500 mt-2">Skenirajte za brzi pristup planu</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelPlanDetailPage;