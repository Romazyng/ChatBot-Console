import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/Sidebar";
import { MemoryRouter } from "react-router-dom"; // для маршрутизации
import '@testing-library/jest-dom'

test("создание нового диалога", async () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  const button = screen.getByRole("button", { name: /\+ New Chat/i });
  await userEvent.click(button);

  const newChat = screen.getByText(/New Chat/i);
  expect(newChat).toBeInTheDocument();
});
