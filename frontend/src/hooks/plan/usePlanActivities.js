import { useState } from 'react';
import { useTravelPlan } from '../useTravelPlan';
import { useToast }      from '../useToast';

const emptyForm = {
  name: '', date: '', time: '', location: '',
  description: '', estimatedCost: 0, status: 'Planned',
};

export const usePlanActivities = (planId, planStart, planEnd) => {
  const { activities, addActivity, updateActivity, removeActivity } = useTravelPlan();
  const { showToast } = useToast();

  const [modal,        setModal]        = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(emptyForm);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [actView,      setActView]      = useState('list');
  const [confirmModal, setConfirmModal] = useState(null);

  const isDateInPlan = (d) => {
    if (!d || !planStart || !planEnd) return true;
    return d >= planStart && d <= planEnd;
  };

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setError(''); setModal('add'); };

  const openEdit = (act) => {
    setForm({
      name:          act.name,
      date:          act.date?.split('T')[0] || '',
      time:          act.time          || '',
      location:      act.location      || '',
      description:   act.description   || '',
      estimatedCost: act.estimatedCost || 0,
      status:        act.status        || 'Planned',
    });
    setEditTarget(act);
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(form.date)) {
      setError('Activity date must be within the travel period!'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        travelPlanId:  parseInt(planId),
        estimatedCost: parseFloat(form.estimatedCost) || 0,
      };
      if (modal === 'add') {
        await addActivity(payload);
        showToast('Activity added successfully!');
      } else {
        await updateActivity(editTarget.id, payload);
        showToast('Activity updated successfully!');
      }
      closeModal();
    } catch {
      setError(modal === 'add' ? 'Error adding activity.' : 'Error updating activity.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick     = (act) => setConfirmModal(act);
  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await removeActivity(confirmModal.id);
      showToast('Activity deleted successfully.');
    } catch {
      showToast('Error deleting activity.', 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  return {
    activities, modal, form, setForm, loading, error,
    actView, setActView,
    confirmModal, setConfirmModal,
    openAdd, openEdit, closeModal,
    handleSubmit, handleDeleteClick, handleDeleteConfirmed,
  };
};
