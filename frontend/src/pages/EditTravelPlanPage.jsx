import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link }      from 'react-router-dom';
import { useTravelPlan } from '../hooks/useTravelPlan';
import { useToast }      from '../hooks/useToast';
import { ArrowLeft, Pencil, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const EditTravelPlanPage = () => {
  const { id }                                 = useParams();
  const { currentPlan, fetchPlan, updatePlan } = useTravelPlan();
  const { showToast }                          = useToast();
  const navigate                               = useNavigate();

  const [form,    setForm]    = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const populateForm = useCallback((plan) => {
    setForm({
      name:        plan.name,
      description: plan.description  || '',
      startDate:   plan.startDate.split('T')[0],
      endDate:     plan.endDate.split('T')[0],
      budget:      plan.budget,
      notes:       plan.notes || '',
    });
  }, []);

  useEffect(() => {
    if (currentPlan && String(currentPlan.id) === String(id)) {
      populateForm(currentPlan);
    } else {
      fetchPlan(id).catch(() => setError('Error loading plan.'));
    }
  }, [id, currentPlan, fetchPlan, populateForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Trip name is required.'); return; }
    if (form.name.length > 200) { setError('Trip name cannot exceed 200 characters.'); return; }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date cannot be before the start date.'); return;
    }
    if (parseFloat(form.budget) < 0) { setError('Budget cannot be negative.'); return; }

    setLoading(true);
    try {
      await updatePlan(id, { ...form, budget: parseFloat(form.budget) });
      showToast('Travel plan updated successfully!');
      navigate(`/plan/${id}`);
    } catch {
      setError('Error updating plan.');
    } finally {
      setLoading(false);
    }
  };

  if (!form && !error) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/plan/${id}`} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-sm mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to plan
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center">
            <Pencil className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-slate-900 text-xl">Edit trip</h1>
            <p className="text-slate-500 text-sm">Update trip details</p>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {form && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={e => f('name', e.target.value)}
                maxLength={200}
                required
              />
              {form.name.length > 0 && (
                <p className={`text-xs mt-1 text-right ${form.name.length > 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {form.name.length}/200
                </p>
              )}
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" value={form.description} onChange={e => f('description', e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start date *</label>
                <input type="date" className="input" value={form.startDate} onChange={e => f('startDate', e.target.value)} required />
              </div>
              <div>
                <label className="label">End date *</label>
                <input type="date" className="input" value={form.endDate} min={form.startDate} onChange={e => f('endDate', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Budget (€)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">€</span>
                <input type="number" min="0" step="0.01" className="input pl-8" value={form.budget} onChange={e => f('budget', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input resize-none" value={form.notes} onChange={e => f('notes', e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => navigate(`/plan/${id}`)} className="btn-outline flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                  : '✅ Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditTravelPlanPage;
