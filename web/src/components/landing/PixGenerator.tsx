import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';
import { 
  generatePixPayload, 
  type PixKeyType, 
  type GeneratedPix 
} from '../../utils/pixPayload';
import { 
  PlateSvgCanvas, 
  generatePlateSvgString, 
  type PixPlateData, 
  type PlateTheme 
} from './PlateSvgCanvas';
import { printPlateSvg } from '../../utils/printPlate';
import { LeadCaptureModal } from './LeadCaptureModal';
import { trackPlatePrint, trackPlateDownload } from '../../utils/analytics';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const PixGenerator: React.FC = () => {
  // Campos do Formulário Pix
  const [keyType, setKeyType] = useState<PixKeyType>('phone');
  const [key, setKey] = useState<string>('11999998888');
  const [merchantName, setMerchantName] = useState<string>('MINHA EMPRESA');
  const [merchantCity, setMerchantCity] = useState<string>('SAO PAULO');
  const [amount, setAmount] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  
  // Customização Visual da Placa
  const [companyName, setCompanyName] = useState<string>('MINHA LOJA');
  const [theme, setTheme] = useState<PlateTheme>('crystal');
  const [showKeyText, setShowKeyText] = useState<boolean>(true);

  // Estados de Controle
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  // Estados da Modal de Lead
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'print' | 'download' | null>(null);

  // Gera o Payload Oficial do Banco Central em tempo real
  const pixData: GeneratedPix = useMemo(() => {
    return generatePixPayload({
      keyType,
      key,
      merchantName,
      merchantCity,
      amount: amount ? amount.replace(',', '.') : null,
      txid: txid || null,
    });
  }, [keyType, key, merchantName, merchantCity, amount, txid]);

  // Gera o QR Code em alta definição (800x800) em tempo real
  useEffect(() => {
    let active = true;

    async function generateQrImage() {
      if (!pixData.payload) return;
      try {
        const dataUrl = await QRCode.toDataURL(pixData.payload, {
          width: 800,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#0F172A',
            light: '#FFFFFF',
          },
        });

        if (active) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Erro ao gerar QR Code do Pix:', err);
      }
    }

    generateQrImage();
    return () => {
      active = false;
    };
  }, [pixData.payload]);

  // Estrutura de dados para o componente vetorial da placa
  const plateData: PixPlateData = useMemo(() => {
    return {
      type: 'pix',
      qrDataUrl,
      companyName,
      merchantName: pixData.merchantName,
      merchantCity: pixData.merchantCity,
      pixKey: pixData.formattedKey,
      pixKeyType: keyType,
      amountText: pixData.amountText,
      showKeyText,
      theme,
    };
  }, [qrDataUrl, companyName, pixData, keyType, showKeyText, theme]);

  // SVG completo para download ou conversão
  const fullSvgString = useMemo(() => {
    return generatePlateSvgString(plateData);
  }, [plateData]);

  // Copia o código Pix Copia e Cola para a área de transferência
  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(pixData.payload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2500);

      if (window.gtag) {
        window.gtag('event', 'copy_pix_payload', {
          event_category: 'pix_generator',
          key_type: keyType,
        });
      }
    } catch (err) {
      console.error('Erro ao copiar payload Pix:', err);
    }
  };

  // Abre a modal de lead antes de imprimir
  const handleTriggerPrint = () => {
    setPendingAction('print');
    setIsLeadModalOpen(true);
  };

  // Abre a modal de lead antes de baixar a imagem
  const handleTriggerDownload = () => {
    setPendingAction('download');
    setIsLeadModalOpen(true);
  };

  // Executa a ação confirmada ou pulada na modal
  const handleProceedAction = () => {
    if (pendingAction === 'print') {
      executePrint();
    } else if (pendingAction === 'download') {
      executeDownloadPng();
    }
    setPendingAction(null);
  };

  // Dispara a impressão isolada da placa
  const executePrint = () => {
    trackPlatePrint('pix', theme, companyName);
    printPlateSvg(fullSvgString);
  };

  // Baixa em PNG de altíssima definição (1190 x 1684 pixels - padrão 300 DPI)
  const executeDownloadPng = async () => {
    if (!fullSvgString || isExportingPng) return;
    setIsExportingPng(true);

    try {
      const blob = new Blob([fullSvgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1190;
        canvas.height = 1684;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngUrl = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `placa_pix_${(companyName || 'minha_loja').toLowerCase().replace(/\s+/g, '_')}_300dpi.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
        setIsExportingPng(false);

        trackPlateDownload('pix', theme, companyName);
      };

      img.onerror = () => {
        setIsExportingPng(false);
        URL.revokeObjectURL(url);
        alert('Falha ao renderizar a imagem PNG. Tente novamente.');
      };

      img.src = url;
    } catch (err) {
      console.error('Erro na exportação PNG:', err);
      setIsExportingPng(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* COLUNA ESQUERDA: FORMULÁRIO DE DADOS E CUSTOMIZAÇÃO */}
      <div className="lg:col-span-6 space-y-6">
        {/* Card: Informações do Recebedor */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dados do Recebedor Pix</h3>
              <p className="text-xs text-slate-500">Padrão oficial do Banco Central (EMVCo BR Code)</p>
            </div>
          </div>

          {/* Seletor do Tipo de Chave */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tipo de Chave Pix
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'phone', label: 'Celular' },
                { id: 'cpf', label: 'CPF' },
                { id: 'cnpj', label: 'CNPJ' },
                { id: 'email', label: 'E-mail' },
                { id: 'random', label: 'Aleatória' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setKeyType(item.id as PixKeyType)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                    keyType === item.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input da Chave Pix */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chave Pix
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={
                keyType === 'phone'
                  ? 'Ex: (11) 99999-8888'
                  : keyType === 'cpf'
                  ? '000.000.000-00'
                  : keyType === 'cnpj'
                  ? '00.000.000/0001-00'
                  : keyType === 'email'
                  ? 'seuemail@empresa.com'
                  : 'Chave EVP aleatória'
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-sm font-medium transition-all bg-slate-50/50"
            />
          </div>

          {/* Nome e Cidade do Titular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nome do Titular
                </label>
                <span className="text-[10px] text-slate-400">Máx 25</span>
              </div>
              <input
                type="text"
                maxLength={25}
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value.toUpperCase())}
                placeholder="Ex: JOAO DA SILVA"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-sm font-medium transition-all bg-slate-50/50 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cidade
                </label>
                <span className="text-[10px] text-slate-400">Máx 15</span>
              </div>
              <input
                type="text"
                maxLength={15}
                value={merchantCity}
                onChange={(e) => setMerchantCity(e.target.value.toUpperCase())}
                placeholder="Ex: SAO PAULO"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-sm font-medium transition-all bg-slate-50/50 uppercase"
              />
            </div>
          </div>

          {/* Valor Opcional e Identificador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Valor Fixo (Opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00 (Vazio = Livre)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-sm font-medium transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Identificador / TXID
              </label>
              <input
                type="text"
                maxLength={20}
                value={txid}
                onChange={(e) => setTxid(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="Opcional (Ex: MESA01)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-sm font-medium transition-all bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Card: Customização Visual da Placa */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Design da Placa de Mesa</h3>
              <p className="text-xs text-slate-500">Personalize o acabamento visual da sua placa física</p>
            </div>
          </div>

          {/* Nome da Loja no Topo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nome do Estabelecimento / Loja
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
              placeholder="Ex: PADARIA DO BAIRRO"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium transition-all bg-slate-50/50 uppercase"
            />
          </div>

          {/* Seleção de Tema / Estilo de Acabamento */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Estilo de Acabamento
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'crystal',
                  name: 'Acrílico Cristal',
                  desc: 'Clean & Sofisticado',
                  color: 'bg-slate-100 border-slate-300',
                },
                {
                  id: 'brand',
                  name: 'Verde Oficial',
                  desc: 'Identidade Pix BACEN',
                  color: 'bg-teal-700 border-teal-600 text-white',
                },
                {
                  id: 'dark-gold',
                  name: 'Black & Gold',
                  desc: 'Luxo & Exclusividade',
                  color: 'bg-slate-900 border-amber-500 text-amber-400',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as PlateTheme)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    theme === item.id
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border ${item.color}`} />
                  </div>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox Opção de exibir chave por extenso */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
            <input
              type="checkbox"
              checked={showKeyText}
              onChange={(e) => setShowKeyText(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Imprimir a chave Pix por extenso embaixo do QR Code (recomendado para digitação manual)
            </span>
          </label>
        </div>

        {/* Card: Teste Pix Copia e Cola */}
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-teal-400 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Código Pix Copia e Cola Oficial
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              CRC16: {pixData.payload.slice(-4)}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-mono break-all line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            {pixData.payload}
          </p>

          <button
            type="button"
            onClick={handleCopyPayload}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/20 active:scale-[0.98]"
          >
            {copiedPayload ? (
              <>
                <Check className="w-4 h-4 text-white" />
                Código Copiado! Cole no seu banco para testar
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Pix Copia e Cola para Teste
              </>
            )}
          </button>
        </div>
      </div>

      {/* COLUNA DIREITA: PREVIEW DA PLACA EM ALTA DEFINIÇÃO E AÇÕES */}
      <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
        {/* Painel do Mockup da Placa */}
        <div className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-inner flex flex-col items-center justify-center relative">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pré-visualização da Placa (Display 10x15cm / A5)
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
              300 DPI
            </span>
          </div>

          {/* O Canvas SVG da Placa */}
          <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-[576.16/819.45] transition-transform duration-300 hover:scale-[1.01]">
            <PlateSvgCanvas data={plateData} className="w-full h-full shadow-2xl rounded-[28px]" />
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Proporção otimizada para display acrílico de balcão (10x15cm), suporte em L/T ou folha A5/A4
          </p>
        </div>

        {/* Botões de Ação: Imprimir e Baixar PNG */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <button
            type="button"
            onClick={handleTriggerPrint}
            className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
          >
            <Printer className="w-5 h-5" />
            Imprimir Placa Agora (Grátis)
          </button>

          <button
            type="button"
            onClick={handleTriggerDownload}
            disabled={isExportingPng}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-slate-500" />
            {isExportingPng ? 'Gerando Imagem...' : 'Baixar Imagem em Alta Resolução (PNG 300 DPI)'}
          </button>
        </div>

        {/* Modal de Captação de Lead Opcional */}
        <LeadCaptureModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          sourcePlate="pix"
          action={pendingAction || 'download'}
          onProceed={handleProceedAction}
          companyNameDefault={companyName}
        />
      </div>
    </div>
  );
};
