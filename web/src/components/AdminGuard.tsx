import React from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Layers, LogOut, QrCode } from 'lucide-react';

export const AdminGuard: React.FC = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base leading-none block">Placa QR</span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block mt-0.5">Admin</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 sm:px-6 flex-1 mb-16 sm:mb-0">
        <Outlet />
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2 px-4 sm:hidden">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              isActive('/admin') ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[11px] mt-1">Visão Geral</span>
          </Link>

          <Link
            to="/admin/ativar"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              isActive('/admin/ativar') ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[11px] mt-1">Ativar Placa</span>
          </Link>

          <Link
            to="/admin/placas"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              isActive('/admin/placas') ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[11px] mt-1">Placas</span>
          </Link>
        </div>
      </nav>

      {/* Desktop Top Links (quando em tela maior) */}
      <footer className="hidden sm:block border-t border-slate-200 py-4 bg-white text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
          <div className="flex gap-4">
            <Link to="/admin" className="hover:text-blue-600 font-medium">Dashboard</Link>
            <Link to="/admin/ativar" className="hover:text-blue-600 font-medium">Ativar Placa</Link>
            <Link to="/admin/placas" className="hover:text-blue-600 font-medium">Gerenciar Placas</Link>
            <Link to="/" target="_blank" className="hover:text-blue-600 font-medium">Página Pública ↗</Link>
          </div>
          <span>Placa QR • Painel Operacional</span>
        </div>
      </footer>
    </div>
  );
};
