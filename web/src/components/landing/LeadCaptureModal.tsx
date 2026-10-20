import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Sparkles, 
  Send, 
  Loader2 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  trackLeadSubmission, 
  trackLeadSkipped,
  type PlateType, 
  type PlateAction 
} from '../../utils/analytics';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePlate: PlateType;
  action: PlateAction;
  onProceed: () => void;
  companyNameDefault?: string;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  sourcePlate,
  action,
  onProceed,
  companyNameDefault = '',
}) => {
  const [name, setName] = useState<string>(companyNameDefault);
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [wantGooglePlate, setWantGooglePlate] = useState<boolean>(true);
  const [wantGoogleMyBusiness, setWantGoogleMyBusiness] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Formata telefone/WhatsApp com máscara (99) 99999-9999
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setWhatsapp(value);
  };

  // Envia os dados do formulário e prossegue com a ação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const interests: string[] = [];
    if (wantGooglePlate) interests.push('placa_google');
    if (wantGoogleMyBusiness) interests.push('google_empresas');

    const leadPayload = {
      name: name.trim() || null,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      interests,
      source_plate: sourcePlate,
      action,
    };

    // 1. Rastreia no Google Analytics 4
    trackLeadSubmission({
      leadName: name.trim() || undefined,
      hasWhatsapp: Boolean(whatsapp.trim()),
      hasEmail: Boolean(email.trim()),
      interests,
      sourcePlate,
      action,
    });

    // 2. Envia para o backend (Pages Function + Supabase)
    try {
      // Envia para a API do Cloudflare Pages
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      }).catch((err) => console.debug('Envio /api/leads em background:', err));

      // Tenta gravar também direto pelo cliente Supabase do frontend se a tabela estiver aberta
      if (supabase) {
        Promise.resolve(
          supabase
            .from('leads')
            .insert([
              {
                name: leadPayload.name,
                whatsapp: leadPayload.whatsapp,
                email: leadPayload.email,
                interests: leadPayload.interests,
                source_plate: leadPayload.source_plate,
                action: leadPayload.action,
              },
            ])
        )
          .then(() => {})
          .catch((err: unknown) => console.debug('Supabase insert fallback:', err));
      }
    } catch (err) {
      console.error('Erro ao enviar lead:', err);
    }

    setIsSubmitting(false);
    onClose();
    onProceed();
  };

  // Usuário opta por pular sem preencher (não obrigatório)
  const handleSkip = () => {
    trackLeadSkipped(sourcePlate, action);
    onClose();
    onProceed();
  };

  const actionVerb = action === 'print' ? 'Imprimir' : 'Baixar Imagem';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer z-10"
          title="Fechar e continuar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo / Banner de Oferta */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Oportunidade para o seu Negócio
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Sua placa está pronta! Antes de {actionVerb.toLowerCase()}...
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Mais de <strong>80% dos clientes</strong> pesquisam empresas no Google antes de comprar. 
            Quer colocar sua empresa no topo do Google Maps e conquistar mais avaliações 5 estrelas?
          </p>
        </div>

        {/* Formulário Não Obrigatório */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Selecione o que você tem interesse em receber:
            </label>

            {/* Opção 1: Placa de Avaliação do Google */}
            <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
              wantGooglePlate 
                ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/30' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={wantGooglePlate}
                onChange={(e) => setWantGooglePlate(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Placa de Avaliação do Google em Acrílico
                </span>
                <span className="text-slate-500 block mt-0.5">
                  QR Code dinâmico inquebrável com métricas de scans e acabamento profissional espelhado.
                </span>
              </div>
            </label>

            {/* Opção 2: Cadastro no Google Empresas */}
            <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
              wantGoogleMyBusiness 
                ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-400/30' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={wantGoogleMyBusiness}
                onChange={(e) => setWantGoogleMyBusiness(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Colocar / Otimizar Minha Loja no Google Empresas
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Consultoria para sua empresa aparecer em destaque nas buscas locais do Google Maps.
                </span>
              </div>
            </label>
          </div>

          {/* Campos de Contato */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Nome ou Nome do Estabelecimento (Opcional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos / Padaria Central"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  WhatsApp (Opcional)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar e {actionVerb} Minha Placa
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              Pular e apenas {actionVerb.toLowerCase()} gratuitamente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
