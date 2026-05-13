import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import travelPlanService from '../services/travelPlanService';

const CreateTravelPlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', budget: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('Krajnji datum ne može biti prije početnog datuma.');
      return;
    }
    if (parseFloat(form.budget) < 0) {
      setError('Budžet ne može biti negativan.');
      return;
    }
    setLoading(true);
    try {
      const plan = await travelPlanService.createPlan({ ...form, budget: parseFloat(form.budget), userId: user.id });
      navigate(`/plan/${plan.id}`);
    } catch {
      setError('Greška pri kreiranju plana.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-slate-500 hover:text-slate-700 transition-colors">← Nazad</Link>
        <h1 className="text-2xl font-bold text-slate-800">✈️ Novo putovanje</h1>
      </div>

      <div className="card">
        {error && <div className="error-box mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Naziv putovanja *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="npr. Ljetovanje u Grčkoj" required />
          </div>

          <div>
            <label className="label">Opis</label>
            <textarea className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Kratki opis vašeg putovanja..." />
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
            <label className="label">Planirani budžet (€) *</label>
            <input type="number" min="0" className="input-field" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0.00" required />
          </div>

          <div>
            <label className="label">Napomene</label>
            <textarea className="input-field resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Dodatne napomene i savjeti..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Odustani</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? '⏳ Kreiranje...' : '✅ Kreiraj plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTravelPlanPage;