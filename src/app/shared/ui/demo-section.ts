import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Карточка-секция внутри демо-страницы.
 *
 * Демонстрирует fallback-контент для `<ng-content>` (Angular 18):
 * если потребитель не передал ничего в слот `[hint]`, отрисуется текст по умолчанию.
 * До v18 такое приходилось эмулировать через `@ContentChild` + `*ngIf`.
 */
@Component({
  selector: 'app-demo-section',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-demo-section' },
  template: `
    <header class="section-head">
      @if (icon(); as name) {
        <mat-icon>{{ name }}</mat-icon>
      }
      <h2>{{ heading() }}</h2>
    </header>

    @if (description(); as text) {
      <p class="section-description">{{ text }}</p>
    }

    <div class="section-body">
      <ng-content />
    </div>

    <div class="section-hint">
      <mat-icon inline>lightbulb</mat-icon>
      <!-- Fallback-контент <ng-content> — нововведение Angular 18. -->
      <ng-content select="[hint]">Подсказка для этой секции не задана.</ng-content>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 20px 24px 16px;
      border-radius: 16px;
      background: var(--mat-sys-surface-container-low);
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .section-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .section-head h2 {
      margin: 0;
      font: var(--mat-sys-title-medium);
    }

    .section-head mat-icon {
      color: var(--mat-sys-primary);
    }

    .section-description {
      margin: 0 0 16px;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-medium);
    }

    .section-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-hint {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed var(--mat-sys-outline-variant);
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class DemoSection {
  readonly heading = input.required<string>();
  readonly icon = input<string>();
  readonly description = input<string>();
}
