import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, QrCode, ArrowLeft, KeyRound } from 'lucide-react';

export const PlatePending: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-base text-slate-900">Placa QR</span>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8 space-y-6 text-center">
        <div className="inline-flex p-4 rounded-3xl bg-amber-50 text-amber-600 shadow-sm border border-amber-200">
          <AlertCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase bg-slate-200 text-slate-800">
            {code || 'SEM-CODIGO'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Placa {code} ainda não ativada
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed px-2">
            Esta placa está cadastrada em estoque e aguardando vinculação com o link de avaliação do Google da empresa.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <KeyRound className="w-4 h-4 text-blue-600" />
            Ativação para o Lojista / Admin
          </div>
          <p className="text-xs text-slate-600">
            Se você é o administrador ou realizou a venda desta placa, acesse o painel para cadastrar o estabelecimento e ativar os redirecionamentos.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            to="/admin"
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Acessar Painel para Ativar
          </Link>
          <Link
            to="/"
            className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-medium text-sm border border-slate-200 shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            Página Inicial
          </Link>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full pb-4 text-center text-xs text-slate-400">
        Status: Em Estoque • Redirecionamento Dinâmico
      </footer>
    </div>
  );
};
