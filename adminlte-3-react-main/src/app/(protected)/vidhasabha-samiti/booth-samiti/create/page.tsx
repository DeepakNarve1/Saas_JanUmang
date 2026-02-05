"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateBoothSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_booth_samiti"]}>
      <GenericSamitiForm title="Booth Samiti" apiEndpoint="booth-samiti" />
    </RouteGuard>
  );
}
