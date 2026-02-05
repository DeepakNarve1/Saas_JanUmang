"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";

const NirmanSamiti = dynamic(
  () => import("@app/views/vidhasabhaSamiti/NirmanSamiti"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[401px] w-full" />
      </div>
    ),
  }
);

export default function NirmanSamitiPage() {
  return <NirmanSamiti />;
}
