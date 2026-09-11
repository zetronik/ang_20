import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

interface MigrationStep {
  readonly title: string;
  readonly command: string;
  readonly description: string;
}

@Component({
  selector: 'app-tooling-page',
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooling-page.html',
  styles: `
    .step {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px 16px;
      border-radius: 12px;
      background: var(--mat-sys-surface-container-high);
    }

    .step code {
      display: block;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--mat-sys-surface-container-highest);
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 12.5px;
      overflow-x: auto;
    }

    .step p {
      margin: 0;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class ToolingPage {
  protected readonly upgradeSteps: readonly MigrationStep[] = [
    {
      title: 'Шаг 1 — обновляемся по одной мажорной версии',
      command: 'ng update @angular/core@17 @angular/cli@17',
      description:
        'Перепрыгивать через версии нельзя. Повторите команду для 18, 19 и 20; на каждом шаге запускайте сборку и тесты.',
    },
    {
      title: 'Шаг 2 — структурные директивы в новый control flow',
      command: 'ng generate @angular/core:control-flow',
      description:
        'Автоматически переписывает *ngIf, *ngFor и *ngSwitch в @if / @for / @switch и убирает лишние импорты CommonModule.',
    },
    {
      title: 'Шаг 3 — параметры конструктора в inject()',
      command: 'ng generate @angular/core:inject',
      description:
        'Заменяет аргументы конструктора на inject(), сохраняя порядок и модификаторы доступа.',
    },
    {
      title: 'Шаг 4 — декораторы входов в сигнальные input()',
      command: 'ng generate @angular/core:signal-input-migration',
      description:
        'Переписывает @Input() в input() и обновляет все чтения этих полей в классе и шаблоне.',
    },
    {
      title: 'Шаг 5 — @Output в output()',
      command: 'ng generate @angular/core:output-migration',
      description: 'Заменяет EventEmitter на функцию output() и удаляет лишние импорты.',
    },
    {
      title: 'Шаг 6 — @ViewChild / @ContentChild в сигнальные запросы',
      command: 'ng generate @angular/core:signal-queries-migration',
      description:
        'Превращает декораторы запросов в viewChild/contentChild и убирает ngAfterViewInit там, где он больше не нужен.',
    },
    {
      title: 'Шаг 7 — standalone без лишнего флага',
      command: 'ng generate @angular/core:standalone',
      description:
        'Удаляет NgModule-обёртки и ставшее избыточным свойство standalone: true (с v19 оно по умолчанию).',
    },
    {
      title: 'Шаг 8 — отключаем zone.js',
      command: 'ng generate @angular/core:zoneless (или правка app.config.ts вручную)',
      description:
        'Добавляет provideZonelessChangeDetection() и убирает zone.js из polyfills. Делайте это последним, когда состояние уже переведено на сигналы.',
    },
  ];

  protected readonly namingSnippet = `
// Angular 16 — суффиксы в именах файлов и классов
src/app/
  app.module.ts
  app.component.ts / .html / .scss / .spec.ts
  core/
    services/user.service.ts        -> UserService
    guards/auth.guard.ts            -> AuthGuard
    interceptors/token.interceptor.ts
  features/
    posts/post-list.component.ts    -> PostListComponent
    posts/post.model.ts

// Angular 20 — новый style guide, суффиксы убраны
src/app/
  app.ts / app.html / app.scss      -> class App
  app.config.ts
  app.routes.ts
  core/
    services/user-store.ts          -> class UserStore
    guards/auth-guard.ts            -> const authGuard
  features/
    posts/post-list.ts              -> class PostList

// ng generate теперь создаёт файлы без суффиксов.
// Прежний стиль тоже допустим: это рекомендация, а не требование компилятора.
`;

  protected readonly buildSnippet = `
// angular.json: билдер сменился дважды
// v16: "@angular-devkit/build-angular:browser"            (Webpack)
// v17: "@angular-devkit/build-angular:application"        (esbuild + Vite)
// v20: "@angular/build:application"                       (отдельный пакет)

"architect": {
  "build": {
    "builder": "@angular/build:application",
    "options": {
      "browser": "src/main.ts",
      "polyfills": [],                 // zone.js здесь больше нет
      "outputMode": "static",
      "styles": ["src/styles.scss"]
    }
  }
}

// Dev-server с горячей заменой шаблонов и стилей (v19+, включено по умолчанию):
//   ng serve                 -> HMR для стилей и шаблонов без перезагрузки страницы
//   ng serve --no-hmr        -> прежнее поведение с полной перезагрузкой
`;

  protected readonly testingSnippet = `
// Тесты в zoneless-проекте
TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
});

// fixture.detectChanges() остаётся, но чаще используется асинхронный вариант,
// который дожидается стабилизации приложения:
await fixture.whenStable();

// v20: устаревшие API тестирования удалены или помечены deprecated
// - TestBed.get()      -> TestBed.inject()
// - async()            -> waitForAsync()
// - InjectFlags        -> объект опций: inject(Token, { optional: true })

// Runner в новых проектах по-прежнему Karma + Jasmine,
// но CLI умеет генерировать конфигурацию и для Vitest/Web Test Runner.
`;

  protected readonly devtoolsSnippet = `
// v20: профилирование change detection во вкладке Performance Chrome DevTools
import { enableProfiling } from '@angular/core';

// Вызывается один раз при старте приложения в dev-режиме
enableProfiling();

// После записи трассировки в DevTools появляется отдельная дорожка "Angular"
// с событиями change detection, выполнения эффектов и отрисовки компонентов.

// Плюс Angular DevTools (расширение браузера): дерево компонентов,
// граф зависимостей инжекторов и инспектор сигналов.
`;

  protected readonly mcpSnippet = `
# Angular 20 поставляется с MCP-сервером для AI-инструментов
ng mcp

# Что он даёт помощнику:
#  - актуальную документацию по версии Angular, установленной в проекте;
#  - список доступных схематиков и миграций;
#  - структуру workspace и настройки сборки.

# Полезные команды CLI, которых не было в v16:
ng generate @angular/core:control-flow      # миграция шаблонов
ng generate config                          # добавить karma/vitest конфиг
ng update --help                            # список доступных миграций
`;

  protected readonly deprecations = [
    '*ngIf, *ngFor, *ngSwitch и директивы CommonModule — помечены устаревшими в пользу @if / @for / @switch',
    'HttpClientModule и другие ModuleWithProviders у HttpClient — используйте provideHttpClient()',
    'Классы-guard-ы (CanActivate, CanDeactivate, Resolve) — удалены, остались функции',
    'InjectFlags — заменён объектом опций inject(Token, { optional: true, skipSelf: true })',
    'TestBed.get() — заменён на TestBed.inject()',
    'async() в тестах — заменён на waitForAsync()',
    'allowSignalWrites в effect() — удалён, запись в сигналы разрешена по умолчанию',
    'afterRender() — переименован в afterEveryRender()',
    'DOCUMENT из @angular/common — импортируйте из @angular/core',
    'browser-билдер на Webpack — заменён на @angular/build:application',
  ];

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Сборщик',
      before: 'Webpack; холодная сборка большого проекта — десятки секунд.',
      after: 'esbuild + Vite (@angular/build:application): сборка и пересборка в разы быстрее.',
    },
    {
      topic: 'Dev-server',
      before: 'Полная перезагрузка страницы при каждом изменении.',
      after: 'HMR для шаблонов и стилей: состояние приложения сохраняется.',
    },
    {
      topic: 'Именование файлов',
      before: 'user.service.ts, post-list.component.ts, auth.guard.ts.',
      after: 'user-store.ts, post-list.ts, auth-guard.ts — без суффиксов.',
    },
    {
      topic: 'Обновление версии',
      before: 'ng update + ручная правка шаблонов и классов.',
      after: 'ng update + набор схематиков, которые переписывают код автоматически.',
    },
    {
      topic: 'Профилирование',
      before: 'Angular DevTools и догадки о причинах лишних проверок.',
      after: 'enableProfiling() + дорожка Angular во вкладке Performance Chrome DevTools.',
    },
    {
      topic: 'Интеграция с AI-инструментами',
      before: '—',
      after: 'Встроенный MCP-сервер: ng mcp отдаёт документацию и схематики под версию проекта.',
    },
  ];
}
