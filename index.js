const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors')
var jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config();
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y7fy4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unAuthorized access' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbiden access' })
    }
    req.decoded = decoded;
    next();
  });
}



async function run() {
  try {
    await client.connect();
    const itemCollection = client.db('car-parts').collection('items');
    const orderCollection = client.db('car-parts').collection('orders');
    const reviewCollection = client.db('car-parts').collection('reviews');
    const usersCollection = client.db('car-parts').collection('users');


    app.get('/items', async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const items = await itemCollection.findOne(query)
      res.send(items);
    });


    app.post('/orders', async (req, res) => {
      const orders = req.body;
      const result = await orderCollection.insertOne(orders);
      res.send(result)

    })

    app.get('/orders', async (req, res) => {
      const userEmail = req.query.userEmail;
      const query = { userEmail: userEmail };
      const orders = await orderCollection.find(query).toArray()
      res.send(orders);
    });

    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    });

    app.post('/reviews', async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(result)

    })

    app.get('/reviews', async (req, res) => {
      const userEmail = req.query.userEmail;
      const query = { userEmail: userEmail };
      const review = await reviewCollection.find(query).toArray()
      res.send(review);
    });

    app.get('/user', async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    })

    app.put('/user/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      requesterAccount = await usersCollection.findOne({ email: requester })
      if (requesterAccount.role === 'admin') {
        const filter = { email: email }
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.send(result);
      }else{
        req.status(403).send({message:'forbiden'})
      }

    })


    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      res.send({ result, token });
    // res.send(result);
    });



  }
  finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from car parts')
})

app.listen(port, () => {
  console.log(`Car app listening on port ${port}`)
})