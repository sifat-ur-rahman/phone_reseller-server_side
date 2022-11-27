const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express()

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sb5ycdx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const productCollection = client.db('phone').collection('product')


        const bookingsCollection = client.db('phone').collection('bookings')


        const usersCollection = client.db('phone').collection('users')

       

        app.get('/category/:category', async(req, res) =>{
            
            const categoryName = req.params.category;
            const filter = { "category" : categoryName }
            
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })
        app.post('/bookings', async(req, res) =>{
            const booking = req.body 
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        app.post('/users', async(req, res) =>{
            const user = req.body 
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.get('/users/admin/:email', async(req, res) =>{
            const email = req.params.email
            const query = {email}
            const user = await usersCollection.findOne(query)
            res.send({isAdmin: user?.role ===  'admin'})
        })

        app.get('/users/buyers/:email', async(req, res) =>{
            const email = req.params.email
            const query = {email}
            const user = await usersCollection.findOne(query)
            res.send({isBuyers: user?.role ===  'Buyer'})
        })

        app.get('/buyer', async(req, res)=>{
            const query = {role : 'Buyer'}
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })

        app.get('/sellers', async(req, res)=>{
            const query = {role : 'Seller'}
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })

        
    }
    finally{

    }
}
run().catch(console.log)


app.get('/', async(req, res) =>{
    res.send('server is running')
})

app.listen(port, ()=> console.log(`server running on ${port}`))