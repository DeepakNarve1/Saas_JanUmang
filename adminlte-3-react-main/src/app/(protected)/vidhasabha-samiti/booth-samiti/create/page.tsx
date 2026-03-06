"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateBoothSamiti() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_BOOTH_SAMITI]}>
      <GenericSamitiForm title="Booth Samiti" apiEndpoint="booth-samiti" />
    </RouteGuard>
  );
}
