"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewParty from "@app/views/party/ViewParty";

export default function ViewPartyPage() {
  return (
    <RouteGuard requiredPermission="view_party">
      <ViewParty />
    </RouteGuard>
  );
}
