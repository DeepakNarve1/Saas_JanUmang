"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateParliament from "@app/views/parliament/CreateParliament";

export default function CreateParliamentPage() {
  return (
    <RouteGuard requiredPermission="create_parliaments">
      <CreateParliament />
    </RouteGuard>
  );
}
