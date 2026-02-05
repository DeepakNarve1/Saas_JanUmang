"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateMandirSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_mandir_samiti"]}>
      <GenericSamitiForm title="Mandir Samiti" apiEndpoint="mandir-samiti" />
    </RouteGuard>
  );
}
