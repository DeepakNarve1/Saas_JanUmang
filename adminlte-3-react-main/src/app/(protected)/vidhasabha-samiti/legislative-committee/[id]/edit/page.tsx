"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";
import { useParams } from "next/navigation";
import { PERMISSIONS } from "@app/config/permissions";

export default function EditLegislativeCommittee() {
  const params = useParams();
  const id = params.id as string;

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_VIDHAN_SABHA_SAMITI]}>
      <GenericSamitiForm
        title="Legislative Committee"
        apiEndpoint="legislative-committee"
        id={id}
      />
    </RouteGuard>
  );
}
