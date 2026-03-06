"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import { useParams } from "next/navigation";

export default function ViewLegislativeCommittee() {
  const params = useParams();
  const id = params.id as string;

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_VIDHAN_SABHA_SAMITI]}>
      <GenericSamitiForm
        title="Legislative Committee"
        apiEndpoint="legislative-committee"
        id={id}
        isReadOnly={true}
      />
    </RouteGuard>
  );
}
