import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ProductDetails from '../ProductDetails';
import { Routes, Route } from 'react-router-dom';

// ProductDetails reads the id from the URL via useParams, so it must be
// rendered under a route that supplies :id, matching how App.js wires it up.
function renderProductDetails(id) {
  return renderWithProviders(
    <Routes>
      <Route path="/products/:id" element={<ProductDetails />} />
    </Routes>,
    { route: `/products/${id}` }
  );
}

describe('ProductDetails page', () => {
  it('renders the correct product for the given id', async () => {
    renderProductDetails(1);
    expect(await screen.findByText('Aurora Phone X')).toBeInTheDocument();
    expect(screen.getByText('A sleek flagship smartphone.')).toBeInTheDocument();
    expect(screen.getByText('$799.99')).toBeInTheDocument();
  });

  it('shows an error message for a product that does not exist', async () => {
    renderProductDetails(999);
    expect(await screen.findByText('This product could not be found.')).toBeInTheDocument();
  });

  it('shows an empty reviews message when there are no reviews', async () => {
    renderProductDetails(1);
    expect(await screen.findByText('No reviews yet.')).toBeInTheDocument();
  });
});
