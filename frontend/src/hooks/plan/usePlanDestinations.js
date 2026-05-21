import { useState } from 'react';
import { useTravelPlan } from '../useTravelPlan';
import { useToast }      from '../useToast';

const emptyForm = { name: '', location: '', arrivalDate: '', departureDate: '', description: '' };

export const usePlanDestinations = (planId, planStart, planEnd) => {
  const { destinations, addDestination, updateDestination, removeDestination } = useTravelPlan();
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

  const validate = (f) => {
    if (!isDateInPlan(f.arrivalDate) || !isDateInPlan(f.departureDate))
      return 'Destination dates must be within the travel period!';
    if (f.departureDate && f.arrivalDate && f.departureDate < f.arrivalDate)
      return 'Departure date cannot be before arrival date!';
    return null;
  };

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setError(''); setModal('add'); };

  const openEdit = (dest) => {
    setForm({
      name:          dest.name,
      location:      dest.location,
      arrivalDate:   dest.arrivalDate?.split('T')[0]   || '',
      departureDate: dest.departureDate?.split('T')[0] || '',
      description:   dest.description || '',
    });
    setEditTarget(dest);
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      if (modal === 'add') {
        await addDestination({ ...form, travelPlanId: parseInt(planId) });
        showToast('Destination added successfully!');
      } else {
        await updateDestination(editTarget.id, { ...form, travelPlanId: parseInt(planId) });
        showToast('Destination updated successfully!');
      }
      closeModal();
    } catch {
      setError(modal === 'add' ? 'Error adding destination.' : 'Error updating destination.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick     = (dest) => setConfirmModal(dest);
  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    try {
      await removeDestination(confirmModal.id);
      showToast('Destination deleted successfully.');
    } catch {
      showToast('Error deleting destination.', 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  return {
    destinations, modal, form, setForm, loading, error,
    confirmModal, setConfirmModal,
    openAdd, openEdit, closeModal,
    handleSubmit, handleDeleteClick, handleDeleteConfirmed,
  };
};
