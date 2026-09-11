import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../core/models/jsonplaceholder';

/**
 * Карточка пользователя.
 * Показывает `input.required()`, алиас входа и собственный `transform`.
 */
@Component({
  selector: 'app-user-badge',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-user-badge' },
  template: `
    <div class="avatar">{{ initials() }}</div>
    <div class="info">
      <strong>{{ user().name }}</strong>
      <span>{{ user().email }}</span>
      <span class="muted">{{ shortCompany() }}</span>
    </div>
    <mat-icon [style.color]="accent()">verified</mat-icon>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 14px;
      background: var(--mat-sys-surface-container-high);
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .avatar {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-weight: 700;
    }

    .info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .info span {
      font: var(--mat-sys-body-small);
    }

    .muted {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class UserBadge {
  /** Обязательный вход. Компилятор ругается, если родитель его не передал. */
  readonly user = input.required<User>();

  /**
   * Алиас: снаружи вход называется `color`, внутри — `accent`.
   * В v16 это писалось как `@Input('color') accent: string`.
   */
  readonly accent = input('var(--mat-sys-primary)', { alias: 'color' });

  /**
   * Собственная функция transform: обрезаем длину названия компании
   * прямо на входе, без отдельного пайпа и без ngOnChanges.
   */
  readonly companyLimit = input(24, {
    transform: (value: number | string) => {
      const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value;
      return Number.isFinite(parsed) ? Math.max(4, parsed) : 24;
    },
  });

  protected readonly initials = computed(() =>
    this.user()
      .name.split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join(''),
  );

  protected readonly shortCompany = computed(() => {
    const name = this.user().company.name;
    const limit = this.companyLimit();
    return name.length > limit ? name.slice(0, limit - 1) + '…' : name;
  });
}
