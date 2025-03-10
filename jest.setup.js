// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { mockAnimationsApi } from 'jsdom-testing-mocks';
import { TextEncoder, TextDecoder } from 'node:util';
import 'whatwg-fetch';

// Setup animation mocks
mockAnimationsApi();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Setup TextEncoder/TextDecoder
Object.assign(global, {
  TextDecoder: TextDecoder,
  TextEncoder: TextEncoder,
});

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
