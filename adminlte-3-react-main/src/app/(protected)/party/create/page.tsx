"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateParty from "@app/views/party/CreateParty";

export default function CreatePartyPage() {
  return (
    <RouteGuard requiredPermission="create_parties">
      <CreateParty />
    </RouteGuard>
  );
}
