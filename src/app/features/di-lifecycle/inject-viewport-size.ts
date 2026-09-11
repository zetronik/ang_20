import { DestroyRef, inject, signal, Signal } from '@angular/core';

export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

/**
 * «Композабл» — обычная функция, которая пользуется `inject()`.
 *
 * Так стало можно писать благодаря двум вещам:
 * 1. `inject()` работает в любом контексте инъекции, а не только в конструкторе;
 * 2. `DestroyRef` (v16) даёт хук уничтожения без реализации OnDestroy.
 *
 * В Angular 16 аналог пришлось бы оформлять классом-сервисом с ngOnDestroy
 * или тащить `Renderer2` и ручную отписку в каждый компонент.
 */
export function injectViewportSize(): Signal<ViewportSize> {
  const size = signal<ViewportSize>({ width: innerWidth, height: innerHeight });

  const onResize = () => size.set({ width: innerWidth, height: innerHeight });
  addEventListener('resize', onResize, { passive: true });

  // DestroyRef привязывает очистку к времени жизни вызывающего компонента.
  inject(DestroyRef).onDestroy(() => removeEventListener('resize', onResize));

  return size.asReadonly();
}
