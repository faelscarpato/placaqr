import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAuthHeaders } from '../../lib/supabase';
import { 
  Search, 
  Filter, 
  Store, 
  ExternalLink, 
  Edit3, 
  Power, 
  PowerOff, 
  PlusCircle, 
  RefreshCw,
  X,
  Printer
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface Plate {
  id: string;
  code: string;
  batch: string;
  status: 'stock' | 'active' | 'disabled';
  review_url: string | null;
  sale_amount: number | null;
  payment_method: string | null;
  activated_at: string | null;
  created_at: string;
  companies?: { id: string; name: string } | null;
}

export const PlatesList: React.FC = () => {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  // Modal de edição
  const [editingPlate, setEditingPlate] = useState<Plate | null>(null);
  const [editStatus, setEditStatus] = useState<'stock' | 'active' | 'disabled'>('stock');
  const [editReviewUrl, setEditReviewUrl] = useState('');
  const [editCompanyId, setEditCompanyId] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchPlates = async () => {
    setLoading(true);
    try {
      const headers = await getAdminAuthHeaders();
      let url = `/api/admin/plates?status=${statusFilter}&batch=${batchFilter}`;
      if (searchTerm.trim()) {
        url += `&q=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setPlates(data || []);
      }

      // Busca empresas para o modal de reatribuição
      const compRes = await fetch('/api/admin/companies', { headers });
      if (compRes.ok) {
        const cData = await compRes.json();
        setCompanies(cData || []);
      }
    } catch (err) {
      console.error('Erro ao buscar placas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlates();
  }, [statusFilter, batchFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlates();
  };

  const openEditModal = (p: Plate) => {
    setEditingPlate(p);
    setEditStatus(p.status);
    setEditReviewUrl(p.review_url || '');
    setEditCompanyId(p.companies?.id || '');
    setActionMsg(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPlate) return;
    setSavingEdit(true);
    setActionMsg(null);

    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/plates', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          id: editingPlate.id,
          status: editStatus,
          review_url: editReviewUrl.trim() || null,
          company_id: editCompanyId || null,
        }),
      });

      if (res.ok) {
        setActionMsg('Placa atualizada com sucesso!');
        fetchPlates();
        setTimeout(() => setEditingPlate(null), 1200);
      } else {
        const err = await res.json();
        setActionMsg(err.error || 'Erro ao salvar alterações.');
      }
    } catch (err: any) {
      setActionMsg(err.message || 'Falha de comunicação.');
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleStatus = async (plate: Plate) => {
    const nextStatus = plate.status === 'active' ? 'disabled' : 'active';
    try {
      const headers = await getAdminAuthHeaders();
      await fetch('/api/admin/plates', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          id: plate.id,
          status: nextStatus,
        }),
      });
      fetchPlates();
    } catch (err) {
      console.error('Erro ao alternar status da placa:', err);
    }
  };

  const batches = Array.from(new Set(plates.map((p) => p.batch).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciar Placas</h1>
          <p className="text-xs text-slate-500">Controle de status, lotes e associações com estabelecimentos.</p>
        </div>
        <Link
          to="/admin/ativar"
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Ativar Nova Placa
        </Link>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (ex: DR4ATZDH)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm font-mono uppercase outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filtros:
          </div>

          {/* Filtro Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">Status: Todos</option>
            <option value="stock">Em Estoque</option>
            <option value="active">Ativas</option>
            <option value="disabled">Desativadas</option>
          </select>

          {/* Filtro Lote */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">Lotes: Todos</option>
            {batches.map((b) => (
              <option key={b} value={b}>Lote {b}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchPlates}
            className="ml-auto p-2 text-slate-400 hover:text-blue-600 transition cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lista de Placas */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Carregando placas...</p>
        </div>
      ) : plates.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">Nenhuma placa encontrada.</p>
          <p className="text-xs text-slate-400">Tente ajustar os filtros ou a busca por código.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plates.map((plate) => {
            const isStock = plate.status === 'stock';
            const isActive = plate.status === 'active';
            const isDisabled = plate.status === 'disabled';

            return (
              <div
                key={plate.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-base text-slate-900 tracking-wider">
                      {plate.code}
                    </span>

                    {/* Badge de status */}
                    {isStock && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Em Estoque
                      </span>
                    )}
                    {isActive && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ativa
                      </span>
                    )}
                    {isDisabled && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                        Desativada
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-100 text-slate-500">
                      Lote: {plate.batch}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    {plate.companies ? (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        {plate.companies.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Nenhuma empresa vinculada</span>
                    )}

                    {plate.sale_amount && (
                      <span className="text-slate-500">
                        • R$ {Number(plate.sale_amount).toFixed(2)} ({plate.payment_method || 'PIX'})
                      </span>
                    )}
                  </div>

                  {plate.review_url && (
                    <a
                      href={plate.review_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate max-w-md"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {plate.review_url}
                    </a>
                  )}
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <a
                    href={`/r/${plate.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                    title="Testar redirecionamento da placa"
                  >
                    Testar /r/{plate.code}
                  </a>

                  <Link
                    to={`/admin/imprimir?code=${plate.code}&empresa=${encodeURIComponent(plate.companies?.name || '')}`}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition cursor-pointer"
                    title="Imprimir placa"
                  >
                    <Printer className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => openEditModal(plate)}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer"
                    title="Editar placa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleStatus(plate)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isActive
                        ? 'bg-red-50 hover:bg-red-100 text-red-600'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                    }`}
                    title={isActive ? 'Desativar placa' : 'Reativar placa'}
                  >
                    {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE EDIÇÃO DA PLACA */}
      {editingPlate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Editar Placa {editingPlate.code}</h3>
                <p className="text-xs text-slate-400">Altere o status, empresa ou link de avaliação.</p>
              </div>
              <button
                onClick={() => setEditingPlate(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionMsg && (
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold">
                {actionMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none"
                >
                  <option value="stock">Em Estoque (stock)</option>
                  <option value="active">Ativa (active)</option>
                  <option value="disabled">Desativada (disabled)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reatribuir Empresa</label>
                <select
                  value={editCompanyId}
                  onChange={(e) => setEditCompanyId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                >
                  <option value="">Nenhuma empresa vinculada</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Link de Avaliação do Google</label>
                <input
                  type="text"
                  value={editReviewUrl}
                  onChange={(e) => setEditReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlate(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer"
              >
                {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
