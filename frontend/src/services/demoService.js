// Demo Mode: simulates a real order lifecycle for class presentations
// Progresses through all 8 order statuses automatically

const DEMO_RIDER = {
  name: 'Ali Hassan',
  phone: '03001234567',
  avatar: 'https://ui-avatars.com/api/?name=Ali+Hassan&background=FF5722&color=fff&size=100',
  vehicle: 'Honda CG 125 • Red',
  rating: 4.8,
  totalDeliveries: 1240,
};

// Delays (ms) between each status transition in demo mode
const STATUS_DELAYS = {
  pending:           0,
  confirmed:         4000,   // 4s  — restaurant confirms
  preparing:         8000,   // 8s  — kitchen working
  'ready-for-pickup': 15000, // 15s — food ready
  'picked-up':       20000,  // 20s — rider picks up
  'on-the-way':      25000,  // 25s — rider heading over
  delivered:         40000,  // 40s — delivered!
};

const STATUS_MESSAGES = {
  pending:            'Order placed! Waiting for restaurant...',
  confirmed:          'Restaurant confirmed your order!',
  preparing:          'Chef is preparing your food...',
  'ready-for-pickup': 'Food is ready! Rider is picking it up...',
  'picked-up':        'Rider Ali has picked up your order!',
  'on-the-way':       'Ali is on his way to you!',
  delivered:          'Order delivered! Enjoy your meal!',
};

// Interpolate between two lat/lng points by fraction t (0-1)
const interpolate = (from, to, t) => ({
  lat: from.lat + (to.lat - from.lat) * t,
  lng: from.lng + (to.lng - from.lng) * t,
});

/**
 * runDemoOrder - drives a fake order through all statuses
 *
 * @param {Object} options
 * @param {Function} options.onStatusChange(status, message) — called at each stage
 * @param {Function} options.onRiderLocationChange(coords)  — called during on-the-way phase
 * @param {Object}  options.restaurantCoords { lat, lng }
 * @param {Object}  options.deliveryCoords   { lat, lng }
 * @returns {Function} cancel — call to abort the demo
 */
export const runDemoOrder = ({ onStatusChange, onRiderLocationChange, restaurantCoords, deliveryCoords }) => {
  const timers = [];
  let locationInterval = null;
  let cancelled = false;

  const stages = Object.keys(STATUS_DELAYS);

  stages.forEach((status) => {
    const t = setTimeout(() => {
      if (cancelled) return;
      onStatusChange(status, STATUS_MESSAGES[status]);

      if (status === 'on-the-way') {
        // Animate rider moving from restaurant to delivery address
        let progress = 0;
        locationInterval = setInterval(() => {
          if (cancelled || progress >= 1) {
            clearInterval(locationInterval);
            return;
          }
          progress += 0.02; // 2% per tick = ~50 ticks = ~15 seconds of travel
          const coords = interpolate(
            restaurantCoords || { lat: 24.8607, lng: 67.0011 },
            deliveryCoords   || { lat: 24.8800, lng: 67.0150 },
            Math.min(progress, 1)
          );
          onRiderLocationChange(coords);
        }, 300);
      }
    }, STATUS_DELAYS[status]);

    timers.push(t);
  });

  // Cancel function
  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
    if (locationInterval) clearInterval(locationInterval);
  };
};

export const DEMO_RIDER_INFO = DEMO_RIDER;

export const isDemoMode = () => localStorage.getItem('fairbite_demo') === 'true';
export const enableDemoMode = () => localStorage.setItem('fairbite_demo', 'true');
export const disableDemoMode = () => localStorage.removeItem('fairbite_demo');
