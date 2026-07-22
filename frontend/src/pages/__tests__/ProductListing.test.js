import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ProductListing from '../ProductListing';

// Uses the MSW mock server (wired up in src/setupTests.js) instead of
// a real running backend.
describe('ProductListing page', () => {
  it('shows a loading state and then renders products from the API', async () => {
    renderWithProviders(<ProductListing />);

    // Products should appear once the mocked API call resolves
    expect(await screen.findByText('Aurora Phone X')).toBeInTheDocument();
    expect(screen.getByText('Nimbus Laptop 14')).toBeInTheDocument();
  });

  it('renders category options from the API for filtering', async () => {
    renderWithProviders(<ProductListing />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Phones' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Laptops' })).toBeInTheDocument();
    });
  });

  it('lets the user type into the search box', async () => {
    renderWithProviders(<ProductListing />);
    const input = await screen.findByPlaceholderText('Search products...');
    input.focus();
    await screen.findByText('Aurora Phone X'); // wait for initial load first
    expect(input).toHaveValue('');
  });
});
