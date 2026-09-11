import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

interface CartLine {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly qty: number;
}

@Component({
  selector: 'app-signals-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSlideToggleModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signals-page.html',
  styles: `
    .cart {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cart-line {
      display: grid;
      grid-template-columns: 1fr auto auto 32px auto auto;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 10px;
      background: var(--mat-sys-surface-container-high);
    }

    .cart-qty {
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .cart-sum {
      min-width: 90px;
      text-align: right;
      font-weight: 600;
    }

    .slider-label {
      display: flex;
      flex-direction: column;
      font: var(--mat-sys-label-large);
    }
  `,
})
export class SignalsPage {
  // ---------------------------------------------------------------------------
  // 1. signal() — единица изменяемого состояния.
  //    В Angular 16 это был developer preview; в v20 — фундамент фреймворка.
  // ---------------------------------------------------------------------------
  protected readonly lines = signal<readonly CartLine[]>([
    { id: 1, title: 'Подписка Angular Pro', price: 1200, qty: 1 },
    { id: 2, title: 'Курс по сигналам', price: 2500, qty: 2 },
    { id: 3, title: 'Набор наклеек', price: 300, qty: 3 },
  ]);

  protected readonly discountPercent = signal(10);
  protected readonly vatIncluded = signal(true);

  // ---------------------------------------------------------------------------
  // 2. computed() — производное состояние.
  //    Вычисляется лениво, мемоизируется и пересчитывается, только если
  //    реально изменился один из прочитанных сигналов.
  // ---------------------------------------------------------------------------
  protected readonly subtotal = computed(() =>
    this.lines().reduce((sum, line) => sum + line.price * line.qty, 0),
  );

  protected readonly discount = computed(() =>
    Math.round((this.subtotal() * this.discountPercent()) / 100),
  );

  protected readonly total = computed(() => {
    const withDiscount = this.subtotal() - this.discount();
    return this.vatIncluded() ? withDiscount : Math.round(withDiscount / 1.2);
  });

  /**
   * Счётчик пересчётов. Наглядно показывает мемоизацию: значение растёт,
   * только когда computed действительно пересчитался, а не на каждый рендер.
   */
  protected computedRuns = 0;
  protected readonly orderLabel = computed(() => {
    this.computedRuns++;
    return this.total() > 5000 ? 'Крупный заказ' : 'Обычный заказ';
  });

  // ---------------------------------------------------------------------------
  // 3. Сигнал с кастомной функцией сравнения.
  //    Уведомления подписчиков не будет, если equal вернёт true.
  // ---------------------------------------------------------------------------
  protected readonly coords = signal(
    { x: 0, y: 0 },
    { equal: (a, b) => a.x === b.x && a.y === b.y },
  );
  protected readonly coordsNotifications = signal(0);

  // ---------------------------------------------------------------------------
  // 4. effect() — побочные эффекты.
  //    В v16 effect был developer preview и требовал передачи injector
  //    вне контекста инъекции. В v20 это стабильный API.
  // ---------------------------------------------------------------------------
  protected readonly log = signal<readonly string[]>([]);

  constructor() {
    effect(() => {
      // Читаем total() — эффект подписан только на него.
      const total = this.total();

      // untracked() читает сигнал БЕЗ создания зависимости:
      // изменение discountPercent само по себе эффект не перезапустит.
      const percent = untracked(this.discountPercent);

      this.log.update((entries) =>
        [
          'итог = ' + total + ' ₴ (скидка ' + percent + '% прочитана через untracked)',
          ...entries,
        ].slice(0, 8),
      );
    });

    // Второй эффект наблюдает за сигналом с кастомным equal.
    effect(() => {
      this.coords();
      // untracked для записи — иначе эффект зациклится сам на себе.
      untracked(() => this.coordsNotifications.update((n) => n + 1));
    });
  }

  protected changeQty(id: number, delta: number): void {
    this.lines.update((lines) =>
      lines.map((line) =>
        line.id === id ? { ...line, qty: Math.max(0, line.qty + delta) } : line,
      ),
    );
  }

  protected setDiscount(value: number): void {
    this.discountPercent.set(value);
  }

  /** Записываем те же координаты: equal вернёт true, уведомления не будет. */
  protected setSameCoords(): void {
    this.coords.set({ x: this.coords().x, y: this.coords().y });
  }

  protected setNewCoords(): void {
    this.coords.set({ x: Math.round(Math.random() * 100), y: Math.round(Math.random() * 100) });
  }

  protected readonly signalSnippet = `
// Angular 20 — состояние компонента целиком на сигналах
export class CartPage {
  // signal() — изменяемое состояние
  readonly lines = signal<readonly CartLine[]>([]);
  readonly discountPercent = signal(10);

  // computed() — производное состояние, мемоизируется автоматически
  readonly subtotal = computed(() =>
    this.lines().reduce((sum, l) => sum + l.price * l.qty, 0),
  );
  readonly total = computed(() => this.subtotal() * (1 - this.discountPercent() / 100));

  addLine(line: CartLine) {
    // update() получает предыдущее значение, set() перезаписывает
    this.lines.update((lines) => [...lines, line]);
  }
}
`;

  protected readonly effectSnippet = `
constructor() {
  // effect() перезапускается при изменении любого прочитанного сигнала.
  // В Angular 16 это был developer preview, а вне контекста инъекции
  // приходилось вручную передавать { injector }.
  effect(() => {
    const total = this.total();

    // untracked() читает значение, НЕ создавая зависимость:
    // изменение discountPercent не перезапустит этот эффект.
    const percent = untracked(this.discountPercent);

    this.analytics.track('cart_total_changed', { total, percent });
  });

  // onCleanup отменяет предыдущий запуск эффекта
  effect((onCleanup) => {
    const id = setInterval(() => this.tick(), this.intervalMs());
    onCleanup(() => clearInterval(id));
  });
}
`;

  protected readonly equalSnippet = `
// Кастомная функция сравнения: подписчики не получат уведомление,
// если новое значение "равно" предыдущему.
readonly coords = signal(
  { x: 0, y: 0 },
  { equal: (a, b) => a.x === b.x && a.y === b.y },
);

coords.set({ x: 0, y: 0 }); // equal === true  -> уведомления НЕ будет
coords.set({ x: 1, y: 0 }); // equal === false -> эффекты перезапустятся
`;

  protected readonly beforeSnippet = `
// Angular 16: то же самое на RxJS
export class CartComponent implements OnInit, OnDestroy {
  lines = new BehaviorSubject<CartLine[]>([]);
  discount = new BehaviorSubject<number>(10);

  subtotal = this.lines.pipe(
    map((lines) => lines.reduce((s, l) => s + l.price * l.qty, 0)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  total = combineLatest([this.subtotal, this.discount]).pipe(
    map(([subtotal, discount]) => subtotal * (1 - discount / 100)),
  );

  private readonly destroyed = new Subject<void>();

  ngOnInit() {
    this.total.pipe(takeUntil(this.destroyed)).subscribe((total) => {
      this.analytics.track('cart_total_changed', { total });
      this.cdr.markForCheck(); // при OnPush — вручную
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Статус сигналов',
      before: 'Developer preview: API мог измениться, во внутренностях фреймворка не использовался.',
      after:
        'Стабильный API. На сигналах построены inputs, outputs, queries, ресурсы и change detection.',
    },
    {
      topic: 'Производное состояние',
      before: 'Геттер в компоненте (вызывается на каждый CD-цикл) или цепочка map + shareReplay.',
      after: 'computed() — ленивый, мемоизированный, сам отслеживает зависимости.',
    },
    {
      topic: 'Побочные эффекты',
      before: 'subscribe() + takeUntil(destroyed) + ручной markForCheck() при OnPush.',
      after: 'effect() с автоматической очисткой при уничтожении контекста и onCleanup.',
    },
    {
      topic: 'Change detection',
      before: 'zone.js перехватывает все асинхронные API и проверяет всё дерево компонентов.',
      after: 'Изменение сигнала точечно помечает только те компоненты, которые его читают.',
    },
    {
      topic: 'Отписка',
      before: 'Subject destroyed, ngOnDestroy, async pipe — три разных подхода в одном проекте.',
      after: 'Отписка не нужна: сигнал — это значение, а не подписка.',
    },
  ];
}
