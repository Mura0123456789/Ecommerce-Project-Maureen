const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedAdminPw = await bcrypt.hash('Admin123!', 10);
  const hashedCustomerPw = await bcrypt.hash('Customer123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: { name: 'Store Admin', email: 'admin@store.com', password: hashedAdminPw, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'customer@store.com' },
    update: {},
    create: { name: 'Test Customer', email: 'customer@store.com', password: hashedCustomerPw, role: 'CUSTOMER' },
  });

  const categories = ['Phones', 'Laptops', 'Accessories'];
  const categoryRecords = {};
  for (const name of categories) {
    categoryRecords[name] = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const products = [
    { name: 'Aurora Phone X', description: 'A sleek flagship smartphone.', price: 799.99, stock: 25, category: 'Phones' },
    { name: 'Nimbus Laptop 14', description: 'Lightweight laptop for everyday work.', price: 1099.5, stock: 15, category: 'Laptops' },
    { name: 'Wireless Earbuds Pro', description: 'Noise-cancelling wireless earbuds.', price: 129.0, stock: 60, category: 'Accessories' },
    { name: 'Orbit Phone Mini', description: 'Compact and affordable smartphone.', price: 399.0, stock: 40, category: 'Phones' },
    { name: 'Titan Laptop 16', description: 'High-performance laptop for creators.', price: 1899.0, stock: 8, category: 'Laptops' },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          categoryId: categoryRecords[p.category].id,
          images: { create: [{ url: `https://placehold.co/400x400?text=${encodeURIComponent(p.name)}` }] },
        },
      });
    }
  }

  console.log('Seed data created successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
