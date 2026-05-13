import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch { setError('Greška pri učitavanju korisnika.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati korisnika i sve njegove podatke? Ova akcija se ne može poništiti.')) return;
    try {
      await authService.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      setMessage('Korisnik uspješno obrisan.');
      setTimeout(() => setMessage(''), 3000);
    } catch { setError('Greška pri brisanju.'); }
  };

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
    if (!window.confirm(`Promijeniti ulogu korisnika u ${newRole}?`)) return;
    try {
      const updated = await authService.changeRole(id, JSON.stringify(newRole));
      setUsers(users.map((u) => (u.id === id ? { ...u, role: updated.role } : u)));
      setMessage(`Uloga promijenjena u ${newRole}.`);
      setTimeout(() => setMessage(''), 3000);
    } catch { setError('Greška pri promjeni uloge.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-slate-500 hover:text-slate-700 transition-colors text-sm">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Admin panel</h1>
      </div>

      {error && <div className="error-box mb-4">{error}</div>}
      {message && <div className="success-box mb-4">{message}</div>}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Korisnici sistema</h2>
          <span className="badge bg-slate-100 text-slate-600">{users.length} korisnika</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Korisnik</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Uloga</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-500">#{u.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {u.firstName?.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${u.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleRoleChange(u.id, u.role)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${u.role === 'Admin' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}>
                        {u.role === 'Admin' ? '→ User' : '→ Admin'}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 hover:bg-red-200 text-red-700 transition-colors">
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;