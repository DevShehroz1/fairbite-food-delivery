import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const LOCATIONS = [
  { id: 'uol',          name: 'UOL, Raiwind Road',  area: 'Lahore', emoji: '🎓', coords: [31.4189, 74.2542] },
  { id: 'dha5',         name: 'DHA Phase 5',         area: 'Lahore', emoji: '🏙️', coords: [31.4734, 74.4090] },
  { id: 'gulberg',      name: 'Gulberg III',         area: 'Lahore', emoji: '🌆', coords: [31.5152, 74.3528] },
  { id: 'johar',        name: 'Johar Town',          area: 'Lahore', emoji: '🏘️', coords: [31.4697, 74.2728] },
  { id: 'model',        name: 'Model Town',          area: 'Lahore', emoji: '🌳', coords: [31.4836, 74.3236] },
  { id: 'bahria',       name: 'Bahria Town',         area: 'Lahore', emoji: '🏡', coords: [31.3672, 74.1856] },
  { id: 'cantt',        name: 'Cantt',               area: 'Lahore', emoji: '🪖', coords: [31.5497, 74.3963] },
  { id: 'faisal',       name: 'Faisal Town',         area: 'Lahore', emoji: '🏠', coords: [31.4811, 74.3019] },
  { id: 'garden',       name: 'Garden Town',         area: 'Lahore', emoji: '🌿', coords: [31.5025, 74.3236] },
  { id: 'wapda',        name: 'Wapda Town',          area: 'Lahore', emoji: '🏗️', coords: [31.4350, 74.2667] },
  { id: 'bahria-orch',  name: 'Bahria Orchard',      area: 'Lahore', emoji: '🌷', coords: [31.3306, 74.1722] },
  { id: 'iqbal-town',   name: 'Allama Iqbal Town',   area: 'Lahore', emoji: '🏛️', coords: [31.5024, 74.2853] },
];

export const DEFAULT_LOCATION = LOCATIONS[0];

const useLocation = create(
  persist(
    (set) => ({
      location: DEFAULT_LOCATION,
      setLocation: (loc) => set({ location: loc }),
    }),
    { name: 'quickbite-location' }
  )
);

export default useLocation;
