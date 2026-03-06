"use client";

import EventsCalendarView from "@app/views/eventsCalendar";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EventsCalendarPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_EVENTS]}>
      <EventsCalendarView />
    </RouteGuard>
  );
}
