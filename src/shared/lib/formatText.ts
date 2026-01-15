import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function formatText(text: string): string {
  if (!text) return "";

  const html = marked.parse(text, {
    breaks: true,
    gfm: true,
  });

  const sanitizedText = sanitizeHtml(html as string, {
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
      a: ["href", "target"],
      li: ["data-list"],
    },
  });

  return sanitizedText;
}
