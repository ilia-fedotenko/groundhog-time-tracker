# Shared UI Package: @groundhog/ui

## Контекст

Frontend (веб) и Desktop (Tauri) оба используют React + Tailwind + shadcn/ui. Без общего пакета компоненты были бы продублированы в обоих приложениях. Цель — единый источник UI-компонентов.

## Решение

Монорепо на базе **npm workspaces** с отдельным пакетом `packages/ui` под именем `@groundhog/ui`.

```
packages/ui/
├── package.json       # name: "@groundhog/ui"
├── tsconfig.json
├── components.json    # shadcn/ui config
└── src/
    ├── styles.css     # @import "tailwindcss" + CSS design tokens (CSS vars)
    ├── index.ts       # barrel export всех компонентов
    ├── lib/
    │   └── utils.ts   # cn() helper
    └── components/
        └── ui/        # shadcn/ui компоненты (генерируются через shadcn CLI)
```

### Инструмент монорепо

npm workspaces (не Turborepo, Nx, pnpm). Достаточно для pet-проекта — без накладных расходов на pipeline сборки.

### Нет отдельного build-step для packages/ui

`package.json` экспортирует напрямую TypeScript-исходники (`./src/index.ts`). Vite каждого потребляющего приложения компилирует пакет inline. Это означает мгновенный HMR: правка компонента сразу отражается в обоих приложениях без запуска отдельной сборки.

### CSS-архитектура

`packages/ui/src/styles.css` — единая точка входа для стилей. Содержит `@import "tailwindcss"` и все CSS custom properties (design tokens) shadcn/ui. Каждое приложение импортирует этот файл и добавляет `@source` для Tailwind-сканирования:

```css
/* frontend/src/index.css и desktop/src/styles.css */
@import "@groundhog/ui/styles.css";

@source "../../packages/ui/src";
```

### Tailwind 4

Оба приложения и shared-пакет используют Tailwind 4. Конфигурация — в CSS через `@import "tailwindcss"` и CSS custom properties; `tailwind.config.js` отсутствует.

### shadcn/ui

Инициализирован в `packages/ui/` с `components.json`. Компоненты добавляются через:

```bash
cd packages/ui && npx shadcn@latest add <name>
```

После добавления — добавить re-export в `src/index.ts`. Приложения импортируют только через `@groundhog/ui`, никогда напрямую из `packages/ui/src/`.

### Vite alias для `@/`

shadcn/ui компоненты используют внутренний алиас `@/` для импорта утилит (например `@/lib/utils`). Этот алиас определён в `packages/ui/tsconfig.json`, но Vite в потребляющих приложениях о нём не знает. Поэтому в `vite.config.ts` обоих приложений добавлен алиас:

```ts
'@/': fileURLToPath(new URL('../packages/ui/src/', import.meta.url))
```

### npm overrides

Чтобы избежать дублирования hoisted-пакетов (два экземпляра Vite или TypeScript вызывают конфликты типов), в корневом `package.json` прописаны явные версии:

```json
"overrides": {
  "vite": "^7",
  "@vitejs/plugin-react": "^5",
  "typescript": "~5.9.3"
}
```

`npm install` всегда запускать из корня репозитория — workspaces хостят зависимости в корневой `node_modules/`.

### TypeScript

В `tsconfig.app.json` каждого приложения прописаны `paths`:

```json
"paths": {
  "@groundhog/ui": ["../packages/ui/src/index.ts"],
  "@groundhog/ui/*": ["../packages/ui/src/*"]
}
```

Нужно, так как `moduleResolution: bundler` не резолвит workspace-симлинки автоматически для TypeScript-анализа (Vite справляется в runtime, но tsc требует явного указания).

## Верификация

```bash
# Установка (из корня репо)
npm install

# Frontend
cd frontend && npm run dev
# → импорты из @groundhog/ui резолвятся, Tailwind-стили применяются

# Desktop
cd desktop && npm run vite-dev
# → то же самое на порту 1420

# Импорт компонента
import { Button } from "@groundhog/ui"
# → TypeScript не выдаёт ошибок, кнопка рендерится со стилями shadcn/ui
```
