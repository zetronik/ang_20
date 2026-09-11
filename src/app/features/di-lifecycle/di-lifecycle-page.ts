import {
  afterEveryRender,
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { API_BASE_URL } from '../../core/api.tokens';
import { ThemeStore } from '../../core/services/theme.store';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';
import { injectViewportSize } from './inject-viewport-size';

@Component({
  selector: 'app-di-lifecycle-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './di-lifecycle-page.html',
  styles: `
    .resizable {
      display: grid;
      place-items: center;
      height: 96px;
      border-radius: 14px;
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      font: var(--mat-sys-title-medium);
      transition: width 120ms ease;
    }
  `,
})
export class DiLifecyclePage {
  // inject() как значение поля — самый компактный способ получить зависимость.
  // Наследование при этом не ломается: не нужно тянуть аргументы в super().
  protected readonly theme = inject(ThemeStore);
  protected readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);

  /** Composable-функция, которая сама вызывает inject() внутри. */
  protected readonly viewport = injectViewportSize();

  protected readonly boxWidth = signal(240);
  protected readonly box = viewChild.required<ElementRef<HTMLDivElement>>('box');

  protected readonly measuredWidth = signal(0);
  protected readonly firstRenderInfo = signal('ещё не выполнялось');
  /**
   * ВАЖНО: это обычное поле, а не сигнал.
   * Запись в сигнал внутри afterEveryRender() помечает вид грязным,
   * что вызывает следующий рендер — и Angular справедливо падает
   * с ошибкой NG0103 «Infinite change detection».
   */
  protected renderPasses = 0;
  protected readonly log = signal<readonly string[]>([]);

  protected readonly ratio = computed(() =>
    this.viewport().width === 0 ? 0 : Math.round((this.measuredWidth() / this.viewport().width) * 100),
  );

  constructor() {
    /**
     * afterNextRender() — ровно один раз после первого рендера.
     * Безопасное место для работы с DOM и сторонними библиотеками:
     * на сервере (SSR) этот код не выполняется вовсе.
     */
    afterNextRender(() => {
      const rect = this.box().nativeElement.getBoundingClientRect();
      this.firstRenderInfo.set(`${Math.round(rect.width)} x ${Math.round(rect.height)} px`);
      this.push('afterNextRender: измерили элемент после первой отрисовки');
    });

    /**
     * afterEveryRender() — после каждого прохода рендера.
     * В v19 функция называлась afterRender(), в v20 её переименовали,
     * чтобы имя честно отражало частоту вызовов.
     */
    afterEveryRender(() => {
      // Обычное поле, а не сигнал: запись в сигнал отсюда вызвала бы
      // следующий рендер и ошибку NG0103 (Infinite change detection).
      this.renderPasses++;
    });

    /**
     * afterRenderEffect() (v19) — эффект с фазами.
     * Сначала все write-фазы всех компонентов, затем все read-фазы:
     * это исключает layout thrashing (чередование чтения и записи в DOM).
     */
    afterRenderEffect({
      write: () => {
        const width = this.boxWidth();
        this.box().nativeElement.style.width = `${width}px`;
        return width;
      },
      read: (width) => {
        const measured = this.box().nativeElement.getBoundingClientRect().width;
        this.measuredWidth.set(Math.round(measured));
        this.push(`afterRenderEffect: записали ${width()}px, измерили ${Math.round(measured)}px`);
      },
    });

    // DestroyRef вместо реализации интерфейса OnDestroy.
    this.destroyRef.onDestroy(() => console.info('[di-lifecycle] страница уничтожена'));
  }

  private push(text: string): void {
    this.log.update((list) => [text, ...list].slice(0, 8));
  }

  protected setWidth(value: number): void {
    this.boxWidth.set(value);
  }

  protected readonly injectSnippet = `
// Angular 20: inject() как поле класса
export class DiLifecyclePage {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
}

// Работает и в функциях — так получаются "композаблы":
export function injectViewportSize(): Signal<ViewportSize> {
  const size = signal({ width: innerWidth, height: innerHeight });
  const onResize = () => size.set({ width: innerWidth, height: innerHeight });

  addEventListener('resize', onResize, { passive: true });
  inject(DestroyRef).onDestroy(() => removeEventListener('resize', onResize));

  return size.asReadonly();
}

// ...и в guard-ах, resolver-ах, интерцепторах и провайдерах.
`;

  protected readonly renderSnippet = `
// v19/v20: хуки рендера вместо ngAfterViewInit/ngAfterViewChecked
constructor() {
  // один раз после первой отрисовки; на сервере не вызывается
  afterNextRender(() => {
    const rect = this.box().nativeElement.getBoundingClientRect();
    this.initChart(rect.width);
  });

  // после каждого прохода рендера (в v19 называлось afterRender).
  // ВНИМАНИЕ: писать отсюда в сигнал, который читает шаблон, нельзя —
  // это бесконечный цикл change detection (NG0103).
  afterEveryRender(() => this.renderPasses++);

  // эффект с фазами: сначала все write, затем все read
  afterRenderEffect({
    write: () => {
      const width = this.boxWidth();
      this.box().nativeElement.style.width = width + 'px';
      return width;
    },
    read: (width) => {
      this.measured.set(this.box().nativeElement.getBoundingClientRect().width);
    },
  });
}
`;

  protected readonly beforeSnippet = `
// Angular 16: конструктор + интерфейсы жизненного цикла
@Component({ /* ... */ })
export class PageComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('box') box!: ElementRef<HTMLDivElement>;

  private readonly destroyed = new Subject<void>();
  private onResize = () => this.size = { width: innerWidth, height: innerHeight };

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    @Inject(API_BASE_URL) private readonly baseUrl: string,
  ) {
    // при наследовании все эти аргументы пришлось бы протаскивать в super()
    addEventListener('resize', this.onResize);
  }

  ngAfterViewInit() {
    // на SSR этот код тоже выполнится — нужна проверка isPlatformBrowser
    const rect = this.box.nativeElement.getBoundingClientRect();
    this.initChart(rect.width);
    // изменение состояния здесь -> ExpressionChangedAfterItHasBeenCheckedError
  }

  ngAfterViewChecked() {
    // вызывается очень часто; чтение и запись DOM здесь вызывают layout thrashing
  }

  ngOnDestroy() {
    removeEventListener('resize', this.onResize);
    this.destroyed.next();
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Получение зависимостей',
      before: 'Параметры конструктора + @Inject для токенов; при наследовании — протаскивание в super().',
      after: 'inject() как поле класса; @Inject не нужен, наследование не ломается.',
    },
    {
      topic: 'Переиспользование логики',
      before: 'Класс-сервис или базовый класс компонента.',
      after: 'Обычная функция, вызывающая inject() — «композабл».',
    },
    {
      topic: 'Очистка ресурсов',
      before: 'implements OnDestroy + ngOnDestroy в каждом классе.',
      after: 'DestroyRef.onDestroy() — можно вызвать из любой функции.',
    },
    {
      topic: 'Работа с DOM после рендера',
      before: 'ngAfterViewInit / ngAfterViewChecked, выполняются и на сервере.',
      after: 'afterNextRender / afterEveryRender — только в браузере.',
    },
    {
      topic: 'Чтение и запись DOM',
      before: 'В одном хуке вперемешку — источник layout thrashing.',
      after: 'afterRenderEffect с фазами earlyRead → write → mixedReadWrite → read.',
    },
    {
      topic: 'Инициализация приложения',
      before: 'APP_INITIALIZER с useFactory, deps и multi: true.',
      after: 'provideAppInitializer(() => { ... }) с работающим inject() внутри.',
    },
  ];
}
