import { createContext, useContext } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery('cart', () => api.get('/cart').then((r) => r.data), {
    enabled: !!user,
  });

  const addItem = useMutation(
    ({ productId, quantity = 1 }) => api.post('/cart', { productId, quantity }),
    { onSuccess: () => queryClient.invalidateQueries('cart') }
  );

  const updateItem = useMutation(
    ({ productId, quantity }) => api.put(`/cart/${productId}`, { quantity }),
    { onSuccess: () => queryClient.invalidateQueries('cart') }
  );

  const removeItem = useMutation(
    (productId) => api.delete(`/cart/${productId}`),
    { onSuccess: () => queryClient.invalidateQueries('cart') }
  );

  return (
    <CartContext.Provider
      value={{
        cart: cartQuery.data,
        isLoading: cartQuery.isLoading,
        isError: cartQuery.isError,
        addItem: addItem.mutate,
        updateItem: updateItem.mutate,
        removeItem: removeItem.mutate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
