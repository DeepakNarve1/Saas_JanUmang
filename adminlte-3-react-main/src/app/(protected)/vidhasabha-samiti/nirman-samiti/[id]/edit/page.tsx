"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditNirmanSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_NIRMAN_SAMITI]}>
      <GenericSamitiForm
        title="Nirman Samiti"
        apiEndpoint="nirman-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
