require('dotenv').config();
const User = require('./models/User');

const demos = [
  { name:'Demo Customer',   email:'customer@demo.com',   password:'demo123', role:'customer',   phone:'03001234567' },
  { name:'Demo Restaurant', email:'restaurant@demo.com', password:'demo123', role:'restaurant', phone:'03007654321' },
  { name:'Demo Rider',      email:'rider@demo.com',      password:'demo123', role:'rider',      phone:'03009876543' },
  { name:'Demo Admin',      email:'admin@demo.com',      password:'demo123', role:'admin',      phone:'03008888888' },
];

(async () => {
  for (const u of demos) {
    try {
      const existing = await User.findByEmail(u.email);
      if (existing) { console.log(`Already exists: ${u.email}`); continue; }
      await User.create(u);
      console.log(`Created: ${u.email}`);
    } catch (e) { console.error(`Error ${u.email}:`, e.message); }
  }
  console.log('\nDone! Login with any demo account / demo123');
  process.exit(0);
})();
