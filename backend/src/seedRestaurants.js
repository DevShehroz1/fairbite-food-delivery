require('dotenv').config();
const supabase = require('./config/supabase');
const User     = require('./models/User');

const IMG = (p, w = 800) => `https://images.unsplash.com/${p}?w=${w}&auto=format&fit=crop&q=80`;

// Hand-picked, license-free Unsplash photos that match Pakistani/desi
// restaurant cards well. Keep this list near the top so it's easy to swap.
const PIC = {
  // Restaurant covers
  cover_bbq:        IMG('photo-1602030638412-bb8dcc0bc8b0', 1200), // grilled skewers
  cover_biryani:    IMG('photo-1631452180519-c014fe946bc7', 1200), // biryani plate
  cover_broast:     IMG('photo-1626082927389-6cd097cdc6ec', 1200), // fried chicken
  cover_pizza:      IMG('photo-1565299624946-b28f40a0ae38', 1200), // pizza
  cover_burger:     IMG('photo-1568901346375-23c9450c58cd', 1200), // smash burger
  cover_paratha:    IMG('photo-1626700051175-6818013e1d4f', 1200), // paratha breakfast
  cover_chinese:    IMG('photo-1563379091339-03b21ab4a4f8', 1200), // chinese stir fry
  cover_dessert:    IMG('photo-1551024601-bec78aea704b', 1200),    // cake
  // Dish thumbnails
  chickenKarahi:    IMG('photo-1567188040759-fb8a883dc6d8'),
  muttonKarahi:     IMG('photo-1574484284002-952d92456975'),
  beefNihari:       IMG('photo-1574484284002-952d92456975'),
  seekhKebab:       IMG('photo-1599487488170-d11ec9c172f0'),
  bbqPlatter:       IMG('photo-1602030638412-bb8dcc0bc8b0'),
  chickenTikka:     IMG('photo-1610057099431-d73a1c9d2f2f'),
  chickenBiryani:   IMG('photo-1563379091339-03b21ab4a4f8'),
  beefBiryani:      IMG('photo-1631452180519-c014fe946bc7'),
  muttonBiryani:    IMG('photo-1589302168068-964664d93dc0'),
  prawnBiryani:     IMG('photo-1574894709920-11b28e7367e3'),
  raita:            IMG('photo-1626200926749-cc8e8a3e0b22'),
  kheer:            IMG('photo-1605197948919-3acd728d3c4d'),
  gulabJamun:       IMG('photo-1601050690597-df0568f70950'),
  mangoLassi:       IMG('photo-1626200419199-391ae4be7a41'),
  pepsi:            IMG('photo-1554866585-cd94860890b7'),
  broastChicken:    IMG('photo-1626082927389-6cd097cdc6ec'),
  zingerBurger:     IMG('photo-1626082929547-2a7e9b4d2e1c'),
  chickenWings:     IMG('photo-1608039755401-742074f0548d'),
  loadedFries:      IMG('photo-1573080496219-bb080dd4f877'),
  smashBurger:      IMG('photo-1568901346375-23c9450c58cd'),
  cheeseBurger:     IMG('photo-1571091718767-18b5b1457add'),
  crispyChicken:    IMG('photo-1626082927389-6cd097cdc6ec'),
  chocoShake:       IMG('photo-1572490122747-3968b75cc699'),
  margherita:       IMG('photo-1604068549290-dea0e4a305ca'),
  bbqPizza:         IMG('photo-1565299624946-b28f40a0ae38'),
  garlicBread:      IMG('photo-1573140247632-f8fd74997d5c'),
  pastaAlfredo:     IMG('photo-1645112411341-6c4fd023714a'),
  lavaCake:         IMG('photo-1624353365286-3f8d62daad51'),
  alooParatha:      IMG('photo-1626700051175-6818013e1d4f'),
  halwaPuri:        IMG('photo-1589302168068-964664d93dc0'),
  chana:            IMG('photo-1567188040759-fb8a883dc6d8'),
  chickenChowMein:  IMG('photo-1563379091339-03b21ab4a4f8'),
  chickenManchurian: IMG('photo-1582718415739-43cf6f1c5e75'),
  springRolls:      IMG('photo-1606851094291-7ef60d34ce91'),
  jasmineRice:      IMG('photo-1536304929831-ee1ca9d44906'),
  redVelvet:        IMG('photo-1586788011842-fc09b3fb7395'),
  brownie:          IMG('photo-1606313564200-e75d5e30476c'),
  cheesecake:       IMG('photo-1551024506-0bccd828d307'),
  iceCream:         IMG('photo-1551024506-0bccd828d307'),
};

const ADDON = {
  raita:        { id:'a-raita',     name:'Raita (60g)',         price:60  },
  salad:        { id:'a-salad',     name:'Fresh Salad',         price:80  },
  shami:        { id:'a-shami',     name:'Shami Kebab (1pc)',   price:120 },
  papad:        { id:'a-papad',     name:'Crispy Papad',        price:40  },
  largeDrink:   { id:'a-large',     name:'Make it large',       price:80  },
  bottle1_5L:   { id:'a-bottle',    name:'1.5L bottle',         price:180 },
  extraStraw:   { id:'a-straw',     name:'Extra straws',        price:0   },
  extraSauce:   { id:'a-sauce',     name:'Garlic sauce',        price:30  },
};

(async () => {
  const owner = await User.findByEmail('restaurant@demo.com');
  if (!owner) { console.error('Run seedDemoUsers first'); process.exit(1); }

  await supabase.from('restaurants').delete().eq('owner_id', owner.id);

  const baseAddr = (street) => ({ street, city:'Lahore', state:'Punjab', zipCode:'54000', coordinates:{ lat:31.5204, lng:74.3587 } });

  const restaurants = [
    // 1 — Munchies (Fast Food / Burgers) — matches Foodpanda hero card
    {
      owner_id: owner.id,
      name: 'Munchies F-6',
      description: 'Smash burgers, loaded fries, and zinger wraps. Crispy. Cheesy. Crowd-favourite.',
      cuisine: ['Fast Food','Burgers'],
      address: baseAddr('25-C Gulberg III, Lahore'),
      contact: { phone:'042111668888', email:'munchies@demo.com' },
      images:  { cover: PIC.cover_burger, logo: 'https://ui-avatars.com/api/?name=M&background=E53935&color=fff&size=200&bold=true' },
      rating:  { average:4.7, count:2150 },
      delivery:{ fee:79, saverFee:39, estimatedTime:20, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:200, tier:2 },
      discount:{ upTo:10 },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'mu1', _id:'mu1', name:'Classic Smash Burger', price:520, category:'main-course', description:'Double smashed patty · cheddar · QB sauce', dietaryTags:['halal'], spiceLevel:'mild',   calories:740, isAvailable:true, image:PIC.smashBurger },
        { id:'mu2', _id:'mu2', name:'Zinger Burger',         price:480, category:'main-course', description:'Crispy chicken · jalapeños · mayo',     dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true, image:PIC.zingerBurger },
        { id:'mu3', _id:'mu3', name:'Cheese Burger',         price:540, category:'main-course', description:'American cheese · pickles · onion',      dietaryTags:['halal'], spiceLevel:'mild',   calories:760, isAvailable:true, image:PIC.cheeseBurger },
        { id:'mu4', _id:'mu4', name:'Loaded Fries',          price:280, category:'appetizer',   description:'Fries · cheese sauce · jalapeños',       dietaryTags:['vegetarian'], spiceLevel:'medium', calories:560, isAvailable:true, image:PIC.loadedFries },
        { id:'mu5', _id:'mu5', name:'Buffalo Wings (6pcs)',  price:520, category:'appetizer',   description:'Tossed in spicy buffalo glaze',          dietaryTags:['halal'], spiceLevel:'hot',    calories:480, isAvailable:true, image:PIC.chickenWings },
        { id:'mu6', _id:'mu6', name:'Chocolate Shake',       price:240, category:'beverage',    description:'Thick chocolate milkshake',              dietaryTags:['vegetarian'], spiceLevel:'mild', calories:480, isAvailable:true, image:PIC.chocoShake, addOns:[ADDON.largeDrink, ADDON.bottle1_5L] },
      ],
    },

    // 2 — Bundu Khan style Pakistani BBQ
    {
      owner_id: owner.id,
      name: 'Lahori Tikka House',
      description: 'Charcoal BBQ · authentic Lahori karahi · fresh naan from the tandoor.',
      cuisine: ['Pakistani','BBQ'],
      address: baseAddr('Liberty Market, Gulberg III'),
      contact: { phone:'042111223344', email:'lahoritikka@demo.com' },
      images:  { cover: PIC.cover_bbq, logo: 'https://ui-avatars.com/api/?name=LT&background=E53935&color=fff&size=200&bold=true' },
      rating:  { average:4.6, count:3420 },
      delivery:{ fee:99, saverFee:49, estimatedTime:25, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:300, tier:3 },
      discount:{ upTo:15 },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'lt1', _id:'lt1', name:'Chicken Karahi (Half)', price:950,  category:'main-course', description:'Slow-cooked with tomatoes, ginger, green chillies', dietaryTags:['halal'], spiceLevel:'hot',    calories:520, isAvailable:true, image:PIC.chickenKarahi },
        { id:'lt2', _id:'lt2', name:'Mutton Karahi (Half)',  price:1450, category:'main-course', description:'Tender mutton in fragrant masala',                  dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true, image:PIC.muttonKarahi },
        { id:'lt3', _id:'lt3', name:'BBQ Platter for 2',     price:1850, category:'main-course', description:'Tikka · seekh · malai boti · naan',                 dietaryTags:['halal'], spiceLevel:'medium', calories:1120, isAvailable:true, image:PIC.bbqPlatter },
        { id:'lt4', _id:'lt4', name:'Chicken Tikka',         price:550,  category:'appetizer',   description:'Marinated overnight, char-grilled',                 dietaryTags:['halal'], spiceLevel:'medium', calories:380, isAvailable:true, image:PIC.chickenTikka },
        { id:'lt5', _id:'lt5', name:'Seekh Kebab (6pcs)',    price:520,  category:'appetizer',   description:'Juicy minced kebabs · mint chutney',                dietaryTags:['halal'], spiceLevel:'medium', calories:380, isAvailable:true, image:PIC.seekhKebab },
        { id:'lt6', _id:'lt6', name:'Beef Nihari',           price:680,  category:'main-course', description:'Slow-cooked overnight stew · ginger garnish',       dietaryTags:['halal'], spiceLevel:'hot',    calories:720, isAvailable:true, image:PIC.beefNihari },
        { id:'lt7', _id:'lt7', name:'Mango Lassi',           price:180,  category:'beverage',    description:'Chilled mango yogurt drink',                        dietaryTags:['vegetarian'], spiceLevel:'mild', calories:180, isAvailable:true, image:PIC.mangoLassi, addOns:[ADDON.largeDrink] },
      ],
    },

    // 3 — Biryani House
    {
      owner_id: owner.id,
      name: 'Karachi Biryani House',
      description: 'Pakistan\'s most loved chicken & beef biryani — Karachi style.',
      cuisine: ['Pakistani','Biryani','Rice'],
      address: baseAddr('Main Boulevard, Johar Town'),
      contact: { phone:'042111445566', email:'karachibiryani@demo.com' },
      images:  { cover: PIC.cover_biryani, logo: 'https://ui-avatars.com/api/?name=KB&background=F57F17&color=fff&size=200&bold=true' },
      rating:  { average:4.8, count:5800 },
      delivery:{ fee:69, saverFee:29, estimatedTime:22, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:150, tier:1 },
      discount:{ upTo:25 },
      status:  { isActive:true, isVerified:true, isFeatured:true },
      menu: [
        { id:'kb1', _id:'kb1', name:'Chicken Biryani (Full)', price:560, category:'main-course', description:'Full pot dum biryani · serves 2',     dietaryTags:['halal'], spiceLevel:'medium', calories:850, isAvailable:true, image:PIC.chickenBiryani, addOns:[ADDON.raita, ADDON.salad, ADDON.shami, ADDON.papad] },
        { id:'kb2', _id:'kb2', name:'Chicken Biryani (Half)', price:320, category:'main-course', description:'Single serving dum biryani',          dietaryTags:['halal'], spiceLevel:'medium', calories:520, isAvailable:true, image:PIC.chickenBiryani, addOns:[ADDON.raita, ADDON.salad, ADDON.papad] },
        { id:'kb3', _id:'kb3', name:'Beef Biryani (Full)',    price:620, category:'main-course', description:'Slow-cooked smoky beef biryani',      dietaryTags:['halal'], spiceLevel:'hot',    calories:920, isAvailable:true, image:PIC.beefBiryani,    addOns:[ADDON.raita, ADDON.salad, ADDON.shami, ADDON.papad] },
        { id:'kb4', _id:'kb4', name:'Mutton Biryani',         price:780, category:'main-course', description:'Tender mutton · saffron rice',        dietaryTags:['halal'], spiceLevel:'medium', calories:880, isAvailable:true, image:PIC.muttonBiryani,  addOns:[ADDON.raita, ADDON.salad, ADDON.shami] },
        { id:'kb5', _id:'kb5', name:'Prawn Biryani',          price:900, category:'main-course', description:'Coastal-style prawn biryani',         dietaryTags:['halal'], spiceLevel:'hot',    calories:780, isAvailable:true, image:PIC.prawnBiryani,   addOns:[ADDON.raita, ADDON.salad] },
        { id:'kb6', _id:'kb6', name:'Raita',                  price:80,  category:'appetizer',   description:'Yogurt with cucumber and mint',       dietaryTags:['vegetarian'], spiceLevel:'mild', calories:80, isAvailable:true, image:PIC.raita },
        { id:'kb7', _id:'kb7', name:'Raita + Salad',          price:120, category:'appetizer',   description:'Combo side — raita and fresh salad',  dietaryTags:['vegetarian'], spiceLevel:'mild', calories:120, isAvailable:true, image:PIC.raita },
        { id:'kb8', _id:'kb8', name:'Kheer',                  price:120, category:'dessert',     description:'Pakistani rice pudding',              dietaryTags:['vegetarian'], spiceLevel:'mild', calories:220, isAvailable:true, image:PIC.kheer },
      ],
    },

    // 4 — Broast / Fried Chicken
    {
      owner_id: owner.id,
      name: 'Al-Rehmat Broast',
      description: 'Lahore\'s favourite crispy broast chicken — secret 12-spice batter.',
      cuisine: ['Fast Food','Fried Chicken'],
      address: baseAddr('Wahdat Road, near UOL'),
      contact: { phone:'042111778899', email:'broast@demo.com' },
      images:  { cover: PIC.cover_broast, logo: 'https://ui-avatars.com/api/?name=AB&background=B91C1C&color=fff&size=200&bold=true' },
      rating:  { average:4.5, count:1820 },
      delivery:{ fee:89, saverFee:39, estimatedTime:24, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:250, tier:2 },
      discount:{ upTo:20 },
      status:  { isActive:true, isVerified:true, isFeatured:false },
      menu: [
        { id:'ar1', _id:'ar1', name:'Quarter Broast',        price:380, category:'main-course', description:'Crispy fried chicken · sesame bun · fries', dietaryTags:['halal'], spiceLevel:'medium', calories:680, isAvailable:true, image:PIC.broastChicken },
        { id:'ar2', _id:'ar2', name:'Half Broast',           price:680, category:'main-course', description:'Half chicken · fries · garlic sauce',       dietaryTags:['halal'], spiceLevel:'medium', calories:1180, isAvailable:true, image:PIC.broastChicken },
        { id:'ar3', _id:'ar3', name:'Crispy Wings (8pcs)',   price:620, category:'main-course', description:'Spicy crunchy wings · ranch dip',            dietaryTags:['halal'], spiceLevel:'hot',    calories:740, isAvailable:true, image:PIC.chickenWings },
        { id:'ar4', _id:'ar4', name:'Zinger Burger',         price:420, category:'main-course', description:'Crispy thigh · lettuce · spicy mayo',        dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true, image:PIC.zingerBurger },
        { id:'ar5', _id:'ar5', name:'Spicy Crispy Chicken',  price:480, category:'main-course', description:'Tender thigh · jalapeños · sriracha',        dietaryTags:['halal'], spiceLevel:'hot',    calories:680, isAvailable:true, image:PIC.crispyChicken },
        { id:'ar6', _id:'ar6', name:'Loaded Fries',          price:260, category:'appetizer',   description:'Fries with cheese sauce and jalapeños',     dietaryTags:['vegetarian'], spiceLevel:'medium', calories:560, isAvailable:true, image:PIC.loadedFries, addOns:[ADDON.extraSauce] },
      ],
    },

    // 5 — Pizza
    {
      owner_id: owner.id,
      name: 'Pizza Palace DHA',
      description: 'Wood-fired Italian pizza · fresh dough daily · authentic toppings.',
      cuisine: ['Pizza','Italian','Pasta'],
      address: baseAddr('DHA Phase 5, Lahore'),
      contact: { phone:'042111998877', email:'pizza@demo.com' },
      images:  { cover: PIC.cover_pizza, logo: 'https://ui-avatars.com/api/?name=PP&background=059669&color=fff&size=200&bold=true' },
      rating:  { average:4.4, count:1240 },
      delivery:{ fee:99, saverFee:49, estimatedTime:32, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:400, tier:3 },
      discount:{ upTo:30 },
      status:  { isActive:true, isVerified:true, isFeatured:false },
      menu: [
        { id:'pp1', _id:'pp1', name:'Margherita Pizza (M)', price:850,  category:'main-course', description:'Tomato · mozzarella · fresh basil',     dietaryTags:['vegetarian'], spiceLevel:'mild', calories:760, isAvailable:true, image:PIC.margherita },
        { id:'pp2', _id:'pp2', name:'BBQ Chicken Pizza (M)',price:1150, category:'main-course', description:'BBQ chicken · onions · jalapeños',      dietaryTags:['halal'], spiceLevel:'medium', calories:920, isAvailable:true, image:PIC.bbqPizza },
        { id:'pp3', _id:'pp3', name:'Pepperoni Pizza (M)',  price:1100, category:'main-course', description:'Halal beef pepperoni · cheese pull',    dietaryTags:['halal'], spiceLevel:'medium', calories:880, isAvailable:true, image:PIC.bbqPizza },
        { id:'pp4', _id:'pp4', name:'Garlic Bread',         price:280,  category:'appetizer',   description:'Buttery garlic bread · 6 pieces',       dietaryTags:['vegetarian'], spiceLevel:'mild', calories:310, isAvailable:true, image:PIC.garlicBread, addOns:[ADDON.extraSauce] },
        { id:'pp5', _id:'pp5', name:'Pasta Alfredo',        price:720,  category:'main-course', description:'Creamy mushroom alfredo',               dietaryTags:['vegetarian'], spiceLevel:'mild', calories:680, isAvailable:true, image:PIC.pastaAlfredo },
        { id:'pp6', _id:'pp6', name:'Chocolate Lava Cake',  price:320,  category:'dessert',     description:'Warm molten chocolate centre',          dietaryTags:['vegetarian'], spiceLevel:'mild', calories:420, isAvailable:true, image:PIC.lavaCake },
      ],
    },

    // 6 — Halwa Puri / Breakfast
    {
      owner_id: owner.id,
      name: 'Halwa Puri Junction',
      description: 'Sunday morning halwa puri · paratha · channa — Lahore breakfast classic.',
      cuisine: ['Pakistani','Breakfast'],
      address: baseAddr('Mozang Chungi, Lahore'),
      contact: { phone:'042111665544', email:'breakfast@demo.com' },
      images:  { cover: PIC.cover_paratha, logo: 'https://ui-avatars.com/api/?name=HP&background=F59E0B&color=fff&size=200&bold=true' },
      rating:  { average:4.6, count:980 },
      delivery:{ fee:59, saverFee:19, estimatedTime:18, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:150, tier:1 },
      discount:{ upTo:0 },
      status:  { isActive:true, isVerified:true, isFeatured:false },
      menu: [
        { id:'hp1', _id:'hp1', name:'Halwa Puri Plate',     price:220, category:'main-course', description:'Sooji halwa · 2 puris · channa',  dietaryTags:['vegetarian'], spiceLevel:'mild', calories:680, isAvailable:true, image:PIC.halwaPuri },
        { id:'hp2', _id:'hp2', name:'Aloo Paratha',         price:160, category:'main-course', description:'Stuffed paratha · butter · yogurt', dietaryTags:['vegetarian'], spiceLevel:'mild', calories:520, isAvailable:true, image:PIC.alooParatha },
        { id:'hp3', _id:'hp3', name:'Channa Cholay',        price:180, category:'main-course', description:'Spiced chickpeas · onion · lemon',  dietaryTags:['vegetarian'], spiceLevel:'medium', calories:380, isAvailable:true, image:PIC.chana },
        { id:'hp4', _id:'hp4', name:'Lassi (Sweet)',        price:140, category:'beverage',    description:'Chilled yogurt drink',              dietaryTags:['vegetarian'], spiceLevel:'mild', calories:220, isAvailable:true, image:PIC.mangoLassi, addOns:[ADDON.largeDrink] },
        { id:'hp5', _id:'hp5', name:'Gulab Jamun (4pcs)',   price:200, category:'dessert',     description:'Soft milk dumplings in syrup',      dietaryTags:['vegetarian'], spiceLevel:'mild', calories:380, isAvailable:true, image:PIC.gulabJamun },
      ],
    },

    // 7 — Chinese
    {
      owner_id: owner.id,
      name: 'Dragon Wok',
      description: 'Wok-fried Chinese · house Manchurian · dim sum on weekends.',
      cuisine: ['Chinese','Asian'],
      address: baseAddr('M. M. Alam Road, Gulberg III'),
      contact: { phone:'042111443322', email:'chinese@demo.com' },
      images:  { cover: PIC.cover_chinese, logo: 'https://ui-avatars.com/api/?name=DW&background=DC2626&color=fff&size=200&bold=true' },
      rating:  { average:4.3, count:740 },
      delivery:{ fee:109, saverFee:59, estimatedTime:28, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:500, tier:3 },
      discount:{ upTo:15 },
      status:  { isActive:true, isVerified:true, isFeatured:false },
      menu: [
        { id:'dw1', _id:'dw1', name:'Chicken Chow Mein',    price:580, category:'main-course', description:'Stir-fried noodles · veggies',         dietaryTags:['halal'], spiceLevel:'mild',   calories:680, isAvailable:true, image:PIC.chickenChowMein },
        { id:'dw2', _id:'dw2', name:'Chicken Manchurian',   price:620, category:'main-course', description:'Sweet-spicy gravy · sesame seeds',     dietaryTags:['halal'], spiceLevel:'medium', calories:620, isAvailable:true, image:PIC.chickenManchurian },
        { id:'dw3', _id:'dw3', name:'Spring Rolls (6pcs)',  price:340, category:'appetizer',   description:'Crispy veggie rolls · sweet chilli',   dietaryTags:['vegetarian'], spiceLevel:'mild', calories:320, isAvailable:true, image:PIC.springRolls },
        { id:'dw4', _id:'dw4', name:'Jasmine Rice',         price:220, category:'main-course', description:'Steamed long-grain rice',              dietaryTags:['vegan'], spiceLevel:'mild', calories:360, isAvailable:true, image:PIC.jasmineRice },
      ],
    },

    // 8 — Desserts / Sweet
    {
      owner_id: owner.id,
      name: 'Sweet Spot Bakery',
      description: 'Fresh cakes · brownies · cheesecake — baked every morning.',
      cuisine: ['Dessert','Bakery'],
      address: baseAddr('MM Alam Road, Gulberg III'),
      contact: { phone:'042111662200', email:'sweets@demo.com' },
      images:  { cover: PIC.cover_dessert, logo: 'https://ui-avatars.com/api/?name=SS&background=DB2777&color=fff&size=200&bold=true' },
      rating:  { average:4.7, count:430 },
      delivery:{ fee:99, saverFee:49, estimatedTime:25, isAvailable:true },
      pricing: { commissionRate:15, minimumOrder:300, tier:2 },
      discount:{ upTo:10 },
      status:  { isActive:true, isVerified:true, isFeatured:false },
      menu: [
        { id:'ss1', _id:'ss1', name:'Red Velvet Slice',     price:420, category:'dessert', description:'Cream cheese frosting · moist sponge',   dietaryTags:['vegetarian'], spiceLevel:'mild', calories:520, isAvailable:true, image:PIC.redVelvet },
        { id:'ss2', _id:'ss2', name:'Triple Chocolate Brownie', price:280, category:'dessert', description:'Fudgy brownie · chocolate chips',    dietaryTags:['vegetarian'], spiceLevel:'mild', calories:480, isAvailable:true, image:PIC.brownie },
        { id:'ss3', _id:'ss3', name:'New York Cheesecake',  price:480, category:'dessert', description:'Creamy baked cheesecake · berry coulis', dietaryTags:['vegetarian'], spiceLevel:'mild', calories:560, isAvailable:true, image:PIC.cheesecake },
        { id:'ss4', _id:'ss4', name:'Chocolate Lava Cake',  price:380, category:'dessert', description:'Warm molten chocolate centre',           dietaryTags:['vegetarian'], spiceLevel:'mild', calories:420, isAvailable:true, image:PIC.lavaCake },
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
