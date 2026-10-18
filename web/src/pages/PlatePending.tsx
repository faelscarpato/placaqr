import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminAuthHeaders } from '../lib/supabase';
import { 
  AlertCircle, 
  QrCode, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles 
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

export const PlatePending: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const cleanCode = (code || '').trim().toUpperCase();

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Estados para formulário de ativação rápida se for admin
  const [reviewUrl, setReviewUrl] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('new');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [saleAmount, setSaleAmount] = useState('150.00');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      getAdminAuthHeaders().then((headers) => {
        fetch('/api/admin/companies', { headers })
          .then((r) => (r.ok ? r.json() : []))
          .then((data) => setCompanies(data || []))
          .catch(() => {});
      });
    }
  }, [isAdmin]);

  const handleTestLink = () => {
    if (!reviewUrl) return;
    const formatted = reviewUrl.startsWith('http') ? reviewUrl : `https://${reviewUrl}`;
    window.open(formatted, '_blank', 'noopener,noreferrer');
  };

  const handleQuickActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reviewUrl.trim()) {
      setErrorMsg('Informe a URL de avaliação do Google.');
      return;
    }

    setSubmitting(true);
    try {
      const headers = await getAdminAuthHeaders();
      const payload: any = {
        code: cleanCode,
        review_url: reviewUrl.trim().startsWith('http') ? reviewUrl.trim() : `https://${reviewUrl.trim()}`,
        sale_amount: parseFloat(saleAmount) || null,
        payment_method: paymentMethod,
      };

      if (selectedCompanyId !== 'new') {
        payload.company_id = selectedCompanyId;
      } else {
        payload.company_name = companyName.trim();
        payload.company_phone = companyPhone.trim() || null;
        payload.company_city = companyCity.trim() || null;
      }

      const res = await fetch('/api/admin/plates', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao ativar placa.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/placas');
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao ativar placa.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" />
          Início
        </Link>
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-base text-slate-900">Placa QR</span>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8 space-y-6">
        {/* Cabeçalho da Placa */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-3xl bg-amber-50 text-amber-600 shadow-sm border border-amber-200">
            <AlertCircle className="w-12 h-12" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-slate-200 text-slate-800 mb-2">
              {cleanCode || 'SEM-CÓDIGO'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Placa {cleanCode} ainda não ativada
            </h1>
            <p className="text-slate-600 text-xs leading-relaxed px-2 mt-1">
              Esta placa está cadastrada em estoque e aguardando vinculação com o estabelecimento.
            </p>
          </div>
        </div>

        {/* SE FOR ADMIN: MOSTRA FORMULÁRIO DE ATIVAÇÃO RÁPIDA */}
        {isAdmin ? (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-600/30 shadow-lg shadow-blue-600/5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Sessão Admin Detectada — Ativação Rápida
            </div>

            {success ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Placa ativada com sucesso! Redirecionando...
              </div>
            ) : (
              <form onSubmit={handleQuickActivation} className="space-y-3.5">
                {errorMsg && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {errorMsg}
                  </p>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Empresa</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="new">+ Cadastrar Nova Empresa</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {selectedCompanyId === 'new' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Nome da Empresa *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Restaurante Bom Sabor"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        placeholder="Telefone"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={companyCity}
                        onChange={(e) => setCompanyCity(e.target.value)}
                        placeholder="Cidade"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Link de Avaliação do Google *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={reviewUrl}
                      onChange={(e) => setReviewUrl(e.target.value)}
                      placeholder="https://g.page/r/..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestLink}
                      disabled={!reviewUrl}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Pagamento</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? 'Ativando...' : 'Ativar Esta Placa Agora'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* SE NÃO FOR ADMIN: ORIENTAÇÃO */
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <KeyRound className="w-4 h-4 text-blue-600" />
              Área do Vendedor / Administrador
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Se você acabou de vender esta placa, acesse o painel administrativo para vinculá-la ao link de avaliação do Google da empresa.
            </p>
            <Link
              to={`/admin/ativar?code=${cleanCode}`}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
            >
              Fazer Login e Ativar Placa
            </Link>
          </div>
        )}
      </main>

      <footer className="max-w-md mx-auto w-full pb-4 text-center text-xs text-slate-400">
        Placa QR • Status: Em Estoque
      </footer>
    </div>
  );
};
