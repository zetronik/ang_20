import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Бейдж «фича появилась в версии N».
 * Показывает связку `input()` + `computed()` + привязку `[class]`/`[style]`
 * к вычисляемому сигналу — без единого `@Input()` и `@HostBinding`.
 */
@Component({
  selector: 'app-version-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-version-chip',
    '[style.--chip-hue]': 'hue()',
    '[attr.title]': '"Доступно начиная с Angular " + since()',
  },
  template: `{{ since() }}`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 999px;
      font: var(--mat-sys-label-small);
      font-weight: 600;
      letter-spacing: 0.04em;
      color: hsl(var(--chip-hue) 70% 30%);
      background: hsl(var(--chip-hue) 80% 90%);
      border: 1px solid hsl(var(--chip-hue) 60% 75%);
    }

    :host-context(body.dark-theme) {
      color: hsl(var(--chip-hue) 80% 82%);
      background: hsl(var(--chip-hue) 40% 22%);
      border-color: hsl(var(--chip-hue) 40% 38%);
    }
  `,
})
export class VersionChip {
  readonly since = input.required<string>();

  /** Чем новее версия — тем «горячее» цвет бейджа. */
  protected readonly hue = computed(() => {
    const major = Number.parseInt(this.since().replace('v', ''), 10);
    switch (major) {
      case 17:
        return 210;
      case 18:
        return 260;
      case 19:
        return 300;
      case 20:
        return 12;
      default:
        return 160;
    }
  });
}
