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
    { restaurant: restaurant._id, name: 'Hamburguesa Clásica', description: 'Carne 200g, lechuga, tomate, queso', price: 12.50, category: 'main', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Ensalada César', description: 'Lechuga, pollo, parmesano, croutones', price: 9.90, category: 'starter', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Tarta de Queso', description: 'Receta tradicional, coulis de frutos rojos', price: 6.50, category: 'dessert', image: 'https://images.unsplash.com/photo-1524351199678-941a57a3bc0c?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Refresco Cola', description: 'Lata 33cl', price: 2.50, category: 'drink', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Patatas Bravas', description: 'Con salsa picante y mayonesa', price: 7.00, category: 'starter', image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Salmón a la Plancha', description: 'Con verduras de temporada', price: 16.00, category: 'main', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Croquetas de Jamón', description: '6 unidades, caseras', price: 8.50, category: 'starter', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Cerveza', description: 'Caña 20cl', price: 2.00, category: 'drink', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Tiramisú', description: 'Italiano, café espresso', price: 7.00, category: 'dessert', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop' },
    { restaurant: restaurant._id, name: 'Lomo al Steak Sauce', description: '250g con guarnición', price: 18.00, category: 'main', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop' },
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
