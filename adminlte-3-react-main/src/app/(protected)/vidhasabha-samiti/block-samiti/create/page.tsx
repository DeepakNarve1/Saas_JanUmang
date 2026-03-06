"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateBlockSamiti() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_BLOCK_SAMITI]}>
      <GenericSamitiForm title="Block Samiti" apiEndpoint="block-samiti" />
    </RouteGuard>
  );
}
