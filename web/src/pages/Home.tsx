import React from 'react';
import { QrCode, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">Placa QR</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Cloudflare Pages
        </span>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-10 space-y-6 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
          <Smartphone className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Placa QR no ar
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed px-2">
            Sistema de placas de avaliação do Google com QR Code dinâmico e métricas em tempo real.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-left space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Pronto para ativação</p>
              <p className="text-xs text-slate-500">
                Escaneie o QR Code de uma placa em estoque ou acesse o painel administrativo.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            to="/admin"
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Acessar Painel
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/p/TESTE"
            className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-medium text-sm border border-slate-200 shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            Simular leitura de placa (/p/TESTE)
          </Link>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full pb-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Placa QR • Fase 1 Online
      </footer>
    </div>
  );
};
