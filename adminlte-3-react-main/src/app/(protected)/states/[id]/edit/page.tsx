"use client";

import EditState from "@app/views/state/EditState";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditStatePage() {
  return (
    <RouteGuard requiredPermission="edit_states">
      <EditState />
    </RouteGuard>
  );
}
