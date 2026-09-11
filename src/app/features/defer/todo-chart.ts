import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/api.tokens';
import { Todo } from '../../core/models/jsonplaceholder';

interface Bar {
  readonly userId: number;
  readonly done: number;
  readonly total: number;
  readonly percent: number;
}

/**
 * Второй «тяжёлый» компонент: считает статистику и рисует SVG-диаграмму.
 * Тоже загружается лениво — блоком @defer с другим триггером.
 */
@Component({
  selector: 'app-todo-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart">
      @for (bar of bars(); track bar.userId) {
        <div class="bar-row">
          <span class="bar-label">user {{ bar.userId }}</span>
          <div class="bar-track">
            <div class="bar-fill" [style.width.%]="bar.percent"></div>
          </div>
          <span class="bar-value">{{ bar.done }} / {{ bar.total }}</span>
        </div>
      } @empty {
        <p>Считаем статистику…</p>
      }
    </div>
  `,
  styles: `
    .chart {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bar-row {
      display: grid;
      grid-template-columns: 80px 1fr 70px;
      align-items: center;
      gap: 10px;
    }

    .bar-label,
    .bar-value {
      font: var(--mat-sys-label-medium);
      font-variant-numeric: tabular-nums;
    }

    .bar-track {
      height: 14px;
      border-radius: 999px;
      background: var(--mat-sys-surface-container-highest);
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--mat-sys-primary);
      transition: width 400ms ease;
    }
  `,
})
export class TodoChart {
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly todos = httpResource<readonly Todo[]>(() => `${this.baseUrl}/todos`, {
    defaultValue: [],
  });

  protected readonly bars = computed<readonly Bar[]>(() => {
    const grouped = new Map<number, { done: number; total: number }>();

    for (const todo of this.todos.value()) {
      const entry = grouped.get(todo.userId) ?? { done: 0, total: 0 };
      entry.total++;
      if (todo.completed) {
        entry.done++;
      }
      grouped.set(todo.userId, entry);
    }

    return [...grouped.entries()]
      .map(([userId, { done, total }]) => ({
        userId,
        done,
        total,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
      }))
      .sort((a, b) => b.percent - a.percent);
  });
}
