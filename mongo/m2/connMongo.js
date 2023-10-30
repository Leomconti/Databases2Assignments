const { MongoClient } = require("mongodb");

const mongoURI = "mongodb://root:examplepassword@localhost:27017/";

const mongoConn = new MongoClient(mongoURI);

async function testMongo() {
  try {
    await mongoConn.connect();
    const pinga = await mongoConn.db().admin().ping();

    if (pinga.ok) {
      console.log("Successfully connected and pinged MongoDB!");
    } else {
      console.error("Failed to ping MongoDB:", pinga);
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = {
  mongoConn,
  testMongo,
};
