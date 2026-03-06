"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewDispatchRegister from "@app/views/dispatchRegister/ViewDispatchRegister";

export default function ViewDispatchRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_DISPATCH_REGISTER]}>
      <ViewDispatchRegister />
    </RouteGuard>
  );
}
