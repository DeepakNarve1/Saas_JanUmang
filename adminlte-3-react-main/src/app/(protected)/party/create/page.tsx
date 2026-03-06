"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateParty from "@app/views/party/CreateParty";

export default function CreatePartyPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_PARTIES]}>
      <CreateParty />
    </RouteGuard>
  );
}
