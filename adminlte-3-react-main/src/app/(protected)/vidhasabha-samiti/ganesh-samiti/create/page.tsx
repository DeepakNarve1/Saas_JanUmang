"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateGaneshSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_ganesh_samiti"]}>
      <GenericSamitiForm title="Ganesh Samiti" apiEndpoint="ganesh-samiti" />
    </RouteGuard>
  );
}
