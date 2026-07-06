require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI;

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB Atlas');

  await Restaurant.deleteMany({});
  await Table.deleteMany({});
  await MenuItem.deleteMany({});

  const restaurant = await Restaurant.create({
    name: 'GastroSync Demo',
    slug: 'gastrosync-demo',
    address: 'Calle Falsa 123, Madrid',
    phone: '600123456',
  });

  console.log(`Restaurant creado: ${restaurant._id}`);

  const tables = [];
  for (let i = 1; i <= 6; i++) {
    tables.push({
      restaurant: restaurant._id,
      number: i,
      capacity: i <= 2 ? 2 : i <= 4 ? 4 : 6,
      status: 'free',
    });
  }
  await Table.insertMany(tables);
  console.log(`${tables.length} mesas creadas`);

  const menuItems = [
    { restaurant: restaurant._id, name: 'Hamburguesa Clásica', description: 'Carne 200g, lechuga, tomate, queso', price: 12.50, category: 'main' },
    { restaurant: restaurant._id, name: 'Ensalada César', description: 'Lechuga, pollo, parmesano, croutones', price: 9.90, category: 'starter' },
    { restaurant: restaurant._id, name: 'Tarta de Queso', description: 'Receta tradicional, coulis de frutos rojos', price: 6.50, category: 'dessert' },
    { restaurant: restaurant._id, name: 'Refresco Cola', description: 'Lata 33cl', price: 2.50, category: 'drink' },
    { restaurant: restaurant._id, name: 'Patatas Bravas', description: 'Con salsa picante y mayonesa', price: 7.00, category: 'starter' },
    { restaurant: restaurant._id, name: 'Salmón a la Plancha', description: 'Con verduras de temporada', price: 16.00, category: 'main' },
    { restaurant: restaurant._id, name: 'Croquetas de Jamón', description: '6 unidades, caseras', price: 8.50, category: 'starter' },
    { restaurant: restaurant._id, name: 'Cerveza', description: 'Caña 20cl', price: 2.00, category: 'drink' },
    { restaurant: restaurant._id, name: 'Tiramisú', description: 'Italiano, café espresso', price: 7.00, category: 'dessert' },
    { restaurant: restaurant._id, name: 'Lomo al Steak Sauce', description: '250g con guarnición', price: 18.00, category: 'main' },
  ];
  await MenuItem.insertMany(menuItems);
  console.log(`${menuItems.length} items de menú creados`);

  console.log(`\n✅ Seed completado. Restaurant ID: ${restaurant._id}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
