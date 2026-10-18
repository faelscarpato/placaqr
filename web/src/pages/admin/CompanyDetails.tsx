import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminAuthHeaders } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Smartphone, 
  Clock, 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers,
  Sparkles
} from 'lucide-react';

interface AnalyticsData {
  company: {
    id: string;
    name: string;
    phone: string | null;
    city: string | null;
    created_at: string;
  };
  plates: Array<{
    id: string;
    code: string;
    status: string;
    review_url: string | null;
    sale_amount: number | null;
    payment_method: string | null;
    activated_at: string | null;
  }>;
  scans_by_day: Array<{
    dia: string;
    total: number;
  }>;
  peak_hours: Array<{
    hora: number;
    total: number;
  }>;
  devices: Array<{
    dispositivo: string;
    total: number;
  }>;
}

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const headers = await getAdminAuthHeaders();
        const res = await fetch(`/api/admin/companies/${id}`, { headers });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erro ao carregar dados da empresa.');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Falha ao buscar dados.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Carregando métricas da empresa...</p>
      </div>
    );
  }

  if (error || !data || !data.company) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
        <p className="text-sm font-bold text-slate-800">Empresa não encontrada ou erro de carregamento.</p>
        <p className="text-xs text-slate-500">{error}</p>
        <Link to="/admin" className="inline-block text-xs font-semibold text-blue-600 hover:underline">
          &larr; Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const { company, plates, scans_by_day, peak_hours, devices } = data;
  const totalScans = scans_by_day.reduce((acc, curr) => acc + Number(curr.total), 0);
  const maxDayScans = Math.max(...scans_by_day.map((d) => Number(d.total)), 1);

  // Geração de Relatório para WhatsApp
  const generateWhatsAppReport = (): string => {
    const platesCodes = plates.map((p) => p.code).join(', ') || 'Nenhuma';
    const topDevice = devices.length > 0 ? devices[0].dispositivo : 'Mobile';

    return `📊 *Relatório de Desempenho — Placa QR*
🏢 *Empresa:* ${company.name}
📍 *Cidade:* ${company.city || 'Não informada'}
🏷️ *Placas:* ${platesCodes}

📈 *Métricas dos Últimos 30 Dias:*
• *Total de Scans:* ${totalScans} acessos
• *Dispositivo Mais Utilizado:* ${topDevice}
• *Status das Placas:* ${plates.filter((p) => p.status === 'active').length} ativas

⭐ _Cada scan representa um cliente que acessou seu link de avaliação do Google diretamente na loja!_

Equipe Placa QR • www.placaqr.pages.dev`;
  };

  const handleCopyReport = () => {
    const text = generateWhatsAppReport();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppReport());
    const phone = company.phone ? company.phone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{company.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{company.city || 'Cidade não cadastrada'}</span>
              <span>•</span>
              <span>{company.phone || 'Sem telefone'}</span>
            </p>
          </div>
        </div>

        {/* Botão Gerar Relatório para WhatsApp */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Share2 className="w-4 h-4" />
          Gerar Relatório (WhatsApp)
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total de Scans</span>
          <p className="text-2xl font-black text-blue-600">{totalScans}</p>
          <p className="text-[11px] text-slate-400">Últimos 30 dias</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Placas Ativas</span>
          <p className="text-2xl font-black text-emerald-600">
            {plates.filter((p) => p.status === 'active').length}
          </p>
          <p className="text-[11px] text-slate-400">De {plates.length} cadastradas</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Dispositivo Principal</span>
          <p className="text-xl font-bold text-slate-800">
            {devices.length > 0 ? devices[0].dispositivo : 'Nenhum'}
          </p>
          <p className="text-[11px] text-slate-400">Origem mais frequente</p>
        </div>
      </div>

      {/* GRÁFICO DE SCANS POR DIA (30 DIAS) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-base text-slate-900">Scans por Dia (Últimos 30 dias)</h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{totalScans} acessos</span>
        </div>

        {scans_by_day.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Nenhum scan registrado nos últimos 30 dias para esta empresa.
          </p>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="h-44 flex items-end gap-1.5 sm:gap-2 px-1 border-b border-slate-100 pb-2 overflow-x-auto">
              {scans_by_day.map((day, idx) => {
                const heightPercent = Math.max((Number(day.total) / maxDayScans) * 100, 8);
                const shortDate = day.dia.substring(8, 10) + '/' + day.dia.substring(5, 7);
                return (
                  <div key={idx} className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group relative">
                    {/* Tooltip com total do dia */}
                    <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded font-mono z-10 whitespace-nowrap">
                      {day.dia}: {day.total} scans
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all cursor-pointer"
                    ></div>
                    <span className="text-[10px] text-slate-400 font-mono scale-90">{shortDate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* HORÁRIOS DE PICO E DISPOSITIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Horários de Pico */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Horários de Pico (Scans)</h3>
          </div>

          {peak_hours.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Sem dados de horários ainda.</p>
          ) : (
            <div className="space-y-2">
              {peak_hours.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600">{String(h.hora).padStart(2, '0')}:00h - {String(h.hora).padStart(2, '0')}:59h</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.min((Number(h.total) / (totalScans || 1)) * 100, 100)}%` }}
                        className="bg-blue-600 h-full rounded-full"
                      ></div>
                    </div>
                    <span className="font-bold text-slate-800 w-8 text-right">{h.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispositivos */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Dispositivos</h3>
          </div>

          {devices.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Sem dados de dispositivos.</p>
          ) : (
            <div className="space-y-2">
              {devices.map((d, i) => {
                const percent = Math.round((Number(d.total) / (totalScans || 1)) * 100);
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{d.dispositivo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{percent}%</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {d.total}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PLACAS DA EMPRESA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-base text-slate-900">Placas Vinculadas</h2>
          </div>
          <Link
            to="/admin/ativar"
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            + Vincular Nova Placa
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {plates.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900">{p.code}</span>
                <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {p.status}
                </span>
                {p.review_url && (
                  <a
                    href={p.review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {p.review_url}
                  </a>
                )}
              </div>
              <a
                href={`/r/${p.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Testar /r/{p.code}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DO RELATÓRIO DO WHATSAPP */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Relatório para WhatsApp</h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Texto pronto e formatado com as métricas do cliente para você enviar pelo WhatsApp:
            </p>

            <textarea
              readOnly
              rows={10}
              value={generateWhatsAppReport()}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed outline-none resize-none"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCopyReport}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Abrir no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
