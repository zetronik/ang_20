import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, distinctUntilChanged, filter, interval, map, of, switchMap } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { User } from '../../core/models/jsonplaceholder';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';
import { Ticker } from './ticker';

@Component({
  selector: 'app-rxjs-interop-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
    Ticker,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rxjs-interop-page.html',
})
export class RxjsInteropPage {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // ---------------------------------------------------------------------------
  // toSignal() — Observable в сигнал.
  // Подписка создаётся сразу, отписка происходит при уничтожении компонента.
  // ---------------------------------------------------------------------------
  protected readonly seconds = toSignal(interval(1000).pipe(map((n) => n + 1)), {
    initialValue: 0,
  });

  // ---------------------------------------------------------------------------
  // toObservable() — сигнал в Observable.
  // Нужен там, где действительно требуются операторы времени:
  // debounce, throttle, retry, switchMap.
  // ---------------------------------------------------------------------------
  protected readonly query = signal('');

  private readonly searchResults$ = toObservable(this.query).pipe(
    map((value) => value.trim()),
    debounceTime(400),
    distinctUntilChanged(),
    switchMap((needle) =>
      needle.length === 0
        ? of([] as readonly User[])
        : this.http
            .get<readonly User[]>(`${this.baseUrl}/users`)
            .pipe(
              map((users) =>
                users.filter((user) => user.name.toLowerCase().includes(needle.toLowerCase())),
              ),
              catchError(() => of([] as readonly User[])),
            ),
    ),
  );

  /** И обратно в сигнал — шаблон снова работает с обычным значением. */
  protected readonly results = toSignal(this.searchResults$, { initialValue: [] as readonly User[] });

  protected readonly resultCount = computed(() => this.results().length);

  // ---------------------------------------------------------------------------
  // takeUntilDestroyed() — отписка без Subject и ngOnDestroy (v16).
  // ---------------------------------------------------------------------------
  protected readonly rareEvents = signal(0);
  protected readonly tickerEvents = signal<readonly string[]>([]);

  constructor() {
    interval(2000)
      .pipe(
        filter((n) => n % 2 === 0),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.rareEvents.update((n) => n + 1));
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onTick(value: number): void {
    this.tickerEvents.update((list) => [`tick #${value}`, ...list].slice(0, 6));
  }

  protected readonly toSignalSnippet = `
// Observable -> Signal
readonly seconds = toSignal(interval(1000), { initialValue: 0 });

// Варианты обработки отсутствия начального значения:
toSignal(source$);                          // тип Signal<T | undefined>
toSignal(source$, { initialValue: 0 });     // тип Signal<number>
toSignal(source$, { requireSync: true });   // источник обязан эмитить синхронно

// Важно: toSignal подписывается СРАЗУ при создании
// и отписывается при уничтожении контекста инъекции.
// В v20 функция выведена из developer preview и стабильна.
`;

  protected readonly toObservableSnippet = `
// Signal -> Observable: нужен там, где важны операторы времени
readonly query = signal('');

private readonly results$ = toObservable(this.query).pipe(
  debounceTime(400),
  distinctUntilChanged(),
  switchMap((needle) => this.http.get<User[]>('/users?q=' + needle)),
);

// И обратно в сигнал, чтобы шаблон работал с обычным значением
readonly results = toSignal(this.results$, { initialValue: [] });

// Практическое правило Angular 20:
// состояние — в сигналах, координация во времени — в RxJS.
`;

  protected readonly outputsSnippet = `
// Observable -> output компонента
export class Ticker {
  readonly tick = outputFromObservable(interval(1000));
}
// Родитель: <app-ticker (tick)="onTick($event)" />

// output -> Observable (для тестов и композиции)
const clicks$ = outputToObservable(this.myComponent.clicked);

// pendingUntilEvent: помечает приложение "занятым", пока поток не эмитнет.
// Нужно для SSR и тестов в zoneless-режиме.
source$.pipe(pendingUntilEvent()).subscribe();
`;

  protected readonly beforeSnippet = `
// Angular 16: async pipe и ручная отписка
@Component({
  template: \`
    <p>{{ seconds$ | async }}</p>
    <div *ngFor="let user of results$ | async">{{ user.name }}</div>
  \`,
})
export class SearchComponent implements OnInit, OnDestroy {
  readonly seconds$ = interval(1000);
  readonly query$ = new BehaviorSubject('');

  readonly results$ = this.query$.pipe(
    debounceTime(400),
    distinctUntilChanged(),
    switchMap((needle) => this.http.get<User[]>('/users?q=' + needle)),
    shareReplay({ bufferSize: 1, refCount: true }), // иначе два async pipe = два запроса
  );

  private readonly destroyed = new Subject<void>();

  ngOnInit() {
    interval(2000).pipe(takeUntil(this.destroyed)).subscribe(() => this.tick());
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Поток в шаблоне',
      before: 'async pipe в каждом месте использования + shareReplay, чтобы не плодить подписки.',
      after: 'toSignal() один раз в классе; сигнал читается сколько угодно раз бесплатно.',
    },
    {
      topic: 'Отписка',
      before: 'Subject destroyed + ngOnDestroy в каждом компоненте.',
      after: 'takeUntilDestroyed() — одна строка в цепочке.',
    },
    {
      topic: 'Операторы времени',
      before: 'Единственный способ хранить состояние — тоже RxJS (BehaviorSubject).',
      after: 'Состояние в сигналах, а toObservable() подключает RxJS только там, где он нужен.',
    },
    {
      topic: 'Выходы компонента из потока',
      before: 'Подписка в ngOnInit + emit в EventEmitter вручную.',
      after: 'outputFromObservable() / outputToObservable().',
    },
    {
      topic: 'Стабильность приложения',
      before: 'zone.js сам знал о незавершённых задачах.',
      after: 'pendingUntilEvent() и PendingTasks сообщают об этом явно.',
    },
    {
      topic: 'Статус API',
      before: 'В v16 toSignal/toObservable только появились и были developer preview.',
      after: 'В v20 весь пакет @angular/core/rxjs-interop стабилен.',
    },
  ];
}
