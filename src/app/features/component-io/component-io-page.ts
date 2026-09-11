import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { API_BASE_URL } from '../../core/api.tokens';
import { User } from '../../core/models/jsonplaceholder';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';
import { RatingWidget } from './rating-widget';
import { UserBadge } from './user-badge';

@Component({
  selector: 'app-component-io-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
    RatingWidget,
    UserBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './component-io-page.html',
})
export class ComponentIoPage {
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly users = httpResource<readonly User[]>(() => `${this.baseUrl}/users`, {
    defaultValue: [],
  });

  /** Значение, связанное с виджетом через [(value)]. */
  protected readonly rating = signal(3);
  protected readonly widgetDisabled = signal(false);
  protected readonly events = signal<readonly string[]>([]);

  protected readonly ratingLabel = computed(() => {
    const value = this.rating();
    if (value === 0) return 'Оценки нет';
    if (value <= 2) return 'Нужно доработать';
    if (value <= 4) return 'Хорошо';
    return 'Отлично';
  });

  protected onRated(value: number): void {
    this.pushEvent(`rated -> ${value}`);
  }

  protected onCleared(): void {
    this.pushEvent('cleared (alias для output reset)');
  }

  private pushEvent(text: string): void {
    this.events.update((list) => [text, ...list].slice(0, 8));
  }

  protected readonly inputSnippet = `
// Angular 17.1+ — сигнальные входы
export class RatingWidget {
  // обязательный вход: отсутствие проверяется на этапе компиляции
  readonly label = input.required<string>();

  // значение по умолчанию + transform для атрибутов
  readonly max = input(5, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  // алиас: снаружи color, внутри accent
  readonly accent = input('primary', { alias: 'color' });

  // input — это Signal, поэтому его можно читать в computed
  readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));
}
`;

  protected readonly modelSnippet = `
// model() — двусторонняя привязка одной строкой
export class RatingWidget {
  readonly value = model(0);

  select(star: number) {
    this.value.set(star); // valueChange эмитится автоматически
  }
}

// Родитель:
// <app-rating-widget [(value)]="rating" />
`;

  protected readonly outputSnippet = `
// Angular 17.3+ — output() вместо EventEmitter
export class RatingWidget {
  readonly rated = output<number>();
  readonly reset = output<void>({ alias: 'cleared' });

  select(star: number) {
    this.rated.emit(star);
  }
}

// Плюсы: output() не Subject, его нельзя подписать напрямую,
// а отписка от подписчиков происходит автоматически.
`;

  protected readonly beforeSnippet = `
// Angular 16 — то же самое на декораторах
@Component({ selector: 'app-rating-widget', template: '...' })
export class RatingWidgetComponent implements OnChanges {
  @Input({ required: true }) label!: string;       // required появился в v16
  @Input() max = 5;
  @Input() disabled = false;
  @Input('color') accent = 'primary';

  // Двусторонняя привязка — руками
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  @Output() rated = new EventEmitter<number>();
  @Output('cleared') reset = new EventEmitter<void>();

  stars: number[] = [];

  // Производное состояние пересчитывается вручную
  ngOnChanges(changes: SimpleChanges) {
    if (changes['max']) {
      this.stars = Array.from({ length: this.max }, (_, i) => i + 1);
    }
  }

  select(star: number) {
    this.value = star;
    this.valueChange.emit(star);
    this.rated.emit(star);
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Объявление входа',
      before: '@Input() name = value — обычное свойство, изменения ловятся в ngOnChanges.',
      after: 'input() возвращает Signal: читается в computed/effect и в шаблоне.',
    },
    {
      topic: 'Обязательные входы',
      before: '@Input({ required: true }) + оператор ! для обхода strictPropertyInitialization.',
      after: 'input.required<T>() — без ! и без undefined в типе.',
    },
    {
      topic: 'Преобразование значения',
      before: 'Отдельный сеттер или ручной разбор в ngOnChanges.',
      after: 'Опция transform, готовые booleanAttribute и numberAttribute.',
    },
    {
      topic: 'Двусторонняя привязка',
      before: 'Пара @Input() value + @Output() valueChange и ручная синхронизация.',
      after: 'model() — один вызов, [(value)] работает из коробки.',
    },
    {
      topic: 'События',
      before: 'new EventEmitter<T>() — это RxJS Subject, его можно случайно подписать.',
      after: 'output<T>() — специализированный примитив без утечек и лишнего API.',
    },
    {
      topic: 'Реакция на изменение входа',
      before: 'ngOnChanges + SimpleChanges + проверка ключей строками.',
      after: 'computed() или effect() читают входной сигнал напрямую.',
    },
  ];
}
