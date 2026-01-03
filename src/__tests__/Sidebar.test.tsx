import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/Sidebar";
import "@testing-library/jest-dom";

// мок навигация
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => "/",
}));

// мок дата для теста удаление и поиска
jest.mock("@/shared/lib/storage", () => ({
  loadConversations: () => [
    { id: "1", title: "React Chat", messages: [] },
    { id: "2", title: "Vue Chat", messages: [] },
  ],
  saveConversations: jest.fn(),
}));

describe("Sidebar", () => {
  test("создание нового диалога", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const button = screen.getByRole("button", { name: /\+ New Chat/i });
    await user.click(button);

    const chatItem = screen.getByText("New Chat", {
      selector: "span",
    });

    expect(chatItem).toBeInTheDocument();
  });

  test("поиск диалога", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, "react");

    expect(screen.getByText("React Chat")).toBeInTheDocument();
    expect(screen.queryByText("Vue Chat")).not.toBeInTheDocument();
  });

  test("удаление диалога", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // нажимаем кнопку удаления у первого чата
    const deleteButtons = screen.getAllByRole("button", { name: "🗑" });
    await user.click(deleteButtons[0]);

    // открылась модалка
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // подтверждаем удаление
    const deleteConfirm = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteConfirm);

    // чат исчез из списка
    expect(screen.queryByText("React Chat")).not.toBeInTheDocument();
  });
});
