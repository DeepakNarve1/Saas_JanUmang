"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditInwardRegister from "@app/views/inwardRegister/EditInwardRegister";

export default function EditInwardRegisterPage() {
  return (
    <RouteGuard requiredPermission="edit_inward_register">
      <EditInwardRegister />
    </RouteGuard>
  );
}
