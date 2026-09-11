import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';
import { AccentTone } from './accent-border';
import { FancyPanel } from './fancy-panel';

@Component({
  selector: 'app-host-and-content-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
    FancyPanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './host-and-content-page.html',
})
export class HostAndContentPage {
  protected readonly tones: readonly AccentTone[] = ['primary', 'tertiary', 'error'];
  protected readonly tone = signal<AccentTone>('primary');
  protected readonly compact = signal(false);
  protected readonly clicks = signal<readonly string[]>([]);

  protected onAccentClick(tone: AccentTone): void {
    this.clicks.update((list) => [`accentClick -> ${tone}`, ...list].slice(0, 6));
  }

  protected readonly hostSnippet = `
// Angular 17+: весь host-контракт — в одном объекте метаданных
@Directive({
  selector: '[appElevateOnHover]',
  host: {
    // привязки свойств и стилей
    '[style.transform]': 'hovered() ? "translateY(-3px)" : "none"',
    '[style.box-shadow]': 'hovered() ? "var(--mat-sys-level3)" : "var(--mat-sys-level1)"',
    // слушатели событий
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    // статические атрибуты и классы
    'role': 'group',
    'class': 'elevated',
  },
})
export class ElevateOnHover {
  readonly hovered = signal(false);
}
`;

  protected readonly hostDirectivesSnippet = `
// Композиция поведений вместо наследования
@Component({
  selector: 'app-fancy-panel',
  hostDirectives: [
    ElevateOnHover,                       // без конфигурации
    {
      directive: AccentBorder,
      inputs: ['tone'],                   // поднимаем вход наружу
      outputs: ['accentClick'],           // и выход тоже
    },
  ],
  template: '...',
})
export class FancyPanel {}

// Снаружи это выглядит так, будто tone и accentClick
// объявлены в самой панели:
// <app-fancy-panel tone="error" (accentClick)="onClick($event)" />
`;

  protected readonly contentSnippet = `
// Angular 18: содержимое по умолчанию для <ng-content>
@Component({
  template: \`
    <header>
      <ng-content select="[panelTitle]">Панель без заголовка</ng-content>
    </header>

    <div class="body">
      <ng-content>Контент не передан</ng-content>
    </div>

    <footer>
      <ng-content select="[panelActions]">
        <span class="muted">Действий нет</span>
      </ng-content>
    </footer>
  \`,
})
export class FancyPanel {}
`;

  protected readonly beforeSnippet = `
// Angular 16: декораторы на каждый случай
@Directive({ selector: '[appElevateOnHover]' })
export class ElevateOnHoverDirective {
  @HostBinding('style.transform') transform = 'none';
  @HostBinding('style.boxShadow') shadow = 'var(--elevation-1)';

  @HostListener('mouseenter') onEnter() {
    this.transform = 'translateY(-3px)';
    this.shadow = 'var(--elevation-3)';
  }

  @HostListener('mouseleave') onLeave() {
    this.transform = 'none';
    this.shadow = 'var(--elevation-1)';
  }
}

// А fallback для ng-content приходилось эмулировать вручную:
@Component({
  template: \`
    <header>
      <ng-content select="[panelTitle]"></ng-content>
      <span *ngIf="!hasTitle">Панель без заголовка</span>
    </header>
  \`,
})
export class PanelComponent implements AfterContentInit {
  @ContentChild('[panelTitle]') titleRef?: ElementRef;
  hasTitle = false;

  ngAfterContentInit() {
    this.hasTitle = !!this.titleRef;
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Привязки к host-элементу',
      before: '@HostBinding и @HostListener — по декоратору на каждую привязку.',
      after: 'Один объект host в метаданных: привязки, слушатели, классы и атрибуты рядом.',
    },
    {
      topic: 'Типобезопасность host-привязок',
      before: 'Значения не проверялись компилятором шаблонов.',
      after: 'Флаг typeCheckHostBindings (включён по умолчанию в новых проектах v20) проверяет их.',
    },
    {
      topic: 'Переиспользование поведений',
      before: 'Наследование от базового класса или ручное навешивание директив в шаблоне.',
      after: 'hostDirectives: композиция с пробросом входов и выходов.',
    },
    {
      topic: 'Контент по умолчанию',
      before: 'ContentChild + ngAfterContentInit + *ngIf для эмуляции fallback.',
      after: 'Содержимое прямо внутри <ng-content>…</ng-content>.',
    },
  ];
}
