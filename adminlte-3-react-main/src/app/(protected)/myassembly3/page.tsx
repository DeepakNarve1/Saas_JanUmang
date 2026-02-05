"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";

const AssemblyIssueList = dynamic(() => import("@app/views/assemblyIssue"), {
  ssr: false,
  loading: () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[401px] w-full" />
    </div>
  ),
});

export default function MyAssembly3Page() {
  return (
    <AssemblyIssueList
      issueType="myassembly3"
      title="Myassembly3 List"
      basePath="/myassembly3"
    />
  );
}
