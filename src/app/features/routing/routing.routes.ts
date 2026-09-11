import { Routes } from '@angular/router';
import { RoutingPage } from './routing-page';
import { userResolver, validUserIdGuard } from './routing.guards';

/**
 * Вложенная конфигурация маршрутов, подключённая через `loadChildren`.
 *
 * Здесь собраны четыре нововведения роутера:
 *  1. функциональные guard и resolver (без классов и провайдеров);
 *  2. `withComponentInputBinding()` — данные маршрута прилетают во входы компонента;
 *  3. `redirectTo` как функция (Angular 18);
 *  4. `title` как строка или функция-резолвер заголовка страницы.
 */
export const ROUTING_ROUTES: Routes = [
  {
    path: '',
    component: RoutingPage,
    title: 'Роутинг',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'user/1',
      },
      {
        path: 'user/:id',
        // Ленивая загрузка конкретного компонента вложенного маршрута.
        loadComponent: () => import('./routing-user').then((m) => m.RoutingUser),
        canActivate: [validUserIdGuard],
        resolve: { user: userResolver },
        // Статические данные тоже попадут во вход `section`.
        data: { section: 'демо роутинга' },
        title: 'Карточка пользователя',
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      {
        /**
         * Angular 18: redirectTo может быть функцией.
         * Получает срез ActivatedRouteSnapshot и возвращает строку или UrlTree —
         * то есть редирект наконец-то может зависеть от параметров.
         */
        path: 'legacy/:userId',
        redirectTo: (redirectData) => {
          const id = redirectData.params['userId'];
          return `/routing/user/${id}?tab=redirected`;
        },
      },
    ],
  },
];
