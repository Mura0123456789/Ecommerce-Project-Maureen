import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../test-utils';
import ProtectedRoute from '../ProtectedRoute';

function Secret() {
  return <p>Secret content</p>;
}
function LoginStub() {
  return <p>Login page</p>;
}
function HomeStub() {
  return <p>Home page</p>;
}

function renderProtected({ adminOnly = false } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginStub />} />
      <Route path="/" element={<HomeStub />} />
      <Route
        path="/protected"
        element={
          <ProtectedRoute adminOnly={adminOnly}>
            <Secret />
          </ProtectedRoute>
        }
      />
    </Routes>,
    { route: '/protected' }
  );
}

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated user to /login', () => {
    renderProtected();
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });

  it('redirects a non-admin user away from an admin-only route', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Customer', role: 'CUSTOMER' }));
    localStorage.setItem('token', 'fake-jwt-token');

    renderProtected({ adminOnly: true });

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();

    localStorage.clear();
  });

  it('allows an admin user to reach an admin-only route', () => {
    localStorage.setItem('user', JSON.stringify({ id: 2, name: 'Admin', role: 'ADMIN' }));
    localStorage.setItem('token', 'fake-jwt-token');

    renderProtected({ adminOnly: true });

    expect(screen.getByText('Secret content')).toBeInTheDocument();

    localStorage.clear();
  });
});
