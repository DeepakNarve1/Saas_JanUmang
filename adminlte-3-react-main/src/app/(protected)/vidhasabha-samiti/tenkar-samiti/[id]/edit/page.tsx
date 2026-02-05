"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditTenkarSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_tenkar_samiti"]}>
      <GenericSamitiForm
        title="Tenkar Samiti"
        apiEndpoint="tenkar-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
