import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  PristineChangeEvent,
  ReactiveFormsModule,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
  Validators,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { Post } from '../../core/models/jsonplaceholder';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

@Component({
  selector: 'app-forms-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatTimepickerModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  // Timepicker и Datepicker требуют адаптер дат.
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forms-page.html',
  styles: `
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
    }

    .full {
      grid-column: 1 / -1;
    }

    .event-kind {
      color: var(--mat-sys-primary);
      font-weight: 600;
    }
  `,
})
export class FormsPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Типизированная реактивная форма.
   * `NonNullableFormBuilder` избавляет от `| null` в типе каждого значения —
   * то, ради чего в v16 приходилось писать `{ nonNullable: true }` вручную.
   */
  protected readonly form = this.fb.group({
    title: this.fb.control('', [Validators.required, Validators.minLength(5)]),
    body: this.fb.control('', [Validators.required, Validators.maxLength(300)]),
    userId: this.fb.control(1, [Validators.required]),
    publishAt: this.fb.control<Date | null>(null),
    priority: this.fb.control(3),
    agreed: this.fb.control(false, [Validators.requiredTrue]),
  });

  /**
   * Angular 18: единый поток событий формы.
   * Раньше приходилось складывать valueChanges, statusChanges и следить
   * за touched/pristine вручную — они вообще не имели Observable.
   */
  protected readonly formEvents = toSignal(
    this.form.events.pipe(
      map((event) => {
        if (event instanceof ValueChangeEvent) return 'ValueChangeEvent';
        if (event instanceof StatusChangeEvent) return `StatusChangeEvent: ${event.status}`;
        if (event instanceof TouchedChangeEvent) return `TouchedChangeEvent: ${event.touched}`;
        if (event instanceof PristineChangeEvent) return `PristineChangeEvent: ${event.pristine}`;
        return 'FormSubmittedEvent / FormResetEvent';
      }),
    ),
    { initialValue: 'событий ещё не было' },
  );

  /** Значение формы как сигнал — мост toSignal() стабилен с v20. */
  protected readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly status = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly canSubmit = computed(() => this.status() === 'VALID');

  protected readonly created = signal<Post | null>(null);
  protected readonly sending = signal(false);
  protected readonly userIds = [1, 2, 3, 4, 5];

  protected get titleControl(): FormControl<string> {
    return this.form.controls.title;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.sending.set(true);

    // Для мутаций по-прежнему используется обычный HttpClient:
    // httpResource предназначен только для чтения данных.
    this.http
      .post<Post>(`${this.baseUrl}/posts`, {
        title: raw.title,
        body: raw.body,
        userId: raw.userId,
      })
      .subscribe({
        next: (post) => {
          this.created.set(post);
          this.sending.set(false);
        },
        error: () => this.sending.set(false),
      });
  }

  protected reset(): void {
    this.form.reset();
    this.created.set(null);
  }

  protected readonly typedFormsSnippet = `
// Типизированная форма без null в типах
private readonly fb = inject(NonNullableFormBuilder);

readonly form = this.fb.group({
  title: this.fb.control('', [Validators.required, Validators.minLength(5)]),
  userId: this.fb.control(1),
  publishAt: this.fb.control<Date | null>(null),
  agreed: this.fb.control(false, [Validators.requiredTrue]),
});

// Типы выводятся автоматически:
// form.value          -> Partial<{ title: string; userId: number; ... }>
// form.getRawValue()  -> { title: string; userId: number; ... }
// form.controls.title -> FormControl<string>

// В v16 то же самое требовало FormBuilder + { nonNullable: true } на каждом контроле.
`;

  protected readonly eventsSnippet = `
// Angular 18: один поток на все события формы
form.events.subscribe((event) => {
  if (event instanceof ValueChangeEvent)    { /* значение */ }
  if (event instanceof StatusChangeEvent)   { /* VALID | INVALID | PENDING | DISABLED */ }
  if (event instanceof TouchedChangeEvent)  { /* коснулись поля */ }
  if (event instanceof PristineChangeEvent) { /* форма изменена пользователем */ }
  if (event instanceof FormSubmittedEvent)  { /* сабмит */ }
  if (event instanceof FormResetEvent)      { /* сброс */ }
});

// Мост в сигналы:
readonly value = toSignal(form.valueChanges, { initialValue: form.getRawValue() });
readonly status = toSignal(form.statusChanges, { initialValue: form.status });
readonly canSubmit = computed(() => this.status() === 'VALID');
`;

  protected readonly beforeSnippet = `
// Angular 16
export class PostFormComponent implements OnInit, OnDestroy {
  form = this.fb.group({
    // без nonNullable тип был бы string | null
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    userId: this.fb.control(1, { nonNullable: true }),
  });

  valid = false;
  touched = false;

  private readonly destroyed = new Subject<void>();

  ngOnInit() {
    // два отдельных потока...
    this.form.statusChanges.pipe(takeUntil(this.destroyed)).subscribe((status) => {
      this.valid = status === 'VALID';
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(() => {
      // ...а touched вообще не имеет Observable — только опрос свойства
      this.touched = this.form.touched;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Типизация формы',
      before: 'FormBuilder + { nonNullable: true } на каждом контроле, иначе всюду | null.',
      after: 'NonNullableFormBuilder: типы выводятся сами, getRawValue() полностью типизирован.',
    },
    {
      topic: 'События формы',
      before: 'valueChanges и statusChanges по отдельности; touched/pristine — только свойства.',
      after: 'Единый поток control.events со всеми типами событий (v18).',
    },
    {
      topic: 'Связь с шаблоном',
      before: 'Подписки + markForCheck при OnPush.',
      after: 'toSignal() превращает поток формы в сигнал, дальше — обычный computed.',
    },
    {
      topic: 'Выбор времени в Material',
      before: 'Компонента не было: сторонние библиотеки или ручной ввод.',
      after: 'MatTimepicker — новый компонент Angular Material 20.',
    },
    {
      topic: 'Что дальше',
      before: '—',
      after: 'Команда Angular разрабатывает Signal Forms — формы, целиком построенные на сигналах.',
    },
  ];
}
