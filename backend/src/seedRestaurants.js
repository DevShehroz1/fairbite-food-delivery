require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fairbite').then(async () => {
  const owner = await User.findOne({ email: 'restaurant@demo.com' });
  if (!owner) { console.error('restaurant@demo.com not found — run seedDemoUsers first'); process.exit(1); }

  await Restaurant.deleteMany({ owner: owner._id });

  const hours = { open: '09:00', close: '23:00', isOpen: true };
  const week = { monday: hours, tuesday: hours, wednesday: hours, thursday: hours, friday: hours, saturday: hours, sunday: hours };

  const restaurants = [
    {
      owner: owner._id,
      name: 'Karachi Grill House',
      description: 'The finest BBQ and Pakistani cuisine. Halal certified. Fresh ingredients daily.',
      cuisine: ['BBQ', 'Pakistani'],
      address: { street: '123 Burns Road', city: 'Karachi', state: 'Sindh', zipCode: '74200', coordinates: { lat: 24.8607, lng: 67.0011 } },
      contact: { phone: '02112345678', email: 'grill@demo.com' },
      images: {
        cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
        logo: 'https://ui-avatars.com/api/?name=KGH&background=FF5722&color=fff&size=100',
      },
      rating: { average: 4.7, count: 320 },
      delivery: { fee: 50, estimatedTime: 25, isAvailable: true },
      pricing: { commissionRate: 15, minimumOrder: 200 },
      openingHours: week,
      status: { isActive: true, isVerified: true, isFeatured: true },
      menu: [
        { name: 'Chicken Karahi', price: 850, category: 'main-course', description: 'Classic spicy Karahi with fresh tomatoes and ginger', dietaryTags: ['halal'], spiceLevel: 'hot', calories: 520, isAvailable: true },
        { name: 'Mutton Biryani', price: 650, category: 'main-course', description: 'Aromatic basmati rice with tender mutton pieces', dietaryTags: ['halal'], spiceLevel: 'medium', calories: 680, isAvailable: true },
        { name: 'Seekh Kebab (6pcs)', price: 450, category: 'appetizer', description: 'Juicy minced meat kebabs served with chutney', dietaryTags: ['halal'], spiceLevel: 'medium', calories: 380, isAvailable: true },
        { name: 'Beef Nihari', price: 780, category: 'main-course', description: 'Slow-cooked beef stew with bone marrow', dietaryTags: ['halal'], spiceLevel: 'hot', calories: 720, isAvailable: true },
        { name: 'Gulab Jamun', price: 150, category: 'dessert', description: 'Soft milk-solid dumplings in sugar syrup', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 280, isAvailable: true },
        { name: 'Mango Lassi', price: 120, category: 'beverage', description: 'Chilled yogurt-based mango drink', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 180, isAvailable: true },
      ],
    },
    {
      owner: owner._id,
      name: 'Pizza Palace',
      description: 'Authentic Italian-style pizzas with fresh dough made daily.',
      cuisine: ['Pizza', 'Italian'],
      address: { street: '45 Clifton Block 5', city: 'Karachi', state: 'Sindh', zipCode: '75600', coordinates: { lat: 24.8138, lng: 67.0300 } },
      contact: { phone: '02198765432', email: 'pizza@demo.com' },
      images: {
        cover: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200',
        logo: 'https://ui-avatars.com/api/?name=PP&background=E53935&color=fff&size=100',
      },
      rating: { average: 4.3, count: 180 },
      delivery: { fee: 60, estimatedTime: 35, isAvailable: true },
      pricing: { commissionRate: 15, minimumOrder: 300 },
      openingHours: week,
      status: { isActive: true, isVerified: true, isFeatured: false },
      menu: [
        { name: 'Margherita Pizza (M)', price: 650, category: 'main-course', description: 'Classic tomato base, mozzarella, fresh basil', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 760, isAvailable: true },
        { name: 'BBQ Chicken Pizza (M)', price: 850, category: 'main-course', description: 'Smoky BBQ sauce, grilled chicken, red onion', dietaryTags: ['halal'], spiceLevel: 'mild', calories: 920, isAvailable: true },
        { name: 'Garlic Bread', price: 220, category: 'appetizer', description: 'Toasted bread with garlic butter and herbs', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 310, isAvailable: true },
        { name: 'Pasta Alfredo', price: 550, category: 'main-course', description: 'Creamy white sauce pasta with mushrooms', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 680, isAvailable: true },
        { name: 'Chocolate Lava Cake', price: 280, category: 'dessert', description: 'Warm chocolate cake with molten centre', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 420, isAvailable: true },
        { name: 'Soft Drink', price: 80, category: 'beverage', description: 'Chilled Pepsi / 7UP / Mirinda', dietaryTags: ['vegan'], spiceLevel: 'mild', calories: 140, isAvailable: true },
      ],
    },
    {
      owner: owner._id,
      name: 'Green Bowl — Vegan',
      description: 'Healthy, plant-based meals made with organic ingredients.',
      cuisine: ['Vegan', 'Healthy'],
      address: { street: '7 DHA Phase 6', city: 'Karachi', state: 'Sindh', zipCode: '75500', coordinates: { lat: 24.7861, lng: 67.0595 } },
      contact: { phone: '02111223344', email: 'greenbowl@demo.com' },
      images: {
        cover: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200',
        logo: 'https://ui-avatars.com/api/?name=GB&background=43A047&color=fff&size=100',
      },
      rating: { average: 4.9, count: 95 },
      delivery: { fee: 40, estimatedTime: 20, isAvailable: true },
      pricing: { commissionRate: 15, minimumOrder: 250 },
      openingHours: week,
      status: { isActive: true, isVerified: true, isFeatured: false },
      menu: [
        { name: 'Acai Bowl', price: 480, category: 'main-course', description: 'Blended acai topped with granola, fresh fruit, honey', dietaryTags: ['vegan', 'gluten-free'], spiceLevel: 'mild', calories: 340, isAvailable: true },
        { name: 'Quinoa Salad', price: 420, category: 'main-course', description: 'Tri-colour quinoa with roasted veggies and tahini dressing', dietaryTags: ['vegan', 'gluten-free'], spiceLevel: 'mild', calories: 290, isAvailable: true },
        { name: 'Avocado Toast', price: 350, category: 'appetizer', description: 'Sourdough with smashed avocado, cherry tomatoes, seeds', dietaryTags: ['vegan'], spiceLevel: 'mild', calories: 380, isAvailable: true },
        { name: 'Green Smoothie', price: 280, category: 'beverage', description: 'Spinach, banana, almond milk, chia seeds', dietaryTags: ['vegan', 'gluten-free'], spiceLevel: 'mild', calories: 210, isAvailable: true },
        { name: 'Vegan Brownie', price: 220, category: 'dessert', description: 'Rich chocolate brownie — dairy free, egg free', dietaryTags: ['vegan'], spiceLevel: 'mild', calories: 260, isAvailable: true },
      ],
    },
    {
      owner: owner._id,
      name: 'Halal Biryani Corner',
      description: 'Authentic dum biryani cooked the traditional way, slow and smoky.',
      cuisine: ['Pakistani', 'Rice'],
      address: { street: '88 Tariq Road', city: 'Karachi', state: 'Sindh', zipCode: '74800', coordinates: { lat: 24.8745, lng: 67.0425 } },
      contact: { phone: '02133445566', email: 'biryani@demo.com' },
      images: {
        cover: 'https://images.unsplash.com/photo-1563379091339-03246963d52a?w=1200',
        logo: 'https://ui-avatars.com/api/?name=HBC&background=F57F17&color=fff&size=100',
      },
      rating: { average: 4.5, count: 540 },
      delivery: { fee: 30, estimatedTime: 30, isAvailable: true },
      pricing: { commissionRate: 15, minimumOrder: 150 },
      openingHours: week,
      status: { isActive: true, isVerified: true, isFeatured: true },
      menu: [
        { name: 'Chicken Biryani (Full)', price: 600, category: 'main-course', description: 'Full pot of aromatic chicken dum biryani (serves 2)', dietaryTags: ['halal'], spiceLevel: 'medium', calories: 850, isAvailable: true },
        { name: 'Beef Biryani (Half)', price: 450, category: 'main-course', description: 'Half portion of smoky beef biryani', dietaryTags: ['halal'], spiceLevel: 'hot', calories: 620, isAvailable: true },
        { name: 'Raita', price: 60, category: 'appetizer', description: 'Chilled yogurt with cucumber and mint', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 80, isAvailable: true },
        { name: 'Biryani Rice (Plain)', price: 200, category: 'main-course', description: 'Plain saffron-infused basmati rice', dietaryTags: ['halal', 'vegetarian'], spiceLevel: 'mild', calories: 320, isAvailable: true },
        { name: 'Kheer', price: 100, category: 'dessert', description: 'Traditional Pakistani rice pudding with cardamom', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 220, isAvailable: true },
      ],
    },
    {
      owner: owner._id,
      name: 'Burger Bros',
      description: 'Smash burgers made fresh to order. No frozen patties, ever.',
      cuisine: ['Burgers', 'American'],
      address: { street: '21 Gulshan-e-Iqbal', city: 'Karachi', state: 'Sindh', zipCode: '75300', coordinates: { lat: 24.9216, lng: 67.0925 } },
      contact: { phone: '02155667788', email: 'burgers@demo.com' },
      images: {
        cover: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200',
        logo: 'https://ui-avatars.com/api/?name=BB&background=795548&color=fff&size=100',
      },
      rating: { average: 4.2, count: 210 },
      delivery: { fee: 55, estimatedTime: 28, isAvailable: true },
      pricing: { commissionRate: 15, minimumOrder: 400 },
      openingHours: week,
      status: { isActive: true, isVerified: false, isFeatured: false },
      menu: [
        { name: 'Classic Smash Burger', price: 520, category: 'main-course', description: 'Double smash patty, American cheese, pickles, secret sauce', dietaryTags: ['halal'], spiceLevel: 'mild', calories: 740, isAvailable: true },
        { name: 'Spicy Crispy Chicken', price: 480, category: 'main-course', description: 'Crispy fried chicken thigh, jalapeños, sriracha mayo', dietaryTags: ['halal'], spiceLevel: 'hot', calories: 680, isAvailable: true },
        { name: 'Loaded Fries', price: 280, category: 'appetizer', description: 'Crispy fries with cheese sauce, jalapeños, sour cream', dietaryTags: ['vegetarian'], spiceLevel: 'medium', calories: 560, isAvailable: true },
        { name: 'Onion Rings', price: 180, category: 'appetizer', description: 'Beer-battered crispy onion rings', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 310, isAvailable: true },
        { name: 'Chocolate Shake', price: 240, category: 'beverage', description: 'Thick chocolate milkshake with whipped cream', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 480, isAvailable: true },
      ],
    },
  ];

  for (const r of restaurants) {
    const created = await Restaurant.create(r);
    console.log(`Created: ${created.name} (${created._id})`);
  }

  console.log('\nAll restaurants seeded!');
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
