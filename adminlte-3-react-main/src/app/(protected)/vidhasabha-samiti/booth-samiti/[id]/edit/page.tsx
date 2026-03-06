"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditBoothSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_BOOTH_SAMITI]}>
      <GenericSamitiForm
        title="Booth Samiti"
        apiEndpoint="booth-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
