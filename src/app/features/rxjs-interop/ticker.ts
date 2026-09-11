import { ChangeDetectionStrategy, Component } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';

/**
 * Компонент, чей выход построен прямо из Observable.
 *
 * `outputFromObservable()` превращает поток в обычный output компонента:
 * родитель подписывается через `(tick)="..."`, а отписка происходит
 * автоматически при уничтожении компонента.
 */
@Component({
  selector: 'app-ticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-ticker' },
  template: `<span>Тикер работает и шлёт события раз в секунду</span>`,
  styles: `
    :host {
      display: inline-flex;
      padding: 8px 14px;
      border-radius: 10px;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      font: var(--mat-sys-label-large);
    }
  `,
})
export class Ticker {
  /** Поток -> выход компонента. Никаких EventEmitter и ручных подписок. */
  readonly tick = outputFromObservable(interval(1000).pipe(map((n) => n + 1)));
}
