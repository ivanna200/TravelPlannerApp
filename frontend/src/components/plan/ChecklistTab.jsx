import { Fragment } from 'react';
import { CheckSquare, Plus, CheckCircle, Pencil } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import Modal from '../Modal';

const SUGGESTIONS = [
  'Passport', 'Ticket', 'Hotel', 'Insurance', 'Charger',
  'Adapter', 'Medicine', 'Cash', 'Sunglasses',
];

const ChecklistTab = ({ hook }) => {
  const {
    checklist, input, setInput,
    completedCount, progressPct, allDone,
    confirmModal, setConfirmModal,
    editModal, setEditModal, editName, setEditName,
    handleAdd, handleToggle, handleEditClick, handleEditSave,
    handleDeleteClick, handleDeleteConfirmed,
  } = hook;

  return (
    <>
      {confirmModal && (
        <ConfirmModal
          title="Delete item?"
          message={`Delete "${confirmModal.name}" from the list? This action cannot be undone.`}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {editModal && (
        <Modal title="Edit item" onClose={() => setEditModal(null)}>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className="label">Item name *</label>
              <input
                className="input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditModal(null)} className="btn-outline flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="space-y-4">
        <h2 className="section-title">
          <CheckSquare className="w-5 h-5 text-violet-500" />Packing list
        </h2>

        {checklist.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Progress</span>
              <span className="text-sm font-bold text-slate-800">{completedCount} / {checklist.length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {allDone && (
              <div className="alert-success mt-3 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />All packed! Have a great trip! 🎉
              </div>
            )}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              className="input flex-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add an item (Passport, Charger, Insurance...)"
            />
            <button type="submit" className="btn-sky shrink-0">
              <Plus className="w-4 h-4" />Add
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-full transition-colors font-medium">
              + {s}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {checklist.length === 0 && (
            <div className="card">
              <div className="empty-state py-8">
                <CheckSquare className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-400 text-sm">The list is empty. Use quick suggestions or type an item.</p>
              </div>
            </div>
          )}

          {[false, true].map(done => (
            <Fragment key={String(done)}>
              {checklist.filter(c => c.isCompleted === done).map(item => (
                <div key={item.id}
                  className={`card-sm flex items-center justify-between gap-4 transition-all ${item.isCompleted ? 'opacity-60' : ''}`}>
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggle(item.id)}
                      className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                    />
                    <span className={`text-slate-800 text-sm font-medium ${item.isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {item.name}
                    </span>
                    {item.isCompleted && (
                      <span className="text-xs text-emerald-500 font-semibold">✓ Packed</span>
                    )}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-slate-300 hover:text-sky-500 transition-colors w-7 h-7 flex items-center justify-center"
                      title="Edit item"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="text-slate-300 hover:text-rose-400 transition-colors w-7 h-7 flex items-center justify-center text-xl font-light"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChecklistTab;
