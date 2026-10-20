import React, { useMemo } from 'react';

export type PlateTheme = 'crystal' | 'brand' | 'dark-gold';

export interface PixPlateData {
  type: 'pix';
  qrPathD: string;
  companyName: string;
  merchantName: string;
  merchantCity: string;
  pixKey: string;
  pixKeyType: string;
  amountText?: string | null;
  showKeyText: boolean;
  theme: PlateTheme;
}

export interface WifiPlateData {
  type: 'wifi';
  qrPathD: string;
  companyName: string;
  ssid: string;
  password?: string;
  encryption: string;
  showPasswordText: boolean;
  theme: PlateTheme;
}

export type PlateData = PixPlateData | WifiPlateData;

interface PlateSvgCanvasProps {
  data: PlateData;
  className?: string;
  id?: string;
}

/**
 * Renderizador de Placas Vetoriais de Alta Definição (ViewBox 576.16 x 819.45)
 * Utiliza o mesmo padrão de coordenadas, proporções e acabamento em acrílico do MODELO.svg
 */
export const PlateSvgCanvas: React.FC<PlateSvgCanvasProps> = ({ data, className = '', id = 'plate-svg' }) => {
  const svgContent = useMemo(() => {
    return generatePlateSvgString(data);
  }, [data]);

  return (
    <div
      id={id}
      className={`relative select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

/**
 * Função pura que gera a string SVG completa para exibição, download SVG,
 * conversão para PNG 300 DPI e impressão.
 */
export function generatePlateSvgString(data: PlateData): string {
  const isPix = data.type === 'pix';
  const theme = data.theme || 'crystal';
  const company = (data.companyName || '').trim().toUpperCase();

  // Definições de paletas por tema
  const palette = {
    crystal: {
      bgFill: '#F8FAFC',
      cardBorder: '#CBD5E1',
      acrylicGloss: 'rgba(255, 255, 255, 0.85)',
      primaryText: '#0F172A',
      secondaryText: '#475569',
      accentColor: isPix ? '#0D9488' : '#0284C7',
      accentBg: isPix ? '#F0FDFA' : '#F0F9FF',
      accentBorder: isPix ? '#99F6E4' : '#BAE6FD',
      qrFrameBorder: '#94A3B8',
      qrFrameBg: '#FFFFFF',
      badgeBg: '#F1F5F9',
      badgeText: '#334155',
      cutGuide: '#94A3B8',
    },
    brand: {
      bgFill: isPix ? 'url(#pix-bg-gradient)' : 'url(#wifi-bg-gradient)',
      cardBorder: isPix ? '#14B8A6' : '#38BDF8',
      acrylicGloss: 'rgba(255, 255, 255, 0.25)',
      primaryText: '#FFFFFF',
      secondaryText: isPix ? '#CCFBF1' : '#E0F2FE',
      accentColor: isPix ? '#2DD4BF' : '#38BDF8',
      accentBg: 'rgba(255, 255, 255, 0.15)',
      accentBorder: 'rgba(255, 255, 255, 0.3)',
      qrFrameBorder: '#FFFFFF',
      qrFrameBg: '#FFFFFF',
      badgeBg: 'rgba(0, 0, 0, 0.2)',
      badgeText: '#FFFFFF',
      cutGuide: 'rgba(255, 255, 255, 0.4)',
    },
    'dark-gold': {
      bgFill: 'url(#gold-bg-gradient)',
      cardBorder: '#F59E0B',
      acrylicGloss: 'rgba(245, 158, 11, 0.15)',
      primaryText: '#F8FAFC',
      secondaryText: '#E2E8F0',
      accentColor: '#FBBF24',
      accentBg: 'rgba(245, 158, 11, 0.15)',
      accentBorder: 'rgba(245, 158, 11, 0.4)',
      qrFrameBorder: '#F59E0B',
      qrFrameBg: '#FFFFFF',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeText: '#FDE68A',
      cutGuide: '#D97706',
    },
  }[theme];

  // Elementos do Topo (Nome da Empresa ou Destaque)
  const headerContent = company
    ? `
      <g id="header-company">
        <rect x="80" y="36" width="416.16" height="42" rx="10" fill="${palette.accentBg}" stroke="${palette.accentBorder}" stroke-width="1.5" />
        <text
          x="288.08"
          y="63"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="20"
          font-weight="800"
          letter-spacing="2"
          fill="${palette.primaryText}"
          text-anchor="middle"
        >
          ${escapeXml(company)}
        </text>
      </g>
    `
    : `
      <g id="header-empty">
        <line x1="160" y1="56" x2="416.16" y2="56" stroke="${palette.cardBorder}" stroke-width="1" stroke-dasharray="4,4" opacity="0.6" />
      </g>
    `;

  // Emblema Central e Título do Serviço
  let emblemSection = '';
  if (isPix) {
    const pixData = data as PixPlateData;
    emblemSection = `
      <!-- EMBLEMA PIX OFICIAL -->
      <g id="pix-emblem" transform="translate(188.08, 90)">
        <!-- Símbolo Pix Vetorial -->
        <g transform="translate(10, 0) scale(0.9)">
          <path
            d="M13.79 36.21L25 25L13.79 13.79C12.35 12.35 9.95 12.35 8.51 13.79L3.79 18.51C2.35 19.95 2.35 22.35 3.79 23.79L25 45L46.21 23.79C47.65 22.35 47.65 19.95 46.21 18.51L41.49 13.79C40.05 12.35 37.65 12.35 36.21 13.79L25 25L36.21 36.21C37.65 37.65 40.05 37.65 41.49 36.21L46.21 31.49C47.65 30.05 47.65 27.65 46.21 26.21L25 5L3.79 26.21C2.35 27.65 2.35 30.05 3.79 31.49L8.51 36.21C9.95 37.65 12.35 37.65 13.79 36.21Z"
            fill="${theme === 'brand' ? '#FFFFFF' : theme === 'dark-gold' ? '#FBBF24' : '#32BCAD'}"
          />
        </g>
        <!-- Tipografia 'pix' -->
        <g transform="translate(68, 5)" fill="${theme === 'brand' ? '#FFFFFF' : theme === 'dark-gold' ? '#FBBF24' : '#32BCAD'}">
          <path d="M0 8H7C10.5 8 13 10.5 13 14C13 17.5 10.5 20 7 20H3.8V27H0V8ZM3.8 16.5H6.8C8.2 16.5 9.2 15.6 9.2 14C9.2 12.4 8.2 11.5 6.8 11.5H3.8V16.5Z" />
          <path d="M19 12H23V27H19V12ZM21 6.5C22.2 6.5 23.2 7.4 23.2 8.6C23.2 9.8 22.2 10.7 21 10.7C19.8 10.7 18.8 9.8 18.8 8.6C18.8 7.4 19.8 6.5 21 6.5Z" />
          <path d="M28 12H32.5L35.8 17.2L39.1 12H43.6L38.3 19.2L43.8 27H39.2L35.8 21.8L32.4 27H28L33.3 19.2L28 12Z" />
        </g>
      </g>

      <!-- TÍTULO PRINCIPAL PIX -->
      <text
        x="288.08"
        y="160"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="28"
        font-weight="900"
        letter-spacing="1"
        fill="${palette.primaryText}"
        text-anchor="middle"
      >
        PAGUE COM PIX
      </text>

      <text
        x="288.08"
        y="186"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="14"
        font-weight="500"
        fill="${palette.secondaryText}"
        text-anchor="middle"
      >
        Aponte a câmera do aplicativo do seu banco
      </text>

      ${
        pixData.amountText
          ? `
        <!-- BADGE VALOR DEFINIDO -->
        <g id="amount-badge">
          <rect x="188.08" y="200" width="200" height="34" rx="17" fill="${palette.accentBg}" stroke="${palette.accentBorder}" stroke-width="1.5" />
          <text
            x="288.08"
            y="223"
            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            font-size="16"
            font-weight="800"
            fill="${palette.accentColor}"
            text-anchor="middle"
          >
            Valor: ${escapeXml(pixData.amountText)}
          </text>
        </g>
      `
          : ''
      }
    `;
  } else {
    const wifiData = data as WifiPlateData;
    emblemSection = `
      <!-- EMBLEMA WI-FI VETORIAL -->
      <g id="wifi-emblem" transform="translate(288.08, 108)">
        <!-- Ondas de Sinal Wi-Fi Estilizadas -->
        <circle cx="0" cy="18" r="4.5" fill="${palette.accentColor}" />
        <path d="M-15 9.5C-8.5 3 8.5 3 15 9.5" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" />
        <path d="M-28 -1C-15.5 -11 15.5 -11 28 -1" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" />
        <path d="M-40 -11C-22 -25 22 -25 40 -11" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" />
      </g>

      <!-- TÍTULO PRINCIPAL WI-FI -->
      <text
        x="288.08"
        y="160"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="28"
        font-weight="900"
        letter-spacing="1"
        fill="${palette.primaryText}"
        text-anchor="middle"
      >
        WI-FI GRATUITO
      </text>

      <text
        x="288.08"
        y="186"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="14"
        font-weight="500"
        fill="${palette.secondaryText}"
        text-anchor="middle"
      >
        Conecte-se apontando a câmera do celular
      </text>

      <!-- BADGE REDE SSID -->
      <g id="ssid-badge">
        <rect x="138.08" y="200" width="300" height="34" rx="17" fill="${palette.accentBg}" stroke="${palette.accentBorder}" stroke-width="1.5" />
        <text
          x="288.08"
          y="223"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="15"
          font-weight="700"
          fill="${palette.primaryText}"
          text-anchor="middle"
        >
          Rede: ${escapeXml(wifiData.ssid || 'Sua Rede')}
        </text>
      </g>
    `;
  }

  // Área Central do QR Code:
  // Usa o mesmo posicionamento de precisão do MODELO.svg
  // Centro: x=288.08, y=395
  // Cantoneiras refinadas nos 4 cantos
  const qrFrameY = 246.47;
  const qrFrameX = 138.08;
  const qrFrameSize = 300;

  const qrSection = `
    <!-- MOLDURA EXTERNA DO QR CODE COM CANTONEIRAS ESTILIZADAS -->
    <g id="qr-frame-container">
      <!-- Cantoneira Superior Esquerda -->
      <path d="M${qrFrameX - 6} ${qrFrameY + 36} L${qrFrameX - 6} ${qrFrameY - 6} L${qrFrameX + 36} ${qrFrameY - 6}" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Cantoneira Superior Direita -->
      <path d="M${qrFrameX + qrFrameSize - 36} ${qrFrameY - 6} L${qrFrameX + qrFrameSize + 6} ${qrFrameY - 6} L${qrFrameX + qrFrameSize + 6} ${qrFrameY + 36}" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Cantoneira Inferior Esquerda -->
      <path d="M${qrFrameX - 6} ${qrFrameY + qrFrameSize - 36} L${qrFrameX - 6} ${qrFrameY + qrFrameSize + 6} L${qrFrameX + 36} ${qrFrameY + qrFrameSize + 6}" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Cantoneira Inferior Direita -->
      <path d="M${qrFrameX + qrFrameSize - 36} ${qrFrameY + qrFrameSize + 6} L${qrFrameX + qrFrameSize + 6} ${qrFrameY + qrFrameSize + 6} L${qrFrameX + qrFrameSize + 6} ${qrFrameY + qrFrameSize - 36}" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Fundo Branco Absoluto para o QR Code (garantia de 100% legibilidade) -->
      <rect x="${qrFrameX}" y="${qrFrameY}" width="${qrFrameSize}" height="${qrFrameSize}" fill="#FFFFFF" rx="16" filter="url(#qr-shadow)" />

      <!-- QR Code Vetorial Dinâmico -->
      <g transform="translate(${qrFrameX + 18}, ${qrFrameY + 18})">
        <svg width="${qrFrameSize - 36}" height="${qrFrameSize - 36}" viewBox="0 0 580 580">
          <path transform="scale(20)" fill="none" stroke="#0F172A" stroke-width="1" class="qrline" d="${data.qrPathD}" />
        </svg>
      </g>
    </g>
  `;

  // Seção de Detalhes Abaixo do QR Code
  let footerDetails = '';
  if (isPix) {
    const pixData = data as PixPlateData;
    footerDetails = `
      <g id="pix-footer-details">
        <!-- Nome do Titular e Cidade -->
        <text
          x="288.08"
          y="584"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="17"
          font-weight="800"
          fill="${palette.primaryText}"
          text-anchor="middle"
        >
          ${escapeXml(pixData.merchantName)}
        </text>

        <text
          x="288.08"
          y="606"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="13"
          font-weight="500"
          fill="${palette.secondaryText}"
          text-anchor="middle"
        >
          ${escapeXml(pixData.merchantCity)}
        </text>

        ${
          pixData.showKeyText && pixData.pixKey
            ? `
          <!-- CHAVE PIX POR EXTENSO -->
          <g id="pix-key-box">
            <rect x="100" y="626" width="376.16" height="38" rx="8" fill="${palette.badgeBg}" stroke="${palette.cardBorder}" stroke-width="1" />
            <text
              x="288.08"
              y="650"
              font-family="'SF Mono', 'Roboto Mono', 'Courier New', monospace"
              font-size="13"
              font-weight="700"
              fill="${palette.primaryText}"
              text-anchor="middle"
              letter-spacing="0.5"
            >
              Chave: ${escapeXml(pixData.pixKey)}
            </text>
          </g>
        `
            : ''
        }

        <!-- Selo de instrução -->
        <text
          x="288.08"
          y="${pixData.showKeyText ? 698 : 660}"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="12"
          font-weight="600"
          fill="${palette.secondaryText}"
          text-anchor="middle"
        >
          Transação segura com confirmação instantânea
        </text>
      </g>
    `;
  } else {
    const wifiData = data as WifiPlateData;
    footerDetails = `
      <g id="wifi-footer-details">
        ${
          wifiData.showPasswordText && wifiData.password
            ? `
          <!-- SENHA DO WI-FI POR EXTENSO -->
          <g id="wifi-password-box">
            <rect x="100" y="580" width="376.16" height="54" rx="10" fill="${palette.badgeBg}" stroke="${palette.cardBorder}" stroke-width="1.5" />
            <text
              x="288.08"
              y="602"
              font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="12"
              font-weight="600"
              fill="${palette.secondaryText}"
              text-anchor="middle"
            >
              SENHA DA REDE:
            </text>
            <text
              x="288.08"
              y="624"
              font-family="'SF Mono', 'Roboto Mono', 'Courier New', monospace"
              font-size="18"
              font-weight="800"
              fill="${palette.primaryText}"
              text-anchor="middle"
              letter-spacing="1"
            >
              ${escapeXml(wifiData.password)}
            </text>
          </g>
        `
            : `
          <text
            x="288.08"
            y="600"
            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            font-size="15"
            font-weight="700"
            fill="${palette.primaryText}"
            text-anchor="middle"
          >
            Rede Protegida (${wifiData.encryption})
          </text>
        `
        }

        <!-- Dica de Conexão -->
        <text
          x="288.08"
          y="668"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="13"
          font-weight="600"
          fill="${palette.secondaryText}"
          text-anchor="middle"
        >
          Compatível com iPhone (iOS) e Android
        </text>
      </g>
    `;
  }

  // Rodapé com divulgação elegante da Placa do Google e Linha de Corte
  const footerPromo = `
    <!-- RODAPÉ DE DIVULGAÇÃO VIRAL E LINHA DE CORTE -->
    <g id="plate-footer-promo">
      <!-- Linha divisória sutil -->
      <line x1="60" y1="740" x2="516.16" y2="740" stroke="${palette.cutGuide}" stroke-width="1" stroke-dasharray="6,4" opacity="0.6" />

      <!-- Chamada para a Placa Google -->
      <text
        x="288.08"
        y="766"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="11"
        font-weight="700"
        fill="${palette.accentColor}"
        text-anchor="middle"
        letter-spacing="0.5"
      >
        QUER MAIS AVALIAÇÕES 5 ESTRELAS NO GOOGLE?
      </text>

      <text
        x="288.08"
        y="784"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="10"
        font-weight="500"
        fill="${palette.secondaryText}"
        text-anchor="middle"
      >
        Conheça a Placa Inteligente em Acrílico com QR Code Dinâmico • placaqr.pages.dev
      </text>
    </g>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 576.16 819.45"
  width="100%"
  height="100%"
  style="display: block; shape-rendering: geometricPrecision; text-rendering: geometricPrecision;"
>
  <defs>
    <!-- Sombra suave para o QR Code -->
    <filter id="qr-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.12" />
    </filter>

    <!-- Sombra de relevo da placa de acrílico -->
    <filter id="acrylic-depth" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.18" />
    </filter>

    <!-- Gradiente Oficial Pix -->
    <linearGradient id="pix-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F766E" />
      <stop offset="50%" stop-color="#0D9488" />
      <stop offset="100%" stop-color="#042F2E" />
    </linearGradient>

    <!-- Gradiente Oficial Wi-Fi -->
    <linearGradient id="wifi-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0369A1" />
      <stop offset="50%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#082F49" />
    </linearGradient>

    <!-- Gradiente Black & Gold Luxo -->
    <linearGradient id="gold-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="40%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Brilho Chanfrado de Acrílico (Gloss Highlight) -->
    <linearGradient id="acrylic-gloss-gradient" x1="0%" y1="0%" x2="100%" y2="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
      <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.1" />
      <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <!-- 1. CORPO DA PLACA EM ACRÍLICO (Contorno externo com chanfro e cantos arredondados) -->
  <g id="acrylic-plate-body">
    <!-- Placa Principal com corte a laser -->
    <rect
      x="16"
      y="16"
      width="544.16"
      height="787.45"
      rx="28"
      fill="${palette.bgFill}"
      stroke="${palette.cardBorder}"
      stroke-width="3"
      filter="url(#acrylic-depth)"
    />

    <!-- Borda interna fina simulando o bisotê/chanfro do acrílico -->
    <rect
      x="24"
      y="24"
      width="528.16"
      height="771.45"
      rx="22"
      fill="none"
      stroke="${palette.cardBorder}"
      stroke-width="1"
      opacity="0.4"
    />

    <!-- Efeito de Reflexo de Luz no Acrílico (Lustre Diagonal) -->
    <path
      d="M24 24 L340 24 L24 450 Z"
      fill="url(#acrylic-gloss-gradient)"
      opacity="${theme === 'crystal' ? '0.7' : '0.2'}"
    />
  </g>

  <!-- 2. CABEÇALHO / NOME DA EMPRESA -->
  ${headerContent}

  <!-- 3. SEÇÃO DO EMBLEMA E TÍTULO -->
  ${emblemSection}

  <!-- 4. ÁREA CENTRAL DO QR CODE -->
  ${qrSection}

  <!-- 5. DETALHES INFORMATIVOS ABAIXO DO QR CODE -->
  ${footerDetails}

  <!-- 6. RODAPÉ DE DIVULGAÇÃO DA PLACA GOOGLE -->
  ${footerPromo}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
