import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Size variants are universal: small (-50), medium (base), large (+150).
export const SIZE_DELTAS = { small: -50, medium: 0, large: 150 };

const lineKey = (menuItemId, addOns, size) => {
  const ids = (addOns || []).map(a => a.id).sort().join(',');
  const suffix = ids ? `|${ids}` : '';
  return size && size !== 'medium' ? `${menuItemId}|${size}${suffix}` : `${menuItemId}${suffix}`;
};

const linePrice = (item) => {
  const addOnSum = (item.selectedAddOns || []).reduce((s, a) => s + (a.price || 0), 0);
  const sizeDelta = SIZE_DELTAS[item.selectedSize] || 0;
  return Math.max(0, (item.price || 0) + sizeDelta + addOnSum);
};

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: '',

      addItem: (menuItem, restaurantId, restaurantName, opts = {}) => {
        const { items, restaurantId: currentRestaurant } = get();
        const selectedAddOns = opts.selectedAddOns || [];
        const selectedSize = opts.selectedSize || 'medium';

        // Clear cart if switching restaurants
        if (currentRestaurant && currentRestaurant !== restaurantId) {
          if (!window.confirm('Your cart has items from another restaurant. Clear cart?')) return;
          set({ items: [], restaurantId: null, restaurantName: '' });
        }

        const baseId = menuItem._id || menuItem.id;
        const lineId = lineKey(baseId, selectedAddOns, selectedSize);
        const existing = items.find(i => i.lineId === lineId);

        if (existing) {
          set({
            items: items.map(i => i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i),
            restaurantId: restaurantId || currentRestaurant,
            restaurantName: restaurantName || get().restaurantName,
          });
        } else {
          const newLine = {
            ...menuItem,
            _id: baseId,
            lineId,
            selectedAddOns,
            selectedSize,
            quantity: 1,
            restaurantId,
          };
          set({ items: [...items, newLine], restaurantId, restaurantName });
        }
      },

      removeItem: (lineId) => {
        const items = get().items.filter(i => i.lineId !== lineId && i._id !== lineId);
        set({ items, restaurantId: items.length ? get().restaurantId : null });
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) { get().removeItem(lineId); return; }
        set({
          items: get().items.map(i =>
            (i.lineId === lineId || i._id === lineId) ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: '' }),
    }),
    { name: 'quickbite-cart' }
  )
);

const useCart = () => {
  const store = useCartStore();
  // Backfill lineId on legacy persisted carts so existing keys keep working.
  const items = store.items.map(i => i.lineId ? i : { ...i, lineId: lineKey(i._id, i.selectedAddOns, i.selectedSize) });
  return {
    items,
    restaurantId: store.restaurantId,
    restaurantName: store.restaurantName,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal:  items.reduce((s, i) => s + linePrice(i) * i.quantity, 0),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  };
};

export { linePrice, lineKey };
export default useCart;
