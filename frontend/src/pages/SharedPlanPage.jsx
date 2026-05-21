import { useState, useEffect }  from 'react';
import { useParams, Link }       from 'react-router-dom';
import sharingService            from '../services/sharingService';
import sharedPlanService from '../services/sharedPlanService';
import LoadingSpinner            from '../components/LoadingSpinner';
import Modal                     from '../components/Modal';
import ConfirmModal              from '../components/ConfirmModal';
import { useToast }              from '../hooks/useToast';
import { formatDate, formatDateRange } from '../utils/formatDate';
import { ACTIVITY_STATUSES }     from '../models/Activity';
import {
  Eye, Pencil, MapPin, Calendar, Wallet, Activity,
  Clock, XCircle, Plus, Trash2, AlertCircle, CheckSquare,
} from 'lucide-react';

const STATUS_BADGE = {
  'Planned':   'badge-sky',
  'Reserved':  'badge-violet',
  'Completed': 'badge-success',
  'Cancelled': 'badge-danger',
};

const SharedPlanPage = () => {
  const { token }     = useParams();
  const { showToast } = useToast();

  const [data,         setData]         = useState(null);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [apiLoading,   setApiLoading]   = useState(false);
  const [localErr,     setLocalErr]     = useState('');

  const emptyDest = { name: '', location: '', arrivalDate: '', departureDate: '', description: '' };
  const emptyAct  = { name: '', date: '', time: '', location: '', description: '', estimatedCost: 0, status: 'Planned' };
  const [destForm, setDestForm] = useState(emptyDest);
  const [actForm,  setActForm]  = useState(emptyAct);

  useEffect(() => {
    sharingService.getSharedPlan(token)
      .then(setData)
      .catch(() => setError('Plan not found or the link has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const planStart = data?.plan?.startDate?.split('T')[0];
  const planEnd   = data?.plan?.endDate?.split('T')[0];

  const isDateInPlan = (d) => {
    if (!d || !planStart || !planEnd) return true;
    return d >= planStart && d <= planEnd;
  };

  const openModal = (type) => {
    setDestForm(emptyDest);
    setActForm(emptyAct);
    setLocalErr('');
    setModal(type);
  };

  const spinBtn = (label) => apiLoading
    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
    : label;

  const handleAddDestination = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(destForm.arrivalDate) || !isDateInPlan(destForm.departureDate)) {
      setLocalErr('Dates must be within the travel period!'); return;
    }
    if (destForm.departureDate < destForm.arrivalDate) {
      setLocalErr('Departure date cannot be before arrival date!'); return;
    }
    setApiLoading(true);
    try {
      const newDest = await sharedPlanService.addDestination(token, { ...destForm, travelPlanId: data.plan.id });
      setData(prev => ({ ...prev, plan: { ...prev.plan, destinations: [...(prev.plan.destinations || []), newDest] } }));
      setModal(null);
      showToast('Destination added successfully!');
    } catch { setLocalErr('Error adding destination.'); }
    finally { setApiLoading(false); }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(actForm.date)) {
      setLocalErr('Activity date must be within the travel period!'); return;
    }
    setApiLoading(true);
    try {
      const newAct = await sharedPlanService.addActivity(token, {
        ...actForm,
        travelPlanId:  data.plan.id,
        estimatedCost: parseFloat(actForm.estimatedCost) || 0,
      });
      setData(prev => ({ ...prev, plan: { ...prev.plan, activities: [...(prev.plan.activities || []), newAct] } }));
      setModal(null);
      showToast('Activity added successfully!');
    } catch { setLocalErr('Error adding activity.'); }
    finally { setApiLoading(false); }
  };

  const handleDeleteDestination = (dest) => {
    setConfirmModal({
      name: dest.name,
      onConfirm: async () => {
        await sharedPlanService.deleteDestination(token, dest.id);
        setData(prev => ({ ...prev, plan: { ...prev.plan, destinations: prev.plan.destinations.filter(d => d.id !== dest.id) } }));
        showToast('Destination deleted successfully.');
      },
    });
  };

  const handleDeleteActivity = (act) => {
    setConfirmModal({
      name: act.name,
      onConfirm: async () => {
        await sharedPlanService.deleteActivity(token, act.id);
        setData(prev => ({ ...prev, plan: { ...prev.plan, activities: prev.plan.activities.filter(a => a.id !== act.id) } }));
        showToast('Activity deleted successfully.');
      },
    });
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try { await confirmModal.onConfirm(); }
    catch { showToast('Error deleting.', 'error'); }
    finally { setConfirmModal(null); }
  };

  if (loading) return <LoadingSpinner text="Loading shared plan..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid link</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/login" className="btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  const { plan, checklist, accessType } = data;
  const isEdit = accessType === 'EDIT';

  const activitiesByDate = (plan.activities || [])
    .slice()
    .sort((a, b) => {
      const d = new Date(a.date) - new Date(b.date);
      return d !== 0 ? d : (a.time || '').localeCompare(b.time || '');
    })
    .reduce((acc, a) => {
      const key = formatDate(a.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});

  return (
    <div className="min-h-screen bg-slate-50">

      {confirmModal && (
        <ConfirmModal
          title="Confirm deletion"
          message={`Delete "${confirmModal.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {modal === 'dest' && (
        <Modal title="New destination" onClose={() => setModal(null)}>
          <form onSubmit={handleAddDestination} className="space-y-4">
            <div className="alert-info text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Dates must be within the travel period: {formatDateRange(plan.startDate, plan.endDate)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={destForm.name}
                  onChange={e => setDestForm({ ...destForm, name: e.target.value })}
                  placeholder="e.g. Paris" required />
              </div>
              <div>
                <label className="label">Location *</label>
                <input className="input" value={destForm.location}
                  onChange={e => setDestForm({ ...destForm, location: e.target.value })}
                  placeholder="e.g. France" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Arrival date *</label>
                <input type="date" className="input" value={destForm.arrivalDate}
                  min={planStart} max={planEnd}
                  onChange={e => setDestForm({ ...destForm, arrivalDate: e.target.value })} required />
              </div>
              <div>
                <label className="label">Departure date *</label>
                <input type="date" className="input" value={destForm.departureDate}
                  min={destForm.arrivalDate || planStart} max={planEnd}
                  onChange={e => setDestForm({ ...destForm, departureDate: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={destForm.description}
                onChange={e => setDestForm({ ...destForm, description: e.target.value })}
                placeholder="Short description..." />
            </div>
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Save')}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'act' && (
        <Modal title="New activity" onClose={() => setModal(null)}>
          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="alert-info text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Date must be within the travel period: {formatDateRange(plan.startDate, plan.endDate)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={actForm.name}
                  onChange={e => setActForm({ ...actForm, name: e.target.value })}
                  placeholder="e.g. Museum visit" required />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={actForm.location}
                  onChange={e => setActForm({ ...actForm, location: e.target.value })}
                  placeholder="e.g. Paris" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input" value={actForm.date}
                  min={planStart} max={planEnd}
                  onChange={e => setActForm({ ...actForm, date: e.target.value })} required />
              </div>
              <div>
                <label className="label">Time</label>
                <input type="time" className="input" value={actForm.time}
                  onChange={e => setActForm({ ...actForm, time: e.target.value })} />
              </div>
              <div>
                <label className="label">Cost (€)</label>
                <input type="number" min="0" step="0.01" className="input"
                  value={actForm.estimatedCost}
                  onChange={e => setActForm({ ...actForm, estimatedCost: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="select" value={actForm.status}
                  onChange={e => setActForm({ ...actForm, status: e.target.value })}>
                  {ACTIVITY_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" value={actForm.description}
                  onChange={e => setActForm({ ...actForm, description: e.target.value })}
                  placeholder="Short description..." />
              </div>
            </div>
            {localErr && <div className="alert-error text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{localErr}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={apiLoading}>{spinBtn('Save')}</button>
            </div>
          </form>
        </Modal>
      )}

      <div className={`py-3 px-4 text-center text-sm font-semibold ${isEdit ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'}`}>
        {isEdit
          ? <><Pencil className="inline w-4 h-4 mr-2" />Shared plan — Edit access</>
          : <><Eye className="inline w-4 h-4 mr-2" />Shared plan — View only</>}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h1>
          {plan.description && <p className="text-slate-500 mb-4 text-sm">{plan.description}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-sky-500 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Travel period</div>
                <div className="text-sm font-semibold text-slate-800">{formatDateRange(plan.startDate, plan.endDate)}</div>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Planned budget</div>
                <div className="text-sm font-bold text-emerald-700">{plan.budget?.toLocaleString()} €</div>
              </div>
            </div>
          </div>
          {plan.notes && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex gap-2">
              <span className="shrink-0">📝</span>{plan.notes}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <MapPin className="w-5 h-5 text-sky-500" />
              Destinations ({plan.destinations?.length || 0})
            </h2>
            {isEdit && (
              <button onClick={() => openModal('dest')} className="btn-sky">
                <Plus className="w-4 h-4" />Add
              </button>
            )}
          </div>
          {(!plan.destinations || plan.destinations.length === 0) ? (
            <div className="empty-state py-6">
              <MapPin className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">No destinations.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plan.destinations.map((d, i) => (
                <div key={d.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 text-sm">{d.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{d.location}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" />{formatDateRange(d.arrivalDate, d.departureDate)}</div>
                    {d.description && <div className="text-xs text-slate-500 mt-1 bg-white rounded-lg p-1.5">{d.description}</div>}
                  </div>
                  {isEdit && (
                    <button onClick={() => handleDeleteDestination(d)} className="btn-danger shrink-0 self-start">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <Activity className="w-5 h-5 text-primary-500" />
              Activities ({plan.activities?.length || 0})
            </h2>
            {isEdit && (
              <button onClick={() => openModal('act')} className="btn-sky">
                <Plus className="w-4 h-4" />Add
              </button>
            )}
          </div>
          {(!plan.activities || plan.activities.length === 0) ? (
            <div className="empty-state py-6">
              <Activity className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">No activities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(activitiesByDate).map(([dateKey, dayActs]) => (
                <div key={dateKey}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dateKey}</span>
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="badge-neutral text-xs">{dayActs.length}</span>
                  </div>
                  <div className="space-y-2">
                    {dayActs.map(a => (
                      <div key={a.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800 text-sm">{a.name}</span>
                            <span className={`badge text-xs ${STATUS_BADGE[a.status] || 'badge-primary'}`}>{a.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-slate-500">
                            {a.time     && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>}
                            {a.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</span>}
                            {a.estimatedCost > 0 && <span className="font-semibold text-emerald-600">💰 {a.estimatedCost} €</span>}
                          </div>
                        </div>
                        {isEdit && (
                          <button onClick={() => handleDeleteActivity(a)} className="btn-danger shrink-0 self-start">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {checklist && checklist.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">
              <CheckSquare className="w-5 h-5 text-violet-500" />
              Packing list ({checklist.filter(c => c.isCompleted).length}/{checklist.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {checklist.map(item => (
                <div key={item.id} className={`flex items-center gap-2 p-2 rounded-lg ${item.isCompleted ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${item.isCompleted ? 'bg-emerald-500' : 'border-2 border-slate-300'}`}>
                    {item.isCompleted && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-xs font-medium ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SharedPlanPage;
