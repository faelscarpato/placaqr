import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Loader2, 
  ArrowRight 
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

  const actionVerb = action === 'print' ? 'Imprimir' : 'Baixar';

  // Envia os dados do formulário e prossegue com a ação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const leadPayload = {
      name: name.trim() || null,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      interests: [] as string[],
      source_plate: sourcePlate,
      action,
    };

    // 1. Rastreia no Google Analytics 4
    trackLeadSubmission({
      leadName: name.trim() || undefined,
      hasWhatsapp: Boolean(whatsapp.trim()),
      hasEmail: Boolean(email.trim()),
      interests: [],
      sourcePlate,
      action,
    });

    // 2. Envia para o backend (Pages Function + Supabase)
    try {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      }).catch((err) => console.debug('Envio /api/leads em background:', err));

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho limpo e convidativo */}
        <div className="flex items-start gap-3.5 mb-5 pr-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Sua placa está pronta!
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Opcional: deixe seu contato para receber novidades, ou pule para {actionVerb.toLowerCase()} agora.
            </p>
          </div>
        </div>

        {/* Formulário compacto */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Nome ou Estabelecimento
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Padaria Central"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                WhatsApp
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
                E-mail
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

          {/* Botões de Ação */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <span>Continuar e {actionVerb}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2 px-3 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors cursor-pointer text-center"
            >
              Pular e {actionVerb.toLowerCase()} direto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
