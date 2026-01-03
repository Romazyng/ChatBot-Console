// src/__tests__/Chat.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chat } from "@/components/Chat";
import "@testing-library/jest-dom";

// Мокаем fetch
global.fetch = jest.fn();

beforeEach(() => {
  (fetch as jest.Mock).mockReset();
});

const conversationMock = {
  id: "1",
  title: "Test Chat",
  messages: [],
};

describe("Chat", () => {
  test("отправка сообщения и получение ответа ассистента", async () => {
    const user = userEvent.setup();

    // Мокаем fetch, чтобы вернуть ответ ассистента
    (fetch as jest.Mock).mockResolvedValueOnce({
      body: {
        getReader: () => {
          let called = false;
          return {
            read: async () => {
              if (!called) {
                called = true;
                return {
                  value: new TextEncoder().encode("Hello from assistant"),
                  done: false,
                };
              }
              return { value: undefined, done: true };
            },
          };
        },
      },
    });

    const onUpdateConversation = jest.fn();

    render(
      <Chat
        conversation={conversationMock}
        onUpdateConversation={onUpdateConversation}
      />
    );

    // Находим текстбокс и отправляем сообщение
    const input = screen.getByRole("textbox");
    await user.type(input, "Hello{Enter}");

    // Проверяем, что сообщение пользователя появилось
    expect(screen.getByText("Hello")).toBeInTheDocument();

    // Ждём появления ответа ассистента
    await waitFor(() =>
      expect(
        screen.getByText((content) => content.includes("Hello from assistant"))
      ).toBeInTheDocument()
    );

    // Проверяем, что callback обновления вызвался
    expect(onUpdateConversation).toHaveBeenCalled();
  });
});
