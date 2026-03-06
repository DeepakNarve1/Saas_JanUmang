"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateBooth from "@app/views/booth/CreateBooth";

export default function CreateBoothPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_BOOTHS]}>
      <CreateBooth />
    </RouteGuard>
  );
}
