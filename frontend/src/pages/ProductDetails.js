import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import api from '../api/axios';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading, isError } = useQuery(['product', id], () =>
    api.get(`/products/${id}`).then((r) => r.data)
  );

  const { data: reviews } = useQuery(['reviews', id], () =>
    api.get(`/products/${id}/reviews`).then((r) => r.data)
  );

  const submitReview = useMutation(
    () => api.post(`/products/${id}/reviews`, { rating, comment }),
    { onSuccess: () => { setComment(''); queryClient.invalidateQueries(['reviews', id]); } }
  );

  if (isLoading) return <Loading label="Loading product..." />;
  if (isError || !product) return <ErrorMessage message="This product could not be found." />;

  return (
    <div style={{ padding: '1.5rem' }}>
      <img src={product.images[0]?.url} alt={product.name} style={{ maxWidth: 300 }} />
      <h1>{product.name}</h1>
      <p>{product.category?.name}</p>
      <p>{product.description}</p>
      <h2>${product.price.toFixed(2)}</h2>
      <p>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

      {user && (
        <button disabled={product.stock === 0} onClick={() => addItem({ productId: product.id })}>
          Add to Cart
        </button>
      )}
      {!user && <p><em>Log in to add this product to your cart.</em></p>}

      <h2>Reviews</h2>
      {reviews?.length === 0 && <p>No reviews yet.</p>}
      {reviews?.map((r) => (
        <div key={r._id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
          <strong>{r.userName}</strong> — {r.rating}/5
          <p>{r.comment}</p>
        </div>
      ))}

      {user && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Leave a review</h3>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts..." />
          <button onClick={() => submitReview.mutate()} disabled={!comment}>Submit Review</button>
        </div>
      )}
    </div>
  );
}
