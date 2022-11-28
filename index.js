const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIP_SECRET);

const port = process.env.PORT || 5000;

const app = express()

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sb5ycdx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}


async function run(){
    try{
        const productCollection = client.db('phone').collection('product')


        const bookingsCollection = client.db('phone').collection('bookings')


        const usersCollection = client.db('phone').collection('users')

        const paymentCollection = client.db('phone').collection('payment')

        app.get('/category/:category', async(req, res) =>{
            
            const categoryName = req.params.category;
            const filter = { "category" : categoryName }
            
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })
        app.post('/bookings', async(req, res) =>{
            const booking = req.body 
            
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        app.post('/create-payment-intent', async (req, res) =>{
            const data = req.body
            const price = data.resalePrice
            const amount =  price * 100

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                "payment_method_types": [
                    "card"
                  ],
                  
              });
              res.send({
                clientSecret: paymentIntent.client_secret,
              });
        })

        app.post('/payments', async(req, res) =>{
            const payment = req.body
            const result = await paymentCollection.insertOne(payment)
            const id = payment.bookingId
            const filter = {_id: ObjectId(id)}
            const updated = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updated)
            res.send(result)
        })

        app.post('/users', async(req, res) =>{
            const user = req.body 
            
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })
        // console.log();

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
            res.send( {isBuyers: user?.role ===  'Buyer'})
        })

        app.get('/users/sellers/:email', async(req, res) =>{
            const email = req.params.email
            const query = {email}
            const user = await usersCollection.findOne(query)
            res.send({isSellers: user?.role ===  'Seller'})
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

        app.get('/bookings',  async(req, res) =>{
            const email = req.query.email;
            const query = {email: email}
            const booking = await bookingsCollection.find(query).toArray()
            res.send(booking)
        })

        app.get('/bookings/:id', async(req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await bookingsCollection.findOne(query)
            res.send(result)
        })

        app.post('/products', async(req, res) =>{
            const product = req.body 
            
            const result = await productCollection.insertOne(product)
            res.send(result)
        });

        app.get('/addProduct',  async(req, res) =>{
            const email = req.query.email;
            const query = {email: email}
            const addProducts = await productCollection.find(query).toArray()
            res.send(addProducts)
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