import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAuth from '../useAuth';
import authReducer, { setCredentials, logout } from '../../features/auth/authSlice';
import { apiSlice } from '../../services/apiSlice';

// Create a wrapper with the Redux provider
const createWrapper = (store) => {
  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };
};

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState,
  });
};

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null user when not authenticated', () => {
    const store = createTestStore({
      auth: { token: null, user: null },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('returns user when authenticated', () => {
    const mockUser = { _id: '1', name: 'Test User', email: 'test@example.com' };
    const store = createTestStore({
      auth: { token: 'mock-token', user: mockUser },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('mock-token');
  });

  it('returns isAuthenticated as false when no token', () => {
    const store = createTestStore({
      auth: { token: null, user: null },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns isAuthenticated as true when token exists', () => {
    const store = createTestStore({
      auth: { token: 'mock-token', user: { _id: '1' } },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('provides logout function', () => {
    const store = createTestStore({
      auth: { token: 'mock-token', user: { _id: '1' } },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    expect(typeof result.current.logout).toBe('function');
  });

  it('logout clears auth state', () => {
    const store = createTestStore({
      auth: { token: 'mock-token', user: { _id: '1' } },
    });

    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Dispatch logout
    store.dispatch(logout());
    rerender();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });
});

describe('authSlice', () => {
  it('setCredentials sets token and user', () => {
    const store = createTestStore({
      auth: { token: null, user: null },
    });

    store.dispatch(
      setCredentials({
        token: 'new-token',
        user: { _id: '1', name: 'New User' },
      })
    );

    const state = store.getState().auth;
    expect(state.token).toBe('new-token');
    expect(state.user).toEqual({ _id: '1', name: 'New User' });
  });

  it('logout clears token and user', () => {
    const store = createTestStore({
      auth: { token: 'existing-token', user: { _id: '1' } },
    });

    store.dispatch(logout());

    const state = store.getState().auth;
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
