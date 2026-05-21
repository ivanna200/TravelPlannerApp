import { useState } from 'react';
import { useTravelPlan } from '../useTravelPlan';
import { useToast }      from '../useToast';

const emptyForm = { name: '', category: 'Transport', amount: '', date: '', description: '' };

export const usePlanExpenses = (planId, planBudget, planStart, planEnd) => {
  const { expenses, budgetSummary, addExpense, updateExpense, removeExpense } = useTravelPlan();
  const { showToast } = useToast();

  const [modal,        setModal]        = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(emptyForm);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  const isDateInPlan = (d) => {
    if (!d || !planStart || !planEnd) return true;
    return d >= planStart && d <= planEnd;
  };

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setError(''); setModal('add'); };

  const openEdit = (exp) => {
    setForm({
      name:        exp.name,
      category:    exp.category    || 'Transport',
      amount:      exp.amount      || '',
      date:        exp.date?.split('T')[0] || '',
      description: exp.description || '',
    });
    setEditTarget(exp);
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.date && !isDateInPlan(form.date)) {
      setError('Expense date must be within the travel period!'); return;
    }
    setLoading(true);
    try {
      const payload = { ...form, travelPlanId: parseInt(planId), amount: parseFloat(form.amount) };
      if (modal === 'add') {
        await addExpense(payload, planBudget);
        showToast('Expense added successfully!');
      } else {
        await updateExpense(editTarget.id, payload, parseInt(planId), planBudget);
        showToast('Expense updated successfully!');
      }
      closeModal();
    } catch {
      setError(modal === 'add' ? 'Error adding expense.' : 'Error updating expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick     = (exp) => setConfirmModal(exp);
  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await removeExpense(confirmModal.id, parseInt(planId), planBudget);
      showToast('Expense deleted successfully.');
    } catch {
      showToast('Error deleting expense.', 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  return {
    expenses, budgetSummary,
    modal, form, setForm, loading, error,
    confirmModal, setConfirmModal,
    openAdd, openEdit, closeModal,
    handleSubmit, handleDeleteClick, handleDeleteConfirmed,
  };
};
