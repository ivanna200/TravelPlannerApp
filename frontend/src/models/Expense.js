export const createExpense = (data) => ({
  id: data.id || null,
  name: data.name || '',
  category: data.category || '',
  amount: data.amount || 0,
  date: data.date || '',
  description: data.description || '',
  travelPlanId: data.travelPlanId || null,
});

export const EXPENSE_CATEGORIES = [
  'Prevoz',
  'Smještaj',
  'Hrana',
  'Ulaznice',
  'Kupovina',
  'Ostalo',
];