import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Cart() {
  const { cart, isLoading, isError, updateItem, removeItem } = useCart();

  if (isLoading) return <Loading label="Loading your cart..." />;
  if (isError) return <ErrorMessage message="Could not load your cart." />;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Your Cart</h1>
      {cart.items.length === 0 && <p>Your cart is empty.</p>}

      {cart.items.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #eee', padding: '0.75rem 0' }}>
          <img src={item.product.images[0]?.url} alt={item.product.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <strong>{item.product.name}</strong>
            <p>${item.product.price.toFixed(2)} each</p>
          </div>
          <button onClick={() => updateItem({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => updateItem({ productId: item.productId, quantity: item.quantity + 1 })}>+</button>
          <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeItem(item.productId)}>Remove</button>
        </div>
      ))}

      {cart.items.length > 0 && (
        <h2 style={{ marginTop: '1rem' }}>Total: ${cart.total.toFixed(2)}</h2>
      )}
    </div>
  );
}
