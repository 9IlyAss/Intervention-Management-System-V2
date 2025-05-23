const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Administrator = require("./models/Administrator"); // ⬅️ Correct model
const Intervention = require('./models/Intervention');
const Feedback = require("./models/Feedback");
const Chat = require("./models/ChatRoom");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB ✅");

    await Intervention.deleteMany();
    await Feedback.deleteMany();
    await Chat.deleteMany();
    await Administrator.deleteMany(); // (optional) or User.deleteMany()

    console.log("Existing data cleared ✅");

    await Administrator.create({
      name: "Admin User",
      email: "admin@example.com",
      phone: "0654875465",
      password: "123456",
      role: "administrator",
      permissionsList: ["full_access"]
    });

    console.log("Data seeded successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Error seeding the data:", error);
    process.exit(1);
  }
};

seedData();
