"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditParty from "@app/views/party/EditParty";

export default function EditPartyPage() {
  return (
    <RouteGuard requiredPermission="edit_parties">
      <EditParty />
    </RouteGuard>
  );
}
