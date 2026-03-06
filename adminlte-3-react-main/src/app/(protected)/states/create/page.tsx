"use client";

import CreateState from "@app/views/state/CreateState";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateStatePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_STATES]}>
      <CreateState />
    </RouteGuard>
  );
}
