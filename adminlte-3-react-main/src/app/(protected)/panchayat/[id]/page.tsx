"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewPanchayat from "@app/views/Panchayat/ViewPanchayat";

const ViewPanchayatPage = () => {
  return (
    <RouteGuard requiredPermission="view_panchayats">
      <ViewPanchayat />
    </RouteGuard>
  );
};

export default ViewPanchayatPage;
