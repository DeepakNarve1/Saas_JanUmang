"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewWorktype from "@app/views/worktype/ViewWorktype";

export default function ViewWorktypePage() {
  return (
    <RouteGuard requiredPermission="view_work_types">
      <ViewWorktype />
    </RouteGuard>
  );
}
