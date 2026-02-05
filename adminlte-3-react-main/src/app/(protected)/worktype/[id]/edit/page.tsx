"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditWorktype from "@app/views/worktype/EditWorktype";

export default function EditWorktypePage() {
  return (
    <RouteGuard requiredPermission="edit_worktype">
      <EditWorktype />
    </RouteGuard>
  );
}
