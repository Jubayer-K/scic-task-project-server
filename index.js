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
        const { page = 1, limit = 8, search = '' } = req.query;
    
        // Convert page and limit to integers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
    
        // Create a search filter
        const searchQuery = search
            ? { Product_Name: { $regex: search, $options: 'i' } }
            : {};
    
        try {
            // Calculate the total number of products
            const totalProducts = await productCollection.countDocuments(searchQuery);
    
            // Fetch products with pagination and search
            const products = await productCollection
                .find(searchQuery)
                .skip((pageNumber - 1) * limitNumber) // Skip products based on the current page
                .limit(limitNumber) // Limit the number of products to return
                .toArray();
    
            // Send the products and additional pagination info
            res.send({
                products,
                totalPages: Math.ceil(totalProducts / limitNumber),
                currentPage: pageNumber,
            });
        } catch (error) {
            res.status(500).send({ message: 'Error fetching products', error });
        }
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