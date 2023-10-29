const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());





const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.4hda1bm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// middle wares  custom

const logger = async (req, res, next) => {
    console.log("called:", req.host, req.originalUrl)
}

const verifyToken = async(req, res, next)=>{
    const token= req.cookies?.token;
    console.log("Value of token in middle ware:", token)
    if(!token){
        return res.status(401).send({message: "Not Authorized"})
    }
}


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const ServicesCollection = client.db("CarDoctor").collection("services");
        const BookingCollection = client.db("CarDoctor").collection("Bookings")

        // auth related api
        app.post("/jwt", logger, async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.Access_Token_Secret, { expiresIn: "1h" })
            res.cookie("token", token, {
                httpOnly: true,
                secure: false
            }).send({ success: true });
        })




        //service

        app.get("/services", logger, async (req, res) => {
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

        app.get("/bookings", logger, verifyToken, async (req, res) => {
            console.log(req.query.email);
            // console.log("tu token", req.cookies.token);
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