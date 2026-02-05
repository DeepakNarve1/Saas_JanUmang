"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditBoothSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_booth_samiti"]}>
      <GenericSamitiForm
        title="Booth Samiti"
        apiEndpoint="booth-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
