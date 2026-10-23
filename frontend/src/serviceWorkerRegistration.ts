// Service Worker Registration & Live Update Handler

export function registerServiceWorker(onUpdateAvailable?: () => void) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);

          // Check for updates periodically (every 15 minutes)
          setInterval(() => {
            registration.update().catch((err) => {
              console.debug('[PWA] Periodic update check skipped:', err);
            });
          }, 15 * 60 * 1000);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New version available!
                  console.log('[PWA] New version deployed & installed. Ready for reload.');
                  if (onUpdateAvailable) {
                    onUpdateAvailable();
                  } else {
                    // Auto-reload to immediately show the new deployment
                    window.location.reload();
                  }
                } else {
                  console.log('[PWA] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });

      // Reload page when new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[PWA] Controller changed. Refreshing client for instant update.');
          window.location.reload();
        }
      });
    });
  }
}
