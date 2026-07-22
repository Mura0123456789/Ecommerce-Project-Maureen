import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductListing() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery('categories', () => api.get('/categories').then((r) => r.data));

  const { data, isLoading, isError } = useQuery(
    ['products', search, category, sort, page],
    () => api.get('/products', { params: { search, category, sort, page, limit: 8 } }).then((r) => r.data)
  );

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Products</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories?.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="name_desc">Name: Z-A</option>
        </select>
      </div>

      {isLoading && <Loading label="Loading products..." />}
      {isError && <ErrorMessage message="Could not load products." />}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {data.products.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
                <img src={p.images[0]?.url} alt={p.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                <h3>{p.name}</h3>
                <p>{p.category?.name}</p>
                <p>${p.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>

          {data.products.length === 0 && <p>No products match your search.</p>}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {data.pagination.page} of {data.pagination.totalPages || 1}</span>
            <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
