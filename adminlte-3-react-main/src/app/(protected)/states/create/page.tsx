"use client";

import CreateState from "@app/views/state/CreateState";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateStatePage() {
  return (
    <RouteGuard requiredPermission="create_states">
      <CreateState />
    </RouteGuard>
  );
}
