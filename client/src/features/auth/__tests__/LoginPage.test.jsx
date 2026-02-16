import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';
import authReducer from '../authSlice';
import { apiSlice } from '../../../services/apiSlice';

// Create a mock store
const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

const renderWithProviders = (ui, { store = createTestStore() } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders demo credentials section', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/alice@taskflow.demo/i)).toBeInTheDocument();
  });

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />);

    const registerLink = screen.getByText(/sign up/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('updates email input on change', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('updates password input on change', () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('email input has correct type', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('password input has correct type', () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submit button is present and enabled', () => {
    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });
});
