const express = require('express');
const { MongoClient } = require('mongodb');
const app = express()
const cors = require('cors')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;





app.use(bodyParser.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xlib.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("creative-agency-f").collection("services");
  const ordersCollection = client.db("creative-agency-f").collection("orders");
  const reviews = client.db("creative-agency-f").collection("reviews");
  const admins = client.db("creative-agency-f").collection("admins");
  console.log("Database connected");




  // perform actions on the collection object
  app.get('/AllServices', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/reviews', (req, res) => {
    reviews.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  //Add services by admin

  app.post('/addServices', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const details = req.body.details;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    servicesCollection.insertOne({ name, details, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  //Add screenshot by user
  app.post('/placeOrder', (req, res) => {
    const file = req.files.file;
    const image = req.body.image;
    const status = req.body.status;
    const name = req.body.name;
    const email = req.body.email;
    const price = req.body.price;
    const service = req.body.service;
    const description = req.body.description;
   
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var img = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
   
    ordersCollection.insertOne({ name, email, price, service, description, file, image, img, status })
      .then(result => {
        console.log(result);
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addReview', (req, res) => {
    reviews.insertOne(req.body)
    .then(result =>{
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/order/:id', (req, res) => {
    servicesCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })

  // Find all for admin
  app.get('/orders', (req, res) => {
    ordersCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  // find specific user by email
  app.get('/specificOrder', (req, res) => {
    ordersCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // Admin's login
  app.get('/admin', (req, res) => {
    const email = req.query.email;
    // console.log(email);
    admins.find({ email })
        .toArray((err, collection) => {
            res.send(collection.length > 0)
        })
})

// Make an admin 
app.post('/makeAdmin', (req, res) => {
  admins.insertOne(req.body)
  .then(result =>{
    res.send(result.insertedCount > 0)
  })
})

// Update Status
app.patch('/update/:id', (req, res) => {
  ordersCollection.updateOne({_id: ObjectId(req.params.id)},
   {
      $set: {status: req.body.status}
  })
  .then(result => {
      res.send(result.modifiedCount > 0);
  })
})




});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})