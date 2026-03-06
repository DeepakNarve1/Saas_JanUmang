"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditTenkarSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_TENKAR_SAMITI]}>
      <GenericSamitiForm
        title="Tenkar Samiti"
        apiEndpoint="tenkar-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
