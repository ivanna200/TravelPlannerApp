import { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import { useTravelPlan }       from '../hooks/useTravelPlan';

import { usePlanDestinations } from '../hooks/plan/usePlanDestinations';
import { usePlanActivities }   from '../hooks/plan/usePlanActivities';
import { usePlanExpenses }     from '../hooks/plan/usePlanExpenses';
import { usePlanChecklist }    from '../hooks/plan/usePlanChecklist';
import { usePlanSharing }      from '../hooks/plan/usePlanSharing';

import OverviewTab     from '../components/plan/OverviewTab';
import DestinationsTab from '../components/plan/DestinationsTab';
import ActivitiesTab   from '../components/plan/ActivitiesTab';
import ExpensesTab     from '../components/plan/ExpensesTab';
import ChecklistTab    from '../components/plan/ChecklistTab';
import SharingTab      from '../components/plan/SharingTab';

import LoadingSpinner      from '../components/LoadingSpinner';
import { formatDateRange } from '../utils/formatDate';
import {
  ArrowLeft, Pencil, Calendar, Wallet,
  MapPin, Activity, CheckSquare, Share2, BarChart3, AlertCircle,
} from 'lucide-react';

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: BarChart3   },
  { id: 'destinations', label: 'Destinations', icon: MapPin      },
  { id: 'activities',   label: 'Activities',   icon: Activity    },
  { id: 'expenses',     label: 'Expenses',     icon: Wallet      },
  { id: 'checklist',    label: 'Checklist',    icon: CheckSquare },
  { id: 'sharing',      label: 'Sharing',      icon: Share2      },
];

const TravelPlanDetailPage = () => {
  const { id } = useParams();
  const {
    currentPlan: plan,
    destinations, activities, expenses, checklist,
    budgetSummary, loading, error: ctxErr,
    fetchPlan,
  } = useTravelPlan();

  const [activeTab, setActiveTab] = useState('overview');

  const planStart = plan?.startDate?.split('T')[0];
  const planEnd   = plan?.endDate?.split('T')[0];

  useEffect(() => { fetchPlan(id); }, [id, fetchPlan]);

  const destHook    = usePlanDestinations(id, planStart, planEnd);
  const actHook     = usePlanActivities(id, planStart, planEnd);
  const expHook     = usePlanExpenses(id, plan?.budget, planStart, planEnd);
  const checkHook   = usePlanChecklist(id);
  const sharingHook = usePlanSharing(id);

  if (loading && !plan) return <LoadingSpinner />;
  if (!plan) return (
    <div className="page-container text-center py-16 text-slate-500">Plan not found.</div>
  );

  const completedItems = checklist.filter(c => c.isCompleted).length;

  const budgetPct = budgetSummary && budgetSummary.plannedBudget > 0
    ? Math.min((budgetSummary.totalExpenses / budgetSummary.plannedBudget) * 100, 100)
    : 0;

  const dateRangeLabel = formatDateRange(plan.startDate, plan.endDate);

  return (
    <div className="page-container">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <Link to="/dashboard"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-sm mb-2 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            My trips
          </Link>
          <h1 className="text-slate-900">{plan.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />{dateRangeLabel}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Wallet className="w-3.5 h-3.5" />{plan.budget?.toLocaleString()} €
            </span>
          </div>
        </div>
        <Link to={`/edit-plan/${id}`} className="btn-sky self-start">
          <Pencil className="w-4 h-4" />Edit plan
        </Link>
      </div>

      {ctxErr && (
        <div className="alert-error mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />{ctxErr}
        </div>
      )}

      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={activeTab === t.id ? 'tab-active' : 'tab-inactive'}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          plan={plan}
          budgetSummary={budgetSummary}
          budgetPct={budgetPct}
          destinations={destinations}
          activities={activities}
          expenses={expenses}
          checklist={checklist}
          completedItems={completedItems}
        />
      )}
      {activeTab === 'destinations' && (
        <DestinationsTab hook={destHook} planStart={planStart} planEnd={planEnd} dateRangeLabel={dateRangeLabel} />
      )}
      {activeTab === 'activities' && (
        <ActivitiesTab hook={actHook} plan={plan} planStart={planStart} planEnd={planEnd} dateRangeLabel={dateRangeLabel} />
      )}
      {activeTab === 'expenses' && (
        <ExpensesTab hook={expHook} planStart={planStart} planEnd={planEnd} dateRangeLabel={dateRangeLabel} />
      )}
      {activeTab === 'checklist' && <ChecklistTab hook={checkHook} />}
      {activeTab === 'sharing'   && <SharingTab   hook={sharingHook} />}
    </div>
  );
};

export default TravelPlanDetailPage;
