"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import InwardRegisterList from "@app/views/inwardRegister";

export default function InwardRegisterPage() {
  return (
    <RouteGuard requiredPermission="view_inward_register">
      <InwardRegisterList />
    </RouteGuard>
  );
}
