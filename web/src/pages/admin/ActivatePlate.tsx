import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAdminAuthHeaders } from '../../lib/supabase';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  DollarSign, 
  Store, 
  QrCode,
  Building,
  Phone,
  MapPin
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
}

export const ActivatePlate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode.toUpperCase());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('new');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [reviewUrl, setReviewUrl] = useState('');
  const [saleAmount, setSaleAmount] = useState('150.00');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().substring(0, 10));

  const [companies, setCompanies] = useState<Company[]>([]);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  // Carrega empresas existentes para o seletor
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const headers = await getAdminAuthHeaders();
        const res = await fetch('/api/admin/companies', { headers });
        if (res.ok) {
          const data = await res.json();
          setCompanies(data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar empresas:', err);
      }
    };
    fetchCompanies();
  }, []);

  // Extrai o código da URL ou texto escaneado
  const extractCode = (raw: string): string => {
    const text = raw.trim();
    const match = text.match(/\/[rp]\/([A-Za-z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    return text.toUpperCase();
  };

  // Validação dos domínios oficiais do Google Avaliações
  const isValidGoogleReviewUrl = (urlStr: string): boolean => {
    if (!urlStr) return false;
    try {
      const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
      const parsed = new URL(formatted);
      const host = parsed.hostname.toLowerCase();
      return (
        host === 'g.page' ||
        host.endsWith('.g.page') ||
        host === 'g.co' ||
        host.endsWith('.g.co') ||
        host === 'google.com' ||
        host.endsWith('.google.com') ||
        host === 'maps.google.com' ||
        host === 'search.google.com'
      );
    } catch {
      return false;
    }
  };

  // Inicia scanner pela câmera
  const startScanner = async () => {
    setCameraError(null);
    setScanning(true);

    try {
      // Se suportar BarcodeDetector nativo no navegador
      if ('BarcodeDetector' in window) {
        // Tenta usar BarcodeDetector nativo ou Html5Qrcode
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const extracted = extractCode(decodedText);
          setCode(extracted);
          stopScanner();
        },
        () => {
          // Erro de frame normal quando ainda não achou QR
        }
      );
    } catch (err: any) {
      setCameraError('Não foi possível acessar a câmera. Permita o acesso ou digite o código manualmente.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleTestLink = () => {
    if (!reviewUrl) return;
    const formatted = reviewUrl.startsWith('http') ? reviewUrl : `https://${reviewUrl}`;
    window.open(formatted, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Informe o código da placa.');
      return;
    }

    if (!reviewUrl.trim()) {
      setErrorMsg('O link de avaliação do Google é obrigatório.');
      return;
    }

    if (!isValidGoogleReviewUrl(reviewUrl)) {
      setErrorMsg('O link deve ser do Google (g.page, search.google.com, g.co ou google.com).');
      return;
    }

    if (selectedCompanyId === 'new' && !companyName.trim()) {
      setErrorMsg('Informe o nome da nova empresa.');
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
        activated_at: new Date(saleDate + 'T12:00:00Z').toISOString(),
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

      setSuccessMsg(`Placa ${cleanCode} ativada com sucesso! Quem escanear agora será redirecionado para o Google.`);
      setTimeout(() => {
        navigate('/admin/placas');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao submeter ativação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ativar Nova Placa</h1>
        <p className="text-xs text-slate-500">Escaneie o QR da placa física, vincule a empresa e ative o redirecionamento.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BLOCO 1: IDENTIFICAÇÃO DA PLACA COM CÂMERA */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              1. Identificação da Placa
            </span>
            <button
              type="button"
              onClick={scanning ? stopScanner : startScanner}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                scanning ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {scanning ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" />
                  Fechar Câmera
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  Ler com Câmera
                </>
              )}
            </button>
          </div>

          {/* Container do leitor da câmera */}
          {scanning && (
            <div className="rounded-2xl overflow-hidden border border-slate-300 bg-black p-2">
              <div id="qr-reader-container" className="w-full"></div>
              <p className="text-[11px] text-center text-slate-300 py-1">
                Aponte para o QR Code da placa para capturar automaticamente.
              </p>
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              {cameraError}
            </p>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Código da Placa</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(extractCode(e.target.value))}
              placeholder="Ex: DR4ATZDH"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-base font-mono uppercase font-bold tracking-wider outline-none transition"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Pode digitar o código puro ou colar o link completo da placa (ex: /r/DR4ATZDH).
            </span>
          </div>
        </div>

        {/* BLOCO 2: DADOS DA EMPRESA */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-blue-600" />
            2. Empresa / Estabelecimento
          </span>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Empresa</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm font-medium outline-none transition"
            >
              <option value="new">+ Cadastrar Nova Empresa</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.city ? `(${c.city})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedCompanyId === 'new' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome da Empresa *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required={selectedCompanyId === 'new'}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Hamburgueria do Zé"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Cidade</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={companyCity}
                      onChange={(e) => setCompanyCity(e.target.value)}
                      placeholder="São Paulo, SP"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BLOCO 3: LINK DE AVALIAÇÃO DO GOOGLE */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-blue-600" />
            3. Link de Avaliação do Google
          </span>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              URL Direta de Avaliação *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={reviewUrl}
                onChange={(e) => setReviewUrl(e.target.value)}
                placeholder="https://g.page/r/SEU-LINK/review"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition"
              />
              <button
                type="button"
                onClick={handleTestLink}
                disabled={!reviewUrl}
                className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Testar link
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Válidos: g.page/r/..., search.google.com/local/writereview..., g.co ou google.com.
            </span>
          </div>
        </div>

        {/* BLOCO 4: DADOS DA VENDA */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-blue-600" />
            4. Dados da Venda (Controle Financeiro)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Valor da Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                placeholder="150.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm font-medium outline-none transition"
              >
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Boleto">Boleto</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Data da Venda</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm font-medium outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* BOTÃO PRINCIPAL DE ATIVAÇÃO */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Ativando Placa...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Confirmar e Ativar Placa Agora
            </>
          )}
        </button>
      </form>
    </div>
  );
};
