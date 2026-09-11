# Angular 16 → 20: что нового

Рабочий пет-проект-справочник по нововведениям Angular между версиями **16 и 20**.
Каждая страница приложения — это живое демо, исходный код с комментариями на русском
и таблица «как было в v16 → как стало в v20».

- **Angular:** 20.3.x, режим **zoneless** (без `zone.js`)
- **UI:** Angular Material 20.2.x, Material 3, светлая и тёмная темы
- **Бэкенд:** [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com/) (реальные HTTP-запросы)
- **Сборка:** `@angular/build:application` (esbuild + Vite)

## Запуск

```bash
npm install
```

```bash
npm start
```

Приложение откроется на http://localhost:4200.

Production-сборка:

```bash
npm run build
```

Тесты (пример zoneless-`TestBed` — `src/app/features/component-io/rating-widget.spec.ts`):

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

> В режиме `ng serve` с включённым HMR Angular загружает зависимости `@defer`-блоков
> заранее (предупреждение NG0751). Чтобы увидеть настоящую ленивую загрузку чанков,
> запустите `ng serve --no-hmr` или соберите проект через `npm run build`.

## Что внутри

| Страница | Версия | О чём |
|---|---|---|
| Обзор изменений | — | Хронология релизов 16 → 20 и каталог демо |
| Сигналы: основы | v17 | `signal` / `computed` / `effect` / `untracked`, кастомный `equal` |
| `linkedSignal()` | v19 | Писуемый сигнал, зависящий от источника |
| `resource()` и `rxResource()` | v19 | Асинхронные данные как сигнал, отмена по `abortSignal` |
| `httpResource()` | v20 | HTTP-запрос, описанный сигналом; `parse`, `statusCode`, `headers` |
| `input()` / `output()` / `model()` | v17.1 | Сигнальные входы, `transform`, двусторонняя привязка |
| Сигнальные запросы | v17.2 | `viewChild` / `viewChildren` / `contentChildren` без `QueryList` |
| `host`, `hostDirectives`, `ng-content` | v18 | Композиция поведений и fallback-контент |
| DI и жизненный цикл | v19 | `inject()`, `DestroyRef`, `afterNextRender`, `afterRenderEffect` |
| Встроенный control flow | v17 | `@if` / `@for` / `@switch` / `@let` |
| Новый синтаксис шаблонов | v20 | Операторы `**`, `in`, шаблонные литералы, `void`, self-closing теги |
| `@defer` блоки | v17 | Триггеры `on interaction / viewport / when`, `prefetch`, `hydrate` |
| Zoneless change detection | v20 | Сравнение обычного поля и сигнала без `zone.js` |
| Роутинг | v18 | Функциональные guard/resolve, `withComponentInputBinding()`, `redirectTo` как функция |
| Формы | v18 | `NonNullableFormBuilder`, поток `control.events`, `MatTimepicker` |
| RxJS-интероп | v20 | `toSignal` / `toObservable` / `takeUntilDestroyed` / `outputFromObservable` |
| Material 3 и темизация | v18 | `mat.theme()`, переменные `--mat-sys-*`, миксины `overrides` |
| CLI, сборка и миграции | v20 | Новый style guide, esbuild/Vite, HMR, схематики обновления |

## Структура проекта

Проект следует **новому style guide Angular 20**: в именах файлов и классов нет
суффиксов `.component` / `.service` / `.guard`.

```
src/app/
  app.ts, app.html, app.scss     оболочка приложения (sidenav + toolbar)
  app.config.ts                  провайдеры: zoneless, router, httpClient
  app.routes.ts                  все маршруты через loadComponent
  core/
    api.tokens.ts                InjectionToken с providedIn: 'root'
    nav.ts                       каталог демо (одно место правды для меню и обзора)
    models/                      типы данных jsonplaceholder
    services/                    theme.store.ts, request-log.store.ts
    interceptors/                функциональный HttpInterceptorFn
  shared/ui/                     demo-page, demo-section, code-block, compare-table
  features/<тема>/               по одной папке на демо-страницу
```

## Полезные ссылки

- [Официальный гайд по обновлению](https://angular.dev/update-guide?v=16.0-20.0)
- [Сигналы](https://angular.dev/guide/signals)
- [Zoneless](https://angular.dev/guide/zoneless)
- [Темизация Angular Material](https://material.angular.dev/guide/theming)
