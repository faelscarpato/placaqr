import React, { useMemo } from 'react';

export type PlateTheme = 'crystal' | 'brand' | 'dark-gold';

export interface PixPlateData {
  type: 'pix';
  qrDataUrl: string;
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
  qrDataUrl: string;
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
export const PlateSvgCanvas: React.FC<PlateSvgCanvasProps> = ({ 
  data, 
  className = '', 
  id = 'printable-plate-area' 
}) => {
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
 * Função pura que gera a string SVG completa para exibição,
 * conversão para PNG 300 DPI e impressão isolada.
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
      accentColor: isPix ? '#39B0A3' : '#0284C7',
      accentBg: isPix ? '#F0FDFA' : '#F0F9FF',
      accentBorder: isPix ? '#99F6E4' : '#BAE6FD',
      qrFrameBorder: '#94A3B8',
      badgeBg: '#F1F5F9',
      cutGuide: '#94A3B8',
      pixColor1: '#39b0a3',
      pixColor2: '#475569',
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
      badgeBg: 'rgba(0, 0, 0, 0.2)',
      cutGuide: 'rgba(255, 255, 255, 0.4)',
      pixColor1: '#FFFFFF',
      pixColor2: '#E0F2FE',
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
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      cutGuide: '#D97706',
      pixColor1: '#FBBF24',
      pixColor2: '#FDE68A',
    },
  }[theme];

  // Elementos do Topo (Nome da Empresa ou Destaque)
  const headerContent = company
    ? `
      <g id="header-company">
        <rect x="80" y="32" width="416.16" height="42" rx="10" fill="${palette.accentBg}" stroke="${palette.accentBorder}" stroke-width="1.5" />
        <text
          x="288.08"
          y="59"
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
        <line x1="160" y1="52" x2="416.16" y2="52" stroke="${palette.cardBorder}" stroke-width="1" stroke-dasharray="4,4" opacity="0.6" />
      </g>
    `;

  // Emblema Central e Título do Serviço
  let emblemSection = '';
  if (isPix) {
    const pixData = data as PixPlateData;
    emblemSection = `
      <!-- LOGOTIPO OFICIAL DO PIX (BANCO CENTRAL DO BRASIL - VETOR OFICIAL) -->
      <g id="pix-official-logo" transform="translate(168.08, 86)">
        <svg viewBox="0 0 318.36 112.63" width="240" height="85">
          <g id="OBJECTS">
            <path fill="${palette.pixColor1}" d="M217.52,11.34c-1.16,1.17-2.69,1.2-3.79.1l-3.48-3.46c-1.13-1.13-1.12-2.61,0-3.73l3.48-3.46c1.09-1.08,2.62-1.05,3.68.03l3.63,3.67c.87.88.88,2.38,0,3.26l-3.54,3.59Z"/>
            <path fill="${palette.pixColor1}" d="M88.66,83.29h-6c-3.08.02-5.92-.88-8.13-3.08l-16.11-16.01c-2.55-2.54-7.4-2.71-9.99-.13l-15.94,15.84c-2.23,2.22-4.96,3.45-8.16,3.44h-7.52s-12.42-12.5-12.42-12.5c-5.88-5.91-5.82-15.66.05-21.57l12.37-12.43h6.88c2.92.02,5.87.64,8.02,2.78l16.26,16.17c2.87,2.86,7.64,3.06,10.57.14l16.25-16.15c2.12-2.11,4.94-2.86,7.86-2.88l5.91-.04,12.2,12.22c6.16,6.18,5.89,16.19-.23,22.32l-11.86,11.88Z"/>
            <path fill="${palette.pixColor1}" d="M64.15,107.74c-6.08,6.07-16.02,6.72-22.15.63l-20.53-20.39c5.02.16,9.74-.43,13.21-3.88l16.77-16.64c1.23-.89,2.79-.85,3.91.16l16.08,16.01c3.35,3.34,7.85,4.49,12.59,4.26l-19.89,19.85Z"/>
            <path fill="${palette.pixColor1}" d="M55.51,52.42c-1.27,1.37-3.07,1.31-4.28.1l-15.39-15.38c-3.92-3.92-8.92-5.44-14.54-4.77l20.02-19.99c6.42-6.41,16.49-6.22,22.85.14l19.82,19.83c-4.98-.35-9.51,1.15-13.02,4.64l-15.48,15.43Z"/>
            <path fill="${palette.pixColor2}" d="M318.35,74.86v1.57c-.17.15-1.1,1.11-1.57,1.12l-6.69.05c-5.08.04-9.61-1.75-13.15-5.29l-19.21-19.15c-1.61-1.61-4.34-1.61-5.94-.02l-19.57,19.47c-3.41,3.39-7.99,5.06-12.74,5.05l-8.28-.03c-1.12,0-1.81-1.36-1.66-2.31.14-.82,1.02-1.66,1.99-1.66h7.91c3.94.02,7.49-1.43,10.27-4.21l19.04-19c3.35-3.35,8.62-3.31,11.96.02l19.05,18.99c2.59,2.58,5.89,4.05,9.65,4.09l7.32.09c.51,0,1.44.97,1.61,1.21Z"/>
            <path fill="${palette.pixColor2}" d="M318.36,18.31v1.53c-.16.16-1.09,1.16-1.55,1.16l-7.03.05c-4.03.03-7.4,1.51-10.17,4.27l-18.87,18.83c-3.36,3.35-8.63,3.37-11.99.02l-19.04-19c-2.66-2.66-6.13-4.17-9.92-4.18l-8.24-.02c-2.62-.04-2.68-3.88-.05-3.99,0,0,7.98,0,7.98,0,4.88,0,9.43,1.73,12.91,5.2l19.04,18.99c1.88,1.88,4.55,2.07,6.49.13l19.21-19.14c3.47-3.46,8.04-5.14,12.95-5.11l6.62.03c.5,0,1.48.96,1.67,1.23Z"/>
            <path fill="${palette.pixColor2}" d="M191.15,54.48v-14.11c0-11.17-9.29-19.36-20.31-19.37h-17.61c-10.68-.02-20.11,8.07-20.12,19.07l-.07,64.75c0,1.34-.75,2.18-1.85,2.25-1.25.07-2.15-.78-2.15-2.24l.1-65.12c.02-12.36,10.56-22.63,22.74-22.61l20.56.03c12.44.02,22.69,10.52,22.68,22.88v14.92c-.01,12.07-10.05,22.37-22.3,22.72l-28.19.11c-2.63-.07-2.62-3.95,0-3.98,0,0,27.19-.04,27.19-.04,10.58-.01,19.3-8.61,19.31-19.28Z"/>
            <path fill="${palette.pixColor2}" d="M213.65,76.19l-.02-48.36c0-3.95-3.22-6.8-6.96-6.8h-8.29c-1.02,0-1.91-1.12-1.88-1.98.03-1.2.96-2,2.2-2.01l7.6-.03c6.43-.02,11.34,4.7,11.34,11.15l-.02,47.91c.01,2.48-3.79,2.79-3.97.13Z"/>
            <g>
              <path fill="${palette.pixColor1}" d="M230.24,100.83c.58.49,1.24,1.42,1.19,2.14-.04.61-1.01,1.72-1.67,1.74l-6.17.17v-7.81s5.71.12,5.71.12c.55.01,1.57.9,1.68,1.44.11.61-.31,1.53-.75,2.2ZM229.06,98.79c-.65-.4-2.43-.55-3.21-.42-.43.07-.83,1.47-.47,1.7.97.58,2.46.23,3.5.09.29-.04.43-1.21.18-1.37ZM229.45,102.1c-.75-.61-2.68-.62-3.61-.5-.49.06-.86,1.54-.42,1.75.86.39,2.53.18,3.49.15.37-.02,1.03-1.01.54-1.41Z"/>
              <path fill="${palette.pixColor1}" d="M275.8,103.43l1.55-.24c.28-.04.23.84.12,1.1-.21.48-4.53,1.34-6.32-.01-2-1.51-1.93-5.15.21-6.61,1.37-.93,4.02-.72,5.49-.67.39.01.77,1.38.4,1.37-1.66.08-4.22-.44-5.29,1.01-.58.85-.59,2.57.17,3.49.67.82,2.39.75,3.68.55Z"/>
              <path fill="${palette.pixColor1}" d="M284.03,103.66l1.29-.12c.21-.02.09.58.04,1.06-3.15.66-7.75,1.02-6.6-3.73.68-2.37,4.71-2.35,6.13-1.14.48.41.71,1.55.84,2.59l-5.63.09c.68,1.78,2.32,1.39,3.92,1.24ZM284.16,101.34c-.6-1.54-1.53-1.36-2.45-1.31-.53.03-1.07.44-1.6,1.25l4.05.06Z"/>
              <path fill="${palette.pixColor1}" d="M262.83,99.26c1.82.56,1.93,2.52,1.55,3.9-.42,1.51-2.1,1.87-3.71,1.86s-3.2-.36-3.62-1.98c-.96-3.88,2.64-4.58,5.78-3.77ZM261.45,103.76c1.43-.21,1.6-1.39,1.38-2.37-.13-.57-.96-1.2-1.82-1.23s-1.93.24-2.21.75c-.32.59-.25,1.83.13,2.28s1.74.68,2.51.57Z"/>
              <path fill="${palette.pixColor1}" d="M235.59,104.97c-1.21.07-2.39-.38-2.59-1.34-.24-1.12.6-2.21,1.89-2.23l3.41-.06c-.74-2.04-4.46-.76-4.44-1.26l.03-.92s4.49-.85,5.49.87c.62,1.07.34,3.49.34,4.7l-4.12.24ZM237.64,102.41c-.84-.1-2.85-.13-3.01.56-.2.86,1.51,1.07,2.22.84l1.33-.43c.22-.07-.31-.95-.55-.98Z"/>
              <path fill="${palette.pixColor1}" d="M309.51,104.97c-1.19.07-2.33-.39-2.56-1.4s.66-2.15,1.84-2.18l3.45-.08c-.78-1.76-2.79-1.05-4.3-1.1-.21,0-.18-.6-.16-.83.06-.53,4.58-.94,5.53.61.67,1.09.36,3.52.36,4.72l-4.17.24ZM312.37,102.77c-1.51-.59-2.86-.53-4.05.11.76,1.5,3.17,1.39,4.05-.11Z"/>
              <path fill="${palette.pixColor1}" d="M292.69,104.77c.14-3.33.46-5.41-3.73-4.08l-.08,4.15-1.57-.02v-5.65c3.45.43,6.08-1.31,7,1.54l.02,4.15-1.63-.08Z"/>
              <path fill="${palette.pixColor1}" d="M247.24,104.81l-.17-4.25c-1.38-.33-2.57-.25-3.71.14l.04,4.13-1.62-.03v-5.67c2.83.34,6.74-.87,6.83,1.14l.21,4.55h-1.58Z"/>
              <path fill="${palette.pixColor1}" d="M298.04,101.3l.33,2.2,2.27.3c-.16,1.58-1.72,1.29-2.74,1.08-2.14-.87-.99-3.86-1.43-4.12l-.97-.58c-.19-.12-.28-.72-.1-.85s.87-.3.95-.51l.5-1.32c.13-.35,1.34-.07,1.3.3-.03.33-.09,1.26.16,1.27l1.15.09c.2.02.88-.2.9,0l.05.96c.02.27-.51.25-.9.23l-.92-.05c-.25-.01-.59.74-.55,1.01Z"/>
              <path fill="${palette.pixColor1}" d="M255.98,99.84c0,.99-2.5-.19-3.66.88-.44.41-.53,1.82-.24,2.33.34.6,1.79.77,2.58.64l1.19-.2c.22-.04.32.68.22.88-.3.6-3.92,1.13-5.14-.2-.9-.99-.89-2.87-.26-3.88.8-1.29,2.54-1.41,4.04-1.3l1.06.07c.21.01.21.56.21.77Z"/>
              <polygon fill="${palette.pixColor1}" points="303.52 100.57 303.57 104.85 301.94 104.81 301.94 99.16 306.26 99.04 306.36 100.31 303.52 100.57"/>
              <rect fill="${palette.pixColor1}" x="315.76" y="96.73" width="1.6" height="8.1"/>
            </g>
            <g>
              <path fill="${palette.pixColor2}" d="M146.02,104.94l-1.22-.18c-.33-.05-.3,1.06-.3,1.39v.72c0,.16-.31.13-.66.1v-7.81s3.77-.14,3.77-.14c2.24-.09,3.09,1.67,2.81,3.57s-2.11,2.69-4.4,2.36ZM149.59,102.99c.28-.85.14-2.35-.59-2.92-1.04-.81-4.05-.28-4.29.14-.33.6-.36,2.97.02,3.71.28.55,4.22.99,4.86-.93Z"/>
              <path fill="${palette.pixColor2}" d="M205.16,99.11c.01.71,3.6-1.11,5.28.74.65.72.8,2.23.4,3.4-.32.94-1.71,1.82-2.94,1.74l-3.46-.23.02-8.01c.32-.02.67-.07.67.12,0,.55.03,1.68.04,2.23ZM210.21,102.93c.26-.85.12-2.29-.58-2.86-.97-.8-3.87-.35-4.27.13-.35.42-.43,2.96.01,3.71.36.6,4.24.97,4.83-.99Z"/>
              <polygon fill="${palette.pixColor2}" points="167.63 103.68 169.68 99.01 170.3 99.12 167.62 105.29 165.07 100.16 162.57 105.24 160.03 99.14 160.64 99.06 162.64 103.8 165.07 98.68 167.63 103.68"/>
              <path fill="${palette.pixColor2}" d="M186.21,104.38c1.03.14,4.17-.22,4.17-.22-1.67,1.17-3.99,1.16-5.51.29-1.27-.72-1.25-2.66-.84-3.8.82-2.25,4.76-1.97,5.69-.85.43.51.6,1.57.64,2.35l-5.86.05c-.01,1.04.57,2.01,1.7,2.17ZM189.68,101.58c-.27-1.91-1.54-2-2.72-1.98-1.06.02-2.07.28-2.51,1.92l5.23.06Z"/>
              <path fill="${palette.pixColor2}" d="M198.32,104.81c-2.69-.29-5.88,1.26-6.52-1.83-.39-1.92.44-4.05,2.64-3.93l3.17.17.15-2.61h.55s0,8.21,0,8.21ZM197.68,103.89l-.04-3.96c-1.45-.33-3.11-.6-4.36.2s-1.17,3.38.25,3.95c1.22.49,2.84.12,4.16-.19Z"/>
              <path fill="${palette.pixColor2}" d="M173.6,104.38l4.18-.21c-1.67,1.16-3.97,1.15-5.49.27-1.26-.73-1.24-2.64-.84-3.74.85-2.32,4.73-2.03,5.69-.9.42.49.62,1.61.65,2.35l-5.87.05c0,1.03.62,1.78,1.66,2.17ZM177.1,101.58c-.23-1.9-1.54-1.98-2.73-1.98-1.03,0-2.03.3-2.48,1.91l5.21.06Z"/>
              <path fill="${palette.pixColor2}" d="M157.12,99.2c1.87.52,2,2.3,1.73,3.78s-1.87,2.08-3.57,2.05-3.09-.57-3.39-2.22c-.23-1.29.02-3.06,1.67-3.58.9-.28,2.54-.31,3.55-.03ZM155.43,104.41c3.77.24,3.79-4.88.15-4.83-1.71-.05-2.98.58-3.04,2.17-.06,1.67.92,2.66,2.89,2.66Z"/>
              <path fill="${palette.pixColor2}" d="M215.25,105.4c-.64,1.3-2.39,2.59-3.53,1.01.95.34,3.42-.37,2.85-1.56l-2.73-5.7.59-.16,2.7,4.97,2.59-4.97.61.14-3.09,6.26Z"/>
              <path fill="${palette.pixColor2}" d="M181.49,99.83c-.66.19-1.11.79-1.12,1.48l-.03,3.52-.61.03-.06-4.12c-.01-.88.71-1.6,1.59-1.57l2.33.06-2.1.61Z"/>
            </g>
          </g>
        </svg>
      </g>

      <!-- TÍTULO PRINCIPAL PIX -->
      <text
        x="288.08"
        y="182"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="22"
        font-weight="900"
        letter-spacing="1"
        fill="${palette.primaryText}"
        text-anchor="middle"
      >
        PAGUE COM PIX
      </text>

      <text
        x="288.08"
        y="204"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="13"
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
          <rect x="188.08" y="214" width="200" height="30" rx="15" fill="${palette.accentBg}" stroke="${palette.accentBorder}" stroke-width="1.5" />
          <text
            x="288.08"
            y="234"
            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            font-size="15"
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
      <g id="wifi-emblem" transform="translate(288.08, 102)">
        <circle cx="0" cy="18" r="4.5" fill="${palette.accentColor}" />
        <path d="M-15 9.5C-8.5 3 8.5 3 15 9.5" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" />
        <path d="M-28 -1C-15.5 -11 15.5 -11 28 -1" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" />
        <path d="M-40 -11C-22 -25 22 -25 40 -11" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" />
      </g>

      <!-- TÍTULO PRINCIPAL WI-FI -->
      <text
        x="288.08"
        y="156"
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
        y="180"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="13"
        font-weight="500"
        fill="${palette.secondaryText}"
        text-anchor="middle"
      >
        Conecte-se apontando a câmera do celular
      </text>

      <!-- BADGE REDE SSID -->
      <g id="ssid-badge">
        <rect x="138.08" y="196" width="300" height="34" rx="17" fill="${palette.accentBg}" stroke="${palette.accentBorder}" stroke-width="1.5" />
        <text
          x="288.08"
          y="219"
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
  // Usa posicionamento com cantoneiras de precisão
  const qrFrameY = 248;
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
      <path d="M${qrFrameX + qrFrameSize - 36} ${qrFrameY + qrFrameSize + 6} L${qrFrameX + qrFrameSize + 6} ${qrFrameY + qrFrameSize + 6} L${qrFrameX + qrFrameSize + 6} ${qrFrameY - 36}" fill="none" stroke="${palette.accentColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Fundo Branco Absoluto para o QR Code -->
      <rect x="${qrFrameX}" y="${qrFrameY}" width="${qrFrameSize}" height="${qrFrameSize}" fill="#FFFFFF" rx="16" filter="url(#qr-shadow)" />

      <!-- QR CODE EM ALTA RESOLUÇÃO (GARANTIA TOTAL DE RENDERIZAÇÃO) -->
      ${
        data.qrDataUrl
          ? `
        <image
          href="${data.qrDataUrl}"
          x="${qrFrameX + 16}"
          y="${qrFrameY + 16}"
          width="${qrFrameSize - 32}"
          height="${qrFrameSize - 32}"
          style="image-rendering: crisp-edges;"
        />
      `
          : `
        <rect x="${qrFrameX + 16}" y="${qrFrameY + 16}" width="${qrFrameSize - 32}" height="${qrFrameSize - 32}" fill="#F1F5F9" rx="8" />
        <text x="288.08" y="398" font-family="sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">Gerando QR Code...</text>
      `
      }
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
            <rect x="90" y="626" width="396.16" height="38" rx="8" fill="${palette.badgeBg}" stroke="${palette.cardBorder}" stroke-width="1" />
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
            <rect x="90" y="580" width="396.16" height="54" rx="10" fill="${palette.badgeBg}" stroke="${palette.cardBorder}" stroke-width="1.5" />
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

  <!-- 1. CORPO DA PLACA EM ACRÍLICO -->
  <g id="acrylic-plate-body">
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
