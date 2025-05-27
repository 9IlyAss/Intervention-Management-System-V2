const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Administrator = require("./models/Administrator");
const Technician = require("./models/Technician");
const Client = require("./models/Client");
const Intervention = require("./models/Intervention");
const Feedback = require("./models/Feedback");
const Chat = require("./models/ChatRoom");
const SupportRequest = require("./models/SupportRequest");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Intervention.deleteMany();
    await Feedback.deleteMany();
    await Chat.deleteMany();
    await Administrator.deleteMany();
    await Technician.deleteMany();
    await Client.deleteMany();
    await SupportRequest.deleteMany();
    console.log("✅ Existing data cleared");

    // Create admin
    const admin = new Administrator({
      name: "Sarah Admin",
      email: "admin@example.com",
      phone: "0654875465",
      password: "123456",
      role: "administrator",
      permissionsList: ["full_access"]
    });
    await admin.save();

    // Create technicians
    const tech1 = new Technician({
      name: "Omar Technician",
      email: "tech1@example.com",
      phone: "0622222222",
      password: "123456",
      role: "technician",
      skillsList: ["Electrical", "Network"],
      status: "Available",
      avgRating: 4.5
    });
    await tech1.save();

    const tech2 = new Technician({
      name: "Layla Technician",
      email: "tech2@example.com",
      phone: "0633333333",
      password: "123456",
      role: "technician",
      skillsList: ["Plumbing"],
      status: "Unavailable",
      avgRating: 3.8
    });
    await tech2.save();

    // Create clients
    const client1 = new Client({
      name: "Yassine Client",
      email: "client1@example.com",
      phone: "0644444444",
      password: "123456",
      role: "client"
    });
    await client1.save();

    const client2 = new Client({
      name: "Fatima Client",
      email: "client2@example.com",
      phone: "0655555555",
      password: "123456",
      role: "client"
    });
    await client2.save();

    const client3 = new Client({
      name: "Khalid Client",
      email: "client3@example.com",
      phone: "0666666666",
      password: "123456",
      role: "client"
    });
    await client3.save();

    // Create interventions for each client
    await Intervention.insertMany([
      {
        title: "Printer Installation for Yassine",
        description: "Install new HP printer on 2nd floor.",
        clientId: client1._id,
        category: "Printers",
        location: "Admin Office",
        status: "Pending"
      },
      {
        title: "Wi-Fi Troubleshooting for Fatima",
        description: "Fix unstable Wi-Fi connection on ground floor.",
        clientId: client2._id,
        category: "IT Services",
        location: "Reception Area",
        status: "Pending"
      },
      {
        title: "VoIP Setup for Khalid",
        description: "Install and configure telephony system with 4 extensions.",
        clientId: client3._id,
        category: "Telephony",
        location: "Customer Service Room",
        status: "Pending"
      }
    ]);

    console.log("✅ Data seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding the data:", error);
    process.exit(1);
  }
};

seedData();
