const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const app = express();
const ConnectDB = require("./config/db");

app.use(express.json());
env.config();

app.use(cors());
const PORT = process.env.PORT || 3000;
ConnectDB();

app.get("/", (req, res) => {
  res.end("waaaaach amonami");
});



app.get("/", (req, res) => {
  res.send("BACKEND API IS WORKKING!");
}),
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
