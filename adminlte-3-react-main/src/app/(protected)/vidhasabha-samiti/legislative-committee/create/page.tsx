"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateLegislativeCommittee() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_VIDHAN_SABHA_SAMITI]}>
      <GenericSamitiForm
        title="Legislative Committee"
        apiEndpoint="legislative-committee"
      />
    </RouteGuard>
  );
}
