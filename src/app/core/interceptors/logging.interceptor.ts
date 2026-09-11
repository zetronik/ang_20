import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { RequestLogStore } from '../services/request-log.store';

/**
 * Функциональный интерцептор (`HttpInterceptorFn`).
 *
 * Было в v16: класс, реализующий `HttpInterceptor`, зарегистрированный через
 * мультипровайдер `HTTP_INTERCEPTORS` — многословно и не tree-shakable.
 *
 * Стало: обычная функция, `inject()` работает внутри неё,
 * регистрация через `provideHttpClient(withInterceptors([...]))`.
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(RequestLogStore);
  const id = log.start(req.method, req.urlWithParams);
  let settled = false;

  return next(req).pipe(
    tap({
      next: (event) => {
        // HttpResponse приходит последним событием потока.
        if (event.type === 4) {
          settled = true;
          log.finish(id, 'ok');
        }
      },
      error: () => {
        settled = true;
        log.finish(id, 'error');
      },
    }),
    // Если поток завершился без ответа и без ошибки — запрос был отменён
    // (unsubscribe). Именно так resource()/httpResource() гасят устаревшие запросы.
    finalize(() => {
      if (!settled) {
        log.finish(id, 'aborted');
      }
    }),
  );
};
