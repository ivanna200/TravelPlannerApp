import { useState } from 'react';
import { useTravelPlan } from '../useTravelPlan';
import { useToast }      from '../useToast';

export const usePlanChecklist = (planId) => {
  const { checklist, addChecklistItem, toggleChecklistItem, removeChecklistItem } = useTravelPlan();
  const { showToast } = useToast();

  const [input,        setInput]        = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  const completedCount = checklist.filter(c => c.isCompleted).length;
  const progressPct    = checklist.length ? (completedCount / checklist.length) * 100 : 0;
  const allDone        = checklist.length > 0 && completedCount === checklist.length;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await addChecklistItem({ name: input.trim(), travelPlanId: parseInt(planId) });
      setInput('');
      showToast('Stavka dodana na listu!');
    } catch {
      showToast('Greška pri dodavanju stavke.', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleChecklistItem(id);
    } catch {
      showToast('Greška pri označavanju stavke.', 'error');
    }
  };

  const handleDeleteClick     = (item) => setConfirmModal(item);
  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await removeChecklistItem(confirmModal.id);
      showToast('Stavka uspješno obrisana.');
    } catch {
      showToast('Greška pri brisanju stavke.', 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  return {
    checklist, input, setInput,
    completedCount, progressPct, allDone,
    confirmModal, setConfirmModal,
    handleAdd, handleToggle,
    handleDeleteClick, handleDeleteConfirmed,
  };
};
