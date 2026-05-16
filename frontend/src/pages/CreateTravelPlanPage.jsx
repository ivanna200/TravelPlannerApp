import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTravelPlan } from '../hooks/useTravelPlan';
import { useToast }      from '../hooks/useToast';
import { ArrowLeft, Plane, AlertCircle } from 'lucide-react';

const CreateTravelPlanPage = () => {
  const { user }       = useAuth();
  const { createPlan } = useTravelPlan();
  const { showToast }  = useToast();
  const navigate       = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const [form,    setForm]    = useState({ name: '', description: '', startDate: '', endDate: '', budget: '', notes: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validacija — specifikacija zahtjeva provjeru datuma i budžeta
    if (!form.name.trim())    { setError('Naziv putovanja je obavezan.'); return; }
    if (!form.startDate)      { setError('Početni datum je obavezan.'); return; }
    if (!form.endDate)        { setError('Krajnji datum je obavezan.'); return; }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('Krajnji datum ne može biti prije početnog.'); return;
    }
    if (form.budget !== '' && parseFloat(form.budget) < 0) {
      setError('Budžet ne može biti negativan.'); return;
    }

    setLoading(true);
    try {
      const plan = await createPlan({
        ...form,
        budget: parseFloat(form.budget) || 0,
        userId: user.id,
      });
      showToast('Plan putovanja uspješno kreiran! ✈️');
      navigate(`/plan/${plan.id}`);
    } catch {
      setError('Greška pri kreiranju plana. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-sm mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Nazad na dashboard
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <div className="w-11 h-11 bg-sky-50 rounded-2xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-sky-500" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-slate-900 text-xl">Novo putovanje</h1>
            <p className="text-slate-500 text-sm">Unesite osnovne podatke o putovanju</p>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Naziv putovanja *</label>
            <input
              className="input"
              value={form.name}
              onChange={e => f('name', e.target.value)}
              placeholder="npr. Ljetovanje u Grčkoj"
              required
            />
          </div>

          <div>
            <label className="label">Opis</label>
            <textarea
              className="input resize-none"
              value={form.description}
              onChange={e => f('description', e.target.value)}
              rows={3}
              placeholder="Kratki opis putovanja..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Početni datum *</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                min={today}
                onChange={e => f('startDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Krajnji datum *</label>
              <input
                type="date"
                className="input"
                value={form.endDate}
                min={form.startDate || today}
                onChange={e => f('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Planirani budžet (€) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input pl-8"
                value={form.budget}
                onChange={e => f('budget', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Napomene</label>
            <textarea
              className="input resize-none"
              value={form.notes}
              onChange={e => f('notes', e.target.value)}
              rows={3}
              placeholder="Savjeti, podsjetnici, ideje..."
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline flex-1">
              Odustani
            </button>
            <button type="submit" className="btn-sky flex-1" disabled={loading}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Kreiranje...</>
                : '✈️ Kreiraj plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTravelPlanPage;
