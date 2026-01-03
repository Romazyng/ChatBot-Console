import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

Element.prototype.scrollTo = jest.fn();

// Мок CSS
jest.mock("*.css", () => ({}));
jest.mock("*.scss", () => ({}));
jest.mock("*.sass", () => ({}));

// Мок marked
jest.mock("marked", () => ({
  marked: {
    parse: (text: string) => text,
  },
}));
