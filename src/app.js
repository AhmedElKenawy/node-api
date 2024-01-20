// app.js

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cors = require("cors");

const app = express();
const { MONGO_URI } = require("./config/database");

// Middleware
app.use(bodyParser.json());
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
// Routes
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  
    credentials: true,
  })
);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use('/auth', authRoutes);



module.exports = app;
