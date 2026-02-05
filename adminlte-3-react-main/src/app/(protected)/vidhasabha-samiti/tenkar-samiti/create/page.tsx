"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateTenkarSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_tenkar_samiti"]}>
      <GenericSamitiForm title="Tenkar Samiti" apiEndpoint="tenkar-samiti" />
    </RouteGuard>
  );
}
