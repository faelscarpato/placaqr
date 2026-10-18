import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Store, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdminPlaceholder: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Fase 1 Concluída
        </span>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-3xl bg-blue-50 text-blue-600 shadow-sm border border-blue-200">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-slate-600 text-sm">
            Placeholder do painel operacional da Placa QR.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              Placas
            </span>
            <p className="text-xl font-bold text-slate-900">Em estoque</p>
            <p className="text-[11px] text-slate-400">Aguardando ativação</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              Empresas
            </span>
            <p className="text-xl font-bold text-slate-900">0 ativas</p>
            <p className="text-[11px] text-slate-400">Fase 2 com Supabase</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-lg shadow-blue-900/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Sparkles className="w-4 h-4 text-blue-300" />
            Próximos Passos (Fase 2)
          </div>
          <ul className="text-xs space-y-2 text-blue-100">
            <li>• Autenticação Supabase (email / senha admin)</li>
            <li>• Leitura de QR Code via câmera (BarcodeDetector / html5-qrcode)</li>
            <li>• Ativação de placa e vínculo ao link de avaliação do Google</li>
            <li>• Métricas de scans com geolocalização e relatórios para WhatsApp</li>
          </ul>
        </div>

        <Link
          to="/"
          className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center cursor-pointer"
        >
          Retornar ao Início
        </Link>
      </main>

      <footer className="max-w-md mx-auto w-full pb-4 text-center text-xs text-slate-400">
        Placa QR • Painel Administrativo
      </footer>
    </div>
  );
};
