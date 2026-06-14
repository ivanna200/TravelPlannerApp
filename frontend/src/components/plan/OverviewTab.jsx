import { MapPin, Wallet, Activity, CheckSquare, BarChart3, FileDown, Clock, Calendar } from 'lucide-react';
import { generatePlanPDF } from '../../utils/pdfExport';
import { formatDate, formatDateRange } from '../../utils/formatDate';

const STATUS_BADGE = {
  Planned:   'badge-sky',
  Reserved:  'badge-violet',
  Completed: 'badge-success',
  Cancelled: 'badge-danger',
};

const OverviewTab = ({
  plan, budgetSummary, budgetPct,
  destinations, activities, expenses, checklist, completedItems,
}) => {
  const handlePDF = () => {
    generatePlanPDF({ plan, destinations, activities, expenses, checklist, budgetSummary });
  };

  const activitiesByDate = activities
    .slice()
    .sort((a, b) => {
      const d = new Date(a.date) - new Date(b.date);
      return d !== 0 ? d : (a.time || '').localeCompare(b.time || '');
    })
    .reduce((acc, a) => {
      const key = formatDate(a.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});

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
            <BarChart3 className="w-4 h-4 text-sky-500" />Plan details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Travel period</span>
              <span className="font-semibold text-slate-800">{formatDateRange(plan.startDate, plan.endDate)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Planned budget</span>
              <span className="font-bold text-emerald-600">{plan.budget?.toLocaleString()} €</span>
            </div>
          </div>
          {plan.description && (
            <p className="text-slate-600 text-sm leading-relaxed mt-4">{plan.description}</p>
          )}
          {plan.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm flex gap-2 mt-3">
              <span className="shrink-0">📝</span>{plan.notes}
            </div>
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
      </div>

      <div className="card">
        <h3 className="section-title mb-4">
          <MapPin className="w-4 h-4 text-sky-500" />Destinations ({destinations.length})
        </h3>
        {destinations.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No destinations added yet.</p>
        ) : (
          <div className="space-y-3">
            {destinations.map((d, i) => (
              <div key={d.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">{i + 1}</div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{d.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{d.location}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" />{formatDateRange(d.arrivalDate, d.departureDate)}</div>
                  {d.description && <p className="text-xs text-slate-500 mt-1">{d.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="section-title mb-4">
          <Activity className="w-4 h-4 text-primary-500" />Activities ({activities.length})
        </h3>
        {activities.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No activities planned yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(activitiesByDate).map(([dateKey, dayActs]) => (
              <div key={dateKey}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{dateKey}</div>
                <div className="space-y-2">
                  {dayActs.map(a => (
                    <div key={a.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">{a.name}</span>
                          <span className={`badge text-xs ${STATUS_BADGE[a.status] || 'badge-primary'}`}>{a.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-slate-500">
                          {a.time && <span>{a.time}</span>}
                          {a.location && <span>{a.location}</span>}
                          {a.estimatedCost > 0 && <span className="text-emerald-600 font-semibold">Est. {a.estimatedCost} €</span>}
                        </div>
                        {a.description && <p className="text-xs text-slate-500 mt-1">{a.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="section-title mb-4">
          <Wallet className="w-4 h-4 text-emerald-500" />Expenses ({expenses.length})
        </h3>
        {expenses.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map(e => (
              <div key={e.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl text-sm">
                <div>
                  <div className="font-semibold text-slate-800">{e.name}</div>
                  <div className="text-xs text-slate-500">{e.category} · {formatDate(e.date)}</div>
                </div>
                <div className="font-bold text-rose-500 shrink-0">{e.amount} €</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="section-title mb-4">
          <CheckSquare className="w-4 h-4 text-violet-500" />Packing list ({completedItems}/{checklist.length})
        </h3>
        {checklist.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No checklist items yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checklist.map(item => (
              <div key={item.id} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${item.isCompleted ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${item.isCompleted ? 'bg-emerald-500' : 'border-2 border-slate-300'}`}>
                  {item.isCompleted && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={item.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}>{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
