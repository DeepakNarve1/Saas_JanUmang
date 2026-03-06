"use client";

import BhagoriaSamitiForm from "@app/views/vidhasabhaSamiti/forms/BhagoriaSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateBhagoriaSamiti() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_BHAGORIA_SAMITI]}>
      <BhagoriaSamitiForm />
    </RouteGuard>
  );
}
