import { DestroyRef, inject, signal, Signal } from '@angular/core';

/**
 * Медиазапрос как сигнал.
 *
 * Обычная функция, которая пользуется `inject()` — так называемый «композабл».
 * Возможным это стало благодаря двум вещам из современных версий Angular:
 * `inject()` работает в любом контексте инъекции, а `DestroyRef` (v16)
 * даёт хук уничтожения без реализации интерфейса OnDestroy.
 */
export function injectMediaQuery(query: string): Signal<boolean> {
  const mql = matchMedia(query);
  const matches = signal(mql.matches);

  const onChange = (event: MediaQueryListEvent) => matches.set(event.matches);
  mql.addEventListener('change', onChange);

  inject(DestroyRef).onDestroy(() => mql.removeEventListener('change', onChange));

  return matches.asReadonly();
}
