"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditParty from "@app/views/party/EditParty";

export default function EditPartyPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_PARTIES]}>
      <EditParty />
    </RouteGuard>
  );
}
