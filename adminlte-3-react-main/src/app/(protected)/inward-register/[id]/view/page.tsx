"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewInwardRegister from "@app/views/inwardRegister/ViewInwardRegister";

export default function ViewInwardRegisterPage() {
  return (
    <RouteGuard requiredPermission="view_inward_register">
      <ViewInwardRegister />
    </RouteGuard>
  );
}
