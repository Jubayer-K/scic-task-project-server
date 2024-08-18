const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bv8l8yc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
  
      const productCollection =client.db('khanShopDB').collection('products');
  
      app.get('/all-products',async(req,res)=>{
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })

    app.get('/products', async (req, res) => {
        const { brand, category, priceMin, priceMax, page = 1, limit = 8, search, sortBy } = req.query;
        
        const query = {};


    //   query by brand 
        if (brand) {
          query.Brand = brand;
        }
        // query by category
        if (category) {
          query.Category = category;
        }
        // query by price 
        if (priceMin || priceMax) {
          query.Price = {};
          if (priceMin) query.Price.$gte = parseFloat(priceMin);
          if (priceMax) query.Price.$lte = parseFloat(priceMax);
        }
    //   search by product name
        if (search) {
          query.Product_Name = { $regex: search, $options: "i" };
        }
      
        const skip = (page - 1) * limit;
      
        // Define sorting based on sortBy parameter
        let sort = {};
        if (sortBy === 'priceLowToHigh') {
          sort.Price = 1;
        } else if (sortBy === 'priceHighToLow') {
          sort.Price = -1;
        } else if (sortBy === 'dateNewestFirst') {
          sort.date = -1;
        }
      
        const productsCursor = productCollection.find(query).skip(skip).limit(parseInt(limit)).sort(sort);
        const products = await productsCursor.toArray();
        
        const totalProducts = await productCollection.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
      
        res.send({
          products,
          totalPages,
        });
      });
      
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('khan shop server is running')
})

app.listen(port,()=>{
    console.log(`Khan shop server is running on port ${port}`);
})