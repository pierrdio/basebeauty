'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 z-50 p-4 font-onest">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white text-sm sm:text-base flex-1">
          <p className="mb-2">
            Мы используем файлы cookie для улучшения работы сайта и анализа трафика.
          </p>
          <p className="text-gray-400 text-xs sm:text-sm">
            Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
            <a href="/privacy-policy" className="text-[#00D89F] hover:underline">
              политикой конфиденциальности
            </a>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={declineCookies}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors text-sm"
          >
            Отклонить
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-[#00D89F] text-black font-medium rounded-lg hover:bg-[#00b87f] transition-colors text-sm"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
