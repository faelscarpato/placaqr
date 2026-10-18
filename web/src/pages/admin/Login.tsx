import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error);
    } else {
      navigate(from, { replace: true });
    }
  };

  const fillAdminCredentials = () => {
    setEmail('scarpatoweb@gmail.com');
    setPassword('Rs9546@Fael');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">Placa QR</span>
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Acesso Restrito
        </span>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Login Administrativo</h1>
            <p className="text-xs text-slate-500">
              Entre com suas credenciais do Supabase Auth para gerenciar as placas.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Atalho rápido de preenchimento para admin cadastrado */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Preencher credenciais de Administrador
            </button>
          </div>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full pb-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Placa QR • Painel de Controle
      </footer>
    </div>
  );
};
