-- ============================================================
-- FairBite Seed Data — run AFTER schema.sql
-- Password for all demo accounts: demo123
-- Hash = bcrypt of "demo123" with cost 10
-- ============================================================

-- ── Demo users ───────────────────────────────────────────────
INSERT INTO users (id, name, email, password, role, phone, avatar) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'Sara Ahmed',
  'customer@demo.com',
  '$2b$10$CLPoJhcdOxCwzuGe1T2rIuPjVR37n95iOWyZ0V4TzLXWlQXHwDp2m',
  'customer',
  '0300-1234567',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop'
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Ali Raza',
  'rider@demo.com',
  '$2b$10$CLPoJhcdOxCwzuGe1T2rIuPjVR37n95iOWyZ0V4TzLXWlQXHwDp2m',
  'rider',
  '0311-9876543',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop'
),
(
  'a0000000-0000-0000-0000-000000000003',
  'Restaurant Owner',
  'restaurant@demo.com',
  '$2b$10$CLPoJhcdOxCwzuGe1T2rIuPjVR37n95iOWyZ0V4TzLXWlQXHwDp2m',
  'restaurant',
  '021-12345678',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop'
),
(
  'a0000000-0000-0000-0000-000000000004',
  'Admin User',
  'admin@demo.com',
  '$2b$10$CLPoJhcdOxCwzuGe1T2rIuPjVR37n95iOWyZ0V4TzLXWlQXHwDp2m',
  'admin',
  '0321-0000000',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop'
);

-- ── Demo restaurants ─────────────────────────────────────────
INSERT INTO restaurants (id, owner_id, name, description, cuisine, address, contact, images, rating, delivery, pricing, status, stats, menu) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000003',
  'Kolachi Express',
  'Authentic Karachi BBQ and Pakistani cuisine. Halal certified.',
  ARRAY['Desi','BBQ'],
  '{"street":"Do Darya, DHA Phase 8","city":"Karachi","state":"Sindh"}',
  '{"phone":"021-12345678"}',
  '{"cover":"https://images.unsplash.com/photo-1599487489208-c84b1c9ce0fb?w=900&auto=format&fit=crop"}',
  '{"average":4.8,"count":312}',
  '{"fee":60,"estimatedTime":35,"isAvailable":true}',
  '{"commissionRate":15,"minimumOrder":200}',
  '{"isVerified":true,"isActive":true}',
  '{"totalOrders":847,"totalRevenue":284000,"views":4200}',
  '[
    {"id":"m01","name":"Chicken Karahi","description":"Tender chicken in spiced tomato gravy","price":850,"category":"Mains","image":"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m02","name":"Mutton Biryani","description":"Slow-cooked mutton on fragrant basmati","price":650,"category":"Rice","image":"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m03","name":"Seekh Kebab (6 pcs)","description":"Minced beef with herbs, char-grilled","price":480,"category":"BBQ","image":"https://images.unsplash.com/photo-1599487489208-c84b1c9ce0fb?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m04","name":"Naan","description":"Tandoor-baked fluffy naan","price":40,"category":"Bread","isAvailable":true},
    {"id":"m05","name":"Raita","description":"Yogurt with cucumber and mint","price":80,"category":"Sides","isAvailable":true}
  ]'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'Burger Bros',
  'Smash burgers, loaded fries and thick shakes.',
  ARRAY['Burgers','Fast Food'],
  '{"street":"Zamzama Block 5","city":"Karachi","state":"Sindh"}',
  '{"phone":"021-98765432"}',
  '{"cover":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop"}',
  '{"average":4.6,"count":189}',
  '{"fee":50,"estimatedTime":25,"isAvailable":true}',
  '{"commissionRate":15,"minimumOrder":300}',
  '{"isVerified":true,"isActive":true}',
  '{"totalOrders":320,"totalRevenue":105000,"views":2800}',
  '[
    {"id":"m11","name":"Double Smash Burger","description":"Two smashed patties, cheddar, special sauce","price":750,"category":"Burgers","image":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m12","name":"Crispy Chicken Burger","description":"Fried chicken fillet with slaw","price":620,"category":"Burgers","image":"https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m13","name":"Loaded Fries","description":"Fries with cheese sauce and jalapeños","price":380,"category":"Sides","isAvailable":true},
    {"id":"m14","name":"Thick Shake","description":"Oreo, Nutella or Strawberry","price":320,"category":"Drinks","isAvailable":true}
  ]'
),
(
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000003',
  'Pompei Pizzeria',
  'Neapolitan-style wood-fired pizza, pasta and tiramisu.',
  ARRAY['Pizza','Italian'],
  '{"street":"Ocean Mall, Clifton","city":"Karachi","state":"Sindh"}',
  '{"phone":"021-55544433"}',
  '{"cover":"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop"}',
  '{"average":4.7,"count":240}',
  '{"fee":70,"estimatedTime":40,"isAvailable":true}',
  '{"commissionRate":15,"minimumOrder":400}',
  '{"isVerified":true,"isActive":true}',
  '{"totalOrders":560,"totalRevenue":198000,"views":3100}',
  '[
    {"id":"m21","name":"Margherita","description":"San Marzano, fior di latte, basil","price":900,"category":"Pizza","image":"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m22","name":"Pepperoni Blast","description":"Double pepperoni on tomato base","price":1050,"category":"Pizza","isAvailable":true},
    {"id":"m23","name":"Pasta Arrabbiata","description":"Penne in spicy tomato-garlic sauce","price":680,"category":"Pasta","isAvailable":true},
    {"id":"m24","name":"Tiramisu","description":"Classic Italian dessert","price":380,"category":"Desserts","isAvailable":true}
  ]'
),
(
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000003',
  'Halal Biryani Corner',
  'Karachi-style spicy biryani. No compromises on spice.',
  ARRAY['Biryani','Desi'],
  '{"street":"Soldier Bazaar","city":"Karachi","state":"Sindh"}',
  '{"phone":"021-22334455"}',
  '{"cover":"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&auto=format&fit=crop"}',
  '{"average":4.9,"count":480}',
  '{"fee":40,"estimatedTime":20,"isAvailable":true}',
  '{"commissionRate":15,"minimumOrder":150}',
  '{"isVerified":true,"isActive":true}',
  '{"totalOrders":1200,"totalRevenue":390000,"views":6500}',
  '[
    {"id":"m31","name":"Chicken Biryani (Half)","description":"Spicy Karachi-style, serves 2","price":450,"category":"Biryani","image":"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m32","name":"Mutton Biryani (Half)","description":"Tender mutton on slow-cooked rice","price":650,"category":"Biryani","isAvailable":true},
    {"id":"m33","name":"Dahi Barey","description":"Lentil fritters in tangy yogurt","price":180,"category":"Starters","isAvailable":true},
    {"id":"m34","name":"Soft Drink (500ml)","price":80,"category":"Drinks","isAvailable":true}
  ]'
),
(
  'b0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000003',
  'Green Bowl — Vegan',
  'Healthy plant-based meals with organic ingredients.',
  ARRAY['Vegan','Healthy'],
  '{"street":"7 DHA Phase 6","city":"Karachi","state":"Sindh"}',
  '{"phone":"021-11223344"}',
  '{"cover":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop"}',
  '{"average":4.9,"count":95}',
  '{"fee":40,"estimatedTime":25,"isAvailable":true}',
  '{"commissionRate":15,"minimumOrder":250}',
  '{"isVerified":true,"isActive":true}',
  '{"totalOrders":95,"totalRevenue":42000,"views":1200}',
  '[
    {"id":"m41","name":"Buddha Bowl","description":"Quinoa, roasted veggies, tahini","price":680,"category":"Bowls","image":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop","isAvailable":true},
    {"id":"m42","name":"Avocado Toast","description":"Sourdough, smashed avo, micro herbs","price":520,"category":"Breakfast","isAvailable":true},
    {"id":"m43","name":"Green Smoothie","description":"Spinach, banana, almond milk","price":350,"category":"Drinks","isAvailable":true}
  ]'
);
