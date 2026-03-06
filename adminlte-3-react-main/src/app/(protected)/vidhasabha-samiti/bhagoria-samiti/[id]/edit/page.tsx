"use client";

import { useParams } from "next/navigation";
import BhagoriaSamitiForm from "@app/views/vidhasabhaSamiti/forms/BhagoriaSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditBhagoriaSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_BHAGORIA_SAMITI]}>
      <BhagoriaSamitiForm isEdit id={id as string} />
    </RouteGuard>
  );
}
