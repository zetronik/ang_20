import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { User } from '../../core/models/jsonplaceholder';

/**
 * Функциональный guard (стабилен с Angular 15, в v16 классы-guard-ы уже были
 * помечены устаревшими, а в v20 удалены из публичного API).
 *
 * Главное преимущество: внутри работает `inject()`, поэтому guard —
 * обычная функция без класса, конструктора и провайдера.
 */
export const validUserIdGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  if (Number.isInteger(id) && id >= 1 && id <= 10) {
    return true;
  }

  // Возврат UrlTree = редирект вместо простого запрета.
  return router.parseUrl('/routing/user/1');
};

/**
 * Функциональный resolver. Данные попадут в компонент через
 * `withComponentInputBinding()` — прямо во входной сигнал `user`.
 */
export const userResolver: ResolveFn<User | null> = (route) => {
  const http = inject(HttpClient);
  const baseUrl = inject(API_BASE_URL);
  const id = route.paramMap.get('id');

  return http
    .get<User>(`${baseUrl}/users/${id}`)
    .pipe(catchError(() => of(null)));
};

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Функциональный canDeactivate — типизирован по компоненту. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }
  return confirm('Есть несохранённые изменения. Уйти со страницы?');
};
