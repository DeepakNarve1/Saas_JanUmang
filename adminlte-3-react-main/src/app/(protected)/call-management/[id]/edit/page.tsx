"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditCall from "@app/views/callManagement/EditCall";

export default function EditCallPage() {
  return (
    <RouteGuard requiredPermission="edit_call_management">
      <EditCall />
    </RouteGuard>
  );
}
