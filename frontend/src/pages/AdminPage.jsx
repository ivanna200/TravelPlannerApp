import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import authService from '../services/authService';
import travelPlanService from '../services/travelPlanService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import {
  ArrowLeft, Settings, Users, Map, ShieldCheck, ShieldOff, Trash2, ExternalLink,
} from 'lucide-react';
import { formatDateRange } from '../utils/formatDate';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);

  const pendingUserDeletesRef = useRef(new Set());
  const pendingPlanDeletesRef = useRef(new Set());
  const userLoadIdRef = useRef(0);
  const planLoadIdRef = useRef(0);

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const loadUsers = useCallback(async (silent = false) => {
    const loadId = ++userLoadIdRef.current;
    try {
      const data = await authService.getAllUsers();
      if (loadId !== userLoadIdRef.current) return;
      setUsers(data.filter(u => !pendingUserDeletesRef.current.has(u.id)));
    } catch {
      if (!silent) showToast('Error loading users.', 'error');
    }
  }, [showToast]);

  const loadPlans = useCallback(async (silent = false) => {
    const loadId = ++planLoadIdRef.current;
    try {
      const data = await travelPlanService.getAllPlans();
      if (loadId !== planLoadIdRef.current) return;
      setPlans(data.filter(p => !pendingPlanDeletesRef.current.has(p.id)));
    } catch {
      if (!silent) showToast('Error loading plans.', 'error');
    }
  }, [showToast]);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    await Promise.all([loadUsers(silent), loadPlans(silent)]);
    if (!silent) setLoading(false);
  }, [loadUsers, loadPlans]);

  useEffect(() => {
    loadAll(false);
    const interval = setInterval(() => loadAll(true), 5000);
    const onFocus = () => loadAll(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadAll]);

  const handleDeleteUserClick = (u) => {
    if (u.id === currentUser.id) {
      showToast('You cannot delete your own account.', 'error');
      return;
    }
    setConfirmModal({
      type: 'user',
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
    });
  };

  const handleDeletePlanClick = (p) => {
    setConfirmModal({
      type: 'plan',
      id: p.id,
      name: p.name,
    });
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'user') {
      const { id } = confirmModal;
      pendingUserDeletesRef.current.add(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setPlans(prev => prev.filter(p => p.userId !== id));
      try {
        await authService.deleteUser(id);
        userLoadIdRef.current++;
        planLoadIdRef.current++;
        showToast('User deleted successfully.');
      } catch {
        pendingUserDeletesRef.current.delete(id);
        loadUsers(true);
        loadPlans(true);
        showToast('Error deleting user.', 'error');
      } finally {
        pendingUserDeletesRef.current.delete(id);
      }
    } else {
      const { id } = confirmModal;
      pendingPlanDeletesRef.current.add(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      try {
        await travelPlanService.deletePlan(id);
        planLoadIdRef.current++;
        showToast('Plan deleted successfully.');
      } catch {
        pendingPlanDeletesRef.current.delete(id);
        loadPlans(true);
        showToast('Error deleting plan.', 'error');
      } finally {
        pendingPlanDeletesRef.current.delete(id);
      }
    }
    setConfirmModal(null);
  };

  const handleRole = async (id, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
    try {
      const updated = await authService.changeRole(id, newRole);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: updated.role } : u));
      showToast(`Role changed to ${newRole} successfully.`);
    } catch {
      showToast('Error changing role.', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.type === 'user' ? 'Delete user?' : 'Delete plan?'}
          message={
            confirmModal.type === 'user'
              ? `Delete user "${confirmModal.name}"? All their travel plans and related data will also be removed. This action cannot be undone.`
              : `Delete plan "${confirmModal.name}"? All destinations, activities, expenses and checklist items will also be removed. This action cannot be undone.`
          }
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmModal(null)}
        />
      )}

      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-sm mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary-500" />
        </div>
        <div>
          <h1 className="text-slate-900 text-xl">Admin panel</h1>
          <p className="text-slate-500 text-sm">Manage users and system content</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { id: 'users', label: 'Users', icon: Users, count: users.length },
          { id: 'plans', label: 'All plans', icon: Map, count: plans.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border
              ${tab === id
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Icon className="w-4 h-4" />{label}
            <span className="badge-neutral text-xs">{count}</span>
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              <h2 className="text-slate-800">Users</h2>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="empty-state py-10">
              <Users className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No registered users.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['ID', 'User', 'Email', 'Role', 'Actions'].map((h, i) => (
                      <th key={h} className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">#{u.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-500">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={u.role === 'Admin' ? 'badge-warning' : 'badge-sky'}>{u.role}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRole(u.id, u.role)}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border
                              ${u.role === 'Admin'
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'}`}
                          >
                            {u.role === 'Admin'
                              ? <><ShieldOff className="w-3.5 h-3.5" />→ User</>
                              : <><ShieldCheck className="w-3.5 h-3.5" />→ Admin</>}
                          </button>
                          <button
                            onClick={() => handleDeleteUserClick(u)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'plans' && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-slate-400" />
              <h2 className="text-slate-800">All travel plans</h2>
            </div>
          </div>

          {plans.length === 0 ? (
            <div className="empty-state py-10">
              <Map className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No travel plans in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['ID', 'Plan', 'Owner', 'Period', 'Budget', 'Actions'].map((h, i) => (
                      <th key={h} className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {plans.map(p => {
                    const owner = userMap[p.userId];
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">#{p.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="text-sm font-semibold text-slate-800">{p.name}</div>
                          {p.description && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-500">
                          {owner ? `${owner.firstName} ${owner.lastName}` : `User #${p.userId}`}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDateRange(p.startDate, p.endDate)}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-semibold text-emerald-600">{p.budget?.toLocaleString()} €</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/plan/${p.id}`}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />Open
                            </Link>
                            <button
                              onClick={() => handleDeletePlanClick(p)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
