const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors')
const app = express()
require ('dotenv').config();
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y7fy4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try{
    await client.connect();
    const itemCollection = client.db('car-parts').collection('items');
    app.get('/items', async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });
  }
  finally{

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from car parts')
})

app.listen(port, () => {
  console.log(`Car app listening on port ${port}`)
})