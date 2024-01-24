require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = 3000;
const {MongoClient, ObjectId} = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MongoDB_URI;
const secretKey = process.env.JWT_SECRET;
//middlewares
app.use(express.json());
app.use(cors());

const client = new MongoClient(uri);

async function run() {
  const RoomsDB = client.db('RoomDB').collection('RoomDBCollection');
  const users = client.db('userDB').collection('userDBCollection');

  try {
    await client.db('admin').command({ping: 1});

    app.get('/', (req, res) => {
      res.send(uri);
    });

    // User Registration with JWT token
    app.post('/users', async (req, res) => {
      const userData = req.body;
      const email = userData.email;

      const user = await users.findOne({email: email});

      if (email === user?.email) {
        res.send({status: false, message: 'Email already exists'});
      } else {
        const result = await users.insertOne(userData);

        // Generate JWT token upon successful registration
        const token = jwt.sign(
          {email: userData.email, userId: result.insertedId},
          secretKey,
          {expiresIn: '1h'}
        );

        res.send({token, userId: result.insertedId});
      }
    });

 // User Login with JWT token
app.get('/users', async (req, res) => {
    const { email, password } = req.query;
  
    try {
      const user = await users.findOne({ email: email });
  
      if (!user) {
        return res.json({ status: false, message: 'User not found' });
      }
  
      if (password === user?.password) {
        // Generate JWT token upon successful login
        const token = jwt.sign(
          { email: user.email, userId: user._id },
          secretKey,
          { expiresIn: '1h' }
        );
  
        return res.json({status: true, token, name: user.name, email: user.email, role: user.role, phone: user.phone,  id: user._id, // Using _id instead of id for MongoDB ObjectId
        });
      } else {
        // Passwords do not match
        return res
          .status(401)
          .json({ status: false, message: 'Incorrect password' });
      }
    } catch (error) {
      // Handle other errors
      console.error('Error during login:', error);
      return res
        .status(500)
        .json({ status: false, message: 'Internal Server Error' });
    }
  });

//   Logout Route
app.get('/logout', (req, res)=>{
    res.send({message: 'logout successfully'})
})

    // Verify JWT middleware
    const verifyToken = (req, res, next) => {
      const token = req.header('Authorization');

      if (!token) {
        return res
          .status(401)
          .send({message: 'Access denied. No token provided.'});
      }

      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(401).send({message: 'Invalid token'});
        }

        req.user = decoded;
        next();
      });
    };

    // Example of a protected route using the verifyToken middleware
    app.get('/protected-route', verifyToken, (req, res) => {
      res.send({message: 'This is a protected route', user: req.user});
    });

    //   //user Registration
    //   app.post('/users', async (req, res) => {
    //     const UserData = req.body;
    //     const email = UserData.email;

    //     const isEmailExist = await users.findOne({email: email});

    //     if (isEmailExist?.email === email) {
    //       console.log('vtc', isEmailExist.email, email);
    //       res.send({status: 'Fail', message: 'email already exist'});
    //     } else {
    //       const result = await users.insertOne(UserData);
    //       res.send(result);
    //     }
    //     // console.log('response', isEmailExist);
    //   });

    // user login
    //   app.get('/users', async (req, res) => {
    //     const {email, password} = req?.query;

    //     const user = await users.findOne({email: email});
    //     if (!user) {
    //       return res.send({Message: 'User not Find'});
    //     }

    //     if (password === user?.password) {
    //       return res.send({
    //         name: user.name,
    //         email: user.email,
    //         role: user.role,
    //         phone: user.phone,
    //         id: user.id,
    //       });
    //     }
    //   });

    // Rooms
    app.get('/rooms', async (req, res) => {
      const result = await RoomsDB.find().toArray();
      res.send(result);
    });

    // Rooms by id
    app.get('/rooms/:id', async (req, res) => {
      const {id} = req?.params;

      const result = await RoomsDB.findOne({_id: new ObjectId(id)});
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
    // Close the MongoDB client when done
    // await client.close();
  }
}

run();
