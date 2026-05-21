import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTravelPlan }  from '../hooks/useTravelPlan';
import { useToast }       from '../hooks/useToast';
import SkeletonGrid       from '../components/SkeletonGrid';
import ConfirmModal       from '../components/ConfirmModal';
import { formatDateRange, getPlanStatus, getDaysBetween } from '../utils/formatDate';
import {
  Plus, MapPin, Calendar, Wallet, Activity,
  Pencil, Trash2, Eye, Globe, Clock, AlertCircle, TrendingUp,
} from 'lucide-react';

const DashboardPage = () => {
  const { user }                                        = useAuth();
  const { plans, loading, error, fetchUserPlans, deletePlan } = useTravelPlan();
  const { showToast }                                   = useToast();
  const navigate                                        = useNavigate();

  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    fetchUserPlans(user.id);
  }, [user.id, fetchUserPlans]);

  const handleDeleteClick = (plan, e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({ id: plan.id, name: plan.name });
  };

  const handleDeleteConfirmed = async (id) => {
    try {
      await deletePlan(id);
      showToast('Travel plan deleted successfully.');
    } catch {
      showToast('Error deleting plan. Please try again.', 'error');
    }
  };

  const totalBudget = plans.reduce((s, p) => s + (p.budget || 0), 0);
  const active      = plans.filter(p => {
    const now = new Date();
    return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  });
  const upcoming = plans.filter(p => new Date(p.startDate) > new Date());

  const stats = [
    { label: 'Total plans',  value: plans.length,                    icon: Globe,      color: 'text-primary-500', bg: 'bg-blue-50',    border: 'border-l-primary-500' },
    { label: 'In progress',  value: active.length,                   icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
    { label: 'Upcoming',     value: upcoming.length,                 icon: Clock,      color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-l-sky-500'     },
    { label: 'Total budget', value: `${totalBudget.toLocaleString()} €`, icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-l-violet-500'  },
  ];

  return (
    <div className="page-container">

      {confirmModal && (
        <ConfirmModal
          title="Delete travel plan?"
          message={`Delete "${confirmModal.name}"? All destinations, activities, expenses, and checklist items will also be removed. This action cannot be undone.`}
          onConfirm={() => handleDeleteConfirmed(confirmModal.id)}
          onClose={() => setConfirmModal(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-slate-900">
            Welcome, <span className="text-sky-600">{user.firstName}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage all your travel plans</p>
        </div>
        <button onClick={() => navigate('/create-plan')} className="btn-sky self-start">
          <Plus className="w-4 h-4" /> New trip
        </button>
      </div>

      {error && (
        <div className="alert-error mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`card-colored-left ${s.border}`}>
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-slate-800">My trips</h2>
        {plans.length > 0 && <span className="badge-neutral">{plans.length} plans</span>}
      </div>

      {loading && plans.length === 0 && <SkeletonGrid count={3} />}

      {!loading && plans.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mb-5">
              <Globe className="w-10 h-10 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No travel plans yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              Create your first plan and start planning your adventure!
            </p>
            <button onClick={() => navigate('/create-plan')} className="btn-sky">
              <Plus className="w-4 h-4" /> Create first plan
            </button>
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map(plan => {
            const status   = getPlanStatus(plan.startDate, plan.endDate);
            const duration = getDaysBetween(plan.startDate, plan.endDate);
            return (
              <div key={plan.id} className="card-hover flex flex-col group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-sky-600 transition-colors">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{plan.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                    <span className={status.cls}>{status.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatDateRange(plan.startDate, plan.endDate)}</span>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-slate-400 text-xs">{duration} days</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-4">
                  <Wallet className="w-3.5 h-3.5 shrink-0" />
                  {plan.budget?.toLocaleString()} € budget
                </div>

                <div className="flex gap-4 text-xs text-slate-400 pb-4 mb-4 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{plan.destinations?.length || 0} destinations
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />{plan.activities?.length || 0} activities
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/plan/${plan.id}`}
                    className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                  <Link
                    to={`/edit-plan/${plan.id}`}
                    onClick={e => e.stopPropagation()}
                    className="btn-icon bg-slate-50 hover:bg-sky-50 hover:text-sky-600 border border-slate-200"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={e => handleDeleteClick(plan, e)}
                    className="btn-icon bg-slate-50 hover:bg-rose-50 hover:text-rose-500 border border-slate-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
