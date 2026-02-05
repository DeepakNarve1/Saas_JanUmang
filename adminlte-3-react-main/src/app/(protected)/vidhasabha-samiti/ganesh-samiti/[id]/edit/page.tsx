"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditGaneshSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_ganesh_samiti"]}>
      <GenericSamitiForm
        title="Ganesh Samiti"
        apiEndpoint="ganesh-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
