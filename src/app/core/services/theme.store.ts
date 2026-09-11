import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'ang20-demo-theme';

/**
 * Сервис темы — компактная демонстрация сразу нескольких нововведений:
 *
 * 1. `DOCUMENT` теперь экспортируется прямо из `@angular/core` (v20).
 *    В v16 его импортировали из `@angular/common`.
 * 2. `inject()` вместо параметров конструктора.
 * 3. Состояние — `signal`, производное состояние — `computed`.
 * 4. `effect()` синхронизирует состояние с DOM и localStorage.
 *    В v16 `effect` был developer preview и требовал явного `injector`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly document = inject(DOCUMENT);

  /** Текущий режим темы. WritableSignal вместо BehaviorSubject. */
  readonly mode = signal<ThemeMode>(this.readInitialMode());

  /** Производное значение — пересчитывается лениво и мемоизируется. */
  readonly isDark = computed(() => this.mode() === 'dark');

  /** Иконка для кнопки переключения. */
  readonly icon = computed(() => (this.isDark() ? 'light_mode' : 'dark_mode'));

  constructor() {
    // effect() запускается после каждого изменения любого прочитанного сигнала.
    effect(() => {
      const mode = this.mode();
      // Material 3 в v18+ управляет палитрой через CSS-свойство color-scheme.
      this.document.body.style.colorScheme = mode;
      this.document.body.classList.toggle('dark-theme', mode === 'dark');

      // localStorage может быть недоступен (приватный режим, запрет cookie),
      // поэтому запись оборачиваем в try/catch.
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // сохранять выбор темы необязательно
      }
    });
  }

  toggle(): void {
    // update() читает предыдущее значение — set() перезаписывает целиком.
    this.mode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
  }

  private readInitialMode(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // игнорируем и берём системную настройку
    }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
