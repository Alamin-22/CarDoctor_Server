const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.4hda1bm.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const ServicesCollection = client.db("CarDoctor").collection("services");
        const BookingCollection = client.db("CarDoctor").collection("Bookings")

        app.get("/services", async (req, res) => {
            const cursor = ServicesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: { img: 1, title: 1, price: 1, service_id: 1 },
            }
            const result = await ServicesCollection.findOne(query, options);
            res.send(result);
        })
        //  bookings

        app.get("/bookings", async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await BookingCollection.find(query).toArray();
            res.send(result);
        })

        app.patch("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            console.log(updatedBooking);

            const updatedDOC = {
                $set: {
                    status: updatedBooking.status,
                }
            };

            const result = await BookingCollection.updateOne(filter, updatedDOC);
            res.send(result); 


        })




        app.post("/bookings", async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const result = await BookingCollection.insertOne(booking);
            res.send(result);

        })

        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await BookingCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("Doctor Server Is Running")
})


app.listen(port, () => {
    console.log(`Car Doctor Server Is Running on : ${port}`)
})