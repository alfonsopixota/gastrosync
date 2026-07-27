require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI;

const IMAGES = {
  'Hamburguesa Clásica': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'Ensalada César': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
  'Tarta de Queso': 'https://images.unsplash.com/photo-1524351199678-941a57a3bc0c?w=400&h=300&fit=crop',
  'Refresco Cola': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop',
  'Patatas Bravas': 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop',
  'Salmón a la Plancha': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
  'Croquetas de Jamón': 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop',
  'Cerveza': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
  'Tiramisú': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
  'Lomo al Steak Sauce': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
};

const updateImages = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB Atlas');

  for (const [name, image] of Object.entries(IMAGES)) {
    const result = await MenuItem.updateMany(
      { name },
      { $set: { image } }
    );
    console.log(`${name}: ${result.modifiedCount} items actualizados`);
  }

  console.log('\n✅ Imágenes actualizadas');
  process.exit(0);
};

updateImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
