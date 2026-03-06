"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditPanchayat from "@app/views/Panchayat/EditPanchayat";

const EditPanchayatPage = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_PANCHAYATS]}>
      <EditPanchayat />
    </RouteGuard>
  );
};

export default EditPanchayatPage;
