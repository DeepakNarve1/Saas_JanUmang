"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import DispatchRegisterList from "@app/views/dispatchRegister";

export default function DispatchRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_DISPATCH_REGISTER]}>
      <DispatchRegisterList />
    </RouteGuard>
  );
}
