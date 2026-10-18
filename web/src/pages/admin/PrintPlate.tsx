import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { 
  Printer, 
  Download, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Search, 
  FileText, 
  ExternalLink,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import rawModeloSvg from '../../assets/MODELO.svg?raw';
import { LOTE_L001_DATA } from '../../data/lote_L001';
import { QRCODES_L001_PATHS } from '../../data/qrcodes_L001';

export const PrintPlate: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Inicializa o código da URL ou pega o primeiro do lote L001
  const paramCode = searchParams.get('code') || '';
  const paramEmpresa = searchParams.get('empresa') || '';

  const initialCode = useMemo(() => {
    if (paramCode) return paramCode.trim().toUpperCase();
    return LOTE_L001_DATA[0]?.codigo || 'TYJGHEWE';
  }, [paramCode]);

  const [code, setCode] = useState<string>(initialCode);
  const [companyName, setCompanyName] = useState<string>(paramEmpresa);
  const [useCustomCompany, setUseCustomCompany] = useState<boolean>(Boolean(paramEmpresa));
  const [showPlateCode, setShowPlateCode] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'sm' | 'md' | 'lg'>('fit');
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchSearch, setBatchSearch] = useState<string>('');
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  // SVG Base (do MODELO.svg)
  const [baseSvg, setBaseSvg] = useState<string>(rawModeloSvg);
  const [qrPathD, setQrPathD] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState<boolean>(false);

  // Mantém sincronizado com URL caso mude externamente
  useEffect(() => {
    if (paramCode && paramCode !== code) {
      setCode(paramCode.trim().toUpperCase());
    }
    if (paramEmpresa && paramEmpresa !== companyName) {
      setCompanyName(paramEmpresa);
      setUseCustomCompany(true);
    }
  }, [paramCode, paramEmpresa]);

  // Se o rawModeloSvg não tiver vindo pelo import Vite por algum motivo, busca do public
  useEffect(() => {
    if (!baseSvg) {
      fetch('/MODELO.svg')
        .then((r) => r.text())
        .then((text) => setBaseSvg(text))
        .catch((err) => console.error('Erro ao carregar /MODELO.svg:', err));
    }
  }, [baseSvg]);

  // Carrega ou gera o QR Code correspondente ao código atual
  useEffect(() => {
    let active = true;

    async function loadQrCode() {
      setLoadingQr(true);
      const cleanCode = code.trim().toUpperCase();

      // 1. Verifica se já temos o path vetorial no mapa pré-processado do Lote L001
      if (QRCODES_L001_PATHS[cleanCode]) {
        if (active) {
          setQrPathD(QRCODES_L001_PATHS[cleanCode]);
          setLoadingQr(false);
        }
        return;
      }

      // 2. Se for código personalizado fora do mapa pré-processado, gera em tempo real com qrcode
      try {
        const targetUrl = `https://placaqr.pages.dev/r/${cleanCode}`;
        const generatedSvg = await QRCode.toString(targetUrl, {
          type: 'svg',
          margin: 0,
          errorCorrectionLevel: 'M',
        });

        // Extrai o 'd' do path gerado
        const match = generatedSvg.match(/d="([^"]+)"/);
        if (match && active) {
          // O qrcode do npm gera coordenadas 0-N com scale diferente, ou se vier com viewBox
          // Se for gerado pelo qrcode nativo, pegamos o SVG interno ou o path
          setQrPathD(match[1]);
        }
      } catch (err) {
        console.error('Erro ao gerar QR Code customizado:', err);
      } finally {
        if (active) setLoadingQr(false);
      }
    }

    loadQrCode();
    return () => {
      active = false;
    };
  }, [code]);

  // Índice da placa atual no lote L001
  const currentIndex = useMemo(() => {
    return LOTE_L001_DATA.findIndex((item) => item.codigo === code);
  }, [code]);

  const isL001Plate = currentIndex !== -1;

  // Navega para a placa anterior
  const handlePrevPlate = () => {
    if (currentIndex > 0) {
      const prevCode = LOTE_L001_DATA[currentIndex - 1].codigo;
      setCode(prevCode);
      setSearchParams({ code: prevCode, ...(companyName ? { empresa: companyName } : {}) });
    }
  };

  // Navega para a próxima placa
  const handleNextPlate = () => {
    if (currentIndex < LOTE_L001_DATA.length - 1) {
      const nextCode = LOTE_L001_DATA[currentIndex + 1].codigo;
      setCode(nextCode);
      setSearchParams({ code: nextCode, ...(companyName ? { empresa: companyName } : {}) });
    }
  };

  // Seleciona placa pelo código
  const handleSelectCode = (newCode: string) => {
    const clean = newCode.trim().toUpperCase();
    setCode(clean);
    setSearchParams({ code: clean, ...(companyName ? { empresa: companyName } : {}) });
  };

  // Gera o SVG fundido (MODELO.svg + QR Code + Customizações)
  const mergedSvg = useMemo(() => {
    if (!baseSvg) return '';

    // Coordenadas calculadas matematicamente entre os cantos cinzas do MODELO.svg:
    // Cantos: x de 137.01 a 435.41 (centro 286.21), y de 246.47 a 544.87 (centro 395.67)
    // Largura interna: 266x266, margem simétrica de 16.2px de cada canto
    const qrLayer = `
  <!-- CAMADA DINÂMICA: QR CODE DA PLACA -->
  <g id="placa-qrcode-layer">
    <rect x="151.21" y="260.67" width="270" height="270" fill="#ffffff" rx="6" />
    <g transform="translate(153.21, 262.67)">
      <svg width="266" height="266" viewBox="0 0 580 580">
        <path transform="scale(20)" fill="none" stroke="#000000" stroke-width="1" class="qrline" d="${qrPathD}" />
      </svg>
    </g>
    ${
      showPlateCode
        ? `
    <!-- CÓDIGO DA PLACA IMPRESSO -->
    <text
      x="286.21"
      y="556"
      font-family="'SF Mono', 'Roboto Mono', 'Courier New', monospace"
      font-size="12"
      font-weight="700"
      letter-spacing="3"
      fill="#475569"
      text-anchor="middle"
    >
      ${code}
    </text>
    `
        : ''
    }
  </g>
`;

    let finalSvg = baseSvg;

    // Se o usuário optar por personalizar o nome da empresa:
    // Cobre "EMPRESA" com patch branco e escreve o nome da empresa do cliente
    if (useCustomCompany && companyName.trim()) {
      const cleanCompany = companyName.trim().toUpperCase();
      const companyOverride = `
  <!-- CAMADA DINÂMICA: NOME DA EMPRESA PERSONALIZADO -->
  <g id="custom-company-layer">
    <rect x="210" y="75" width="295" height="43" fill="#ffffff" />
    <text
      x="357"
      y="110"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-size="28"
      font-weight="900"
      fill="#6e7270"
      text-anchor="middle"
      letter-spacing="0.5"
    >
      ${cleanCompany}
    </text>
  </g>
`;
      finalSvg = finalSvg.replace('</svg>', companyOverride + '\n</svg>');
    }

    finalSvg = finalSvg.replace('</svg>', qrLayer + '\n</svg>');
    return finalSvg;
  }, [baseSvg, qrPathD, code, showPlateCode, useCustomCompany, companyName]);

  // Ação de Impressão nativa A5
  const handlePrint = () => {
    window.print();
  };

  // Ação de Download em arquivo vetorial SVG
  const handleDownloadSvg = () => {
    if (!mergedSvg) return;
    const blob = new Blob([mergedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placa_${code}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Ação de Download em Imagem PNG de alta resolução (1190 x 1684 - ~300 DPI)
  const handleDownloadPng = async () => {
    if (!mergedSvg || isExportingPng) return;
    setIsExportingPng(true);

    try {
      const blob = new Blob([mergedSvg], { type: 'image/svg+xml;charset=utf-8' });
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
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `placa_${code}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
        setIsExportingPng(false);
      };

      img.onerror = () => {
        setIsExportingPng(false);
        URL.revokeObjectURL(url);
        alert('Não foi possível gerar o PNG nesta versão do navegador. Use o download SVG ou a impressão direta.');
      };

      img.src = url;
    } catch (err) {
      setIsExportingPng(false);
      console.error('Erro na exportação PNG:', err);
    }
  };

  // Filtra as placas para a gaveta de lote
  const filteredBatch = useMemo(() => {
    if (!batchSearch.trim()) return LOTE_L001_DATA;
    const term = batchSearch.trim().toUpperCase();
    return LOTE_L001_DATA.filter((item) => item.codigo.includes(term));
  }, [batchSearch]);

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* REGRAS CSS ESPECÍFICAS PARA IMPRESSÃO EM MEIA FOLHA / A5 (148x210)*/}
      {/* ================================================================= */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Oculta tudo que for controle do painel */
          body * {
            visibility: hidden;
          }
          /* Exibe exclusivamente a placa oficial centralizada na folha */
          #print-plate-canvas, #print-plate-canvas * {
            visibility: visible;
          }
          #print-plate-canvas {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
          #print-plate-canvas svg {
            width: 148mm !important;
            height: 210mm !important;
            max-width: 148mm !important;
            max-height: 210mm !important;
          }
        }
      `}</style>

      {/* ================================================================= */}
      {/* BARRA SUPERIOR DE AÇÕES (OCULTA NA IMPRESSÃO)                      */}
      {/* ================================================================= */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Imprimir Placa de Avaliação</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                Modelo Oficial SVG (Varejão)
              </span>
              {isL001Plate && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Lote L001 • #{currentIndex + 1} de {LOTE_L001_DATA.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Renderização vetorial de alta definição baseada no design oficial com QR Codes dinâmicos de <code className="text-blue-600 font-mono">/r/{code}</code>.
            </p>
          </div>

          {/* Botões de Ação Principal */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Imprimir Placa (A5)
            </button>

            <button
              onClick={handleDownloadSvg}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Baixar arquivo vetorial SVG editável no Illustrator / Corel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Baixar SVG
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExportingPng}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
              title="Baixar imagem PNG de alta resolução (~300 DPI)"
            >
              <ImageIcon className="w-4 h-4 text-purple-600" />
              {isExportingPng ? 'Gerando...' : 'Baixar PNG'}
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* PAINEL DE CONTROLE E NAVEGAÇÃO ENTRE AS PLACAS                     */}
        {/* ================================================================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Bloco 1: Seleção da Placa / Navegador do Lote */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Placa / Código QR
                </label>
                <button
                  type="button"
                  onClick={() => setShowBatchModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Ver todas as 100 <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevPlate}
                  disabled={currentIndex <= 0}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  title="Placa anterior do Lote"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={code}
                    maxLength={10}
                    onChange={(e) => handleSelectCode(e.target.value)}
                    placeholder="Ex: TYJGHEWE"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2 text-sm font-mono font-bold tracking-wider text-slate-900 outline-none uppercase"
                  />
                  {loadingQr && (
                    <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextPlate}
                  disabled={currentIndex === -1 || currentIndex >= LOTE_L001_DATA.length - 1}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  title="Próxima placa do Lote"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Link de redirecionamento: <span className="font-mono text-slate-600">https://placaqr.pages.dev/r/{code}</span>
              </p>
            </div>

            {/* Bloco 2: Customização da Placa */}
            <div className="md:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  Opções de Impressão
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Checkbox: Mostrar Código Impresso */}
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPlateCode}
                    onChange={(e) => setShowPlateCode(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Exibir Código da Placa</span>
                    <span className="text-[10px] text-slate-400">Imprime "{code}" abaixo do QR Code</span>
                  </div>
                </label>

                {/* Checkbox: Personalizar Título da Empresa */}
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useCustomCompany}
                    onChange={(e) => setUseCustomCompany(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Personalizar Empresa</span>
                    <span className="text-[10px] text-slate-400">Substitui a palavra "EMPRESA"</span>
                  </div>
                </label>
              </div>

              {/* Campo para nome da empresa caso ativo */}
              {useCustomCompany && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Digite o nome da empresa (Ex: VAREJÃO DO SILVA)"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none uppercase font-semibold"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Links Rápidos do Lote */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-3">
              <a
                href="/saida_L001/todos_L001.svg"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Folha de Conferência com os 100 QRs (SVG) ↗
              </a>
              <span>•</span>
              <a
                href="/saida_L001/lote_L001.csv"
                download
                className="hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Baixar Planilha CSV do Lote
              </a>
            </div>

            {/* Controles de Zoom do Preview na tela */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
              <span className="px-2 text-slate-400 font-medium">Zoom:</span>
              <button
                type="button"
                onClick={() => setZoomLevel('fit')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  zoomLevel === 'fit' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ajustar
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel('sm')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  zoomLevel === 'sm' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel('md')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  zoomLevel === 'md' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel('lg')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  zoomLevel === 'lg' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                100%
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ÁREA DE PRÉ-VISUALIZAÇÃO DA PLACA E ELEMENTO DE IMPRESSÃO          */}
      {/* ================================================================= */}
      <div className="flex flex-col items-center justify-center p-2 sm:p-6 bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden">
        
        {/* Contêiner de Impressão Alvo (#print-plate-canvas) */}
        <div
          id="print-plate-canvas"
          className="bg-white rounded-[26px] shadow-2xl shadow-slate-300 border border-slate-300/80 overflow-hidden flex items-center justify-center transition-all duration-200"
          style={{
            width: zoomLevel === 'fit' ? 'min(92vw, 420px)' : zoomLevel === 'sm' ? '280px' : zoomLevel === 'md' ? '380px' : '520px',
            aspectRatio: '576.16 / 819.45',
          }}
          dangerouslySetInnerHTML={{ __html: mergedSvg }}
        />

        <p className="print:hidden text-[11px] text-slate-400 mt-4 text-center">
          Proporção oficial Meia Folha Sulfite / Formato A5 (~148 × 210 mm) • Gráficos vetoriais SVG de alta resolução
        </p>
      </div>

      {/* ================================================================= */}
      {/* MODAL / GAVETA COM AS 100 PLACAS DO LOTE L001                      */}
      {/* ================================================================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[85vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Placas do Lote L001 (100 Placas)</h3>
                <p className="text-xs text-slate-500">Selecione qualquer código para pré-visualizar ou imprimir</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Barra de Busca no Lote */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                placeholder="Buscar código da placa (ex: TYJ...)"
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-xl pl-10 pr-4 py-2 text-xs font-mono uppercase outline-none"
              />
            </div>

            {/* Grid com todas as placas do lote */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto p-1 flex-1">
              {filteredBatch.map((item, idx) => {
                const isSelected = item.codigo === code;
                return (
                  <button
                    key={item.codigo}
                    type="button"
                    onClick={() => {
                      handleSelectCode(item.codigo);
                      setShowBatchModal(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">#{idx + 1}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <span className="text-xs font-mono font-bold tracking-wider block">{item.codigo}</span>
                    <span className="text-[9px] text-slate-400 truncate block">/r/{item.codigo}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{filteredBatch.length} placas encontradas</span>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
