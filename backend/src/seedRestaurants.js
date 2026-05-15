require('dotenv').config();
const supabase = require('./config/supabase');
const User     = require('./models/User');

const IMG = (p, w = 800) => `https://images.unsplash.com/${p}?w=${w}&auto=format&fit=crop&q=80`;
const LOCAL = (p) => p; // already absolute /brands/... paths served from frontend

// Curated, license-free Unsplash photos.
const PIC = {
  // Restaurant covers
  cover_kfc:        IMG('photo-1626082927389-6cd097cdc6ec', 1200),
  cover_pizza:      IMG('photo-1565299624946-b28f40a0ae38', 1200),
  cover_layers:     IMG('photo-1568901346375-23c9450c58cd', 1200),
  cover_burger:     IMG('photo-1571091655789-405eb7a3a3a8', 1200),
  cover_karahi:     IMG('photo-1602030638412-bb8dcc0bc8b0', 1200),

  // KFC-style fried chicken
  zingerBurger:     IMG('photo-1626082927389-6cd097cdc6ec'),
  hotCrispy:        IMG('photo-1626700051175-6818013e1d4f'),
  twister:          IMG('photo-1631898037624-de15a98a8b75'),
  krunchBurger:     IMG('photo-1606755962773-d324e0a13086'),
  chizza:           IMG('photo-1604068549290-dea0e4a305ca'),
  bonelessStrips:   IMG('photo-1608039755401-742074f0548d'),
  rice_n_spice:     IMG('photo-1567188040759-fb8a883dc6d8'),
  pepsi:            IMG('photo-1625772299848-391b6a87d7b3'),

  // Cheezious — pizza
  margherita:       IMG('photo-1604068549290-dea0e4a305ca'),
  pepperoniPizza:   IMG('photo-1565299624946-b28f40a0ae38'),
  bbqChickenPizza:  IMG('photo-1571066811602-716837d681de'),
  cheesyBites:      IMG('photo-1573140247632-f8fd74997d5c'),
  garlicBread:      IMG('photo-1573140247632-f8fd74997d5c'),
  pastaAlfredo:     IMG('photo-1645112411341-6c4fd023714a'),
  lavaCake:         IMG('photo-1624353365286-3f8d62daad51'),

  // Layers — burgers / fast food
  cheeseBurger:     IMG('photo-1568901346375-23c9450c58cd'),
  smokeyBeef:       IMG('photo-1568901346375-23c9450c58cd'),
  crispyChicken:    IMG('photo-1626082927389-6cd097cdc6ec'),
  cheeseSticks:     IMG('photo-1573080496219-bb080dd4f877'),
  loadedFries:      IMG('photo-1573080496219-bb080dd4f877'),
  chocoShake:       IMG('photo-1572490122747-3968b75cc699'),

  // Burger Lab
  labBurger:        IMG('photo-1571091655789-405eb7a3a3a8'),
  veggieBurger:     IMG('photo-1551782450-a2132b4ba21d'),
  cheesyFries:      IMG('photo-1573080496219-bb080dd4f877'),

  // Famous Karahi House (desi)
  chickenKarahi:    IMG('photo-1567188040759-fb8a883dc6d8'),
  muttonKarahi:     IMG('photo-1574484284002-952d92456975'),
  beefNihari:       IMG('photo-1574484284002-952d92456975'),
  seekhKebab:       IMG('photo-1599487488170-d11ec9c172f0'),
  bbqPlatter:       IMG('photo-1602030638412-bb8dcc0bc8b0'),
  chickenTikka:     IMG('photo-1610057099431-d73a1c9d2f2f'),
  chickenBiryani:   IMG('photo-1563379091339-03b21ab4a4f8'),
  beefBiryani:      IMG('photo-1631452180519-c014fe946bc7'),
  raita:            IMG('photo-1626200926749-cc8e8a3e0b22'),
  mangoLassi:       IMG('photo-1626200419199-391ae4be7a41'),
  kheer:            IMG('photo-1605197948919-3acd728d3c4d'),
  gulabJamun:       IMG('photo-1601050690597-df0568f70950'),
};

const ADDON = {
  raita:        { id:'a-raita',     name:'Raita (60g)',         price:60  },
  salad:        { id:'a-salad',     name:'Fresh Salad',         price:80  },
  shami:        { id:'a-shami',     name:'Shami Kebab (1pc)',   price:120 },
  papad:        { id:'a-papad',     name:'Crispy Papad',        price:40  },
  largeDrink:   { id:'a-large',     name:'Make it large',       price:80  },
  bottle1_5L:   { id:'a-bottle',    name:'1.5L bottle',         price:180 },
  extraSauce:   { id:'a-sauce',     name:'Garlic sauce',        price:30  },
  cheese:       { id:'a-cheese',    name:'Extra cheese',        price:90  },
};

const baseAddr = (street) => ({ street, city:'Lahore', state:'Punjab', zipCode:'54000', coordinates:{ lat:31.5204, lng:74.3587 } });

(async () => {
  const owner = await User.findByEmail('restaurant@demo.com');
  if (!owner) { console.error('Run seedDemoUsers first'); process.exit(1); }

  // We can't blindly delete restaurants — orders.restaurant_id has a FK
  // with no ON DELETE, so rows with order history can't be removed.
  // Instead we upsert by name: existing rows get updated in place, new
  // ones get inserted. Order history is preserved.

  const restaurants = [
    // ─── 1. Famous Karahi House — owned by restaurant@demo.com ──────────────
    // This is THE restaurant the demo restaurant user manages from their dashboard.
    {
      owner_id: owner.id,
      name: 'Famous Karahi House',
      description: 'Authentic Lahori karahi · charcoal BBQ · biryani · slow-cooked nihari. Family-run since 1998.',
      cuisine: ['Pakistani','BBQ','Biryani','Desi'],
      address: baseAddr('Liberty Market, Gulberg III'),
      contact: { phone:'042111223344', email:'famouskarahi@demo.com' },
      images:  { cover: PIC.cover_karahi, logo: 'https://ui-avatars.com/api/?name=FK&background=E53935&color=fff&size=200&bold=true' },
      rating:  { average:4.7, count:3850 },
      delivery:{ fee:79, saverFee:39, estimatedTime:25, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:300, tier:2, discount:{ upTo:15 } },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'fk1', _id:'fk1', name:'Chicken Karahi (Half)', price:950,  category:'main-course', description:'Slow-cooked with tomatoes, ginger, green chillies', dietaryTags:['halal'], spiceLevel:'hot',    calories:520, isAvailable:true, image:PIC.chickenKarahi },
        { id:'fk2', _id:'fk2', name:'Mutton Karahi (Half)',  price:1450, category:'main-course', description:'Tender mutton in fragrant masala',                  dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true, image:PIC.muttonKarahi },
        { id:'fk3', _id:'fk3', name:'Beef Nihari',           price:680,  category:'main-course', description:'Slow-cooked overnight stew · ginger garnish',       dietaryTags:['halal'], spiceLevel:'hot',    calories:720, isAvailable:true, image:PIC.beefNihari },
        { id:'fk4', _id:'fk4', name:'Chicken Biryani (Full)',price:560,  category:'main-course', description:'Full pot dum biryani · serves 2',                  dietaryTags:['halal'], spiceLevel:'medium', calories:850, isAvailable:true, image:PIC.chickenBiryani, addOns:[ADDON.raita, ADDON.salad, ADDON.shami] },
        { id:'fk5', _id:'fk5', name:'Beef Biryani (Full)',   price:620,  category:'main-course', description:'Slow-cooked smoky beef biryani',                   dietaryTags:['halal'], spiceLevel:'hot',    calories:920, isAvailable:true, image:PIC.beefBiryani,    addOns:[ADDON.raita, ADDON.salad, ADDON.shami] },
        { id:'fk6', _id:'fk6', name:'BBQ Platter for 2',     price:1850, category:'main-course', description:'Tikka · seekh · malai boti · naan',                dietaryTags:['halal'], spiceLevel:'medium', calories:1120, isAvailable:true, image:PIC.bbqPlatter },
        { id:'fk7', _id:'fk7', name:'Chicken Tikka',         price:550,  category:'appetizer',   description:'Marinated overnight, char-grilled',                dietaryTags:['halal'], spiceLevel:'medium', calories:380, isAvailable:true, image:PIC.chickenTikka },
        { id:'fk8', _id:'fk8', name:'Seekh Kebab (6pcs)',    price:520,  category:'appetizer',   description:'Juicy minced kebabs · mint chutney',               dietaryTags:['halal'], spiceLevel:'medium', calories:380, isAvailable:true, image:PIC.seekhKebab },
        { id:'fk9', _id:'fk9', name:'Raita',                 price:80,   category:'appetizer',   description:'Yogurt · cucumber · mint',                         dietaryTags:['vegetarian'], spiceLevel:'mild', calories:80, isAvailable:true, image:PIC.raita },
        { id:'fk10',_id:'fk10',name:'Mango Lassi',           price:180,  category:'beverage',    description:'Chilled mango yogurt drink',                       dietaryTags:['vegetarian'], spiceLevel:'mild', calories:180, isAvailable:true, image:PIC.mangoLassi, addOns:[ADDON.largeDrink] },
        { id:'fk11',_id:'fk11',name:'Kheer',                 price:120,  category:'dessert',     description:'Pakistani rice pudding',                           dietaryTags:['vegetarian'], spiceLevel:'mild', calories:220, isAvailable:true, image:PIC.kheer },
        { id:'fk12',_id:'fk12',name:'Gulab Jamun (4pcs)',    price:200,  category:'dessert',     description:'Soft milk dumplings in syrup',                     dietaryTags:['vegetarian'], spiceLevel:'mild', calories:380, isAvailable:true, image:PIC.gulabJamun },
      ],
    },

    // ─── 2. KFC — branded chain (no owner) ────────────────────────────────
    {
      owner_id: null,
      name: 'KFC',
      description: 'Finger lickin\' good. Hot crispy chicken, zingers, and the original 11 secret herbs & spices.',
      cuisine: ['Fast Food','Fried Chicken'],
      address: baseAddr('Y Block, DHA Phase 3'),
      contact: { phone:'042111532532', email:'support@kfc.com.pk' },
      images:  { cover: PIC.cover_kfc, logo: 'https://ui-avatars.com/api/?name=KFC&background=B91C1C&color=fff&size=200&bold=true' },
      rating:  { average:4.5, count:8240 },
      delivery:{ fee:99, saverFee:49, estimatedTime:30, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:400, tier:2, discount:{ upTo:20 } },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'kfc1', _id:'kfc1', name:'Zinger Burger',           price:520, category:'main-course', description:'Marinated crispy chicken fillet · zinger sauce',  dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true, image:PIC.zingerBurger, addOns:[ADDON.cheese] },
        { id:'kfc2', _id:'kfc2', name:'Mighty Zinger',           price:760, category:'main-course', description:'Double zinger · cheese · bacon · iceberg',        dietaryTags:['halal'], spiceLevel:'hot',    calories:980, isAvailable:true, image:PIC.zingerBurger },
        { id:'kfc3', _id:'kfc3', name:'Hot & Crispy Chicken (3pcs)', price:780, category:'main-course', description:'Original recipe — 11 secret herbs & spices',  dietaryTags:['halal'], spiceLevel:'medium', calories:920, isAvailable:true, image:PIC.hotCrispy },
        { id:'kfc4', _id:'kfc4', name:'Krunch Burger',           price:340, category:'main-course', description:'Crispy chicken patty · mayo · lettuce',           dietaryTags:['halal'], spiceLevel:'medium', calories:520, isAvailable:true, image:PIC.krunchBurger },
        { id:'kfc5', _id:'kfc5', name:'Twister',                 price:520, category:'main-course', description:'Tortilla wrap · crispy chicken · sauce',          dietaryTags:['halal'], spiceLevel:'medium', calories:620, isAvailable:true, image:PIC.twister },
        { id:'kfc6', _id:'kfc6', name:'Chizza',                  price:680, category:'main-course', description:'Crispy chicken base · cheese · pepperoni',         dietaryTags:['halal'], spiceLevel:'medium', calories:780, isAvailable:true, image:PIC.chizza },
        { id:'kfc7', _id:'kfc7', name:'Boneless Strips (5pcs)',  price:560, category:'appetizer',   description:'Tender · crunchy · dippable',                     dietaryTags:['halal'], spiceLevel:'medium', calories:520, isAvailable:true, image:PIC.bonelessStrips, addOns:[ADDON.extraSauce] },
        { id:'kfc8', _id:'kfc8', name:'Hot Wings (8pcs)',        price:620, category:'appetizer',   description:'Crispy spicy wings',                              dietaryTags:['halal'], spiceLevel:'hot',    calories:480, isAvailable:true, image:PIC.bonelessStrips },
        { id:'kfc9', _id:'kfc9', name:'Rice & Spice',            price:340, category:'main-course', description:'Spiced rice · crispy chicken topping',            dietaryTags:['halal'], spiceLevel:'medium', calories:580, isAvailable:true, image:PIC.rice_n_spice },
        { id:'kfc10',_id:'kfc10',name:'Pepsi (Regular)',         price:120, category:'beverage',    description:'Chilled · 345ml',                                  dietaryTags:['vegetarian'], spiceLevel:'mild', calories:140, isAvailable:true, image:PIC.pepsi, addOns:[ADDON.largeDrink, ADDON.bottle1_5L] },
      ],
    },

    // ─── 3. Cheezious — pizza chain (no owner) ────────────────────────────
    {
      owner_id: null,
      name: 'Cheezious',
      description: 'Melt-in-mouth cheese · hand-tossed dough · loaded toppings. Pakistan\'s favourite pizza.',
      cuisine: ['Pizza','Italian','Fast Food'],
      address: baseAddr('M.M. Alam Road, Gulberg III'),
      contact: { phone:'04211111CHE', email:'orders@cheezious.com' },
      images:  { cover: PIC.cover_pizza, logo: 'https://ui-avatars.com/api/?name=Cheezious&background=FFC107&color=000&size=200&bold=true' },
      rating:  { average:4.6, count:6320 },
      delivery:{ fee:99, saverFee:49, estimatedTime:35, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:500, tier:3, discount:{ upTo:30 } },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'ch1', _id:'ch1', name:'Margherita Pizza (Medium)',   price:990,  category:'main-course', description:'Tomato · mozzarella · basil',                dietaryTags:['vegetarian'], spiceLevel:'mild', calories:760, isAvailable:true, image:PIC.margherita,      addOns:[ADDON.cheese] },
        { id:'ch2', _id:'ch2', name:'Pepperoni Pizza (Medium)',    price:1290, category:'main-course', description:'Halal beef pepperoni · mozzarella',          dietaryTags:['halal'],       spiceLevel:'medium', calories:880, isAvailable:true, image:PIC.pepperoniPizza,  addOns:[ADDON.cheese] },
        { id:'ch3', _id:'ch3', name:'BBQ Chicken Pizza (Medium)',  price:1290, category:'main-course', description:'BBQ chicken · onions · jalapeños',           dietaryTags:['halal'],       spiceLevel:'medium', calories:920, isAvailable:true, image:PIC.bbqChickenPizza, addOns:[ADDON.cheese] },
        { id:'ch4', _id:'ch4', name:'Cheesy Bites Pizza',          price:1490, category:'main-course', description:'Crust stuffed with cheese bites',            dietaryTags:['halal'],       spiceLevel:'mild', calories:1080, isAvailable:true, image:PIC.cheesyBites },
        { id:'ch5', _id:'ch5', name:'Garlic Bread (8pcs)',         price:340,  category:'appetizer',   description:'Buttered garlic bread sticks',               dietaryTags:['vegetarian'], spiceLevel:'mild', calories:380, isAvailable:true, image:PIC.garlicBread, addOns:[ADDON.extraSauce] },
        { id:'ch6', _id:'ch6', name:'Pasta Alfredo',               price:780,  category:'main-course', description:'Creamy mushroom alfredo',                    dietaryTags:['vegetarian'], spiceLevel:'mild', calories:680, isAvailable:true, image:PIC.pastaAlfredo },
        { id:'ch7', _id:'ch7', name:'Chocolate Lava Cake',         price:380,  category:'dessert',     description:'Warm molten chocolate centre',               dietaryTags:['vegetarian'], spiceLevel:'mild', calories:420, isAvailable:true, image:PIC.lavaCake },
      ],
    },

    // ─── 4. Layers — burger chain (no owner) ──────────────────────────────
    {
      owner_id: null,
      name: 'Layers',
      description: 'Premium smashed burgers · brioche buns · house-aged beef · loaded fries.',
      cuisine: ['Burgers','Fast Food'],
      address: baseAddr('Phase 5 DHA, Sector C'),
      contact: { phone:'042111003003', email:'hello@layers.pk' },
      images:  { cover: PIC.cover_layers, logo: LOCAL('/brands/layers.jpg') },
      rating:  { average:4.6, count:4180 },
      delivery:{ fee:89, saverFee:39, estimatedTime:25, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:500, tier:3, discount:{ upTo:15 } },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'ly1', _id:'ly1', name:'Cheese Burger',         price:680,  category:'main-course', description:'Smashed beef patty · American cheese · pickles', dietaryTags:['halal'], spiceLevel:'mild',   calories:740, isAvailable:true, image:PIC.cheeseBurger, addOns:[ADDON.cheese] },
        { id:'ly2', _id:'ly2', name:'Smokey Beef Burger',    price:780,  category:'main-course', description:'Smoked beef · cheddar · BBQ sauce',              dietaryTags:['halal'], spiceLevel:'medium', calories:820, isAvailable:true, image:PIC.smokeyBeef },
        { id:'ly3', _id:'ly3', name:'Crispy Chicken Burger', price:640,  category:'main-course', description:'Crispy thigh · slaw · spicy mayo',               dietaryTags:['halal'], spiceLevel:'hot',    calories:780, isAvailable:true, image:PIC.crispyChicken },
        { id:'ly4', _id:'ly4', name:'Cheese Sticks (6pcs)',  price:380,  category:'appetizer',   description:'Crispy outside · stretchy mozzarella inside',    dietaryTags:['vegetarian'], spiceLevel:'mild', calories:520, isAvailable:true, image:PIC.cheeseSticks },
        { id:'ly5', _id:'ly5', name:'Loaded Fries',          price:380,  category:'appetizer',   description:'Cheese sauce · jalapeños · crispy onions',       dietaryTags:['vegetarian'], spiceLevel:'medium', calories:560, isAvailable:true, image:PIC.loadedFries },
        { id:'ly6', _id:'ly6', name:'Chocolate Shake',       price:340,  category:'beverage',    description:'Thick chocolate milkshake',                      dietaryTags:['vegetarian'], spiceLevel:'mild', calories:480, isAvailable:true, image:PIC.chocoShake, addOns:[ADDON.largeDrink] },
      ],
    },

    // ─── 5. Burger Lab — burger chain (no owner) ──────────────────────────
    {
      owner_id: null,
      name: 'Burger Lab',
      description: 'Lab-tested patties · house sauces · vegetarian options · always fresh.',
      cuisine: ['Burgers','Fast Food'],
      address: baseAddr('I.I. Chundrigar Road'),
      contact: { phone:'042111900900', email:'orders@burgerlab.pk' },
      images:  { cover: PIC.cover_burger, logo: LOCAL('/brands/burgerlab.jpg') },
      rating:  { average:4.5, count:2950 },
      delivery:{ fee:79, saverFee:39, estimatedTime:22, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:400, tier:2, discount:{ upTo:25 } },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'bl1', _id:'bl1', name:'Lab Burger',           price:580, category:'main-course', description:'Signature beef patty · lab sauce · cheese',  dietaryTags:['halal'], spiceLevel:'mild',   calories:760, isAvailable:true, image:PIC.labBurger, addOns:[ADDON.cheese] },
        { id:'bl2', _id:'bl2', name:'Crispy Chicken Burger',price:520, category:'main-course', description:'Crispy thigh · slaw · ranch',                dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true, image:PIC.crispyChicken },
        { id:'bl3', _id:'bl3', name:'Vegetable Burger',     price:420, category:'main-course', description:'House-made veggie patty · mayo · lettuce',   dietaryTags:['vegetarian'], spiceLevel:'mild', calories:520, isAvailable:true, image:PIC.veggieBurger },
        { id:'bl4', _id:'bl4', name:'Cheesy Fries',         price:340, category:'appetizer',   description:'Crinkle fries · cheese sauce',               dietaryTags:['vegetarian'], spiceLevel:'mild', calories:540, isAvailable:true, image:PIC.cheesyFries },
        { id:'bl5', _id:'bl5', name:'Chocolate Shake',      price:280, category:'beverage',    description:'Cold thick chocolate shake',                 dietaryTags:['vegetarian'], spiceLevel:'mild', calories:420, isAvailable:true, image:PIC.chocoShake, addOns:[ADDON.largeDrink] },
      ],
    },
  ];

  // For the owner's restaurant: prefer to UPDATE the existing one so
  // findByOwner keeps returning a single row. For brand chains: upsert by name.
  const ownedDef = restaurants.find(r => r.owner_id === owner.id);
  const brandDefs = restaurants.filter(r => r.owner_id !== owner.id);

  // ── owned restaurant ──────────────────────────────────────────────
  const { data: existingOwned } = await supabase.from('restaurants').select('id,name').eq('owner_id', owner.id);
  if (existingOwned && existingOwned.length > 0) {
    // Update the first one in place; mark any extras as inactive so they
    // don't pollute findByOwner / the public list.
    const [primary, ...extras] = existingOwned;
    const { error } = await supabase.from('restaurants').update(ownedDef).eq('id', primary.id);
    if (error) console.error(`Update ${ownedDef.name}:`, error.message);
    else console.log(`Updated: ${ownedDef.name} (${primary.id}, was "${primary.name}")`);
    for (const ex of extras) {
      await supabase.from('restaurants').update({ status: { isActive: false, isVerified: false, isFeatured: false } }).eq('id', ex.id);
      console.log(`Deactivated extra: ${ex.name} (${ex.id})`);
    }
  } else {
    const { data, error } = await supabase.from('restaurants').insert(ownedDef).select('id,name').single();
    if (error) console.error(`Insert ${ownedDef.name}:`, error.message);
    else console.log(`Created: ${data.name} (${data.id})`);
  }

  // ── brand chains: upsert by name ──────────────────────────────────
  for (const r of brandDefs) {
    const { data: hit } = await supabase.from('restaurants').select('id').eq('name', r.name).maybeSingle();
    if (hit) {
      const { error } = await supabase.from('restaurants').update(r).eq('id', hit.id);
      if (error) console.error(`Update ${r.name}:`, error.message);
      else console.log(`Updated: ${r.name} (${hit.id})`);
    } else {
      const { data, error } = await supabase.from('restaurants').insert(r).select('id,name').single();
      if (error) console.error(`Insert ${r.name}:`, error.message);
      else console.log(`Created: ${data.name} (${data.id})`);
    }
  }

  console.log('\nAll restaurants seeded! restaurant@demo.com owns "Famous Karahi House" and can manage its menu from the dashboard.');
  process.exit(0);
})();
