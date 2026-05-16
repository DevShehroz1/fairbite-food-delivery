import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import useLocation, { LOCATIONS } from '../hooks/useLocation';
import { Icons, Pressable } from './ui';

export default function LocationPicker() {
  const { location, setLocation } = useLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = LOCATIONS.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase())
  );

  const pick = (loc) => {
    setLocation(loc);
    setOpen(false);
    setSearch('');
    toast.success(`Delivering to ${loc.name}`, { autoClose: 1500 });
  };

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Location not supported on this device');
      return;
    }
    toast.info('Detecting your location…', { autoClose: 1500 });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Pick the nearest seeded area by haversine distance
        const { latitude, longitude } = pos.coords;
        let nearest = LOCATIONS[0], minD = Infinity;
        for (const l of LOCATIONS) {
          const dy = (l.coords[0] - latitude) * 111;
          const dx = (l.coords[1] - longitude) * 111 * Math.cos(latitude * Math.PI / 180);
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < minD) { minD = d; nearest = l; }
        }
        pick(nearest);
      },
      () => toast.error('Could not get your location — pick from the list'),
      { timeout: 7000 }
    );
  };

  return (
    <>
      <Pressable onClick={() => setOpen(true)} style={{
        display: 'inline-flex', alignItems: 'flex-start', flexDirection: 'column',
        textAlign: 'left',
      }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 0.5 }}>Deliver to</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Icons.MapPin size={16} stroke="#fff" sw={2.5}/>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', maxWidth: 200,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {location.area}, {location.name}
          </span>
          <Icons.ChevronD size={14} stroke="#fff" sw={2.5} style={{ marginLeft: 2 }}/>
        </div>
      </Pressable>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 110,
                background: '#fff', borderRadius: '5px 5px 0 0',
                padding: '12px 16px 28px', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 -10px 36px rgba(0,0,0,0.2)',
                maxWidth: 430, margin: '0 auto',
              }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E5E5E5', margin: '0 auto 14px' }}/>

              <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>Choose your area</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                We deliver across Lahore — pick where you are.
              </div>

              {/* GPS shortcut */}
              <Pressable onClick={useGPS} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 5, marginTop: 14,
                background: 'rgba(229,57,53,0.06)',
                border: '1.5px solid rgba(229,57,53,0.2)',
                width: '100%', textAlign: 'left',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 5, background: 'var(--qb-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.MapPin size={18} stroke="#fff" sw={2.5}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--qb-primary)' }}>
                    Use my current location
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
                    Snap to the nearest neighbourhood
                  </div>
                </div>
                <Icons.ChevronR size={16} stroke="var(--qb-primary)" sw={2.5}/>
              </Pressable>

              {/* Search */}
              <div style={{
                marginTop: 14,
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 5, background: '#F5F5F5',
              }}>
                <Icons.Search size={16} stroke="#9CA3AF"/>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search areas in Lahore"
                  style={{
                    flex: 1, border: 0, background: 'transparent', outline: 0,
                    fontSize: 14, fontWeight: 500, color: '#111',
                  }}
                />
                {search && (
                  <Pressable onClick={() => setSearch('')} style={{ color: '#9CA3AF' }}>
                    <Icons.X size={14}/>
                  </Pressable>
                )}
              </div>

              <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', letterSpacing: 0.5,
                textTransform: 'uppercase', marginTop: 16, marginBottom: 6 }}>
                Saved areas
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                    No matches for "{search}"
                  </div>
                ) : filtered.map(loc => {
                  const active = location.id === loc.id;
                  return (
                    <Pressable key={loc.id} onClick={() => pick(loc)} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 6px',
                      borderBottom: '1px solid #F5F5F5',
                      width: '100%', textAlign: 'left',
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 5,
                        background: active ? 'rgba(229,57,53,0.1)' : '#F5F5F5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                      }}>{loc.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700,
                          color: active ? 'var(--qb-primary)' : '#111' }}>
                          {loc.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
                          {loc.area}
                        </div>
                      </div>
                      {active ? (
                        <div style={{
                          width: 22, height: 22, borderRadius: 999,
                          background: 'var(--qb-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icons.Check size={11} stroke="#fff" sw={3}/>
                        </div>
                      ) : (
                        <Icons.ChevronR size={16} stroke="#D1D5DB"/>
                      )}
                    </Pressable>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
