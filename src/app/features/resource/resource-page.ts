import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { delay } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { Post, PostComment } from '../../core/models/jsonplaceholder';
import { RequestLogStore } from '../../core/services/request-log.store';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

@Component({
  selector: 'app-resource-page',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resource-page.html',
  styles: `
    .post {
      padding: 10px 14px;
      border-radius: 10px;
      background: var(--mat-sys-surface-container-high);
    }

    .post h4 {
      margin: 0 0 4px;
      font: var(--mat-sys-title-small);
    }

    .post p {
      margin: 0;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      font: var(--mat-sys-label-large);
      background: var(--mat-sys-surface-container-highest);
    }

    .status-badge.loading { background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); }
    .status-badge.resolved { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .status-badge.error { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
  `,
})
export class ResourcePage {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  protected readonly requestLog = inject(RequestLogStore);

  protected readonly userIds = [1, 2, 3, 4, 5];
  protected readonly userId = signal(1);
  /** Намеренно ломаем URL, чтобы увидеть состояние error. */
  protected readonly breakUrl = signal(false);

  // ---------------------------------------------------------------------------
  // resource() — асинхронные данные как сигнал (Angular 19, стабилен в v20).
  //
  // params  — реактивный параметр: при его изменении loader вызывается заново,
  //           а предыдущий запрос отменяется через abortSignal.
  // loader  — любая функция, возвращающая Promise.
  // ---------------------------------------------------------------------------
  protected readonly posts = resource<readonly Post[], { userId: number; broken: boolean }>({
    params: () => ({ userId: this.userId(), broken: this.breakUrl() }),
    loader: async ({ params, abortSignal }) => {
      const path = params.broken ? 'posts-not-found' : 'posts';
      const response = await fetch(`${this.baseUrl}/${path}?userId=${params.userId}`, {
        // abortSignal прилетает от Angular: при смене params или reload()
        // предыдущий запрос отменяется автоматически.
        signal: abortSignal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} — такого эндпоинта нет`);
      }
      return (await response.json()) as readonly Post[];
    },
    defaultValue: [],
  });

  // ---------------------------------------------------------------------------
  // rxResource() — то же самое, но loader возвращает Observable.
  // Идеально, когда сервис уже написан на HttpClient.
  // ---------------------------------------------------------------------------
  protected readonly selectedPostId = signal<number | null>(null);

  protected readonly comments = rxResource<readonly PostComment[], number | null>({
    params: () => this.selectedPostId(),
    stream: ({ params }) =>
      this.http
        .get<readonly PostComment[]>(`${this.baseUrl}/comments`, {
          params: { postId: String(params ?? 0) },
        })
        // Искусственная задержка, чтобы успеть увидеть состояние loading.
        .pipe(delay(400)),
    defaultValue: [],
  });

  /** Статусы ресурса — строковый union: idle | loading | reloading | resolved | error | local. */
  protected readonly postsStatus = computed(() => this.posts.status());

  protected readonly statusHint = computed(() => {
    switch (this.posts.status()) {
      case 'idle':
        return 'Загрузка не запускалась';
      case 'loading':
        return 'Первая загрузка для текущего params';
      case 'reloading':
        return 'Перезагрузка: старое значение ещё доступно';
      case 'resolved':
        return 'Данные получены';
      case 'error':
        return 'Загрузка завершилась ошибкой';
      case 'local':
        return 'Значение перезаписано локально через set()/update()';
      default:
        return '';
    }
  });

  protected selectPost(post: Post): void {
    this.selectedPostId.set(post.id);
  }

  /** resource — WritableResource: значение можно изменить локально. */
  protected renameFirstPost(): void {
    this.posts.update((posts) =>
      (posts ?? []).map((post, index) =>
        index === 0 ? { ...post, title: 'Заголовок изменён локально' } : post,
      ),
    );
  }

  protected readonly resourceSnippet = `
// Angular 19+/20: асинхронные данные как сигнал
readonly posts = resource<Post[], { userId: number }>({
  // реактивные параметры; их изменение перезапускает loader
  params: () => ({ userId: this.userId() }),

  loader: async ({ params, abortSignal, previous }) => {
    // abortSignal отменяет предыдущий запрос автоматически
    const res = await fetch(baseUrl + '/posts?userId=' + params.userId, { signal: abortSignal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  },

  defaultValue: [],
});

// В шаблоне доступны сигналы:
// posts.value()      — данные
// posts.status()     — 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
// posts.isLoading()  — булев флаг
// posts.error()      — объект ошибки
// posts.hasValue()   — type guard: значение точно не undefined
// posts.reload()     — принудительная перезагрузка
// posts.set/update() — локальное изменение (статус станет 'local')
`;

  protected readonly rxResourceSnippet = `
// rxResource — тот же API, но loader возвращает Observable.
// Удобно, если сервис уже написан на HttpClient.
readonly comments = rxResource<PostComment[], number | null>({
  params: () => this.selectedPostId(),
  stream: ({ params }) =>
    this.http.get<PostComment[]>(baseUrl + '/comments', {
      params: { postId: String(params ?? 0) },
    }),
  defaultValue: [],
});

// Отмена устаревших запросов встроена: при смене params
// Angular отписывается от предыдущего Observable.
`;

  protected readonly beforeSnippet = `
// Angular 16: ручное управление состоянием загрузки
export class PostsComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  loading = false;
  error: unknown = null;

  private readonly userId = new BehaviorSubject<number>(1);
  private readonly destroyed = new Subject<void>();

  ngOnInit() {
    this.userId
      .pipe(
        tap(() => {
          this.loading = true;
          this.error = null;
        }),
        // switchMap отменяет предыдущий запрос — но об этом надо помнить
        switchMap((userId) =>
          this.http.get<Post[]>('/posts', { params: { userId } }).pipe(
            catchError((err) => {
              this.error = err;
              return of([]);
            }),
          ),
        ),
        takeUntil(this.destroyed),
      )
      .subscribe((posts) => {
        this.posts = posts;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  reload() {
    this.userId.next(this.userId.value); // работает только с distinctUntilChanged... или не работает
  }

  ngOnDestroy() {
    this.destroyed.next();
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Состояние загрузки',
      before: 'Три поля класса: data, loading, error — синхронизируются вручную.',
      after: 'Один объект ресурса: value(), status(), error(), isLoading(), hasValue().',
    },
    {
      topic: 'Отмена устаревших запросов',
      before: 'switchMap — нужно не забыть и правильно разместить в цепочке.',
      after: 'abortSignal передаётся в loader, отмена происходит автоматически.',
    },
    {
      topic: 'Перезагрузка',
      before: 'Отдельный Subject-триггер и merge/combineLatest в потоке.',
      after: 'Метод reload(); статус переходит в reloading, старое значение остаётся доступным.',
    },
    {
      topic: 'Локальное изменение данных',
      before: 'Мутировать поле компонента и надеяться, что следующий запрос не перезатрёт.',
      after: 'resource.set()/update() — ресурс переходит в статус local и остаётся управляемым.',
    },
    {
      topic: 'Отписка',
      before: 'takeUntil(destroyed) в каждом компоненте.',
      after: 'Ресурс уничтожается вместе с контекстом инъекции.',
    },
  ];
}
