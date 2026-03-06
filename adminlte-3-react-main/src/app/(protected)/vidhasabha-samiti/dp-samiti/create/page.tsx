"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateDpSamiti() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_DP_SAMITI]}>
      <GenericSamitiForm title="DP Samiti" apiEndpoint="dp-samiti" />
    </RouteGuard>
  );
}
