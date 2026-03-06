"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditSamiti from "@app/views/samiti/EditSamiti";

export default function EditSamitiPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_SAMITI]}>
      <EditSamiti />
    </RouteGuard>
  );
}
