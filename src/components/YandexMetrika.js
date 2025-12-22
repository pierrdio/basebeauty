"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import ym, { YMInitializer } from "react-yandex-metrika";

const YM_COUNTER_ID = 105967815; // Замените на ваш ID счетчика

const YandexMetrika = () => {
  const pathname = usePathname();

  // Инициализация и отправка первого хита
  useEffect(() => {
    // Отправляем хит на текущую страницу
    if (typeof window !== 'undefined' && pathname) {
      console.log('Sending Yandex Metrika hit:', pathname);
      ym(YM_COUNTER_ID, "hit", window.location.href);
    }
  }, []);

  // Отправляем событие "hit" при изменении маршрута
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      console.log('Sending Yandex Metrika route hit:', pathname);
      ym(YM_COUNTER_ID, "hit", window.location.href);
    }
  }, [pathname]);

  return (
    <YMInitializer
      accounts={[YM_COUNTER_ID]}
      options={{
        defer: false, // Отключаем defer для немедленной инициализации
        webvisor: true,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        childIframe: true,
        ecommerce: false,
        type: 1, // Тип счетчика: 1 - для обычных сайтов
      }}
      version="2"
    />
  );
};

export default YandexMetrika;