"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateBooth from "@app/views/booth/CreateBooth";

export default function CreateBoothPage() {
  return (
    <RouteGuard requiredPermission="create_booths">
      <CreateBooth />
    </RouteGuard>
  );
}
