"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditNirmanSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_nirman_samiti"]}>
      <GenericSamitiForm
        title="Nirman Samiti"
        apiEndpoint="nirman-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
