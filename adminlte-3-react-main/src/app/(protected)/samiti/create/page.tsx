"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateSamiti from "@app/views/samiti/CreateSamiti";

export default function CreateSamitiPage() {
  return (
    <RouteGuard requiredPermission="create_samiti">
      <CreateSamiti />
    </RouteGuard>
  );
}
