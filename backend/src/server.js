require('dotenv').config();
const app = require('./app');
const connectMongo = require('./config/mongo');

const PORT = process.env.PORT || 5000;

connectMongo().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
