"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateDispatchRegister from "@app/views/dispatchRegister/CreateDispatchRegister";

export default function CreateDispatchRegisterPage() {
  return (
    <RouteGuard requiredPermission="create_dispatch_register">
      <CreateDispatchRegister />
    </RouteGuard>
  );
}
