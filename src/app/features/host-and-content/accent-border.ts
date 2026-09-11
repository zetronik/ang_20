import { Directive, input, output } from '@angular/core';

export type AccentTone = 'primary' | 'tertiary' | 'error';

const TONE_VARS: Record<AccentTone, string> = {
  primary: 'var(--mat-sys-primary)',
  tertiary: 'var(--mat-sys-tertiary)',
  error: 'var(--mat-sys-error)',
};

/**
 * Вторая директива-поведение: цветная рамка слева.
 * Её вход и выход будут «подняты» наружу через hostDirectives.
 */
@Directive({
  selector: '[appAccentBorder]',
  host: {
    '[style.border-left]': '"4px solid " + color()',
    '[style.padding-left]': '"16px"',
    '(click)': 'accentClick.emit(tone())',
  },
})
export class AccentBorder {
  readonly tone = input<AccentTone>('primary');
  readonly accentClick = output<AccentTone>();

  protected color(): string {
    return TONE_VARS[this.tone()];
  }
}
