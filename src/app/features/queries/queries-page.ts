import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';
import { RatingWidget } from '../component-io/rating-widget';
import { TabGroup } from './tab-group';
import { TabItem } from './tab-item';

@Component({
  selector: 'app-queries-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
    RatingWidget,
    TabGroup,
    TabItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './queries-page.html',
  styles: `
    .boxes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .box {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      font-weight: 600;
    }
  `,
})
export class QueriesPage {
  // ---------------------------------------------------------------------------
  // viewChild() — сигнальный запрос к элементу шаблона.
  // Значение появляется само, как только элемент отрисован:
  // ngAfterViewInit и static: true больше не нужны.
  // ---------------------------------------------------------------------------
  protected readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('searchBox');

  /** viewChild.required — компилятор и рантайм гарантируют наличие элемента. */
  protected readonly counterBox = viewChild.required<ElementRef<HTMLElement>>('counterBox');

  /** Запрос к дочернему компоненту по его типу. */
  protected readonly rating = viewChild(RatingWidget);

  // ---------------------------------------------------------------------------
  // viewChildren() — список элементов, реагирующий на @if/@for.
  // ---------------------------------------------------------------------------
  protected readonly boxCount = signal(3);
  protected readonly showExtra = signal(false);
  protected readonly boxes = viewChildren<ElementRef<HTMLElement>>('box');

  protected readonly boxList = computed(() =>
    Array.from({ length: this.boxCount() }, (_, index) => index + 1),
  );

  protected readonly queryLog = signal<readonly string[]>([]);

  constructor() {
    // Реакция на изменение результата запроса — обычный effect,
    // а не подписка на QueryList.changes.
    effect(() => {
      const found = this.boxes().length;
      const ratingValue = this.rating()?.value() ?? 0;
      this.queryLog.update((list) =>
        [`viewChildren: ${found} элементов, оценка виджета: ${ratingValue}`, ...list].slice(0, 6),
      );
    });
  }

  protected focusSearch(): void {
    // Опциональная цепочка: пока элемент не отрисован, сигнал вернёт undefined.
    this.searchBox()?.nativeElement.focus();
  }

  protected highlightCounter(): void {
    const element = this.counterBox().nativeElement;
    element.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
      { duration: 400 },
    );
  }

  protected addBox(): void {
    this.boxCount.update((n) => Math.min(12, n + 1));
  }

  protected removeBox(): void {
    this.boxCount.update((n) => Math.max(0, n - 1));
  }

  protected readonly viewChildSnippet = `
// Angular 17.2+ — сигнальные view-запросы
export class QueriesPage {
  // может быть undefined, пока элемент не отрисован
  readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('searchBox');

  // .required — гарантированно не undefined
  readonly counterBox = viewChild.required<ElementRef<HTMLElement>>('counterBox');

  // запрос по типу компонента
  readonly rating = viewChild(RatingWidget);

  // список, автоматически обновляемый при изменении @if / @for
  readonly boxes = viewChildren<ElementRef<HTMLElement>>('box');

  constructor() {
    // никакого ngAfterViewInit — просто effect
    effect(() => console.log('элементов:', this.boxes().length));
  }

  focus() {
    this.searchBox()?.nativeElement.focus();
  }
}
`;

  protected readonly contentChildrenSnippet = `
// contentChildren — то же самое для спроецированного контента
@Component({ selector: 'app-tab-group', template: '<ng-content />' })
export class TabGroup {
  readonly tabs = contentChildren(TabItem);
  readonly count = computed(() => this.tabs().length);
}

// Доступны опции:
// contentChildren(TabItem, { descendants: true })  — искать во всей глубине
// contentChild(TabItem, { read: ElementRef })      — что именно вернуть
`;

  protected readonly beforeSnippet = `
// Angular 16 — декораторы и QueryList
export class QueriesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('searchBox') searchBox?: ElementRef<HTMLInputElement>;

  // static: true — только если элемент НЕ внутри *ngIf
  @ViewChild('counterBox', { static: true }) counterBox!: ElementRef<HTMLElement>;

  @ViewChildren('box') boxes!: QueryList<ElementRef<HTMLElement>>;

  private readonly destroyed = new Subject<void>();

  ngAfterViewInit() {
    // до этого момента обращаться к элементам нельзя
    console.log('элементов:', this.boxes.length);

    // чтобы узнать об изменениях — отдельная подписка
    this.boxes.changes.pipe(takeUntil(this.destroyed)).subscribe((list: QueryList<unknown>) => {
      console.log('стало:', list.length);
      // а ещё легко поймать ExpressionChangedAfterItHasBeenCheckedError
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Момент доступности',
      before: 'Только в ngAfterViewInit (или ngOnInit при static: true).',
      after: 'Сигнал можно читать где угодно: до рендера он вернёт undefined.',
    },
    {
      topic: 'Флаг static',
      before: 'Нужно было выбирать static: true/false в зависимости от *ngIf.',
      after: 'Флага нет вовсе — запрос всегда динамический.',
    },
    {
      topic: 'Обязательность',
      before: 'Оператор ! и надежда, что элемент действительно есть.',
      after: 'viewChild.required() — ошибка возникнет сразу и понятно.',
    },
    {
      topic: 'Списки',
      before: 'QueryList + подписка на changes + ручной detectChanges.',
      after: 'Signal<readonly T[]>, читается в computed/effect как обычное значение.',
    },
    {
      topic: 'ExpressionChangedAfterItHasBeenChecked',
      before: 'Классическая ошибка при изменении состояния в ngAfterViewInit.',
      after: 'Эффекты выполняются после рендера — ошибка практически исчезает.',
    },
  ];
}
