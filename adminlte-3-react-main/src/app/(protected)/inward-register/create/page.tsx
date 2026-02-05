"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateInwardRegister from "@app/views/inwardRegister/CreateInwardRegister";

export default function CreateInwardRegisterPage() {
  return (
    <RouteGuard requiredPermission="create_inward_register">
      <CreateInwardRegister />
    </RouteGuard>
  );
}
