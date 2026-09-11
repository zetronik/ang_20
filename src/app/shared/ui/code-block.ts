import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { highlight } from './highlight';

/**
 * Блок кода с подсветкой и кнопкой «скопировать».
 *
 * Что здесь нового относительно v16:
 * - `input()` / `input.required()` — сигнальные входы вместо `@Input()`;
 * - `computed()` вместо геттера, вызываемого в шаблоне на каждый CD-цикл;
 * - объект `host` в метаданных вместо `@HostBinding`;
 * - самозакрывающиеся теги и `@if` в шаблоне;
 * - standalone-компонент без `standalone: true` (с v19 это значение по умолчанию).
 */
@Component({
  selector: 'app-code-block',
  imports: [MatIconModule, MatIconButton, MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-code-block' },
  template: `
    <div class="code-head">
      <span class="code-lang">{{ lang() }}</span>
      @if (caption(); as text) {
        <span class="code-caption">{{ text }}</span>
      }
      <span class="spacer"></span>
      <button
        matIconButton
        type="button"
        [matTooltip]="copied() ? 'Скопировано' : 'Скопировать код'"
        (click)="copy()"
      >
        <mat-icon>{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
      </button>
    </div>
    <pre class="code-body"><code [innerHTML]="highlighted()"></code></pre>
  `,
  styles: `
    :host {
      display: block;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      overflow: hidden;
      background: var(--mat-sys-surface-container-low);
    }

    .code-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 2px 4px 2px 16px;
      background: var(--mat-sys-surface-container);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .code-lang {
      font: var(--mat-sys-label-small);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mat-sys-primary);
    }

    .code-caption {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .code-body {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.55;
      tab-size: 2;
    }

    /* Палитра подсветки для светлой темы... */
    .code-body .tok-comment { color: #5c7a5c; font-style: italic; }
    .code-body .tok-string { color: #a31515; }
    .code-body .tok-keyword { color: #8b1a9e; }
    .code-body .tok-decorator { color: #7a5c00; }
    .code-body .tok-type { color: #1a6e7e; }
    .code-body .tok-number { color: #0b6b3a; }

    /* ...и её тёмный вариант. Переключается тем же классом, что и тема Material. */
    :host-context(body.dark-theme) .code-body .tok-comment { color: #7bb37b; }
    :host-context(body.dark-theme) .code-body .tok-string { color: #ce9178; }
    :host-context(body.dark-theme) .code-body .tok-keyword { color: #c586c0; }
    :host-context(body.dark-theme) .code-body .tok-decorator { color: #dcdcaa; }
    :host-context(body.dark-theme) .code-body .tok-type { color: #4ec9b0; }
    :host-context(body.dark-theme) .code-body .tok-number { color: #b5cea8; }
  `,
})
export class CodeBlock {
  /** Исходный код. `input.required` гарантирует наличие значения на этапе компиляции. */
  readonly code = input.required<string>();
  /** Подпись языка в шапке блока. */
  readonly lang = input('typescript');
  /** Необязательный заголовок, например имя файла. */
  readonly caption = input<string>();

  protected readonly copied = signal(false);

  /** computed() кэширует результат: подсветка пересчитывается только при смене кода. */
  protected readonly highlighted = computed(() => highlight(this.code().trim()));

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code().trim());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
