"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewPanchayat from "@app/views/Panchayat/ViewPanchayat";

const ViewPanchayatPage = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_PANCHAYATS]}>
      <ViewPanchayat />
    </RouteGuard>
  );
};

export default ViewPanchayatPage;
