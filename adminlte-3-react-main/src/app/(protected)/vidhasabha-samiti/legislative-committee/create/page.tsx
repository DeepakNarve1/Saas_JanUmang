"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateLegislativeCommittee() {
  return (
    <RouteGuard requiredPermissions={["create_vidhan_sabha_samiti"]}>
      <GenericSamitiForm
        title="Legislative Committee"
        apiEndpoint="legislative-committee"
      />
    </RouteGuard>
  );
}
