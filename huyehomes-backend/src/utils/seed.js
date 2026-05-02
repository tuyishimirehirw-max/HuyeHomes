require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('./seedData');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/huyehomes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedData()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
})
.catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1);
});
