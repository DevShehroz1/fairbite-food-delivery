import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Anchor coords — UOL area, Lahore (real lat/lng so tiles render correctly).
export const DEFAULT_RESTAURANT = [31.4448, 74.2730]; // restaurant
export const DEFAULT_CUSTOMER   = [31.4189, 74.2542]; // customer (UOL)

// Polyline curve between two points — quadratic bezier sampling for a road-like arc.
const interpolatePath = (a, b, steps = 40) => {
  const mid = [(a[0] + b[0]) / 2 + 0.004, (a[1] + b[1]) / 2 + 0.004];
  const pts = [];
  for (let t = 0; t <= 1; t += 1 / steps) {
    const lat = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0];
    const lng = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1];
    pts.push([lat, lng]);
  }
  return pts;
};

const buildIcon = (html, size = [44, 44]) =>
  L.divIcon({
    html,
    className: 'qb-leaflet-icon',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  });

const RESTAURANT_ICON = buildIcon(`
  <div class="qb-pin qb-pin-restaurant">
    <span>🍽️</span>
  </div>
`);

const CUSTOMER_ICON = buildIcon(`
  <div class="qb-pin qb-pin-customer">
    <span>🏠</span>
  </div>
`);

const RIDER_ICON = buildIcon(`
  <div class="qb-pin qb-pin-rider">
    <div class="qb-pin-rider-pulse"></div>
    <div class="qb-pin-rider-dot">🛵</div>
  </div>
`, [54, 54]);

function FitToRoute({ a, b }) {
  const map = useMap();
  useEffect(() => {
    if (!a || !b) return;
    const bounds = L.latLngBounds([a, b]).pad(0.4);
    map.fitBounds(bounds, { animate: true });
  }, [a, b, map]);
  return null;
}

/**
 * QuickBite live tracking map (real OSM tiles + animated rider).
 *
 * Props:
 *   restaurant : [lat, lng]   pickup point
 *   customer   : [lat, lng]   drop point
 *   progress   : 0..1         how far along the route the rider is
 *   showRider  : bool         render the rider marker
 */
export default function LeafletMap({
  restaurant = DEFAULT_RESTAURANT,
  customer   = DEFAULT_CUSTOMER,
  progress   = 0,
  showRider  = false,
}) {
  const [path, setPath] = useState(() => interpolatePath(restaurant, customer));

  useEffect(() => {
    setPath(interpolatePath(restaurant, customer));
  }, [restaurant[0], restaurant[1], customer[0], customer[1]]); // eslint-disable-line

  const clamped = Math.max(0, Math.min(1, progress));
  const idx = Math.floor(clamped * (path.length - 1));
  const riderPos = path[idx] || restaurant;
  const traveled = path.slice(0, idx + 1);
  const remaining = path.slice(idx);

  return (
    <MapContainer
      center={path[Math.floor(path.length / 2)]}
      zoom={14}
      zoomControl={false}
      attributionControl={false}
      style={{ width: '100%', height: '100%', background: '#E8EEEF' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{y}/{x}.png"
      />
      <FitToRoute a={restaurant} b={customer}/>

      {/* Future route — dashed grey */}
      <Polyline
        positions={remaining}
        pathOptions={{ color: '#94A3B8', weight: 5, opacity: 0.6, dashArray: '6 10' }}
      />
      {/* Traveled — solid brand colour */}
      <Polyline
        positions={traveled}
        pathOptions={{ color: '#E53935', weight: 6, opacity: 1, lineCap: 'round' }}
      />

      <Marker position={restaurant} icon={RESTAURANT_ICON}/>
      <Marker position={customer}   icon={CUSTOMER_ICON}/>
      {showRider && <Marker position={riderPos} icon={RIDER_ICON}/>}
    </MapContainer>
  );
}
