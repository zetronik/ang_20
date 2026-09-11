/**
 * Микроскопическая подсветка синтаксиса для блоков кода на страницах демо.
 * Никаких внешних зависимостей: сначала экранируем HTML, затем один проход
 * общим регулярным выражением, чтобы токены не накладывались друг на друга.
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

/**
 * Группы захвата по порядку:
 *  1 — комментарии,
 *  2 — строковые литералы,
 *  3 — декораторы и блоки шаблона (@if, @for, @defer),
 *  4 — ключевые слова,
 *  5 — типы и классы (идентификатор с заглавной буквы),
 *  6 — числа.
 */
const TOKENS =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|(@[A-Za-z][A-Za-z0-9_]*)|\b(import|from|export|default|const|let|var|function|class|return|if|else|for|of|in|new|await|async|readonly|private|protected|public|interface|type|extends|implements|as|null|undefined|true|false|this|void|typeof|instanceof|switch|case|break|throw|try|catch|finally|static|enum|declare|satisfies|keyof|abstract|super)\b|\b([A-Z][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?)\b/g;

export function escapeHtml(source: string): string {
  return source.replace(/[&<>]/g, (char) => ESCAPE_MAP[char] ?? char);
}

export function highlight(source: string): string {
  return escapeHtml(source).replace(
    TOKENS,
    (match, comment, str, decorator, keyword, typeName, num) => {
      if (comment) return `<span class="tok-comment">${comment}</span>`;
      if (str) return `<span class="tok-string">${str}</span>`;
      if (decorator) return `<span class="tok-decorator">${decorator}</span>`;
      if (keyword) return `<span class="tok-keyword">${keyword}</span>`;
      if (typeName) return `<span class="tok-type">${typeName}</span>`;
      if (num) return `<span class="tok-number">${num}</span>`;
      return match;
    },
  );
}
