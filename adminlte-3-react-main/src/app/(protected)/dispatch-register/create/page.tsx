"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateDispatchRegister from "@app/views/dispatchRegister/CreateDispatchRegister";

export default function CreateDispatchRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_DISPATCH_REGISTER]}>
      <CreateDispatchRegister />
    </RouteGuard>
  );
}
