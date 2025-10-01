import { beforeAll, vi } from 'vitest';

// Extend global scope
declare global {
  var chrome: any;
}

// Mock chrome storage API
const mockStorage = new Map<string, any>();

const chromeStorageSync = {
  get: vi.fn(async (keys: string | string[] | Record<string, any>) => {
    if (typeof keys === 'string') {
      return { [keys]: mockStorage.get(keys) };
    } else if (Array.isArray(keys)) {
      const result: Record<string, any> = {};
      keys.forEach((key) => {
        result[key] = mockStorage.get(key);
      });
      return result;
    } else {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(keys || {})) {
        result[key] = mockStorage.get(key) !== undefined ? mockStorage.get(key) : value;
      }
      return result;
    }
  }),
  set: vi.fn(async (items: Record<string, any>) => {
    Object.entries(items).forEach(([key, value]) => {
      mockStorage.set(key, value);
    });
  }),
  clear: vi.fn(async () => {
    mockStorage.clear();
  }),
} as const;

const chromeAPI = {
  storage: {
    sync: chromeStorageSync,
  },
  tabs: {
    query: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  action: {
    setTitle: vi.fn(),
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

// Add chrome to global
(global as any).chrome = chromeAPI;

// Mock WXT imports
vi.mock('#imports', () => ({
  storage: {
    defineItem: vi.fn((key: string, options: any) => ({
      getValue: vi.fn().mockResolvedValue(options.fallback),
      setValue: vi.fn().mockResolvedValue(undefined),
      watch: vi.fn().mockReturnValue({ unwatch: vi.fn() }),
    })),
  },
}));

// Reset storage between tests
beforeAll(() => {
  mockStorage.clear();
});
