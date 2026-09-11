import { Routes } from '@angular/router';

/**
 * Все страницы подключены через `loadComponent` — ленивую загрузку
 * отдельных standalone-компонентов (без единого NgModule).
 * В Angular 16 ленивая загрузка почти всегда означала `loadChildren`
 * с модулем-обёрткой.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Обзор изменений Angular 16 → 20',
    loadComponent: () => import('./features/overview/overview-page').then((m) => m.OverviewPage),
  },
  {
    path: 'signals',
    title: 'Сигналы: основы',
    loadComponent: () => import('./features/signals/signals-page').then((m) => m.SignalsPage),
  },
  {
    path: 'linked-signal',
    title: 'linkedSignal()',
    loadComponent: () =>
      import('./features/linked-signal/linked-signal-page').then((m) => m.LinkedSignalPage),
  },
  {
    path: 'resource',
    title: 'resource() и rxResource()',
    loadComponent: () => import('./features/resource/resource-page').then((m) => m.ResourcePage),
  },
  {
    path: 'http-resource',
    title: 'httpResource()',
    loadComponent: () =>
      import('./features/http-resource/http-resource-page').then((m) => m.HttpResourcePage),
  },
  {
    path: 'component-io',
    title: 'input() / output() / model()',
    loadComponent: () =>
      import('./features/component-io/component-io-page').then((m) => m.ComponentIoPage),
  },
  {
    path: 'queries',
    title: 'Сигнальные запросы',
    loadComponent: () => import('./features/queries/queries-page').then((m) => m.QueriesPage),
  },
  {
    path: 'host-and-content',
    title: 'host, hostDirectives, ng-content',
    loadComponent: () =>
      import('./features/host-and-content/host-and-content-page').then((m) => m.HostAndContentPage),
  },
  {
    path: 'di-lifecycle',
    title: 'DI и жизненный цикл',
    loadComponent: () =>
      import('./features/di-lifecycle/di-lifecycle-page').then((m) => m.DiLifecyclePage),
  },
  {
    path: 'control-flow',
    title: 'Встроенный control flow',
    loadComponent: () =>
      import('./features/control-flow/control-flow-page').then((m) => m.ControlFlowPage),
  },
  {
    path: 'template-syntax',
    title: 'Новый синтаксис шаблонов',
    loadComponent: () =>
      import('./features/template-syntax/template-syntax-page').then((m) => m.TemplateSyntaxPage),
  },
  {
    path: 'defer',
    title: '@defer блоки',
    loadComponent: () => import('./features/defer/defer-page').then((m) => m.DeferPage),
  },
  {
    path: 'zoneless',
    title: 'Zoneless change detection',
    loadComponent: () => import('./features/zoneless/zoneless-page').then((m) => m.ZonelessPage),
  },
  {
    // Единственный маршрут с `loadChildren`: нужен, чтобы показать вложенные
    // маршруты, функциональные guard/resolve и redirectTo-функцию.
    path: 'routing',
    loadChildren: () => import('./features/routing/routing.routes').then((m) => m.ROUTING_ROUTES),
  },
  {
    path: 'forms',
    title: 'Формы',
    loadComponent: () => import('./features/forms/forms-page').then((m) => m.FormsPage),
  },
  {
    path: 'rxjs-interop',
    title: 'RxJS-интероп',
    loadComponent: () =>
      import('./features/rxjs-interop/rxjs-interop-page').then((m) => m.RxjsInteropPage),
  },
  {
    path: 'material3',
    title: 'Material 3 и темизация',
    loadComponent: () => import('./features/material3/material3-page').then((m) => m.Material3Page),
  },
  {
    path: 'tooling',
    title: 'CLI, сборка и миграции',
    loadComponent: () => import('./features/tooling/tooling-page').then((m) => m.ToolingPage),
  },
  {
    path: '**',
    title: 'Страница не найдена',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
