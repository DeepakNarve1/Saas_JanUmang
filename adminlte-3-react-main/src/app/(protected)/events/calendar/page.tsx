"use client";

import EventsCalendarView from "@app/views/eventsCalendar";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EventsCalendarPage() {
  return (
    <RouteGuard requiredPermissions={["view_events"]}>
      <EventsCalendarView />
    </RouteGuard>
  );
}
