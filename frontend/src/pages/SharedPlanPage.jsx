import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import sharingService from '../services/sharingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';
import { Eye, Pencil, MapPin, Calendar, Wallet, Activity, Clock, XCircle } from 'lucide-react';

const STATUS_BADGE = {
  'Planirano':   'badge-sky',
  'Rezervisano': 'badge-violet',
  'Završeno':    'badge-success',
  'Otkazano':    'badge-danger',
};

const SharedPlanPage = () => {
  const { token }               = useParams();
  const [data,    setData]      = useState(null);
  const [error,   setError]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    sharingService.getSharedPlan(token)
      .then(setData)
      .catch(() => setError('Plan nije pronađen ili je link istekao.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingSpinner text="Učitavanje dijeljenog plana..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Link nije validan</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/login" className="btn-primary">Prijavi se</Link>
        </div>
      </div>
    );
  }

  const { plan, accessType } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Access type banner */}
      <div className={`py-3 px-4 text-center text-sm font-semibold ${accessType === 'EDIT' ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'}`}>
        {accessType === 'EDIT'
          ? <><Pencil className="inline w-4 h-4 mr-2" />Dijeljeni plan — Pristup za uređivanje</>
          : <><Eye className="inline w-4 h-4 mr-2" />Dijeljeni plan — Samo pregled</>}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Osnovni podaci */}
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h1>
          {plan.description && <p className="text-slate-500 mb-4 text-sm">{plan.description}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-sky-500 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Period</div>
                <div className="text-sm font-semibold text-slate-800">
                  {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Budžet</div>
                <div className="text-sm font-bold text-emerald-700">{plan.budget?.toLocaleString()} €</div>
              </div>
            </div>
          </div>
          {plan.notes && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              📝 {plan.notes}
            </div>
          )}
        </div>

        {/* Destinacije */}
        {plan.destinations?.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">
              <MapPin className="w-5 h-5 text-sky-500" />
              Destinacije ({plan.destinations.length})
            </h2>
            <div className="space-y-3">
              {plan.destinations.map(d => (
                <div key={d.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{d.name}</div>
                    <div className="text-xs text-slate-500">
                      {d.location} · {formatDate(d.arrivalDate)} — {formatDate(d.departureDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aktivnosti */}
        {plan.activities?.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">
              <Activity className="w-5 h-5 text-primary-500" />
              Aktivnosti ({plan.activities.length})
            </h2>
            <div className="space-y-2">
              {plan.activities.map(a => (
                <div key={a.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{a.name}</span>
                      <span className={`badge text-xs ${STATUS_BADGE[a.status] || 'badge-primary'}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {a.location && `${a.location} · `}{formatDate(a.date)}{a.time && ` u ${a.time}`}
                    </div>
                  </div>
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
