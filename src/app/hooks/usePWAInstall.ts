import { useState, useEffect } from 'react';

// Shared across components via module-level variable
let _deferredPrompt: any = null;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach(fn => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    _deferredPrompt = null;
    notify();
  });
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(!!_deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(
    typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches
  );
  const [isIOS] = useState(
    typeof window !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as any).MSStream
  );

  useEffect(() => {
    const update = () => {
      setCanInstall(!!_deferredPrompt);
    };
    _listeners.add(update);
    return () => { _listeners.delete(update); };
  }, []);

  const install = async () => {
    if (!_deferredPrompt) return false;
    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      _deferredPrompt = null;
      notify();
    }
    return outcome === 'accepted';
  };

  return { canInstall, isInstalled, isIOS, install };
}
