const mongoose = require('mongoose');
const Job = require('../models/Job.model');

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Create indexes
  await Job.collection.createIndex({ title: 'text', description: 'text' });
  await Job.collection.createIndex({ company: 1 });
  await Job.collection.createIndex({ location: 1 });
  
  console.log('✅ Migration complete');
  process.exit(0);
};

migrate();