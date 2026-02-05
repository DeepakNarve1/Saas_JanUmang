"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewDispatchRegister from "@app/views/dispatchRegister/ViewDispatchRegister";

export default function ViewDispatchRegisterPage() {
  return (
    <RouteGuard requiredPermission="view_dispatch_register">
      <ViewDispatchRegister />
    </RouteGuard>
  );
}
