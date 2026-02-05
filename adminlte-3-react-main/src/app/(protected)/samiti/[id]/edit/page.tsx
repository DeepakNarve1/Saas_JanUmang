"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditSamiti from "@app/views/samiti/EditSamiti";

export default function EditSamitiPage() {
  return (
    <RouteGuard requiredPermission="edit_samiti">
      <EditSamiti />
    </RouteGuard>
  );
}
