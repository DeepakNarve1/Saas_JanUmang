"use client";

import PlanFormView from "@app/views/plans/PlanFormView";
import { useParams } from "next/navigation";

export default function EditPlanPage() {
  const params = useParams();
  const id = params.id as string;

  return <PlanFormView id={id} />;
}
