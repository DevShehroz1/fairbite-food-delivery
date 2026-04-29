require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fairbite';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['customer', 'restaurant', 'rider', 'admin'] },
  phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const demoUsers = [
  { name: 'Demo Customer',    email: 'customer@demo.com',    role: 'customer',    phone: '03001234567' },
  { name: 'Demo Restaurant',  email: 'restaurant@demo.com',  role: 'restaurant',  phone: '03007654321' },
  { name: 'Demo Rider',       email: 'rider@demo.com',       role: 'rider',       phone: '03009999999' },
  { name: 'Demo Admin',       email: 'admin@demo.com',       role: 'admin',       phone: '03008888888' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const hash = await bcrypt.hash('demo123', 10);

  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      // Update password in case it changed
      await User.updateOne({ email: u.email }, { password: hash });
      console.log(`Updated: ${u.email}`);
    } else {
      await User.create({ ...u, password: hash });
      console.log(`Created: ${u.email}`);
    }
  }

  console.log('\nDemo users ready:');
  console.log('  customer@demo.com    / demo123');
  console.log('  restaurant@demo.com  / demo123');
  console.log('  rider@demo.com       / demo123');
  console.log('  admin@demo.com       / demo123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
