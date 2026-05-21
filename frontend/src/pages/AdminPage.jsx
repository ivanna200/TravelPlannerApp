import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import authService  from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal   from '../components/ConfirmModal';
import { ArrowLeft, Settings, Users, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast }         = useToast();
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch {
      showToast('Error loading users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteClick = (u) => {
    if (u.id === currentUser.id) {
      showToast('You cannot delete your own account.', 'error');
      return;
    }
    setConfirmModal({ id: u.id, name: `${u.firstName} ${u.lastName}` });
  };

  const handleDeleteConfirmed = async (id) => {
    try {
      await authService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User deleted successfully.');
    } catch {
      showToast('Error deleting user.', 'error');
    }
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
          title="Delete user?"
          message={`Delete user "${confirmModal.name}"? All their travel plans and related data will also be removed. This action cannot be undone.`}
          onConfirm={() => handleDeleteConfirmed(confirmModal.id)}
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
          <p className="text-slate-500 text-sm">Manage system users</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-slate-800">Users</h2>
          </div>
          <span className="badge-neutral">{users.length} total</span>
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
                    <th
                      key={h}
                      className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
                    >
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
                        <span className="text-sm font-semibold text-slate-800">
                          {u.firstName} {u.lastName}
                        </span>
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
                          onClick={() => handleDeleteClick(u)}
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
    </div>
  );
};

export default AdminPage;
