"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateMandirSamiti() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_MANDIR_SAMITI]}>
      <GenericSamitiForm title="Mandir Samiti" apiEndpoint="mandir-samiti" />
    </RouteGuard>
  );
}
