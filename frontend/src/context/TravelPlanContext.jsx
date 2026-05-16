import { useReducer, useCallback } from 'react';
import { TravelPlanContext } from '../hooks/useTravelPlan';
import travelPlanService  from '../services/travelPlanService';
import destinationService from '../services/destinationService';
import activityService    from '../services/activityService';
import expenseService     from '../services/expenseService';
import checklistService   from '../services/checklistService';

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  plans:         [],
  currentPlan:   null,
  destinations:  [],
  activities:    [],
  expenses:      [],
  checklist:     [],
  budgetSummary: null,
  loading:       false,
  error:         null,
};

// ── Action Types ──────────────────────────────────────────────────────────────
const ACTION = {
  SET_LOADING:  'SET_LOADING',
  SET_ERROR:    'SET_ERROR',
  CLEAR_ERROR:  'CLEAR_ERROR',

  SET_PLANS:    'SET_PLANS',
  ADD_PLAN:     'ADD_PLAN',
  UPDATE_PLAN:  'UPDATE_PLAN',
  REMOVE_PLAN:  'REMOVE_PLAN',

  SET_CURRENT_PLAN: 'SET_CURRENT_PLAN',

  SET_DESTINATIONS:   'SET_DESTINATIONS',
  ADD_DESTINATION:    'ADD_DESTINATION',
  UPDATE_DESTINATION: 'UPDATE_DESTINATION',
  REMOVE_DESTINATION: 'REMOVE_DESTINATION',

  SET_ACTIVITIES:   'SET_ACTIVITIES',
  ADD_ACTIVITY:     'ADD_ACTIVITY',
  UPDATE_ACTIVITY:  'UPDATE_ACTIVITY',
  REMOVE_ACTIVITY:  'REMOVE_ACTIVITY',

  SET_EXPENSES:   'SET_EXPENSES',
  ADD_EXPENSE:    'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  REMOVE_EXPENSE: 'REMOVE_EXPENSE',

  SET_CHECKLIST:         'SET_CHECKLIST',
  ADD_CHECKLIST_ITEM:    'ADD_CHECKLIST_ITEM',
  UPDATE_CHECKLIST_ITEM: 'UPDATE_CHECKLIST_ITEM',
  REMOVE_CHECKLIST_ITEM: 'REMOVE_CHECKLIST_ITEM',

  SET_BUDGET_SUMMARY: 'SET_BUDGET_SUMMARY',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const sortActivities = (acts) =>
  [...acts].sort((a, b) => {
    const d = new Date(a.date) - new Date(b.date);
    return d !== 0 ? d : a.time.localeCompare(b.time);
  });

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTION.SET_LOADING:      return { ...state, loading: payload };
    case ACTION.SET_ERROR:        return { ...state, error: payload, loading: false };
    case ACTION.CLEAR_ERROR:      return { ...state, error: null };

    case ACTION.SET_PLANS:        return { ...state, plans: payload, loading: false };
    case ACTION.ADD_PLAN:         return { ...state, plans: [...state.plans, payload] };
    case ACTION.UPDATE_PLAN:      return {
      ...state,
      plans:       state.plans.map(p => p.id === payload.id ? payload : p),
      currentPlan: payload,
    };
    case ACTION.REMOVE_PLAN:      return { ...state, plans: state.plans.filter(p => p.id !== payload) };

    case ACTION.SET_CURRENT_PLAN: return { ...state, currentPlan: payload, loading: false };

    case ACTION.SET_DESTINATIONS:   return { ...state, destinations: payload };
    case ACTION.ADD_DESTINATION:    return { ...state, destinations: [...state.destinations, payload] };
    case ACTION.UPDATE_DESTINATION: return { ...state, destinations: state.destinations.map(d => d.id === payload.id ? payload : d) };
    case ACTION.REMOVE_DESTINATION: return { ...state, destinations: state.destinations.filter(d => d.id !== payload) };

    case ACTION.SET_ACTIVITIES:   return { ...state, activities: sortActivities(payload) };
    case ACTION.ADD_ACTIVITY:     return { ...state, activities: sortActivities([...state.activities, payload]) };
    case ACTION.UPDATE_ACTIVITY:  return { ...state, activities: sortActivities(state.activities.map(a => a.id === payload.id ? payload : a)) };
    case ACTION.REMOVE_ACTIVITY:  return { ...state, activities: state.activities.filter(a => a.id !== payload) };

    case ACTION.SET_EXPENSES:   return { ...state, expenses: payload };
    case ACTION.ADD_EXPENSE:    return { ...state, expenses: [...state.expenses, payload] };
    case ACTION.UPDATE_EXPENSE: return { ...state, expenses: state.expenses.map(e => e.id === payload.id ? payload : e) };
    case ACTION.REMOVE_EXPENSE: return { ...state, expenses: state.expenses.filter(e => e.id !== payload) };

    case ACTION.SET_CHECKLIST:         return { ...state, checklist: payload };
    case ACTION.ADD_CHECKLIST_ITEM:    return { ...state, checklist: [...state.checklist, payload] };
    case ACTION.UPDATE_CHECKLIST_ITEM: return { ...state, checklist: state.checklist.map(c => c.id === payload.id ? payload : c) };
    case ACTION.REMOVE_CHECKLIST_ITEM: return { ...state, checklist: state.checklist.filter(c => c.id !== payload) };

    case ACTION.SET_BUDGET_SUMMARY: return { ...state, budgetSummary: payload };

    default: return state;
  }
}

// ── Provider — JEDINI export iz ovog fajla ────────────────────────────────────
export const TravelPlanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchUserPlans = useCallback(async (userId) => {
    dispatch({ type: ACTION.SET_LOADING, payload: true });
    try {
      const data = await travelPlanService.getUserPlans(userId);
      dispatch({ type: ACTION.SET_PLANS, payload: data });
    } catch {
      dispatch({ type: ACTION.SET_ERROR, payload: 'Greška pri učitavanju planova.' });
    }
  }, []);

  const fetchPlan = useCallback(async (id) => {
    dispatch({ type: ACTION.SET_LOADING, payload: true });
    try {
      const [plan, dests, acts, exps, check] = await Promise.all([
        travelPlanService.getPlan(id),
        destinationService.getPlanDestinations(id),
        activityService.getPlanActivities(id),
        expenseService.getPlanExpenses(id),
        checklistService.getPlanItems(id),
      ]);
      dispatch({ type: ACTION.SET_CURRENT_PLAN,  payload: plan  });
      dispatch({ type: ACTION.SET_DESTINATIONS,  payload: dests });
      dispatch({ type: ACTION.SET_ACTIVITIES,    payload: acts  });
      dispatch({ type: ACTION.SET_EXPENSES,      payload: exps  });
      dispatch({ type: ACTION.SET_CHECKLIST,     payload: check });
      const summary = await expenseService.getBudgetSummary(id, plan.budget);
      dispatch({ type: ACTION.SET_BUDGET_SUMMARY, payload: summary });
    } catch {
      dispatch({ type: ACTION.SET_ERROR, payload: 'Greška pri učitavanju plana.' });
    }
  }, []);

  const createPlan = async (data) => {
    const plan = await travelPlanService.createPlan(data);
    dispatch({ type: ACTION.ADD_PLAN, payload: plan });
    return plan;
  };

  const updatePlan = async (id, data) => {
    const updated = await travelPlanService.updatePlan(id, data);
    dispatch({ type: ACTION.UPDATE_PLAN, payload: updated });
    return updated;
  };

  const deletePlan = async (id) => {
    await travelPlanService.deletePlan(id);
    dispatch({ type: ACTION.REMOVE_PLAN, payload: id });
  };

  const addDestination = async (data) => {
    const dest = await destinationService.createDestination(data);
    dispatch({ type: ACTION.ADD_DESTINATION, payload: dest });
    return dest;
  };

  const updateDestination = async (id, data) => {
    const updated = await destinationService.updateDestination(id, data);
    dispatch({ type: ACTION.UPDATE_DESTINATION, payload: updated });
    return updated;
  };

  const removeDestination = async (id) => {
    await destinationService.deleteDestination(id);
    dispatch({ type: ACTION.REMOVE_DESTINATION, payload: id });
  };

  const addActivity = async (data) => {
    const act = await activityService.createActivity(data);
    dispatch({ type: ACTION.ADD_ACTIVITY, payload: act });
    return act;
  };

  const updateActivity = async (id, data) => {
    const updated = await activityService.updateActivity(id, data);
    dispatch({ type: ACTION.UPDATE_ACTIVITY, payload: updated });
    return updated;
  };

  const removeActivity = async (id) => {
    await activityService.deleteActivity(id);
    dispatch({ type: ACTION.REMOVE_ACTIVITY, payload: id });
  };

  const addExpense = async (data, planBudget) => {
    const exp = await expenseService.createExpense(data);
    dispatch({ type: ACTION.ADD_EXPENSE, payload: exp });
    const summary = await expenseService.getBudgetSummary(data.travelPlanId, planBudget);
    dispatch({ type: ACTION.SET_BUDGET_SUMMARY, payload: summary });
    return exp;
  };

  const updateExpense = async (id, data, travelPlanId, planBudget) => {
    const updated = await expenseService.updateExpense(id, data);
    dispatch({ type: ACTION.UPDATE_EXPENSE, payload: updated });
    const summary = await expenseService.getBudgetSummary(travelPlanId, planBudget);
    dispatch({ type: ACTION.SET_BUDGET_SUMMARY, payload: summary });
    return updated;
  };

  const removeExpense = async (id, travelPlanId, planBudget) => {
    await expenseService.deleteExpense(id);
    dispatch({ type: ACTION.REMOVE_EXPENSE, payload: id });
    const summary = await expenseService.getBudgetSummary(travelPlanId, planBudget);
    dispatch({ type: ACTION.SET_BUDGET_SUMMARY, payload: summary });
  };

  const addChecklistItem = async (data) => {
    const item = await checklistService.createItem(data);
    dispatch({ type: ACTION.ADD_CHECKLIST_ITEM, payload: item });
    return item;
  };

  const toggleChecklistItem = async (id) => {
    const updated = await checklistService.toggleItem(id);
    dispatch({ type: ACTION.UPDATE_CHECKLIST_ITEM, payload: updated });
    return updated;
  };

  const removeChecklistItem = async (id) => {
    await checklistService.deleteItem(id);
    dispatch({ type: ACTION.REMOVE_CHECKLIST_ITEM, payload: id });
  };

  const clearError = () => dispatch({ type: ACTION.CLEAR_ERROR });

  return (
    <TravelPlanContext.Provider value={{
      ...state,
      fetchUserPlans,
      fetchPlan,
      createPlan,
      updatePlan,
      deletePlan,
      addDestination,
      updateDestination,
      removeDestination,
      addActivity,
      updateActivity,
      removeActivity,
      addExpense,
      updateExpense,
      removeExpense,
      addChecklistItem,
      toggleChecklistItem,
      removeChecklistItem,
      clearError,
    }}>
      {children}
    </TravelPlanContext.Provider>
  );
};
