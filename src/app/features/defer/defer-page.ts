import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';
import { PhotoWall } from './photo-wall';
import { TodoChart } from './todo-chart';

@Component({
  selector: 'app-defer-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
    // Оба компонента используются ТОЛЬКО внутри @defer,
    // поэтому компилятор выносит их в отдельные чанки.
    PhotoWall,
    TodoChart,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './defer-page.html',
  styles: `
    .placeholder {
      display: grid;
      place-items: center;
      min-height: 140px;
      border-radius: 14px;
      border: 2px dashed var(--mat-sys-outline-variant);
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
      padding: 16px;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .spacer-block {
      display: grid;
      place-items: center;
      height: 240px;
      border-radius: 14px;
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class DeferPage {
  /** Управляет триггером `when`. */
  protected readonly showChart = signal(false);

  protected readonly triggersSnippet = `
<!-- Angular 17+: декларативная ленивая загрузка части шаблона -->

@defer {
  <app-photo-wall />
} @placeholder (minimum 500ms) {
  <div class="placeholder">Здесь появится стена фотографий</div>
} @loading (after 100ms; minimum 600ms) {
  <mat-spinner diameter="32" />
} @error {
  <p>Не удалось загрузить блок</p>
}

<!-- Триггеры загрузки -->
@defer (on idle)                  { ... }  <!-- по умолчанию -->
@defer (on viewport)              { ... }  <!-- когда placeholder попал в область видимости -->
@defer (on interaction)           { ... }  <!-- клик или нажатие клавиши по placeholder -->
@defer (on hover)                 { ... }  <!-- наведение курсора -->
@defer (on timer(2s))             { ... }  <!-- через заданное время -->
@defer (on immediate)             { ... }  <!-- сразу после отрисовки страницы -->
@defer (when condition())         { ... }  <!-- по выражению -->

<!-- Триггер можно привязать к чужому элементу по ссылке -->
<button #loadBtn>Показать</button>
@defer (on interaction(loadBtn)) { ... }

<!-- Предзагрузка отдельным триггером -->
@defer (on viewport; prefetch on idle) { ... }
`;

  protected readonly hydrateSnippet = `
<!-- Angular 19+, только для SSR: инкрементальная гидратация.
     Разметка приходит с сервера уже отрисованной, а JavaScript
     подгружается и «оживляет» блок только по триггеру. -->

@defer (hydrate on viewport) {
  <app-comments [postId]="postId()" />
}

@defer (hydrate on interaction) {
  <app-heavy-editor />
}

@defer (hydrate never) {
  <app-static-footer />   <!-- никогда не гидрируется: чистый HTML -->
}

<!-- Включается в конфигурации приложения:
     provideClientHydration(withIncrementalHydration()) -->
`;

  protected readonly beforeSnippet = `
// Angular 16: ленивая загрузка компонента вручную
@Component({
  template: \`
    <ng-container #host></ng-container>
    <div *ngIf="loading">Загрузка…</div>
    <div *ngIf="!loaded && !loading" (click)="load()">Показать блок</div>
  \`,
})
export class LazyHostComponent {
  @ViewChild('host', { read: ViewContainerRef }) host!: ViewContainerRef;

  loading = false;
  loaded = false;

  async load() {
    this.loading = true;
    try {
      const { PhotoWallComponent } = await import('./photo-wall.component');
      this.host.createComponent(PhotoWallComponent);
      this.loaded = true;
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}

// Триггеры (viewport, hover, idle) пришлось бы писать самому:
// IntersectionObserver, requestIdleCallback, обработчики событий.
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Ленивая загрузка части экрана',
      before: 'ViewContainerRef + динамический import() + createComponent вручную.',
      after: 'Блок @defer: компилятор сам выносит зависимости в отдельный чанк.',
    },
    {
      topic: 'Состояния загрузки',
      before: 'Три булевых флага и *ngIf на каждый.',
      after: 'Блоки @placeholder, @loading, @error с параметрами minimum и after.',
    },
    {
      topic: 'Триггеры',
      before: 'IntersectionObserver, requestIdleCallback, ручные обработчики событий.',
      after: 'on idle / viewport / interaction / hover / timer / immediate / when.',
    },
    {
      topic: 'Предзагрузка',
      before: 'Отдельная логика «начать грузить заранее».',
      after: 'prefetch on … — независимый триггер в той же строке.',
    },
    {
      topic: 'Мерцание интерфейса',
      before: 'Заглушка могла мелькнуть на долю секунды.',
      after: 'Параметры minimum и after у @placeholder и @loading убирают мерцание.',
    },
    {
      topic: 'SSR',
      before: 'Гидратация всего дерева сразу либо полный отказ от SSR.',
      after: 'hydrate on viewport / interaction / never — инкрементальная гидратация.',
    },
  ];
}
