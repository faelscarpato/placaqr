import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Sliders, 
  Wifi, 
  Eye, 
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { 
  generateWifiPayload, 
  type WifiEncryption, 
  type GeneratedWifi 
} from '../../utils/wifiPayload';
import { 
  PlateSvgCanvas, 
  generatePlateSvgString, 
  type WifiPlateData, 
  type PlateTheme 
} from './PlateSvgCanvas';
import { printPlateSvg } from '../../utils/printPlate';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const WifiGenerator: React.FC = () => {
  // Campos do Formulário Wi-Fi
  const [ssid, setSsid] = useState<string>('Wi-Fi Clientes');
  const [password, setPassword] = useState<string>('suasenha123');
  const [encryption, setEncryption] = useState<WifiEncryption>('WPA');
  const [hidden, setHidden] = useState<boolean>(false);
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(true);

  // Customização Visual da Placa
  const [companyName, setCompanyName] = useState<string>('MEU ESTABELECIMENTO');
  const [theme, setTheme] = useState<PlateTheme>('crystal');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(true);

  // Estados de Controle
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedData, setCopiedData] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  // Gera o Payload Universal de Wi-Fi
  const wifiData: GeneratedWifi = useMemo(() => {
    return generateWifiPayload({
      ssid,
      password: encryption === 'nopass' ? '' : password,
      encryption,
      hidden,
    });
  }, [ssid, password, encryption, hidden]);

  // Gera o QR Code em alta definição (800x800) em tempo real
  useEffect(() => {
    let active = true;

    async function generateQrImage() {
      if (!wifiData.payload) return;
      try {
        const dataUrl = await QRCode.toDataURL(wifiData.payload, {
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
        console.error('Erro ao gerar QR Code do Wi-Fi:', err);
      }
    }

    generateQrImage();
    return () => {
      active = false;
    };
  }, [wifiData.payload]);

  // Estrutura de dados para o componente vetorial da placa
  const plateData: WifiPlateData = useMemo(() => {
    return {
      type: 'wifi',
      qrDataUrl,
      companyName,
      ssid: wifiData.ssid,
      password: wifiData.password,
      encryption: wifiData.encryption,
      showPasswordText,
      theme,
    };
  }, [qrDataUrl, companyName, wifiData, showPasswordText, theme]);

  // SVG completo para download ou conversão
  const fullSvgString = useMemo(() => {
    return generatePlateSvgString(plateData);
  }, [plateData]);

  // Copia os dados do Wi-Fi em texto
  const handleCopyData = async () => {
    try {
      const textToCopy = `Rede: ${ssid}\nSenha: ${password || '(Sem senha)'}\nSegurança: ${encryption}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedData(true);
      setTimeout(() => setCopiedData(false), 2500);

      if (window.gtag) {
        window.gtag('event', 'copy_wifi_data', {
          event_category: 'wifi_generator',
        });
      }
    } catch (err) {
      console.error('Erro ao copiar dados de Wi-Fi:', err);
    }
  };

  // Dispara a impressão isolada da placa
  const handlePrint = () => {
    if (window.gtag) {
      window.gtag('event', 'print_wifi_plate', {
        event_category: 'wifi_generator',
        theme,
      });
    }
    printPlateSvg(fullSvgString);
  };

  // Baixa em PNG de altíssima definição (1190 x 1684 pixels - 300 DPI)
  const handleDownloadPng = async () => {
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
          link.download = `placa_wifi_${(companyName || 'minha_loja').toLowerCase().replace(/\s+/g, '_')}_300dpi.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
        setIsExportingPng(false);

        if (window.gtag) {
          window.gtag('event', 'download_wifi_png', {
            event_category: 'wifi_generator',
          });
        }
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
      {/* COLUNA ESQUERDA: FORMULÁRIO DE DADOS E DESIGN */}
      <div className="lg:col-span-6 space-y-6">
        {/* Card: Dados do Roteador / Wi-Fi */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Configuração do Wi-Fi</h3>
              <p className="text-xs text-slate-500">Conexão instantânea via câmera (iOS e Android)</p>
            </div>
          </div>

          {/* Nome da Rede (SSID) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nome da Rede Wi-Fi (SSID)
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="Ex: Wi-Fi Clientes / Restaurante VIP"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 text-sm font-medium transition-all bg-slate-50/50"
            />
          </div>

          {/* Tipo de Criptografia / Segurança */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Segurança da Rede
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'WPA', label: 'WPA/WPA2/WPA3 (Padrão)' },
                { id: 'WEP', label: 'WEP' },
                { id: 'nopass', label: 'Rede Aberta' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEncryption(item.id as WifiEncryption)}
                  className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                    encryption === item.id
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Senha da Rede (se não for rede aberta) */}
          {encryption !== 'nopass' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Senha da Rede
              </label>
              <div className="relative">
                <input
                  type={showPasswordInput ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha do Wi-Fi"
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 text-sm font-medium transition-all bg-slate-50/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordInput(!showPasswordInput)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Checkbox Rede Oculta */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Rede Wi-Fi com SSID Oculto (Hidden Network)
            </span>
          </label>
        </div>

        {/* Card: Customização Visual da Placa */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Design da Placa de Wi-Fi</h3>
              <p className="text-xs text-slate-500">Personalize o acabamento visual da sua placa</p>
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
              placeholder="Ex: CAFETERIA CENTRAL"
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
                  name: 'Azul Conectado',
                  desc: 'Estilo Tecnologia',
                  color: 'bg-sky-600 border-sky-500 text-white',
                },
                {
                  id: 'dark-gold',
                  name: 'Black & Gold',
                  desc: 'Luxo & Modernidade',
                  color: 'bg-slate-900 border-amber-500 text-amber-400',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as PlateTheme)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    theme === item.id
                      ? 'border-sky-600 ring-2 ring-sky-600/20 bg-sky-50/20 shadow-sm'
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

          {/* Checkbox Opção de exibir senha por extenso */}
          {encryption !== 'nopass' && (
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={showPasswordText}
                onChange={(e) => setShowPasswordText(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Imprimir a senha por extenso embaixo do QR Code (para clientes com notebook ou dispositivos sem câmera)
              </span>
            </label>
          )}
        </div>

        {/* Card: Copiar Dados de Conexão */}
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-sky-400 uppercase flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Dados Rápidos de Conexão
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {encryption}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
            <strong>Rede:</strong> {ssid} <br />
            <strong>Senha:</strong> {password || '(Sem senha)'}
          </p>

          <button
            type="button"
            onClick={handleCopyData}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/20 active:scale-[0.98]"
          >
            {copiedData ? (
              <>
                <Check className="w-4 h-4 text-white" />
                Dados Copiados com Sucesso!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Rede e Senha para Enviar aos Clientes
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
              <Sparkles className="w-4 h-4 text-sky-500" />
              Pré-visualização da Placa Wi-Fi (Display 10x15cm / A5)
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
            onClick={handlePrint}
            className="w-full py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
          >
            <Printer className="w-5 h-5" />
            Imprimir Placa Agora (Grátis)
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-slate-500" />
            {isExportingPng ? 'Gerando Imagem...' : 'Baixar Imagem em Alta Resolução (PNG 300 DPI)'}
          </button>
        </div>
      </div>
    </div>
  );
};
