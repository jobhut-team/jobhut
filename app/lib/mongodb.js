import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// Simple connection options
const options = {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'
};

let client;
let clientPromise;

client = new MongoClient(uri, options);
clientPromise = client.connect();

export default clientPromise;

