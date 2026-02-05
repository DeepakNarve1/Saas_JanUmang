"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateNirmanSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_nirman_samiti"]}>
      <GenericSamitiForm title="Nirman Samiti" apiEndpoint="nirman-samiti" />
    </RouteGuard>
  );
}
