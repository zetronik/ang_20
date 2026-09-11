import {
  afterEveryRender,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

@Component({
  selector: 'app-zoneless-page',
  imports: [MatButtonModule, MatIconModule, CodeBlock, CompareTable, DemoPage, DemoSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './zoneless-page.html',
})
export class ZonelessPage {
  private readonly appRef = inject(ApplicationRef);
  private timerId: ReturnType<typeof setInterval> | null = null;

  /** Есть ли zone.js в рантайме. В этом проекте — нет. */
  protected readonly zoneLoaded = 'Zone' in globalThis;

  /** Значение в обычном поле класса: сигналом не является. */
  protected plainCounter = 0;

  /** То же значение, но в сигнале. */
  protected readonly signalCounter = signal(0);

  /**
   * Сколько раз реально выполнялся рендер этого компонента.
   *
   * Специально обычное поле, а не сигнал: запись в сигнал внутри
   * afterEveryRender() снова пометила бы вид грязным и Angular
   * остановил бы приложение с ошибкой NG0103 (Infinite change detection).
   */
  protected renderPasses = 0;

  protected readonly running = signal(false);

  constructor() {
    afterEveryRender(() => this.renderPasses++);
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * Таймер инкрементит ОБА счётчика.
   * В zoneless-режиме setInterval сам по себе change detection не запускает,
   * поэтому в шаблоне обновится только сигнальный счётчик — и вместе с ним
   * перерисуется весь компонент, показав «догнавшее» значение plainCounter
   * лишь тогда, когда рендер и так случился.
   */
  protected start(): void {
    if (this.timerId !== null) {
      return;
    }
    this.running.set(true);
    this.timerId = setInterval(() => {
      this.plainCounter++;
    }, 500);
  }

  protected stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.running.set(false);
  }

  /** Сигнал уведомляет планировщик change detection сам. */
  protected incrementSignal(): void {
    this.signalCounter.update((n) => n + 1);
  }

  /** Аварийный способ: попросить Angular пройтись по дереву вручную. */
  protected forceRender(): void {
    this.appRef.tick();
  }

  protected reset(): void {
    this.stop();
    this.plainCounter = 0;
    this.signalCounter.set(0);
  }

  protected readonly configSnippet = `
// Angular 20: конфигурация приложения без zone.js
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),   // стабильный API в v20
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};

// В angular.json из polyfills убран "zone.js",
// а сам пакет можно удалить из package.json.

// Создать такой проект с нуля:
//   ng new my-app --zoneless
`;

  protected readonly triggersSnippet = `
// Что запускает change detection в zoneless-режиме:

// 1. Изменение сигнала, прочитанного в шаблоне
count.update((n) => n + 1);

// 2. Обработчики событий, объявленные в шаблоне
//    <button (click)="onClick()">

// 3. Обновление привязки [input] у дочернего компонента

// 4. Завершение асинхронного пайпа (AsyncPipe) и обновление ресурса

// 5. Явные вызовы markForCheck() / ApplicationRef.tick()

// Что БОЛЬШЕ НЕ запускает:
// setTimeout, setInterval, promise.then, addEventListener мимо шаблона,
// XMLHttpRequest — то есть всё, что раньше патчил zone.js.
`;

  protected readonly migrationSnippet = `
// Типичные правки при переходе на zoneless

// Было: состояние в обычном поле
export class Widget {
  items: Item[] = [];
  loading = false;

  load() {
    this.loading = true;
    this.http.get<Item[]>('/items').subscribe((items) => {
      this.items = items;      // zone.js сам инициировал бы CD
      this.loading = false;
    });
  }
}

// Стало: состояние в сигналах
export class Widget {
  readonly items = signal<Item[]>([]);
  readonly loading = signal(false);

  load() {
    this.loading.set(true);
    this.http.get<Item[]>('/items').subscribe((items) => {
      this.items.set(items);   // сигнал сам уведомляет планировщик
      this.loading.set(false);
    });
  }
}

// Или сразу декларативно:
export class Widget {
  readonly items = httpResource<Item[]>(() => '/items', { defaultValue: [] });
}

// Для стабильности SSR и тестов длинные асинхронные операции
// оборачиваются в PendingTasks:
const pendingTasks = inject(PendingTasks);
const done = pendingTasks.add();
doSomethingAsync().finally(done);
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Запуск change detection',
      before: 'zone.js патчит setTimeout, Promise, addEventListener и после каждой задачи проверяет всё дерево.',
      after: 'Дерево обходится только там, где изменился прочитанный сигнал или сработал шаблонный обработчик.',
    },
    {
      topic: 'Размер бандла',
      before: 'zone.js добавляет примерно 30 КБ к начальной загрузке.',
      after: 'Полифилл не нужен — в этом проекте его нет вовсе.',
    },
    {
      topic: 'Стек вызовов и отладка',
      before: 'Стектрейсы проходят через внутренности Zone и плохо читаются.',
      after: 'Обычные стеки браузера; есть профилирование в Chrome DevTools (custom tracks).',
    },
    {
      topic: 'Интеграция со сторонними библиотеками',
      before: 'Библиотеки вне зоны требовали ngZone.run() или runOutsideAngular().',
      after: 'NgZone почти не нужен; достаточно записать результат в сигнал.',
    },
    {
      topic: 'Требования к коду',
      before: 'Любое поле класса можно менять как угодно — zone.js «догонит».',
      after: 'Состояние, влияющее на шаблон, должно жить в сигналах (или требовать markForCheck).',
    },
    {
      topic: 'Статус',
      before: 'В v16 zoneless невозможен в принципе.',
      after: 'v18 — экспериментально, v19 — developer preview, v20 — стабильно и по умолчанию в ng new --zoneless.',
    },
  ];
}
