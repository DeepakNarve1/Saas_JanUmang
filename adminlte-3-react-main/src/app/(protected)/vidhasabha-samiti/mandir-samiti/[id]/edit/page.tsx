"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditMandirSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_mandir_samiti"]}>
      <GenericSamitiForm
        title="Mandir Samiti"
        apiEndpoint="mandir-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
