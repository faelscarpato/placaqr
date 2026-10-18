import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAuthHeaders } from '../../lib/supabase';
import { 
  Package, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  Store, 
  ChevronRight, 
  Smartphone, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface DashboardMetrics {
  plates_stock: number;
  plates_active: number;
  plates_disabled: number;
  sold_this_month: number;
  total_companies: number;
  scans_today: number;
  scans_7d: number;
  scans_30d: number;
}

interface CompanyItem {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  plates: [{ count: number }] | { count: number };
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminAuthHeaders();

      // Busca métricas consolidadas
      const metricsRes = await fetch('/api/admin/metrics', { headers });
      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData);
      } else {
        const err = await metricsRes.json();
        setError(err.error || 'Erro ao carregar métricas');
      }

      // Busca empresas
      const compRes = await fetch('/api/admin/companies', { headers });
      if (compRes.ok) {
        const cData = await compRes.json();
        setCompanies(cData || []);
      }
    } catch (err: any) {
      setError(err.message || 'Falha de conexão com a API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Atualizando métricas do sistema...</p>
      </div>
    );
  }

  const getCompanyPlatesCount = (comp: CompanyItem): number => {
    if (Array.isArray(comp.plates) && comp.plates.length > 0) {
      return comp.plates[0].count;
    }
    if (typeof comp.plates === 'object' && comp.plates && 'count' in comp.plates) {
      return (comp.plates as any).count;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Boas-vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Visão Geral</h1>
          <p className="text-xs text-slate-500">Métricas de estoque, ativações e telemetria de scans.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/ativar"
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Ativar Nova Placa
          </Link>
          <Link
            to="/admin/placas"
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            Ver Todas
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {/* Grid de Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Em Estoque */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estoque</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{metrics?.plates_stock ?? 0}</p>
          <p className="text-[11px] text-slate-500">Placas disponíveis</p>
        </div>

        {/* Card 2: Ativas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ativas</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{metrics?.plates_active ?? 0}</p>
          <p className="text-[11px] text-slate-500">Redirecionando scans</p>
        </div>

        {/* Card 3: Vendas do Mês */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mês Atual</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600">{metrics?.sold_this_month ?? 0}</p>
          <p className="text-[11px] text-slate-500">Vendidas no mês</p>
        </div>

        {/* Card 4: Empresas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Empresas</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{metrics?.total_companies ?? 0}</p>
          <p className="text-[11px] text-slate-500">Clientes cadastrados</p>
        </div>
      </div>

      {/* Seção de Métricas de Scans */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-900/15">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-300" />
            <h2 className="font-bold text-base text-white">Telemetria de Scans</h2>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-800/60 text-blue-200 border border-blue-700/60">
            Tempo Real
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <span className="text-[11px] text-blue-200 font-medium block">Hoje</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">
              {metrics?.scans_today ?? 0}
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <span className="text-[11px] text-blue-200 font-medium block">Últimos 7 dias</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">
              {metrics?.scans_7d ?? 0}
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <span className="text-[11px] text-blue-200 font-medium block">Últimos 30 dias</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">
              {metrics?.scans_30d ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Empresas Cadastradas */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-base text-slate-900">Empresas e Clientes</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{companies.length} cadastradas</span>
        </div>

        {companies.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Store className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Nenhuma empresa cadastrada ainda. Ative a primeira placa para associar o estabelecimento.
            </p>
            <Link
              to="/admin/ativar"
              className="inline-flex py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Ativar Placa Agora
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {companies.map((comp) => {
              const count = getCompanyPlatesCount(comp);
              return (
                <Link
                  key={comp.id}
                  to={`/admin/empresas/${comp.id}`}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition group"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                      {comp.name}
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </p>
                    <p className="text-xs text-slate-400">
                      {comp.city || 'Sem cidade'} • {comp.phone || 'Sem telefone'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                      {count} {count === 1 ? 'placa' : 'placas'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
