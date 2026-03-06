"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditDispatchRegister from "@app/views/dispatchRegister/EditDispatchRegister";

export default function EditDispatchRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_DISPATCH_REGISTER]}>
      <EditDispatchRegister />
    </RouteGuard>
  );
}
