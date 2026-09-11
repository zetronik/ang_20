import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter, map } from 'rxjs';
import { CodeBlock } from '../../shared/ui/code-block';
import { CompareTable, ComparisonRow } from '../../shared/ui/compare-table';
import { DemoPage } from '../../shared/ui/demo-page';
import { DemoSection } from '../../shared/ui/demo-section';

@Component({
  selector: 'app-routing-page',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    CodeBlock,
    CompareTable,
    DemoPage,
    DemoSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './routing-page.html',
  styles: `
    .nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .nav-links .active-user {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
  `,
})
export class RoutingPage {
  private readonly router = inject(Router);

  protected readonly userIds = [1, 2, 3, 4, 5];
  protected readonly tabs = ['overview', 'posts', 'albums'];
  protected readonly tab = signal('overview');

  /**
   * События роутера — Observable. Мост в сигнал делает toSignal(),
   * стабильный с Angular 20.
   */
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isRedirected = computed(() => this.currentUrl().includes('tab=redirected'));

  protected readonly routesSnippet = `
// Angular 20: вся конфигурация маршрутов — обычные объекты и функции
export const ROUTING_ROUTES: Routes = [
  {
    path: '',
    component: RoutingPage,
    title: 'Роутинг',                              // title прямо в маршруте
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user/1' },
      {
        path: 'user/:id',
        loadComponent: () => import('./routing-user').then((m) => m.RoutingUser),
        canActivate: [validUserIdGuard],           // функция, не класс
        resolve: { user: userResolver },           // тоже функция
        data: { section: 'демо роутинга' },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      {
        // Angular 18: redirectTo может быть функцией
        path: 'legacy/:userId',
        redirectTo: (data) => '/routing/user/' + data.params['userId'] + '?tab=redirected',
      },
    ],
  },
];
`;

  protected readonly guardsSnippet = `
// Функциональный guard: inject() работает внутри
export const validUserIdGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  if (Number.isInteger(id) && id >= 1 && id <= 10) return true;

  // UrlTree = редирект вместо простого запрета
  return router.parseUrl('/routing/user/1');
};

// Функциональный resolver
export const userResolver: ResolveFn<User | null> = (route) => {
  const http = inject(HttpClient);
  return http.get<User>('/users/' + route.paramMap.get('id')).pipe(catchError(() => of(null)));
};

// Функциональный canDeactivate типизируется по компоненту
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() || confirm('Уйти со страницы?');
`;

  protected readonly inputBindingSnippet = `
// Конфигурация приложения
provideRouter(
  routes,
  withComponentInputBinding(),   // данные маршрута -> входы компонента
  withViewTransitions(),         // анимация перехода через View Transitions API
  withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
);

// Компонент маршрута: ни одной подписки
export class RoutingUser {
  readonly id = input(0, { transform: numberAttribute });  // параметр пути
  readonly user = input<User | null>(null);                // результат resolve
  readonly tab = input('overview');                        // query-параметр
  readonly section = input('—');                           // data маршрута
}

// Приоритет при совпадении имён: params -> data -> query params.
`;

  protected readonly beforeSnippet = `
// Angular 16: guard-классы и подписки на ActivatedRoute
@Injectable({ providedIn: 'root' })
export class ValidUserIdGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const id = Number(route.paramMap.get('id'));
    return id >= 1 && id <= 10 ? true : this.router.parseUrl('/routing/user/1');
  }
}

@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<User | null> {
  constructor(private readonly http: HttpClient) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.http.get<User>('/users/' + route.paramMap.get('id'));
  }
}

// И компонент со всеми подписками:
export class UserComponent implements OnInit, OnDestroy {
  user: User | null = null;
  id = 0;
  tab = 'overview';

  private readonly destroyed = new Subject<void>();

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.id = Number(params.get('id'));
    });
    this.route.queryParamMap.pipe(takeUntil(this.destroyed)).subscribe((query) => {
      this.tab = query.get('tab') ?? 'overview';
    });
    this.route.data.pipe(takeUntil(this.destroyed)).subscribe((data) => {
      this.user = data['user'];
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
  }
}
`;

  protected readonly comparison: readonly ComparisonRow[] = [
    {
      topic: 'Guard-ы и resolver-ы',
      before: 'Классы с интерфейсами CanActivate/Resolve и регистрацией в DI.',
      after: 'Функции CanActivateFn / ResolveFn с работающим inject(); классы удалены из API в v20.',
    },
    {
      topic: 'Данные маршрута в компоненте',
      before: 'Три подписки на paramMap, queryParamMap и data + отписка.',
      after: 'withComponentInputBinding(): параметры приходят в сигнальные входы.',
    },
    {
      topic: 'Редиректы',
      before: 'redirectTo — только статическая строка.',
      after: 'redirectTo может быть функцией от параметров маршрута (v18).',
    },
    {
      topic: 'Ленивая загрузка',
      before: 'loadChildren с NgModule-обёрткой на каждый раздел.',
      after: 'loadComponent для отдельного компонента, loadChildren — для массива маршрутов.',
    },
    {
      topic: 'Заголовок страницы',
      before: 'Ручной вызов Title.setTitle() в ngOnInit.',
      after: 'Свойство title маршрута (строка или ResolveFn).',
    },
    {
      topic: 'Переходы между страницами',
      before: 'Анимации роутера на @angular/animations с отдельным DSL.',
      after: 'withViewTransitions() — нативный View Transitions API браузера.',
    },
  ];
}
