import { useState } from 'react';
import { useTravelPlan } from '../useTravelPlan';
import { useToast }      from '../useToast';

export const usePlanChecklist = (planId) => {
  const { checklist, addChecklistItem, updateChecklistItem, toggleChecklistItem, removeChecklistItem } = useTravelPlan();
  const { showToast } = useToast();

  const [input,        setInput]        = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [editModal,    setEditModal]    = useState(null);
  const [editName,     setEditName]     = useState('');

  const completedCount = checklist.filter(c => c.isCompleted).length;
  const progressPct    = checklist.length ? (completedCount / checklist.length) * 100 : 0;
  const allDone        = checklist.length > 0 && completedCount === checklist.length;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await addChecklistItem({ name: input.trim(), travelPlanId: parseInt(planId) });
      setInput('');
      showToast('Item added to the list!');
    } catch {
      showToast('Error adding item.', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleChecklistItem(id);
    } catch {
      showToast('Error updating item.', 'error');
    }
  };

  const handleEditClick = (item) => {
    setEditName(item.name);
    setEditModal(item);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editModal || !editName.trim()) return;
    try {
      await updateChecklistItem(editModal.id, { name: editName.trim(), isCompleted: editModal.isCompleted });
      setEditModal(null);
      showToast('Item updated successfully.');
    } catch {
      showToast('Error updating item.', 'error');
    }
  };

  const handleDeleteClick     = (item) => setConfirmModal(item);
  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await removeChecklistItem(confirmModal.id);
      showToast('Item deleted successfully.');
    } catch {
      showToast('Error deleting item.', 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  return {
    checklist, input, setInput,
    completedCount, progressPct, allDone,
    confirmModal, setConfirmModal,
    editModal, setEditModal, editName, setEditName,
    handleAdd, handleToggle, handleEditClick, handleEditSave,
    handleDeleteClick, handleDeleteConfirmed,
  };
};
