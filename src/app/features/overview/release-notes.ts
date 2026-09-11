export interface ReleaseHighlight {
  readonly version: string;
  readonly date: string;
  readonly headline: string;
  readonly items: readonly string[];
}

/**
 * Сжатая выжимка релизов между Angular 16 и Angular 20.
 * Используется на обзорной странице как «карта» изменений.
 */
export const RELEASE_HIGHLIGHTS: readonly ReleaseHighlight[] = [
  {
    version: 'Angular 16',
    date: 'май 2023',
    headline: 'Точка отсчёта — версия, с которой мы уходим',
    items: [
      'Сигналы (signal/computed/effect) — developer preview, без поддержки в шаблонных API',
      'Standalone-компоненты стабильны, но CLI по умолчанию всё ещё генерирует NgModule',
      '@Input() / @Output() / @ViewChild() — только декораторы',
      '*ngIf, *ngFor, *ngSwitch и обязательный импорт CommonModule',
      'zone.js обязателен, ChangeDetectionStrategy.OnPush — единственный способ оптимизации',
      'Сборка через Webpack; esbuild-билдер — developer preview',
      'Типизированные реактивные формы (появились в v14)',
      'required-инпуты и DestroyRef/takeUntilDestroyed — новинки именно этой версии',
    ],
  },
  {
    version: 'Angular 17',
    date: 'ноябрь 2023',
    headline: 'Новый синтаксис шаблонов и новая сборка',
    items: [
      'Встроенный control flow: @if / @else / @for / @switch (@for требует track)',
      '@defer блоки: ленивая загрузка части шаблона с триггерами и prefetch',
      'esbuild + Vite как builder по умолчанию (application builder)',
      'Standalone-приложение — дефолт для `ng new`',
      'View Transitions API в роутере: withViewTransitions()',
      'input() — сигнальные входы (v17.1)',
      'model() и signal-queries viewChild/contentChild (v17.2)',
      'output() как функция вместо EventEmitter (v17.3)',
    ],
  },
  {
    version: 'Angular 18',
    date: 'май 2024',
    headline: 'Стабилизация и первый zoneless',
    items: [
      'Zoneless change detection — экспериментальный provideExperimentalZonelessChangeDetection()',
      'Material 3 стабилен, новый API темизации',
      '@defer и встроенный control flow объявлены стабильными',
      'Fallback-контент для <ng-content>',
      'redirectTo в роутере может быть функцией',
      'Поток событий формы: control.events (statusChanges/valueChanges/touched в одном Observable)',
      '@let — объявление локальной переменной в шаблоне (v18.1)',
    ],
  },
  {
    version: 'Angular 19',
    date: 'ноябрь 2024',
    headline: 'Реактивные ресурсы и standalone по умолчанию',
    items: [
      'linkedSignal() — писуемый сигнал, зависящий от источника',
      'resource() и rxResource() — асинхронные данные как сигнал',
      'standalone: true больше не нужно писать — это значение по умолчанию',
      'Incremental hydration и render mode на уровне маршрута (SSR)',
      'afterRenderEffect() и обновлённые фазы рендера',
      'provideAppInitializer() вместо APP_INITIALIZER',
      'HMR для шаблонов и стилей в `ng serve`',
    ],
  },
  {
    version: 'Angular 20',
    date: 'май 2025',
    headline: 'Zoneless по умолчанию, httpResource и новый style guide',
    items: [
      'provideZonelessChangeDetection() — стабильный API, `ng new --zoneless`',
      'httpResource() — HTTP-запрос, описанный сигналом',
      'resource(), linkedSignal(), effect(), toSignal() выведены из developer preview',
      'Новый синтаксис в шаблонах: **, in, шаблонные литералы, void',
      'Новый style guide: app.ts вместо app.component.ts, без суффиксов в именах',
      'DOCUMENT переехал в @angular/core',
      '*ngIf / *ngFor / *ngSwitch и структурные директивы CommonModule помечены устаревшими',
      'Профилирование change detection в Chrome DevTools (custom tracks)',
      'Angular MCP-сервер (`ng mcp`) для интеграции с AI-инструментами',
    ],
  },
];
