import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render } from '@testing-library/react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Wraps a component with the same providers App.js uses, so pages/components
// can be tested the way they actually run in the app (routing, auth, cart,
// and react-query all available).
export function renderWithProviders(ui, { route = '/' } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export * from '@testing-library/react';
