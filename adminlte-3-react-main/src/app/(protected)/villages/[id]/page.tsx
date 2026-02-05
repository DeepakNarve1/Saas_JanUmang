"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewVillage from "@app/views/village/ViewVillage";

export default function ViewVillagePage() {
  return (
    <RouteGuard requiredPermissions={["view_villages"]}>
      <ViewVillage />
    </RouteGuard>
  );
}
