/**
 * Каталог всех демо-страниц.
 * Один источник правды: используется и в боковом меню, и на главной странице-обзоре.
 */

export interface DemoLink {
  /** Путь роутинга (без ведущего слэша). */
  readonly path: string;
  /** Заголовок в меню. */
  readonly title: string;
  /** Версия Angular, в которой фича появилась. */
  readonly since: `v${number}` | `v${number}.${number}`;
  /** Короткое описание для обзорной страницы. */
  readonly summary: string;
  /** Название иконки Material Symbols / Material Icons. */
  readonly icon: string;
  /** Группа в меню. */
  readonly group: NavGroup;
}

export type NavGroup = 'Сигналы' | 'Компоненты' | 'Шаблоны' | 'Инфраструктура' | 'Экосистема';

export const NAV_GROUPS: readonly NavGroup[] = [
  'Сигналы',
  'Компоненты',
  'Шаблоны',
  'Инфраструктура',
  'Экосистема',
] as const;

export const DEMO_LINKS: readonly DemoLink[] = [
  {
    path: 'signals',
    title: 'Сигналы: основы',
    since: 'v17',
    summary:
      'signal / computed / effect / untracked. В v16 это был developer preview без effect-а в шаблонах; в v20 сигналы — стабильный фундамент всего фреймворка.',
    icon: 'bolt',
    group: 'Сигналы',
  },
  {
    path: 'linked-signal',
    title: 'linkedSignal()',
    since: 'v19',
    summary:
      'Писуемый сигнал, который сам сбрасывается при изменении источника. Заменяет связку effect() + set(), которой приходилось пользоваться в v16–v18.',
    icon: 'link',
    group: 'Сигналы',
  },
  {
    path: 'resource',
    title: 'resource() и rxResource()',
    since: 'v19',
    summary:
      'Асинхронные данные как сигнал: value / status / error / reload / отмена запроса. В v16 это был ручной BehaviorSubject + switchMap + loading-флаги.',
    icon: 'cloud_sync',
    group: 'Сигналы',
  },
  {
    path: 'http-resource',
    title: 'httpResource()',
    since: 'v20',
    summary:
      'HTTP-запрос, декларативно описанный сигналом. Реактивный URL, параметры, автоматическая отмена и перезагрузка — всё из коробки.',
    icon: 'http',
    group: 'Сигналы',
  },
  {
    path: 'component-io',
    title: 'input() / output() / model()',
    since: 'v17.1',
    summary:
      'Сигнальные входы, функция output() вместо EventEmitter и двусторонний model(). Полная замена декораторам @Input/@Output из v16.',
    icon: 'swap_horiz',
    group: 'Компоненты',
  },
  {
    path: 'queries',
    title: 'Сигнальные запросы',
    since: 'v17.2',
    summary:
      'viewChild / viewChildren / contentChild / contentChildren как сигналы. Больше не нужны ngAfterViewInit и static: true.',
    icon: 'search',
    group: 'Компоненты',
  },
  {
    path: 'host-and-content',
    title: 'host, hostDirectives, ng-content',
    since: 'v18',
    summary:
      'Объект host вместо @HostBinding/@HostListener, композиция через hostDirectives и fallback-контент для <ng-content>.',
    icon: 'widgets',
    group: 'Компоненты',
  },
  {
    path: 'di-lifecycle',
    title: 'DI и жизненный цикл',
    since: 'v19',
    summary:
      'inject(), DestroyRef, afterNextRender(), afterRenderEffect(), новые фазы рендера вместо ngAfterViewInit/ngOnDestroy.',
    icon: 'account_tree',
    group: 'Компоненты',
  },
  {
    path: 'control-flow',
    title: 'Встроенный control flow',
    since: 'v17',
    summary:
      '@if / @for / @switch / @let вместо *ngIf, *ngFor и *ngSwitch. Быстрее, типобезопаснее и без импортов CommonModule.',
    icon: 'fork_right',
    group: 'Шаблоны',
  },
  {
    path: 'template-syntax',
    title: 'Новый синтаксис шаблонов',
    since: 'v20',
    summary:
      'Оператор **, in, шаблонные литералы, void, self-closing теги и @let — всё это невозможно было написать в v16.',
    icon: 'code',
    group: 'Шаблоны',
  },
  {
    path: 'defer',
    title: '@defer блоки',
    since: 'v17',
    summary:
      'Декларативная ленивая загрузка кусков шаблона: on viewport / interaction / hover / timer / idle + prefetch.',
    icon: 'hourglass_top',
    group: 'Шаблоны',
  },
  {
    path: 'zoneless',
    title: 'Zoneless change detection',
    since: 'v20',
    summary:
      'Приложение без zone.js: меньше бандл, предсказуемый change detection, профилирование в DevTools. Этот проект целиком работает в zoneless-режиме.',
    icon: 'speed',
    group: 'Инфраструктура',
  },
  {
    path: 'routing',
    title: 'Роутинг',
    since: 'v18',
    summary:
      'Функциональные guard-ы и resolver-ы, withComponentInputBinding(), redirectTo как функция, View Transitions API.',
    icon: 'alt_route',
    group: 'Инфраструктура',
  },
  {
    path: 'forms',
    title: 'Формы',
    since: 'v18',
    summary:
      'Типизированные реактивные формы, поток control.events, интеграция с сигналами и новый MatTimepicker.',
    icon: 'edit_note',
    group: 'Инфраструктура',
  },
  {
    path: 'rxjs-interop',
    title: 'RxJS-интероп',
    since: 'v20',
    summary:
      'toSignal / toObservable / takeUntilDestroyed / outputFromObservable — стабильный мост между RxJS и сигналами.',
    icon: 'compare_arrows',
    group: 'Инфраструктура',
  },
  {
    path: 'material3',
    title: 'Material 3 и темизация',
    since: 'v18',
    summary:
      'mat.theme(), системные CSS-переменные --mat-sys-*, светлая/тёмная тема одним свойством color-scheme.',
    icon: 'palette',
    group: 'Экосистема',
  },
  {
    path: 'tooling',
    title: 'CLI, сборка и миграции',
    since: 'v20',
    summary:
      'esbuild/Vite, HMR, новый style guide именования файлов, схематики автоматической миграции с v16 на v20.',
    icon: 'build',
    group: 'Экосистема',
  },
];

export function linksOfGroup(group: NavGroup): readonly DemoLink[] {
  return DEMO_LINKS.filter((link) => link.group === group);
}
