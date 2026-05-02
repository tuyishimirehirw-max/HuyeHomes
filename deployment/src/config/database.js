const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Properties collection indexes
    await mongoose.connection.db.collection('properties').createIndexes([
      { key: { propertyType: 1, status: 1 } },
      { key: { "location.sector": 1, status: 1 } },
      { key: { price: 1, status: 1 } },
      { key: { isVerified: 1, isFeatured: 1, createdAt: -1 } },
      { key: { title: "text", description: "text" } }
    ]);

    // Users collection indexes
    await mongoose.connection.db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true }
    ]);

    // Inquiries collection indexes
    await mongoose.connection.db.collection('inquiries').createIndexes([
      { key: { propertyId: 1, status: 1 } },
      { key: { createdAt: -1 } }
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;
