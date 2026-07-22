import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const { data, isLoading, isError } = useQuery('featured-products', () =>
    api.get('/products?limit=4').then((r) => r.data)
  );
  const { data: categories } = useQuery('home-categories', () => api.get('/categories').then((r) => r.data));

  if (isLoading) return <Loading label="Loading the store..." />;
  if (isError) return <ErrorMessage message="Could not load the store right now." />;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Welcome to The Store</h1>
      <p>Browse our catalog of phones, laptops, and accessories.</p>

      <h2>Categories</h2>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {categories?.map((c) => (
          <span key={c.id} style={{ padding: '0.4rem 0.8rem', background: '#f0f0f0', borderRadius: 20 }}>
            {c.name}
          </span>
        ))}
      </div>

      <h2>Featured Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {data.products.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
            <img src={p.images[0]?.url} alt={p.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
            <h3>{p.name}</h3>
            <p>${p.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
