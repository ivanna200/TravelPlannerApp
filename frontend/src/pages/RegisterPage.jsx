import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(form);
      if (result.success) navigate('/dashboard');
      else setError(result.message);
    } catch {
      setError('Greška pri registraciji. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✈️</div>
          <h1 className="text-3xl font-bold text-blue-700">TravelPlanner</h1>
          <p className="text-slate-500 mt-2">Kreirajte besplatan nalog</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Registracija</h2>

          {error && <div className="error-box mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Ime</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" placeholder="Ana" required />
              </div>
              <div>
                <label className="label">Prezime</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" placeholder="Petrović" required />
              </div>
            </div>
            <div>
              <label className="label">Email adresa</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="vas@email.com" required />
            </div>
            <div>
              <label className="label">Lozinka</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Minimum 6 karaktera" required />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base mt-2" disabled={loading}>
              {loading ? '⏳ Registracija...' : 'Kreiraj nalog'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Već imate nalog?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Prijavite se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;