// Foodpanda-style flow:
// 1. Restaurant gets order → confirms → prepares → marks ready
// 2. THEN riders get notified → rider accepts → waits at restaurant 6s → starts riding
// 3. Map animation only begins when rider leaves restaurant (on-the-way)

const DEMO_RIDER = {
  name: 'Ali Hassan',
  phone: '03001234567',
  avatar: 'https://ui-avatars.com/api/?name=Ali+Hassan&background=E53935&color=fff&size=100&bold=true',
  vehicle: 'Honda CG 125 • Red • AKL-447',
  rating: 4.8,
  totalDeliveries: 1240,
};

// Foodpanda-accurate timing (ms from order placed)
const STATUS_DELAYS = {
  pending:            0,      // customer places order
  confirmed:          4000,   // restaurant accepts (4s)
  preparing:          9000,   // restaurant starts cooking (9s)
  'ready-for-pickup': 16000,  // food ready — riders now notified (16s)
  'picked-up':        22000,  // rider accepted & arrived at restaurant (22s)
  'on-the-way':       28000,  // rider collected food & left (28s — 6s after picked-up)
  delivered:          46000,  // delivered (18s of riding)
};

const STATUS_MESSAGES = {
  pending:            'Order sent to restaurant...',
  confirmed:          'Restaurant accepted your order!',
  preparing:          'Chef is cooking your food 👨‍🍳',
  'ready-for-pickup': 'Food is ready! Finding you a rider...',
  'picked-up':        'Rider Ali is at the restaurant waiting for your food',
  'on-the-way':       'Ali picked up your order and is heading to you!',
  delivered:          'Order delivered! Enjoy your meal 🎉',
};

const interpolate = (from, to, t) => ({
  lat: from.lat + (to.lat - from.lat) * t,
  lng: from.lng + (to.lng - from.lng) * t,
});

export const runDemoOrder = ({ onStatusChange, onRiderLocationChange, restaurantCoords, deliveryCoords }) => {
  const timers = [];
  let locationInterval = null;
  let cancelled = false;

  Object.entries(STATUS_DELAYS).forEach(([status, delay]) => {
    const t = setTimeout(() => {
      if (cancelled) return;
      onStatusChange(status, STATUS_MESSAGES[status]);

      // Rider location animation only starts when rider leaves restaurant
      if (status === 'on-the-way') {
        let progress = 0;
        locationInterval = setInterval(() => {
          if (cancelled || progress >= 1) { clearInterval(locationInterval); return; }
          progress += 0.028; // ~18s to complete (18000ms / 500ms per tick = 36 ticks, 1/36≈0.028)
          const coords = interpolate(
            restaurantCoords || { lat: 24.8607, lng: 67.0011 },
            deliveryCoords   || { lat: 24.8900, lng: 67.0200 },
            Math.min(progress, 1)
          );
          onRiderLocationChange(coords);
        }, 500);
      }
    }, delay);
    timers.push(t);
  });

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
    if (locationInterval) clearInterval(locationInterval);
  };
};

export const DEMO_RIDER_INFO = DEMO_RIDER;
export const isDemoMode    = () => localStorage.getItem('fairbite_demo') === 'true';
export const enableDemoMode  = () => localStorage.setItem('fairbite_demo', 'true');
export const disableDemoMode = () => localStorage.removeItem('fairbite_demo');
