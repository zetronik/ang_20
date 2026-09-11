import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VersionChip } from './version-chip';

/**
 * Обёртка демо-страницы: заголовок, бейдж версии, краткое описание
 * и слот для содержимого.
 */
@Component({
  selector: 'app-demo-page',
  imports: [VersionChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-demo-page' },
  template: `
    <header class="page-head">
      <div class="title-row">
        <h1>{{ heading() }}</h1>
        <app-version-chip [since]="since()" />
      </div>
      <p class="page-summary">{{ summary() }}</p>
    </header>

    <div class="page-body">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px 24px 64px;
    }

    .page-head {
      margin-bottom: 24px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .title-row h1 {
      margin: 0;
      font: var(--mat-sys-headline-medium);
    }

    .page-summary {
      margin: 8px 0 0;
      max-width: 80ch;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-large);
    }

    .page-body {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  `,
})
export class DemoPage {
  readonly heading = input.required<string>();
  readonly since = input.required<string>();
  readonly summary = input.required<string>();
}
