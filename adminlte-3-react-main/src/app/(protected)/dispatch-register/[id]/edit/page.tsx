"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditDispatchRegister from "@app/views/dispatchRegister/EditDispatchRegister";

export default function EditDispatchRegisterPage() {
  return (
    <RouteGuard requiredPermission="edit_dispatch_register">
      <EditDispatchRegister />
    </RouteGuard>
  );
}
