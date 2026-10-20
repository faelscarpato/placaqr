import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  QrCode, 
  Wifi, 
  CreditCard, 
  Star, 
  Sparkles, 
  ArrowRight, 
  HelpCircle
} from 'lucide-react';
import { PixGenerator } from '../components/landing/PixGenerator';
import { WifiGenerator } from '../components/landing/WifiGenerator';
import { GooglePlateShowcase } from '../components/landing/GooglePlateShowcase';

type ActiveTab = 'pix' | 'wifi' | 'google';

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'pix';
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    ['pix', 'wifi', 'google'].includes(initialTab) ? initialTab : 'pix'
  );

  // Mantém a URL sincronizada com a aba ativa
  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });

    if (window.gtag) {
      window.gtag('event', 'select_content', {
        content_type: 'tab',
        item_id: newTab,
      });
    }
  };

  useEffect(() => {
    const param = searchParams.get('tab') as ActiveTab;
    if (param && ['pix', 'wifi', 'google'].includes(param) && param !== activeTab) {
      setActiveTab(param);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* 1. CABEÇALHO GLOBAL */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo e Nome da Marca */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight block leading-tight">
                Placa QR
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                Placas Inteligentes de Balcão
              </span>
            </div>
          </Link>

          {/* Links e Botão de Acesso Admin */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gerador 100% Gratuito
            </span>

            <Link
              to="/admin"
              className="py-2.5 px-4 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              Acesso Lojista / Admin
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL DA LANDING PAGE */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* HERO SECTION: CHAMADA DE ALTO IMPACTO */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            O Padrão Profissional para Balcões e Mesas
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
            Crie e Imprima Placas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600">Pix & Wi-Fi Grátis</span> para o seu Balcão
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed px-2">
            Gere artes em alta definição (300 DPI) no padrão oficial para colocar em suportes de acrílico de mesa.
            Ou turbine as avaliações da sua loja com a nossa <strong>Placa Inteligente do Google</strong>.
          </p>
        </section>

        {/* 3. SELETOR DE ABAS PRINCIPAL (TABS) */}
        <section className="space-y-6">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl sm:rounded-3xl max-w-3xl mx-auto grid grid-cols-3 gap-1 shadow-inner border border-slate-300/60">
            {/* Aba 1: Placa Pix */}
            <button
              type="button"
              onClick={() => handleTabChange('pix')}
              className={`py-3.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 ${
                activeTab === 'pix'
                  ? 'bg-white text-teal-700 shadow-md shadow-slate-300/50 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CreditCard className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'pix' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Placa Pix</span>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Grátis
              </span>
            </button>

            {/* Aba 2: Placa Wi-Fi */}
            <button
              type="button"
              onClick={() => handleTabChange('wifi')}
              className={`py-3.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 ${
                activeTab === 'wifi'
                  ? 'bg-white text-sky-700 shadow-md shadow-slate-300/50 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Wifi className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'wifi' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Placa Wi-Fi</span>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Grátis
              </span>
            </button>

            {/* Aba 3: Placa Google Avaliações */}
            <button
              type="button"
              onClick={() => handleTabChange('google')}
              className={`py-3.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 relative ${
                activeTab === 'google'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 scale-[1.01]'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/60 bg-amber-50/60'
              }`}
            >
              <Star className={`w-4 h-4 sm:w-5 sm:h-5 fill-current ${activeTab === 'google' ? 'text-slate-950' : 'text-amber-600'}`} />
              <span>Placa Google</span>
              <span className={`hidden sm:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                activeTab === 'google' ? 'bg-slate-950 text-amber-300' : 'bg-amber-200 text-amber-900'
              }`}>
                Premium
              </span>
            </button>
          </div>

          {/* CONTEÚDO DA ABA ATIVA */}
          <div className="pt-2">
            {activeTab === 'pix' && <PixGenerator />}
            {activeTab === 'wifi' && <WifiGenerator />}
            {activeTab === 'google' && <GooglePlateShowcase />}
          </div>
        </section>

        {/* 4. COMO FUNCIONA EM 3 PASSOS SIMPLES */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Praticidade Total
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Como ter sua placa pronta em menos de 2 minutos
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Sem precisar contratar designers ou pagar gráficas caras para placas estáticas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Preencha os Dados</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digite sua Chave Pix (CPF, CNPJ, Celular ou E-mail) ou o nome e senha da rede Wi-Fi da sua loja.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Escolha o Acabamento</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Selecione o estilo visual que mais combina com seu balcão: Acrílico Cristal Clean, Verde Oficial ou Black & Gold Luxo.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Imprima e Encaixe no Display</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Imprima direto na sua impressora comum (proporção perfeita para display acrílico 10x15cm de mesa) ou baixe em PNG de 300 DPI.
              </p>
            </div>
          </div>
        </section>

        {/* 5. PERGUNTAS FREQUENTES (FAQ) */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Tire Suas Dúvidas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">O QR Code do Pix funciona em qualquer banco?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sim! Nosso gerador segue rigorosamente a especificação EMVCo BR Code oficial do Banco Central do Brasil com cálculo de CRC16. Funciona no Nubank, Itaú, Bradesco, Inter, Santander, Banco do Brasil, Mercado Pago e qualquer instituição autorizada.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Qual o tamanho de papel ideal para imprimir?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As artes foram calculadas na proporção exata de displays de acrílico de mesa 10x15 cm (o mais vendido em papelarias) e folha A5. Você pode imprimir numa folha A4 comum e cortar na linha pontilhada ou imprimir direto em papel fotográfico 10x15cm.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Por que a Placa do Google não é impressa de graça?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Porque a Placa do Google precisa ser <strong>dinâmica e inquebrável</strong>. Se você imprimir um QR Code estático do Google e a URL do seu perfil mudar, você perde a placa. Além disso, a Placa do Google acompanha painel de métricas em tempo real e acabamento físico em acrílico cristal cortado a laser com impressão UV.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Como encomendo a Placa de Avaliação do Google?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Basta clicar no botão da aba <strong>Placa Google</strong> para conversar diretamente pelo WhatsApp com a nossa equipe. Você nos informa o nome da sua empresa e nós enviamos a placa física já ativada e configurada para o seu endereço em qualquer lugar do Brasil.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. RODAPÉ INSTITUCIONAL */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">Placa QR</span>
            <span>&copy; {new Date().getFullYear()} • Sistema de Placas Inteligentes para Balcão</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleTabChange('pix')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Placa Pix
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('wifi')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Placa Wi-Fi
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('google')}
              className="hover:text-amber-600 font-semibold transition-colors cursor-pointer"
            >
              Placa Google
            </button>
            <Link to="/admin" className="hover:text-blue-600 font-semibold transition-colors">
              Painel Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
