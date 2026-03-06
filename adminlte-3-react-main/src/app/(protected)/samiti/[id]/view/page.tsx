"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewSamiti from "@app/views/samiti/ViewSamiti";

export default function ViewSamitiPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_SAMITI]}>
      <ViewSamiti />
    </RouteGuard>
  );
}
