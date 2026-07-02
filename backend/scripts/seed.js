require('dotenv').config();
const { getSequelize } = require('../database/init');
const User = require('../database/models/User');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const db = getSequelize();
    await db.sync({ force: true });

    console.log('🌱 Seeding database...');

    const passwordHash1 = await bcrypt.hash('123456', 10);
    const passwordHash2 = await bcrypt.hash('123456', 10);

    await User.create({
      name: 'João Silva',
      email: 'joao@email.com',
      passwordHash: passwordHash1,
      type: 'professional',
      specialty: 'Eletricista',
      location: 'São Paulo - SP',
      phone: '(11) 91234-5678',
      bio: '15 anos de experiência em instalações residenciais e comerciais.',
      credits: 20,
      verified: true,
      status: 'active'
    });

    await User.create({
      name: 'Cliente Exemplo',
      email: 'cliente@email.com',
      passwordHash: passwordHash2,
      type: 'client',
      location: 'São Paulo - SP',
      credits: 5,
      status: 'active'
    });

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
