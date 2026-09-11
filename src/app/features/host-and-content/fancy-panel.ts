import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AccentBorder } from './accent-border';
import { ElevateOnHover } from './elevate-on-hover';

/**
 * Панель, собранная из директив-поведений через `hostDirectives` (Angular 15+,
 * но по-настоящему удобная только вместе с новым объектом `host` из v17).
 *
 * Композиция вместо наследования: панель не наследует базовый класс,
 * а «подмешивает» готовые поведения и выставляет наружу их входы и выходы.
 */
@Component({
  selector: 'app-fancy-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    ElevateOnHover,
    {
      directive: AccentBorder,
      // Пробрасываем наружу вход и выход директивы.
      inputs: ['tone'],
      outputs: ['accentClick'],
    },
  ],
  host: {
    class: 'app-fancy-panel',
    '[attr.data-compact]': 'compact()',
  },
  template: `
    <header class="panel-head">
      <!-- Слот с содержимым по умолчанию (Angular 18) -->
      <ng-content select="[panelTitle]">Панель без заголовка</ng-content>
    </header>

    <div class="panel-body">
      <ng-content>Контент не передан — отрисовался fallback из ng-content.</ng-content>
    </div>

    <footer class="panel-actions">
      <ng-content select="[panelActions]">
        <span class="muted">Действий нет</span>
      </ng-content>
    </footer>
  `,
  styles: `
    :host {
      display: block;
      border-radius: 14px;
      background: var(--mat-sys-surface-container-high);
      padding: 14px 16px;
    }

    :host([data-compact='true']) .panel-body {
      font: var(--mat-sys-body-small);
    }

    .panel-head {
      font: var(--mat-sys-title-small);
      margin-bottom: 6px;
    }

    .panel-actions {
      margin-top: 10px;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .muted {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }
  `,
})
export class FancyPanel {
  readonly compact = input(false);
}
