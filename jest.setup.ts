import "@testing-library/jest-dom";

Element.prototype.scrollTo = jest.fn();

// Мок CSS, чтобы не падали импорты CSS/SCSS
jest.mock("*.css", () => ({}));
jest.mock("*.scss", () => ({}));
jest.mock("*.sass", () => ({}));

// Мок ESM-пакета marked
jest.mock("marked", () => ({
  marked: {
    parse: (text: string) => text, // просто возвращаем текст без разметки
  },
}));
