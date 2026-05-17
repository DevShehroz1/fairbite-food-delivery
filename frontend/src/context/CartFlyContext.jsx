import React, {
  createContext, useCallback, useContext, useRef, useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const CartFlyContext = createContext({
  flyToCart: () => {},
  registerCartTarget: () => () => {},
});

export const useCartFly = () => useContext(CartFlyContext);

/**
 * Pages call `registerCartTarget(el)` on their visible cart icon. The
 * provider keeps a stack of registered targets so the *latest* one wins —
 * the floating "View cart" CTA on the restaurant page beats the home
 * page's cart pill when both are mounted. `flyToCart(fromEl, emoji)` shoots
 * the emoji from `fromEl`'s centre to the current target.
 */
export function CartFlyProvider({ children }) {
  const [flights, setFlights] = useState([]);
  const targetsRef = useRef([]);

  const registerCartTarget = useCallback((el) => {
    if (!el) return () => {};
    targetsRef.current.push(el);
    return () => {
      targetsRef.current = targetsRef.current.filter(x => x !== el);
    };
  }, []);

  const flyToCart = useCallback((fromEl, emoji = '🍽️') => {
    if (!fromEl) return;
    // Capture the source rect *now* — by the time we measure on the next
    // frame, the user's tap target may be hidden behind a closing sheet.
    const f = fromEl.getBoundingClientRect();
    const fromPt = { x: f.left + f.width / 2, y: f.top + f.height / 2 };
    // Defer one frame so any pending mount (e.g. the cart CTA appearing
    // on first add) finishes registering its target before we measure it.
    requestAnimationFrame(() => {
      let target = null;
      for (let i = targetsRef.current.length - 1; i >= 0; i -= 1) {
        const el = targetsRef.current[i];
        if (el && document.body.contains(el)) { target = el; break; }
      }
      const toPt = target
        ? (() => {
            const t = target.getBoundingClientRect();
            return { x: t.left + t.width / 2, y: t.top + t.height / 2 };
          })()
        // Fallback: a sensible spot near the bottom-center where the
        // "View cart" CTA usually lives.
        : { x: window.innerWidth / 2, y: window.innerHeight - 56 };

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const midX = (fromPt.x + toPt.x) / 2;
      const apexY = Math.min(fromPt.y, toPt.y) - 140;
      setFlights(prev => [...prev, { id, fromPt, toPt, midX, apexY, emoji }]);
    });
  }, []);

  const removeFlight = useCallback((id) => {
    setFlights(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <CartFlyContext.Provider value={{ flyToCart, registerCartTarget }}>
      {children}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          pointerEvents: 'none', overflow: 'hidden',
        }}
      >
        <AnimatePresence>
          {flights.map(f => (
            <FlyingEmoji key={f.id} flight={f} onDone={() => removeFlight(f.id)} />
          ))}
        </AnimatePresence>
      </div>
    </CartFlyContext.Provider>
  );
}

function FlyingEmoji({ flight, onDone }) {
  const { fromPt, toPt, midX, apexY, emoji } = flight;
  // Two-stage motion: project up to the apex with a fast ease-out (Apple
  // bezier), then fall + shrink into the cart with a softer ease-in. The
  // emoji also spins so the toss feels playful rather than mechanical.
  const SIZE = 38;
  const half = SIZE / 2;

  // Subscribe to AnimationComplete on the *final* keyframe by listening to
  // the parent motion and dispatching when the timeline finishes.
  return (
    <motion.div
      initial={{
        x: fromPt.x - half, y: fromPt.y - half,
        scale: 0.4, opacity: 0, rotate: 0,
      }}
      animate={{
        x: [fromPt.x - half, midX - half, toPt.x - half],
        y: [fromPt.y - half, apexY - half, toPt.y - half],
        scale: [0.4, 1.25, 0.45],
        opacity: [0, 1, 0.95, 0],
        rotate: [0, 200, 540],
      }}
      transition={{
        duration: 0.9,
        ease: [0.32, 0.72, 0, 1],
        times: [0, 0.45, 1],
        opacity: { duration: 0.9, times: [0, 0.18, 0.85, 1] },
      }}
      onAnimationComplete={onDone}
      style={{
        position: 'absolute', left: 0, top: 0,
        width: SIZE, height: SIZE,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, lineHeight: 1,
        filter: 'drop-shadow(0 8px 16px rgba(229,57,53,0.32))',
        willChange: 'transform, opacity',
      }}
    >
      {emoji}
    </motion.div>
  );
}

/**
 * Returns a callback ref that auto-registers the element with the cart-fly
 * provider as it mounts and de-registers on unmount. Use as
 * `<div ref={useCartTargetRef()} />` so conditionally-rendered targets like
 * the "View cart" CTA hook in correctly each time they appear.
 */
export function useCartTargetRef() {
  const { registerCartTarget } = useCartFly();
  const unsubRef = useRef(null);
  return useCallback((el) => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    if (el) unsubRef.current = registerCartTarget(el);
  }, [registerCartTarget]);
}
