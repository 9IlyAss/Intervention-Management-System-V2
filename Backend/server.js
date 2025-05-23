const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const serverless = require("serverless-http");

const ConnectDB = require("./config/db");
const authRoutes = require("./Routes/authRoutes");
const clientRoutes = require("./Routes/clientRoutes");
const technicianRoutes = require("./Routes/technicianRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const interventionRoutes = require("./Routes/interventionRoutes");
const uploadRoutes = require("./Routes/uploadRoutes");
const supportRoutes = require("./Routes/supportRoutes");

env.config();

const app = express();

app.use(express.json());
app.use(cors());

ConnectDB();

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/support", supportRoutes);

app.get("/", (req, res) => {
  res.send("BACKEND API IS WORKING!");
});

// Remove app.listen() — instead export handler:
module.exports = serverless(app);
