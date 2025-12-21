require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// firebase sdk

const decoded = Buffer.from(
  process.env.FIREBASE_ADMIN_SDK_KEY,
  "base64"
).toString("utf-8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.alsn6h3.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const myDb = client.db("homeNest");
    const allPropertyCollection = myDb.collection("allProperty");
    const allReviewCollection = myDb.collection("allReview");

    const verifyJWT = async (req, res, next) => {
      const token = req?.headers?.authorization?.split(" ")[1];
      if (!token)
        return res.status(401).send({ message: "Unauthorized Access!" });
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.tokenEmail = decoded.email;

        next();
      } catch (err) {
        console.log(err);
        return res.status(401).send({ message: "Unauthorized Access!", err });
      }
    };

    // PROPERTY RELATED API

    app.post("/properties", verifyJWT, async (req, res) => {
      const propertyData = req.body;
      propertyData.createdAt = new Date().toISOString();
      const result = await allPropertyCollection.insertOne(propertyData);
      res.send(result);
    });

    app.get("/properties", async (req, res) => {
      const result = await allPropertyCollection.find().toArray();
      res.send(result);
    });

    app.get("/properties/featured", async (req, res) => {
      const result = await allPropertyCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/properties-details/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const result = await allPropertyCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/my-property", verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email query is required" });
      }
      const result = await allPropertyCollection
        .find({ vendorEmail: email })
        .toArray();

      res.send(result);
    });

    app.delete("/properties/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allPropertyCollection.deleteOne(query);
      const result2 = await allReviewCollection.deleteMany({ propertyId: id });
      res.send(result, result2);
    });

    app.patch("/properties/:id", verifyJWT, async (req, res) => {
      try {
        const id = req.params.id;
        const emailFromToken = req.tokenEmail;
        const { propertyName, price, image, description, category, location } =
          req.body;

        const property = await allPropertyCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!property) {
          return res.status(404).send({ message: "Property not found" });
        }

        if (property.vendorEmail !== emailFromToken) {
          return res.status(403).send({ message: "Forbidden access" });
        }
        const propertyUpdateResult = await allPropertyCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              propertyName,
              price,
              image,
              description,
              category,
              location,
              updatedAt: new Date().toISOString(),
            },
          }
        );

        const reviewUpdateResult = await allReviewCollection.updateMany(
          { propertyId: id },
          {
            $set: {
              propertyName,
              thumbnailOfProperty: image,
              updatedAt: new Date().toISOString(),
            },
          }
        );
        res.send({
          propertyModified: propertyUpdateResult.modifiedCount,
          reviewsModified: reviewUpdateResult.modifiedCount,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          message: "Failed to update property and reviews",
        });
      }
    });

    // REVIEW RELATED API

    app.post("/reviews", verifyJWT, async (req, res) => {
      const reviewData = req.body;
      reviewData.createdAt = new Date().toISOString();
      const result = await allReviewCollection.insertOne(reviewData);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email query is required" });
      }
      const result = await allReviewCollection
        .find({ reviewerEmail: email })
        .toArray();
      res.send(result);
    });

    app.get("/reviews/:propertyId", async (req, res) => {
      const propertyId = req.params.propertyId;
      const result = await allReviewCollection
        .find({ propertyId: propertyId })
        .toArray();
      res.send(result);
    });




    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("home next server is running..........");
});

app.listen(port, () => {
  console.log(`Home Nest app listening on port ${port}`);
});
