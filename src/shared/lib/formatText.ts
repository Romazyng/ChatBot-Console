export function formatText(text: string): string {
  if (!text) return "";

  let html = text;

  // Заголовки 
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  //  Bold 
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  //  Italic 
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Переносы строк
  html = html.replace(/\n/g, "<br />");

  return html;
}
