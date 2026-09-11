import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeStore } from '../../core/services/theme.store';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

interface TokenGroup {
  readonly title: string;
  readonly tokens: readonly string[];
}

@Component({
  selector: 'app-material3-page',
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './material3-page.html',
  styles: `
    .swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 8px;
    }

    .swatch {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid var(--mat-sys-outline-variant);
      font: var(--mat-sys-label-medium);
      word-break: break-all;
    }

    .type-scale > * {
      margin: 0 0 6px;
    }
  `,
})
export class Material3Page {
  protected readonly theme = inject(ThemeStore);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly buttonAppearances = ['text', 'filled', 'elevated', 'outlined', 'tonal'] as const;

  protected readonly tokenGroups: readonly TokenGroup[] = [
    {
      title: 'Поверхности',
      tokens: [
        '--mat-sys-surface',
        '--mat-sys-surface-container-low',
        '--mat-sys-surface-container',
        '--mat-sys-surface-container-high',
        '--mat-sys-surface-container-highest',
      ],
    },
    {
      title: 'Акценты',
      tokens: [
        '--mat-sys-primary-container',
        '--mat-sys-secondary-container',
        '--mat-sys-tertiary-container',
        '--mat-sys-error-container',
      ],
    },
  ];

  protected readonly progress = signal(65);

  protected showSnack(): void {
    this.snackBar.open('Компоненты Material 20 анимируются на CSS — @angular/animations не нужен', 'Ок', {
      duration: 4000,
    });
  }

  protected readonly themeSnippet = `
// styles.scss — вся тема приложения в одном миксине (Angular Material 18+)
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

body {
  // Светлая/тёмная тема переключается ОДНИМ CSS-свойством
  color-scheme: light;          // или dark, или "light dark" для системной

  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  font: var(--mat-sys-body-medium);
}
`;

  protected readonly tokensSnippet = `
/* Системные переменные доступны в любом компоненте приложения,
   в том числе в ваших собственных — без импорта Sass-миксинов. */

.card {
  background: var(--mat-sys-surface-container-high);
  color: var(--mat-sys-on-surface);
  border: 1px solid var(--mat-sys-outline-variant);
  border-radius: var(--mat-sys-corner-large);
  box-shadow: var(--mat-sys-level1);

  /* Типографика — тоже переменные, вместе с размером и межстрочным интервалом */
  font: var(--mat-sys-body-medium);
}

.card h2 {
  font: var(--mat-sys-title-large);
}
`;

  protected readonly overrideSnippet = `
// Точечная перекраска отдельного компонента — миксин overrides.
// Больше не нужно копаться в приватных CSS-классах Material.
@use '@angular/material' as mat;

.warning-card {
  @include mat.card-overrides((
    elevated-container-color: var(--mat-sys-error-container),
    elevated-container-shape: 20px,
  ));
}

.compact-toolbar {
  @include mat.toolbar-overrides((
    standard-height: 48px,
  ));
}
`;

  protected readonly beforeSnippet = `
// Angular 16 + Material 15/16: тема Material 2 на Sass
@use '@angular/material' as mat;

@include mat.core();

$app-primary: mat.define-palette(mat.$indigo-palette);
$app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$app-warn: mat.define-palette(mat.$red-palette);

$app-light-theme: mat.define-light-theme((
  color: (primary: $app-primary, accent: $app-accent, warn: $app-warn),
  typography: mat.define-typography-config(),
  density: 0,
));

$app-dark-theme: mat.define-dark-theme((
  color: (primary: $app-primary, accent: $app-accent, warn: $app-warn),
));

@include mat.all-component-themes($app-light-theme);

// Тёмная тема — отдельный класс и повторная генерация ВСЕХ стилей
.dark-theme {
  @include mat.all-component-colors($app-dark-theme);
}

// Своим компонентам цвета темы недоступны:
// приходилось прокидывать их вручную через mat.get-color-from-palette().
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Дизайн-система',
      before: 'Material 2; Material 3 в v16 отсутствовал.',
      after: 'Material 3 — значение по умолчанию начиная с v18.',
    },
    {
      topic: 'Определение темы',
      before: 'define-palette, define-light-theme, all-component-themes — десятки строк Sass.',
      after: 'Один миксин mat.theme() с палитрой, типографикой и плотностью.',
    },
    {
      topic: 'Тёмная тема',
      before: 'Отдельная тема + класс на body + повторная генерация всех стилей компонентов.',
      after: 'CSS-свойство color-scheme: light | dark | light dark.',
    },
    {
      topic: 'Доступ к цветам темы из своих компонентов',
      before: 'Sass-функции get-color-from-palette и ручной проброс переменных.',
      after: 'Готовые CSS-переменные --mat-sys-* в любом месте приложения.',
    },
    {
      topic: 'Кастомизация одного компонента',
      before: 'Переопределение приватных классов Material и ::ng-deep.',
      after: 'Миксины overrides: mat.card-overrides(), mat.button-overrides() и т.д.',
    },
    {
      topic: 'Анимации',
      before: 'BrowserAnimationsModule и пакет @angular/animations обязательны.',
      after: 'Компоненты анимируются на CSS; пакета @angular/animations в этом проекте нет.',
    },
    {
      topic: 'Новые компоненты',
      before: '—',
      after: 'MatTimepicker (v20), обновлённые кнопки с appearance: filled | elevated | tonal | outlined | text.',
    },
  ];
}
