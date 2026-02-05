const { google } = require("googleapis");
const path = require("path");

const KEY_FILE = path.join(__dirname, "../../service-key.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });
const calendarId = process.env.GOOGLE_CALENDAR_ID;

/**
 * Helper to format event data for Google Calendar
 */
const formatEventData = (eventData) => {
  const [hours, minutes, seconds] = eventData.time.split(":");
  const programDate = new Date(eventData.programDate);

  const startDateTime = new Date(programDate);
  startDateTime.setHours(
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds || 0)
  );

  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(startDateTime.getHours() + 1); // Default to 1 hour event

  return {
    summary: `${eventData.eventType}: ${eventData.uniqueId}`,
    location: eventData.district,
    description: eventData.eventDetails,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "Asia/Kolkata",
    },
  };
};

/*
 * Create an event in Google Calendar
 */
const createGoogleEvent = async (eventData) => {
  if (!calendarId) {
    console.warn("GOOGLE_CALENDAR_ID not set, skipping calendar sync.");
    return null;
  }

  try {
    const resource = formatEventData(eventData);
    const response = await calendar.events.insert({
      calendarId,
      resource,
    });
    return response.data.id;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return null;
  }
};

/**
 * Update an existing event in Google Calendar
 */
const updateGoogleEvent = async (googleEventId, eventData) => {
  if (!calendarId || !googleEventId) return;

  try {
    const resource = formatEventData(eventData);
    await calendar.events.update({
      calendarId,
      eventId: googleEventId,
      resource,
    });
  } catch (error) {
    console.error("Error updating Google Calendar event:", error);
  }
};

/**
 * Delete an event from Google Calendar
 */
const deleteGoogleEvent = async (googleEventId) => {
  if (!calendarId || !googleEventId) return;

  try {
    await calendar.events.delete({
      calendarId,
      eventId: googleEventId,
    });
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
  }
};

module.exports = {
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
};
