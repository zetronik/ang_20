import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';
import { VersionChip } from '../../shared/ui/version-chip';

interface Profile {
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
}

@Component({
  selector: 'app-template-syntax-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSliderModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
    VersionChip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './template-syntax-page.html',
})
export class TemplateSyntaxPage {
  protected readonly base = signal(2);
  protected readonly exponent = signal(10);

  protected readonly userName = signal('Анна');
  protected readonly city = signal('Киев');

  protected readonly profiles: readonly Profile[] = [
    { name: 'Анна', email: 'anna@example.com' },
    { name: 'Борис', phone: '+380 67 000-00-00' },
    { name: 'Вера', email: 'vera@example.com', phone: '+380 50 111-11-11' },
  ];

  protected readonly clicks = signal(0);

  protected setBase(value: number): void {
    this.base.set(value);
  }

  protected setExponent(value: number): void {
    this.exponent.set(value);
  }

  protected onName(event: Event): void {
    this.userName.set((event.target as HTMLInputElement).value);
  }

  protected registerClick(): number {
    this.clicks.update((n) => n + 1);
    return this.clicks();
  }

  protected readonly operatorsSnippet = `
<!-- Angular 20: новые операторы в выражениях шаблона -->

<!-- Возведение в степень -->
<p>{{ base() ** exponent() }}</p>
<p>{{ 2 ** 3 ** 2 }}</p>   <!-- 512: правая ассоциативность, как в JS -->

<!-- Проверка наличия свойства -->
@if ('email' in profile) {
  <a [href]="'mailto:' + profile.email">Написать</a>
}

<!-- Шаблонные литералы прямо в шаблоне -->
<p>{{ \`Привет, \${userName()}! Вы из города \${city()}.\` }}</p>
<img [alt]="\`Аватар \${userName()}\`" [src]="\`/avatars/\${userName()}.png\`" />

<!-- Оператор void: вычислить выражение и вернуть undefined -->
<button (click)="void registerClick()">Посчитать клик</button>
`;

  protected readonly selfClosingSnippet = `
<!-- Angular 16: закрывающий тег обязателен даже для пустого компонента -->
<app-user-badge [user]="user"></app-user-badge>
<router-outlet></router-outlet>
<mat-divider></mat-divider>

<!-- Angular 17.1+: самозакрывающиеся теги для компонентов и элементов с ng-content -->
<app-user-badge [user]="user" />
<router-outlet />
<mat-divider />

<!-- Работает только для Angular-компонентов и директив,
     обычные HTML-элементы по-прежнему требуют закрывающий тег. -->
`;

  protected readonly letSnippet = `
<!-- @let (v18.1) — объявление, а не переменная: переприсвоить нельзя -->
@let user = users()[index()];
@let fullName = user.firstName + ' ' + user.lastName;
@let isAdmin = 'admin' in user.roles;

<h2>{{ fullName }}</h2>
@if (isAdmin) { <span>администратор</span> }

<!-- Область видимости — текущий блок и вложенные. -->
`;

  protected readonly beforeSnippet = `
<!-- Angular 16: обходные пути -->

<!-- Степень — только через метод компонента -->
<p>{{ pow(base, exponent) }}</p>

<!-- Проверка свойства — тоже метод -->
<a *ngIf="hasEmail(profile)" [href]="mailto(profile)">Написать</a>

<!-- Конкатенация вместо шаблонных литералов -->
<img [alt]="'Аватар ' + userName" [src]="'/avatars/' + userName + '.png'" />

<!-- Локальная переменная — хак через *ngIf ... as -->
<ng-container *ngIf="users[index] as user">
  <h2>{{ user.firstName + ' ' + user.lastName }}</h2>
</ng-container>

<!-- Каждый такой метод вызывается на КАЖДОМ проходе change detection -->
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Возведение в степень',
      before: 'Метод компонента или пайп: {{ pow(a, b) }}.',
      after: 'Оператор ** прямо в шаблоне.',
    },
    {
      topic: 'Проверка наличия свойства',
      before: 'Вспомогательный метод hasX(obj) в классе.',
      after: "Оператор in: @if ('email' in profile).",
    },
    {
      topic: 'Сборка строк',
      before: "Конкатенация через + или отдельный computed/метод.",
      after: 'Шаблонные литералы с интерполяцией внутри выражения.',
    },
    {
      topic: 'Пустые компоненты',
      before: '<app-x></app-x> — закрывающий тег обязателен.',
      after: '<app-x /> — самозакрывающийся тег.',
    },
    {
      topic: 'Локальные переменные',
      before: 'Хак *ngIf="expr as alias" с побочным эффектом: при falsy значение блок исчезает.',
      after: '@let — без побочных эффектов и без лишних обёрток.',
    },
    {
      topic: 'Вызов метода ради побочного эффекта',
      before: 'Приходилось писать обработчик, возвращающий void, в классе.',
      after: 'Оператор void прямо в привязке события.',
    },
  ];
}
