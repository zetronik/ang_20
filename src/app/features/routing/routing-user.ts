import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../core/models/jsonplaceholder';

/**
 * Компонент вложенного маршрута.
 *
 * Ни одной подписки на ActivatedRoute: благодаря `withComponentInputBinding()`
 * роутер сам кладёт в сигнальные входы
 *  - параметры пути (`id`),
 *  - query-параметры (`tab`),
 *  - результат resolve (`user`),
 *  - статические `data` маршрута (`section`).
 *
 * В Angular 16 это выглядело как подписка на route.paramMap + route.data
 * с ручной отпиской в ngOnDestroy.
 */
@Component({
  selector: 'app-routing-user',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      @if (user(); as current) {
        <h3>
          <mat-icon>person</mat-icon>
          {{ current.name }}
        </h3>
        <dl>
          <dt>id из параметра пути</dt>
          <dd>{{ id() }}</dd>
          <dt>email</dt>
          <dd>{{ current.email }}</dd>
          <dt>телефон</dt>
          <dd>{{ current.phone }}</dd>
          <dt>компания</dt>
          <dd>{{ current.company.name }}</dd>
          <dt>город</dt>
          <dd>{{ current.address.city }}</dd>
        </dl>
      } @else {
        <p>Пользователь не найден — resolver вернул null.</p>
      }

      <div class="meta">
        <span>query-параметр tab: <strong>{{ tab() }}</strong></span>
        <span>data.section: <strong>{{ section() }}</strong></span>
        <span>Заголовок вкладки: <strong>{{ pageTitle() }}</strong></span>
      </div>
    </div>
  `,
  styles: `
    .card {
      padding: 16px 20px;
      border-radius: 14px;
      background: var(--mat-sys-surface-container-high);
      border: 1px solid var(--mat-sys-outline-variant);
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px;
    }

    dl {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 4px 12px;
      margin: 0;
    }

    dt {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-medium);
    }

    dd {
      margin: 0;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px dashed var(--mat-sys-outline-variant);
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class RoutingUser {
  /** Параметр пути :id — приходит строкой, приводим числом. */
  readonly id = input(0, { transform: numberAttribute });

  /** Результат resolve с ключом `user`. */
  readonly user = input<User | null>(null);

  /** Query-параметр ?tab=… */
  readonly tab = input('overview');

  /** Статические data маршрута. */
  readonly section = input('—');

  protected readonly pageTitle = computed(() => this.user()?.name ?? 'Неизвестный пользователь');
}
