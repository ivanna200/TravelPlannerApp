import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import travelPlanService from '../services/travelPlanService';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      const data = await travelPlanService.getUserPlans(user.id);
      setPlans(data);
    } catch {
      setError('Greška pri učitavanju planova.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite obrisati ovaj plan putovanja?')) return;
    try {
      await travelPlanService.deletePlan(id);
      setPlans(plans.filter((p) => p.id !== id));
    } catch {
      setError('Greška pri brisanju plana.');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('bs-BA', { day: '2-digit', month: 'short', year: 'numeric' });

  const getDaysLeft = (startDate) => {
    const days = Math.ceil((new Date(startDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return null;
    if (days === 0) return 'Danas!';
    return `Za ${days} dana`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            👋 Dobrodošli, {user.firstName}!
          </h1>
          <p className="text-slate-500 mt-1">Upravljajte svojim planovima putovanja</p>
        </div>
        <button onClick={() => navigate('/create-plan')} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span className="text-lg">+</span> Novo putovanje
        </button>
      </div>

      {error && <div className="error-box mb-6">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ukupno planova', value: plans.length, icon: '🗺️', color: 'blue' },
          { label: 'Predstojeća', value: plans.filter(p => new Date(p.startDate) > new Date()).length, icon: '📅', color: 'emerald' },
          { label: 'Destinacije', value: plans.reduce((s, p) => s + (p.destinations?.length || 0), 0), icon: '📍', color: 'violet' },
          { label: 'Aktivnosti', value: plans.reduce((s, p) => s + (p.activities?.length || 0), 0), icon: '🎯', color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nema planova putovanja</h3>
          <p className="text-slate-500 mb-6">Kreirajte prvi plan i počnite planirati avanturu!</p>
          <button onClick={() => navigate('/create-plan')} className="btn-primary inline-flex">
            + Kreiraj prvi plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const daysLeft = getDaysLeft(plan.startDate);
            return (
              <div key={plan.id} className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight">{plan.name}</h3>
                  {daysLeft && (
                    <span className="badge bg-blue-100 text-blue-700 ml-2 shrink-0">{daysLeft}</span>
                  )}
                </div>

                {plan.description && (
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2">{plan.description}</p>
                )}

                <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                  <span>📅</span>
                  <span>{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</span>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 mb-4">
                  <span>💰</span>
                  <span>{plan.budget.toLocaleString()} €</span>
                </div>

                <div className="flex gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">🗺️ {plan.destinations?.length || 0} destinacija</span>
                  <span className="flex items-center gap-1">📋 {plan.activities?.length || 0} aktivnosti</span>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                  <Link to={`/plan/${plan.id}`} className="btn-primary flex-1 text-center text-sm py-2">Pregledaj</Link>
                  <Link to={`/edit-plan/${plan.id}`} className="btn-warning text-sm py-2 px-3">✏️</Link>
                  <button onClick={() => handleDelete(plan.id)} className="btn-danger text-sm py-2 px-3">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;