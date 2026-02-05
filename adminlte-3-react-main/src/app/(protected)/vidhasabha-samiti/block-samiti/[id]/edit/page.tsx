"use client";

import { useParams } from "next/navigation";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditBlockSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_block_samiti"]}>
      <GenericSamitiForm
        title="Block Samiti"
        apiEndpoint="block-samiti"
        isEdit
        id={id as string}
      />
    </RouteGuard>
  );
}
