"use client";

import { useParams } from "next/navigation";
import BhagoriaSamitiForm from "@app/views/vidhasabhaSamiti/forms/BhagoriaSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditBhagoriaSamiti() {
  const { id } = useParams();

  return (
    <RouteGuard requiredPermissions={["edit_bhagoria_samiti"]}>
      <BhagoriaSamitiForm isEdit id={id as string} />
    </RouteGuard>
  );
}
