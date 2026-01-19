import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

// Настройка marked для безопасного парсинга
marked.setOptions({
  breaks: true, // Переносы строк как <br>
  gfm: true, // GitHub Flavored Markdown
});

export function formatText(text: string): string {
  if (!text) return "";

  // Используем marked для парсинга markdown
  const html = marked.parse(text) as string;

  // Санитизируем HTML для защиты от XSS с поддержкой атрибутов списков
  const sanitizedText = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
    ],
    allowedAttributes: {
      ...(sanitizeHtml as any).defaults?.allowedAttributes,
      li: [
        ...((sanitizeHtml as any).defaults?.allowedAttributes?.li || []),
        "data-list",
      ] as any,
      a: ["href", "target"],
    },
  });

  return sanitizedText;
}
