"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditGaneshSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_GANESH_SAMITI]}>
      <GenericSamitiForm
        title="Ganesh Samiti"
        apiEndpoint="ganesh-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
