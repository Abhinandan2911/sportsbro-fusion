require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// Get the MongoDB URI from environment variables
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("ERROR: MongoDB URI is not defined. Check your .env file.");
  process.exit(1);
}

console.log("Testing MongoDB connection...");
console.log(`Using URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')}`); // Hide credentials in logs

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✓ Connection successful! You are connected to MongoDB!");
    
    // Get database info
    const dbList = await client.db().admin().listDatabases();
    console.log("\nAvailable databases:");
    dbList.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
    console.log("\nConnection test completed successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error);
    process.exit(1);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("Connection closed.");
  }
}

run().catch(console.dir); 