import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Anchor coords — UOL area, Lahore (real lat/lng so tiles render correctly).
export const DEFAULT_RESTAURANT = [31.4448, 74.2730];
export const DEFAULT_CUSTOMER   = [31.4189, 74.2542];

// ── Geometry helpers ─────────────────────────────────────────────────────────

// Quadratic-bezier arc — used only as the fallback shape when the OSRM
// road-snap route is unavailable.
const interpolateArc = (a, b, steps = 60) => {
  const mid = [(a[0] + b[0]) / 2 + 0.004, (a[1] + b[1]) / 2 + 0.004];
  const pts = [];
  for (let t = 0; t <= 1; t += 1 / steps) {
    const lat = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0];
    const lng = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1];
    pts.push([lat, lng]);
  }
  return pts;
};

// Convert OSRM geometry (lng,lat) tuples to Leaflet's (lat,lng) order.
const osrmToLatLng = (coords) => coords.map(([lng, lat]) => [lat, lng]);

// Cumulative arc-length along a polyline so progress 0..1 maps to a real
// distance fraction (so the rider moves at constant speed even when path
// segments are very uneven).
const buildArcLengths = (path) => {
  const cum = [0];
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    total += haversine(path[i - 1], path[i]);
    cum.push(total);
  }
  return { cum, total };
};

function haversine([lat1, lng1], [lat2, lng2]) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Bearing from A to B in degrees (0 = north, 90 = east). Used to rotate the
// rider so its directional notch always points the way it's heading.
function bearing([lat1, lng1], [lat2, lng2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// ── Marker styling — built once, mutated in place when rider rotates so we
//    avoid re-creating divIcons every frame (which would flicker). ──────────

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

// The rider is a layered disc — outer pulse + a static ring with the
// scooter glyph + an independent rotator that swings only the heading
// notch around the ring as the rider turns.
const RIDER_ICON = buildIcon(`
  <div class="qb-pin-rider">
    <span class="qb-pin-rider-pulse"></span>
    <span class="qb-pin-rider-rotator">
      <span class="qb-pin-rider-heading"></span>
    </span>
    <span class="qb-pin-rider-ring">
      <span class="qb-pin-rider-glyph">🛵</span>
    </span>
  </div>
`, [60, 60]);

// ── Children that talk to the Leaflet map imperatively ───────────────────────

function FitToRouteOnce({ path }) {
  const map = useMap();
  const didFitRef = useRef(false);
  useEffect(() => {
    if (didFitRef.current || !path || path.length < 2) return;
    const bounds = L.latLngBounds(path).pad(0.18);
    map.fitBounds(bounds, { animate: false, maxZoom: 16 });
    didFitRef.current = true;
  }, [path, map]);
  return null;
}

// Smoothly recentre the map so the rider stays roughly mid-frame as it
// travels. We blend rider position with the customer pin so framing tightens
// toward the destination near the end of the trip — same trick the Uber map
// uses to keep both rider and drop-off in view.
function CameraFollow({ riderPos, customer, active }) {
  const map = useMap();
  const rLat = riderPos && riderPos[0];
  const rLng = riderPos && riderPos[1];
  const cLat = customer && customer[0];
  const cLng = customer && customer[1];
  useEffect(() => {
    if (!active || rLat == null || cLat == null) return;
    const focusLat = rLat * 0.65 + cLat * 0.35;
    const focusLng = rLng * 0.65 + cLng * 0.35;
    map.panTo([focusLat, focusLng], { animate: true, duration: 1.2, easeLinearity: 0.4 });
  }, [rLat, rLng, cLat, cLng, active, map]);
  return null;
}

// ── Main component ──────────────────────────────────────────────────────────

/**
 * Live order-tracking map.
 *
 * Props:
 *   restaurant : [lat, lng]   pickup
 *   customer   : [lat, lng]   drop
 *   progress   : 0..1         where the rider is along the route
 *   showRider  : bool         render rider marker + drive camera follow
 */
export default function LeafletMap({
  restaurant = DEFAULT_RESTAURANT,
  customer   = DEFAULT_CUSTOMER,
  progress   = 0,
  showRider  = false,
}) {
  // Path starts as the bezier fallback so the polyline is visible immediately,
  // then upgrades to the real OSRM road geometry once the request resolves.
  const [path, setPath] = useState(() => interpolateArc(restaurant, customer));
  const [routeKind, setRouteKind] = useState('fallback'); // 'fallback' | 'road'

  // OSRM lookup. Aborts cleanly on prop change / unmount.
  useEffect(() => {
    const ctrl = new AbortController();
    const [rLat, rLng] = restaurant;
    const [cLat, cLng] = customer;
    const url = `https://router.project-osrm.org/route/v1/driving/${rLng},${rLat};${cLng},${cLat}?overview=full&geometries=geojson`;
    fetch(url, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`OSRM ${r.status}`)))
      .then(json => {
        const coords = json?.routes?.[0]?.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length >= 2) {
          setPath(osrmToLatLng(coords));
          setRouteKind('road');
        } else {
          setPath(interpolateArc(restaurant, customer));
          setRouteKind('fallback');
        }
      })
      .catch(() => {
        // Network failure / abort / OSRM rate limit — keep the bezier arc.
        // No toast: the user shouldn't see a degraded-map warning for what
        // is purely a visual nicety.
      });
    return () => ctrl.abort();
  }, [restaurant[0], restaurant[1], customer[0], customer[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Map progress (0..1) → an exact point along the polyline, plus the
  //    heading of the next segment. We use cumulative arc length so the
  //    rider moves at a constant ground speed regardless of where OSRM
  //    decided to densify the path. ──────────────────────────────────────
  const arc = useMemo(() => buildArcLengths(path), [path]);

  const { riderPos, heading } = useMemo(() => {
    if (path.length < 2) {
      return { riderPos: path[0] || restaurant, heading: 0 };
    }
    const clamped = Math.max(0, Math.min(1, progress));
    const targetDist = clamped * arc.total;
    // Binary-search-lite: most paths are short (≤ 200 pts) so a linear scan
    // is fine and avoids subtle off-by-one bugs.
    let i = 1;
    while (i < arc.cum.length && arc.cum[i] < targetDist) i += 1;
    const i0 = Math.max(0, i - 1);
    const i1 = Math.min(path.length - 1, i);
    const segLen = arc.cum[i1] - arc.cum[i0];
    const f = segLen === 0 ? 0 : (targetDist - arc.cum[i0]) / segLen;
    const a = path[i0];
    const b = path[i1];
    const pos = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    // Heading uses a slightly forward-looking pair so the marker doesn't
    // jitter on micro-segments (OSRM emits clusters of nearly-coincident
    // points on tight corners).
    const lookAheadIdx = Math.min(path.length - 1, i1 + 1);
    const h = bearing(a, path[lookAheadIdx]);
    return { riderPos: pos, heading: h };
  }, [path, arc, progress, restaurant]);

  // Apply the heading rotation imperatively. The .qb-pin-rider-rotator
  // sits behind the disc; only its child notch is visible, so rotating it
  // visually swings the heading arrow around the disc without disturbing
  // the upright scooter glyph.
  const riderMarkerRef = useRef(null);
  useEffect(() => {
    const m = riderMarkerRef.current;
    if (!m) return;
    const el = m.getElement && m.getElement();
    if (!el) return;
    const rotator = el.querySelector('.qb-pin-rider-rotator');
    if (rotator) rotator.style.transform = `rotate(${heading}deg)`;
  }, [heading, showRider]);

  // Split the polyline so the traveled portion can be drawn in brand colour
  // and the remaining portion as a softer dashed hint. Mirrors what Uber and
  // Foodpanda show — gives the user a clear sense of distance left.
  const cutIdx = (() => {
    if (path.length < 2) return 0;
    const clamped = Math.max(0, Math.min(1, progress));
    const targetDist = clamped * arc.total;
    let i = 1;
    while (i < arc.cum.length && arc.cum[i] < targetDist) i += 1;
    return i;
  })();
  const traveled = path.slice(0, cutIdx + 1).concat([riderPos]);
  const remaining = [riderPos].concat(path.slice(cutIdx + 1));

  return (
    <div className="qb-map-shell">
      <MapContainer
        center={path[Math.floor(path.length / 2)] || restaurant}
        zoom={14}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%', background: '#E8EEEF' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          maxZoom={19}
          subdomains="abcd"
        />
        {/* One-shot fit-bounds so all three pins fit on first load… */}
        <FitToRouteOnce path={path}/>
        {/* …then the camera gently follows the rider once it's moving. */}
        <CameraFollow riderPos={riderPos} customer={customer} active={showRider}/>

        {/* Soft white "halo" line behind the route — gives the brand stroke
            depth, like the iOS Maps inactive turn-by-turn line. */}
        <Polyline
          positions={path}
          pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
        />
        <Polyline
          positions={remaining}
          pathOptions={{ color: '#94A3B8', weight: 5, opacity: 0.65, dashArray: '6 10', lineCap: 'round' }}
        />
        <Polyline
          positions={traveled}
          pathOptions={{ color: '#E53935', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
        />

        <Marker position={restaurant} icon={RESTAURANT_ICON}/>
        <Marker position={customer}   icon={CUSTOMER_ICON}/>
        {showRider && (
          <Marker
            position={riderPos}
            icon={RIDER_ICON}
            ref={riderMarkerRef}
          />
        )}
      </MapContainer>

      {/* Tiny status pip — tells you whether the route is the real one or
          the bezier fallback. Useful during the demo when the OSRM server
          is occasionally slow on the first request. */}
      {routeKind === 'fallback' && (
        <div className="qb-map-routeflag">Estimating route…</div>
      )}
    </div>
  );
}
