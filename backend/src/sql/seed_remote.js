const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mzvcjapddqaegcxjenpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dmNqYXBkZHFhZWdjeGplbnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3OTgyMSwiZXhwIjoyMDkzMDU1ODIxfQ.Z7IurXytESoI6tDbTVG-jtQdMDY1LN-hZKoFaPmjsqg',
  { auth: { persistSession: false } }
);

const HASH = '$2b$10$CLPoJhcdOxCwzuGe1T2rIuPjVR37n95iOWyZ0V4TzLXWlQXHwDp2m';

async function seed() {
  console.log('Seeding users...');
  const { error: ue } = await supabase.from('users').upsert([
    { id: 'a0000000-0000-0000-0000-000000000001', name: 'Sara Ahmed',        email: 'customer@demo.com',    password: HASH, role: 'customer',    phone: '0300-1234567' },
    { id: 'a0000000-0000-0000-0000-000000000002', name: 'Ali Raza',          email: 'rider@demo.com',       password: HASH, role: 'rider',       phone: '0311-9876543' },
    { id: 'a0000000-0000-0000-0000-000000000003', name: 'Restaurant Owner',  email: 'restaurant@demo.com',  password: HASH, role: 'restaurant',  phone: '042-12345678' },
    { id: 'a0000000-0000-0000-0000-000000000004', name: 'Admin User',        email: 'admin@demo.com',       password: HASH, role: 'admin',       phone: '0321-0000000' },
  ], { onConflict: 'email' });
  if (ue) { console.error('Users error:', ue.message); } else { console.log('Users OK'); }

  console.log('Seeding restaurants...');
  const { error: re } = await supabase.from('restaurants').upsert([
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      owner_id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Bundu Khan Lahore', description: 'Lahore\'s legendary BBQ — seekh kabab, haryali kabab and karahi since 1961.',
      cuisine: ['BBQ', 'Desi'],
      address: { street: 'Thokar Niaz Baig, Raiwind Road', city: 'Lahore', state: 'Punjab' },
      contact: { phone: '042-35761234' },
      images:  { cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop' },
      rating:  { average: 4.8, count: 1420 },
      delivery: { fee: 60, estimatedTime: 30, isAvailable: true },
      pricing:  { commissionRate: 15, minimumOrder: 300 },
      status:   { isVerified: true, isActive: true },
      stats:    { totalOrders: 2100, totalRevenue: 940000, views: 8500 },
      menu: [
        { id: 'm01', name: 'Seekh Kabab',    description: 'Spiced minced beef on skewers, char-grilled',  price: 480,  category: 'main-course', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm02', name: 'Haryali Kabab',  description: 'Green herb marinated chicken kabab',           price: 520,  category: 'main-course', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm03', name: 'Chicken Karahi', description: 'Tender chicken in spiced tomato gravy',        price: 950,  category: 'main-course', image: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm04', name: 'Mutton Karahi',  description: 'Slow-cooked mutton in desi ghee',              price: 1400, category: 'main-course', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm05', name: 'Naan',           description: 'Freshly baked in tandoor',                    price: 40,   category: 'main-course', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm06', name: 'Raita',          description: 'Homemade yogurt dip',                         price: 80,   category: 'appetizer',   image: 'https://images.unsplash.com/photo-1563599175592-c58dc214deff?w=400&auto=format&fit=crop', isAvailable: true },
      ],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      owner_id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Waheed\'s Kabab House', description: 'Iconic Lahori kababs and charsi karahi — a landmark on MM Alam Road.',
      cuisine: ['BBQ', 'Desi'],
      address: { street: 'Near UOL Gate, Canal Road', city: 'Lahore', state: 'Punjab' },
      contact: { phone: '042-35762345' },
      images:  { cover: 'https://images.unsplash.com/photo-1599487489208-c84b1c9ce0fb?w=900&auto=format&fit=crop' },
      rating:  { average: 4.9, count: 2100 },
      delivery: { fee: 50, estimatedTime: 25, isAvailable: true },
      pricing:  { commissionRate: 15, minimumOrder: 250 },
      status:   { isVerified: true, isActive: true },
      stats:    { totalOrders: 3400, totalRevenue: 1280000, views: 12000 },
      menu: [
        { id: 'm11', name: 'Charsi Karahi',    description: 'Famous 15-min karahi cooked on high flame',       price: 1200, category: 'main-course', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm12', name: 'Mix Grill Platter', description: 'Seekh, boti, tikka and reshmi kabab combo',      price: 1600, category: 'main-course', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm13', name: 'Chicken Tikka',     description: 'Whole leg marinated in spices, tandoor roasted', price: 680,  category: 'main-course', image: 'https://images.unsplash.com/photo-1599487488168-d4b22ceaf3ef?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm14', name: 'Daal Mash',         description: 'Creamy white lentils with desi ghee tarka',      price: 380,  category: 'main-course', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm15', name: 'Lassi',             description: 'Thick Lahori sweet lassi',                       price: 150,  category: 'beverage',   image: 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=400&auto=format&fit=crop', isAvailable: true },
      ],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      owner_id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Al-Rehmat Broast', description: 'Lahore\'s favourite crispy broast chicken — secret 12-spice batter.',
      cuisine: ['Broast', 'Fast Food'],
      address: { street: 'Thokar Niaz Baig Chowk, Raiwind Road', city: 'Lahore', state: 'Punjab' },
      contact: { phone: '042-35763456' },
      images:  { cover: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=900&auto=format&fit=crop' },
      rating:  { average: 4.7, count: 980 },
      delivery: { fee: 40, estimatedTime: 20, isAvailable: true },
      pricing:  { commissionRate: 15, minimumOrder: 200 },
      status:   { isVerified: true, isActive: true },
      stats:    { totalOrders: 1800, totalRevenue: 620000, views: 7200 },
      menu: [
        { id: 'm21', name: 'Broast Half Chicken', description: '4-piece crispy fried half chicken',          price: 650, category: 'main-course', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm22', name: 'Zinger Burger',       description: 'Crispy fillet, coleslaw, special sauce',    price: 380, category: 'main-course', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm23', name: 'Nuggets (9 pcs)',      description: 'Golden chicken nuggets with dipping sauce', price: 320, category: 'appetizer',   image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm24', name: 'Loaded Fries',         description: 'Crispy fries with cheese and jalapeños',   price: 280, category: 'appetizer',   image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm25', name: 'Cold Drink',           description: 'Pepsi, 7UP or Mirinda (330ml)',            price: 100, category: 'beverage',   image: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&auto=format&fit=crop', isAvailable: true },
      ],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      owner_id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Lahori Biryani House', description: 'Authentic Lahori biryani with kewra water, saffron and whole spices.',
      cuisine: ['Biryani', 'Desi'],
      address: { street: 'UOL Campus Road, Raiwind Road', city: 'Lahore', state: 'Punjab' },
      contact: { phone: '042-35764567' },
      images:  { cover: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&auto=format&fit=crop' },
      rating:  { average: 4.8, count: 760 },
      delivery: { fee: 40, estimatedTime: 25, isAvailable: true },
      pricing:  { commissionRate: 15, minimumOrder: 150 },
      status:   { isVerified: true, isActive: true },
      stats:    { totalOrders: 2600, totalRevenue: 780000, views: 9800 },
      menu: [
        { id: 'm31', name: 'Chicken Biryani', description: 'Aromatic Lahori spices, serves 2',             price: 550, category: 'main-course', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm32', name: 'Mutton Biryani',  description: 'Tender mutton on slow-cooked saffron rice',   price: 750, category: 'main-course', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm33', name: 'Prawn Biryani',   description: 'Juicy prawns with biryani masala',            price: 900, category: 'main-course', image: 'https://images.unsplash.com/photo-1604908554007-1ec5d4f1f8b3?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm34', name: 'Raita + Salad',   description: 'Mint raita with fresh salad',                 price: 120, category: 'appetizer',   image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm35', name: 'Dahi Barey',      description: 'Lentil fritters in tangy yogurt',             price: 160, category: 'appetizer',   image: 'https://images.unsplash.com/photo-1563599175592-c58dc214deff?w=400&auto=format&fit=crop', isAvailable: true },
      ],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000005',
      owner_id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Pizza Point Lahore', description: 'Lahore\'s most-loved pizza chain — loaded toppings, crispy base.',
      cuisine: ['Pizza', 'Fast Food'],
      address: { street: 'Main Raiwind Road, Thokar Niaz Baig', city: 'Lahore', state: 'Punjab' },
      contact: { phone: '042-35765678' },
      images:  { cover: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop' },
      rating:  { average: 4.6, count: 540 },
      delivery: { fee: 60, estimatedTime: 35, isAvailable: true },
      pricing:  { commissionRate: 15, minimumOrder: 400 },
      status:   { isVerified: true, isActive: true },
      stats:    { totalOrders: 1100, totalRevenue: 480000, views: 5600 },
      menu: [
        { id: 'm41', name: 'Lahori Masala Pizza', description: 'Spiced chicken tikka, green chilli, desi twist', price: 950,  category: 'main-course', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm42', name: 'BBQ Chicken Pizza',   description: 'Smoked chicken, caramelised onion, BBQ sauce',  price: 1050, category: 'main-course', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm43', name: 'Veggie Supreme',      description: 'Mushrooms, peppers, olives, mozzarella',        price: 800,  category: 'main-course', image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm44', name: 'Garlic Bread',        description: 'Herb butter toasted baguette',                  price: 250,  category: 'appetizer',   image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm45', name: 'Chocolate Lava Cake', description: 'Warm molten chocolate dessert',                 price: 320,  category: 'dessert',     image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop', isAvailable: true },
        { id: 'm46', name: 'Fresh Lemonade',      description: 'Mint lemonade with a spicy kick',               price: 180,  category: 'beverage',   image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&auto=format&fit=crop', isAvailable: true },
      ],
    },
  ], { onConflict: 'id' });
  if (re) { console.error('Restaurants error:', re.message); } else { console.log('Restaurants OK'); }

  console.log('Done!');
}

seed().catch(console.error);
