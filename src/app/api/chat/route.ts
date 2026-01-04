import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages: conversationHistory } = await req.json();

    // преобразуем формат сообщений для OpenAI API
    const openaiMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      { role: "system", content: "You are a helpful assistant." },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === "User" ? "user" : "assistant",
        content: msg.content,
      })),
    ];

    // создаём ReadableStream для отправки чанков
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: openaiMessages,
            stream: true, // включаем потоковую отдачу
          });

          // @ts-ignore - completion is an async iterable when stream:true
          for await (const chunk of completion) {
            // chunk.choices[0].delta.content содержит новые куски текста
            const text = chunk.choices[0].delta?.content;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
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
