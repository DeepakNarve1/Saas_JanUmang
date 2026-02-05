"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditVillage from "@app/views/village/EditVillage";

export default function EditVillagePage() {
  return (
    <RouteGuard requiredPermissions={["edit_villages"]}>
      <EditVillage />
    </RouteGuard>
  );
}
