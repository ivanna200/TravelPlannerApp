export const createExpense = (data) => ({
  id:           data.id           || null,
  name:         data.name         || '',
  category:     data.category     || 'Transport',
  amount:       data.amount       || 0,
  date:         data.date         || '',
  description:  data.description  || '',
  travelPlanId: data.travelPlanId || null,
});

export const EXPENSE_CATEGORIES = [
  'Transport',
  'Accommodation',
  'Food',
  'Tickets',
  'Shopping',
  'Other',
];
