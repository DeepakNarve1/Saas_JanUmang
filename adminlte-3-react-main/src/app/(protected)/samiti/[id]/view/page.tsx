"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewSamiti from "@app/views/samiti/ViewSamiti";

export default function ViewSamitiPage() {
  return (
    <RouteGuard requiredPermission="view_samiti">
      <ViewSamiti />
    </RouteGuard>
  );
}
