"use client";

import TenantView from "@app/views/tenants/TenantView";
import { resolveParams, PageProps } from "@app/utils/params";

export default function ViewTenantPage({ params }: PageProps) {
  const { id } = resolveParams(params);
  return <TenantView tenantId={id} />;
}
