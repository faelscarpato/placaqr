import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  Check, 
  X, 
  ArrowRight, 
  MessageCircle, 
  Sparkles, 
  Lock, 
  Award
} from 'lucide-react';
import rawModeloSvg from '../../assets/MODELO.svg?raw';
import { trackGooglePlateCta } from '../../utils/analytics';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const GooglePlateShowcase: React.FC = () => {
  // Calculadora Interativa de Impacto
  const [clientsPerDay, setClientsPerDay] = useState<number>(40);
  const conversionRate = 0.08; // 8% dos clientes avaliam
  const reviewsPerMonth = Math.round(clientsPerDay * 30 * conversionRate);

  // Link do WhatsApp de Vendas
  // Pode ser personalizado pelo lojista ou usar o padrão da empresa
  const whatsappNumber = '5511999999999'; // Número comercial padrão
  const whatsappMessage = encodeURIComponent(
    'Olá! Vi a Placa de Avaliação Inteligente do Google no site e quero encomendar para a minha empresa.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const handleOrderClick = () => {
    if (window.gtag) {
      window.gtag('event', 'click_buy_google_plate', {
        event_category: 'sales_funnel',
        event_label: 'whatsapp_cta',
        clients_per_day: clientsPerDay,
      });
    }
    trackGooglePlateCta(clientsPerDay);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-12">
      {/* 1. HERO DO PRODUTO: APRESENTAÇÃO PREMIUM */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
        {/* Luzes de fundo decorativas */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Textos de Apresentação */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Produto Exclusivo • Tecnologia Dinâmica
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              A Placa que Transforma Clientes em <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">Avaliações 5 Estrelas</span> no Google
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Diferente de plaquinhas comuns de papel que estragam e possuem links fixos que quebram, a nossa 
              <strong> Placa Inteligente</strong> é produzida em acrílico cristal espelhado com QR Code dinâmico, 
              painel de controle em tempo real e proteção total para o seu negócio.
            </p>

            {/* Destaques Rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Link Inquebrável</p>
                <p className="text-[10px] text-slate-400">Atualize quando quiser</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
                <BarChart3 className="w-5 h-5 text-blue-400 mb-1" />
                <p className="text-xs font-bold text-white">Métricas de Scans</p>
                <p className="text-[10px] text-slate-400">Saiba quantos avaliaram</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl col-span-2 sm:col-span-1">
                <Award className="w-5 h-5 text-amber-400 mb-1" />
                <p className="text-xs font-bold text-white">Acrílico Premium</p>
                <p className="text-[10px] text-slate-400">Corte a laser e UV</p>
              </div>
            </div>

            {/* Botão de Pedido WhatsApp */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleOrderClick}
                className="py-4 px-7 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                Pedir Minha Placa do Google no WhatsApp
              </button>
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Entrega para todo o Brasil com ativação pronta
              </span>
            </div>
          </div>

          {/* Mockup da Placa Física em Acrílico */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[576.16/819.45] transition-transform duration-500 hover:scale-[1.02]">
              {/* Moldura física simulada com sombra de acrílico */}
              <div 
                className="w-full h-full rounded-[28px] shadow-2xl overflow-hidden bg-white border border-slate-200"
                dangerouslySetInnerHTML={{ __html: rawModeloSvg }}
              />

              {/* Tag de Exclusividade flutuante */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                Padrão Oficial Google Reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. POR QUE NÃO DÁ PARA FAZER EM PAPEL COMUM? */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
            <Lock className="w-3.5 h-3.5" />
            Tecnologia Profissional
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Por que a Placa do Google não pode ser um papel comum?
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Placas de Pix e Wi-Fi funcionam bem em papel porque os dados nunca mudam. Mas o Google é dinâmico 
            e precisa de tecnologia de ponta para não prejudicar sua empresa.
          </p>
        </div>

        {/* Comparativo Lado a Lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Placa Caseira de Papel */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Placa Comum / Papel Caseiro</h4>
                <p className="text-xs text-rose-700 font-medium">QR Code Estático sem tecnologia</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Link quebra para sempre:</strong> Se o Google mudar a URL do seu perfil, a placa impressa vira lixo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Zero métricas:</strong> Você não faz ideia de quantos clientes escanearam ou se a placa está funcionando.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Aparência amadora:</strong> Papel amassa, desbota com o sol e transmite descuido aos clientes exigentes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Sem suporte a promoções:</strong> Não é possível criar campanhas ou direcionar clientes para novas filiais.</span>
              </li>
            </ul>
          </div>

          {/* Placa Inteligente Placa QR */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Placa Inteligente Placa QR</h4>
                <p className="text-xs text-emerald-700 font-medium">QR Dinâmico em Nuvem + Acrílico</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Link 100% Inquebrável:</strong> Troque a URL de destino a qualquer momento pelo painel sem trocar a placa física.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Métricas em Tempo Real:</strong> Painel com contagem de scans diários, horários de pico e relatórios para WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Acrílico Cristal 3mm Premium:</strong> Acabamento espelhado de luxo que chama atenção no balcão e transmite confiança.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Abre direto na tela de 5 estrelas:</strong> Redireciona o cliente instantaneamente para deixar a nota no Google Maps.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. CALCULADORA DE IMPACTO NO GOOGLE */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-sm border border-slate-800 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Simulador de Crescimento
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quanto o seu negócio pode crescer com a Placa do Google?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Ajuste o fluxo médio de clientes por dia e veja o impacto estimado no seu perfil do Google Maps.
          </p>
        </div>

        {/* Controle Slider */}
        <div className="max-w-md mx-auto space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Fluxo de Clientes no Balcão:</span>
            <span className="text-base font-extrabold text-amber-400">{clientsPerDay} clientes/dia</span>
          </div>

          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={clientsPerDay}
            onChange={(e) => setClientsPerDay(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>10 clientes</span>
            <span>100 clientes</span>
            <span>200+ clientes</span>
          </div>
        </div>

        {/* Resultados Estimados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center">
            <p className="text-xs text-slate-400">Avaliações em 30 Dias</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">+{reviewsPerMonth}</p>
            <p className="text-[10px] text-slate-400 mt-1">novas notas 5 estrelas</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center">
            <p className="text-xs text-slate-400">Avaliações em 1 Ano</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">+{reviewsPerMonth * 12}</p>
            <p className="text-[10px] text-slate-400 mt-1">autoridade imbatível</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-center">
            <p className="text-xs text-slate-400">Posição no Google Maps</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">TOP 3</p>
            <p className="text-[10px] text-slate-400 mt-1">na sua região local</p>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleOrderClick}
            className="py-4 px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 transition-all inline-flex items-center gap-3 cursor-pointer active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950" />
            Garantir Minha Placa Inteligente no WhatsApp
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
