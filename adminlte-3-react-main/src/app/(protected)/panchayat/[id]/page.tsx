"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewPanchayat from "@app/views/Panchayat/ViewPanchayat";

const ViewPanchayatPage = () => {
  return (
    <RouteGuard requiredPermission="view_panchayat">
      <ViewPanchayat />
    </RouteGuard>
  );
};

export default ViewPanchayatPage;
