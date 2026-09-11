import { ChangeDetectionStrategy, Component, computed, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

interface Member {
  readonly id: number;
  readonly name: string;
  readonly role: string;
}

const TEAMS: Readonly<Record<string, readonly Member[]>> = {
  frontend: [
    { id: 1, name: 'Анна', role: 'Team lead' },
    { id: 2, name: 'Борис', role: 'Senior' },
    { id: 3, name: 'Вера', role: 'Middle' },
  ],
  backend: [
    { id: 4, name: 'Глеб', role: 'Architect' },
    { id: 5, name: 'Дина', role: 'Senior' },
  ],
  qa: [
    { id: 6, name: 'Егор', role: 'QA lead' },
    { id: 7, name: 'Жанна', role: 'Automation' },
    { id: 8, name: 'Игорь', role: 'Manual' },
  ],
};

@Component({
  selector: 'app-linked-signal-page',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './linked-signal-page.html',
  styles: `
    .members {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .member {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 10px 16px;
      border-radius: 12px;
      border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface-container-high);
      cursor: pointer;
      transition: background 120ms ease;
    }

    .member:hover {
      background: var(--mat-sys-surface-container-highest);
    }

    .member.selected {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-color: var(--mat-sys-primary);
    }

    .member .role {
      font: var(--mat-sys-label-small);
      opacity: 0.75;
    }
  `,
})
export class LinkedSignalPage {
  protected readonly teamNames = Object.keys(TEAMS);

  /** Источник данных: выбранная команда. */
  protected readonly team = signal<string>('frontend');

  protected readonly members = computed(() => TEAMS[this.team()] ?? []);

  /**
   * linkedSignal() — писуемый сигнал, привязанный к источнику.
   *
   * Пользователь может выбрать любого участника (writable),
   * но при смене команды значение автоматически пересчитается из источника.
   *
   * В Angular 16–18 приходилось писать effect(), который вручную вызывал set(),
   * и следить, чтобы не получилось бесконечного цикла.
   */
  protected readonly selectedId = linkedSignal<readonly Member[], number | null>({
    source: () => this.members(),
    computation: (members, previous) => {
      // previous?.value — предыдущее значение самого linkedSignal.
      // Если прежний участник есть и в новой команде, сохраняем выбор.
      const stillThere = members.some((m) => m.id === previous?.value);
      return stillThere ? (previous?.value ?? null) : (members[0]?.id ?? null);
    },
  });

  protected readonly selectedMember = computed(
    () => this.members().find((m) => m.id === this.selectedId()) ?? null,
  );

  /**
   * Короткая форма linkedSignal: вычисление без доступа к предыдущему значению.
   * Счётчик товара сбрасывается в 1 при каждой смене выбранного участника.
   */
  protected readonly ticketCount = linkedSignal(() => {
    this.selectedId();
    return 1;
  });

  protected readonly resetCount = signal(0);

  /** В шаблонах Angular нельзя писать стрелочные функции — выносим в метод. */
  protected changeTickets(delta: number): void {
    this.ticketCount.update((n) => Math.max(0, n + delta));
  }

  protected selectTeam(name: string): void {
    this.team.set(name);
    this.resetCount.update((n) => n + 1);
  }

  protected readonly linkedSnippet = `
// Angular 19+: linkedSignal — писуемый сигнал, зависящий от источника
readonly selectedId = linkedSignal<readonly Member[], number | null>({
  // source — реактивная зависимость
  source: () => this.members(),
  // computation получает новое значение источника и предыдущее состояние
  computation: (members, previous) => {
    const stillThere = members.some((m) => m.id === previous?.value);
    return stillThere ? previous!.value : (members[0]?.id ?? null);
  },
});

// Значение можно писать вручную — это обычный WritableSignal
selectedId.set(42);

// ...но при изменении members() оно пересчитается из computation
`;

  protected readonly shortSnippet = `
// Короткая форма: только вычисление, без previous
readonly ticketCount = linkedSignal(() => {
  this.selectedId(); // зависимость
  return 1;          // сброс в значение по умолчанию
});

// Эквивалент computed(), но результат можно перезаписать:
ticketCount.update((n) => n + 1);
`;

  protected readonly beforeSnippet = `
// Angular 16: тот же сброс через effect + set
export class TeamComponent {
  readonly members = signal<Member[]>([]);
  readonly selectedId = signal<number | null>(null);

  constructor(private readonly injector: Injector) {
    // effect в v16 — developer preview; вне контекста инъекции нужен injector
    effect(
      () => {
        const members = this.members();
        // ЧИТАТЬ selectedId здесь нельзя — получим бесконечный цикл,
        // поэтому нужен untracked (который тоже был preview).
        const current = untracked(this.selectedId);
        if (!members.some((m) => m.id === current)) {
          this.selectedId.set(members[0]?.id ?? null);
        }
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }
}

// ...а до сигналов вообще — ngOnChanges + ручная синхронизация полей.
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Сброс зависимого состояния',
      before: 'effect() + untracked() + set(), с флагом allowSignalWrites и риском зациклиться.',
      after: 'linkedSignal({ source, computation }) — один декларативный вызов.',
    },
    {
      topic: 'Доступ к предыдущему значению',
      before: 'Хранить вручную в отдельном поле класса.',
      after: 'Второй аргумент computation: { source, value } предыдущего состояния.',
    },
    {
      topic: 'Порядок выполнения',
      before: 'effect выполняется асинхронно — между изменением источника и сбросом есть «дырка».',
      after: 'linkedSignal пересчитывается синхронно при чтении — промежуточного состояния нет.',
    },
    {
      topic: 'Типичный сценарий',
      before: 'Список опций изменился → выбранное значение осталось невалидным.',
      after: 'Выбранное значение либо сохраняется, либо корректно сбрасывается по правилу.',
    },
  ];
}
