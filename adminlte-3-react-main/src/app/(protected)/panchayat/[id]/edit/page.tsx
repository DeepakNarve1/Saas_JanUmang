"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditPanchayat from "@app/views/Panchayat/EditPanchayat";

const EditPanchayatPage = () => {
  return (
    <RouteGuard requiredPermission="edit_panchayat">
      <EditPanchayat />
    </RouteGuard>
  );
};

export default EditPanchayatPage;
