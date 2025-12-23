# Base Beauty

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-blue)](https://www.prisma.io/)
[![NextUI](https://img.shields.io/badge/NextUI-blue)](https://nextui.org/)
[![Shadcn](https://img.shields.io/badge/Shadcn-blue)](https://ui.shadcn.com/)

![Commits](https://img.shields.io/github/commit-activity/m/PierreDioJ/basebeauty)
[![Last commit](https://img.shields.io/github/last-commit/PierreDioJ/basebeauty)](https://github.com/PierreDioJ/basebeauty/commits/main)

Эксклюзивное оформление мероприятий от компании «Base-Beauty» - это визитная карточка самого высокого уровня.

## Содержание

- [О проекте](#о-проекте)
- [Технологии](#технологии)
- [Требования к проекту](#требования-к-проекту)
- [Установка и запуск](#установка-и-запуск)

## О проекте

Base Beauty - это современный веб-сайт для компании, специализирующейся на эксклюзивном оформлении мероприятий:
- Массовые мероприятия
- Телевизионные студии  
- Концерты
- Частные мероприятия
- Выставочные пространства
- МАФЫ (малоархитектурные формы)

## Технологии

- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - Типизация JavaScript
- **Tailwind CSS** - Утилитарный CSS фреймворк
- **Prisma** - ORM для работы с базой данных
- **NextUI/Shadcn** - UI компоненты

## Требования к проекту

### Системные требования
- **Node.js** 18.0 или выше
- **npm** 8.0 или выше
- **Git** для клонирования репозитория

### Браузеры
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Переменные окружения
Создайте файл [.env](cci:7://file:///Users/maksimyurt/Desktop/basebeauty/.env:0:0-0:0) в корне проекта:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/my_db"
```

## Установка и запуск

Для локальной настройки проекта:

1. Клонируйте репозиторий:
    ```bash
    git clone https://github.com/{{github_username}}/{{github_repo_name}}.git
    ```
2. Установите зависимости:
    ```bash
    npm install
    ```
3. Запустите проект:
    ```bash
    npm start
    ```