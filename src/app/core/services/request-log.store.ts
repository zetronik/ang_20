import { computed, Injectable, signal } from '@angular/core';

export interface LoggedRequest {
  readonly id: number;
  readonly method: string;
  readonly url: string;
  readonly startedAt: number;
  readonly durationMs: number | null;
  readonly status: 'pending' | 'ok' | 'error' | 'aborted';
}

/**
 * Журнал HTTP-запросов. Наполняется функциональным интерцептором.
 * Нужен, чтобы наглядно показать, как resource()/httpResource() отменяют
 * устаревшие запросы при изменении реактивного параметра.
 */
@Injectable({ providedIn: 'root' })
export class RequestLogStore {
  private nextId = 1;
  private readonly entries = signal<readonly LoggedRequest[]>([]);

  readonly all = this.entries.asReadonly();
  readonly total = computed(() => this.entries().length);
  readonly pending = computed(() => this.entries().filter((e) => e.status === 'pending').length);
  readonly aborted = computed(() => this.entries().filter((e) => e.status === 'aborted').length);

  start(method: string, url: string): number {
    const id = this.nextId++;
    this.entries.update((list) =>
      [{ id, method, url, startedAt: Date.now(), durationMs: null, status: 'pending' as const }, ...list].slice(0, 40),
    );
    return id;
  }

  finish(id: number, status: LoggedRequest['status']): void {
    this.entries.update((list) =>
      list.map((entry) =>
        entry.id === id ? { ...entry, status, durationMs: Date.now() - entry.startedAt } : entry,
      ),
    );
  }

  clear(): void {
    this.entries.set([]);
  }
}
