import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock import.meta.env
vi.stubEnv('VITE_API_URL', 'http://localhost:3008/api/v1');

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
