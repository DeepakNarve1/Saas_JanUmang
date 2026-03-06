"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditDpSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_DP_SAMITI]}>
      <GenericSamitiForm
        title="DP Samiti"
        apiEndpoint="dp-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
