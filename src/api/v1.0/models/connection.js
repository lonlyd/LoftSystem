const mongoose = require('mongoose');
require('dotenv').config();
let dbUrl = process.env.DB_URL || 'localhost';
let dbPort = process.env.DB_PORT || 27017;
let dbCollection = process.env.DB_COLLECTION || 'loftsystem';
let uri = `mongodb://${dbUrl}:${dbPort}/${dbCollection}`;
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connection open`);
})

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
})

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose connection disconnected app termination');
    process.exit(1);
  })
})