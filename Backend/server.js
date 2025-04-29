const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const app = express();
const ConnectDB = require("./config/db");
const authRoutes =require("./Routes/authRoutes")
const clientRoutes =require("./Routes/clientRoutes")
const technicianRoutes=require("./Routes/technicianRoutes")
const adminRoutes=require("./Routes/adminRoutes")
const interventionRoutes=require("./Routes/interventionRoutes")

app.use(express.json());
env.config();

app.use(cors());
const PORT = process.env.PORT || 3000;
ConnectDB();

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/admin",adminRoutes)
app.use("/api/interventions",interventionRoutes)

app.get("/", (req, res) => {
  res.send("BACKEND API IS WORKKING!");
}),
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
