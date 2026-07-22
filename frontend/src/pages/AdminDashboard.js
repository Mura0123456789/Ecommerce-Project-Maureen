import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import api from '../api/axios';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });

  const { data: stats, isLoading, isError } = useQuery('stats', () => api.get('/stats').then((r) => r.data));
  const { data: categories } = useQuery('categories', () => api.get('/categories').then((r) => r.data));
  const { data: productsData } = useQuery('admin-products', () => api.get('/products?limit=100').then((r) => r.data));

  const createProduct = useMutation(
    () => api.post('/products', { ...form, price: Number(form.price), stock: Number(form.stock), categoryId: Number(form.categoryId) }),
    {
      onSuccess: () => {
        setForm({ name: '', description: '', price: '', stock: '', categoryId: '' });
        queryClient.invalidateQueries('admin-products');
        queryClient.invalidateQueries('stats');
      },
    }
  );

  const deleteProduct = useMutation(
    (id) => api.delete(`/products/${id}`),
    { onSuccess: () => { queryClient.invalidateQueries('admin-products'); queryClient.invalidateQueries('stats'); } }
  );

  if (isLoading) return <Loading label="Loading dashboard..." />;
  if (isError) return <ErrorMessage message="Could not load store statistics." />;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <Stat label="Users" value={stats.users} />
        <Stat label="Products" value={stats.products} />
        <Stat label="Categories" value={stats.categories} />
        <Stat label="Orders" value={stats.orders} />
        <Stat label="Reviews" value={stats.reviews} />
      </div>

      <h2>Add a Product</h2>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Category</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => createProduct.mutate()} disabled={!form.name || !form.categoryId}>Create</button>
      </div>

      <h2>All Products</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th align="left">Name</th><th align="left">Category</th><th align="left">Price</th><th align="left">Stock</th><th /></tr>
        </thead>
        <tbody>
          {productsData?.products.map((p) => (
            <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{p.name}</td>
              <td>{p.category?.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td><button onClick={() => deleteProduct.mutate(p.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '1.5rem' }}>Recent Activity</h2>
      <ul>
        {stats.recentActivity.map((a) => (
          <li key={a._id}>{a.action} — {new Date(a.createdAt).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '1rem', minWidth: 100, textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ color: '#666' }}>{label}</div>
    </div>
  );
}
