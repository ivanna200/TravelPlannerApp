import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Plane, Mail, Lock, User, AlertCircle, Check } from 'lucide-react';

const PW_RULES = [
  { test: p => p.length >= 6,    label: 'Minimum 6 karaktera'  },
  { test: p => /[A-Z]/.test(p),  label: 'Jedno veliko slovo'   },
  { test: p => /[0-9]/.test(p),  label: 'Jedan broj'           },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form,      setForm]      = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const strength      = PW_RULES.filter(r => r.test(form.password)).length;
  const strengthColor = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500'][strength - 1] || 'bg-slate-200';
  const strengthLabel = ['', 'Slaba', 'Dobra', 'Jaka'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Lozinka mora imati minimum 6 karaktera.'); return; }
    setLoading(true);
    try {
      const result = await register(form);
      if (result.success) navigate('/dashboard');
      else setError(result.message);
    } catch {
      setError('Greška pri registraciji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[2fr_3fr]">

      {/* ── Lijeva strana — branding ── */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-primary-800 to-sky-600 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-white font-bold text-xl">TravelPlanner</span>
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Počnite planirati<br />svoju avanturu
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Besplatan nalog, neograničeni planovi, savršena organizacija.
            </p>
          </div>
          <div className="space-y-3">
            {['Besplatno zauvijek', 'Neograničeni planovi', 'Dijeljenje s prijateljima', 'Nema kreditne kartice'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-sky-500/30 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-sky-300" />
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-white/25 text-xs">© 2026 TravelPlanner</div>
      </div>

      {/* ── Desna strana — forma ── */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Kreirajte nalog ✈️</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Besplatno i brzo — manje od 1 minute</p>
          </div>

          {error && (
            <div className="alert-error mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Ime</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="input pl-10"
                    placeholder="Ana"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Prezime</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="input"
                  placeholder="Petrović"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email adresa</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input pl-10"
                  placeholder="vas@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Lozinka</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setPwFocused(true)}
                  className="input pl-10"
                  placeholder="Minimum 6 karaktera"
                  required
                />
              </div>
              {form.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColor : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  {strengthLabel && <p className="text-xs text-slate-500">{strengthLabel} lozinka</p>}
                  {pwFocused && (
                    <div className="space-y-1 pt-1">
                      {PW_RULES.map(r => (
                        <div key={r.label} className={`flex items-center gap-2 text-xs ${r.test(form.password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <Check className={`w-3 h-3 ${r.test(form.password) ? 'text-emerald-500' : 'text-slate-300'}`} />
                          {r.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary-lg w-full" disabled={loading}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Kreiranje naloga...</>
                : 'Kreiraj nalog →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Već imate nalog?{' '}
            <Link to="/login" className="text-sky-600 font-semibold hover:text-sky-700 transition-colors">
              Prijavite se →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
