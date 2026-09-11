import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  VERSION,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { RequestLogStore } from './core/services/request-log.store';

/**
 * Конфигурация приложения целиком построена на standalone-провайдерах.
 * В Angular 16 здесь был бы `AppModule` с `imports: [BrowserModule, HttpClientModule,
 * RouterModule.forRoot(routes), BrowserAnimationsModule]`.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * v19: глобальный перехват необработанных ошибок и rejection-ов
     * без ручной подписки на window.onerror.
     */
    provideBrowserGlobalErrorListeners(),

    /**
     * v20: главное нововведение — приложение работает БЕЗ zone.js.
     * Change detection запускается сигналами, а не monkey-patch-ем браузерных API.
     * В v16 такой опции не существовало вовсе.
     */
    provideZonelessChangeDetection(),

    /**
     * v19: `provideAppInitializer()` вместо мультипровайдера APP_INITIALIZER
     * с `useFactory` и `multi: true`. Внутри работает `inject()`.
     */
    provideAppInitializer(() => {
      // inject() доступен внутри инициализатора — контекст инъекции сохраняется.
      const log = inject(RequestLogStore);
      log.clear();
      console.info(`[ang20-features] Angular ${VERSION.full}, режим zoneless.`);
    }),

    provideRouter(
      routes,
      // v16+: связывает параметры маршрута, query-параметры и resolve-данные
      // напрямую с сигнальными входами компонента.
      withComponentInputBinding(),
      // v17: анимация перехода между маршрутами через View Transitions API.
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),

    /**
     * v16 → v20: `HttpClientModule` объявлен устаревшим, вместо него
     * `provideHttpClient()`. `withFetch()` переводит клиент на Fetch API,
     * что обязательно для корректной отмены запросов в resource()/httpResource().
     */
    provideHttpClient(withFetch(), withInterceptors([loggingInterceptor])),

    // @angular/animations в проекте нет вовсе: компоненты Angular Material 20
    // анимируются средствами CSS. В v16 пакет BrowserAnimationsModule был обязателен.
  ],
};
