"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";

import ModuleGuard from "@app/modules/ModuleGuard";
import { MODULE_IDS } from "@app/config/modules";

const MemberList = dynamic(() => import("@app/views/memberList"), {
  ssr: false,
  loading: () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[401px] w-full" />
    </div>
  ),
});

export default function MemberListPage() {
  return (
    <ModuleGuard moduleId={MODULE_IDS.MEMBERS}>
      <MemberList />
    </ModuleGuard>
  );
}
