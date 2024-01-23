require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const {MongoClient, ServerApiVersion} = require('mongodb');

const uri = process.env.MongoDB_URI;

//midlewares
app.use(express.json());
app.use(cors());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

async function run() {
  // DBCollections
  const RoomsDB = client.db('RoomDB').collection('RoomDBCollection');
  const users = client.db('userDB').collection('userDBCollection');

  try {
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ping: 1});
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );

    // Define a basic route
    app.get('/', (req, res) => {
      res.send(uri);
    });

    //user Registration
    app.post('/users', async (req, res) => {
      const UserData = req.body;
      const email = UserData.email;

      const isEmailExist = await users.findOne({email: email});


      if (isEmailExist?.email === email) {
        
      console.log('vtc', isEmailExist.email, email);
        res.send({status: 'Fail', message: 'email already exist'});
      } else {
        const result = await users.insertOne(UserData)
        res.send(result);
      }
      // console.log('response', isEmailExist);
    });

    // Rooms
    app.get('/rooms', async (req, res) => {
      const result = await RoomsDB.find().toArray();
      console.log(result);
      res.send(result);
    });

    //Add Rooms
    app.post('/rooms', async (req, res) => {
      const result = await RoomsDB.insertOne();
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
