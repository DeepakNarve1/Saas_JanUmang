"use client";

import TenantForm from "@app/views/tenants/TenantForm";
import { resolveParams, PageProps } from "@app/utils/params";

export default function EditTenantPage({ params }: PageProps) {
  const { id } = resolveParams(params);
  return <TenantForm tenantId={id} />;
}
