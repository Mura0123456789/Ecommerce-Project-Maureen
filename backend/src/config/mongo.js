const mongoose = require('mongoose');

async function connectMongo() {
  try {
    // dbName is set explicitly so it works whether MONGO_URI is a local
    // mongodb:// URI or an Atlas mongodb+srv:// URI with no database
    // path in it (Atlas connection strings often omit the db name).
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'ecommerce_mongo' });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectMongo;
