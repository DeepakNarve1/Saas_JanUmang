"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateTenkarSamiti() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_TENKAR_SAMITI]}>
      <GenericSamitiForm title="Tenkar Samiti" apiEndpoint="tenkar-samiti" />
    </RouteGuard>
  );
}
