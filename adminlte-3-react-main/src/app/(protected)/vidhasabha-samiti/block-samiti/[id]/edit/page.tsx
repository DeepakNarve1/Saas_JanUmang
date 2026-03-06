"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditBlockSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_BLOCK_SAMITI]}>
      <GenericSamitiForm
        title="Block Samiti"
        apiEndpoint="block-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
