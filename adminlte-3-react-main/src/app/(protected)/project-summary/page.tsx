"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";

import ModuleGuard from "@app/modules/ModuleGuard";
import { MODULE_IDS } from "@app/config/modules";

const ProjectSummary = dynamic(
  () => import("@app/views/projectSummary/index"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[401px] w-full" />
      </div>
    ),
  },
);

export default function ProjectSummaryPage() {
  return (
    <ModuleGuard moduleId={MODULE_IDS.PROJECTS}>
      <ProjectSummary />
    </ModuleGuard>
  );
}
