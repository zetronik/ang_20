import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Виджет оценки — компактная витрина нового API компонентов.
 *
 * ┌ input()          — сигнальный вход вместо @Input()
 * ├ input.required() — обязательный вход, проверяется компилятором
 * ├ input(..., { transform }) — преобразование значения на входе
 * ├ model()          — двусторонняя привязка [(value)] без @Output valueChange
 * └ output()         — функция вместо new EventEmitter()
 */
@Component({
  selector: 'app-rating-widget',
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-rating-widget',
    // Объект host вместо @HostBinding/@HostListener (рекомендация с v17).
    '[class.disabled]': 'disabled()',
    '[attr.aria-label]': 'label()',
    role: 'group',
  },
  template: `
    <span class="label">{{ label() }}</span>

    <div class="stars">
      @for (star of stars(); track star) {
        <button
          matIconButton
          type="button"
          [disabled]="disabled()"
          [attr.aria-pressed]="star <= value()"
          (click)="select(star)"
        >
          <mat-icon>{{ star <= value() ? 'star' : 'star_border' }}</mat-icon>
        </button>
      }
    </div>

    <span class="value">{{ value() }} / {{ max() }}</span>

    <button matButton type="button" [disabled]="disabled() || value() === 0" (click)="clear()">
      Сбросить
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 12px;
      background: var(--mat-sys-surface-container-high);
    }

    :host(.disabled) {
      opacity: 0.55;
    }

    .label {
      font: var(--mat-sys-title-small);
      min-width: 140px;
    }

    .stars {
      display: flex;
    }

    .stars mat-icon {
      color: var(--mat-sys-primary);
    }

    .value {
      font-variant-numeric: tabular-nums;
      min-width: 48px;
    }
  `,
})
export class RatingWidget {
  /** Обязательный вход: без него шаблон родителя не скомпилируется. */
  readonly label = input.required<string>();

  /**
   * `transform` приводит значение из атрибута.
   * `numberAttribute` позволяет писать max="10" вместо [max]="10".
   */
  readonly max = input(5, { transform: numberAttribute });

  /** `booleanAttribute` разрешает писать просто `disabled` без значения. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * model() — двусторонняя привязка.
   * Родитель пишет `[(value)]="rating"`. Внутри это обычный WritableSignal.
   * В v16 нужна была пара @Input() value + @Output() valueChange.
   */
  readonly value = model(0);

  /** output() вместо `@Output() rated = new EventEmitter<number>()`. */
  readonly rated = output<number>();

  /** У output тоже есть alias — снаружи событие называется `cleared`. */
  readonly reset = output<void>({ alias: 'cleared' });

  protected readonly stars = computed(() =>
    Array.from({ length: this.max() }, (_, index) => index + 1),
  );

  protected select(star: number): void {
    if (this.disabled()) {
      return;
    }
    // set() на model автоматически эмитит valueChange наружу.
    this.value.set(star);
    this.rated.emit(star);
  }

  protected clear(): void {
    this.value.set(0);
    this.reset.emit();
  }
}
