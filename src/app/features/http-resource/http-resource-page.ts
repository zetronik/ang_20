import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { API_BASE_URL } from '../../core/api.tokens';
import { Todo, User } from '../../core/models/jsonplaceholder';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

type CompletedFilter = 'all' | 'true' | 'false';

@Component({
  selector: 'app-http-resource-page',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './http-resource-page.html',
  styles: `
    table {
      width: 100%;
    }

    .done {
      color: var(--mat-sys-primary);
    }

    .pending {
      color: var(--mat-sys-error);
    }

    .raw {
      max-height: 180px;
      overflow: auto;
    }
  `,
})
export class HttpResourcePage {
  private readonly baseUrl = inject(API_BASE_URL);

  // ---------------------------------------------------------------------------
  // 1. Простейшая форма: URL как функция-сигнал.
  //    Angular сам сделает GET, распарсит JSON и отдаст сигналы value/status/error.
  // ---------------------------------------------------------------------------
  protected readonly users = httpResource<readonly User[]>(() => `${this.baseUrl}/users`, {
    defaultValue: [],
  });

  // ---------------------------------------------------------------------------
  // 2. Полная форма: реактивный объект запроса.
  //    Меняется любой сигнал внутри — запрос уходит заново,
  //    предыдущий отменяется.
  // ---------------------------------------------------------------------------
  protected readonly selectedUserId = signal(1);
  protected readonly completed = signal<CompletedFilter>('all');

  protected readonly todos = httpResource<readonly Todo[]>(
    () => ({
      url: `${this.baseUrl}/todos`,
      method: 'GET',
      // Параметры запроса описываются декларативно, а не склеиваются в строку.
      params: {
        userId: this.selectedUserId(),
        ...(this.completed() === 'all' ? {} : { completed: this.completed() }),
      },
      headers: { 'X-Demo-Source': 'ang20-features' },
    }),
    { defaultValue: [] },
  );

  protected readonly displayedColumns = ['id', 'title', 'completed'];

  protected readonly doneCount = computed(() => this.todos.value().filter((t) => t.completed).length);

  // ---------------------------------------------------------------------------
  // 3. parse — валидация и трансформация ответа.
  //    Сюда обычно подставляют zod/valibot-схему; здесь — ручная проверка.
  // ---------------------------------------------------------------------------
  protected readonly userNames = httpResource<readonly string[]>(
    () => `${this.baseUrl}/users`,
    {
      defaultValue: [],
      parse: (raw) => {
        if (!Array.isArray(raw)) {
          throw new Error('Ожидался массив пользователей');
        }
        return raw.map((item) => String((item as User).name));
      },
    },
  );

  // ---------------------------------------------------------------------------
  // 4. Подфункции для не-JSON ответов: text / blob / arrayBuffer.
  // ---------------------------------------------------------------------------
  protected readonly rawPost = httpResource.text(() => `${this.baseUrl}/posts/1`);

  protected readonly headerNames = computed(() => this.todos.headers()?.keys() ?? []);

  protected readonly httpResourceSnippet = `
// Angular 20: HTTP-запрос описан сигналом
readonly todos = httpResource<Todo[]>(
  () => ({
    url: baseUrl + '/todos',
    method: 'GET',
    params: {
      userId: this.selectedUserId(),          // реактивный параметр
      completed: this.completed(),            // и ещё один
    },
    headers: { 'X-Demo-Source': 'ang20-features' },
  }),
  { defaultValue: [] },
);

// Доступные сигналы:
// todos.value()      — тело ответа (уже распарсенный JSON)
// todos.status()     — статус ресурса
// todos.isLoading()  — идёт ли загрузка
// todos.error()      — ошибка HTTP
// todos.statusCode() — HTTP-код ответа
// todos.headers()    — заголовки ответа
// todos.progress()   — прогресс, если reportProgress: true
// todos.reload()     — повторить запрос
`;

  protected readonly parseSnippet = `
// parse превращает сырой ответ в типизированное значение.
// Идеальное место для runtime-валидации (zod, valibot, ...).
readonly users = httpResource<User[]>(() => baseUrl + '/users', {
  defaultValue: [],
  parse: (raw) => UserArraySchema.parse(raw),
});

// Не-JSON ответы — через подфункции:
const text = httpResource.text(() => '/robots.txt');
const blob = httpResource.blob(() => '/report.pdf');
const buf  = httpResource.arrayBuffer(() => '/model.bin');
`;

  protected readonly beforeSnippet = `
// Angular 16: сервис + подписка + ручные флаги
@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private readonly http: HttpClient) {}

  getTodos(userId: number, completed?: boolean): Observable<Todo[]> {
    let params = new HttpParams().set('userId', userId);
    if (completed !== undefined) {
      params = params.set('completed', completed);
    }
    return this.http.get<Todo[]>('/todos', { params });
  }
}

export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  loading = false;

  private readonly filter = new BehaviorSubject({ userId: 1, completed: undefined });

  ngOnInit() {
    this.filter
      .pipe(
        tap(() => (this.loading = true)),
        switchMap((f) => this.service.getTodos(f.userId, f.completed)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((todos) => {
        this.todos = todos;
        this.loading = false;
      });
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Описание запроса',
      before: 'Метод сервиса + HttpParams, собираемые императивно.',
      after: 'Функция, возвращающая объект запроса; все параметры реактивны.',
    },
    {
      topic: 'Реакция на изменение фильтра',
      before: 'BehaviorSubject + switchMap + подписка в ngOnInit.',
      after: 'Просто читаем сигнал внутри функции запроса — остальное делает Angular.',
    },
    {
      topic: 'Метаданные ответа',
      before: 'observe: "response" и ручной разбор HttpResponse.',
      after: 'Отдельные сигналы statusCode(), headers(), progress().',
    },
    {
      topic: 'Валидация ответа',
      before: 'map() + отдельная функция-валидатор в цепочке.',
      after: 'Опция parse — единая точка трансформации и валидации.',
    },
    {
      topic: 'Не-JSON ответы',
      before: 'responseType: "text" | "blob" и потеря типизации.',
      after: 'httpResource.text() / .blob() / .arrayBuffer() с сохранением типов.',
    },
  ];
}
