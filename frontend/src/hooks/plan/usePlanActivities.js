import { useState } from 'react';
import { useTravelPlan } from '../useTravelPlan';
import { useToast }      from '../useToast';

const emptyForm = {
  name: '', date: '', time: '', location: '',
  description: '', estimatedCost: 0, status: 'Planirano',
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
      status:        act.status        || 'Planirano',
    });
    setEditTarget(act);
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDateInPlan(form.date)) {
      setError('Datum aktivnosti mora biti unutar perioda putovanja!'); return;
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
        showToast('Aktivnost uspješno dodana!');
      } else {
        await updateActivity(editTarget.id, payload);
        showToast('Aktivnost uspješno ažurirana!');
      }
      closeModal();
    } catch {
      setError(modal === 'add' ? 'Greška pri dodavanju aktivnosti.' : 'Greška pri ažuriranju aktivnosti.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick     = (act) => setConfirmModal(act);
  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await removeActivity(confirmModal.id);
      showToast('Aktivnost uspješno obrisana.');
    } catch {
      showToast('Greška pri brisanju aktivnosti.', 'error');
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
