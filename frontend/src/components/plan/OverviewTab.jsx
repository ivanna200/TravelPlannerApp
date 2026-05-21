import { MapPin, Wallet, Activity, CheckSquare, BarChart3, FileDown } from 'lucide-react';
import { generatePlanPDF } from '../../utils/pdfExport';

const OverviewTab = ({
  plan, budgetSummary, budgetPct,
  destinations, activities, expenses, checklist, completedItems,
}) => {
  const handlePDF = () => {
    generatePlanPDF({ plan, destinations, activities, expenses, checklist, budgetSummary });
  };

  return (
    <div className="space-y-5">

      <div className="flex justify-end">
        <button onClick={handlePDF} className="btn-sky">
          <FileDown className="w-4 h-4" />Download PDF report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="card">
          <h3 className="section-title mb-4">
            <BarChart3 className="w-4 h-4 text-sky-500" />Overview
          </h3>
          {plan.description && (
            <p className="text-slate-600 text-sm leading-relaxed mb-3">{plan.description}</p>
          )}
          {plan.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm flex gap-2">
              <span className="shrink-0">📝</span>{plan.notes}
            </div>
          )}
          {!plan.description && !plan.notes && (
            <p className="text-slate-400 text-sm italic">No additional information.</p>
          )}
        </div>

        {budgetSummary && (
          <div className="card">
            <h3 className="section-title mb-4">
              <Wallet className="w-4 h-4 text-emerald-500" />Finances
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Spent</span>
                <span className="font-bold">{budgetSummary.totalExpenses} €</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${
                    budgetPct > 90 ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Remaining</span>
                <span className={`font-bold text-xl ${budgetSummary.remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {budgetSummary.remainingBudget} €
                </span>
              </div>
              <div className="divider" />
              <div className="flex justify-between text-sm text-slate-400">
                <span>Planned budget</span>
                <span>{budgetSummary.plannedBudget} €</span>
              </div>
            </div>
          </div>
        )}

        <div className="card md:col-span-2">
          <h3 className="section-title mb-4">📊 Trip summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: MapPin,      label: 'Destinations', value: destinations.length,                     bg: 'bg-sky-50',     ic: 'text-sky-500'     },
              { icon: Activity,    label: 'Activities',   value: activities.length,                       bg: 'bg-blue-50',    ic: 'text-primary-500' },
              { icon: Wallet,      label: 'Expenses',     value: expenses.length,                         bg: 'bg-emerald-50', ic: 'text-emerald-600' },
              { icon: CheckSquare, label: 'Checklist',    value: `${completedItems}/${checklist.length}`, bg: 'bg-violet-50',  ic: 'text-violet-500'  },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <s.icon className={`w-5 h-5 ${s.ic}`} />
                </div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
