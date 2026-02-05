"use client";

import BhagoriaSamitiForm from "@app/views/vidhasabhaSamiti/forms/BhagoriaSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateBhagoriaSamiti() {
  return (
    <RouteGuard requiredPermissions={["create_bhagoria_samiti"]}>
      <BhagoriaSamitiForm />
    </RouteGuard>
  );
}
