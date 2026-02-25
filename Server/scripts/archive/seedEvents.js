require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./src/models/eventModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Events...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedEvents = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    const districts = ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"];
    const eventTypes = [
      "Meeting",
      "Inauguration",
      "Public Rally",
      "Inspection",
      "Cultural Program",
    ];
    const statuses = ["Scheduled", "Confirmed", "Completed"];
    const priorities = ["Low", "Medium", "High", "Urgent"];
    const venues = [
      "Community Hall",
      "Town Hall",
      "District Ground",
      "Party Office",
    ];

    const entries = [];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const programDate = new Date();
      programDate.setDate(
        programDate.getDate() + Math.floor(Math.random() * 30),
      ); // Future dates mostly

      // Random time between 10 AM and 6 PM
      const hour = 10 + Math.floor(Math.random() * 8);
      const min = Math.random() > 0.5 ? "00" : "30";
      const time = `${hour}:${min}`;

      entries.push({
        uniqueId: `EVT-${Date.now()}-${i}`,
        district: districts[Math.floor(Math.random() * districts.length)],
        year: "2024",
        month: programDate.toLocaleString("default", { month: "long" }),
        receivingDate: new Date(),
        programDate: programDate,
        time: time,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        eventDetails: `Event description for item ${i + 1}. Discussion on key topics and planning.`,
        venue: venues[Math.floor(Math.random() * venues.length)],
        address: `Address line 1, ${districts[Math.floor(Math.random() * districts.length)]}`,
        organizer: {
          name: `Organizer ${i}`,
          phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
          email: `organizer${i}@example.com`,
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        expectedAttendees: 50 + Math.floor(Math.random() * 500),
        remarks: "Generated dummy event.",
      });
    }

    await Event.insertMany(entries);
    console.log(`Successfully seeded ${NUMBER_OF_ENTRIES} Events.`);
  } catch (error) {
    console.error("Error seeding events:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedEvents();
