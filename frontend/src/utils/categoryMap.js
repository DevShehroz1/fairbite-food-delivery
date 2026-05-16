export const CATEGORY_TO_CUISINES = {
  'fast-food':   ['Burgers', 'American', 'Pizza', 'Italian', 'Fried Chicken', 'Fast Food'],
  'biryani':     ['Pakistani', 'Rice', 'Biryani', 'Indian'],
  'pizza':       ['Pizza', 'Italian'],
  'pakistani':   ['Pakistani', 'BBQ', 'Desi'],
  'burgers':     ['Burgers', 'American'],
  'ice-cream':   ['Ice Cream', 'Dessert', 'Desserts'],
  'paratha':     ['Pakistani', 'Breakfast'],
  'halwa-puri':  ['Pakistani', 'Breakfast'],
  'chinese':     ['Chinese'],
  'desserts':    ['Dessert', 'Desserts', 'Sweet'],
  'pasta':       ['Italian', 'Pasta'],
  'pulao':       ['Pakistani', 'Rice'],
  'shawarma':    ['Arabic', 'Middle Eastern', 'Shawarma'],
  'haleem':      ['Pakistani', 'Slow-cooked'],
};

export const CATEGORY_LABEL = {
  'fast-food':   'Fast Food',
  'biryani':     'Biryani',
  'pizza':       'Pizza',
  'pakistani':   'Pakistani',
  'burgers':     'Burgers',
  'ice-cream':   'Ice Cream',
  'paratha':     'Paratha',
  'halwa-puri':  'Halwa Puri',
  'chinese':     'Chinese',
  'desserts':    'Desserts',
  'pasta':       'Pasta',
  'pulao':       'Pulao',
  'shawarma':    'Shawarma',
  'haleem':      'Haleem',
};

export const BRAND_LABEL = {
  kfc:        'KFC',
  burgerking: 'Burger King',
  mcdonalds:  "McDonald's",
  dominos:    "Domino's",
  pizzahut:   'Pizza Hut',
  subway:     'Subway',
  cheezious:  'Cheezious',
};

export const matchesCategory = (restaurant, categoryId) => {
  if (!categoryId) return true;
  // Burgers category is curated to Daily Deli Co only.
  if (categoryId === 'burgers') {
    return (restaurant.name || '').toLowerCase().includes('daily deli');
  }
  const wanted = CATEGORY_TO_CUISINES[categoryId] || [];
  if (!wanted.length) return true;
  const cuisines = (restaurant.cuisine || []).map(c => (c || '').toLowerCase());
  return wanted.some(w => cuisines.includes(w.toLowerCase()));
};

export const matchesBrand = (restaurant, brandId) => {
  if (!brandId) return true;
  const label = (BRAND_LABEL[brandId] || brandId).toLowerCase();
  return (restaurant.name || '').toLowerCase().includes(label);
};

export const fallbackBrandLogo = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '?')}&background=E53935&color=fff&size=200&bold=true`;
