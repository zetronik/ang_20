import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { API_BASE_URL } from '../../core/api.tokens';
import { User } from '../../core/models/jsonplaceholder';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-control-flow-page',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './control-flow-page.html',
  styles: `
    .user-row {
      display: grid;
      grid-template-columns: 40px 1fr 1fr auto;
      align-items: center;
      gap: 12px;
      padding: 8px 14px;
      border-radius: 10px;
      background: var(--mat-sys-surface-container-high);
    }

    .user-row.odd {
      background: var(--mat-sys-surface-container);
    }

    .badge {
      padding: 2px 10px;
      border-radius: 999px;
      font: var(--mat-sys-label-small);
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }
  `,
})
export class ControlFlowPage {
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly users = httpResource<readonly User[]>(() => `${this.baseUrl}/users`, {
    defaultValue: [],
  });

  protected readonly filter = signal('');

  protected readonly visibleUsers = computed(() => {
    const needle = this.filter().trim().toLowerCase();
    if (!needle) {
      return this.users.value();
    }
    return this.users
      .value()
      .filter(
        (user) =>
          user.name.toLowerCase().includes(needle) ||
          user.company.name.toLowerCase().includes(needle),
      );
  });

  /** Демонстрационное состояние для @switch. */
  protected readonly state = signal<LoadState>('ready');
  protected readonly states: readonly LoadState[] = ['idle', 'loading', 'ready', 'error'];

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected readonly ifSnippet = `
<!-- Angular 17+: встроенный control flow -->
@if (user(); as current) {
  <p>Привет, {{ current.name }}</p>
} @else if (loading()) {
  <p>Загружаем…</p>
} @else {
  <p>Пользователь не найден</p>
}

<!-- Ключевое отличие: @if — часть синтаксиса шаблона.
     Ни CommonModule, ни NgIf импортировать не нужно,
     а @else if пишется одной конструкцией. -->
`;

  protected readonly forSnippet = `
<!-- track обязателен: компилятор не даст забыть про идентификацию элементов -->
@for (user of users(); track user.id) {
  <div class="row" [class.odd]="$odd">
    {{ $index + 1 }} / {{ $count }} — {{ user.name }}
    @if ($first) { <span>первый</span> }
    @if ($last) { <span>последний</span> }
  </div>
} @empty {
  <p>Ничего не найдено</p>
}

<!-- Доступные контекстные переменные: $index, $count, $first, $last, $even, $odd.
     Их можно переименовать: @for (u of users(); track u.id; let i = $index) -->
`;

  protected readonly switchSnippet = `
@switch (state()) {
  @case ('idle')    { <p>Ожидание</p> }
  @case ('loading') { <p>Загрузка…</p> }
  @case ('ready')   { <p>Готово</p> }
  @default          { <p>Ошибка</p> }
}

<!-- В отличие от *ngSwitchCase, сравнение строгое (===)
     и типобезопасное: опечатка в @case будет ошибкой компиляции,
     если state() имеет литеральный union-тип. -->
`;

  protected readonly letSnippet = `
<!-- @let (v18.1): локальная переменная шаблона -->
@let total = users().length;
@let firstName = users()[0]?.name ?? 'нет данных';
@let greeting = 'Всего пользователей: ' + total;

<p>{{ greeting }}, первый — {{ firstName }}</p>

<!-- Раньше для этого использовали хак с *ngIf="expr as alias"
     или лишний <ng-container *ngIf>. @let нельзя переприсвоить —
     это именно объявление, а не переменная. -->
`;

  protected readonly beforeSnippet = `
<!-- Angular 16: структурные директивы -->
<ng-container *ngIf="user$ | async as current; else loadingTpl">
  <p>Привет, {{ current.name }}</p>
</ng-container>

<ng-template #loadingTpl>
  <p *ngIf="loading; else notFoundTpl">Загружаем…</p>
</ng-template>

<ng-template #notFoundTpl>
  <p>Пользователь не найден</p>
</ng-template>

<div *ngFor="let user of users; trackBy: trackById; index as i; odd as isOdd"
     [class.odd]="isOdd">
  {{ i + 1 }} — {{ user.name }}
</div>

<ng-container [ngSwitch]="state">
  <p *ngSwitchCase="'idle'">Ожидание</p>
  <p *ngSwitchCase="'loading'">Загрузка…</p>
  <p *ngSwitchDefault>Ошибка</p>
</ng-container>

<!-- И обязательный импорт:
     imports: [NgIf, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe] -->
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Импорты',
      before: 'CommonModule или поимённо NgIf, NgForOf, NgSwitch… в каждом компоненте.',
      after: 'Ничего импортировать не нужно — это синтаксис шаблона.',
    },
    {
      topic: 'Ветка else',
      before: 'Отдельный <ng-template #ref> и ссылка на него; вложенные условия нечитаемы.',
      after: '@else if и @else прямо на месте, как в обычном коде.',
    },
    {
      topic: 'Отслеживание элементов списка',
      before: 'trackBy — необязательная функция в классе компонента; про неё легко забыть.',
      after: 'track — обязательное выражение прямо в шаблоне.',
    },
    {
      topic: 'Пустой список',
      before: 'Дополнительный *ngIf="!items.length" рядом с *ngFor.',
      after: 'Блок @empty внутри самого @for.',
    },
    {
      topic: 'Производительность',
      before: 'Структурные директивы — это инстансы директив с собственным жизненным циклом.',
      after: 'Control flow компилируется в инструкции рантайма: меньше кода и быстрее обновление списков.',
    },
    {
      topic: 'Локальные переменные',
      before: 'Хак *ngIf="expr as alias" или лишние обёртки ng-container.',
      after: '@let — явное объявление переменной шаблона.',
    },
    {
      topic: 'Статус *ngIf / *ngFor',
      before: 'Единственный способ писать условия и циклы.',
      after: 'Работают, но помечены устаревшими в v20; есть автоматическая миграция.',
    },
  ];
}
