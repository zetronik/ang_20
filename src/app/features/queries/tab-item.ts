import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Одна вкладка. Родитель находит все такие компоненты через contentChildren()
 * и сам управляет их активностью.
 */
@Component({
  selector: 'app-tab-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-tab-item',
    '[hidden]': '!active()',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      padding: 16px;
    }
  `,
})
export class TabItem {
  readonly label = input.required<string>();
  /** Активностью управляет родительский TabGroup. */
  readonly active = signal(false);
}
