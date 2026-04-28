import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: '',

      addItem: (menuItem, restaurantId, restaurantName) => {
        const { items, restaurantId: currentRestaurant } = get();

        // Clear cart if switching restaurants
        if (currentRestaurant && currentRestaurant !== restaurantId) {
          if (!window.confirm('Your cart has items from another restaurant. Clear cart?')) return;
          set({ items: [], restaurantId: null, restaurantName: '' });
        }

        const existing = items.find(i => i._id === menuItem._id);
        if (existing) {
          set({ items: items.map(i => i._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, { ...menuItem, quantity: 1 }], restaurantId, restaurantName });
        }
      },

      removeItem: (itemId) => {
        const items = get().items.filter(i => i._id !== itemId);
        set({ items, restaurantId: items.length ? get().restaurantId : null });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) { get().removeItem(itemId); return; }
        set({ items: get().items.map(i => i._id === itemId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: '' }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    { name: 'fairbite-cart' }
  )
);

const useCart = () => {
  const store = useCartStore();
  return {
    items: store.items,
    restaurantId: store.restaurantId,
    restaurantName: store.restaurantName,
    itemCount: store.items.reduce((s, i) => s + i.quantity, 0),
    subtotal: store.items.reduce((s, i) => s + i.price * i.quantity, 0),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  };
};

export default useCart;
