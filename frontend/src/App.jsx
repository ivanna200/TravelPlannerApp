import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }       from './context/AuthContext';
import { TravelPlanProvider } from './context/TravelPlanContext';
import { ToastProvider }      from './context/ToastContext';
import ErrorBoundary      from './components/ErrorBoundary';
import Navbar             from './components/Navbar';
import ProtectedRoute     from './components/ProtectedRoute';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import DashboardPage      from './pages/DashboardPage';
import TravelPlanDetailPage from './pages/TravelPlanDetailPage';
import CreateTravelPlanPage from './pages/CreateTravelPlanPage';
import EditTravelPlanPage   from './pages/EditTravelPlanPage';
import SharedPlanPage     from './pages/SharedPlanPage';
import AdminPage          from './pages/AdminPage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <TravelPlanProvider>
            <ToastProvider>
              <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/"             element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login"         element={<LoginPage />} />
                    <Route path="/register"      element={<RegisterPage />} />
                    <Route path="/shared/:token" element={<SharedPlanPage />} />
                    <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/create-plan"   element={<ProtectedRoute><CreateTravelPlanPage /></ProtectedRoute>} />
                    <Route path="/plan/:id"      element={<ProtectedRoute><TravelPlanDetailPage /></ProtectedRoute>} />
                    <Route path="/edit-plan/:id" element={<ProtectedRoute><EditTravelPlanPage /></ProtectedRoute>} />
                    <Route path="/admin"         element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                    <Route path="*"              element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
                <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400 font-medium">
                  © 2026 TravelPlanner — Planirajte putovanja s lakoćom ✈️
                </footer>
              </div>
            </ToastProvider>
          </TravelPlanProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
