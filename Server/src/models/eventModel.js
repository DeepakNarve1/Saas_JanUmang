const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    uniqueId: {
      type: String,
      index: true,
      trim: true,
    },
    district: { type: String, required: true, trim: true, index: true },
    year: { type: String, required: true, trim: true },
    month: { type: String, required: true, trim: true },
    receivingDate: { type: Date, required: true },
    programDate: { type: Date, required: true, index: true },
    time: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true, index: true },
    eventDetails: { type: String, required: true, trim: true },
    googleEventId: { type: String, trim: true },

    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "Cancelled", "Completed", "Postponed"],
      default: "Scheduled",
      index: true,
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    venueCity: { type: String, trim: true },
    referencePerson: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    name: { type: String, trim: true }, // Organizer or Event Name depending on usage
    location: { type: String, trim: true },
    probability: { type: String, trim: true },
    duration: { type: String, trim: true }, // Changed to String to match typical form input if needed, or keep number if minutes
    attended: { type: String, default: "No" }, // Boolean or String? "Attended" could be status. User didn't specify. Assuming String for now conform to others.
    pressConference: { type: String, default: "No" },
    dispatchDate: { type: Date },
    dispatchNumber: { type: String, trim: true },
    remarks: { type: String, trim: true },
    addedBy: { type: String, trim: true },

    syncedToCalendar: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to auto-generate uniqueId
eventSchema.pre("save", async function () {
  if (!this.uniqueId) {
    const count = await this.constructor.countDocuments({
      tenantId: this.tenantId,
    });
    this.uniqueId = `EVT/${count + 1}`;
  }
});

eventSchema.index({ uniqueId: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Event", eventSchema);
