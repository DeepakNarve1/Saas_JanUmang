"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateNirmanSamiti() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_NIRMAN_SAMITI]}>
      <GenericSamitiForm title="Nirman Samiti" apiEndpoint="nirman-samiti" />
    </RouteGuard>
  );
}
