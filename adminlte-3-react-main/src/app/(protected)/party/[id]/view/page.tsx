"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewParty from "@app/views/party/ViewParty";

export default function ViewPartyPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_PARTIES]}>
      <ViewParty />
    </RouteGuard>
  );
}
