import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { formatDateLong } from '../utils/formatDate';

const STATUS_STYLE = {
  'Planirano':   'border-l-sky-400 bg-sky-50/50',
  'Rezervisano': 'border-l-violet-400 bg-violet-50/50',
  'Završeno':    'border-l-emerald-400 bg-emerald-50/50',
  'Otkazano':    'border-l-rose-400 bg-rose-50/50',
};

const STATUS_BADGE = {
  'Planirano':   'badge-sky',
  'Rezervisano': 'badge-violet',
  'Završeno':    'badge-success',
  'Otkazano':    'badge-danger',
};

const CalendarView = ({ activities, startDate, endDate }) => {
  // Generišemo niz svih dana između startDate i endDate
  const days = [];
  const cur  = new Date(startDate);
  const end  = new Date(endDate);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const [selectedDay, setSelectedDay] = useState(days[0] || new Date());
  const [startIdx,    setStartIdx]    = useState(0);
  const VISIBLE = 7;

  const visibleDays  = days.slice(startIdx, startIdx + VISIBLE);
  const getActs      = (day) =>
    activities
      .filter(a => new Date(a.date).toDateString() === day.toDateString())
      .sort((a, b) => a.time.localeCompare(b.time));
  const hasActs      = (day) => getActs(day).length > 0;
  const selectedActs = getActs(selectedDay);

  return (
    <div className="space-y-4">
      {/* Strip navigacije po danima */}
      <div className="card-sm">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setStartIdx(Math.max(0, startIdx - VISIBLE))}
            disabled={startIdx === 0}
            className="btn-icon disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1 flex-1">
            {visibleDays.map(day => {
              const isSel = day.toDateString() === selectedDay.toDateString();
              const hasA  = hasActs(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl flex-1 transition-all
                    ${isSel ? 'bg-primary-500 text-white shadow-card' : 'hover:bg-slate-100'}`}
                >
                  <span className={`text-xs font-medium ${isSel ? 'text-white/70' : 'text-slate-400'}`}>
                    {day.toLocaleDateString('bs-BA', { weekday: 'short' })}
                  </span>
                  <span className={`text-sm font-bold mt-0.5 ${isSel ? 'text-white' : 'text-slate-800'}`}>
                    {day.getDate()}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasA ? (isSel ? 'bg-sky-300' : 'bg-sky-500') : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStartIdx(Math.min(days.length - VISIBLE, startIdx + VISIBLE))}
            disabled={startIdx + VISIBLE >= days.length}
            className="btn-icon disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm font-semibold text-slate-600 text-center">
          {formatDateLong(selectedDay)}
        </p>
      </div>

      {/* Aktivnosti za odabrani dan */}
      <div className="space-y-2">
        {selectedActs.length === 0 ? (
          <div className="card">
            <div className="empty-state py-8">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-slate-400 text-sm">Nema aktivnosti za ovaj dan</p>
            </div>
          </div>
        ) : (
          selectedActs.map(a => (
            <div key={a.id} className={`card-sm border-l-4 ${STATUS_STYLE[a.status] || 'border-l-slate-300'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{a.name}</span>
                    <span className={`badge text-xs ${STATUS_BADGE[a.status] || 'badge-primary'}`}>{a.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {a.time     && <span className="flex items-center gap-1"><Clock  className="w-3 h-3" />{a.time}</span>}
                    {a.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</span>}
                    {a.estimatedCost > 0 && <span className="font-semibold text-emerald-600">💰 {a.estimatedCost} €</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarView;
