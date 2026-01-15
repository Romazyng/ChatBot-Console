export async function POST(req: Request) {
  try {
    const { messages: conversationHistory } = await req.json();

    // Mock response - имитация ответа ассистента
    const userMessage = conversationHistory[conversationHistory.length - 1]?.content || "";
    const mockResponse = `Вот JavaScript код, который обрабатывает и выводит ваше сообщение:

\`\`\`javascript
// Получение сообщения от пользователя
const userMessage = ${JSON.stringify(userMessage)};

// Функция для обработки сообщения
function processUserMessage(message) {
  if (!message || message.trim().length === 0) {
    return "Сообщение пустое";
  }
  
  // Подсчет статистики
  const stats = {
    length: message.length,
    words: message.split(/\\s+/).filter(word => word.length > 0).length,
    characters: message.replace(/\\s/g, '').length
  };
  
  return {
    original: message,
    processed: message.trim(),
    stats: stats
  };
}

// Обработка и вывод
const result = processUserMessage(userMessage);
// Результат можно использовать для дальнейшей обработки
\`\`\`

## Как работает этот код:

**Функция processUserMessage** выполняет несколько важных задач:

1. **Валидация входных данных** — проверяет, что сообщение не пустое
2. **Очистка текста** — удаляет лишние пробелы с помощью метода trim()
3. **Подсчет статистики** — вычисляет:
   - **Общую длину** сообщения (включая пробелы)
   - **Количество слов** (разделение по пробелам)
   - **Количество символов** (без учета пробелов)

**Результат работы функции** — объект, содержащий оригинальное сообщение, обработанную версию и статистику. Это позволяет анализировать текст и работать с ним более эффективно.`;

    // создаём ReadableStream для отправки чанков (имитация потоковой отдачи)
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Имитируем потоковую отдачу - отправляем текст по частям
          const words = mockResponse.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            await new Promise((resolve) => setTimeout(resolve, 30)); // задержка для имитации потока
            controller.enqueue(new TextEncoder().encode(chunk));
          }

          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("API /chat error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
