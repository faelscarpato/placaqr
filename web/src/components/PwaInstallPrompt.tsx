import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    // 1. Verifica se já está rodando como app instalado (standalone)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detecta se é dispositivo iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Captura o evento nativo de instalação do Chrome / Edge / Android
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
    }
  };

  if (isInstalled || dismissed) {
    return null;
  }

  // Se não temos o evento no Android/Chrome e não é iOS, não renderiza
  if (!deferredPrompt && !isIos) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-4 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
            <img 
              src="/icons/launchericon-96x96.png" 
              alt="Placa QR" 
              className="w-9 h-9 object-contain rounded-xl"
            />
          </div>
          <div>
            <h4 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 leading-tight">
              Instalar Aplicativo Placa QR
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                PWA
              </span>
            </h4>
            <p className="text-xs text-blue-100 mt-0.5">
              Acesso rápido direto da tela inicial, sem barra de navegação.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="py-2 px-3.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
          
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guia explicativo para iOS Safari */}
      {showIosGuide && isIos && (
        <div className="mt-3 pt-3 border-t border-white/20 text-xs text-blue-50 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-200" />
            Como instalar no iPhone / iPad:
          </p>
          <p>1. Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) no Safari.</p>
          <p>2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</p>
        </div>
      )}
    </div>
  );
};
