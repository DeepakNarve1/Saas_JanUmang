"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditDpSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_dp_samiti"]}>
      <GenericSamitiForm
        title="DP Samiti"
        apiEndpoint="dp-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
