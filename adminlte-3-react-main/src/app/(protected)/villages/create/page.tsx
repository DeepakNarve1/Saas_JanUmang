"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateVillage from "@app/views/village/CreateVillage";

export default function CreateUserPage() {
  return (
    <RouteGuard requiredPermissions={["create_villages"]}>
      <CreateVillage />
    </RouteGuard>
  );
}
