import { Directive, signal } from '@angular/core';

/**
 * Директива-поведение: приподнимает элемент при наведении.
 *
 * Весь host-контракт описан объектом `host` в метаданных —
 * @HostBinding и @HostListener не используются вовсе.
 * Это рекомендованный стиль начиная с Angular 17.
 */
@Directive({
  selector: '[appElevateOnHover]',
  host: {
    '[style.transform]': 'hovered() ? "translateY(-3px)" : "none"',
    '[style.box-shadow]': 'hovered() ? "var(--mat-sys-level3)" : "var(--mat-sys-level1)"',
    '[style.transition]': '"transform 140ms ease, box-shadow 140ms ease"',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(focusin)': 'hovered.set(true)',
    '(focusout)': 'hovered.set(false)',
  },
})
export class ElevateOnHover {
  readonly hovered = signal(false);
}
