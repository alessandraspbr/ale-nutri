import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, X, Sparkles } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        alert('Para instalar no iPhone/iPad: toque no ícone de Compartilhar (no rodapé do Safari) e selecione "Adicionar à Tela de Início".');
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  // If already installed or neither prompt nor iOS, don't show
  if (isInstalled) return null;
  if (!showBanner && !isIOS && !deferredPrompt) return null;

  return (
    <div className="pwa-install-banner" role="complementary" aria-label="Instalação do Aplicativo">
      <div className="pwa-banner-content">
        <div className="pwa-icon-box">
          <Smartphone size={20} />
        </div>
        <div className="pwa-text-box">
          <strong>Instalar o Ale Nutri</strong>
          <span>Acesse direto da sua área de trabalho ou celular como um aplicativo rápido e sem abas.</span>
        </div>
      </div>

      <div className="pwa-actions">
        <button className="btn-pwa-install" onClick={handleInstallClick}>
          <Download size={15} />
          <span>Instalar Agora</span>
        </button>
        <button 
          className="btn-pwa-dismiss" 
          onClick={() => setShowBanner(false)}
          aria-label="Dispensar aviso de instalação"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function SidebarInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return (
      <div className="sidebar-pwa-installed">
        <CheckCircle size={14} className="text-success" />
        <span>App Instalado</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar: clique no ícone de computador/instalação na barra de endereço do seu navegador ou no menu de opções.');
    }
  };

  return (
    <button className="sidebar-pwa-btn" onClick={handleClick} title="Instalar aplicativo no computador ou celular">
      <Download size={15} />
      <span>Instalar App (PWA)</span>
    </button>
  );
}
