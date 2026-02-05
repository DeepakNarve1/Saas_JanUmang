"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import DispatchRegisterList from "@app/views/dispatchRegister";

export default function DispatchRegisterPage() {
  return (
    <RouteGuard requiredPermission="view_dispatch_register">
      <DispatchRegisterList />
    </RouteGuard>
  );
}
