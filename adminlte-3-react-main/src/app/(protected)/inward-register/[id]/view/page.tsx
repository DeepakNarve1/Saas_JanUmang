"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewInwardRegister from "@app/views/inwardRegister/ViewInwardRegister";

export default function ViewInwardRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_INWARD_REGISTER]}>
      <ViewInwardRegister />
    </RouteGuard>
  );
}
