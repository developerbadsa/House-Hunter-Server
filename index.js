require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MongoDB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

async function run() {
    // DBCollections
    const RoomsDB = client.db("RoomDB").collection("RoomDBCollection")


  try {
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');



    // Define a basic route
    app.get('/', (req, res) => {
      res.send(uri);
    });

    // Rooms
    app.get('/rooms', async (req, res) => {


      const result = await RoomsDB.find().toArray();
      console.log(result);
      res.send(result);
    });


    //Add Rooms
    app.post('/rooms', async (req, res) => {


        const result = await RoomsDB.insertOne()
        console.log(result);
        res.send(result);
      });

    app.listen(port, () => {
      console.log(`Server is listening at http://localhost:${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error 
    // await client.close();
  }
}

run();
