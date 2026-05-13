import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import sharingService from '../services/sharingService';

const SharedPlanPage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const result = await sharingService.getSharedPlan(token);
        setData(result);
      } catch { setError('Plan nije pronađen ili je link istekao.'); }
      finally { setLoading(false); }
    };
    loadPlan();
  }, [token]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('bs-BA', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4">✈️</div><p className="text-slate-500">Učitavanje plana...</p></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center card max-w-md w-full">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Link nije validan</h2>
        <p className="text-slate-500">{error}</p>
        <Link to="/login" className="btn-primary inline-flex mt-4">Prijavi se</Link>
      </div>
    </div>
  );

  const { plan, accessType } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 text-sm font-medium ${accessType === 'EDIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
        {accessType === 'EDIT' ? '✏️ Dijeljeni plan — Pristup za uređivanje' : '👁️ Dijeljeni plan — Samo pregled'}
      </div>

      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h1>
        {plan.description && <p className="text-slate-500 mb-4">{plan.description}</p>}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500 mb-1">📅 Period putovanja</div>
            <div className="font-medium">{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500 mb-1">💰 Planirani budžet</div>
            <div className="font-medium text-emerald-600">{plan.budget?.toLocaleString()} €</div>
          </div>
        </div>
        {plan.notes && <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">📝 {plan.notes}</div>}
      </div>

      {plan.destinations?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">🗺️ Destinacije ({plan.destinations.length})</h2>
          <div className="space-y-3">
            {plan.destinations.map((d) => (
              <div key={d.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-xl">📍</span>
                <div>
                  <div className="font-medium text-slate-800">{d.name}</div>
                  <div className="text-sm text-slate-500">{d.location} · {formatDate(d.arrivalDate)} — {formatDate(d.departureDate)}</div>
                  {d.description && <div className="text-sm text-slate-600 mt-1">{d.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.activities?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">📋 Aktivnosti ({plan.activities.length})</h2>
          <div className="space-y-3">
            {plan.activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-800">{a.name}</div>
                    <span className={`badge text-xs ${a.status === 'Završeno' ? 'bg-emerald-100 text-emerald-700' : a.status === 'Otkazano' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{a.status}</span>
                  </div>
                  <div className="text-sm text-slate-500">{a.location} · {formatDate(a.date)} u {a.time}</div>
                  {a.estimatedCost > 0 && <div className="text-sm text-emerald-600 mt-1">💰 {a.estimatedCost} €</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedPlanPage;