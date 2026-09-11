import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper">
      <mat-icon class="big">travel_explore</mat-icon>
      <h1>404 — такой страницы нет</h1>
      <p>Сработал wildcard-маршрут: компонент загружен лениво через loadComponent.</p>
      <a matButton="filled" routerLink="/">На главную</a>
    </div>
  `,
  styles: `
    .wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 96px 24px;
      text-align: center;
    }

    .big {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--mat-sys-primary);
    }
  `,
})
export class NotFoundPage {}
