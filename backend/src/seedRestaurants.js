require('dotenv').config();
const supabase = require('./config/supabase');
const User     = require('./models/User');

(async () => {
  const owner = await User.findByEmail('restaurant@demo.com');
  if (!owner) { console.error('Run seedDemoUsers first'); process.exit(1); }

  // Clear existing demo restaurants
  await supabase.from('restaurants').delete().eq('owner_id', owner.id);

  const restaurants = [
    {
      owner_id: owner.id,
      name: 'Karachi Grill House',
      description: 'The finest BBQ and Pakistani cuisine. Halal certified.',
      cuisine: ['BBQ','Pakistani'],
      address: { street:'123 Burns Road', city:'Karachi', state:'Sindh', zipCode:'74200', coordinates:{ lat:24.8607, lng:67.0011 } },
      contact: { phone:'02112345678', email:'grill@demo.com' },
      images:  { cover:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', logo:'https://ui-avatars.com/api/?name=KGH&background=E53935&color=fff&size=100' },
      rating:  { average:4.7, count:320 },
      delivery:{ fee:50, estimatedTime:25, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:200 },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'m1', _id:'m1', name:'Chicken Karahi',    price:850, category:'main-course', description:'Classic spicy Karahi', dietaryTags:['halal'], spiceLevel:'hot',    calories:520, isAvailable:true },
        { id:'m2', _id:'m2', name:'Mutton Biryani',    price:650, category:'main-course', description:'Aromatic basmati rice', dietaryTags:['halal'], spiceLevel:'medium', calories:680, isAvailable:true },
        { id:'m3', _id:'m3', name:'Seekh Kebab (6pcs)',price:450, category:'appetizer',   description:'Juicy minced kebabs',  dietaryTags:['halal'], spiceLevel:'medium', calories:380, isAvailable:true },
        { id:'m4', _id:'m4', name:'Beef Nihari',       price:780, category:'main-course', description:'Slow-cooked beef stew',dietaryTags:['halal'], spiceLevel:'hot',    calories:720, isAvailable:true },
        { id:'m5', _id:'m5', name:'Gulab Jamun',       price:150, category:'dessert',     description:'Sweet milk dumplings', dietaryTags:['vegetarian'], spiceLevel:'mild', calories:280, isAvailable:true },
        { id:'m6', _id:'m6', name:'Mango Lassi',       price:120, category:'beverage',    description:'Chilled mango yogurt', dietaryTags:['vegetarian'], spiceLevel:'mild', calories:180, isAvailable:true },
      ],
    },
    {
      owner_id: owner.id,
      name: 'Pizza Palace',
      description: 'Authentic Italian-style pizzas with fresh dough made daily.',
      cuisine: ['Pizza','Italian'],
      address: { street:'45 Clifton Block 5', city:'Karachi', state:'Sindh', zipCode:'75600', coordinates:{ lat:24.8138, lng:67.0300 } },
      contact: { phone:'02198765432', email:'pizza@demo.com' },
      images:  { cover:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200', logo:'https://ui-avatars.com/api/?name=PP&background=E53935&color=fff&size=100' },
      rating:  { average:4.3, count:180 },
      delivery:{ fee:60, estimatedTime:35, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:300 },
      status:  { isActive:true, isVerified:true, isFeatured:false },
      menu: [
        { id:'p1', _id:'p1', name:'Margherita Pizza (M)',  price:650, category:'main-course', description:'Tomato, mozzarella, basil', dietaryTags:['vegetarian'], spiceLevel:'mild', calories:760, isAvailable:true },
        { id:'p2', _id:'p2', name:'BBQ Chicken Pizza (M)', price:850, category:'main-course', description:'Smoky BBQ chicken',          dietaryTags:['halal'],       spiceLevel:'mild', calories:920, isAvailable:true },
        { id:'p3', _id:'p3', name:'Garlic Bread',          price:220, category:'appetizer',   description:'Toasted with garlic butter', dietaryTags:['vegetarian'], spiceLevel:'mild', calories:310, isAvailable:true },
        { id:'p4', _id:'p4', name:'Pasta Alfredo',         price:550, category:'main-course', description:'Creamy mushroom pasta',      dietaryTags:['vegetarian'], spiceLevel:'mild', calories:680, isAvailable:true },
        { id:'p5', _id:'p5', name:'Chocolate Lava Cake',   price:280, category:'dessert',     description:'Warm molten chocolate',      dietaryTags:['vegetarian'], spiceLevel:'mild', calories:420, isAvailable:true },
      ],
    },
    {
      owner_id: owner.id,
      name: 'Green Bowl — Vegan',
      description: 'Healthy plant-based meals with organic ingredients.',
      cuisine: ['Vegan','Healthy'],
      address: { street:'7 DHA Phase 6', city:'Karachi', state:'Sindh', zipCode:'75500', coordinates:{ lat:24.7861, lng:67.0595 } },
      contact: { phone:'02111223344', email:'greenbowl@demo.com' },
      images:  { cover:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200', logo:'https://ui-avatars.com/api/?name=GB&background=43A047&color=fff&size=100' },
      rating:  { average:4.9, count:95 },
      delivery:{ fee:40, estimatedTime:20, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:250 },
      status:  { isActive:true, isVerified:true, isFeatured:false },
      menu: [
        { id:'g1', _id:'g1', name:'Acai Bowl',     price:480, category:'main-course', description:'Acai with granola and fruit', dietaryTags:['vegan','gluten-free'], spiceLevel:'mild', calories:340, isAvailable:true },
        { id:'g2', _id:'g2', name:'Quinoa Salad',  price:420, category:'main-course', description:'Tri-colour quinoa, tahini',   dietaryTags:['vegan','gluten-free'], spiceLevel:'mild', calories:290, isAvailable:true },
        { id:'g3', _id:'g3', name:'Avocado Toast', price:350, category:'appetizer',   description:'Sourdough with avocado',     dietaryTags:['vegan'],               spiceLevel:'mild', calories:380, isAvailable:true },
        { id:'g4', _id:'g4', name:'Green Smoothie',price:280, category:'beverage',    description:'Spinach, banana, almond',    dietaryTags:['vegan','gluten-free'], spiceLevel:'mild', calories:210, isAvailable:true },
      ],
    },
    {
      owner_id: owner.id,
      name: 'Halal Biryani Corner',
      description: 'Authentic dum biryani cooked slow and smoky.',
      cuisine: ['Pakistani','Rice'],
      address: { street:'88 Tariq Road', city:'Karachi', state:'Sindh', zipCode:'74800', coordinates:{ lat:24.8745, lng:67.0425 } },
      contact: { phone:'02133445566', email:'biryani@demo.com' },
      images:  { cover:'https://images.unsplash.com/photo-1563379091339-03246963d52a?w=1200', logo:'https://ui-avatars.com/api/?name=HBC&background=F57F17&color=fff&size=100' },
      rating:  { average:4.5, count:540 },
      delivery:{ fee:30, estimatedTime:30, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:150 },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'b1', _id:'b1', name:'Chicken Biryani (Full)', price:600, category:'main-course', description:'Full pot dum biryani (serves 2)', dietaryTags:['halal'], spiceLevel:'medium', calories:850, isAvailable:true },
        { id:'b2', _id:'b2', name:'Beef Biryani (Half)',    price:450, category:'main-course', description:'Half portion smoky beef',         dietaryTags:['halal'], spiceLevel:'hot',    calories:620, isAvailable:true },
        { id:'b3', _id:'b3', name:'Raita',                 price:60,  category:'appetizer',   description:'Yogurt with cucumber and mint',   dietaryTags:['vegetarian'], spiceLevel:'mild', calories:80, isAvailable:true },
        { id:'b4', _id:'b4', name:'Kheer',                 price:100, category:'dessert',     description:'Pakistani rice pudding',          dietaryTags:['vegetarian'], spiceLevel:'mild', calories:220, isAvailable:true },
      ],
    },
    {
      owner_id: owner.id,
      name: 'Burger Bros',
      description: 'Smash burgers made fresh to order. No frozen patties.',
      cuisine: ['Burgers','American'],
      address: { street:'21 Gulshan-e-Iqbal', city:'Karachi', state:'Sindh', zipCode:'75300', coordinates:{ lat:24.9216, lng:67.0925 } },
      contact: { phone:'02155667788', email:'burgers@demo.com' },
      images:  { cover:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200', logo:'https://ui-avatars.com/api/?name=BB&background=795548&color=fff&size=100' },
      rating:  { average:4.2, count:210 },
      delivery:{ fee:55, estimatedTime:28, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:400 },
      status:  { isActive:true, isVerified:false, isFeatured:false },
      menu: [
        { id:'u1', _id:'u1', name:'Classic Smash Burger',  price:520, category:'main-course', description:'Double patty, cheese, secret sauce', dietaryTags:['halal'], spiceLevel:'mild',   calories:740, isAvailable:true },
        { id:'u2', _id:'u2', name:'Spicy Crispy Chicken',  price:480, category:'main-course', description:'Crispy thigh, jalapeños, sriracha',  dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true },
        { id:'u3', _id:'u3', name:'Loaded Fries',          price:280, category:'appetizer',   description:'Fries with cheese and jalapeños',    dietaryTags:['vegetarian'], spiceLevel:'medium', calories:560, isAvailable:true },
        { id:'u4', _id:'u4', name:'Chocolate Shake',       price:240, category:'beverage',    description:'Thick chocolate milkshake',          dietaryTags:['vegetarian'], spiceLevel:'mild', calories:480, isAvailable:true },
      ],
    },
  ];

  for (const r of restaurants) {
    const { data, error } = await supabase.from('restaurants').insert(r).select('id,name').single();
    if (error) console.error(`Error: ${r.name}:`, error.message);
    else console.log(`Created: ${data.name} (${data.id})`);
  }

  console.log('\nAll restaurants seeded!');
  process.exit(0);
})();
