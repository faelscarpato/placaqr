import React from 'react';

interface PixLogoProps {
  className?: string;
  size?: number;
  color?: string;
  withText?: boolean;
}

/**
 * Logotipo vetorial oficial do Pix (Banco Central do Brasil)
 */
export const PixLogo: React.FC<PixLogoProps> = ({
  className = '',
  size = 32,
  color = '#32BCAD',
  withText = false,
}) => {
  return (
    <svg
      width={withText ? size * 3.2 : size}
      height={size}
      viewBox={withText ? '0 0 160 50' : '0 0 50 50'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Símbolo do Pix (4 losangos interligados) */}
      <g transform="translate(0, 0)">
        <path
          d="M13.79 36.21L25 25L13.79 13.79C12.35 12.35 9.95 12.35 8.51 13.79L3.79 18.51C2.35 19.95 2.35 22.35 3.79 23.79L25 45L46.21 23.79C47.65 22.35 47.65 19.95 46.21 18.51L41.49 13.79C40.05 12.35 37.65 12.35 36.21 13.79L25 25L36.21 36.21C37.65 37.65 40.05 37.65 41.49 36.21L46.21 31.49C47.65 30.05 47.65 27.65 46.21 26.21L25 5L3.79 26.21C2.35 27.65 2.35 30.05 3.79 31.49L8.51 36.21C9.95 37.65 12.35 37.65 13.79 36.21Z"
          fill={color}
        />
      </g>

      {/* Tipografia "pix" oficial quando withText = true */}
      {withText && (
        <g fill={color}>
          {/* Letra 'p' */}
          <path d="M60 17H68.5C72.5 17 75.5 19.8 75.5 24C75.5 28.2 72.5 31 68.5 31H64.8V39H60V17ZM64.8 26.8H68.2C70 26.8 71 25.7 71 24C71 22.3 70 21.2 68.2 21.2H64.8V26.8Z" />
          {/* Letra 'i' */}
          <path d="M82 22H86.8V39H82V22ZM84.4 15.5C85.9 15.5 87 16.6 87 18.1C87 19.6 85.9 20.7 84.4 20.7C82.9 20.7 81.8 19.6 81.8 18.1C81.8 16.6 82.9 15.5 84.4 15.5Z" />
          {/* Letra 'x' */}
          <path d="M93 22H98.5L102.5 28.2L106.5 22H112L105.5 30.5L112 39H106.5L102.5 32.8L98.5 39H93L99.5 30.5L93 22Z" />
        </g>
      )}
    </svg>
  );
};
