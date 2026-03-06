"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateSamiti from "@app/views/samiti/CreateSamiti";

export default function CreateSamitiPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_SAMITI]}>
      <CreateSamiti />
    </RouteGuard>
  );
}
