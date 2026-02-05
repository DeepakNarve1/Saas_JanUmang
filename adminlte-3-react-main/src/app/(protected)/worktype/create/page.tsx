"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateWorktype from "@app/views/worktype/CreateWorktype";

export default function CreateWorktypePage() {
  return (
    <RouteGuard requiredPermission="create_worktype">
      <CreateWorktype />
    </RouteGuard>
  );
}
