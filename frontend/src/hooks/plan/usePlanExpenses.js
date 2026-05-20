import { useState } from 'react';
import { useTravelPlan } from '../useTravelPlan';
import { useToast }      from '../useToast';

const emptyForm = { name: '', category: 'Prevoz', amount: '', date: '', description: '' };

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
      category:    exp.category    || 'Prevoz',
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
      setError('Datum troška mora biti unutar perioda putovanja!'); return;
    }
    setLoading(true);
    try {
      const payload = { ...form, travelPlanId: parseInt(planId), amount: parseFloat(form.amount) };
      if (modal === 'add') {
        await addExpense(payload, planBudget);
        showToast('Trošak uspješno dodan!');
      } else {
        await updateExpense(editTarget.id, payload, parseInt(planId), planBudget);
        showToast('Trošak uspješno ažuriran!');
      }
      closeModal();
    } catch {
      setError(modal === 'add' ? 'Greška pri dodavanju troška.' : 'Greška pri ažuriranju troška.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick     = (exp) => setConfirmModal(exp);
  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await removeExpense(confirmModal.id, parseInt(planId), planBudget);
      showToast('Trošak uspješno obrisan.');
    } catch {
      showToast('Greška pri brisanju troška.', 'error');
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
