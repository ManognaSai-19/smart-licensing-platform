import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, RefreshCw } from 'lucide-react';

interface InstallPwaPromptProps {
  hasUpdate?: boolean;
  onRefreshUpdate?: () => void;
}

export const InstallPwaPrompt: React.FC<InstallPwaPromptProps> = ({
  hasUpdate = false,
  onRefreshUpdate,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosTip, setShowIosTip] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect if already running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneNav = (window.navigator as any).standalone === true;
      return isStandaloneMedia || isStandaloneNav;
    };

    setIsStandalone(checkStandalone());

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Catch Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 4. Listen for manual trigger from UI buttons
    const handleManualTrigger = () => {
      setIsDismissed(false);
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else if (/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())) {
        setShowIosTip(true);
      } else {
        alert('To install this app on your device:\n\n1. In Chrome, tap the menu (⋮) and select "Install app" or "Add to Home screen".\n2. In Safari, tap Share (⎋) and select "Add to Home Screen".');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('trigger-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-pwa-install', handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the installation prompt');
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosTip(true);
    }
  };

  // If already installed and running standalone, do not show install banner (only show update banner if new version arrived)
  if (isStandalone && !hasUpdate) {
    return null;
  }

  // If user dismissed this session and no urgent update
  if (isDismissed && !hasUpdate) {
    return null;
  }

  // 1. Priority: UPDATE NOTIFICATION (If user opened app and a new deploy is ready)
  if (hasUpdate) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] bg-[#101828] text-white p-3.5 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold">New Update Available!</h4>
            <p className="text-[11px] text-blue-200">The platform was updated on the server.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onRefreshUpdate) onRefreshUpdate();
            else window.location.reload();
          }}
          className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs transition"
        >
          Update Now
        </button>
      </div>
    );
  }

  // 2. INSTALL PROMPT (Visible on mobile web browser)
  if (!deferredPrompt && !isIos) {
    return null;
  }

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-80 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-3.5 animate-in fade-in slide-in-from-bottom-4 text-[#101828]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#101828] flex items-center justify-center p-1 relative overflow-hidden shrink-0 shadow-xs">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB] to-[#9333EA] opacity-80" />
            <div className="relative w-full h-full bg-[#101828] rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-extrabold flex items-center gap-1.5">
              <span>Install Mobile App</span>
              <Sparkles className="w-3 h-3 text-[#2563EB]" />
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Install for instant 1-tap full-screen access
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {showIosTip ? (
        <div className="mt-2.5 p-2 bg-[#EAF2FF] rounded-xl text-[11px] text-[#101828] border border-blue-200">
          Tap the <strong>Share</strong> button (box with arrow <span className="font-mono">⎋</span>) in Safari, then tap <strong>"Add to Home Screen" ⊕</strong>.
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      )}
    </aside>
  );
};
