"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";

const BlockSamiti = dynamic(
  () => import("@app/views/vidhasabhaSamiti/BlockSamiti"),
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

export default function BlockSamitiPage() {
  return <BlockSamiti />;
}
