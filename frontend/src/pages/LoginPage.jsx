import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Plane, Mail, Lock, AlertCircle, MapPin, Calendar, Wallet, CheckSquare } from 'lucide-react';

const FEATURES = [
  { icon: MapPin,       text: 'Plan destinations and routes'    },
  { icon: Calendar,    text: 'Organize activities by day'        },
  { icon: Wallet,      text: 'Track expenses and budget'         },
  { icon: CheckSquare, text: 'Never forget what to pack'         },
];

const LoginPage = () => {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return') || '/dashboard';
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form);
      if (result.success) navigate(returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      else setError(result.message);
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[2fr_3fr]">

      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-white font-bold text-xl">TravelPlanner</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Plan the perfect<br />trip
            </h2>
            <p className="text-white/60 leading-relaxed">
              Everything you need to organize your travel in one place.
            </p>
          </div>
          <div className="space-y-3.5">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3.5">
                <div className="w-8 h-8 bg-sky-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-sky-300" />
                </div>
                <span className="text-white/75 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 pt-2">
            {[['500+', 'Trips'], ['50+', 'Destinations'], ['100%', 'Free']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-white/40 text-xs mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/25 text-xs">© 2026 TravelPlanner</div>
      </div>

      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Plane className="w-6 h-6 text-primary-500" />
            <span className="text-primary-600 font-bold text-lg">TravelPlanner</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back 👋</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Sign in and keep planning</p>
          </div>

          {error && (
            <div className="alert-error mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-lg w-full" disabled={loading}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                : 'Sign in →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-sky-600 font-semibold hover:text-sky-700 transition-colors">
              Sign up for free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
