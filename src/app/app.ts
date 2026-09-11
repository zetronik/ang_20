import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
  VERSION,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { injectMediaQuery } from './core/inject-media-query';
import { DEMO_LINKS, DemoLink, NAV_GROUPS, NavGroup } from './core/nav';
import { ThemeStore } from './core/services/theme.store';
import { VersionChip } from './shared/ui/version-chip';

interface NavSection {
  readonly group: NavGroup;
  readonly links: readonly DemoLink[];
}

/**
 * Корневой компонент-оболочка.
 *
 * Обратите внимание на имя файла: `app.ts`, а не `app.component.ts`.
 * Начиная с Angular 20 официальный style guide отказался от суффиксов
 * `.component` / `.service` / `.directive` в именах файлов и классов.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    VersionChip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeStore);

  /** `VERSION` из @angular/core — показываем реальную версию рантайма. */
  protected readonly angularVersion = VERSION.full;

  /**
   * Узкий экран. Медиазапрос обёрнут в сигнал функцией-композаблом —
   * никаких подписок и ngOnDestroy.
   */
  protected readonly isCompact = injectMediaQuery('(max-width: 599px)');

  /**
   * Высота mat-toolbar: отступ сверху для зафиксированной боковой панели.
   * Material делает тулбар ниже на узких экранах, поэтому значение вычисляемое.
   */
  protected readonly toolbarHeight = computed(() => (this.isCompact() ? 56 : 64));

  /** На узком экране панель выезжает поверх контента, на широком — стоит сбоку. */
  protected readonly sidenavMode = computed<'over' | 'side'>(() =>
    this.isCompact() ? 'over' : 'side',
  );

  /**
   * Открыта ли панель. linkedSignal, а не signal: пользователь управляет
   * значением кнопкой, но при смене ширины экрана оно сбрасывается
   * к разумному умолчанию — открыта на десктопе, закрыта на узком экране.
   */
  protected readonly sidenavOpened = linkedSignal(() => !this.isCompact());

  protected readonly query = signal('');

  /**
   * Полностью производное состояние: список групп меню, отфильтрованный
   * по поисковой строке. Никаких подписок, `ngOnChanges` или ручного
   * `markForCheck()` — сигналы сами уведомят шаблон.
   */
  protected readonly sections = computed<readonly NavSection[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const matches = (link: DemoLink) =>
      !needle ||
      link.title.toLowerCase().includes(needle) ||
      link.summary.toLowerCase().includes(needle) ||
      link.since.includes(needle);

    return NAV_GROUPS.map((group) => ({
      group,
      links: DEMO_LINKS.filter((link) => link.group === group && matches(link)),
    })).filter((section) => section.links.length > 0);
  });

  protected readonly foundCount = computed(() =>
    this.sections().reduce((total, section) => total + section.links.length, 0),
  );

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected toggleSidenav(): void {
    this.sidenavOpened.update((opened) => !opened);
  }
}
