import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chat } from "@/components/Chat";
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
// мокаем fetch
global.fetch = jest.fn();

beforeEach(() => {
  (fetch as jest.Mock).mockReset();
});

describe("Chat", () => {
  test("отправка сообщения и получение ответа ассистента", async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockResolvedValueOnce({
      body: {
        getReader: () => {
          const chunks = ["Hello from assistant"];
          return {
            read: async () => {
              if (chunks.length > 0) {
                return {
                  value: new TextEncoder().encode(chunks.shift()!),
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
        conversation={{ id: "1", title: "Test Chat", messages: [] }}
        onUpdateConversation={onUpdateConversation}
      />
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello{Enter}");

    // пользовательское сообщение
    expect(screen.getByText("Hello")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText((text) => text.includes("Hello from assistant"))
      ).toBeInTheDocument();
    });

    expect(onUpdateConversation).toHaveBeenCalled();
  });

  test("ошибка ответа ассистента и повторная отправка (retry)", async () => {
    const user = userEvent.setup();

    // первый запрос — ошибка
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      // второй запрос — успешный стрим
      .mockResolvedValueOnce({
        body: {
          getReader: () => {
            const chunks = ["Recovered answer"];
            return {
              read: async () => {
                if (chunks.length > 0) {
                  return {
                    value: new TextEncoder().encode(chunks.shift()!),
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
        conversation={{ id: "1", title: "Test Chat", messages: [] }}
        onUpdateConversation={onUpdateConversation}
      />
    );

    const input = screen.getByRole("textbox");

    // отправляем сообщение
    await user.type(input, "Hello{Enter}");

    // проверяем, что сообщение пользователя есть
    expect(screen.getByText("Hello")).toBeInTheDocument();

    // ждём кнопку retry
    const retryButton = await screen.findByText("Retry");
    expect(retryButton).toBeInTheDocument();

    // жмём retry
    await user.click(retryButton);

    // ждём успешный ответ ассистента
    await waitFor(() => {
      expect(
        screen.getByText((text) => text.includes("Recovered answer"))
      ).toBeInTheDocument();
    });

    // fetch должен быть вызван 2 раза
    expect(fetch).toHaveBeenCalledTimes(2);

    // conversation обновлялся
    expect(onUpdateConversation).toHaveBeenCalled();
  });
});
