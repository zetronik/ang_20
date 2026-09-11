import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TabItem } from './tab-item';

/**
 * Группа вкладок на сигнальных content-запросах.
 *
 * `contentChildren()` возвращает `Signal<readonly TabItem[]>`:
 * список пересобирается автоматически, когда проекция меняется
 * (например, вкладка добавляется внутри @if или @for).
 *
 * В Angular 16 это был `@ContentChildren(TabItemComponent) tabs!: QueryList<TabItemComponent>`
 * плюс подписка на `tabs.changes` в `ngAfterContentInit`.
 */
@Component({
  selector: 'app-tab-group',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab-bar">
      @for (tab of tabs(); track tab.label(); let index = $index) {
        <button
          matButton
          type="button"
          [class.active]="index === activeIndex()"
          (click)="activeIndex.set(index)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>

    <div class="tab-body">
      <ng-content />
    </div>

    <div class="tab-footer">Вкладок найдено: {{ count() }}</div>
  `,
  styles: `
    :host {
      display: block;
      border-radius: 14px;
      border: 1px solid var(--mat-sys-outline-variant);
      overflow: hidden;
      background: var(--mat-sys-surface-container-low);
    }

    .tab-bar {
      display: flex;
      gap: 4px;
      padding: 8px;
      background: var(--mat-sys-surface-container);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .tab-bar .active {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .tab-footer {
      padding: 6px 16px;
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      border-top: 1px dashed var(--mat-sys-outline-variant);
    }
  `,
})
export class TabGroup {
  /** Сигнальный content-запрос. */
  readonly tabs = contentChildren(TabItem);

  readonly count = computed(() => this.tabs().length);
  readonly activeIndex = signal(0);

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      const active = this.activeIndex();

      // Записываем в сигналы дочерних компонентов вне реактивного контекста.
      untracked(() => {
        tabs.forEach((tab, index) => tab.active.set(index === active));
      });
    });
  }
}
