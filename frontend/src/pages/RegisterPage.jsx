import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Plane, Mail, Lock, User, AlertCircle, Check } from 'lucide-react';

const PW_RULES = [
  { test: p => p.length >= 6,    label: 'At least 6 characters'  },
  { test: p => /[A-Z]/.test(p),  label: 'One uppercase letter'   },
  { test: p => /[0-9]/.test(p),  label: 'One number'             },
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
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!PW_RULES.every(r => r.test(form.password))) {
      setError('Password must meet all requirements below.');
      return;
    }
    setLoading(true);
    try {
      const result = await register(form);
      if (result.success) navigate('/dashboard');
      else setError(result.message);
    } catch {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[2fr_3fr]">

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
              Start planning<br />your adventure
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Free account, unlimited plans, perfect organization.
            </p>
          </div>
          <div className="space-y-3">
            {['Free forever', 'Unlimited plans', 'Share with friends', 'No credit card required'].map(item => (
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

      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Create an account ✈️</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Free and fast — under 1 minute</p>
          </div>

          {error && (
            <div className="alert-error mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="input pl-10"
                    placeholder="Anna"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Last name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="input"
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input pl-10"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setPwFocused(true)}
                  className="input pl-10"
                  placeholder="At least 6 characters"
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
                  {strengthLabel && <p className="text-xs text-slate-500">{strengthLabel} password</p>}
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
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
                : 'Create account →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-semibold hover:text-sky-700 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
