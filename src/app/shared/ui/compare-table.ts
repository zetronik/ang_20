import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ComparisonRow {
  readonly topic: string;
  readonly before: string;
  readonly after: string;
}

/**
 * Таблица «как было в Angular 16 → как стало в Angular 20».
 * Внутри — встроенный control flow `@for` с обязательным `track`
 * (в v16 это писалось как `*ngFor="let row of rows; trackBy: trackByTopic"`).
 */
@Component({
  selector: 'app-compare-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid">
      <div class="head before">Angular 16</div>
      <div class="head after">Angular 20</div>

      @for (row of rows(); track row.topic) {
        <div class="topic">{{ row.topic }}</div>
        <div class="cell before">{{ row.before }}</div>
        <div class="cell after">{{ row.after }}</div>
      } @empty {
        <div class="topic">Сравнений нет</div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .topic {
      grid-column: 1 / -1;
      font: var(--mat-sys-title-small);
      color: var(--mat-sys-primary);
      margin-top: 8px;
    }

    .head {
      font: var(--mat-sys-label-large);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      opacity: 0.7;
    }

    .cell {
      padding: 10px 12px;
      border-radius: 10px;
      font: var(--mat-sys-body-medium);
      white-space: pre-wrap;
    }

    .cell.before {
      background: color-mix(in srgb, var(--mat-sys-error-container) 55%, transparent);
      color: var(--mat-sys-on-error-container);
    }

    .cell.after {
      background: color-mix(in srgb, var(--mat-sys-primary-container) 55%, transparent);
      color: var(--mat-sys-on-primary-container);
    }

    @media (max-width: 700px) {
      .grid { grid-template-columns: 1fr; }
      .head { display: none; }
    }
  `,
})
export class CompareTable {
  readonly rows = input.required<readonly ComparisonRow[]>();
}
