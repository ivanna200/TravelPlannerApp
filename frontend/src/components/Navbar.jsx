import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Plane, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) return null;

  const navLink = (to, Icon, label) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${location.pathname === to
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );

  return (
    <nav className="bg-primary-500 sticky top-0 z-40 border-b border-primary-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Plane className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
              TravelPlanner
            </span>
          </Link>

          {/* Center nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLink('/dashboard', LayoutDashboard, 'Dashboard')}
              {isAdmin() && navLink('/admin', Settings, 'Admin')}
            </div>
          )}

          {/* User dropdown */}
          {user && (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-white text-sm font-semibold leading-tight">{user.firstName}</div>
                  <div className="text-white/50 text-xs">{user.role}</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-modal border border-slate-100 py-2 animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="font-semibold text-slate-900 text-sm">{user.firstName} {user.lastName}</div>
                    <div className="text-slate-500 text-xs truncate">{user.email}</div>
                    <span className={`badge mt-1.5 ${user.role === 'Admin' ? 'badge-warning' : 'badge-sky'}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link to="/dashboard" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Settings className="w-4 h-4 text-slate-400" />
                        Admin panel
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
