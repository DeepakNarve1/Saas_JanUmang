"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditMandirSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_MANDIR_SAMITI]}>
      <GenericSamitiForm
        title="Mandir Samiti"
        apiEndpoint="mandir-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
