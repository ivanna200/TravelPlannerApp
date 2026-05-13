import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';

const EditTravelPlanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', budget: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plan = await travelPlanService.getPlan(id);
        setForm({
          name: plan.name, description: plan.description,
          startDate: plan.startDate.split('T')[0], endDate: plan.endDate.split('T')[0],
          budget: plan.budget, notes: plan.notes,
        });
      } catch { setError('Greška pri učitavanju.'); }
    };
    loadPlan();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (new Date(form.endDate) < new Date(form.startDate)) { setError('Krajnji datum ne može biti prije početnog.'); return; }
    setLoading(true);
    try {
      await travelPlanService.updatePlan(id, { ...form, budget: parseFloat(form.budget) });
      navigate(`/plan/${id}`);
    } catch { setError('Greška pri ažuriranju.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/plan/${id}`} className="text-slate-500 hover:text-slate-700">← Nazad</Link>
        <h1 className="text-2xl font-bold text-slate-800">✏️ Uredi putovanje</h1>
      </div>
      <div className="card">
        {error && <div className="error-box mb-5">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Naziv *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Opis</label>
            <textarea className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Početni datum *</label>
              <input type="date" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">Krajnji datum *</label>
              <input type="date" className="input-field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Budžet (€)</label>
            <input type="number" min="0" className="input-field" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          </div>
          <div>
            <label className="label">Napomene</label>
            <textarea className="input-field resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(`/plan/${id}`)} className="btn-secondary flex-1">Odustani</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? '⏳ Čuvanje...' : '✅ Sačuvaj izmjene'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTravelPlanPage;