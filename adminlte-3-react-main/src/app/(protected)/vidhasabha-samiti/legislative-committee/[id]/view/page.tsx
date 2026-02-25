"use client";

import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/GenericSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";
import { useParams } from "next/navigation";

export default function ViewLegislativeCommittee() {
  const params = useParams();
  const id = params.id as string;

  return (
    <RouteGuard requiredPermissions={["view_vidhan_sabha_samiti"]}>
      <GenericSamitiForm
        title="Legislative Committee"
        apiEndpoint="legislative-committee"
        id={id}
        isReadOnly={true}
      />
    </RouteGuard>
  );
}
